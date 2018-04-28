<template>
	<body>
		<h2> {{myState.long_name}} </h2>
		<div class="row justify-content-md-center">
			<h4> Senators </h4>
			<div class="col-lg-12">
				<ul v-for="(cg, index) in myReps">
					<li v-if="cg.type === 'sen'">{{cg.first_name}} {{cg.last_name}}</li>
				</ul>
			</div>
			<h4> Representatives </h4>
			<div class="col-lg-12" id="squish">
				<ul v-for="(cg, index) in myReps">
					<li v-if="cg.type === 'rep'">{{cg.first_name}} {{cg.last_name}}</li>
				</ul>
			</div>
		</div>
	</body>
</template>

<script>
export default {
    name: 'App',
    props: [
		'myState',
		'myReps'
    ]
}
</script>

<style>
.first {
    width: 1%;
}

.top {
    height: 1.5em;
}

body {
	background-color: aliceblue;
}

ul {
	list-style-type: none;
}

h2, h4 {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
	text-transform: uppercase;
}

p {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
	font-size: 10px;
}

li {
	font-size: 10px;
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}

</style>
