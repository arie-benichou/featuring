self.addEventListener('message', function(e) {
  self.postMessage(e.data);
}, false);
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var updateTime = function(newTime) {
  self.postMessage({
    type : "time",
    data : ("0" + newTime.getHours()).slice(-2) + ":" + ("0" + newTime.getMinutes()).slice(-2)
  });
};
updateTime(new Date());
var f0 = function() {
  var time = new Date();
  if (time.getSeconds() == 0) {
    clearInterval(id);
    updateTime(time);
    setInterval(function() {
      updateTime(new Date());
    }, 1000 * 60);
  }
};
var id = setInterval(f0, 1000 * 1);
/*------------------------------------------------------------------8<------------------------------------------------------------------*/