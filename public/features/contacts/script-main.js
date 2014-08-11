(function() {
  return {
    onReady : function(data) {
      setTimeout(function() {
        this.postMessage({
          type : "done",
          data : data
        });
      }.bind(this), 250);
    },
  }
}());