(function(global) {
  var intervalList = [];
  global.setInterval_s = function(func, interval) {
    var no = setInterval(func, interval);
    intervalList.push(no);
    return no;
  }
  global.clearInterval_s = function(no) {
    if (intervalList.contains(no)) {
      clearInterval(no);
    }
    intervalList = intervalList.remove(no);
  }
  global.clearAllIntervals_s = function() {
    var l = intervalList.length;
    for (var i = 0; i < l; i++) {
      clearInterval(intervalList[i]);
    }
    intervalList = intervalList.splice(0, l);
  }
})(this);
