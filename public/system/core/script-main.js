(function() {
  return {

    onReady : function(data) {
      
      console.log("Hello from " + "'" + this.name + "'");
      console.log("Now I'm supposed to do the same with home !");
      
      var mainFeature = "home";
      var section = document.createElement("section");
      section.setAttribute("class", mainFeature);
      document.body.appendChild(section);
      document.body.style.display="none";

      new Context({
        path : "./features/",
        name : "home"
      }).run([{
        type : "start"
      }]);

    },

    onOneMore : function(data) {
      this.loading = this.loading || {};
      this.loading[data] = false;
    },

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