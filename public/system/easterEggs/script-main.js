(function() {
  return {
    onReady : function(data) {

      var id = 0;
      $("body").keypress(function(event) {
        if (event.which == 10) {
          this.postMessage({
            type : "toggleScreenSaver"
          });
        }
      }.bind(this));

      this.postMessage({
        type : "enableScreenSaver",
        data : 1000 * 60 * 1
      });

    },
    onToggleScreenSaver : function(data) {
      if ($(".home").css("display") == "none") {
        $("#" + id).fadeOut(400, function() {
          $("#" + id).remove();
          $(".home").fadeIn(1600);
        });
        this.postMessage({
          type : "enableScreenSaver",
          data : 1000 * 60 * 1
        });
      } else {
        id = new Date().getTime();
        $(".home").fadeOut(3200, function() {
          $("body").append("<div id='" + id + "' style='display: none;'>Press [Ctrl] + [Enter] to quit screensaver");
          $("#" + id).fadeIn(400);
        });
      }
    }
  }
}());