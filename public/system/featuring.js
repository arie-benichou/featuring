(function() {
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  var System = System || {};
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  System.loadScript = function(scriptURL, callback) {
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
  System.Trigger = function(n, cb) {
    this.i = 0;
    this.n = n;
    this.cb = cb;
    this.acc = [];
    if (n === 0) this.cb(this.acc);
  };
  System.Trigger.prototype = {
    constructor : System.Trigger,
    notify : function(data) {
      this.acc.push(data);
      if (++this.i === this.n) this.cb(this.acc);
    }
  };
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  System.Featuring = function(data) {
    var data = data || {};
    this.featuresFolder = data.featuresFolder || "features";
    this.initialPath = data.initialPath || window.location.origin;
    this.isOuter = data.isOuter;
    this.notFoundImage = data.notFoundImage || this.path("featuring") + "assets/i404.png";
  };
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  System.Featuring.prototype = {
    constructor : System.Featuring,
    path : function(featureName) {
      return [ this.initialPath, this.featuresFolder, featureName, "" ].join("/");
    },
    loadFeatureDescription : function(parent, featureName, callback) {
      var url = this.path(featureName) + "features.json";
      $.getJSON(url).done(function(data) {
        var children = [];
        Object.keys(data).map(function(childFeature) {
          if (data[childFeature]) children.push(childFeature);
        });
        callback(children);
      }.bind(this)).fail(function() {
        console.error("Error while loading/parsing : " + url);
      });
    },
    loadFeature : function(parent, featureName, callback) {
      var prefix = this.path(featureName);
      var data = {};
      // TODO extract constants
      if (this.isOuter) {
        $.when($.get(prefix + "style-outer.css"), $.get(prefix + "style-inner.css"), $.get(prefix + "fragment.html"),
            $.ajax({
              url : prefix + "script-main.js",
              dataType : "text"
            })

        // ,$.ajax({
        // url : prefix + "script-worker.js",
        // dataType : "text"
        // })

        ).then(function(rootStyles, styles, fragment, script1, script2) {
          data.html = fragment[0];
          data.styles = rootStyles[0] + " " + styles[0];
          data.scripts = {
            protocol : script1[0],
          // onReady : script2[0]
          };
          callback(data);
        }, function() {
          console.error("Error while loading : " + featureName);
        });
      } else {
        $.when($.get(prefix + "style-inner.css"), $.get(prefix + "fragment.html"), $.ajax({
          url : prefix + "script-main.js",
          dataType : "text"
        })

        // ,$.ajax({
        // url : prefix + "script-worker.js",
        // dataType : "text"
        // })

        ).then(function(styles, fragment, script1, script2) {
          data.html = fragment[0];
          data.styles = styles[0];
          data.scripts = {
            protocol : script1[0],
          // onReady : script2[0]
          };
          callback(data);
        }, function() {
          console.error("Error while loading : " + featureName);
        });
      }
    },
    run : function(context, featureName, callback) {
      var path = this.path(featureName);
      this.loadFeatureDescription(context, featureName, function(children) {
        this.loadFeature(context, featureName, function(data) {
          callback(featureName, children, data, path);
        }.bind(this));
      }.bind(this));
    }
  };
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  var newWorker = function(context) {
    var p = context.data.scripts.protocol;
    var obj = eval(p);
    if (!obj || typeof (obj) !== "object") {
      obj = {
        onReady : function(data) {}
      };
    }
    var worker = new Worker(context.path + "script-worker.js");
    worker.context = context;
    worker.name = context.name;
    var handle = function(e) {
      var type = e.data.type;
      var data = e.data.data;
      var method = "on" + type.charAt(0).toUpperCase() + type.slice(1);
      if (method in obj) {
        // if (data.way && data.way === "down") {
        // data.way = "none";
        // data.worker = worker.name;
        // }
        (obj[method].bind(worker))(e.data.data);
      } else {
        // console.log(worker.name + " : unhandled message '" + e.data.type + "'
        // : ", e.data);
        var data = e.data;
        data.way = data.way || "up";
        if (data.way == "up") {
          // console.log("going up");
          var ctx = worker.context.parent;
          // TODO use a root worker as sentinel
          if (ctx.worker)
            ctx.worker.postMessage(data);
          else {
            // console.log("going down");
            data.way = "down";
          }
        }
        if (data.way == "down") {
          var ctx = worker.context.parent;
          Object.keys(worker.context.children).map(function(e) {
            var ctx = worker.context.children[e];
            ctx.worker.postMessage(data);
          })
        }
        // if (data.way == "none") {
        // console.log("message has been handled by " + data.worker);
        // }
      }
    };
    worker.addEventListener('message', handle.bind(worker), false);
    worker.postMessage({
      type : "ready",
      data : {
        feature : context.name
      }
    });
    return worker;
  };
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  var assets = function(context) {
    var $html = $(context.data.html);
    var images = $html.find("img");
    var rewritingPathPrefix = context.path + "assets" + "/";
    var pattern = /^\.\/assets\/(.*)/;
    images.map(function(i, e) {
      var src = $(e).attr("src");
      var match = src.match(pattern);
      if (match != null) {
        var suffix = match[1];
        $(e).attr("src", rewritingPathPrefix + suffix);
      }
    });
    images.bind("error", function() {
      $(this).attr("alt", this.src);
      $(this).attr("src", this.notFoundImage);
    });
    return $html;
  };
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  var _render = function(context) {
    var featureContainer = $("." + context.name);
    $("head").append("<style>" + context.data.styles + "</style>");
    var $html = assets(context);
    featureContainer.append($html);
  };
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  var render = function(context) {
    _render(context);
    var worker = newWorker(context);
    context.worker = worker;
    Object.keys(context.children).map(function(e) {
      render(context.children[e]);
    });
  };
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  var enableFeature = function(context, featureName, configuration, parentTrigger) {
    console.info(" . " + featureName);
    context.children[featureName] = {
      name : featureName,
      ordinal : Object.keys(context.children).length + 1,
      children : {},
      parent : context
    };
    new System.Featuring(configuration).run(context, featureName, function(featureName, children, data, path) {
      context.children[featureName].path = path;
      context.children[featureName].data = data;
      var childTrigger = new System.Trigger(children.length, function(data) {
        parentTrigger.notify(featureName);
      });
      configuration.isOuter = false;
      children.map(function(child) {
        enableFeature(context.children[featureName], child, configuration, childTrigger);
      });
    });
  };
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  var userFeatures = function() {
    var userContext = {
      root : {
        name : "root",
        ordinal : 1,
        children : {}
      }
    };
    console.info(" user features : ");
    console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
    var trigger = new System.Trigger(1, function(data) {
      console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
      console.info("Done : ", userContext);
      console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
      render(userContext.root.children.home);
    });
    var configuration = {
      isOuter : true,
      featuresFolder : "features"
    };
    // TODO use messaging
    var mainFeature = window.location.hash.substring(1);
    if (mainFeature == "") {
      configuration.isOuter = false;
      mainFeature = "home";
    }
    $("body").append("<section class='" + mainFeature + "'></section>");
    enableFeature(userContext.root, mainFeature, configuration, trigger);
  };
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
  console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
  console.info("Featuring - version 0.1.4");
  console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
  System.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js", function() {
    var systemContext = {
      root : {
        name : "root",
        ordinal : 1,
        children : {}
      }
    };
    var trigger = new System.Trigger(1, function(data) {
      render(systemContext.root.children.core);
      console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
      console.info("Done : ", systemContext);
      console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
      userFeatures();
    });
    console.info(" system features :");
    console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
    enableFeature(systemContext.root, "core", {
      featuresFolder : "system"
    }, trigger);
  });
  /*------------------------------------------------------------------8<------------------------------------------------------------------*/
}());