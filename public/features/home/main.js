self.addEventListener('message', function(e) {
	console.debug(e.data);
}, false);

self.postMessage({
	type : "ready"
});