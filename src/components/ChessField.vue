<template>
    <div class="figure" v-on:click="select" 
        v-bind:class="{ 'selected' : isSelected(selected), 
            'vb': figure == 'B', 'vh': figure == 'H', 'vf': figure == 'F', 'vk': figure == 'K', 'vv': figure == 'V', 'vp': figure == 'P',
            'fb': figure == 'b', 'fh': figure == 'h', 'ff': figure == 'f', 'fk': figure == 'k', 'fv': figure == 'v', 'fp': figure == 'p'
        }">
        
    </div>
</template>

<script>
import { selectedRef } from '../firebase';
import { tableRef } from '../firebase';
import { deletedWhitesRef } from '../firebase';
import { deletedBlacksRef } from '../firebase';

export default {
    props: ['figure', 'row', 'index'],
    methods: {
        updateSelectedRef(row, index, figure) {
            selectedRef.update({
                row: { value: row },
                index: { value: index },
                figure: { value: figure }
            });
        },
        updateTable: function(field, figure) {
            var self = this;
            return tableRef.child(field.row).once('value').then(function(data) {
                var row = data.val(),
                    resultRow = self.stringReplaceAt(row, figure, field.index - 1);
                
                return tableRef.child(field.row).set(resultRow);
            });
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
                if (selectedObj.row != this.row || selectedObj.index != this.index) {
                    // move figure
                    this.updateTable(selectedObj, 'X')
                        .then(this.updateTable.bind(this, { 
                                row: this.row,
                                index: this.index,
                                figure: this.figure
                            }, selectedObj.figure));
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
        }
    },
    firebase: {
        selected: selectedRef,
        table: tableRef
    }
}
</script>

<style lang="scss">

.figure {
    background-size: cover;
    height: 60px;
    width: 60px;
    &.selected {
        background-color: rgb(240, 78, 78);
    }
}

.fb {
    background-image: url(../assets/br.svg);
}
.fh {
    background-image: url(../assets/bn.svg);
}
.ff {
    background-image: url(../assets/bb.svg);
}
.fk {
    background-image: url(../assets/bk.svg);
}
.fv {
    background-image: url(../assets/bq.svg);
}
.fp {
    background-image: url(../assets/bp.svg);
}

.vb {
    background-image: url(../assets/wr.svg);
}
.vh {
    background-image: url(../assets/wn.svg);
}
.vf {
    background-image: url(../assets/wb.svg);
}
.vk {
    background-image: url(../assets/wk.svg);
}
.vv {
    background-image: url(../assets/wq.svg);
}
.vp {
    background-image: url(../assets/wp.svg);
}
</style>