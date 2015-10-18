function bsModal() {
  var root = document.createElement("div");
  var controller = {};

  root.className = "modal";
  root.style.display = "none";
  root.setAttribute("role", "dialog");
  root.innerHTML = '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">NamuFix</h4></div><div class="modal-body"><p>오류?</p></div><div class="modal-footer"></div></div></div>';

  var body = root.querySelector(".modal-body");
  document.body.appendChild(root);
  controller.title = function(value) {
    root.querySelector(".modal-header > .modal-title").textContent = value;
  };
  controller.content = function(callback) {
    callback(body);
  };
  controller.button = function(text, callback) {
    var btn = document.createElement("button");
    btn.className = "btn btn-default";
    btn.setAttribute("type", "button");
    btn.innerHTML = text;
    btn.addEventListener("click", function() {
      callback(body);
    });
    root.querySelector(".modal-footer").appendChild(btn);
  };
  controller.show = function() {
    root.style.display = "block";
    root.className = "modal in";
  };
  controller.close = function() {
    root.style.display = "none";
    root.className = "modal";
  };
  return controller;
}
