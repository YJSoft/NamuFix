var conditionalLoader = (function() {
  var objects = {},
    loaded = [];
  var t = {};
  t.register = function() {
    if (arguments.length == 1) {
      objects[arguments[0].pattern] = arguments[0]
    } else if(arguments.length == 2) {
      objects[arguments[0]] = arguments[1];
    }
  };
  t.load = function() {
    var patterns = Object.keys(objects);
    for (var i = 0; i < patterns.length; i++) {
      var pattern = patterns[i];
      var loadThis = false;
      loadThis = typeof pattern === "string" ? getEnvironment()[pattern] : pattern.test(location.pathname);
      if (loadThis) {
        var objToload = typeof objects[pattern] === "function" ? new objects[pattern] : objects[pattern];
        objToload.load();
        if (objToload.loaded)
          loaded.push(objToload);
      }
    }
  };
  t.clean = function() {
    var l = loaded.length;
    clearAllIntervals_s();
    for (var i = 0; i < l; i++) {
      loaded[i].unload();
    }
    loaded = loaded.splice(0, l);
  }
  return t;
})();
