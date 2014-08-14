var system = system || {};
system.core = system.core || {};

system.core.context = function(object) {

  this.name = object.name;
  this.path = object.path;
  
  this.data = {};
  this.children = {};
  this.parent = object.parent || null;
  this.worker = null;

  // TODO à revoir
  this.clientScriptName = "master.js";
  this.serverScriptName = "slave.js";
  this.workerIsReadyType = "ready";
  this.childrenFeaturesFileName = "features.json";
  this.workerInflector = function(type) {
    return "on" + type.charAt(0).toUpperCase() + type.slice(1);
  };

  // TODO à revoir
  this.notFoundImage = object.notFoundImage || "./system/core/assets/i404.png";

};

system.core.context.prototype = {

  constructor : system.core.context,

  fileDoesNotExist : function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, false), xhr.send();
    return xhr.status == 204;
  },

  wave : function(message) {
    console.debug("'" + this.name + "'" + " : waving to children : " + "'" + message.type + "'");
    message.wave = true;
    delete message.geyser;
    this.childrenNames.map(function(childName) {
      this.children[childName].worker.postMessage(message);
    }.bind(this));
  },

  geyser : function(message) {
    console.debug("'" + this.name + "'" + " : forwarding to parent : " + "'" + message.type + "'");
    message.geyser = true;
    this.parent.worker.postMessage(message);
  },

  newWorker : function() { // TODO ? FeaturedWorker class
    var makeHandler = function(worker, protocol) {
      return function(e) {
        var message = e.data;
        var method = this.workerInflector(message.type);
        if (method in protocol) {
          (protocol[method].bind(worker))(message.data);
          if (message.wave === true) this.wave(message);
        } else {
          console.debug("'" + this.name + "'" + " : does not understand : " + "'" + message.type + "'");
          if (message.wave !== true) {
            // TODO use a root worker as a sentinel
            if (this.parent)
              this.geyser(message);
            else {
              console.debug("'" + message.type + "'" + " was not handled by parents, waving to children...");
              this.wave(message);
            }
          } else
            this.wave(message);
        }
      }.bind(this);
    }.bind(this);
    var blob = new Blob([ this.data.scripts.server ], {
      type : "text/javascript"
    });
    var url = window.URL.createObjectURL(blob);
    var worker = new Worker(url);
    worker.onmessage = function(e) {
      console.debug("received : ", "'" + e.target.name + "'", " : ", e.data);
    };
    var protocol = eval(this.data.scripts.client);

    protocol[this.workerInflector("start")] = function(childName) {
      this.loaded = [];
      this.context.fetchChildren(function(parent, children) {
        this.context.childrenNames = children;
        this.context.runChildren(parent, children);
      }.bind(this));
    };

    protocol[this.workerInflector("render")] = function(childName) {
      this.context.render();
    };

    protocol[this.workerInflector(this.name)] = function(childName) {
      if (childName != null) {
        //console.info("loaded '" + childName + "'");
        this.loaded.push(childName);
      }
      if (this.loaded.length === this.context.childrenNames.length) {
        //console.info("All direct children of '" + this.context.name + "' have been loaded");
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
  },

  run : function(messages) {
    
    messages.push({
      type : "render"
    });

    var p1 = promise.get(this.path + this.name + "/" + this.clientScriptName);
    var p2 = promise.get(this.path + this.name + "/" + this.serverScriptName);
    promise.join([ p1, p2 ]).then(function(results) {
      if (results[0][0] || results[1][0]) return;
      this.data.scripts = {};
      this.data.scripts.client = results[0][1] || system.core.context.defaults.client;
      this.data.scripts.server = results[1][1] || system.core.context.defaults.server;
      this.worker = this.newWorker();
      messages.map(function(message) {
        this.worker.postMessage(message);
      }.bind(this));
    }.bind(this));

  },

  fetchChildren : function(callback) {
    promise.get(this.path + this.name + "/" + this.childrenFeaturesFileName).then(function(error, text, xhr) {
      var childFeatureNames = JSON.parse(text || system.core.context.defaults.features);
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

  //  imagesNotFound : function(fragment) {
  //    var i404 = this.notFoundImage;
  //    var f = function(e) {
  //      var src = this.getAttribute(src);
  //      this.setAttribute("alt", "not found : " + src);
  //      this.setAttribute("src", i404);
  //      var src = this.getAttribute(src);
  //      return false;
  //    };
  //    var images = fragment.querySelectorAll("img");
  //    for ( var i = 0, n = images.length; i < n; ++i) {
  //      var image = images.item(i);
  //      image.onerror = f;
  //    }
  //    return fragment;
  //  },

  assets : function(context) {
    var template = document.createElement('template');
    template.innerHTML = context.data.html;
    var images = template.content.querySelectorAll("img");
    var rewritingPathPrefix = context.path + context.name + "/assets" + "/";
    var pattern = /^\.\/assets\/(.*)/;
    for ( var i = 0, n = images.length; i < n; ++i) {
      var image = images.item(i);
      image.onerror = function() {};
      var src = image.getAttribute("src"); // TODO use a Shadow DOM
      var match = src.match(pattern);
      if (match != null) {
        var suffix = match[1];
        image.setAttribute("src", rewritingPathPrefix + suffix);
      }
    }
    var fragment = document.importNode(template.content, true);
    return fragment;
  },

  _render : function(context) {
    var featureContainer = document.querySelector("." + context.name);
    var style = document.createElement("style");
    style.innerHTML = context.data.styles;

    // TODO à revoir
    //var fragment = this.imagesNotFound(this.assets(context));
    var fragment = this.assets(context);

    context.template = {
      style : style,
      html : fragment
    };
    // TODO ? use a shadow dom
    document.head.appendChild(style);
    featureContainer.appendChild(fragment);
  },

  render : function() {
    var styles = this.path + this.name + "/style.css";
    var fragment = this.path + this.name + "/fragment.html";
    var p1 = promise.get(styles);
    var p2 = promise.get(fragment);
    promise.join([ p1, p2 ]).then(function(results) {
      if (results[0][0] || results[1][0]) return;
      this.data.styles = results[0][1] || system.core.context.defaults.inner;
      this.data.html = results[1][1] || system.core.context.defaults.fragment;
      this._render(this);
    }.bind(this));
  }

};