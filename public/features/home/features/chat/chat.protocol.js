var chat = {};
chat.protocol = function() {};
chat.protocol.prototype = {
	constructor : chat.protocol,
	handle : function(e) {
		console.log("chat protocol handling : " + e.data.type);
		if(e.data.type == "changeBackgroungColor") {
			//$("#chat").css("background-color", e.data.data);
		}
	}
};