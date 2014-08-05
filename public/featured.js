// TODO check unused feature and undeclared feature
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var appendChild = function(label, parent) {
	parent = parent || {};
	parent[label] = {};
	return parent[label];
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var next = function(node) {
	var tmp = [];
	var children = Object.keys(node);
	children.map(function(child) {
		tmp.push({
			context : node,
			name : child
		});
	});
	return tmp;
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
String.prototype.repeat = function(n) {
	if (n == 0) return "";
	return Array(n + 1).join(this);
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var breadthfirstTailRec = function(children, level) {
	console.debug("=================================");
	if (children.length != 0) {
		var nextChildren = [];
		children.map(function(child) {
			console.debug(child.name);
			next(child.context[child.name]).map(function(c) {
				nextChildren.push(c);
			});
		});
		breadthfirstTailRec(nextChildren, level + 1);
	}
};
var breadthfirst = function(context, name) {
	console.debug("=================================");
	console.debug(name);
	breadthfirstTailRec(next(context));
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var loadScript = function(scriptURL, callback) {
	var ready = false;
	var script = document.createElement("script");
	script.onload = script.onreadystatechange = function() {
		if (!ready && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
			ready = true;
			callback(scriptURL);
		}
	};
	script.src = scriptURL;
	var head = document.head;
	if (!head) document.body.insertAdjacentElement("beforeBegin", document.createElement("head"));
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(script);
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var loadFeatureDescription = function(context, parentPath, featureName, callback) {

	var url = path(parentPath, featureName) + "features.json";
	// console.info("loading : " + url);

	$.getJSON(url).done(function(data) {
		Object.keys(data).map(function(childFeature) {
			appendChild(childFeature, context);
		});
	}).fail(function() {
		console.error("Error while loading/parsing : " + url);
	}).always(function() {
		callback(context, parentPath, featureName);
	});
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var loadFeature = function(context, parentPath, featureName, callback) {
	var prefix = path(parentPath, featureName);
	data = {};
	$.when($.get(prefix + "styles.css"), $.get(prefix + "fragment.html")).then(function(styles, fragment) {
		data.html = fragment[0];
		data.styles = styles[0];
		callback(data);
	}, function() {
		console.error("Error while loading : " + path + ".css");
	});
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var loadFeatureScript = function(context, parentPath, featureName, callback) {
	var prefix = path(parentPath, featureName);
	loadScript(prefix + "protocol.js", function(url) {
		// console.info("loading script: " + url);
		// console.debug(window[featureName]);
		var protocol = new window[featureName]["protocol"]();
		// console.debug(protocol);
		var worker = new Worker(prefix + "main.js");
		worker.addEventListener('message', function(e) {
			protocol.handle(e)
		}, false);
		callback();
	});
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var render = function(context, parentPath, featureName, data, callback) {
	console.info("rendering " + featureName);
	$("head").append("<style>" + data.styles + "</style>");
	var $html = $(data.html);
	var images = $html.find("img");

	var rewritingPathPrefix = path(parentPath, featureName) + "assets" + "/";
	var pattern = /^\.\/assets\/(.*)/;

	images.map(function(i, e) {
		var src = $(e).attr("src");
		var match = src.match(pattern);
		if (match != null) {
			var suffix = match[1];
			console.info("rewriting image src for " + suffix)
			$(e).attr("src", rewritingPathPrefix + suffix);
		}
	});

	images.bind("error", function() {
		// TODO extract constant
		$(this).attr("alt", this.src);
		$(this).attr("src", "/i404.png");
	});

	$("#" + featureName).replaceWith($html);
	$("#" + featureName).hide();
	$("#" + featureName).fadeIn(875, callback);
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var path = function(parentPath, featureName) {
	return parentPath + "features/" + featureName + "/";
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js", function() {

	var root = appendChild("/");
	var home = appendChild("home", root);

	var initialContext = home;
	var initialPath = window.location.origin + "/";
	var initialFeatureName = "home";

	var callbackForChildren = function(context, parentPath, featureName) {
		var children = Object.keys(context);
		children.map(function(child) {
			var np = path(parentPath, featureName);
			loadFeatureDescription(context[child], np, child, function(context, parentPath, featureName) {
				loadFeature(context, parentPath, featureName, function(data) {
					render(context, parentPath, featureName, data, function() {
						loadFeatureScript(context, parentPath, featureName, function() {
							callbackForChildren(context, parentPath, featureName);
						})
					});
				});
			});
		});
	}

	loadFeatureDescription(initialContext, initialPath, initialFeatureName, function(context, parentPath, featureName) {
		loadFeature(context, parentPath, featureName, function(data) {
			render(context, parentPath, featureName, data, function() {
				loadFeatureScript(context, parentPath, featureName, function() {
					callbackForChildren(context, parentPath, featureName);
				});
			});
		});
	});

	// TODO ? get notfified when it's over
	setTimeout(function() {
		breadthfirst(root, "/");
	}, 5000);

});
/*------------------------------------------------------------------8<------------------------------------------------------------------*/