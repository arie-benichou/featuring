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
  this.renderingTransitionDuration = data.renderingTransitionDuration || 875;
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
System.Featuring.prototype = {
  constructor : System.Featuring,
  path : function(featureName) {
    return [ this.initialPath, this.featuresFolder, featureName, "" ].join("/");
  },
  loadFeatureDescription : function(featureName, callback) {
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
  loadFeature : function(featureName, callback) {
    var prefix = this.path(featureName);
    data = {};
    
    // TODO extract constants
    if (this.isOuter) {
      $.when($.get(prefix + "style-outer.css"), $.get(prefix + "style-inner.css"), $.get(prefix + "fragment.html")).then(function(rootStyles, styles, fragment) {
        data.html = fragment[0];
        data.styles = rootStyles[0] + " " + styles[0];
        callback(data);
      }, function() {
        console.error("Error while loading : " + path + ".css");
      });
    } else {
      $.when($.get(prefix + "style-inner.css"), $.get(prefix + "fragment.html")).then(function(styles, fragment) {
        data.html = fragment[0];
        data.styles = styles[0];
        callback(data);
      }, function() {
        console.error("Error while loading : " + path + ".css");
      });
    }
    
  },
  loadFeatureScript : function(featureName, children, callback) {
    var prefix = this.path(featureName);
    // TODO extract constants
    System.loadScript(prefix + "script-main.js", function(url) {
      var protocol = new window[featureName]["protocol"](featureName, children, callback);
      var worker = new Worker(prefix + "script-worker.js");
      worker.addEventListener('message', function(e) {
        protocol.handle(e);
      }, false);
      worker.postMessage(featureName);
    });
  },
  render : function(featureName, data, callback) {
    
    console.info("###############################################################");
    console.info("rendering "  + featureName);
    $("head").append("<style>" + data.styles + "</style>");
    console.log(data.html);
    
    var $html = $(data.html);
    
    var images = $html.find("img");
    var rewritingPathPrefix = this.path(featureName) + "assets" + "/";
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
    
    var featureContainer = $("#" + featureName);
    console.debug(featureContainer);
    
    featureContainer.replaceWith($html);
    
    featureContainer = $("#" + featureName);
    featureContainer.hide();
    featureContainer.fadeIn(this.renderingTransitionDuration);
    setTimeout(callback, this.renderingTransitionDuration - 1);
    console.info("###############################################################");    
    //callback();
  },
  run : function(featureName, callback) {
    // TODO populate and pass a mutable object context
    this.loadFeatureDescription(featureName, function(children) {
      this.loadFeature(featureName, function(data) {
        this.render(featureName, data, function() {
          this.loadFeatureScript(featureName, children, callback);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};
/*------------------------------------------------------------------8<------------------------------------------------------------------*/
console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
console.info("Featuring - version 0.1.4");
console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");

System.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js", function() {
  
  var enableFeature = function(featureName, configuration, parentTrigger) {
    
    console.info(" . " + featureName);
    
    new System.Featuring(configuration).run(featureName, function(featureName, children) {
      
      var childTrigger = new System.Trigger(children.length, function(data) {
        parentTrigger.notify(featureName);
      });
      
      configuration.isOuter = false;
      
      children.map(function(child) {
        enableFeature(child, configuration, childTrigger);
      });
      
    });
    
  };

  var userFeatures = function() {
    
    console.info(" user features : ");
    
    var trigger = new System.Trigger(1, function(data) {
      console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
      console.info("Done");
      console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
    });
    
    var configuration = {
      isOuter : true,
      featuresFolder : "features",
      renderingTransitionDuration : 400
    };
    
    // TODO use messaging
    var mainFeature = window.location.hash.substring(1);
    if(mainFeature == "") {
      configuration.isOuter = false;
      mainFeature = "home";
    }
    
    $("body").append("<feature id='" + mainFeature + "'></feature>");
    enableFeature(mainFeature, configuration, trigger);
  };
  
  var trigger = new System.Trigger(1, function(data) {
    console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
    userFeatures();
  });
  
  console.info(" system features :");
  
  enableFeature("core", {
    featuresFolder : "system",
    renderingTransitionDuration : -1
  }, trigger);
  
});
/*------------------------------------------------------------------8<------------------------------------------------------------------*/