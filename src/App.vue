<template>
  <div id="app" class="container">
    <div class="row">
      <table class="chess-table col-8">
        <tr v-for="row in table" v-bind:key="row['.key']">
          <td v-for="(cell, index) in row['.value']" v-bind:key="index">
            <chess-field v-bind:figure="cell" v-bind:index="index + 1" v-bind:row="row['.key']" />
          </td>
        </tr>
      </table>
      <div class="rightPanel col-4">
        <div class="figure" v-for="figure in deletedWhites" v-bind:key="figure['.key']" v-bind:class="getDeletedFigureCss(figure['.value'])"></div>
        <br>
        <div class="figure" v-for="figure in deletedBlacks" v-bind:key="figure['.key']" v-bind:class="getDeletedFigureCss(figure['.value'])"></div>
      </div>
      <div class="buttons">
        <button v-on:click="newGame">New Game</button>
      </div>
    </div>
  </div>
</template>

<script>
import { tableRef } from './firebase';
import { selectedRef } from './firebase';
import { deletedWhitesRef } from './firebase';
import { deletedBlacksRef } from './firebase';

export default {
  name: 'App',
  methods: {
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
      selectedRef.update({
        row: { value: 0 },
        index: { value: 0 },
        figure: { value: 'X' }
      });
      deletedBlacksRef.set({});
      deletedWhitesRef.set({});
    },
    getDeletedFigureCss(figure) {
      return {
        'vb': figure == 'B',
        'vh': figure == 'H',
        'vf': figure == 'F',
        'vv': figure == 'V',
        'vk': figure == 'K',
        'vp': figure == 'P',
        'fb': figure == 'b',
        'fh': figure == 'h',
        'ff': figure == 'f',
        'fv': figure == 'v',
        'fk': figure == 'k',
        'fp': figure == 'p'
      }
    }
  },
  firebase: {
    table: tableRef,
    selected: selectedRef,
    deletedWhites: deletedWhitesRef,
    deletedBlacks: deletedBlacksRef
  },
  created: function () {
    selectedRef.update({
      row: { value: 0 },
      index: { value: 0 },
      figure: { value: 'X' }
    });
  }
}
</script>

<style lang="scss">
#app {
  .buttons {
    margin-top: 20px;
  }

  .chess-table {
    border: 1px solid black;
    border-collapse: collapse;

    td {
      cursor: pointer;
      padding: 0;
      position: relative;
      text-align: center;
    }

    tr {
      margin: 0;
      padding: 0;
    }

    tr:nth-child(odd) td:nth-child(even), 
    tr:nth-child(even) td:nth-child(odd) {
      background: #999;
    }
    
  }

  .rightPanel .figure {
    display: inline-block;
  }
}
@import '../node_modules/bootstrap/scss/bootstrap.scss';
</style>
