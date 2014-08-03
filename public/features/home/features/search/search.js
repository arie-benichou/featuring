self.addEventListener('message', function(e) {
	console.debug(e.data);
}, false);

self.postMessage({
	type : "ready"
});

var i = 1;

/*
setInterval(function() {

	var color = (i % 2 == 0) ? "white" : "black";
	++i;

	self.postMessage({
		type : "changeBackgroungColor",
		data : color
	});

}, 1000 * 2);
*/