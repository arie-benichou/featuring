/*------------------------------------------------------------------8<------------------------------------------------------------------*/
var System = System || {};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
System.Featuring = function(data) {
  this.initialFeatureName = data.initialFeatureName || "home";
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
System.Featuring.prototype = {

  constructor : System.Featuring,

  appendChild : function(label, parent) {
    parent = parent || {};
    parent[label] = {};
    return parent[label];
  },

  next : function(node) {
    var tmp = [];
    var children = Object.keys(node);
    children.map(function(child) {
      tmp.push({
        context : node,
        name : child
      });
    });
    return tmp;
  },

  breadthfirstTailRec : function(children) {
    console.debug("=================================");
    if (children.length != 0) {
      var nextChildren = [];
      children.map(function(child) {
        console.debug(child.name);
        this.next(child.context[child.name]).map(function(c) {
          nextChildren.push(c);
        });
      }.bind(this));
      this.breadthfirstTailRec(nextChildren);
    }
  },

  breadthfirst : function(context, name) {
    console.debug("=================================");
    console.debug(name);
    this.breadthfirstTailRec(this.next(context));
  },

  loadScript : function(scriptURL, callback) {
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
  },

  loadFeatureDescription : function(context, parentPath, featureName, callback) {
    var url = this.path(parentPath, featureName) + "features.json";
    $.getJSON(url).done(function(data) {
      Object.keys(data).map(function(childFeature) {
        if (data[childFeature]) this.appendChild(childFeature, context);
      }.bind(this));
    }.bind(this)).fail(function() {
      console.error("Error while loading/parsing : " + url);
    }).always(function() {
      callback(context, parentPath, featureName);
    });
  },

  loadFeature : function(context, parentPath, featureName, callback) {
    var prefix = this.path(parentPath, featureName);
    data = {};
    $.when($.get(prefix + "styles.css"), $.get(prefix + "fragment.html")).then(function(styles, fragment) {
      data.html = fragment[0];
      data.styles = styles[0];
      callback(data);
    }, function() {
      console.error("Error while loading : " + path + ".css");
    });
  },

  loadFeatureScript : function(context, parentPath, featureName, callback) {
    var prefix = this.path(parentPath, featureName);
    this.loadScript(prefix + "protocol.js", function(url) {
      var protocol = new window[featureName]["protocol"]();
      var worker = new Worker(prefix + "main.js");
      worker.addEventListener('message', function(e) {
        protocol.handle(e)
      }, false);
      callback();
    });
  },

  // TODO check unused feature and undeclared feature
  render : function(context, parentPath, featureName, data, callback) {
    console.info("rendering " + featureName);
    $("head").append("<style>" + data.styles + "</style>");
    var $html = $(data.html);
    var images = $html.find("img");
    var rewritingPathPrefix = this.path(parentPath, featureName) + "assets" + "/";
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
      $(this).attr("alt", this.src);
      $(this).attr("src", "/i404.png"); // TODO extract constant
    });
    $("#" + featureName).replaceWith($html);
    $("#" + featureName).hide();
    $("#" + featureName).fadeIn(875, callback);
  },

  path : function(parentPath, featureName) {
    return parentPath + "features/" + featureName + "/";
  },

  callbackForParent : function(context, parentPath, featureName) {
    this.loadFeatureDescription(context, parentPath, featureName, function(context, parentPath, featureName) {
      this.loadFeature(context, parentPath, featureName, function(data) {
        // TODO à revoir...
        $("body").append("<feature id='" + featureName + "'></feature>");
        this.render(context, parentPath, featureName, data, function() {
          this.loadFeatureScript(context, parentPath, featureName, function() {
            this.callbackForChildren(context, parentPath, featureName);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },

  callbackForChildren : function(context, parentPath, featureName) {
    var children = Object.keys(context);
    children.map(function(child) {
      this.loadFeatureDescription(context[child], parentPath, child, function(context, parentPath, featureName) {
        this.loadFeature(context, parentPath, featureName, function(data) {
          this.render(context, parentPath, featureName, data, function() {
            this.loadFeatureScript(context, parentPath, featureName, function() {
              this.callbackForChildren(context, parentPath, featureName);
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },

  run : function() {
    this.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js", function() {
      var initialPath = window.location.origin + "/";
      var root = this.appendChild("/");
      var initialContext = this.appendChild(this.initialFeatureName, root);
      this.callbackForParent(initialContext, initialPath, this.initialFeatureName);
      // TODO ? get notfified when it's over
      setTimeout(function() {
        this.breadthfirst(root, "/");
      }.bind(this), 5000);
    }.bind(this));
  }
  
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
new System.Featuring({
  initialFeatureName : "home",
}).run();
/*------------------------------------------------------------------8<------------------------------------------------------------------*/