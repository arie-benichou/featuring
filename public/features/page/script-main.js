(function() {
  return {
    onReady : function(data) {
      console.log("Hello from " + "'" + this.name + "'");

      setTimeout(function() {
        this.postMessage({
          type : "loadedMap",
          data : {
            feature : this.name
          }
        });
      }.bind(this), 3000);

    },
  };
}());