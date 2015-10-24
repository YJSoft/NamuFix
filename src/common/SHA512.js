function SHA512(strToHash) {
  var shaObj = new jsSHA("SHA-512", "TEXT");
  shaObj.update(strToHash);
  var hash = shaObj.getHash("HEX");
}
