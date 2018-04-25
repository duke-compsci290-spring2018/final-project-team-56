<template>
    <div id="app">
        <header>
          <h1>Data Visualization in the Political Sphere</h1>
          <h3>Team 56: Harry Wang and Zuzu Tang</h3>
        </header>
        <button v-on:click="load" type="button" class="btn btn-primary">Load Data</button>
    </div>
</template>

<script>
import * as d3 from 'd3'

var firebase = require('firebase');
var firebaseui = require('firebaseui');

var config = {
    apiKey: "AIzaSyBGUi_589649cXRqDWCE5tIbwyN7iOYCXI",
    authDomain: "final-project-56.firebaseapp.com",
    databaseURL: "https://final-project-56.firebaseio.com",
    projectId: "final-project-56",
    storageBucket: "final-project-56.appspot.com",
    messagingSenderId: "919617906676"
  };
firebase.initializeApp(config);

export default {
    name: 'App',
    data() {
        return {
            legs: []
        }
    },
    components: {

    },
    methods: {
        load() {
          this.legs = [];
          var vm = this;
          d3.csv("https://raw.githubusercontent.com/duke-compsci290-spring2018/final-project-team-56/zuzu/finalApp/data/legislators-current.csv", function(data) {
            vm.legs.push(data);
          });
        }
    }
}
</script>

<style>
header{
  padding-top: 12.5%;
  padding-bottom: 12.5%;
  background-color: #a4fcc8;
  margin-bottom: 5%;
}
header h1{
  padding-bottom: 3%;
  letter-spacing: 3px;
}
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
</style>
