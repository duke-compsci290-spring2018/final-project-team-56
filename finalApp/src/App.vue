<template>
  <div id="app">
    <header>
      <h1>Data Visualization in the Political Sphere</h1>
      <h3>Team 56: Harry Wang and Zuzu Tang</h3>
      <div v-if="!signedIn">
        <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal">Login</button>
      </div>
      <div v-else>
        <button v-on:click="load" class="btn btn-primary">Load Data</button>
        <button v-on:click="getLocation" class="btn btn-primary">Get Location</button>
        <button v-on:click="legislatorsGraph" class="btn btn-primary" data-toggle="modal" data-target="#myModal">Network Graph</button>
        <button v-on:click="ispDonations" class="btn btn-primary">ISP Donations</button>
        <!-- <wheel></wheel> -->
      </div>
      <!-- Modal -->
      <div class="modal fade" id="myModal" role="dialog">
        <div class="modal-dialog">
          <!-- Modal content-->
          <div class="modal-content">
            <div class="modal-header">
              <h4 v-if="!signedIn" class="modal-title">Login</h4>
              <h4 v-if="showData" class="modal-title">Network Graph of Congress</h4>
            </div>
            <div class="modal-body">
              <div v-if="!signedIn" id="form">
                <label for="email">Email</label>
                <input id="email" class="input" type="text" v-model="email">
                <label for="password">Password</label>
                <input id="password" class="input" type="password" v-model="password">
              </div>
              <div v-if="signedIn" id="mynetwork" class="network"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default closer" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  </div>
</template>

<script>
import * as d3 from 'd3'
import request from 'request';
import numerical from './components/numerical'
import donations from './components/donations'

var firebase = require('firebase');
var vis = require('vis')

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
      categorical: [],
      numerical: [],
      numSum: [],
      signedIn: true,
      showData: false,
      email: '',
      password: '',
      isp: [],
      nodes: '',
      edges: ''
    }
  },
  components: {
    // wheel
    donations
  },
  mounted: function () {
    var vm = this;
    d3.csv("https://raw.githubusercontent.com/duke-compsci290-spring2018/final-project-team-56/zuzu/finalApp/data/legislators-current.csv", function(data) {
      vm.legs.push(data);
      console.log("done");
    });
    d3.csv("https://raw.githubusercontent.com/duke-compsci290-spring2018/final-project-team-56/master/finalApp/data/congress_isp_donations.csv", function(data){
      vm.isp.push(data);
      console.log("isp");
    });
  },
  methods: {
    load() {
      var vm = this;
      var cols = [];
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
          this.categorical.push(entries[k]);
        } else {
          this.numerical.push(entries[k]);
        }
      }

      for (var i = 0; i < this.categorical.length; i++) {
        console.log("categorical var: " + this.categorical[i].key);
      }
      for (var i = 0; i < this.numerical.length; i++) {
        console.log("numerical var: " + this.numerical[i].key);
      }
      for (var i = 0; i < this.legs.length; i++) {
        this.legs[i].age = this.calculateAge(Date.parse(this.legs[i].birthday));
        //console.log(this.calculateAge(Date.parse(this.legs[i].birthday)));
      }
      // TODO: missing data -> ignore column
    },
    getLocation() {
      // request("https://ipinfo.io", function(error, response, body) {
      //   console.log(JSON.stringify(response, null, 4));
      //   // console.log(JSON.parse(body));
      //   // console.log("city " + response.city);
      //   // console.log("state " + response.region)
      // }, "jsonp");
      //console.log(this.legs[0]);
      //firebase.database().ref("legs").set(this.legs);
    },
    calculateAge(birthday) { // birthday is a date
      var ageDifMs = Date.now() - birthday;
      var ageDate = new Date(ageDifMs); // miliseconds from epoch
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    },
    generateNumericalSummary() {
      var header;
      var temp = {};
      console.log(this.numerical.length);
      for (var k = 0; k < this.numerical.length; k++) {
        header = this.numerical[k];
        console.log(header);
        temp.header = d3.min(this.legs, function(d) { return d.header; });
      }
      //temp.age = ,//temp.height
      // numSum is array of objects: mean, med, etc.
      this.numSum.push(temp);
      console.log(this.numSum);
    },
    legislatorsGraph(){
      if(!this.showData){
        this.showData = true;
        this.nodes = new vis.DataSet([
          {id: 'Congress', label: 'Congress'},
          {id: 'House', label: 'House'},
          {id: 'Senate', label: 'Senate'}
        ]);

        // create an array with edges
        this.edges = new vis.DataSet([
          {from: 'Congress', to: 'House'},
          {from: 'Congress', to: 'Senate'}
        ]);

        for (var i = 0; i < this.legs.length; i++){
          var name = this.legs[i].first_name + " " + this.legs[i].last_name;
          this.nodes.add([
            {id: name, label: name, cid: this.legs[i].party, group: this.legs[i].party}
          ]);
          if(this.legs[i].type == "rep"){
            this.edges.add([
              {from: 'House', to: name}
            ]);
          }else{
            this.edges.add([
              {from: 'Senate', to: name}
            ]);
          }
        }

        // create a network
        var container = document.getElementById('mynetwork');
        container.style.visibility = "visible";
        // provide the data in the vis format
        var data = {
          nodes: this.nodes,
          edges: this.edges
        };
        var options = {
          groups:{
            Democrat: {color: {background: "blue"}},
            Republican: {color: {background: "red"}, shape:"square"},
            Independent: {color: {background: "yellow"}, shape:"diamond"}
          },
          layout:{
            improvedLayout: false
          }
        };

        // initialize your network!
        var network = new vis.Network(container, data, options);
      }
    },
    ispDonations() {
      //saving isp dataset to firebase
      //firebase.database().ref("isp").set(this.isp);
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
#mynetwork {
  display: inline-block;
  background-color: white;
  width: 100%;
  height: 400px;
  border: 1px solid lightgray;
  margin-right: 0;
  margin: 0;
  padding: 0;
  border: 0;
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
.modal-body{
  justify-content: center;
  padding: 0;
}
.modal-header{
  justify-content: start;
  background-color: #DCDCDC;
}
.modal-footer{
  justify-content: start;
  background-color: #DCDCDC;
}

</style>
