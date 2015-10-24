function getFile(callback, isMultiple, removable) {
  if (typeof isMultiple === "undefined") isMultiple = false;
  var fileInput = document.createElement("input");
  if (typeof removable !== "undefined") removable.makeRemovable(fileInput);
  fileInput.setAttribute("type", "file");
  fileInput.setAttribute("accept", "image/*");
  if (isMultiple) fileInput.setAttribute("multiple", "multiple");
  fileInput.style.visibility = "hidden";
  fileInput.addEventListener("change", function(evt) {
    callback(evt.target.files, function() {
      evt.target.parentNode.removeChild(evt.target);
    });
  });
  document.body.appendChild(fileInput);
  fileInput.click();
}
