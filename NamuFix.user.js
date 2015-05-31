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

// Included : src/CheckLocation.js
function IsEditing() {
  return document.querySelector("textarea[name=content]") !== null && (/https?:\/\/[^\.]*\.?namu\.wiki\/edit.*/).test(location.href);
}

// Included : src/DialogLibrary.js
var Dialog = (function() {
  var dialogParent = document.createElement("div");
  var dialog = document.createElement("div");

  dialogParent.id = "DialogParent";
  dialog.id = "Dialog";
  dialogParent.appendChild(dialog);
  var closer = function() {
    document.body.removeChild(dialogParent);
  }
  return {
    closeDialog: closer,
    openDialog: function(diaginfo, func) {
      var dinfo = {
        withTitle: true,
        withCloseButton: true,
        withBottomButtonArea: true,
        Title: "NamuFix"
      };
      for (var i in diaginfo) {
        dinfo[i] = diaginfo[i];
      }
      dialog.innerHTML = '';
      if (!document.body.contains(dialogParent))
        document.body.appendChild(dialogParent);
      if (dinfo.withTitle) {
        var titleElement = document.createElement("span");
        titleElement.id = "DialogTitle";
        titleElement.innerHTML = dinfo.Title;
        dialog.appendChild(titleElement);
      }
      if (dinfo.withCloseButton) {
        var CloseButtonIcon = document.createElement("span");
        CloseButtonIcon.className = "icon ion-close-round";
        CloseButtonIcon.id = "CloseDialog";
        var CloseButton = document.createElement("a");
        CloseButton.appendChild(CloseButtonIcon);
        CloseButton.setAttribute("href", "#");
        CloseButton.addEventListener("click", closer);
        dialog.appendChild(CloseButton);
      }
      if (dinfo.withTitle || dinfo.withCloseButton) {
        dialog.innerHTML += '<br><hr>';
      }
      var container = document.createElement('div');
      container.id = "container";
      dialog.appendChild(container);
      if (dinfo.withBottomButtonArea) {
        dialog.innerHTML += '<br><hr>'
        var buttonArea = document.createElement('div');
        document.appendChild(buttonArea);
      }
      var bridge = {
        close: closer,
        content: container,
        parent: dialogParent,
        setHeight: function(h) {
          container.style.height = h;
        },
        setWidth: function(w) {
          container.style.width = w;
        }
      };
      if (dinfo.withTitle) {
        bridge.setTitle = function(newtitle) {
          titleElement.innerHTML = newtitle;
        };
        bridge.hideTitle = function() {
          titleElement.style.display = "none";
        };
        bridge.showTitle = function() {
          titleElement.style.display = "";
        };
      }
      if (dinfo.withCloseButton) {
        bridge.hideCloseButton = function() {
          CloseButton.style.display = "none";
        };
        bridge.hideCloseButton = function() {
          CloseButton.style.display = "";
        };
      }
      if (dinfo.withBottomButtonArea) {
        bridge.addButton = function(label, func) {
          var btn = document.createElement("button");
          btn.className = "f_r d_btn";
          btn.addEventListener("click", func);
          btn.innerHTML = label;
          buttonArea.appendChild(btn);
        }
        bridge.addBlueButton = function(label, func) {
          var btn = document.createElement("button");
          btn.className = "f_r type_blue d_btn";
          btn.addEventListener("click", func);
          btn.innerHTML = label;
          buttonArea.appendChild(btn);
        }
        bridge.removeAllButtons = function() {
          buttonArea.innerHTML = '';
        }
      }
      func(bridge);
    }
  };
})();

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

  Dialog.openDialog({
    Title: "테스트"
  }, function(bridge) {
    bridge.content.innerHTML = "HEY!";
    bridge.setTitle("테스트테스트");
    bridge.addButton("테스트1", function() {
      alert("1");
    });
    bridge.addBlueButton("테스트2", function() {
      alert("2");
    });
  });
}