<template>
	<body>
		<h2> {{myState}} </h2>
		<br>
		<div class="row justify-content-md-center">
			<div class="col-lg-6 members">
				<ul v-for="(cg, index) in myReps">
					<li v-if="cg.type === 'sen'" @click="test(cg)">Senator: {{cg.first_name}} {{cg.last_name}}</li>
					<li v-if="cg.type === 'rep'" @click="test(cg)">Rep: {{cg.first_name}} {{cg.last_name}}</li>
				</ul>
			</div>
			<div class="col-lg-6 members">
				<!-- add in here -->
				<h3 v-if="party === 'Democrat'" style="color:#46A0EF;">{{name}}</h3>
				<h3 v-if="party === 'Republican'" style="color:#EF4667;">{{name}}</h3>
				<h3 v-if="party === 'Independent'" style="color:#848484;">{{name}}</h3>
				<p v-if="site">Visit: <a v-bind:href="site" target="_blank">{{site}}</a></p>
				<p v-if="twitter">Twitter: <a v-bind:href="'https://twitter.com/'+twitter" target="_blank">{{twitter}}</a></p>
				<p v-if="fb">Facebook: <a v-bind:href="'https://facebook.com/'+fb" target="_blank">{{fb}}</a></p>
				<!-- <p v-if="address">Address: {{address}}</p> -->
				<p v-if="phone">Phone: {{phone}}</p>
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
    ],
	data: function() {
		return {
			name: '',
			party: '',
			site: '',
			address: '',
			phone: '',
			twitter: '',
			fb: ''
		};
	},
	methods: {
		test(member) {
			this.name = member.first_name + " " + member.last_name;
			this.party = member.party;
			this.site = member.url;
			this.address = member.address;
			this.phone = member.phone;
			this.twitter = member.twitter;
			this.fb = member.facebook;
			console.log(this.name);
		}
	}
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

.members h3 {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
	text-transform: uppercase;
	margin-left: 10%;
}

.members p {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
	font-size: 15px;
	margin-left: 10%;
}

li {
	font-size: 15px;
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #848484;
	text-transform: uppercase;
}

.members li {
	font-size: 15px;
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #848484;
	text-transform: uppercase;
	margin-left: 60%;
}

li:hover {
	color: black;
}

</style>
