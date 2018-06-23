<template>
    <div class="chess-table clearfix">
        <template v-for="row in table">
            <chess-field v-for="(cell, index) in row['.value']" v-bind:key="index + row['.key']" 
                v-bind:figure="cell" v-bind:index="index + 1" v-bind:row="row['.key']" v-bind:getFigureCss="getFigureCss" 
                v-on:figureSelection="showFigureSelector"/>
        </template>
        
        <b-modal ref="figureSelector" title="Select a figure" hide-footer no-close-on-esc no-close-on-backdrop hide-header-close>
            <div class="figures">
                <div class="figure fb"></div>
                <div class="figure fh"></div>
                <div class="figure ff"></div>
                <div class="figure fv"></div>
            </div>
        </b-modal> 
    </div>
</template>

<script>
import { tableRef } from '../firebase';
import { selectedRef } from '../firebase';
import { deletedWhitesRef } from '../firebase';
import { deletedBlacksRef } from '../firebase';
import mixin from '../mixins';

export default {
    mixins: [mixin],
    methods: {
        clearSelected() {
            selectedRef.update({
                row: { value: 0 },
                index: { value: 0 },
                figure: { value: 'X' }
            });
        },
        newGame() {
            tableRef.update({
                1: 'bhfvkfhb',
                2: 'pppppppp',
                3: 'XXXXXXXX',
                4: 'XXXXXXXX',
                5: 'XXXXXXXX',
                6: 'XXXXXXXX',
                7: 'PPPPPPPP',
                8: 'BHFVKFHB'
            });
            
            this.clearSelected();

            deletedBlacksRef.set({});
            deletedWhitesRef.set({});
        },
        showFigureSelector(color, row, index) {
            this.$refs.figureSelector.show();
        }
    },      
    firebase: {
        table: tableRef
    },
    created() {
        this.clearSelected();
        this.$parent.$on('newGame', this.newGame);
    }
}
</script>

<style lang="scss" scoped>
.chess-table {
    border: 1vw solid #422;

    .field {
        background-position: center;
        background-repeat: no-repeat;
        background-size: 80% 80%;

        float: left;
        width: 12.5%;

        &:before {
            content: '';
            display: block;
            padding: 50% 0;
        }
      
        &.selected {
            background-color: #755 !important;
        }

        @for $i from 0 through 7 {
            $evenOrOdd: if($i % 2 == 0, even, odd);
            &:nth-child(n+#{$i * 8 + 1}):nth-child(#{$evenOrOdd}):nth-child(-n+#{($i + 1) * 8}) {
                background-color: #999;    
            }
        }
    }

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
}
</style>