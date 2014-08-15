(function() {
  return {
    onReady : function(data) {
      console.info("core is ready");
    },
    onFirstRoute : function(name) {
      
      // TODO émettre un message 404 pour le router si la feature n'existe pas
      console.log("onFirstRoute : " + name);
      
      var section = document.createElement("section");
      section.setAttribute("class", name);
      //section.style.opacity = 0;
      //section.style.transition = "opacity 1s ease-in-out";
      document.body.appendChild(section);
      
      var ctx = new this.context.constructor({path : "./features/", name : name, isFirst: true});
      ctx.run([ {type : "start"} ]);
      
    }
  };
}());