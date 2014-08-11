(function() {
  return {
    onReady : function(data) {
    // console.log(data);
    // var feature = data.feature;
    // $("." + feature + " .spinning-wheel").css({
    // "width" : "30px",
    // "height" : "30px",
    //      });
    },
    onDone : function(data) {
      var feature = data.feature;
      var overlay = $("." + feature + " .spinner");
      $("." + feature + " .spinning-wheel").fadeOut(400, function() {
        overlay.height(overlay.height());
        overlay.width(overlay.width());
        overlay.css({
          "position" : "absolute",
          "z-index" : "9999999999999",
        });
        setTimeout(function() {
          overlay.fadeOut(1000, function() {
            overlay.remove();
          });
        }, 200);
      });
    }
  }
}());