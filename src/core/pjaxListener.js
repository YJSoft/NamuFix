(function() {
  // callbacks
  function callbackWhenStarted() {
    clearAllIntervals_s();
    conditionalLoader.clean();
  }

  function callbackWhenFinished() {
    conditionalLoader.load();
  }

  // create elements
  var pjaxButton = document.createElement("button"), // pjax:start
    pjaxButton2 = document.createElement("button"); // pjax:end
  var scriptElement = document.createElement("script");

  // configure button
  [pjaxButton, pjaxButton2].forEach(function(item, index) {
    item.style.display = "none";
    item.id = "nfFuckingPJAX".concat(index);
    item.addEventListener("click", index == 0 ? callbackWhenStarted : callbackWhenFinished);
    document.body.appendChild(item);
  });

  // configure script
  scriptElement.setAttribute("type", "text/javascript");
  scriptElement.innerHTML = '$(document).bind("pjax:end", function(){document.querySelector("button#nfFuckingPJAX1").click();});' +
    '$(document).bind("pjax:start", function(){document.querySelector("button#nfFuckingPJAX0").click();});';

  // add script
  document.head.appendChild(scriptElement);
})();
