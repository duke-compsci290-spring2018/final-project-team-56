<template>
	<body>
		<div id="favs">
			<table class="table">
				<thead style="background-color:lightgray">
					<tr>
						<th scope="col">#</th>
						<th scope="col" @click="sortLastName">Name</th>
						<th scope="col" @click="sortParty">Party</th>
						<th scope="col" @click="sortType">Type</th>
						<th scope="col" @click="sortState">State</th>
						<th scope="col" @click="sortGender">Gender</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(mem, index) in favMems">
						<th scope="row" >{{index+1}}</th>
						<th scope="row" >{{mem.first_name}} {{mem.last_name}}</th>
						<th scope="row" >{{mem.party}}</th>
						<th scope="row" >{{mem.type}}</th>
						<th scope="row" >{{mem.state}}</th>
						<th scope="row" >{{mem.gender}}</th>
					</tr>
				</tbody>
			</table>
		</div>
	</body>
</template>

<script>
import * as d3 from 'd3'
export default {
    name: 'App',
    props: [
		'favMems'
	],
	methods: {
	    sortLastName() {
	        this.favMems.sort(function(x, y){
	            return d3.ascending(x.last_name, y.last_name);
	        })
	    },
	    sortParty() {
	        this.favMems.sort(function(x, y){
	            return d3.ascending(x.party, y.party);
	        })
	    },
	    sortType() {
	        this.favMems.sort(function(x, y){
	            return d3.ascending(x.type, y.type);
	        })
	    },
	    sortState() {
	        this.favMems.sort(function(x, y){
	            return d3.ascending(x.state, y.state);
	        })
	    },
	    sortGender() {
	        this.favMems.sort(function(x, y){
	            return d3.ascending(x.gender, y.gender);
	        })
	    }
	}
}
</script>

<style>
.table {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

.first {
    width: 1%;
}

.top {
    height: 1.5em;
}

.table {
    border-radius: 5px;
    width: 80%;
    margin: 0px auto;
    float: none;
}

tr:hover {
    background-color: white;
}

</style>
