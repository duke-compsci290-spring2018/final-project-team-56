<template>
	<body>
		<h2> {{myState}} </h2>
		<br>
		<div class="row justify-content-md-center">
			<div class="col-lg-6 members">
				<ul v-for="(cg, index) in myStateReps">
					<li v-if="cg.type === 'sen'" @click="test(cg)">Senator: {{cg.first_name}} {{cg.last_name}}</li>
					<li v-if="cg.type === 'rep'" @click="test(cg)">Rep: {{cg.first_name}} {{cg.last_name}}</li>
				</ul>
				<button @click="addAll" v-if="user" class="btn btn-secondary">Add All to Favorites</button>
			</div>
			<div class="col-lg-6 box">
				<!-- add in here -->
				<h3 v-if="party === 'Democrat'" style="color:#46A0EF;">{{name}}</h3>
				<h3 v-if="party === 'Republican'" style="color:#EF4667;">{{name}}</h3>
				<h3 v-if="party === 'Independent'" style="color:#848484;">{{name}}</h3>
				<p v-if="site">Visit: <a v-bind:href="site" target="_blank">{{site}}</a></p>
				<p v-if="twitter">Twitter: <a v-bind:href="'https://twitter.com/'+twitter" target="_blank">{{twitter}}</a></p>
				<p v-if="fb">Facebook: <a v-bind:href="'https://facebook.com/'+fb" target="_blank">{{fb}}</a></p>
				<p v-if="phone">Phone: {{phone}}</p>
				<button @click="addToFavs(member)" v-if="user && name" class="btn btn-secondary">Add to Favorites</button>
			</div>
		</div>
	</body>
</template>

<script>
var firebase = require('firebase');

export default {
    name: 'App',
    props: [
		'id',
		'myState',
		'myStateReps',
		'favMems',
		'user'
    ],
	data: function() {
		return {
			name: '',
			party: '',
			site: '',
			address: '',
			phone: '',
			twitter: '',
			fb: '',
			member: {}
		};
	},
	methods: {
		setFireBase(key, val){
      firebase.database().ref("/"+key).set(val);
    },
		test(member) {
			this.member = member;
			this.name = member.first_name + " " + member.last_name;
			this.party = member.party;
			this.site = member.url;
			this.address = member.address;
			this.phone = member.phone;
			this.twitter = member.twitter;
			this.fb = member.facebook;
		},
		addToFavs(member) {
			console.log(member);
			var dontpush = false;
			for (var i = 0; i < this.favMems.length; i++) {
				if (this.favMems[i] == member) {
					dontpush = true;
				}
			}
			if (!dontpush) {
				this.favMems.push(member);
				this.setFireBase(this.id+"favMems", this.favMems);
			}
			console.log(this.favMems);
		},
		addAll() {
			for (var j = 0; j < this.myStateReps.length; j++) {
				if(this.favMems.indexOf(this.myStateReps[j]) == -1){
					this.favMems.push(this.myStateReps[j]);
				}
			}
			this.setFireBase(this.id+"favMems", this.favMems);
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

.box h3 {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
	text-transform: uppercase;
	margin-left: 10%;
}

.box p {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
	font-size: 15px;
	margin-left: 10%;
}

.box button {
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

.members button {
	margin-left: 63%;
}

input {
	margin-left: 60%;
}

label:hover {
	color: black;
}

</style>
