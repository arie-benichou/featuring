(function() {

	console.log("starting application...");

	var origin = window.location.origin + "/";

	var loadScript = function(scriptURL, callback) {
		var ready = false;
		var script = document.createElement("script");
		script.onload = script.onreadystatechange = function() {
			if (!ready && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
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

	loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js", function(scriptURL) {


		var loadFeature = function(context, featureName, callback, parentPath, id) {
			context[featureName] = {
				children : {}
			};
			var path = parentPath + "features/" + featureName + "/";
			var url = path + featureName + ".json";
			context[featureName].path = path;

			console.log("loading : " + url);
			$.get(url, function(data) {
				if (Object.keys(data).length) {
					console.log("feature '" + featureName + "' has children");
					callback(context[featureName], featureName, data, path, id);
				} else {
					console.log("feature '" + featureName + "' has no children");
				}
				console.log(context);
			});
		};

		var context = {
			root : {
				children : {}
			}
		};
		var featureName = "home";
		var parentPath = origin;

		var onFeatureLoaded = function(context, featureName, data, path, id) {
			clearTimeout(id);
			var id = setTimeout(timeout1, 225);
			Object.keys(data).map(function(subFeatureName) {
				loadFeature(context.children, subFeatureName, onFeatureLoaded, path, id);
			});
		};

		loadFeature(context.root.children, featureName, onFeatureLoaded, parentPath, 0);

		var timeout1 = function() {

			console.log("It's over !");

			var loadFeatureHtml = function(prefix, ctx) {
				$.get(prefix + ".html", function(data) {
					ctx.html = data;
				});
			};

			var loadStyle = function(styleURL, callback) {
				var ready = false;
				var style = document.createElement("link");
				style.rel = "stylesheet";
				style.type = "text/css";
				style.onload = style.onreadystatechange = function() {
					if (!ready && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
						ready = true;
						callback(styleURL);
					}
				};
				style.href = styleURL;
				var n = document.getElementsByTagName("head").length;
				if (n == 0) document.body.insertAdjacentElement("beforeBegin", document.createElement("head"));
				document.head.appendChild(style);
			};

			// TODO might need to be ordered
			var loadFeatureStyle = function(prefix, ctx) {
				loadStyle(prefix + ".css", function(url) {
					console.log("loading style: " + url);
				});
				/*
				 * $.get(prefix + ".css", function(data) { ctx.styles = data;
				 * });
				 */
			};

			var loadFeature = function(prefix, featureName, ctx, id) {
				loadFeatureHtml(prefix, ctx);
				loadFeatureStyle(prefix, ctx);
				// loadFeatureScript(prefix, featureName, ctx);
				if (Object.keys(ctx.children).length) {
					loadChildrenFeature(ctx.children, id);
				}
			};

			var loadChildrenFeature = function(ctx, id) {
				clearTimeout(id);
				var id = setTimeout(timeout2, 225);
				for (child in ctx) {
					var prefix = ctx[child].path + child;
					loadFeature(prefix, child, ctx[child], id);
				}
			};

			var timeout2 = function() {

				console.log("html loaded !");
				console.debug(context.root.children);

				var flatten = function(ctx, html) {
					var childContext = [];
					html.find("feature").each(function(k, v) {
						var feature = $(v).attr("id");
						var featureHtml = ctx.children[feature].html;
						var node = html.find("#" + feature);
						$(node).replaceWith(featureHtml);
						var hasChild = Object.keys(ctx.children[feature].children).length > 0;
						if (hasChild && childContext.length == 0) {
							childContext.push(ctx.children[feature]);
						}
					});
					return {
						"html" : html[0].outerHTML,
						"childContext" : childContext
					}
				};

				var flattenRecursive = function(pass) {
					if (pass.childContext.length == 0) return pass.html;
					return flattenRecursive(flatten(pass.childContext[0], $(pass.html)));
				};

				var html = flattenRecursive(flatten(context.root.children.home, $(context.root.children.home.html)));

				console.log(html);
				$("body").find("feature").replaceWith(html);
				// $("body").append(html);

				// TODO load after html ?
				// TODO might need to be ordered
				var loadFeatureScript = function(prefix, featureName, ctx) {
					// TODO ? shared worker
					loadScript(prefix + ".protocol.js", function(url) {
						console.log("loading script: " + url);
						console.log(window[featureName]);
						var protocol = new window[featureName]["protocol"]();
						console.log(protocol);
						var worker = new Worker(prefix + ".js");
						worker.addEventListener('message', function(e) {
							protocol.handle(e)
						}, false);
						// worker.postMessage({
						// 'type' : 'test',
						// });
					});
					/*
					 * loadScript(prefix + ".js", function(url) {
					 * console.log("loading script: " + url); }); $.get(prefix +
					 * ".js", function(data) { ctx.script = data; });
					 */
				};

				var loadWorker = function(prefix, featureName, ctx, id) {
					loadFeatureScript(prefix, featureName, ctx);
					if (Object.keys(ctx.children).length) {
						loadChildrenWorker(ctx.children, id);
					}
				};

				var loadChildrenWorker = function(ctx, id) {
					clearTimeout(id);
					var id = setTimeout(timeout3, 225);
					for (child in ctx) {
						var prefix = ctx[child].path + child;
						loadWorker(prefix, child, ctx[child], id);
					}
				};

				var timeout3 = function() {
					console.log("OK !!!");
					$("#overlay").fadeOut(633, function() {
						$("#overlay").remove();
					});
				};

				loadChildrenWorker(context.root.children, 0);

			};

			loadChildrenFeature(context.root.children, 0);

		};

	});

}());