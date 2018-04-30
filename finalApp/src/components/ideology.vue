<template>
<div id="main">
  <h1>Ideologies of the Members of Congress by Chamber</h1>
    <div class="row">
      <div class="col-lg-6 col-md-6 col-sm-12 textbody">
        <h3>Ideology Analysis</h3>
        <p>The ideology analysis in place here is a score on how liberal-conservative each Member of Congress is based on his or her pattern of bill cosponsorship.<p>
        <p>In essence, each Member of Congress who cosponsors similar bills will get have scores that are similar, and members who sponsor different bills
        will have more contrasting scores. This relies on members that have similar political views to cosponsor the the same set of bills or bills by the same
        set of authors. Conversely, members with different political views would be more likely to cosponsor different bills.</p>
        <p>The charts on the right plot the ideology score against the leadership score, where leadership is determined by the number of bills sponsored. Looking at the
        extremes shows, for instance, that Senator Jim Inhofe appears to be an extreme Republican in the Senate chart and he is indeed regarded as one of the most
        conservative senators.</p>
        <p>What is fascinating about the plot is the huge disparity and polarization that has begun to take hold within the modern political sphere. When looking at
        similar charts from Congress years ago, we see less of a clear divide between political parties. Overall, this shows that modern politics has become more
        segregated into specific political ideologies especially as there are only two Independents within Congress. Both of whom are in the Senate.</p>
        <h3>Methodology, Dataset, and Citations</h3>
        <p>The ideology scores were computed through an analysis called Principle Component Analysis and the leadership scores were computed through scraping and page
        rank analysis. More information about how this was completed is cited here.</p>
        <p id="citation">GovTrack.us. 2013. Leadership Analysis of Members of Congress. Accessed at <a href="https://www.govtrack.us/about/analysis">https://www.govtrack.us/about/analysis</a>.</p>
        <p>Datasets: <a href="https://raw.githubusercontent.com/duke-compsci290-spring2018/final-project-team-56/master/finalApp/data/sponsorshipanalysis_h.csv">House</a>
        <a href="https://raw.githubusercontent.com/duke-compsci290-spring2018/final-project-team-56/master/finalApp/data/sponsorshipanalysis_s.csv">Senate</a></p>
        <p>Click the button below to view all the Members of Congress on a network graph.</p>
        <button v-on:click="legislatorsGraph" class="btn btn-primary" id="networkToggle" data-toggle="modal" data-target="#myModal2">Network Graph</button>
        <p>Click the button below to view the graph above but with the ideology and leadership scores.</p>
        <button v-on:click="congressGraph" class="btn btn-primary" id="networkToggle" data-toggle="modal" data-target="#myModal2">Weighted Graph</button>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12">
        <div id="myDiv"></div>
        <div id="senateDiv"></div>
      </div>
    </div>
    <!--  Modal -->
    <div class="modal fade" id="myModal2" role="dialog">
      <div class="modal-dialog">
        <!-- Modal content-->
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Network Graph of Congress</h4>
          </div>
          <div class="modal-body">
            <div id="mynetwork" class="network"></div>
          </div>
          <div class="modal-footer">
            <button v-if="showData" v-on:click="updateCluster" class="btn btn-outline-primary">Cluster by State</button>
            <button type="button" class="btn btn-default closer" data-dismiss="modal">Close</button>
            <p>{{type}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
var network;
var dataSet;
var vis = require('vis')

export default {
  name: 'ideology',
  data () {
    return {
      showData: false,
      weightedData: false,
      states: [],
      type: ''
    }
  },
  props: [
    'houseSet',
    'senateSet',
    'legs'
  ],
  mounted: function(){
    var trace1 = {
      x:[],
      y:[],
      mode: 'markers',
      type: 'scatter',
      name: 'Democrat',
      text: [],
      marker: { size: 6 }
    };
    var trace2 = {
      x: [],
      y: [],
      mode: 'markers',
      type: 'scatter',
      name: 'Republican',
      text: [],
      marker: { size: 6 }
    };
    var trace4 = {
      x:[],
      y:[],
      mode: 'markers',
      type: 'scatter',
      name: 'Democrat',
      text: [],
      marker: { size: 6 }
    };
    var trace5 = {
      x: [],
      y: [],
      mode: 'markers',
      type: 'scatter',
      name: 'Republican',
      text: [],
      marker: { size: 6 }
    };
    var trace6 = {
      x: [],
      y: [],
      mode: 'markers',
      type: 'scatter',
      name: 'Independent',
      text: [],
      marker: { size: 6 }
    };
    for (var i = 0; i < this.houseSet.length; i++){
      if (this.houseSet[i][" party"] == " Democrat"){
        trace1.x.push(parseFloat(this.houseSet[i][" ideology"]));
        trace1.y.push(parseFloat(this.houseSet[i][" leadership"]));
        trace1.text.push(this.houseSet[i][" name"]);
      }else if (this.houseSet[i][" party"] == " Republican"){
        trace2.x.push(parseFloat(this.houseSet[i][" ideology"]));
        trace2.y.push(parseFloat(this.houseSet[i][" leadership"]));
        trace2.text.push(this.houseSet[i][" name"]);
      }
    }

    for (var i = 0; i < this.senateSet.length; i++){
      if (this.senateSet[i][" party"] == " Democrat"){
        trace4.x.push(parseFloat(this.senateSet[i][" ideology"]));
        trace4.y.push(parseFloat(this.senateSet[i][" leadership"]));
        trace4.text.push(this.senateSet[i][" name"]);
      }else if (this.senateSet[i][" party"] == " Republican"){
        trace5.x.push(parseFloat(this.senateSet[i][" ideology"]));
        trace5.y.push(parseFloat(this.senateSet[i][" leadership"]));
        trace5.text.push(this.senateSet[i][" name"]);
      }else {
        trace6.x.push(parseFloat(this.senateSet[i][" ideology"]));
        trace6.y.push(parseFloat(this.senateSet[i][" leadership"]));
        trace6.text.push(this.senateSet[i][" name"]);
      }
    }

    var data = [ trace1, trace2 ];
    var data2 = [ trace4, trace5, trace6 ];

    var layout = {
      xaxis: {
        range: [ 0, 1.05 ],
        title: "Ideology"
      },
      yaxis: {
        range: [0, 1.05],
        title: "Leadership"
      },
      title:'Ideology vs Leadership in the House (115)'
    };

    Plotly.newPlot('myDiv', data, layout);
    layout.title = 'Ideology vs Leadership in the Senate (115)';
    Plotly.newPlot('senateDiv', data2, layout);
  },
  methods: {
    congressGraph(){
      if(!this.weightedData){
        this.weightedData = true;
        this.showData = false;
        var nodes = new vis.DataSet([
          {id: 'Congress', label: 'Congress', value: 30},
          {id: 'House', label: 'House', value: 20},
          {id: 'Senate', label: 'Senate', value: 20}
        ]);
        var edges = new vis.DataSet([
          {from: 'Congress', to: 'House', value: 2},
          {from: 'Congress', to: 'Senate', value: 2}
        ]);
        for(var i = 0; i < this.houseSet.length; i++){
          nodes.add([
            {id: this.houseSet[i].ID, label: this.houseSet[i][" name"], group: this.houseSet[i][" party"], value: 10*(1+parseFloat(this.houseSet[i][" ideology"]))}
          ]);
          edges.add([
            {from: 'House', to: this.houseSet[i].ID, value: 10*(1+parseFloat(this.houseSet[i][" leadership"]))}
          ]);
        }
        for(var i = 0; i < this.senateSet.length; i++){
          nodes.add([
            {id: this.senateSet[i].ID, label: this.senateSet[i][" name"], group: this.senateSet[i][" party"], value: 10*(1+parseFloat(this.senateSet[i][" ideology"]))}
          ]);
          edges.add([
            {from: 'Senate', to: this.senateSet[i].ID, value: 10*(1+parseFloat(this.senateSet[i][" leadership"]))}
          ]);
        }

        var container = document.getElementById('mynetwork');
        container.style.visibility = "visible";
        dataSet = {
          nodes: nodes,
          edges: edges
        };
        var options = {
          nodes:{
            shape: 'dot',
          },
          physics: {
            stabilization: false
          },
          groups:{
            ' Democrat': {color: {background: "blue"}},
            ' Republican': {color: {background: "red"}},
            ' Independent': {color: {background: "yellow"}}
          },
          layout:{
            improvedLayout: false
          }
        };
        network = new vis.Network(container, dataSet, options);

      }
    },
    legislatorsGraph(){
      if(!this.showData){
        this.showData = true;
        this.weightedData = false;
        var nodes = new vis.DataSet([
          {id: 'Congress', label: 'Congress'},
          {id: 'House', label: 'House'},
          {id: 'Senate', label: 'Senate'}
        ]);

        // create an array with edges
        var edges = new vis.DataSet([
          {from: 'Congress', to: 'House'},
          {from: 'Congress', to: 'Senate'}
        ]);

        for (var i = 0; i < this.legs.length; i++){
          if(this.states.indexOf(this.legs[i].state)==-1){
            this.states.push(this.legs[i].state);
          }
          var name = this.legs[i].first_name + " " + this.legs[i].last_name;
          nodes.add([
            {id: name, label: name, cid: this.legs[i].state, group: this.legs[i].party}
          ]);
          if(this.legs[i].type == "rep"){
            edges.add([
              {from: 'House', to: name}
            ]);
          }else{
            edges.add([
              {from: 'Senate', to: name}
            ]);
          }
        }
        // create a network
        var container = document.getElementById('mynetwork');
        container.style.visibility = "visible";
        // provide the data in the vis format
        dataSet = {
          nodes: nodes,
          edges: edges
        };
        var options = {
          nodes:{
            shape: 'dot',
          },
          physics: {
            stabilization: false
          },
          groups:{
            Democrat: {color: {background: "blue"}},
            Republican: {color: {background: "red"}, shape:"square"},
            Independent: {color: {background: "yellow"}, shape:"diamond"}
          },
          layout:{
            improvedLayout: false
          }
        };

        // initialize your network!
        network = new vis.Network(container, dataSet, options);
        var vm = this;
        network.on("doubleClick", function(params){
          if (params.nodes.length == 1){
            if (network.isCluster(params.nodes[0])){
              network.openCluster(params.nodes[0]);
            }
          }
        });
        network.on("click", function(params){
          vm.type = params.nodes[0];
        });
      }
    },
    updateCluster() {
      network.setData(dataSet);
      var clusterOptionsByData;
      for (var i = 0; i < this.states.length; i++){
        var state = this.states[i];
        var colorOpp;
        clusterOptionsByData = {
          joinCondition: function (childOptions) {
            return childOptions.cid == state;
          },
          processProperties: function (clusterOptions, childNodes, childEdges) {
            var totalMass = 0;
            var numRep = 0;
            var numDem = 0;
            for (var j = 0; j < childNodes.length; j++){
              if(childNodes[j].group == "Democrat"){
                numDem++;
              }
              if(childNodes[j].group == "Republican"){
                numRep++;
              }
              totalMass += childNodes[j].mass;
            }
            if(numDem < numRep){
              colorOpp = "red";
            }else if(numDem == numRep){
              colorOpp = "purple";
            }else{
              colorOpp = "blue";
            }
            clusterOptions.mass = totalMass;
            return clusterOptions;
          },
          clusterNodeProperties: {id: 'cluster'+state, borderWidth: 1, color: {background: colorOpp}, shape: 'database', label:"Members from "+state}
        };
        network.cluster(clusterOptionsByData);
      }
    }
  }
}
</script>
<style scoped>
h1, h3, p{
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.modal-title{
  text-align: center;
}
#main {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding-bottom: 5%;
}
#mynetwork {
  display: inline-block;
  background-color: white;
  width: 100%;
  height: 400px;
  border: 1px solid lightgray;
  margin-right: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
#citation{
  padding-left: 7.5%;
  padding-right: 7.5%;
}
#main h1{
  text-align: center;
  margin-top: 5%;
  margin-bottom: 5%;
}
#myDiv{
  margin-bottom: 3%;
}
.textbody{
  padding-left: 5%;
  padding-right: 5%;
}
.row h3{
  text-align: center;
}
</style>
