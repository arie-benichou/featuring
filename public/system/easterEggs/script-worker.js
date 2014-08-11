var f= function() {
  self.postMessage({
    type : "toggleScreenSaver"
  });
};
self.addEventListener('message', function(e) {
  self.postMessage(e.data);
  if (e.data.type == "enableScreenSaver") {
    clearTimeout(f);
    setTimeout(f, e.data.data);
  }
}, false);