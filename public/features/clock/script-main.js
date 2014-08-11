(function() {
  return {
    onReady : function(data) {
      //console.info("clock is ready !");
    },
    onTime : function(data) {
      $(".clock .self").html(data);
    }
  };
}());