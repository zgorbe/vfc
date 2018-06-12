<template>
    <div class="field" v-on:click="select" 
        v-bind:class="getFigureCssClasses()">
    </div>
</template>

<script>
import { selectedRef } from '../firebase';
import { tableRef } from '../firebase';
import { deletedWhitesRef } from '../firebase';
import { deletedBlacksRef } from '../firebase';

export default {
    props: ['figure', 'row', 'index', 'getFigureCss'],
    methods: {
        updateSelectedRef(row, index, figure) {
            selectedRef.update({
                row: { value: row },
                index: { value: index },
                figure: { value: figure }
            });
        },
        updateTable(field, figure) {
            return tableRef.child(field.row).once('value').then((data) => {
                var resultRow = this.stringReplaceAt(data.val(), figure, field.index - 1);
                
                return tableRef.child(field.row).set(resultRow);
            });
        },
        getFigureColor(figure) {
            return figure.toUpperCase() == 'X' ? '' : figure.toUpperCase() == figure ? 'white' : 'black';
        },
        isValidMove(selectedObj) {
            var isDifferentFieldSelected = selectedObj.row != this.row || selectedObj.index != this.index,
                isDifferentColorSelected = this.getFigureColor(selectedObj.figure) != this.getFigureColor(this.figure);
            
            return isDifferentFieldSelected && isDifferentColorSelected;
        },
        select() {
            var selectedObj = {};
            for (let item of this.selected) {
                for (let prop of ['row', 'index', 'figure']) {
                    if (item['.key'] == prop) {
                        selectedObj[prop] = item.value;
                    }
                }
            }

            if (selectedObj.figure != 'X') {
                if (this.isValidMove(selectedObj)) {
                    // move figure
                    this.updateTable(selectedObj, 'X').then(() =>  { 
                        this.updateTable({
                            row: this.row,
                            index: this.index,
                            figure: this.figure
                        }, selectedObj.figure);
                    });
                    // delete a figure
                    if (this.figure != 'X') {
                        if (this.figure.toUpperCase() != this.figure) {
                            deletedBlacksRef.push(this.figure);
                        } else {
                            deletedWhitesRef.push(this.figure);
                        }
                    }
                }
                // clear selection
                this.updateSelectedRef(0, 0, 'X');
            } else if (this.figure != 'X') {
                // do selection
                this.updateSelectedRef(parseInt(this.row, 10), this.index, this.figure);
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
                selected: this.isSelected(this.selected)
            };
        }
    },
    firebase: {
        selected: selectedRef,
        table: tableRef
    }
}
</script>

<style lang="scss">
$image-list: 'fb', 'fh', 'ff', 'fk', 'fv', 'fp', 'vb', 'vh', 'vf', 'vk', 'vv', 'vp';
@each $image in $image-list {
    .#{$image} {
        background-image: url(../assets/#{$image}.svg);
        cursor: pointer;
    }
}
</style>