import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes'
import App from './App';

global.browser = require('webextension-polyfill');
Vue.prototype.$browser = global.browser;
Vue.use(VueRouter)
const router = new VueRouter({routes})
router.replace({ path: "/projects", redirect: "/" })

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
});
