<template>
  <div id="app">
    <div v-if="loading" class="loading">
    </div>
    <div v-else class="container">
      <div class="row">
        <deleted-figures v-bind:color="'whites'"></deleted-figures>
        <div class="col-8">
          <chess-table v-bind:class="{ rotated: isTableRotated }"></chess-table>
        </div>
        <deleted-figures v-bind:color="'blacks'"></deleted-figures>
      </div>
      <div class="row">
        <div class="buttons col-12">
          <b-btn v-b-modal.newGameConfirmation>New Game</b-btn>
          <b-btn v-on:click="rotateTable">Rotate table</b-btn>
        </div>
      </div>
    </div>
    <b-modal id="newGameConfirmation" title="New Game" ok-title="Yes" cancel-title="No" v-on:ok="newGame">
        <p class="text-center">Would you like to start a new game?</p>
    </b-modal>    
  </div>
</template>

<script>
import { tableRef } from './firebase';

export default {
    name: 'App',
    data() {
        return  {
            loading: true,
            isTableRotated: false
        }
    },
    methods: {
        newGame() {
            this.$root.$emit('newGame');
        },
        rotateTable() {
            this.isTableRotated = !this.isTableRotated;
        }
    },
    firebase: {
        table: {
            source: tableRef,
            readyCallback() {
                this.loading = false;
            }
        }
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
        button {
            margin: 0 5px;
        }
    }

    .loading {
        background: url('./assets/loading_spinner.gif') center no-repeat;
        height: 30vw;
        width: 100vw;
    }
  
    $image-list: 'fb', 'fh', 'ff', 'fk', 'fv', 'fp', 'vb', 'vh', 'vf', 'vk', 'vv', 'vp';
    @each $image in $image-list {
        .#{$image} {
            background-image: url(./assets/#{$image}.svg);
            cursor: pointer;
        }
    }
 
}
</style>