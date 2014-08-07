var core = {};
core.protocol = function(featureName, children, callback) {
  this.featureName = featureName;
  this.children = children;
  this.callback = callback;
};
core.protocol.prototype = {
  constructor : core.protocol,
  handle : function(e) {
    var data = e.data;
    if (e.data === this.featureName) {
      this.callback(this.featureName, this.children);
    }
  }
};