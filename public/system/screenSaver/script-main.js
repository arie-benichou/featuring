// TODO extract feature "Logger"
// TODO extract feature "Keyboard"
// TODO extract feature "Scheduler"
// TODO extract feature "Overlay"
(function() {
  return {
    onReady : function(data) {
      // TODO allow configuration to be injected from features.json or fragment.html
      this.delay = 1000 * 5;
      this.postMessage({
        type : "hideScreenSaver"
      });
    },
    onShowScreenSaver : function() {
      //console.debug("Showing ScreenSaver");
      this.postMessage({
        type : "cancelScheduledScreenSaver"
      });
      $("body").unbind("keypress");
      $(".home").fadeOut(500, function() {
        var screenSaverId = new Date().getTime();
        var html = "<div id='" + screenSaverId + "' style='display: none;' class='screensaver'>Press any key";
        $("body").append(html);
        $("#" + screenSaverId).fadeIn(125, function() {
          $("body").keydown(function(event) {
            this.postMessage({
              type : "hideScreenSaver",
              data : screenSaverId
            });
          }.bind(this));
        }.bind(this));
      }.bind(this));
    },
    onHideScreenSaver : function(screenSaverId) {
      //console.debug("Hiding ScreenSaver : ", screenSaverId);
      this.postMessage({
        type : "scheduleScreenSaver",
        data : this.delay
      });
      $("body").unbind("keydown");
      $("body").keypress(function(event) {
        if (event.which == 10) {
          this.postMessage({
            type : "showScreenSaver"
          });
        }
      }.bind(this));
      $("#" + screenSaverId).remove();
      $(".home").show();
    },
    onScheduleScreenSaver: function(delay) {
      //console.debug("Scheduling ScreenSaver : ", delay);    
    },
    onCancelScheduledScreenSaver: function(id) {
      //console.debug("Cancelling Scheduled ScreenSaver : ", id);    
    }    
  };
}());