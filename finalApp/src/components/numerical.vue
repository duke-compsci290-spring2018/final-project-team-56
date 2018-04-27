<template>
	<body>
		<div id="chart">
			<span id="percentage"></span><br/>
			spaghetti
		</div>
	</body>
</template>

<script>
export default {
    name: 'App',
	data() {
		return {
			min: '',
			max: '',
			mean: '',
			median: '',
			stdv: ''
		}
	},
    props: [
		'csv',
		'numerical'
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

</style>
