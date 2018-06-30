<template>
    <div class="chess-table clearfix">
        <template v-for="row in table">
            <chess-field v-for="(cell, index) in row['.value']" v-bind:key="index + row['.key']" 
                v-bind:figure="cell" v-bind:index="index + 1" v-bind:row="row['.key']" v-bind:getFigureCss="getFigureCss" />
        </template>
        
        <figure-selector></figure-selector>
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
            
            this.$root.$emit('newAvailableFields', []);
        }
    },      
    firebase: {
        table: tableRef
    },
    created() {
        this.clearSelected();
        this.$root.$on('newGame', this.newGame);
    }
}
</script>

<style lang="scss" scoped>
@import '../../node_modules/bootstrap/scss/bootstrap.scss';
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

        &.available {
            border: 2px dotted #050;
        }
        &.attacked {
            border-color: #A00 !important;
        }
        @for $i from 0 through 7 {
            $evenOrOdd: if($i % 2 == 0, even, odd);
            &:nth-child(n+#{$i * 8 + 1}):nth-child(#{$evenOrOdd}):nth-child(-n+#{($i + 1) * 8}) {
                background-color: #999;    
            }
        }

        @include media-breakpoint-up(lg) {
            &.available {
                border: 4px dotted #050;
            }
        }
    }
}
</style>