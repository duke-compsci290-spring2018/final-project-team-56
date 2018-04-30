<template>
	<body>
		<div id="favs">
			<table class="table">
				<thead style="background-color:lightgray">
					<tr>
						<th scope="col">#</th>
						<th scope="col">Name</th>
						<th scope="col">Party</th>
						<!-- <th scope="col">Bedrooms</th>
						<th scope="col" style="width:100px">Bath per bed</th>
						<th scope="col" style="width:100px">Total Sq Ft</th>
						<th scope="col">Floors</th>
						<th scope="col">Waterfront</th>
						<th scope="col" style="width:100px">Year built</th>
						<th scope="col">Zipcode</th> -->
					</tr>
				</thead>
				<tbody>
					<tr v-for="(mem, index) in favMems">
						<th scope="row" >{{index+1}}</th>
						<th scope="row" >{{mem.first_name}} {{mem.last_name}}</th>
						<th scope="row" >{{mem.party}}</th>
						<!-- <th scope="row" >{{house.bedrooms}}</th>
						<th scope="row" >{{house.bathrooms}}</th>
						<th scope="row" >{{house.sqft_living}}</th>
						<th scope="row" >{{house.floors}}</th>
						<th scope="row" >{{house.waterfront}}</th>
						<th scope="row" >{{house.yr_built}}</th>
						<th scope="row" >{{house.zipcode}}</th> -->
					</tr>
				</tbody>
			</table>
		</div>
	</body>
</template>

<script>
export default {
    name: 'App',
    props: [
		'favMems'
	]
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
