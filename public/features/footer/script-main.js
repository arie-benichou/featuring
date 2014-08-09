var footer = {};
footer.protocol = function(featureName, children, callback) {
  this.featureName = featureName;
  this.children = children;
  this.callback = callback;
};
footer.protocol.prototype = {
  constructor : footer.protocol,
  handle : function(e) {
    var data = e.data;
    if (e.data === this.featureName) {
      this.callback(this.featureName, this.children);
    }
  }
};

(function() {
  // TODO use messaging
  var feature = "footer";
  setTimeout(function() {
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
  }, 5000);
}());