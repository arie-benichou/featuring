(function() {
  return {
    onReady : function(data) {
      setTimeout(function() {
        this.postMessage({
          type : "spinner_Off",
          data : data
        });
      }.bind(this), 250);
    },
  }
}());