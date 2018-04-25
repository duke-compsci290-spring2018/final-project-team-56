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
    name: 'App',/*
	data() {
		return {

		}
	},*/
    props: [
		'minPrice',
		'maxPrice',
		'avgPrice'
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

#chart {
  position: relative;
}

#chart path {
  stroke: #fff;
}

#percentage {
  font-size: 2.5em;
}

</style>
