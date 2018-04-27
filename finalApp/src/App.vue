<template>
    <div id="app">
        <header>
          <h1>Data Visualization in the Political Sphere</h1>
          <h3>Team 56: Harry Wang and Zuzu Tang</h3>
        </header>
        <button v-on:click="load" class="btn btn-primary">Load Data</button>
        <button v-on:click="getLocation" class="btn btn-primary">Get Location</button>
        <button v-on:click="generateNumericalSummary" class="btn btn-primary">Generate Numerical Summary Statistics</button>

        <!-- <numerical
            :csv="legs"
            :numerical="numerical">
        </numerical> -->
    </div>
</template>

<script>
import * as d3 from 'd3'
import request from 'request';
import numerical from './components/numerical'

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
            legs: [],
            categorical: [],
            numerical: [],
            numSum: []
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
