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
  this.getLicensesAndCategories = function(callback) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://namu.wiki/Upload',
      onload: function(res) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(res.responseText, "text/html");
        var result = {
          licenses: [],
          categories: []
        };
        var licenseOptions = doc.querySelectorAll("#licenseSelect option");
        var categoryOptions = doc.querySelectorAll("#categorySelect option");
        for (var i = 0; i < licenseOptions.length; i++) {
          var licenseOption = licenseOptions[i];
          if (licenseOption.value.trim().length != 0) {
            result.licenses.push(licenseOption.value);
          }
        }
        for (var i = 0; i < categoryOptions.length; i++) {
          var categoryOption = categoryOptions[i];
          if (categoryOption.value.trim().length != 0) {
            result.categories.push(categoryOption.value);
          }
        }
        callback(result);
      }
    })
  };
}
