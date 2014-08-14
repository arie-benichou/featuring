(function(configuration) {

  var nullFunction = function() {};

  var loadScript = function(scriptURL, succes, failure) {
    var succes = succes || nullFunction, failure = failure || nullFunction, ready = false;
    var script = document.createElement("script");
    script.onerror = function() {
      failure(scriptURL);
    };
    script.onload = script.onreadystatechange = function() {
      if (!ready && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
        ready = true;
        succes(scriptURL);
      }
    };
    if (!document.head) document.body.insertAdjacentElement("beforeBegin", document.createElement("head"));
    script.src = scriptURL;
    document.head.appendChild(script);
  };

  var newWorker = function() { // TODO ? FeaturedWorker class
    var makeHandler = function(worker, protocol) {
      return function(e) {
        var message = e.data;
        var method = configuration.workerInflector(message.type);
        if (method in protocol) {
          (protocol[method].bind(worker))(message.data);
          if (message.wave === true) {
            this.childrenNames.map(function(childName) {
              this.children[childName].worker.postMessage(message);
            }.bind(this));
          }
        } else {
          if (!(message.wave === true)) {
            if (this.parent) { // TODO use a root worker as a sentinel
              message.way = "up";
              this.parent.worker.postMessage(message);
            } else {
              console.debug("unhandled ascending message ", message);
              message.way = "down";
              message.wave = true;
              this.childrenNames.map(function(childName) {
                console.log(childName);
                this.children[childName].worker.postMessage(message);
              }.bind(this));
            }
          }
          else {
            this.childrenNames.map(function(childName) {
              console.log(childName);
              this.children[childName].worker.postMessage(message);
            }.bind(this));
          }
        }
      }.bind(this);
    }.bind(this);
    var blob = new Blob([ this.data.scripts.server ], {
      type : "text/javascript"
    });
    var url = window.URL.createObjectURL(blob);
    var worker = new Worker(url);
    worker.onmessage = function(e) {
      console.debug("Received: ", e.data);
    };
    var protocol = eval(this.data.scripts.client);

    protocol[configuration.workerInflector("start")] = function(childName) {
      this.loaded = [];
      this.context.fetchChildren(function(parent, children) {
        this.context.childrenNames = children;
        this.context.runChildren(parent, children);
      }.bind(this));
    };

    protocol[configuration.workerInflector("render")] = function(childName) {
      this.context.preRender();
    };

    protocol[configuration.workerInflector(this.name)] = function(childName) {
      if (childName != null) {
        console.info("loaded '" + childName + "'");
        this.loaded.push(childName);
      }
      if (this.loaded.length === this.context.childrenNames.length) {
        console.info("All direct children of '" + this.context.name + "' have been loaded");
        this.context.childrenNames.map(function(name) {
          this.context.children[name].worker.postMessage({
            type : "start",
            data : {}
          });
        }.bind(this));
        this.postMessage({
          type : "oneLess",
          data : this.context.name
        });
      }
    };
    var client = makeHandler(worker, protocol);
    worker.addEventListener("message", client.bind(worker), false);
    worker.name = this.name, worker.context = this;
    return worker;
  };

  var run = function(messages) {
    messages.push({
      type : "render"
    });
    var p1 = promise.get(this.path + this.name + "/" + configuration.clientScriptName);
    var p2 = promise.get(this.path + this.name + "/" + configuration.serverScriptName);
    promise.join([ p1, p2 ]).then(function(results) {
      if (results[0][0] || results[1][0]) return;
      this.data.scripts = {};
      this.data.scripts.client = results[0][1];
      this.data.scripts.server = results[1][1];
      this.worker = this.newWorker();
      messages.map(function(message) {
        this.worker.postMessage(message);
      }.bind(this));
    }.bind(this));
  };

  var Context = function(object) {
    this.name = object.name || configuration.name;
    this.path = object.path || configuration.path;
    this.data = {};
    this.children = {};
    this.parent = object.parent || null;
    this.worker = null;
  };

  Context.prototype = {
    constructor : Context,
    newWorker : newWorker,
    run : run,

    fetchChildren : function(callback) {
      promise.get(this.path + this.name + "/" + configuration.childrenFeaturesFileName).then(function(error, text, xhr) {
        var childFeatureNames = JSON.parse(text);
        var children = [];
        Object.keys(childFeatureNames).map(function(name) {
          if (childFeatureNames[name]) children.push(name);
        });
        callback(this, children);
      }.bind(this));
    },

    newChild : function(parent, name) {
      return new this.constructor({
        path : this.path,
        name : name,
        parent : parent
      });
    },

    runChildContext : function(parent, childContext) {

      this.worker.postMessage({
        type : "oneMore",
        data : childContext.name
      });

      childContext.run([ {
        type : this.name,
        data : childContext.name
      } ]);

      this.children[childContext.name] = childContext;
    },

    runChildren : function(parent, children) {
      if (children.length) {
        children.map(function(childName) {
          this.runChildContext(parent, this.newChild(parent, childName));
        }.bind(this));
      } else {
        this.worker.postMessage({
          type : this.name
        });
      }
    },

    preRender : function() {
      var assets = function(context) {
        var template = document.createElement('template');
        template.innerHTML = context.data.html;
        var clone = document.importNode(template.content, true);
        images = clone.querySelectorAll("img");
        var rewritingPathPrefix = context.path + context.name + "/assets" + "/";
        var pattern = /^\.\/assets\/(.*)/;
        for ( var i = 0, n = images.length; i < n; ++i) {
          var e = images.item(i);
          var src = e.getAttribute("src");
          var match = src.match(pattern);
          if (match != null) {
            var suffix = match[1];
            e.setAttribute("src", rewritingPathPrefix + suffix);
            var src = e.getAttribute("src");
          }
        }
        return clone;
      };
      var _preRender = function(context) {
        console.log("rendering " + context.name);
        var featureContainer = document.querySelector("." + context.name);
        var style = document.createElement("style");
        style.innerHTML = context.data.styles;
        var html = assets(context);
        context.template = {
          style : style,
          html : html
        };
        // TODO ? use a shadow dom
        document.head.appendChild(style);
        featureContainer.appendChild(html);
      };
      var styles = this.path + this.name + "/style-inner.css";
      var fragment = this.path + this.name + "/fragment.html";
      var p1 = promise.get(styles);
      var p2 = promise.get(fragment);
      promise.join([ p1, p2 ]).then(function(results) {
        if (results[0][0] || results[1][0]) return;
        this.data.styles = results[0][1];
        this.data.html = results[1][1];
        _preRender(this);
      }.bind(this));
    }

  };

  return function(parameters) {
    console.info("Featured - version " + configuration.version);
    loadScript(configuration.promiseProvider, function() {
      promise.ajaxTimeout = configuration.timeout;

      var mainFeature = "core";
      var section = document.createElement("section");
      section.setAttribute("class", mainFeature);
      document.body.appendChild(section);

      new Context({
        path : parameters.path || configuration.path,
        name : parameters.name || configuration.name
      }).run([ {
        type : "start"
      } ]);
    }, nullFunction);
  };

}({
  version : "0.1.5",
  path : "./system/",
  name : "core",
  promiseProvider : "./system/core/assets/promise.min.js",
  timeout : 1000 * 10,
  clientScriptName : "script-main.js",
  serverScriptName : "script-worker.js",
  workerIsReadyType : "ready",
  workerInflector : function(type) {
    return "on" + type.charAt(0).toUpperCase() + type.slice(1);
  },
  childrenFeaturesFileName : "features.json"
}))({
//path : "./features/",
//name : "clock"
});