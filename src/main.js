// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import ChessTable from './components/ChessTable.vue';
import ChessField from './components/ChessField.vue';
import DeletedFigures from './components/DeletedFigures';

import './firebase';
import VueFire from 'vuefire';

Vue.config.productionTip = false;

Vue.use(VueFire);

Vue.component('chess-table', ChessTable);
Vue.component('chess-field', ChessField);
Vue.component('deleted-figures', DeletedFigures);

Vue.mixin({
  methods: {
    stringReplaceAt: (str, repl, index) => str.substr(0, index) + repl + str.substr(index + repl.length),
    getFigureCss: (figure) => {
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
  }  
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
});
