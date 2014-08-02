var home = {};
home.protocol = function() {};
home.protocol.prototype = {
	constructor : home.protocol,
	handle : function(e) {
		console.log("home protocol handling : " + e.data.type);
		if(e.data.type == "ready") {
			//document.location.reload();
		}
	}
};