<template>
    <div class="chess-table clearfix">
    <template v-for="row in table">
        <chess-field v-for="(cell, index) in row['.value']" v-bind:key="index + row['.key']" 
            v-bind:figure="cell" v-bind:index="index + 1" v-bind:row="row['.key']" v-bind:getFigureCss="getFigureCss" />
    </template>
    </div>
</template>

<script>
import { tableRef } from '../firebase';
import { selectedRef } from '../firebase';
import { deletedWhitesRef } from '../firebase';
import { deletedBlacksRef } from '../firebase';

export default {
    props: ['getFigureCss'],
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

<style lang="scss">
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
        // TODO: refactor this with using scss
        &:nth-child(n):nth-child(even):nth-child(-n+8),
        &:nth-child(n+9):nth-child(odd):nth-child(-n+16),
        &:nth-child(n+17):nth-child(even):nth-child(-n+24),
        &:nth-child(n+25):nth-child(odd):nth-child(-n+32),
        &:nth-child(n+33):nth-child(even):nth-child(-n+40),
        &:nth-child(n+41):nth-child(odd):nth-child(-n+48),
        &:nth-child(n+49):nth-child(even):nth-child(-n+56),
        &:nth-child(n+57):nth-child(odd):nth-child(-n+64) {
            background-color: #999;
        }
    }
}
</style>