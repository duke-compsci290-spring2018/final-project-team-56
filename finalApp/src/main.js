// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps';
import App from './App'
require('bootstrap')
import 'bootstrap/dist/css/bootstrap.css'
var $ = require('jquery')
window.$ = $;
Vue.config.productionTip = false

Vue.use(VueGoogleMaps, {
    load: {
        key: 'AIzaSyCotQCA476JOVJ87et877SGKGFI3C840Ac',
    }
})

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
