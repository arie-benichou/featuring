(function() {
  return {
    onReady : function(data) {
      setTimeout(function() {
        this.postMessage({
          type : "loadedMap",
          data : {
            feature : this.name
          }
        });
      }.bind(this), 2000);
    },
    onLoadedMap : function(data) {
      this.postMessage({
        type : "done",
        data : data
      });
    }
  }
}());