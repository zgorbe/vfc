<template>
  <div id="app">
    <div v-if="loading" class="loading">
    </div>
    <div v-else class="container">
      <div class="row">
        <deleted-figures v-bind:team="'whites'"></deleted-figures>
        <div class="col-8">
          <chess-table></chess-table>
        </div>
        <deleted-figures v-bind:team="'blacks'"></deleted-figures>
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

export default {
  name: 'App',
  data() {
    return  {
      loading: true
    }
  },
  methods: {
    newGame() {
      this.$emit('newGame');
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
#app {
  margin-top: 20px;

  .buttons {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .loading {
    background: url('./assets/loading_spinner.gif') center no-repeat;
    height: 30vw;
    width: 100vw;
  } 
}
</style>