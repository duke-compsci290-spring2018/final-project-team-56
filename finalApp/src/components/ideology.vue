<template>
  <div>
    <h1>Viewing Ideologies of the members of Congress by Chamber</h1>
    <div id="myDiv">

    </div>
  </div>

</template>

<script>

export default {
  name: 'ideology',
  data () {
    return {
      answers: ''
    }
  },
  props: [
    'houseSet',
    'senateSet'
  ],
  mounted: function(){
    console.log(this.houseSet);
    console.log(this.senateSet);
    var trace1 = {
      x:[],
      y:[],
      mode: 'markers',
      type: 'scatter',
      name: 'Representatives',
      text: [],
      marker: { size: 12}
    };
    for (var i = 0; i < this.houseSet.length; i++){
        trace1.x.push(parseFloat(this.houseSet[i][" ideology"]));
        trace1.y.push(parseFloat(this.houseSet[i][" leadership"]));
        trace1.text.push(this.houseSet[i][" name"]);
    }
    //loop thru for x and y and append name to text!


var trace2 = {
  x: [],
  y: [],
  mode: 'markers',
  type: 'scatter',
  name: 'Senate',
  text: [],
  marker: { size: 12 }
};
for (var i = 0; i < this.senateSet.length; i++){
    trace2.x.push(parseFloat(this.senateSet[i][" ideology"]));
    trace2.y.push(parseFloat(this.senateSet[i][" leadership"]));
    trace2.text.push(this.senateSet[i][" name"]);
}

var data = [ trace1, trace2 ];

var layout = {
  xaxis: {
    range: [ 0, 1 ],
    title: "Ideology"
  },
  yaxis: {
    range: [0, 1],
    title: "Leadership"
  },
  title:'Ideology vs Leadership'
};

Plotly.newPlot('myDiv', data, layout);
  },
  methods: {

  }
}
</script>
