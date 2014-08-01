self.addEventListener('message', function(e) {
	console.debug(e.data);
}, false);
self.postMessage({
	type : "ready"
});
setInterval(function() {
	var time = new Date();
	self.postMessage({
		type : "time",
		data : ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + ":"
				+ ("0" + time.getSeconds()).slice(-2)
	});
}, 1000 * 1);