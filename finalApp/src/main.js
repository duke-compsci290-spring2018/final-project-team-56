// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
require('bootstrap')
var vis = require('vis')
import 'bootstrap/dist/css/bootstrap.css'
import 'vis/dist/vis.css'
var $ = require('jquery')
window.$ = $;
Vue.config.productionTip = false

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
