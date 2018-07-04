<template>
    <div class="chess-table clearfix">
        <template v-for="row in table">
            <chess-field v-for="(cell, index) in row['.value']" v-bind:key="index + row['.key']" 
                v-bind:figure="cell" v-bind:index="index + 1" v-bind:row="row['.key']" 
                v-bind:getSelectedField="getSelectedField" v-on:selectField="setSelectedField" />
        </template>
    </div>
</template>

<script>
import { tableRef } from '../firebase';
import { deletedWhitesRef } from '../firebase';
import { deletedBlacksRef } from '../firebase';
import { whoIsNextRef } from '../firebase';

import mixin from '../mixins';

export default {
    mixins: [mixin],
    data() {
        return {
            selectedField: {
                row: 0, 
                index: 0, 
                figure: 'X'
            }
        }
    },
    methods: {
        clearSelectedField() {
            this.selectedField.row = 0;
            this.selectedField.index = 0;
            this.selectedField.figure = 'X';
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
            
            this.clearSelectedField();

            deletedBlacksRef.set({});
            deletedWhitesRef.set({});
            
            whoIsNextRef.set('white');
            
            this.$root.$emit('newAvailableFields', []);
        },
        getSelectedField() {
            return this.selectedField;
        },
        setSelectedField(row, index, figure) {
            this.selectedField.row = row;
            this.selectedField.index = index;
            this.selectedField.figure = figure;
        }
    },      
    firebase: {
        table: tableRef
    },
    created() {
        this.$root.$on('newGame', this.newGame);
        this.clearSelectedField();
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
        position: relative;
        width: 12.5%;

        &:before {
            content: '';
            display: block;
            padding: 50% 0;
        }

        &.selected {
            background-color: #755 !important;
        }

        &.available, &.attacked {
            cursor: pointer;
        }

        &.available:after {
            background-color: #050;
            bottom: 0;
            content: '';
            left: 0;
            opacity: .4;
            position: absolute;
            right: 0;
            top: 0;
        }
        &.attacked:after {
            background-color: #A00;
        }
        @for $i from 0 through 7 {
            $evenOrOdd: if($i % 2 == 0, even, odd);
            &:nth-child(n+#{$i * 8 + 1}):nth-child(#{$evenOrOdd}):nth-child(-n+#{($i + 1) * 8}) {
                background-color: #999;    
            }
        }
    }
}
</style>