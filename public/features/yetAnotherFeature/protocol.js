var yetAnotherFeature = {};
yetAnotherFeature.protocol = function(featureName, children, callback) {
  this.featureName = featureName;
  this.children = children;
  this.callback = callback;
};
yetAnotherFeature.protocol.prototype = {
  constructor : yetAnotherFeature.protocol,
  handle : function(e) {
    var data = e.data;
    if (e.data === this.featureName) {
      this.callback(this.featureName, this.children);
    }
  }
};