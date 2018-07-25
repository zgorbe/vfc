<template>
    <div class="field" v-on:click="select" v-bind:class="getFigureCssClasses()"></div>
</template>

<script>
import { tableRef } from '../firebase';
import { whoIsNextRef } from '../firebase';
import { castlingRef } from '../firebase';
import { lastMoveRef } from '../firebase';
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
                        promise = chess.handleFigureMove(selectedField, currentField, {
                            table: this.table,
                            whoIsNext: this.whoIsNext, 
                            castling: this.castling,
                            eventBus: this.$root // "event bus"
                        });
                    }
                    // clear selection
                    promise.then(() => {
                        if (!chess.isFigureSelection(selectedField, currentField) &&
                            chess.isKingInCheck(this.whoIsNext['.value'], this.table.map(row => row['.value']))) {
                                this.$root.$emit('check');
                        }
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