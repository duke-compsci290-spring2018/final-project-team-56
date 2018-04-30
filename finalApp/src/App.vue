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
                        </div>
                        <div class="modal-body">
                          <div v-if="!signedIn" id="form">
                            <label for="email">Email</label>
                            <input id="email" class="inputLogin" type="text" v-model="email" placeholder="Email"><br>
                            <label for="password">Password</label>
                            <input id="password" class="inputLogin" type="password" v-model="password" placeholder="Password"><br>
                            <button v-on:click="login" class="btn btn-outline-primary">Login</button>
                            <button v-on:click="register" class="btn btn-outline-primary">Register</button>
                            <button v-on:click="guestAccess" class="btn btn-outline-primary">Guest</button>
                            <p v-if="loginError" class="errorLogin">Email and Password incorrect or exists!</p>
                          </div>
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
          :logs="logs"
          :id="id"
          :myState="myState"
          :myStateReps="myStateReps"
          :favMems="favMems"
          :user="user"
          :admin="admin">
          </cg-info>
      </div>
      <br>
      <div id="fav" v-if="favMems.length">
          <div class="row justify-content-center">
              <button @click="clearFavorites" class="btn btn-light">Clear Favorites</button>
        </div>
          <br>
          <favorite-members
          :favMems="favMems">
          </favorite-members>
      </div>

  <ideology :houseSet="sponsoreshipH" :legs="legs" :senateSet="sponsoreshipS"></ideology>
  <user v-if="user || admin" :logs="logs" :id="id" :admin="admin" :masterSet="masterSet" :personalSet="personalSet"></user>

  <footer>
      <h1> Stay up to date </h1>
      <div class="row">
          <div class="col-lg-6 col-md-6 col-sm-12">
              <Timeline style="width:50%;margin-left: 50%;" :id="'Congressdotgov'" :sourceType="'profile'" :options="{ tweetLimit: '2' }"/>
          </div>
          <div class="col-lg-6 col-md-6 col-sm-12">
              <Timeline style="width:50%;" :id="'realDonaldTrump'" :sourceType="'profile'" :options="{ tweetLimit: '2' }"/>
          </div>
      </div>
  </footer>
  <div v-if="admin">
    <h4>View Logs</h4>
    <ul>
      <li v-for="item in logs">{{item}}</li>
    </ul>
  </div>
</body>

</div>
</template>

<script>
import * as d3 from 'd3'
import request from 'request';
import Timeline from 'vue-tweet-embed/timeline'
// import numerical from './components/numerical'
import donations from './components/donations'
import ideology from './components/ideology'
import cgInfo from './components/cgInfo'
import favoriteMembers from './components/favoriteMembers'
import user from './components/user'

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
      users: [],
      //   {email: 'h', password: 'h', access: 'User', id: 0},
      //   {email: 'z', password: 'z', access: 'Admin', id: 1}
      // ],
      count: 2,
      id: -1,
      masterSet: [],//isp and stuff would be added
      personalSet: [],//[{name:'set1', data:[1,2,3]}],
      access: '',
      admin: false,
      guest: false,
      user: false,
      legs: [],
      logs: [],
      loginError: false,
      categorical: [],
      numerical: [],
      numSum: [],
      signedIn: false,
      showData: false,
      email: '',
      password: '',
      isp: [],
      sponsoreshipH: [],
      sponsoreshipS: [],
      center: {
        lat: 39,
        lng: -98
      },
      myLoc: {
          lat: '',
          lng: ''
      },
      showMap: true,
      myState: '',
      myStateReps: [],
      markers: [],
      newState: '',
      USstates: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
      favMems: []
    }
  },
  components: {
    // wheel
    user,
    donations,
    ideology,
    cgInfo,
    favoriteMembers,
    Timeline
  },
  mounted: function () {
    var vm = this;
    var db = firebase.database();
    function getData(snapshot){
      var data = snapshot.val();
      if("users" in data){
        vm.users = [];
        for (var i = 0; i < data.users.length; i++){
          vm.users.push(data.users[i]);
        }
      }
      if("logs" in data){
        for (var i = 0; i < data.logs.length; i++){
          vm.logs.push(data.logs[i]);
        }
      }
      if("datasets" in data){
        vm.masterSet = [];
        for (var i = 0; i < data.datasets.length; i++){
          vm.masterSet.push(data.datasets[i]);
          if(data.datasets[i].name == "legs"){
            vm.legs = data.datasets[i].data;
          }
          if(data.datasets[i].name == "ideoSenate"){
            vm.sponsoreshipH = data.datasets[i].data;
          }
          if(data.datasets[i].name == "ideoHouse"){
            vm.sponsoreshipS = data.datasets[i].data;
          }
        }
      }
      //grab that users dataset and also their favMems
      db.ref("/").off("value", getData);
    }
    db.ref("/").on("value", getData);

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
  setFireBase(key, val){
    firebase.database().ref("/"+key).set(val);
  },
  logout(){
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
        this.id = this.users[i].id;
        this.signed();
        var vm = this
        firebase.database().ref('/' + this.id+'database').once('value').then(function(snapshot) {
          if(snapshot.val() != null){
            vm.personalSet = snapshot.val();
          }
        });
        firebase.database().ref('/' + this.id+'favMems').once('value').then(function(snapshot) {
          if(snapshot.val() != null){
            vm.favMems = snapshot.val();
          }
        });

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
      "accesss": "User",
      "id": this.count
    });
    this.setFireBase("users", this.users);
    this.logs.push("Added new user id: " + this.id + " at "+ Date());
    this.setFireBase("logs", this.logs);
    this.count++;
    this.setFireBase("count", this.count);
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
  },
  load() {
    var vm = this;
    var cols = [];
    var entries = d3.entries(vm.isp[0]);       // considering first entry only for column names
    for (var k = 0; k < entries.length; k++) {
        cols.push(entries[k].key); // column name
        // how to interpret birthdays -- specific to legs
        // if (entries[k].key == "birthday") {
        //     var birthday = Date.parse(entries[k].value);
        //     var age = this.calculateAge(birthday);
        //     entries[k].value = age;
        // }
        if (isNaN(entries[k].value)) {  // string --> categorical
            this.categorical.push(entries[k].key);
        } else {
            this.numerical.push(entries[k].key);
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
  loadcgData(marker) {
      this.myStateReps = [];
      var state;
      fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng="+marker.position.lat+","+marker.position.lng+"&key=AIzaSyCotQCA476JOVJ87et877SGKGFI3C840Ac").then(response => response.json())
      .then(data => {
          console.log(data.results);
          this.myState = data.results[1].address_components[2].long_name;
          state = data.results[1].address_components[2].short_name;
          console.log(this.myState.short_name);
          for (var i = 0; i < this.legs.length; i++) {
              if (this.legs[i].state == state) {
                  this.myStateReps.push(this.legs[i]);
              }
          }
          // console.log(this.myStateReps);
      })
      .catch(error => console.log(error));
  },
  changeState(state) {
      console.log(state);
      this.myState = state;
      state = this.abbrState(state, "abbr");
      this.myStateReps = [];
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
                  this.myStateReps.push(this.legs[i]);
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
  },
  clearFavorites() {
      this.favMems = [];
      this.setFireBase(this.id+"favMems", this.favMems);
      this.logs.push(this.id + " Cleared favorite members at " + Date());
      this.setFireBase("logs", this.logs);
  },
  }
}
</script>

<style>
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
    height: 100vh;
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
footer {
    background-color: #fafafa;
    padding-top: 5%;
    padding-bottom: 10%;
}
footer h1 {
    padding-bottom: 3%;
    letter-spacing: -2px;
    text-transform: uppercase;
    font-weight: bold;
    text-align: center;
}
.fav {
    margin: 0 auto;
}
</style>
