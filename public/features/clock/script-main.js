(function() {
  return {
    onReady : function(data) {
      console.log("Hello from " + "'" + this.name + "'");
    },
    onTime : function(data) {
      console.log(data);
      // TODO update state
      // TODO render from state
      document.querySelector(".clock .self").innerHTML = data;
    }
  };
}());