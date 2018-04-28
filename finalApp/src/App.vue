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
                            <button v-on:click="guestAccess" class="btn btn-outline-primary" data-dismiss="modal">Guest</button>
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
            users: [
              {email: 'h', password: 'h', access: 'User'},
              {email: 'z', password: 'z', access: 'Admin'}
            ],
            admin: false,
            guest: false,
            user: false,
            legs: [],
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
            networkGraph: '',
            data:'', //this and networkgraph are all for updating the network graph
            nodes: '',
            edges: '',
            center: {
                lat: '',
                lng: ''
            },
            showMap: false
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
    login() {
      //determine if user or Admin
      this.user = true; //this.admin = true
      this.signedIn = true;
    },
    register() {
      this.user = true;
      this.signedIn = true;
    },
    guestAccess() {
      this.guest = true;
      this.signedIn = true;
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
                    {id: name, label: name, cid: this.legs[i].state, group: this.legs[i].party}
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
            var dataSet = {
                nodes: this.nodes,
                edges: this.edges
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
            var network = new vis.Network(container, dataSet, options);
            /*
              network.on("click" funciton ) blah blah blah display details
            */
            this.networkGraph = network;
            this.data = dataSet;
        }
    },
    updateCluster() {
      this.networkGraph.setData(this.data);
      var states = ["AL", 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
      'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
      'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
      var clusterOptionsByData;
      for (var i = 0; i < states.length; i++){
        var state = states[i];
        clusterOptionsByData = {
          joinCondition: function (childOptions) {
            return childOptions.cid == state;
          },
          processProperties: function (clusterOptions, childNodes, childEdges) {
            var totalMass = 0;
            for (var j = 0; j < childNodes.length; j++){
              totalMass += childNodes[j].mass;
            }
            clusterOptions.mass = totalMass;
            return clusterOptions;
          },
          clusterNodeProperties: {id: 'cluster'+state, borderWidth: 3, shape: 'database', label:'All members from '+state}
        };
        this.networkGraph.cluster(clusterOptionsByData);
      }
    },
    ispDonations() {
        //saving isp dataset to firebase
        //firebase.database().ref("isp").set(this.isp);
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
    display: inline-block;
    vertical-align: middle;
    padding-top: 10%;
    padding-bottom: 10%;
}
header{
    padding-top: 12.5%;
    padding-bottom: 12.5%;
    background-color: #a4fcc8;
    height: 60vh;
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

</style>
