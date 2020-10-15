import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes'
import App from './components/App';

global.browser = require('webextension-polyfill');
Vue.prototype.$browser = global.browser;
Vue.use(VueRouter)
const router = new VueRouter({routes})

chrome.storage.sync.get(['projectId', 'taskId', 'task'], r => {
  if(r.taskId) {
    router.push({
      name: `task`,
      params: {
        projectId: r.projectId,
        taskId: r.taskId,
        taskProp: r.task
      }
    })
  } else if (r.projectId) {
    router.push({ path: `/projects/${r.projectId}` })
  } else {
    router.push({ path: `/projects` })
  }
})


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
});
