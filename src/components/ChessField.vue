<template>
    <div class="field" v-on:click="select" v-bind:class="getFigureCssClasses()"></div>
</template>

<script>
import { selectedRef } from '../firebase';
import { tableRef } from '../firebase';
import { deletedWhitesRef } from '../firebase';
import { deletedBlacksRef } from '../firebase';
import mixin from '../mixins';
import chess from '../chess';
import _ from 'lodash';

export default {
    props: ['figure', 'row', 'index'],
    data() {
        return {
            available: false,
            attacked: false
        }
    },
    mixins: [mixin],
    methods: {
        updateSelectedRef(row, index, figure) {
            selectedRef.update({
                row: { value: row },
                index: { value: index },
                figure: { value: figure }
            });
        },
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
        // TODO: investigate whether this can be done in a better way (vuefire's asObject property)
        getSelectedAsObject() {
            var selectedObj = {};
            for (let item of this.selected) {
                for (let prop of ['row', 'index', 'figure']) {
                    if (item['.key'] == prop) {
                        selectedObj[prop] = item.value;
                    }
                }
            }
            return selectedObj;
        },
        select() {
            var selectedObj = this.getSelectedAsObject(),
                currentField = {
                    row: parseInt(this.row, 10),
                    index: this.index,
                    figure: this.figure
                };

            if (selectedObj.figure != 'X') {
                if (this.available) {
                    // move figure
                    this.updateTable(selectedObj, currentField).then(() =>  {
                        // delete a figure
                        if (currentField.figure != 'X') {
                            if (chess.getFigureColor(currentField.figure) == 'black') {
                                deletedBlacksRef.push(currentField.figure);
                            } else {
                                deletedWhitesRef.push(currentField.figure);
                            }
                        }
                        // trigger figure selection if needed
                        if ((selectedObj.figure == 'P' && currentField.row == 1) || 
                            (selectedObj.figure == 'p' && currentField.row == 8)) {
                            
                            this.$root.$emit('figureSelection', chess.getFigureColor(selectedObj.figure), currentField.row, currentField.index);
                        } 
                    });
                }
                // clear selection
                this.updateSelectedRef(0, 0, 'X');
                this.$root.$emit('newAvailableFields', []);
            } else if (this.figure != 'X') {
                // do selection
                this.updateSelectedRef(parseInt(this.row, 10), this.index, this.figure);
                this.availableFields = chess.getAvailableFields(
                    currentField,
                    this.table.map((row) => row['.value'])
                );
                this.$root.$emit('newAvailableFields', this.availableFields);
            }
        },
        isSelected(selected) {
            var selectedObj = this.getSelectedAsObject();
            return selectedObj.row == this.row && selectedObj.index == this.index;
        },
        getFigureCssClasses() {
            return { 
                ...this.getFigureCss(this.figure), 
                selected: this.isSelected(this.selected),
                available: this.available,
                attacked: this.attacked
            };
        }
    },
    firebase: {
        selected: {
            source: selectedRef /*,
            asObject: true */
        },
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