var truc = {};
truc.protocol = function() {};
truc.protocol.prototype = {
	constructor : truc.protocol,
	handle : function(e) {
		console.log("truc protocol hanlding : " + e.data.type);
	}
};