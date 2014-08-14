(function(configuration) {
  var loadScript = function(scriptURL, succes, failure) {
    var succes = succes || function() {}, failure = failure || function() {}, ready = false;
    var script = document.createElement("script");
    script.onerror = function() {
      failure(scriptURL);
    };
    script.onload = script.onreadystatechange = function() {
      if (!ready && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
        ready = true, succes(scriptURL);
      }
    };
    if (!document.head) document.body.insertAdjacentElement("beforeBegin", document.createElement("head"));
    script.src = scriptURL, document.head.appendChild(script);
  };
  return function(parameters) {
    loadScript(configuration.promiseProvider, function() {
      loadScript(configuration.contextProvider, function() {
        console.info("Featured - version " + configuration.version);
        promise.ajaxTimeout = configuration.timeout;
        var section = document.createElement("section"); // TODO à revoir
        section.setAttribute("class", parameters.name || configuration.name);
        document.body.appendChild(section);
        new system.core.context({
          path : parameters.path || configuration.path,
          name : parameters.name || configuration.name
        }).run([ {
          type : "start"
        } ]);
      });
    });
  };
}({
  version : "0.1.5",
  path : "./system/",
  name : "core",
  promiseProvider : "./system/core/assets/promise.min.js",
  contextProvider : "./system/core/assets/context.js",
  timeout : 1000 * 10
}))({});