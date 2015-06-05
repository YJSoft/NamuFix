// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @include     http://*.namu.wiki/*
// @include     https://*.namu.wiki/*
// @version     3.17
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/dev/NamuFix.user.js
// @require     https://raw.githubusercontent.com/LiteHell/NamuFix/dev/static/FlexiColorPicker.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==

GM_xmlhttpRequest({
  url: 'https://raw.githubusercontent.com/LiteHell/NamuFix/dev/static/NamuFixInterface.css',
  method: 'GET',
  onload: function(response) {
    GM_addStyle(response.responseText);
  }
});

// Included : src/DialogLib.js
function showDialog(params) {
  // 내부 함수
  var RemoveElement = function(elem) {
    elem.parentNode.removeChild(elem);
  };

  // 매개변수 기본값 처리
  var data = {
    withTitle: true,
    title: "NamuFix",
    withCloseButton: true,
    content: "잠시만 기다려주세요....",
    contentFunc: function(con) {},
    withButtonsOnBottoms: true,
    buttons: [{
        value: "닫기",
        onclick: function() {}
      }]
      //buttons:[{color:"Blue",value:"확인",onclick:function(){}},{color:"Red",value:"취소",onclick:function(){}}]
  };
  for (var i in params) {
    data[i] = params[i];
  }

  // 기존 다이얼로그 존재시 제거
  if (document.querySelector(".DialogParent") != null)
    RemoveElement(document.querySelector(".DialogParent"));

  // 필수 요소 변수 선언
  var Parent = document.createElement("div");
  var Dialog = document.createElement("div");

  // 부모-자식 관계 설정
  Dialog.className = "Dialog";
  Parent.className = "DialogParent";
  Parent.appendChild(Dialog);

  // 제목과 닫기 버튼
  if (data.withTitle || data.withCloseButton) {
    var TitleArea = document.createElement("div");
    TitleArea.className = "TitleArea";
    if (data.withTitle) {
      var TitleSpan = document.createElement("span");
      TitleSpan.id = "Title";
      TitleSpan.innerHTML = data.title;
      TitleArea.appendChild(TitleSpan);
    }
    if (data.withCloseButton) {
      var CloseButton = document.createElement("a");
      CloseButton.setAttribute("href", "#");
      CloseButton.id = "Close";
      CloseButton.innerHTML = '<span class="icon ion-close"></span>';
      TitleArea.appendChild(CloseButton);
    }
    Dialog.appendChild(TitleArea);
  }

  var Container = document.createElement("div");
  Container.className = "Container";
  Container.innerHTML = data.content;
  data.contentFunc(Container);
  Dialog.appendChild(Container);

  if (data.withCloseButton) {
    var Buttons = document.createElement("div");
    Buttons.className = "Buttons";
    for (var i = 0; i < data.buttons.length; i++) {
      var btnDat = data.buttons[i];
      var Button = document.createElement("button");
      Button.setAttribute("type", "button");
      // 색 지정
      if ((typeof btnDat.color !== "undefined") && (btnDat.color != null)) {
        switch (btnDat.color.toLowerCase()) {
          case "blue":
            Button.className = "BlueButton"
            break;
          case "red":
            Button.className = "RedButton";
            break;
        }
      }
      Button.innerHTML = btnDat.value;
      Button.addEventListener("click", btnDat.onclick);
      Buttons.appendChild(Button);
    }
    Dialog.appendChild(Buttons);
  }
  document.body.appendChild(Parent);
}
showDialog.close = function() {
  var RemoveElement = function(elem) {
    elem.parentNode.removeChild(elem);
  };
  if (document.querySelector(".DialogParent") != null) {
    RemoveElement(document.querySelector(".DialogParent"));
  }
};

// Included : src/CheckLocation.js
function IsEditing() {
  return document.querySelector("textarea[name=content]") !== null && (/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href);
}

if (IsEditing()) {

  // Included : src/Editor/EditorModifier.js
  var editorModifier = new function() {
    var hiddenFileInput = document.createElement('input');
    hiddenFileInput.setAttribute('type', 'file');
    hiddenFileInput.style.visibility = 'hidden';
    hiddenFileInput.id = "namufix_hiddenfileinput";
    document.body.appendChild(hiddenFileInput);

    var txtarea = document.querySelector("textarea[name=content]");
    var buttonsBar = document.createElement("div");
    var editorStatus = document.createElement("div");

    buttonsBar.id = "EditInterfaceButtons";
    editorStatus.id = "EditInterfaceStatus";

    txtarea.parentNode.insertBefore(buttonsBar, txtarea);
    txtarea.parentNode.insertBefore(editorStatus, txtarea);

    this.addButton = function(labelHtml, alt, func) {
      var button = document.createElement("button");
      button.setAttribute("type", "button");
      button.className = "BetterNamuButton";
      button.title = alt;
      button.setAttribute("alt", alt);
      button.innerHTML = labelHtml;
      button.addEventListener("click", func);
      buttonsBar.appendChild(button);
    };
    this.addSpace = function() {
      var vline = document.createElement("vr");
      buttonsBar.appendChild(vline);
    }
    this.setStatus = function(txt) {
      editorStatus.innerHTML = txt;
    }
  }();

  // Included : src/Editor/EditorFuncHelper.js
  var WikiText = new function() {
    this.docTitle = document.querySelector('h1.title > a').innerHTML;
    this.docSectionNo = document.querySelector("#editForm > input[name=section]").value;

    var txtarea = document.querySelector('textarea[name=content]');
    this.isSomethingSelected = function() {
      return txtarea.selectionStart != txtarea.selectionEnd;
    }
    this.getSelected = function() {
      var r = txtarea.value;
      var s = txtarea.selectionStart;
      var e = txtarea.selectionEnd;
      return r.substring(s, e);
    }
    this.replaceSelected = function(str) {
      var r = txtarea.value;
      var s = txtarea.selectionStart;
      var e = txtarea.selectionEnd;
      txtarea.value = r.substring(0, s) + str + r.substring(e);
      txtarea.focus();
      txtarea.selectionStart = s;
      txtarea.selectionEnd = s + str.length;
    }
    this.ToggleWrapSelected = function(l) {
      if (arguments.length > 1) {
        var r = arguments[1];
      } else {
        var r = l;
      }
      var p = WikiText.getSelected();
      if (p == null || p == '') {
        p = "내용";
      }
      if (p.indexOf(l) != 0 || p.substring(p.length - r.length) != r) {
        p = l + p + r;
      } else {
        p = p.substring(l.length, p.length - r.length)
      }
      WikiText.replaceSelected(p);
    }

  }();

  // Included : src/Editor/EditorFeatures.js
  // Included : src/Editor/Features/BasicMarkUp.js
  var WrapClosure = function(l) {
    if (arguments.length == 1) {
      return function() {
        WikiText.ToggleWrapSelected(l);
      };
    } else {
      return function() {
        WikiText.ToggleWrapSelected(l, arguments[1]);
      };
    }
  }

  function ifEmpty(o, c) {
    if (typeof o === "undefined") return c;
    if (o == null) return c;
    if (o == '') return c;
    return o;
  }

  var fontSizeMarkUp = function(a) {
    return function() {
      var pattern = /{{{\+([0-9]+) (.+?)}}}/;
      var sel = WikiText.getSelected();
      if (pattern.test(sel)) {
        var currentsize = pattern.exec(sel)[1];
        var content = pattern.exec(sel)[2];
        var newsize = Number(currentsize) + a;
        if (newsize < 1) newsize = 1;
        if (newsize > 5) newsize = 5;
        WikiText.replaceSelected('{{{+' + newsize + ' ' + ifEmpty(content, '내용') + '}}}')
      } else {
        WikiText.replaceSelected('{{{+1 ' + ifEmpty(sel, '내용') + '}}}')
      }
    };
  }
  editorModifier.addButton('<strong>가</strong>', '굵게', WrapClosure("'''"));
  editorModifier.addButton('<i>가</i>', '기울게', WrapClosure("''"));
  editorModifier.addButton('<del>가</del>', '취소선', WrapClosure("--"));
  editorModifier.addButton('<u>가</u>', '밑줄', WrapClosure("__"));
  editorModifier.addButton('가<sub>가</sub>', '아랫첨자', WrapClosure(",,"));
  editorModifier.addButton('가<sup>가</sup>', '윗첨자', WrapClosure("^^"));
  editorModifier.addButton('<span style="font-size:75%;">가</span>', '글씨 작게', fontSizeMarkUp(-1));
  editorModifier.addButton('<span style="font-size:125%;">가</span>', '글씨 크게', fontSizeMarkUp(1));

  editorModifier.addButton('테', 'Dialog TEST', function() {
    showDialog({
      title: "테스트",
      content: '<span style="color:red;">테스트입니다</span>',
      contentFunc: function(c) {
        c.innerHTML += "진짜로";
      },
      buttons: [{
        value: "닫기",
        color: "red",
        onclick: function() {
          showDialog.close();
        }
      }, {
        value: "테스트1",
        color: "blue",
        onclick: function() {
          alert('111');
        }
      }, {
        value: "테스트2",
        onclick: function() {
          alert('222');
        }
      }]
    });
  });
}