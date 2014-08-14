(function() {
  return {
    onReady : function(data) {
      //console.log("Hello from " + "'" + this.name + "'");
    },
    onLoadedMap : function(data) {
      this.postMessage({
        type : "spinnerOff",
        data : data
      });
    }
  };
}());