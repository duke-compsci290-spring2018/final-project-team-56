<template>
  <div id="hierarchy">
    <h1>User Manager</h1>
    <p>Click on a dataset below to run graphs and analysis</p>
    <div class="row justify-content-center">
      <form enctype="multipart/form-data">
        <input type="file" @change="onFileChange" accept=".csv">
      </form>
    </div>
    <h3>Personal User Dataset</h3>
    <table class="table">
      <thead style="background-color:lightgray">
        <tr>
          <th scope="col">#</th>
          <th scope="col">DataSet</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(dset, index) in personalSet">
          <th scope="row" >{{index+1}}</th>
          <!-- could include a v-if to add dataset to masterset -->
          <th scope="row" @click="statistics(dset.data)">{{dset.name}}</th>
          <th scope="row"><button class="btn-danger" @click="remove(dset)">x</button><button v-if="admin" class="btn-info" @click="moveMaster(dset)">u</button></th>
        </tr>
      </tbody>
    </table>
    <h3>Master Dataset from Firebase</h3>
    <table class="table">
      <thead style="background-color:lightgray">
        <tr>
          <th scope="col">#</th>
          <th scope="col">DataSet</th>
          <th v-if="admin"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(dset, index) in masterSet">
          <th scope="row" >{{index+1}}</th>
          <!-- could include a v-if to add dataset to masterset -->
          <th scope="row" @click="statistics(dset.data)">{{dset.name}}</th>
          <th scope="row" v-if="admin"><button class="btn-danger" @click="removeMaster(dset)">x</button></th>
        </tr>
      </tbody>
    </table>
    <div class="modal fade" id="myModal3" role="dialog">
      <div class="modal-dialog">
        <!-- Modal content-->
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Click on two variables to plot (2 numerical or 1 categorical and 1 numerical)</h4>
          </div>
          <div class="modal-body">
            <div v-if="categorical">
              <p>Categorical Variables</p>
              <ul>
                <li v-for="title in categorical" @click="addedVar(title, 'cat')">{{title}}</li>
              </ul>
            </div>
            <div v-if="numerical">
              <p v-if="numerical">Numerical Variables</p>
              <ul>
                <li v-for="title in numerical" @click="addedVar(title, 'num')">{{title}}</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default closer" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <div id="funDiv"></div>
  </div>

</template>

<script>
import * as d3 from 'd3'
var firebase = require('firebase');

export default {
  name: 'user',
  data () {
    return {
      categorical: [],
      numerical: [],
      num: 0,
      cat: 0,
      dset: [],
      chosen: []
    }
  },
  props: [
    'admin',
    'masterSet',
    'personalSet',
    'id'
  ],
  methods: {
    setFireBase(key, val){
      firebase.database().ref("/"+key).set(val);
    },
    removeMaster(dset){
      var num = this.masterSet.indexOf(dset);
      this.masterSet.splice(num, 1);
      this.setFireBase("datasets", this.masterSet);
    },
    moveMaster(dset){
      this.masterSet.push(dset);
      this.setFireBase("datasets", this.masterSet);
      //setFireBase
      this.remove(dset);
    },
    remove(dset){
      var num = this.personalSet.indexOf(dset);
      this.personalSet.splice(num, 1);
      this.setFireBase(id+"database", this.personalSet);
    },
    addedVar(header, type){
      if(type == "num"){
        this.num++;
        if(this.chosen.indexOf(header) != -1){
          this.num--;
          return;
        }
        this.chosen.push({
          type: type,
          head: header
        });
      }else{
        this.cat++;
        if(this.cat == 2){
          this.cat--;
          return;
        }
        this.chosen.push({
          type: type,
          head: header
        });
      }
      //satisfied
      if(this.num+this.cat == 2){
        $('#myModal3').modal('toggle');
        this.runGraph();
      }
    },
    runGraph(){
      var headerx;
      var headery;
      var scatter = false;
      if(this.chosen[0].type == "cat"){
        headerx = this.chosen[0].head;
        headery = this.chosen[1].head;
      }
      else if(this.chosen[1].type == "cat"){
        headerx = this.chosen[1].head;
        headery = this.chosen[0].head;
      }else{
        headerx = this.chosen[0].head;
        headery = this.chosen[1].head;
        scatter = true;
      }
      if(!scatter){
        var x = [];
        var y = [];
        for (var i = 0; i < this.dset.length; i++){
          x.push(this.dset[i][headerx]);
          y.push(this.dset[i][headery]);
        }
        var data = [
          {
            histfunc: "sum",
            y: y,
            x: x,
            type: "histogram",
            name: "sum"
          }
        ]
        var layout = {
          xaxis: {
            title: headerx
          },
          yaxis: {
            title: headery
          },
          title: headerx + " vs " + headery
        };
        Plotly.newPlot('funDiv', data, layout)
      }else{
        var trace = {
          x: [],
          y: [],
          mode: 'markers',
          type: 'scatter',
          marker: { size: 6 }
        };
        for (var i = 0; i < this.dset.length; i++){
          trace.x.push(this.dset[i][headerx]);
          trace.y.push(this.dset[i][headery]);
        }
        var data = [trace];
        var layout = {
          xaxis: {
            title: headerx
          },
          yaxis: {
            title: headery
          },
          title: headerx + " vs " + headery
        };

        Plotly.newPlot('funDiv', data, layout);
      }

    },
    statistics(dataset){
      this.dset = dataset;
      this.num = 0;
      this.cat = 0;
      this.categorical = [];
      this.numerical = [];
      this.chosen = [];
      var entries = d3.entries(dataset[0]);       // considering first entry only for column names
      for (var k = 0; k < entries.length; k++) {
        if (isNaN(entries[k].value)) {  // string --> categorical
          this.categorical.push(entries[k].key);
        } else {
          this.numerical.push(entries[k].key);
        }
      }
      $('#myModal3').modal('toggle');
    },
    // csv file parsed!
    onFileChange(e){
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length){
        return;
      }
      var reader = new FileReader();
      var filename = files[0].name;
      var vm = this;
      vm.$tester = []
      reader.onload = (e) => {
        d3.csvParse(reader.result, function(data){
          //console.log(data);
          vm.$tester.push(data);
        });
        if(vm.personalSet == null){
          vm.personalSet = [];
        }
        vm.personalSet.push({
          name: filename,
          data: vm.$tester});
          vm.setFireBase(vm.id+"database", vm.personalSet);
        }
        reader.readAsText(files[0]);
        //push file to firebase later on
      }
    }
  }
  </script>
  <style scoped>
  h1, h3, p{
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  h1, h3, p{
    margin-top: 3%;
    text-align: center;
  }
  #hierarchy{
    padding-top: 5%;
    padding-bottom: 10%;
    background-color: #efefef;
  }
  .table {
    text-align: center;
    color: #2c3e50;
    padding-bottom: 3%;
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
  li:hover{
    color: blue;
  }
  </style>
