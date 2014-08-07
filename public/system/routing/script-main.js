// TODO !!! use workspace
var routing = {};
routing.protocol = function(featureName, children, callback) {
  this.featureName = featureName;
  this.children = children;
  this.callback = callback;
};
routing.protocol.prototype = {
  constructor : routing.protocol,
  handle : function(e) {
    var data = e.data;
    if (e.data === this.featureName) {
      this.callback(this.featureName, this.children);
    }
  }
};

(function() {
  var mainFeature = window.location.hash.substring(1);// || "home";
  window.location.hash = mainFeature;
  window.addEventListener("hashchange", function(e) {
    if (mainFeature != window.location.hash.substring(1)) {
      window.location.reload(e.newUrl);
    }
  }, false);
}());