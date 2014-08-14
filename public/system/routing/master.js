(function() {
  var mainFeature = window.location.hash.substring(1);
  window.location.hash = mainFeature;
  window.addEventListener("hashchange", function(e) {
    if (mainFeature != window.location.hash.substring(1)) {
      window.location.reload(e.newUrl);
    }
  }, false);
}());