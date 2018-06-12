// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import ChessTable from './components/ChessTable.vue';
import ChessField from './components/ChessField.vue';

import './firebase';
import VueFire from 'vuefire';

Vue.config.productionTip = false;

Vue.use(VueFire);

Vue.component('chess-table', ChessTable);
Vue.component('chess-field', ChessField);

Vue.mixin({
  methods: {
    stringReplaceAt: (str, repl, index) => str.substr(0, index) + repl + str.substr(index + repl.length)
  }  
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
});
