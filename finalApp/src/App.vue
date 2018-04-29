<template>
    <div id="app">
        <header>
            <h1>Data Visualization in the Political Sphere</h1>
            <h3>Team 56: Harry Wang and Zuzu Tang</h3>
            <div v-if="!signedIn">
                <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal">Login</button>
            </div>
            <div v-else>
                <p>Signed in as: {{access}}</p>
                <button v-on:click="load" class="btn btn-primary">Load Data</button>
                <button v-on:click="legislatorsGraph" class="btn btn-primary" data-toggle="modal" data-target="#myModal">Network Graph</button>
                <button v-on:click="ispDonations" class="btn btn-primary">ISP Donations</button><br><br>
                <button v-on:click="logout" class="btn btn-outline-secondary">Logout</button>
                <!-- <wheel></wheel> -->
                <!-- shit goes here -->
            </div>
          </header>
            <!-- Modal -->
            <div class="modal fade" id="myModal" role="dialog">
                <div class="modal-dialog">
                    <!-- Modal content-->
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 v-if="!signedIn" class="modal-title">Login</h4>
                            <div v-if="showData">
                                <h4 class="modal-title">Network Graph of Congress</h4>
                                <button v-on:click="updateCluster" class="btn btn-outline-primary">Cluster by State</button>
                            </div>
                        </div>
                        <div class="modal-body">
                          <div v-if="!signedIn" id="form">
                            <input id="email" class="inputLogin" type="text" v-model="email" placeholder="Email"><br>
                            <input id="password" class="inputLogin" type="password" v-model="password" placeholder="Password"><br>
                            <button v-on:click="login" class="btn btn-outline-primary">Login</button>
                            <button v-on:click="register" class="btn btn-outline-primary">Register</button>
                            <button v-on:click="guestAccess" class="btn btn-outline-primary">Guest</button>
                            <p v-if="loginError" class="errorLogin">Email and Password incorrect or exists!</p>
                          </div>
                          <div v-if="signedIn" id="mynetwork" class="network"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default closer" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
    <body v-if="signedIn">
      <div v-if="showMap">
              <gmap-map
              :center="center"
              :zoom="4"
              style="height: 480px;"
              >
              <gmap-marker
              v-for="(m, index) in markers"
              :key="index"
              :position="m.position"
              :clickable="true"
              @click="loadcgData(m)"
              >
              </gmap-marker>
          </gmap-map>
      </div>
      <div v-if="showMap">
          <div class="btn-group col-sm-4 text-center">
              <button class="btn btn-secondary btn-sm" type="button">Change Your State</button>
              <button type="button" class="btn btn-sm btn-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown"><span class="sr-only">Toggle Dropdown</span></button>
              <ul class="dropdown-menu" role="menu">
                  <li v-for="state in USstates">
                      <button type="button" @click="changeState(state)" class="btn btn-light btn-sm btn-block">{{state}}</button>
                  </li>
              </ul>
          </div>
          <cg-info
          :myState="myState"
          :myReps="myReps">
          </cg-info>
      </div>
      <!-- include funky graph here @harry  -->
      <div class="filter">
          filtering by important issues or by features of congress member
          <filter>
          </filter>
      </div>
  <ideology v-if="signedIn" :houseSet="sponsoreshipH" :senateSet="sponsoreshipS"></ideology>
</body>

</div>
</template>

<script>
import * as d3 from 'd3'
import request from 'request';
// import numerical from './components/numerical'
import donations from './components/donations'
import ideology from './components/ideology'
import cgInfo from './components/cgInfo'
import filter from './components/filter'

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
var network;
var dataSet;

export default {
  name: 'App',
  data() {
    return {
      users: [
        {email: 'h', password: 'h', access: 'User'},
        {email: 'z', password: 'z', access: 'Admin'}
      ],
      access: '',
      admin: false,
      guest: false,
      user: false,
      legs: [],
      loginError: false,
      categorical: [],
      numerical: [],
      numSum: [],
      signedIn: false,
      showData: false,
      email: '',
      password: '',
      states: [],
      isp: [],
      sponsoreshipH: [],
      sponsoreshipS: [],
      center: {
        lat: '',
        lng: ''
      },
      myLoc: {
          lat: '',
          lng: ''
      },
      showMap: true,
      myState: '',
      myReps: [],
      markers: [],
      newState: '',
      USstates: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
    }
  },
  components: {
    // wheel
    donations,
    ideology,
    cgInfo,
    filter
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
    d3.csv("https://raw.githubusercontent.com/duke-compsci290-spring2018/final-project-team-56/master/finalApp/data/sponsorshipanalysis_h.csv", function(data){
      vm.sponsoreshipH.push(data);
      console.log("sponsH");
    });
    d3.csv("https://raw.githubusercontent.com/duke-compsci290-spring2018/final-project-team-56/master/finalApp/data/sponsorshipanalysis_s.csv", function(data){
      vm.sponsoreshipS.push(data);
      console.log("sponsS");
    });
    // Get location of user
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            vm.myLoc.lat = position.coords.latitude;
            vm.myLoc.lng = position.coords.longitude;
            // console.log(vm.myLoc);
            vm.showMap = true;
            // console.log("lat " + vm.myLoc.lat);
            // console.log("lng " + vm.myLoc.lng);
            vm.markers.push({
                position: { lat: vm.myLoc.lat, lng: vm.myLoc.lng }
            })
            console.log(vm.markers);
        })
    } else {
        console.log("Geolocation is not supported by browser");
    }
},
methods: {
  logout(){
    console.log("trying to log out");
    location.reload();
  },
  login() {
    //determine if user or Admin
    for(var i = 0; i < this.users.length; i++){
      if(this.users[i].email = this.email && this.users[i].password == this.password){
        this.loginError = false;
        this.signedIn = true;
        this.admin = (this.users[i].access == "Admin");
        this.user = (this.users[i].access == "User");
        this.email = '';
        this.password = '';
        this.signed();
        if(this.admin){
          this.access = "Admin";
        }else{
          this.access = "User";
        }
      }
    }
    if(!this.signedIn){
      this.loginError = true;
    }
  },
  register() {
    for(var i = 0; i < this.users.length; i++){
      if(this.users[i].email = this.email && this.users[i].password == this.password){
        //user exists already
        alert("User exists already!");
        this.login();
        return;
      }
    }
    this.users.push({
      "email": this.email,
      "password": this.password,
      "accesss": "User"
    });
    this.access = "User";
    this.user = true;
    this.signedIn = true;
    this.signed();
  },
  guestAccess() {
    this.access = "Guest";
    this.guest = true;
    this.signedIn = true;
    this.signed();
  },
  signed(){
    $('#myModal').modal('toggle');
    this.loadBar();
  },
  loadBar(){
    console.log("here");
    //var svg = d3.select("#congressIdeology").append("svg:svg")
                                // .attr("height", "400px")
                                // .attr("width", "50%");

  },
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
    }/*
    for (var i = 0; i < this.categorical.length; i++) {
    console.log("categorical var: " + this.categorical[i].key);
        }
        for (var i = 0; i < this.numerical.length; i++) {
        console.log("numerical var: " + this.numerical[i].key);
    }*/
    for (var i = 0; i < this.legs.length; i++) {
        this.legs[i].age = this.calculateAge(Date.parse(this.legs[i].birthday));
        //console.log(this.calculateAge(Date.parse(this.legs[i].birthday)));
    }
    for (var i = 0; i < this.legs.length; i++) {
        this.legs[i].age = this.calculateAge(Date.parse(this.legs[i].birthday));
        //console.log(this.calculateAge(Date.parse(this.legs[i].birthday)));
        for (var property in this.legs[0]) {
            if (this.legs[i][property] == "") {
                console.log(this.legs[i] + " is missing property " + property);
                // TODO: ignore this property in data analysis
            }
        }
    }
  },
  getLocation() {
      console.log(this.legs[0]);
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
      var nodes = new vis.DataSet([
        {id: 'Congress', label: 'Congress'},
        {id: 'House', label: 'House'},
        {id: 'Senate', label: 'Senate'}
      ]);

      // create an array with edges
      var edges = new vis.DataSet([
        {from: 'Congress', to: 'House'},
        {from: 'Congress', to: 'Senate'}
      ]);

        for (var i = 0; i < this.legs.length; i++){
          if(this.states.indexOf(this.legs[i].state)==-1){
            this.states.push(this.legs[i].state);
          }
          var name = this.legs[i].first_name + " " + this.legs[i].last_name;
          nodes.add([
            {id: name, label: name, cid: this.legs[i].state, group: this.legs[i].party}
          ]);
          if(this.legs[i].type == "rep"){
            edges.add([
              {from: 'House', to: name}
            ]);
          }else{
            edges.add([
              {from: 'Senate', to: name}
            ]);
          }
        }
      // create a network
      var container = document.getElementById('mynetwork');
      container.style.visibility = "visible";
      // provide the data in the vis format
      dataSet = {
        nodes: nodes,
        edges: edges
      };
      var options = {
         // physics: false,
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
      network = new vis.Network(container, dataSet, options);
    }
  },
  updateCluster() {
    network.setData(dataSet);
    var clusterOptionsByData;
    for (var i = 0; i < this.states.length; i++){
      var state = this.states[i];
      var colorOpp;
      clusterOptionsByData = {
        joinCondition: function (childOptions) {
          return childOptions.cid == state;
        },
        processProperties: function (clusterOptions, childNodes, childEdges) {
          var totalMass = 0;
          var numRep = 0;
          var numDem = 0;
          for (var j = 0; j < childNodes.length; j++){
            if(childNodes[j].group == "Democrat"){
              numDem++;
            }
            if(childNodes[j].group == "Republican"){
              numRep++;
            }
            totalMass += childNodes[j].mass;
          }
          if(numDem < numRep){
            colorOpp = "red";
          }else if(numDem == numRep){
            colorOpp = "purple";
          }else{
            colorOpp = "blue";
          }
          clusterOptions.mass = totalMass;
          return clusterOptions;
        },
        clusterNodeProperties: {id: 'cluster'+state, borderWidth: 1, color: {background: colorOpp}, shape: 'database', label:"Members from "+state}
      };
      network.cluster(clusterOptionsByData);
    }
  },
  ispDonations() {
    console.log('hi');
    //saving isp dataset to firebase
    //firebase.database().ref("isp").set(this.isp);
  },
  loadcgData(marker) {
      this.myReps = [];
      var state;
      fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng="+marker.position.lat+","+marker.position.lng+"&key=AIzaSyCotQCA476JOVJ87et877SGKGFI3C840Ac").then(response => response.json())
      .then(data => {
          console.log(data.results);
          this.myState = data.results[1].address_components[2].long_name;
          state = data.results[1].address_components[2].short_name;
          console.log(this.myState.short_name);
          for (var i = 0; i < this.legs.length; i++) {
              if (this.legs[i].state == state) {
                  this.myReps.push(this.legs[i]);
              }
          }
          // console.log(this.myReps);
      })
      .catch(error => console.log(error));
  },
  changeState(state) {
      console.log(state);
      this.myState = state;
      state = this.abbrState(state, "abbr");
      this.myReps = [];
      var myLat;
      var myLng;
      var newMarker;
      fetch("https://maps.googleapis.com/maps/api/geocode/json?address="+state+"&key=&key=AIzaSyCotQCA476JOVJ87et877SGKGFI3C840Ac").then(response => response.json())
      .then(data => {
          myLat = Number(data.results[0].geometry.location.lat);
          myLng = Number(data.results[0].geometry.location.lng);
          console.log("lat " + myLat);
          console.log("long " + myLng);
          // newMarker = { "position": { "lat": myLat, "lng": myLng } };
          // this.markers.push(
          //     newMarker
          // );
          for (var i = 0; i < this.legs.length; i++) {
              if (this.legs[i].state == state) {
                  this.myReps.push(this.legs[i]);
              }
          }
      })
      .catch(error => console.log(error));
      console.log(this.markers);
  },
  abbrState(input) {
      var states = [
          ['Arizona', 'AZ'],
          ['Alabama', 'AL'],
          ['Alaska', 'AK'],
          ['Arizona', 'AZ'],
          ['Arkansas', 'AR'],
          ['California', 'CA'],
          ['Colorado', 'CO'],
          ['Connecticut', 'CT'],
          ['Delaware', 'DE'],
          ['Florida', 'FL'],
          ['Georgia', 'GA'],
          ['Hawaii', 'HI'],
          ['Idaho', 'ID'],
          ['Illinois', 'IL'],
          ['Indiana', 'IN'],
          ['Iowa', 'IA'],
          ['Kansas', 'KS'],
          ['Kentucky', 'KY'],
          ['Kentucky', 'KY'],
          ['Louisiana', 'LA'],
          ['Maine', 'ME'],
          ['Maryland', 'MD'],
          ['Massachusetts', 'MA'],
          ['Michigan', 'MI'],
          ['Minnesota', 'MN'],
          ['Mississippi', 'MS'],
          ['Missouri', 'MO'],
          ['Montana', 'MT'],
          ['Nebraska', 'NE'],
          ['Nevada', 'NV'],
          ['New Hampshire', 'NH'],
          ['New Jersey', 'NJ'],
          ['New Mexico', 'NM'],
          ['New York', 'NY'],
          ['North Carolina', 'NC'],
          ['North Dakota', 'ND'],
          ['Ohio', 'OH'],
          ['Oklahoma', 'OK'],
          ['Oregon', 'OR'],
          ['Pennsylvania', 'PA'],
          ['Rhode Island', 'RI'],
          ['South Carolina', 'SC'],
          ['South Dakota', 'SD'],
          ['Tennessee', 'TN'],
          ['Texas', 'TX'],
          ['Utah', 'UT'],
          ['Vermont', 'VT'],
          ['Virginia', 'VA'],
          ['Washington', 'WA'],
          ['West Virginia', 'WV'],
          ['Wisconsin', 'WI'],
          ['Wyoming', 'WY'],
      ];
      for (var i = 0; i < states.length; i++) {
          if (states[i][0] == input) {
              return(states[i][1]);
          }
      }
  }
  }
}
</script>

<style>
@import url(http://fonts.googleapis.com/css?family=Roboto);
.vue-map-container{
    width: 100%;
}
#form{
    display: inline-block;
    vertical-align: middle;
    padding-top: 10%;
    padding-bottom: 10%;
}
header{
    padding-top: 12.5%;
    padding-bottom: 12.5%;
    background-color: #fafafa;
    height: 75vh;
}
header h1{
    padding-bottom: 3%;
    letter-spacing: -2px;
    text-transform: uppercase;
    font-weight: lighter;
}
header h3{
    padding-bottom: 3%;
    font-weight: lighter;
    font-size: 90%;
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
.inputLogin{
    border: 1px solid #d9d9d9;
    border-top: 1px solid #c0c0c0;
    margin-bottom: 15%;
    padding: 3%;
}
body{
    margin: 0;
}
.filter {
    background-color: #fafafa;
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
.errorLogin{
  color: red;
}
</style>
