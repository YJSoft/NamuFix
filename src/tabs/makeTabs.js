function makeTabs() {
  var div = document.createElement("div");
  div.className = "nf-tabs";
  div.innerHTML = "<ul></ul>";
  var ul = div.querySelector("ul");
  return {
    tab: function(text) {
      var item = document.createElement("li");
      item.innerHTML = text;
      item.addEventListener('click', function() {
        var selectedTabs = div.querySelectorAll('li.selected');
        for (var i = 0; i < selectedTabs.length; i++) {
          selectedTabs[i].className = selectedTabs[i].className.replace(/selected/mg, '');
        }
        item.className = "selected";
      });
      ul.appendChild(item);
      return {
        click: function(callback) {
          item.addEventListener('click', callback);
          return this;
        },
        selected: function() {
          if (item.className.indexOf('selected') == -1) item.className += ' selected';
          return this;
        }
      };
    },
    get: function() {
      return div;
    }
  };
}
