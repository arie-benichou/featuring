var clock = {};
clock.protocol = function() {};
clock.protocol.prototype = {
	consclocktor : clock.protocol,
	handle : function(e) {
		console.log("clock protocol hanlding : " + e.data.type);		
		if(e.data.type == "time") {
			//document.location.reload();
			$("#clock").html(e.data.data);
		}		
	}
};