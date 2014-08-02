var truc = {};
truc.protocol = function() {};
truc.protocol.prototype = {
	constructor : truc.protocol,
	handle : function(e) {
		console.log("truc protocol handling : " + e.data.type);
	}
};