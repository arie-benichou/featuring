var contacts = {};
contacts.protocol = function() {};
contacts.protocol.prototype = {
	constructor : contacts.protocol,
	handle : function(e) {
		console.log("contacts protocol handling : " + e.data.type);
	}
};