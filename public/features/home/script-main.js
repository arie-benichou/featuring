(function() {



  return {

    onReady : function(data) {
      console.log("Hello from " + "'" + this.name + "'");
      //this.context.preRender();
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
        document.body.style.display="";
        this.postMessage({
          type : "ready",
          wave : true
        });
      }
    }

  }
}());