<template>
    <div class="field" v-on:click="select" v-bind:class="getFigureCssClasses()"></div>
</template>

<script>
import { tableRef } from '../firebase';
import { deletedWhitesRef } from '../firebase';
import { deletedBlacksRef } from '../firebase';
import { whoIsNextRef } from '../firebase';
import { castlingRef } from '../firebase';
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
        // TODO: move these functions to chess.js
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
        _collectRookMoves(selectedField, color) {
            if ((color == 'black' && selectedField.row == 1 && (selectedField.index == 1 || selectedField.index == 8)) ||
                (color == 'white' && selectedField.row == 8 && (selectedField.index == 1 || selectedField.index == 8))) {
                var rookMoves = _.toArray(this.castling[color].rookMoves),
                    alreadyAdded = rookMoves.filter(field => {
                        return field.row == selectedField.row && field.index == selectedField.index;
                    }).length;
                if (!alreadyAdded) {
                    castlingRef.child(color + '/rookMoves').push(selectedField);
                }
            }
        },
        _handleFigureMove(selectedField, currentField) {
            // move figure
            return this.updateTable(selectedField, currentField).then(() =>  {
                // delete a figure
                if (currentField.figure != 'X') {
                    if (chess.getFigureColor(currentField.figure) == 'black') {
                        deletedBlacksRef.push(currentField.figure);
                    } else {
                        deletedWhitesRef.push(currentField.figure);
                    }
                }
                // trigger figure selection if needed
                if ((selectedField.figure == 'P' && currentField.row == 1) || 
                    (selectedField.figure == 'p' && currentField.row == 8)) {
                    
                    this.$root.$emit('figureSelection', chess.getFigureColor(selectedField.figure), currentField.row, currentField.index);
                }
                var whoWasNext = this.whoIsNext['.value'];
                // king is not moved yet
                if (!this.castling[whoWasNext].isKingMoved) {
                    if (selectedField.figure.toUpperCase() == 'B') { // rook is moved
                        this._collectRookMoves(selectedField, whoWasNext);
                    }
                    if (selectedField.figure.toUpperCase() == 'K') {
                        castlingRef.child(whoWasNext + '/isKingMoved').set(true);
                    }
                }
                return whoIsNextRef.set(whoWasNext == 'white' ? 'black' : 'white');
            }).then(() => {
                // if castling then move the rook too
                if (selectedField.figure.toUpperCase() == 'K' && Math.abs(selectedField.index - currentField.index) > 1) {
                    var rookSourceField = {
                        row: chess.getFigureColor(selectedField.figure) == 'black' ? 1 : 8,
                        index: currentField.index == 3 ? 1 : 8
                    }
                    var rookTargetField = {
                        row: rookSourceField.row,
                        index: currentField.index == 3 ? 4 : 6
                    }
                    return this.updateTable(rookSourceField, rookTargetField);
                }
            });
        },
        //
        select() {
            var selectedField = this.getSelectedField(),
                currentField = {
                    row: parseInt(this.row, 10),
                    index: this.index,
                    figure: this.figure
                };

            if (selectedField.figure != 'X') {
                var promise = Promise.resolve();
                if (this.available) {
                    promise = this._handleFigureMove(selectedField, currentField);
                }
                // clear selection
                promise.then(() => {
                    this.$emit('selectField', 0, 0, 'X');
                    this.$root.$emit('newAvailableFields', []);
                });
            } else if (this.figure != 'X' && chess.getFigureColor(this.figure) == this.whoIsNext['.value']) {
                // do selection
                this.availableFields = chess.getAvailableFields(
                    currentField,
                    this.table.map(row => row['.value']),
                    this.figure.toUpperCase() == 'K' ? this.castling : undefined
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
        table: tableRef,
        whoIsNext: {
            source: whoIsNextRef,
            asObject: true
        },
        castling: {
            source: castlingRef,
            asObject: true
        }
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