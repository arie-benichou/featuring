var easterEggs = {};
easterEggs.protocol = function(featureName, children, callback) {
  this.featureName = featureName;
  this.children = children;
  this.callback = callback;
};
easterEggs.protocol.prototype = {
  constructor : easterEggs.protocol,
  handle : function(e) {
    var data = e.data;
    if (e.data === this.featureName) {
      this.callback(this.featureName, this.children);
    }
  }
};
$("body").keypress(function( event ) {
  //console.info(event.which);
  if(event.which == 10) {
    console.log("Hello you !");
  }
});