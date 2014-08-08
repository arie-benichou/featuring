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
//$("#gmap").css({
//  border : "1px solid red"
//});
setTimeout(function() {
  $("#gmap .self").hide();
  $("#gmap .self").css({
    opacity : 1
  });
  $("#gmap .self").fadeIn(1000, function() {
//    $("#gmap").css({
//      border : "none"
//    });
  });
}, 1500);