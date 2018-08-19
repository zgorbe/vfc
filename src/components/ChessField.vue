<template>
    <div class="field" v-on:click="select" v-bind:class="getFigureCssClasses()"></div>
</template>

<script>
import { tableRef } from '../firebase';
import { whoIsNextRef } from '../firebase';
import { castlingRef } from '../firebase';
import { lastMoveRef } from '../firebase';
import { deletedWhitesRef } from '../firebase';
import { deletedBlacksRef } from '../firebase';
import mixin from '../mixins';
import chess from '../chess';

export default {
    props: ['figure', 'row', 'index', 'getSelectedField', 'isFigureMoving'],
    data() {
        return {
            available: false,
            attacked: false
        }
    },
    mixins: [mixin],
    methods: {
        select() {
            if (!this.isFigureMoving()) {
                var selectedField = this.getSelectedField(),
                    currentField = {
                        row: parseInt(this.row, 10),
                        index: this.index,
                        figure: this.figure
                    };

                if (selectedField.figure != 'X') {
                    var promise = Promise.resolve();
                    if (this.available) {
                        promise = this.handleFigureMove(selectedField, currentField).then(() => {
                            if (!chess.isFigureSelection(selectedField, currentField)) {
                                let table = this.table.map(row => row['.value']);
                                if (chess.isKingInCheck(this.whoIsNext['.value'], table)) {
                                    this.$root.$emit('check');
                                } else {
                                    if (!chess.isAnyMoveAvailable(this.whoIsNext['.value'], table)) {
                                        this.$root.$emit('draw');
                                    }                                
                                }
                            }
                        });
                    }
                    // clear selection
                    promise.then(() => {
                        this.$emit('selectField', 0, 0, 'X');
                        this.$root.$emit('newAvailableFields', []);
                    });
                } else if (this.figure != 'X' && chess.getFigureColor(this.figure) == this.whoIsNext['.value']) {
                    // do selection
                    var availableFields = [],
                        table = this.table.map(row => row['.value']),
                        isKingSelected = this.figure.toUpperCase() == 'K';

                    availableFields = chess.getAvailableFields(
                        currentField,
                        table,
                        this.lastMove,
                        isKingSelected ? this.castling : undefined
                    );

                    this.availableFields = chess.filterForCheckAfterMove(currentField, availableFields, table);

                    if (this.availableFields.length) {
                        this.$emit('selectField', parseInt(this.row, 10), this.index, this.figure);
                    } else {
                        this.$emit('selectField', 0, 0, 'X');
                    }
                    this.$root.$emit('newAvailableFields', this.availableFields);
                }
            }
        },
        // handling movement of figures, updating the chess table
        handleFigureMove(selectedField, currentField) {
            var isEnPassant = false;

            this.$root.$emit('figureMovingStart');

            // if 'en passant'
            if (selectedField.figure.toUpperCase() == 'P' && Math.abs(selectedField.index - currentField.index) == 1 &&
                currentField.figure == 'X') {
                isEnPassant = true;
                currentField.row = selectedField.row;
                currentField.figure = this.table[currentField.row - 1]['.value'].charAt(currentField.index - 1);
            }

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
                if (chess.isFigureSelection(selectedField, currentField)) {
                    this.$root.$emit('figureSelectionStart', chess.getFigureColor(selectedField.figure), currentField.row, currentField.index);
                }

                var whoWasNext = this.whoIsNext['.value'];
                // king is not moved yet
                if (!this.castling[whoWasNext].isKingMoved) {
                    if (selectedField.figure.toUpperCase() == 'B') { // rook is moved
                        this.collectRookMoves(selectedField, whoWasNext);
                    }
                    if (selectedField.figure.toUpperCase() == 'K') {
                        castlingRef.child(whoWasNext + '/isKingMoved').set(true);
                    }
                }
                return whoIsNextRef.set(whoWasNext == 'white' ? 'black' : 'white');
            }).then(() => {
                !isEnPassant && lastMoveRef.set([selectedField, currentField]);
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
                if (isEnPassant) {
                    var targetField = {
                        row: currentField.row + (chess.getFigureColor(selectedField.figure) == 'black' ? 1 : -1),
                        index: currentField.index
                    }
                    lastMoveRef.set([selectedField, targetField]);
                    return this.updateTable(currentField, targetField);
                }
            }).finally(() => {
                this.$root.$emit('figureMovingEnd');
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

        collectRookMoves(selectedField, color) {
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
        isSelected() {
            var selectedField = this.getSelectedField();
            return selectedField.row == this.row && selectedField.index == this.index;
        },
        isLastMove() {
            return this.lastMove.filter(field => {
                return field.row == this.row && field.index == this.index;
            }).length;
        },
        getFigureCssClasses() {
            return { 
                ...this.getFigureCss(this.figure), 
                selected: this.isSelected(),
                available: this.available,
                attacked: this.attacked,
                last: this.isLastMove()
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
        },
        lastMove: lastMoveRef
    },
    created() {
        this.$root.$on('newAvailableFields', (availableFields) => {
            var available = false;
            for (let field of availableFields) {
                if (field.row == this.row && field.index == this.index) {
                    available = true;
                    this.attacked = field.isAttackedField;

                    break
                }
            }
            this.available = available;

            if (!this.available) {
                this.attacked = false;
            }
        });
    }
}
</script>