(function() {
  return {
    onReady : function(data) {
    //document.querySelector("." + this.name).style.opacity = 1;

    // TODO ! use a shadow dom and pass parent container
    //      console.log(i);
    //      console.log(j);
    //      for(var i =0; i<10000; ++i) {
    //        for(var j =0; j<100000; ++j) {
    //        } 
    //      }
    //      console.log(i);
    //      console.log(j);

    },
    onTimeUpdate : function(data) {
      document.querySelector(".time .self").innerHTML = data;
    },
  };
}());