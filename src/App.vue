<template>
  <div id="app">
    <div v-if="loading" class="loading">
    </div>
    <div v-else class="container">
      <div class="row">
        <div class="figure-container whites col-2">
          <div class="figure" v-for="figure in deletedWhites" v-bind:key="figure['.key']" v-bind:class="getDeletedFigureCss(figure['.value'])"></div>
        </div>
        <div class="col-8">
          <div class="chess-table clearfix">
            <template v-for="row in table">
                <chess-field v-for="(cell, index) in row['.value']" v-bind:key="index + row['.key']" v-bind:figure="cell" v-bind:index="index + 1" v-bind:row="row['.key']" />
            </template>
          </div>
        </div>
        <div class="figure-container blacks col-2">
          <div class="figure" v-for="figure in deletedBlacks" v-bind:key="figure['.key']" v-bind:class="getDeletedFigureCss(figure['.value'])"></div>
        </div>
      </div>
      <div class="row">
        <div class="buttons col-12">
          <button class="btn btn-large btn-secondary" v-on:click="newGame">New Game</button>
        </div>
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
  data() {
    return  {
      loading: true
    }
  },
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
    table: {
      source: tableRef,
      readyCallback() {
        this.loading = false;
      }
    },
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
  margin-top: 20px;

  .buttons {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .chess-table {
    border: 1px solid black;

    .field {
      background-size: cover;
      float: left;
      width: 12.5%;

      &:before {
        content: '';
        display: block;
        padding: 50% 0;
      }
      
      &.selected {
          background-color: rgb(240, 78, 78) !important;
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

  .figure-container {
    display: flex;
    flex-wrap: wrap;

    &.whites {
      align-content: flex-start;
      align-items: flex-start
    }

    &.blacks {
      align-content: flex-end;
      align-items: flex-end;
    }

    .figure {
      background-size: cover;
      height: 50px;
      width: 50px;
    }
  }
  .loading {
    background: url('./assets/loading_spinner.gif') center no-repeat;
    height: 30vw;
    width: 100vw;
  } 
}
@import '../node_modules/bootstrap/scss/bootstrap.scss';
</style>