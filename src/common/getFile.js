function getFile(callback, isMultiple) {
  if (typeof isMultiple === "undefined") isMultiple = false;
  var fileInput = document.createElement("input");
  fileInput.setAttribute("type", "file");
  fileInput.accept = "image/*";
  fileInput.multiple = isMultiple;
  fileInput.style.visiblity = "hidden";
  fileInput.addEventListener("change", function(evt) {
    callback(evt.target.files, function() {
      fileInput.parentNode.removeChild(fileInput);
    });
  });
  document.body.appendChild(fileInput);
  fileInput.click();
}
