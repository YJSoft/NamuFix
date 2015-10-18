conditionalLoader.register("IsEditing", function() {
  var destroyFunctions = [];
  this.load = function() {
    if (document.querySelector("textarea[readonly]")) {
      this.loaded = false;
      return;
    }
    var textarea = document.querySelector("textarea");
    var tabs = makeTabs();
    editorBase(textarea, function(editor) {
      destroyFunctions.push(function() {
        editor.destroy();
      })
      textHelper(textarea, function(textProc) {
        editor.button('T', function(c) {
          var namu = new NamuUploader();
          getFile(function(files, finish) {
            var obj = {
              file: files[0],
              name: '파일:직각삼각형.png',
              text: '[Include(틀:이미지 라이센스/PD-shape)]\n== 기본 정보 ==\n|| 저작자 || LiteHell ||\n|| 출처 || 자작 ||',
              log: "테스트"
            };
            namu.onstarted = function(o){
              console.log("=== ONSTARTED ===".concat(JSON.stringify(o)));
            }
            namu.onuploaded = function(o) {
              console.log("=== ONFINISHED ===".concat(JSON.stringify(o)));
              finish();
            }
            namu.upload(obj);
          });
        })
      });
    });
  }
  this.unload = function() {
    destroyFunctions.forEach(function(func) {
      func();
    });
  }
});
