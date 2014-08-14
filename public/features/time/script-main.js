(function() {
  return {
    onReady : function(data) {
      //console.log("Hello from " + "'" + this.name + "'");
    },
    onTimeUpdate : function(data) {
      //console.log(data);
      // TODO update state
      // TODO render from state
      document.querySelector(".time .self").innerHTML = data;
    }
  };
}());