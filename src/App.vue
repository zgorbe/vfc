<template>
  <div id="app">
    <div v-if="loading" class="loading">
    </div>
    <div v-else class="container">
      <div class="row">
        <div class="figure-container whites col-2">
          <div class="figure" v-for="figure in deletedWhites" v-bind:key="figure['.key']" v-bind:class="getFigureCss(figure['.value'])"></div>
        </div>
        <div class="col-8">
          <chess-table v-bind="{getFigureCss}"></chess-table>
        </div>
        <div class="figure-container blacks col-2">
          <div class="figure" v-for="figure in deletedBlacks" v-bind:key="figure['.key']" v-bind:class="getFigureCss(figure['.value'])"></div>
        </div>
      </div>
      <div class="row">
        <div class="buttons col-12">
          <button class="btn btn-secondary" v-on:click="newGame">New Game</button>
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
    getFigureCss(figure) {
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
@import '../node_modules/bootstrap/scss/bootstrap.scss';

#app {
  margin-top: 20px;

  .buttons {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .figure-container {
    $figureSize: 20px;
    
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
      height: $figureSize;
      width: $figureSize;
    }

    @include media-breakpoint-up(md) {
      $figureSize: 40px;
      .figure {
        height: $figureSize;
        width: $figureSize;
      }
    }

    @include media-breakpoint-up(lg) {
      $figureSize: 50px;
      .figure {
        height: $figureSize;
        width: $figureSize;
      }
    }
  }
  .loading {
    background: url('./assets/loading_spinner.gif') center no-repeat;
    height: 30vw;
    width: 100vw;
  } 
}
</style>