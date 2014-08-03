(function() {

	console.info("Loading features metadata...");

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
			var path = parentPath + "features/" + featureName + "/"; // TODO
			// extract
			// constant
			var url = path + "features.json"; // TODO extract constant
			context[featureName].path = path;
			// TODO ? distinction beetween service and application fragment
			context[featureName].flattened = false;
			console.info("loading : " + url);
			console.debug(context);
			$.getJSON(url).done(function(data) {
				console.debug(data);
				if (Object.keys(data).length) {
					console.info("feature '" + featureName + "' has children");
					callback(context[featureName], featureName, data, path, id);
				} else {
					console.info("feature '" + featureName + "' has no children");
				}
			}).fail(function() {
				clearTimeout(id);
				console.error("Error while loading/parsing : " + url);
			});
		};

		var onFeatureLoaded = function(context, featureName, data, path, id) {
			clearTimeout(id);
			var id = setTimeout(timeout1, 225);
			Object.keys(data).map(function(subFeatureName) {
				loadFeature(context.children, subFeatureName, onFeatureLoaded, path, id);
			});
		};

		var timeout1 = function() {

			console.info("Features metadata loaded !");

			var loadFeatureHtml = function(prefix, ctx) {
				$.get(prefix + "fragment.html").done(function(data) { // TODO
					// extract
					// constant
					ctx.html = data;
				}).fail(function() {
					console.error("Error while loading : " + prefix + ".html");
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
				loadStyle(prefix + "styles.css", function(url) { // TODO
					// extract
					// constant
					console.info("loading style: " + url);
				});
			};

			var loadFeature = function(prefix, featureName, ctx, id) {
				loadFeatureHtml(prefix, ctx);
				loadFeatureStyle(prefix, ctx);
				if (Object.keys(ctx.children).length) {
					loadChildrenFeature(ctx.children, id);
				}
			};

			var loadChildrenFeature = function(ctx, id) {
				clearTimeout(id);
				var id = setTimeout(timeout2, 225);
				for (child in ctx) {
					var prefix = ctx[child].path;
					loadFeature(prefix, child, ctx[child], id);
				}
			};

			var timeout2 = function() {

				console.info("HTML & CSS loaded !");
				console.debug(context.root.children);

				var flatten = function(ctx, html) {
					var childContext = [];
					html.find("feature").each(function(k, v) {
						var feature = $(v).attr("id");
						var node = html.find("#" + feature);
						if (feature in ctx.children) {
							var featureHtml = ctx.children[feature].html;
							ctx.children[feature].flattened = true;
							$(node).replaceWith(featureHtml);
							var hasChild = Object.keys(ctx.children[feature].children).length > 0;
							if (hasChild && childContext.length == 0) {
								childContext.push(ctx.children[feature]);
							}
						} else {
							console.warn("Removed undeclared feature : " + feature);
							$(node).remove();
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

				console.info("Flattening HTML...");

				var html = flattenRecursive(flatten(context.root.children.home, $(context.root.children.home.html)));

				var check = function(name, ctx, unflattened) {
					if (!ctx.flattened) {
						unflattened.push(name);
					}
					checkRecursive(ctx.children, unflattened);
				};
				var checkRecursive = function(ctx, unflattened) {
					console.debug(ctx);
					var keys = Object.keys(ctx);
					if (keys.length > 0) {
						for ( var child in ctx) {
							console.debug(child);
							check(child, ctx[child], unflattened);
						}
					}
					return unflattened;
				};
				var unusedFragment = checkRecursive(context.root.children.home.children, []);
				unusedFragment.map(function(e) {
					console.warn("Feature '" + e + "' has been declared but not used in HTML : is it a service ?");
				});

				console.info("HTML flattened !");
				console.debug(html);

				var $html = $(html);
				var images = $html.find("img");
				images.bind("error", function() {
					$(this).attr("alt", this.src);
					// TODO extract constant					
					$(this).attr("src", "/i404.png");
				});

				$("body").find("feature").replaceWith($html);
				
				// TODO might need to be ordered
				var loadFeatureScript = function(prefix, featureName, ctx) {
					// TODO ? shared worker
					// TODO extract constant
					loadScript(prefix + "protocol.js", function(url) {
						console.info("loading script: " + url);
						console.debug(window[featureName]);
						var protocol = new window[featureName]["protocol"]();
						console.debug(protocol);
						// TODO extract constant
						var worker = new Worker(prefix + "main.js");
						worker.addEventListener('message', function(e) {
							protocol.handle(e)
						}, false);
					});
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
						var prefix = ctx[child].path;
						loadWorker(prefix, child, ctx[child], id);
					}
				};

				var timeout3 = function() {
					console.info("JS loaded !");
					setTimeout(function() {
						console.info("Application is ready !");
						$("#overlay").fadeOut(375, function() {
							$("#overlay").remove();
						});
					}, 375);
				};

				console.info("Loading JS...");
				loadChildrenWorker(context.root.children, 0);
				// timeout3();

			};

			console.info("Loading HTML & CSS...");
			loadChildrenFeature(context.root.children, 0);

		};

		var context = {
			root : {
				children : {}
			}
		};
		var featureName = "home";
		var parentPath = origin;

		loadFeature(context.root.children, featureName, onFeatureLoaded, parentPath, 0);

	});

}());