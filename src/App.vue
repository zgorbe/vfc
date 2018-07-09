<template>
  <div id="app">
    <div v-if="loading" class="loading">
    </div>
    <div v-else class="container">
      <div class="row" v-bind:class="{ rotated: isTableRotated }">
        <deleted-figures v-bind:color="'whites'"></deleted-figures>
        <div class="col-8">
          <chess-table v-bind:class="{ highlighting }"></chess-table>
        </div>
        <deleted-figures v-bind:color="'blacks'"></deleted-figures>
      </div>
      <div class="row">
        <div class="buttons col-12">
          <b-btn v-b-modal.newGameConfirmation>New Game</b-btn>
          <b-btn v-on:click="rotateTable">Rotate Table</b-btn>
          <b-btn :pressed.sync="highlighting">Toggle Highlighting</b-btn>
        </div>
      </div>
    </div>
    <b-modal id="newGameConfirmation" title="New Game" ok-title="Yes" cancel-title="No" v-on:ok="newGame">
        <p class="text-center">Would you like to start a new game?</p>
    </b-modal>
    <figure-selector></figure-selector> 
  </div>
</template>

<script>
import { tableRef } from './firebase';

export default {
    name: 'App',
    data() {
        return  {
            loading: true,
            isTableRotated: false,
            highlighting: false
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
        text-align: center;
        button {
            margin: 20px 5px 0 5px;
            &.active {
                background-color: #bbb;
            }
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
    .rotated {
        transform: rotate(180deg);
        .field, .modal, .figure-container .figure {
            transform: rotate(180deg);
        }
    }
}
</style>