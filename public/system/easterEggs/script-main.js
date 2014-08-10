(function() {
  $("body").keypress(function(event) {
    if (event.which == 10) {
      console.log("Hello you !");
    }
  });
}());