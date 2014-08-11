self.addEventListener('message', function(e) {
  self.postMessage(e.data);
  if (e.data.type == "enableScreenSaver") {
    setTimeout(function() {
      self.postMessage({
        type : "toggleScreenSaver"
      });
    }, e.data.data);
  }
}, false);