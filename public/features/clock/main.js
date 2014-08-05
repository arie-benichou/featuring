self.addEventListener('message', function(e) {
	console.debug(e.data);
}, false);
self.postMessage({
	type : "ready"
});

var updateTime = function(newTime) {
	self.postMessage({
		type : "time",
		data : ("0" + newTime.getHours()).slice(-2) + ":" + ("0" + newTime.getMinutes()).slice(-2)
	});
};

updateTime(new Date());

var f0 = function() {
	console.info("waiting for clock synchronization...")
	var time = new Date();
	if (time.getSeconds() == 0) {
		console.info("clock is synchronized !")
		clearInterval(id);
		updateTime(time);
		setInterval(function() {
			updateTime(new Date());
		}, 1000 * 60);
	}
};

var id = setInterval(f0, 1000 * 1);