var clock = {};
clock.protocol = function() {};
clock.protocol.prototype = {
	constructor : clock.protocol,
	handle : function(e) {
		console.log("clock protocol handling : " + e.data.type);		
		if(e.data.type == "time") {
			$("#clock").html(e.data.data);
			// notifier un worker de la réponse du nouveau state
			// ce worker doit notifier à son tour un autre worker qui met à jour l'output de la feature
			// avoir un worker qui s'occupe du dom
		}
	}
};