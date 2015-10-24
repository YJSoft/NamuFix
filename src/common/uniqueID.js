function uniqueID() {
  var r = Math.floor(Math.random() * Date.now());
  r += "\n" + location.href;
  r += "\n" + document.href;
  return SHA512(r);
}
