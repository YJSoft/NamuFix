conditionalLoader.register("IsDiscussing", function() {
  var observer = null;

  function colorize() {

  }
  this.load = function() {
    var container = document.querySelector("#res-container");
    if (container == null) {
      this.loaded = false;
      return;
    }
    this.loaded = true;
    observer = new MutationObserver(function(objs) {
      objs.forEach(function(obj) {
        console.log(obj.type);
      })
    });
    observer.observe(container, {
      childList: true
    })
  }
  this.unload = function() {
    observer.disconnect();
  }
});
