var search = {};
search.protocol = function() {};
search.protocol.prototype = {
	constructor : search.protocol,
	handle : function(e) {
		console.log("search protocol hanlding : " + e.data.type);
		if(e.data.type == "changeBackgroungColor") {
			$("#search").css("background-color", e.data.data);
		}
	}
};