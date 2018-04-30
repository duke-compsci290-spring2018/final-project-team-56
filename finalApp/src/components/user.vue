<template>
  <div id="hierarchy">
    <div class="row justify-content-center">
      <form enctype="multipart/form-data">
        <input type="file" @change="onFileChange" accept=".csv">
      </form>
    </div>
    <!-- table for the personalSet -->
    <!-- table for the masterSet -->
  </div>

</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'user',
  data () {
    return {
      yols: ''
    }
  },
  props: [
    'masterSet',
    'personalSet'
  ],
  mounted: function () {
    //this.statistics();
  },
  methods: {
    statistics(){
      console.log("fun");
      //run statistics on the perseonalSet
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
        vm.personalSet.push({
          name: filename,
          data: vm.$tester});
      }
      reader.readAsText(files[0]);
      //push file to firebase later on
    }
  }
}
</script>
<style scoped>
  #hierarchy{
    background-color: white;
  }
</style>
