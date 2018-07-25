<template>
    <b-modal ref="figureSelector" title="Select a figure" hide-footer no-close-on-esc no-close-on-backdrop hide-header-close>
        <div class="figures">
            <div class="figure" v-for="figure in figures" v-bind:class="{ [color + figure]: true}" 
                v-bind:key="figure" v-on:click="selectFigure(figure)"></div>
        </div>
    </b-modal> 
</template>
<script>
import { tableRef } from '../firebase';
import mixin from '../mixins';
import chess from '../chess';

export default {
    mixins: [mixin],
    data() {
        return {
            color: '',
            row: 0,
            index: 0,
            figures: []
        }
    },
    methods: {
        selectFigure(fig) {
            var figure = this.color == 'v' ? fig.toUpperCase() : fig.toLowerCase(),
                actualRow = this.table[this.row - 1]['.value'],
                resultRow = this.stringReplaceAt(actualRow, figure, this.index - 1);
                
            tableRef.child(this.row)
                .set(resultRow)
                .then(this.$refs.figureSelector.hide)
                .then(() => {
                    if (chess.isKingInCheck(this.color == 'v' ? 'black' : 'white', this.table.map(row => row['.value']))) {
                        this.$root.$emit('check');
                    }
                });
        },
        showFigureSelector(color, row, index) {
            this.color = color == 'white' ? 'v' : 'f';
            this.row = row;
            this.index = index;
            this.figures = ['b', 'h', 'f', 'v'];

            this.$refs.figureSelector.show();
        }
    },
    firebase: {
        table: tableRef
    },
    created() {
        this.$root.$on('figureSelectionStart', this.showFigureSelector);
    }
}
</script>
<style lang="scss" scoped>
.figures {
    display: table;
    margin: 10px 0;
    width: 100%;
    .figure {
        background-size: cover;
        display: table-cell;

        &:before {
            content: '';
            display: block;
            padding: 50% 0;
        }
        &:hover {
            background-color: #755;
        }
    }
}
</style>

