<template>
    <div class="field" v-on:click="select" v-bind:class="getFigureCssClasses()"></div>
</template>

<script>
import { tableRef } from '../firebase';
import { deletedWhitesRef } from '../firebase';
import { deletedBlacksRef } from '../firebase';
import mixin from '../mixins';
import chess from '../chess';
import _ from 'lodash';

export default {
    props: ['figure', 'row', 'index', 'getSelectedField'],
    data() {
        return {
            available: false,
            attacked: false
        }
    },
    mixins: [mixin],
    methods: {
        updateTable(sourceField, targetField) {
            var isUpdateInSameRow = sourceField.row == targetField.row,
                sourceRow = this.table[sourceField.row - 1]['.value'],
                figureToMove = sourceRow.charAt(sourceField.index - 1),
                updatedSourceRow = this.stringReplaceAt(sourceRow, 'X', sourceField.index - 1),
                targetRow = isUpdateInSameRow ? updatedSourceRow : this.table[targetField.row - 1]['.value'],
                updatedTargetRow = this.stringReplaceAt(targetRow, figureToMove, targetField.index - 1);
                
            return Promise.all([
                isUpdateInSameRow ? Promise.resolve() : tableRef.child(sourceField.row).set(updatedSourceRow),
                tableRef.child(targetField.row).set(updatedTargetRow)
            ]);
        },
        select() {
            var selectedField = this.getSelectedField(),
                currentField = {
                    row: parseInt(this.row, 10),
                    index: this.index,
                    figure: this.figure
                };

            if (selectedField.figure != 'X') {
                if (this.available) {
                    var figureToMove = selectedField.figure;
                    // move figure
                    this.updateTable(selectedField, currentField).then(() =>  {
                        // delete a figure
                        if (currentField.figure != 'X') {
                            if (chess.getFigureColor(currentField.figure) == 'black') {
                                deletedBlacksRef.push(currentField.figure);
                            } else {
                                deletedWhitesRef.push(currentField.figure);
                            }
                        }
                        // trigger figure selection if needed
                        if ((figureToMove == 'P' && currentField.row == 1) || 
                            (figureToMove == 'p' && currentField.row == 8)) {
                            
                            this.$root.$emit('figureSelection', chess.getFigureColor(figureToMove), currentField.row, currentField.index);
                        } 
                    });
                }
                // clear selection
                this.$emit('selectField', 0, 0, 'X');
                this.$root.$emit('newAvailableFields', []);
            } else if (this.figure != 'X') {
                // do selection
                this.availableFields = chess.getAvailableFields(
                    currentField,
                    this.table.map((row) => row['.value'])
                );
                if (this.availableFields.length) {
                    this.$emit('selectField', parseInt(this.row, 10), this.index, this.figure);
                } else {
                    this.$emit('selectField', 0, 0, 'X');
                }
                this.$root.$emit('newAvailableFields', this.availableFields);
            }
        },
        isSelected() {
            var selectedField = this.getSelectedField();
            return selectedField.row == this.row && selectedField.index == this.index;
        },
        getFigureCssClasses() {
            return { 
                ...this.getFigureCss(this.figure), 
                selected: this.isSelected(),
                available: this.available,
                attacked: this.attacked
            };
        }
    },
    firebase: {
        table: tableRef
    },
    created() {
        this.$root.$on('newAvailableFields', (availableFields) => {
            var available = false;
            _.each(availableFields, field => {
                if (field.row == this.row && field.index == this.index) {
                    available = true;
                    this.attacked = field.isAttackedField;

                    return false;
                }
            });
            this.available = available;

            if (!this.available) {
                this.attacked = false;
            }
        });
    }
}
</script>