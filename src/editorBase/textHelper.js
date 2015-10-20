function textHelper(textarea, callback) {
  var r = {};
  r.value = function() {
    if (arguments.length == 0) return textarea.value;
    else textarea.value = arguments[0];
  };
  r.selectionText = function() {
    if (arguments.length == 0) return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    else {
      var s = textarea.selectionStart;
      var t = textarea.value.substring(0, textarea.selectionStart);
      t += arguments[0];
      t += textarea.value.substring(textarea.selectionEnd);
      textarea.value = t;
      textarea.focus();
      textarea.selectionStart = s;
      textarea.selectionEnd = s + arguments[0].length;
    }
  };
  r.appendSelection = function(r) {
    r.selectionText(r.selectionTest().concat(r));
  }
  r.selectionStart = function() {
    if (arguments.length == 0) return textarea.selectionStart;
    else textarea.selectionStart = arguments[0];
  };
  r.selectionTest = function(r) {
    return this.selectionText().search(r) != -1;
  };
  r.appendTest = function(v) {
    this.selectionText(this.selectionText().concat(v));
  }
  r.valueTest = function(r) {
    return this.value().search(r) != -1;
  };
  r.selectionEnd = function() {
    if (arguments.length == 0) return textarea.selectionEnd;
    else textarea.selectionEnd = arguments[0];
  };
  r.selectionLength = function() {
    if (arguments.length == 0) return (textarea.selectionEnd - textarea.selectionStart);
    else textarea.selectionEnd = textarea.selectionStart + arguments[0];
  };
  r.select = function(s, e) {
    textarea.focus();
    textarea.selectionStart = s;
    if (typeof e !== 'undefined') textarea.selectionEnd = e;
  }
  r.WrapSelection = function(l, r) {
    if (arguments.length == 1) var r = l;
    var t = this.selectionText();
    if (typeof t === 'undefined' || t == null || t == '') t = '내용';
    var s = this.selectionStart()
    t = l + t + r;
    this.selectionText(t);
    this.select(s + l.length, s + t.length - r.length)
  };
  r.ToggleWrapSelection = function(l, r) {
    function isWrapped(t) {
      return t.indexOf(l) == 0 && t.lastIndexOf(r) == (t.length - r.length);
    }
    if (arguments.length == 1) var r = l;
    var t = this.selectionText();
    var t_m = this.value().substring(this.selectionStart() - l.length, this.selectionEnd() + r.length);
    var wrappedInSelection = isWrapped(t);
    var wrappedOutOfSelection = isWrapped(t_m);
    if (wrappedInSelection) {
      var s = this.selectionStart();
      this.selectionText(t.substring(l.length, t.length - r.length));
      this.select(s, s + t.length - l.length - r.length);
    } else if (wrappedOutOfSelection) {
      var s = this.selectionStart() - l.length;
      this.selectionStart(s);
      this.selectionEnd(s + t_m.length);
      this.selectionText(t_m.substring(l.length, t_m.length - r.length));
      this.select(s, s + t_m.length - l.length - r.length);
    } else {
      this.WrapSelection(l, r);
    }
  };
  callback(r);
}
