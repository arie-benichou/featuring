var gmap = {};
gmap.protocol = function(featureName, children, callback) {
  this.featureName = featureName;
  this.children = children;
  this.callback = callback;
};
gmap.protocol.prototype = {
  constructor : gmap.protocol,
  handle : function(e) {
    var data = e.data;
    if (e.data === this.featureName) {
      this.callback(this.featureName, this.children);
    }
  }
};

// TODO use messaging
setTimeout(function() {
  var overlay = $("#spinner");
  var parent = overlay.parent();
  overlay.width(parent.width());
  overlay.height(parent.height() / 2);
  overlay.css({
    "position" : "absolute",
    "z-index" : "9999999999999",
  });
  setTimeout(function() {
    overlay.fadeOut(1000, function() {
      overlay.remove();
    });
  }, 200);
  $(".spinner").fadeOut(400, function() {});  
}, 2000);
