var yetAnotherFeature = {};
yetAnotherFeature.protocol = function() {};
yetAnotherFeature.protocol.prototype = {
	constructor : yetAnotherFeature.protocol,
	handle : function(e) {
		console.log("yetAnotherFeature protocol handling : " + e.data.type);
		if(e.data.type == "changeBackgroungColor") {
			//$("#yetAnotherFeature").css("background-color", e.data.data);
		}
	}
};