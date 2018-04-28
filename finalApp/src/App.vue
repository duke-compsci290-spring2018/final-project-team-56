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
        <br> <br>
        <div id="myLoc" v-if="showMap">
            <gmap-map
                :center="center"
                :zoom="6"
                style="height: 480px; width: 50%;"
            >
            <gmap-marker
                :position="center"
                :clickable="true"
            ></gmap-marker>
            </gmap-map>

            <button v-on:click="loadcgData" class="btn btn-primary">ur cg</button>
        </div>
        <!-- shit goes here -->


      </div>
    </header>
  </div>
</template>

<script>
import * as d3 from 'd3'
import request from 'request';
import numerical from './components/numerical'

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
            categorical: [],
            numerical: [],
            numSum: [],
            signedIn: true,
            email: '',
            password: '',
            center: {
                lat: '',
                lng: ''
            },
            showMap: false
        }
    },
    components: {
        // wheel
    },
    mounted: function () {
        var vm = this;
        d3.csv("https://raw.githubusercontent.com/duke-compsci290-spring2018/final-project-team-56/zuzu/finalApp/data/legislators-current.csv", function(data) {
            vm.legs.push(data);
            console.log("done");
        });
        // Get location of user
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                    // console.log(position.coords);
                    vm.center.lat = position.coords.latitude;
                    vm.center.lng = position.coords.longitude;
                    // console.log(vm.center);
                    vm.showMap = true;
                }
            )
        } else {
            console.log("Geolocation is not supported by browser");
        }
        // Load user's senator based on location
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
            /*
            for (var i = 0; i < this.categorical.length; i++) {
                console.log("categorical var: " + this.categorical[i].key);
            }
            for (var i = 0; i < this.numerical.length; i++) {
                console.log("numerical var: " + this.numerical[i].key);
            }*/
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
        loadcgData() {
            console.log("my lat " + this.center.lat);
            console.log("my long " + this.center.lng);
            fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng="+this.center.lat+","+this.center.lng+"&key=AIzaSyCotQCA476JOVJ87et877SGKGFI3C840Ac").then(response => response.json())
                      .then(data => {
                          console.log(data)
                       })
                      .catch(error => console.log(error))
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
