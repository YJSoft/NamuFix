function recusriveFor(array, callback) {
  if (array.length < 1) return;
  var index = 0;

  function recusriveLoop() {
    var now = index++;
    if (now == array.length | now > array.length) return;
    callback(array[now], now, array.length, recusriveLoop);
  }
  recusriveLoop();
}
