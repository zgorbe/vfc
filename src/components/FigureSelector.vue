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
            var figure = this.color == 'v' ? fig.toUpperCase() : fig.toLowerCase();

            tableRef.child(this.row).once('value').then((data) => {
                var resultRow = this.stringReplaceAt(data.val(), figure, this.index - 1);
                
                tableRef.child(this.row).set(resultRow);
            }).then(this.$refs.figureSelector.hide);
        },
        showFigureSelector(color, row, index) {
            this.color = color == 'white' ? 'v' : 'f';
            this.row = row;
            this.index = index;
            this.figures = ['b', 'h', 'f', 'v'];

            this.$refs.figureSelector.show();
        }
    },
    created() {
        this.$parent.$on('figureSelection', this.showFigureSelector);
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

