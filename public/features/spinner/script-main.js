(function() {
  return {
    onReady : function(data) {
      console.log("Hello from " + "'" + this.name + "'");
    },
    onSpinnerOff : function(data) {
      var feature = data.feature;
      var overlay = document.querySelector("." + feature + " .spinner");
      document.querySelector("." + feature + " .spinning-wheel").setAttribute("style", "display:none");
      //      .fadeOut(400, function() {
      //        overlay.height(overlay.height());
      //        overlay.width(overlay.width());
      //        overlay.css({
      //          "position" : "absolute",
      //          "z-index" : "9999999999999",
      //        });
      setTimeout(function() {
        //overlay.fadeOut(1000, function() {
        overlay.setAttribute("style", "display:none");
        //});
      }, 200);
      //      });
    }
  };
}());