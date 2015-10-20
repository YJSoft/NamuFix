function bsModal() {
  var root = document.createElement("div");
  var controller = {};

  root.className = "modal";
  root.style.display = "none";
  root.setAttribute("role", "dialog");
  root.innerHTML = '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">NamuFix</h4></div><div class="modal-body"><p>오류?</p></div><div class="modal-footer"></div></div></div>';

  var modalBody = root.querySelector(".modal-body");
  var body = document.body;
  body.appendChild(root);
  controller.title = function(value) {
    root.querySelector(".modal-header > .modal-title").textContent = value;
  };
  controller.content = function(callback) {
    callback(modalBody);
  };
  controller.button = function(text, callback) {
    var btn = document.createElement("button");
    btn.className = "btn btn-default";
    btn.setAttribute("type", "button");
    btn.innerHTML = text;
    btn.addEventListener("click", function() {
      callback(modalBody);
    });
    root.querySelector(".modal-footer").appendChild(btn);
  };
  controller.show = function() {
    root.style.display = "block";
    root.className = "modal in";
    if (body.className.indexOf("modal-open") == -1) body.className += " modal-open";
  };
  controller.close = function() {
    root.style.display = "none";
    root.className = "modal";
    if (body.className.indexOf("modal-open") != -1) body.className = body.className.replace(/\s?modal\-open\s?/img, '');
  };
  controller.destroy = function() {
    if (root.parentNode != null) root.parentNode.removeChild(root);
  }
  return controller;
}
