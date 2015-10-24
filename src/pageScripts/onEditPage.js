conditionalLoader.register("IsEditing", function() {
  console.log(typeof createElement_s);
  console.log(typeof setInterval_s);
  console.log(typeof getFile);
  var s_createElement = new createElement_s();
  var createElement = s_createElement.createElement;

  function stylishEditor(textarea, callback) {
    editorBase(textarea, function(editor) {
      textHelper(textarea, function(textProc) {
        editor.removable(s_createElement);
        callback(editor, textProc)
      });
    })
  }
  var higherThis = this;
  this.load = function() {
    if (document.querySelector("textarea[readonly]")) {
      higherThis.loaded = false;
      return;
    }
    var textarea = document.querySelector("textarea");
    var tabs = makeTabs();
    tabs.removable(s_createElement);
    stylishEditor(textarea, function(editor, textProc) {
      editor.button('<span class="ion-image"></span>', function() {
        var namu = new NamuUploader();
        var files = [];
        namu.getLicensesAndCategories(function(licensesAndCategories) {
          var licenses = licensesAndCategories.licenses;
          var categories = licensesAndCategories.categories;
          var win = bsModal();
          win.removable(s_createElement);
          win.title("나무위키 이미지 업로드");
          var filenameInput, fileInput, licenseSelect, categorySelect, container;
          win.content(function(container_p) {
            container = container_p;
            container.innerHTML = '' +
              '          <label for="file">파일 선택</label>' +
              '          <div><input type="file" accept="image/*" id="file"></div>' +
              //'          <div><input type="file" accept="image/*" id="file" multiple></div>' +
              '          <label for="filename">파일 이름</label>' +
              '            <div class="input-group">' +
              '              <input type="text" class="form-control" id="filename">' +
              '            </div>' +
              //'            <p>참고 : 파일이 여러개면 파일 이름은 그 파일 각각의 이름으로 결정됩니다.</p>' +
              '            <label for="from">출처</label>' +
              '            <div class="input-group">' +
              '              <input type="text" class="form-control basicinfo" id="from" data-table-name="출처">' +
              '            </div>' +
              '            <label for="datetime">날짜</label>' +
              '            <div class="input-group">' +
              '              <input type="text" class="form-control basicinfo" id="datetime" data-table-name="날짜">' +
              '            </div>' +
              '            <label for="holder">저작자</label>' +
              '            <div class="input-group">' +
              '              <input type="text" class="form-control basicinfo" id="holder" data-table-name="저작자">' +
              '            </div>' +
              '            <label for="copyright">저작권</label>' +
              '            <div class="input-group">' +
              '              <input type="text" class="form-control basicinfo" id="copyright" data-table-name="저작권">' +
              '            </div>' +
              '            <label for="etc">기타</label>' +
              '            <div class="input-group">' +
              '              <input type="text" class="form-control basicinfo" id="etc" data-table-name="기타">' +
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

            licenseSelect = container.querySelector("select#license");
            categorySelect = container.querySelector("select#category");
            filenameInput = container.querySelector("input#filename");
            fileInput = container.querySelector("input#file");
            fileInput.addEventListener("change", function(evt) {
              if (evt.target.files.length == 1)
                filenameInput.value = "파일:".concat(evt.target.files[0].name);
            })
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
          });
          win.button("업로드", function() {
            function uploadFile(f, n) {
              var options = {};
              options.log = "Uploaded via NamuFix";
              options.file = f;
              options.name = n;
              options.description = "[include(" + licenseSelect.value + ")]\n\n== 기본 정보 ==\n";
              var basicinfoEntries = container.querySelectorAll(".basicinfo");
              for (var i = 0; i < basicinfoEntries.length; i++) {
                var basicinfoEntry = basicinfoEntries[i];
                if (basicinfoEntry.value.trim().length != 0) {
                  options.description += "|| " + basicinfoEntry.dataset.tableName + " || " + basicinfoEntry.value + " ||\n";
                }
              }
              options.description += "\n[[" + categorySelect.value + "]]"
              namu.upload(options);
            }
            var files = document.querySelector("input#file").files;
            if (files.length < 0) {
              alert("선택한 파일이 없습니다!");
              return;
            } else if (files.length == 1) {
              filenameInput.value = filenameInput.value.trim();
              if (filenameInput.value.length == 0) {
                alert("올바르지 않은 파일 이름입니다.")
                return;
              } else if (filenameInput.value.indexOf("파일:") != 0) {
                alert("파일 이름은 \"파일:\"으로 시작해야 합니다.(\" 빼고)");
                return;
              }
            }
            var waitingWin = bsModal();
            waitingWin.title("업로드중");
            waitingWin.content(function(container) {
              container.innerHTML = '<p>업로드중입니다.</p><p>진행중 : <span id="fn"></span></p>';
            })
            waitingWin.removable(s_createElement);
            waitingWin.show();
            var index = 1;
            namu.onstarted = function(o) {
              waitingWin.content(function(container) {
                container.querySelector("span#fn").textContent = o.name;
              });
            }
            namu.onuploaded = function(o) {
              if (o.successed)
                textProc.appendSelection("[[" + o.name + "]]");
              else
                alert("오류가 발생했습니다 : " + o.name);

              var i = index++;
              if (i == files.length || i > files.length) {
                win.destroy();
                waitingWin.destroy();
              } else {
                uploadFile(files[i], files.length == 1 ? filenameInput.value : "파일:" + files[i].name);
              }
            }
            uploadFile(files[0], files.length == 1 ? filenameInput.value : "파일:" + files[0].name);
          });
        })
      })
    });
  }
  this.unload = function() {
    s_createElement.removeAllElements();
  }
});
