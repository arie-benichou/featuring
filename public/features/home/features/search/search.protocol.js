var search = {};
search.protocol = function() {};
search.protocol.prototype = {
	constructor : search.protocol,
	handle : function(e) {
		console.log("search protocol hanlding : " + e.data.type);
		if (e.data.type == "ready") {
//			setInterval(function() {
//				var q = $("#search input").val();
//				$("#search").append("search : " + q);
//			}, 1000);
		}
	}
};