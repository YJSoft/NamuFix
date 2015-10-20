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
          namu.getLicensesAndCategories(function(licensesAndCategories) {
            getFile(function(files, finish) {
              if (files.length < 0) {
                alert("선택한 파일이 없습니다!");
                return;
              } else if (files.length > 1) {
                alert("파일을 한개만 선택해주세요!");
                return;
              } else {
                var options = {};
                var file = files[0];
                options.file = file;
                options.name = "파일:" + file.name;
                options.description = "알 수 없음";
                options.log = "Uploaded via NamuFix";
              }
              var licenses = licensesAndCategories.licenses;
              var categories = licensesAndCategories.categories;
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
                  '              <input type="text" class="form-control" id="from" class="basicinfo" data-table-name="출처">' +
                  '            </div>' +
                  '            <label for="datetime">날짜</label>' +
                  '            <div class="input-group">' +
                  '              <input type="text" class="form-control" id="datetime" class="basicinfo" data-table-name="날짜">' +
                  '            </div>' +
                  '            <label for="holder">저작자</label>' +
                  '            <div class="input-group">' +
                  '              <input type="text" class="form-control" id="holder" class="basicinfo" data-table-name="저작자">' +
                  '            </div>' +
                  '            <label for="copyright">저작권</label>' +
                  '            <div class="input-group">' +
                  '              <input type="text" class="form-control" id="copyright" class="basicinfo" data-table-name="저작권">' +
                  '            </div>' +
                  '            <label for="etc">기타</label>' +
                  '            <div class="input-group">' +
                  '              <input type="text" class="form-control" id="etc" class="basicinfo" data-table-name="기타">' +
                  '            </div>' +
                  '            <label for="license">라이선스</label>' +
                  '            <div class="input-group">' +
                  '              <select class="form-control" id="license"></select>' +
                  '            </div>' +
                  '            <label for="category">분류</label>' +
                  '            <div class="input-group">' +
                  '               <select class="form-group" id="category" value="선택하세요">' +
                  '               </select>' +
                  '            </div>';

                var licenseSelect = container.querySelector("select#license");
                var categorySelect = container.querySelector("select#category");
                var filenameInput = container.querySelector("input#filename");
                filenameInput.value = "파일:".concat(file.name);
                licenses.forEach(function(name) {
                  var option = document.createElement("option");
                  option.text = name;
                  option.id = name;
                  option.value = name;
                  licenseSelect.add(option);
                });
                categories.forEach(function(name) {
                  var option = document.createElement("option");
                  option.text = name;
                  option.id = name;
                  option.value = name;
                  categorySelect.add(option);
                });
              });
              win.show();
              win.button("닫기", function() {
                win.close();
                win.destroy();
                finish();
              });
              win.button("업로드", function() {
                filenameInput.value = filenameInput.value.trim();
                if (filenameInput.value.length == 0) {
                  alert("올바르지 않은 파일 이름입니다.")
                  return;
                } else if (filenameInput.value.indexOf("파일:") != 0) {
                  alert("파일 이름은 \"파일:\"으로 시작해야 합니다.(\" 빼고)");
                  return;
                }
                options.name = filenameInput.value;
                options.description = "[include(" + licenseSelect.value + ")]\n\n== 기본 정보==\n";
                var basicinfoEntries = container.querySelectorAll(".basicinfo");
                for (var i = 0; i < basicinfoEntries.length; i++) {
                  var basicinfoEntry = basicinfoEntries[i];
                  if (basicinfoEntry.value.trim().length != 0) {
                    options.description += "|| " + basicinfoEntry.dataset.tableName + " || " + basicinfoEntry.value + " ||\n";
                  }
                }
                options.log = "Uploaded via NamuFix";
                namu.upload(options);
              });
              namu.onstarted = function(o) {
                // Nothing to do here.
              }
              namu.onuploaded = function(o) {
                if (o.successed)
                  textProc.appendSelection(options.name);
                else
                  alert("오류가 발생했습니다.");

                win.close();
                win.destroy();
                finish();
              }
            })
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
