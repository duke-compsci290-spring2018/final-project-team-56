<template>
    <div id="app">
        <button v-on:click="load" class="btn btn-primary">Load Data</button>
        <button v-on:click="getLocation" class="btn btn-primary">Get Location</button>
        <!-- <wheel></wheel> -->
    </div>
</template>

<script>
import * as d3 from 'd3'
import request from 'request';
// import wheel from './components/wheel'

export default {
    name: 'App',
    data() {
        return {
            legs: [],
        }
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
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
