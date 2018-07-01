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
        updateTable(field, figure) {
            var actualRow = this.table[field.row - 1]['.value'],
                resultRow = this.stringReplaceAt(actualRow, figure, field.index - 1);
                
            return tableRef.child(field.row).set(resultRow);
        },
        getFigureColor(figure) {
            return figure.toUpperCase() == 'X' ? '' : figure.toUpperCase() == figure ? 'white' : 'black';
        },
        isValidMove(selectedObj) {
            var isDifferentFieldSelected = selectedObj.row != this.row || selectedObj.index != this.index,
                isDifferentColorSelected = this.getFigureColor(selectedObj.figure) != this.getFigureColor(this.figure);
            
            return isDifferentFieldSelected && isDifferentColorSelected;
        },
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
                if (this.available || 'P'.indexOf(selectedObj.figure.toUpperCase()) > -1) {
                    // move figure
                    this.updateTable(selectedObj, 'X').then(() =>  {
                        var currentFigure = currentField.figure; 
                        this.updateTable(currentField, selectedObj.figure).then(() => {
                            // delete a figure
                            if (currentFigure != 'X' || 'P'.indexOf(selectedObj.figure.toUpperCase()) > -1) {
                                if (currentFigure.toUpperCase() != currentFigure) {
                                    deletedBlacksRef.push(currentFigure);
                                } else {
                                    deletedWhitesRef.push(currentFigure);
                                }
                            }
                            // trigger figure selection if needed
                            if ((selectedObj.figure == 'P' && currentField.row == 1) || 
                                (selectedObj.figure == 'p' && currentField.row == 8)) {
                                
                                this.$root.$emit('figureSelection', this.getFigureColor(selectedObj.figure), currentField.row, currentField.index);
                            } 
                        });
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
            if (selected && selected.length) {
                var rowMatch = false,
                    indexMatch = false;

                for (let item of selected) {
                    rowMatch = rowMatch || (item['.key'] == 'row' && item.value == this.row);
                    indexMatch = indexMatch || (item['.key'] == 'index' && item.value == this.index);
                }
                return rowMatch && indexMatch;
            }

            return false;
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
        selected: selectedRef,
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