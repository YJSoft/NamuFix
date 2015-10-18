function NamuUploader() {
  var _funclocal = this;
  this.onuploaded = function() {};
  this.onstarted = function() {};
  this.upload = function(options) {
    _funclocal.onstarted(options);
    var query = new FormData();
    query.append('file', options.file);
    query.append('document', options.name);
    query.append('text', options.description);
    query.append('log', options.log);
    query.append('baserev', 0);
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://namu.wiki/Upload',
      data: query,
      onload: function(res) {
        var parser = new DOMParser();
        options.successed = parser.parseFromString(res.responseText, "text/html").querySelector("p.wiki-edit-date") != null;
        _funclocal.onuploaded(options);
      }
    })
  }
}
