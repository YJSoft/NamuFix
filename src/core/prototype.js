if (typeof Array.prototype.forEach === "undefined") {
  Array.prototype.forEach = function(callback) {
    var index = 0;

    function recursiveLoop() {
      var now = index++;
      if (now < this.length) {
        callback(this[now], now, this);
      } else {
        return;
      }
      recursiveLoop();
    }
    recursiveLoop();
  };
}
if (typeof Array.prototype.contains === "undefined") {
  Array.prototype.contains = function(item) {
    return this.indexOf(item) != -1;
  };
}
if (typeof Array.prototype.remove === "undefined") {
  Array.prototype.remove = function(item) {
    var removed = this;
    while (true) {
      var index = removed.indexOf(item);
      if (index < 0) break;
      removed = removed.splice(index, 1);
    }
    return removed;
  }
}
