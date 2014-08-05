var gmap = {};
gmap.protocol = function() {};
gmap.protocol.prototype = {
	constructor : gmap.protocol,
	handle : function(e) {
		console.log("gmap protocol handling : " + e.data.type);		
	}
};