import Vue from 'vue';
import App from '@/App';

describe('App.vue', () => {
    it('should render loading', () => {
        const Constructor = Vue.extend(App);
        const vm = new Constructor().$mount();

        expect(vm.$el.querySelectorAll('.loading').length).to.equal(1);
    });
});