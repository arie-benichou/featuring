(function() {
  return {
    onReady : function(data) {

      console.info(" * System Features : OK");

      // TODO à revoir
      var section = document.createElement("section");
      section.setAttribute("class", "home");
      section.style.opacity = 0;
      section.style.transition = "opacity 1s ease-in-out";
      document.body.appendChild(section);
      
      new this.context.constructor({
        path : "./features/",
        name : "home"
      })
      .run([ {
        type : "start"
      } ]);

    },

    // TODO à revoir
    onOneMore : function(data) {
      this.loading = this.loading || {};
      this.loading[data] = false;
    },

    // TODO à revoir    
    onOneLess : function(data) {
      this.loading = this.loading || {};
      this.loading[data] = true;
      for ( var name in this.loading) {
        if (this.loading[name] === true) delete this.loading[name];
      }
      if (Object.keys(this.loading).length === 0) {
        this.postMessage({
          type : "ready",
          wave : true
        });
      }
    }

  };
}());