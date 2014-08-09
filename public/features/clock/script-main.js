var clock = {};
clock.protocol = function(featureName, children, callback) {
  this.featureName = featureName;
  this.children = children;
  this.callback = callback;
};
clock.protocol.prototype = {
  constructor : clock.protocol,
  handle : function(e) {
    var data = e.data;
    if (e.data === this.featureName) {
      this.callback(this.featureName, this.children);
    }
    /*------------------------------------------------------------------8<------------------------------------------------------------------*/
    else if (e.data.type === "time") {
      $(".clock .self").html(e.data.data);
    }
    /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  }
};