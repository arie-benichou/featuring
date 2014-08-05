var core = {};
core.protocol = function() {};
core.protocol.prototype = {
	constructor : core.protocol,
	handle : function(e) {
		console.log("core protocol handling : " + e.data.type);
	}
};