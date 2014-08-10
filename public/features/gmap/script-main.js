(function() {

  return {

    onReady : function(data) {
      // console.info("gmap is ready !");

      // this.postMessage({
      // type : "unknownMessage",
      // data : {feature: this.name}
      // });

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