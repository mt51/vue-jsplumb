// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import { Dialog, Input, Button, Message } from 'element-ui'
import WF from './utils/jsplumb_utils.js'
import 'normalize.css'
import '@/styles/index.pcss'

Vue.config.productionTip = false

Vue.prototype._wf = new WF()
Vue.prototype.$message = Message

Vue.use(Dialog)
Vue.use(Input)
Vue.use(Button)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
