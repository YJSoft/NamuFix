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
        editor.button('<span class="ion-image"></span>', function(c) {
          var namu = new NamuUploader();
          getFile(function(files, finish) {
            if (files.length < 0) {
              alert("선택한 파일이 없습니다!");
              return;
            } else if (files.length > 1) {
              alert("파일을 한개만 선택해주세요!");
              return;
            } else {
              var options = {};
              options.file = files[0];
              options.name = files[0].length;
              options.description = "알 수 없음";
              options.log = "Uploaded via NamuFix";
            }
            var win = bsModal();
            win.title("나무위키 이미지 업로드");
            win.content(function(container) {
              container.innerHTML = '' +
                '          <label for="filename">파일 이름</label>' +
                '            <div class="input-group">' +
                '              <input type="text" class="form-control" id="filename">' +
                '            </div>' +
                '            <label for="from">출처</label>' +
                '            <div class="input-group">' +
                '              <input type="text" class="form-control" id="from">' +
                '            </div>' +
                '            <label for="datetime">날짜</label>' +
                '            <div class="input-group">' +
                '              <input type="text" class="form-control" id="datetime">' +
                '            </div>' +
                '            <label for="holder">저작자</label>' +
                '            <div class="input-group">' +
                '              <input type="text" class="form-control" id="holder">' +
                '            </div>' +
                '            <label for="copyright">저작권</label>' +
                '            <div class="input-group">' +
                '              <input type="text" class="form-control" id="copyright">' +
                '            </div>' +
                '            <label for="etc">기타</label>' +
                '            <div class="input-group">' +
                '              <input type="text" class="form-control" id="etc">' +
                '            </div>' +
                '            <label for="license">라이선스</label>' +
                '            <div class="input-group">' +
                '              <input type="text" class="form-control" id="license">' +
                '            </div>' +
                '            <label for="category">분류</label>' +
                '            <div class="input-group">' +
                '              <input type="text" class="form-control" id="category">' +
                '            </div>'
            });
            win.show();
            namu.onstarted = function(o) {

            }
            namu.onuploaded = function(o) {

            }
          })
        });
      });
    });
  }
  this.unload = function() {
    destroyFunctions.forEach(function(func) {
      func();
    });
  }
});
