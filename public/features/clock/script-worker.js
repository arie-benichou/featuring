var updateTime = function(newTime) {
  self.postMessage({
    type : "time",
    data : ("0" + newTime.getHours()).slice(-2) + ":" + ("0" + newTime.getMinutes()).slice(-2)
  });
};
self.addEventListener('message', function(e) {
  self.postMessage(e.data);
  // TODO server protocol
  if (e.data.type === "ready") {
    updateTime(new Date());
    var f = function() {
      var time = new Date();
      if (time.getSeconds() == 0) {
        clearInterval(id);
        updateTime(time);
        setInterval(function() {
          updateTime(new Date());
        }, 1000 * 60);
      }
    };
    var id = setInterval(f, 1000 * 1);
  }
}, false);