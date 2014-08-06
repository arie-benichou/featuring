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
    $.when($.get(prefix + "styles.css"), $.get(prefix + "fragment.html")).then(function(styles, fragment) {
      data.html = fragment[0];
      data.styles = styles[0];
      callback(data);
    }, function() {
      console.error("Error while loading : " + path + ".css");
    });
  },
  loadFeatureScript : function(featureName, children, callback) {
    var prefix = this.path(featureName);
    System.loadScript(prefix + "protocol.js", function(url) {
      var protocol = new window[featureName]["protocol"](featureName, children, callback);
      var worker = new Worker(prefix + "main.js");
      worker.addEventListener('message', function(e) {
        protocol.handle(e);
      }, false);
      worker.postMessage(featureName);
    });
  },
  render : function(featureName, data, callback) {
    $("head").append("<style>" + data.styles + "</style>");
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
    featureContainer.replaceWith($html);
    featureContainer = $("#" + featureName);
    featureContainer.hide();
    featureContainer.fadeIn(this.renderingTransitionDuration, callback);
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
System.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js", function() {

  $("body").append("<feature id='featuring'></feature>");

  new System.Featuring({
    featuresFolder : "system",
    renderingTransitionDuration : -1
  }).run("featuring", function(featureName, children) {

    console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
    console.info("Featuring");
    console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");

    var triggerForChildren = new System.Trigger(1, function(data) {
      console.info("That's all folks !");
      console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
    });

    var f = function(child) {

      new System.Featuring().run(child, function(featureName, children) {

        console.info(" . " + featureName);
        console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");

        var triggerForDirectChildren = new System.Trigger(children.length, function(data) {
          if (data.length) console.info("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~");
          data.map(function(e) {
            e.children.map(function(c) {
              ++triggerForChildren.n;
              f(c);
            });
          });
          triggerForChildren.notify();
        });

        children.map(function(child) {
          new System.Featuring().run(child, function(featureName, children) {
            console.info(" . " + featureName);
            triggerForDirectChildren.notify({
              featureName : featureName,
              children : children
            });
          });
        })

      });

    };

    // TODO use router to boot on main feature
    var main = "home";
    $("#featuring").append("<feature id='" + main + "'></feature>");

    f(main);

  });

});
/*------------------------------------------------------------------8<------------------------------------------------------------------*/