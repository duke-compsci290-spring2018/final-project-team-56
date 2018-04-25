<template>
    <div id="app">
        <button v-on:click="load" class="btn btn-primary">Load Data</button>
    </div>
</template>

<script>
import * as d3 from 'd3'

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
            var vm = this;
            d3.csv("../data/legislators-current.csv", function(data) {
                console.log('hi');
                console.log(data);
                vm.legs.push(data);
                console.log('bye');
            });
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
