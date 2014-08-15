(function() {
  return {
    onReady : function(data) {
      
      console.log("contacts onReady");
      
      setTimeout(function() {
        this.postMessage({type: "spinnerOff", data: this.name});
      }.bind(this), 750);
    }
  };
}());