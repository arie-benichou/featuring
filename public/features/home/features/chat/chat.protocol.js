var chat = {};
chat.protocol = function() {};
chat.protocol.prototype = {
	conschattor : chat.protocol,
	handle : function(e) {
		console.log("chat protocol hanlding : " + e.data.type);
	}
};