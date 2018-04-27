<template>
  <div id="app">
    <header>
      <h1>Data Visualization in the Political Sphere</h1>
      <h3>Team 56: Harry Wang and Zuzu Tang</h3>
      <div v-if="!signedIn">
        <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal">Login</button>

        <!-- Modal -->
        <div class="modal fade" id="myModal" role="dialog">
          <div class="modal-dialog">

            <!-- Modal content-->
            <div class="modal-content">
              <div class="modal-header">
                <h4 class="modal-title">Login</h4>
              </div>
              <div class="modal-body">
                <div id="form">
                  <label for="email">Email</label>
                  <input id="email" class="input" type="text" v-model="email">
                  <label for="password">Password</label>
                  <input id="password" class="input" type="password" v-model="password">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default closer" data-dismiss="modal">Close</button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div v-else>
        <button v-on:click="load" class="btn btn-primary">Load Data</button>
        <button v-on:click="getLocation" class="btn btn-primary">Get Location</button>
        <!-- <wheel></wheel> -->
      </div>
    </header>
  </div>
</template>

<script>
import * as d3 from 'd3'
import request from 'request';
// import wheel from './components/wheel'

var firebase = require('firebase');

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
      legs: [],
      email: '',
      password: '',
      signedIn: false,
      email: '',
      password: ''
    }
  },
  mounted: function () {
    //get rid of signin ui it's pretty useless :(

  },
  components: {
    // wheel
  },
  methods: {
    load() {
      var cols = [];
      var categorical = [];
      var numerical = [];
      var vm = this;
      d3.csv("https://raw.githubusercontent.com/duke-compsci290-spring2018/final-project-team-56/zuzu/finalApp/data/legislators-current.csv", function(data) {
        vm.legs.push(data);
      });
      var entries = d3.entries(vm.legs[0]);       // considering first entry only for column names
      for (var k = 0; k < entries.length; k++) {
        cols.push(entries[k].key); // column name
        // how to interpret birthdays -- specific to legs
        if (entries[k].key == "birthday") {
          var birthday = Date.parse(entries[k].value);
          var age = this.calculateAge(birthday);
          entries[k].value = age;
        }
        if (isNaN(entries[k].value)) {  // string --> categorical
          categorical.push(entries[k]);
        } else {
          numerical.push(entries[k]);
        }
      }
      /*
      for (var i = 0; i < categorical.length; i++) {
      console.log("categorical var: " + categorical[i].key);
    }
    for (var i = 0; i < numerical.length; i++) {
    console.log("numerical var: " + numerical[i].key);
  }*/
  for (var i = 0; i < this.legs.length; i++) {
    this.legs[i].age = this.calculateAge(Date.parse(this.legs[i].birthday));
    //console.log(this.calculateAge(Date.parse(this.legs[i].birthday)));
  }
  // TODO: missing data -> ignore column
},
getLocation() {
  request("https://ipinfo.io", function(error, response, body) {
    console.log(JSON.stringify(response, null, 4));
    // console.log(JSON.parse(body));
    // console.log("city " + response.city);
    // console.log("state " + response.region)
  }, "jsonp");
},
calculateAge(birthday) { // birthday is a date
  var ageDifMs = Date.now() - birthday;
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
}
}
</script>

<style>
@import url(http://fonts.googleapis.com/css?family=Roboto);
#form{
  display: table-cell;
  vertical-align: middle;
}
header{
  padding-top: 12.5%;
  padding-bottom: 12.5%;
  background-color: #a4fcc8;
  height: 100vh;
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
.input{
  border: 1px solid #d9d9d9;
  border-top: 1px solid #c0c0c0;
}
body{
  margin: 0;
}
.modal-header{
  justify-content: start;
}
.modal-footer{
  justify-content: start;
}

</style>
