// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://no-ssl.namu.wiki/*
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @include     http://issue.namu.wiki/*
// @version     160913.0
// @author      LiteHell
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/master/NamuFix.user.js
// @require     https://cdn.rawgit.com/LiteHell/NamuFix/0ea78119c377402a10bbdfc33365c5195ce7fccc/FlexiColorPicker.js
// @require     https://cdn.rawgit.com/Caligatio/jsSHA/v2.0.1/src/sha512.js
// @require     https://cdn.rawgit.com/zenozeng/color-hash/v1.0.3/dist/color-hash.js
// @require     http://www.xarg.org/download/pnglib.js
// @require     https://cdn.rawgit.com/stewartlord/identicon.js/7c4b4efdb7e2aba458eba14b24ba14e8e2bcdb2a/identicon.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min.js
// @require     https://cdn.rawgit.com/LiteHell/TooSimplePopupLib/7f2a8a81f11f980c1dfa6b5b2213cd38b8bbde3c/TooSimplePopupLib.js
// @require     https://cdn.rawgit.com/wkpark/jsdifflib/dc19d085db5ae71cdff990aac8351607fee4fd01/difflib.js
// @require     https://cdn.rawgit.com/wkpark/jsdifflib/dc19d085db5ae71cdff990aac8351607fee4fd01/diffview.js
// @connect     cdn.rawgit.com
// @connect     api.github.com
// @connect     api.ipify.org
// @connect     tools.keycdn.com
// @connect     wtfismyip.com
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_info
// @run-at      document-end
// ==/UserScript==
/*
Copyright (c) 2015 LiteHell

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
if (/^http:\/\/issue\.namu\.wiki/.test(location.href)) {
  location.href = location.href.replace(/^http:\/\//, 'https://');
}

function emReset() {
  if (confirm('정말로 초기화하시겠습니까? 초기화하면 임시저장, 설정, 템플릿 목록.... 등등 모든 것이 초기화됩니다.\n' +
      '오류/버그가 이유라면 초기화하기 전 최신 버전으로의 업데이트를 먼저 시도해주세요.\n\n그래도 초기화하시겠습니까?')) {
    var valKeys = GM_listValues();
    for (var i = 0; i < valKeys.length; i++) {
      GM_deleteValue(valKeys[i]);
    }
    alert('초기화 완료')
  }
}
if (typeof exportFunction !== "undefined") {
  exportFunction(emReset, unsafeWindow, {
    defineAs: "EmergencyReset"
  })
} else if (typeof unsafeWindow !== "undefined") {
  unsafeWindow.EmergencyReset = emReset;
} else {
  window.EmergencyReset = emReset;
}

function insertCSS(url) {
  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    onload: function(res) {
      GM_addStyle(res.responseText);
    }
  });
}

insertCSS("https://cdn.rawgit.com/LiteHell/NamuFix/0ea78119c377402a10bbdfc33365c5195ce7fccc/NamuFix.css");
insertCSS("https://cdn.rawgit.com/LiteHell/TooSimplePopupLib/7f2a8a81f11f980c1dfa6b5b2213cd38b8bbde3c/TooSimplePopupLib.css");
insertCSS("https://cdn.rawgit.com/wkpark/jsdifflib/dc19d085db5ae71cdff990aac8351607fee4fd01/diffview.css");

function nOu(a) {
  return typeof a === 'undefined' || a == null;
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var newstr = this;
    for (var i = 0; i < arguments.length; i++) {
      var b = '{' + i + '}';
      var a = arguments[i];
      while (newstr.indexOf(b) != -1) newstr = newstr.replace(b, a);
    }
    return newstr;
  }
}
// HTML 이스케이프 함수
function encodeHTMLComponent(text) {
  var result = text;
  // http://www.w3schools.com/php/func_string_htmlspecialchars.asp 참고함.
  result = result.replace(/&/gmi, "&amp;");
  result = result.replace(/</gmi, "&lt;");
  result = result.replace(/>/gmi, "&gt;");
  result = result.replace(/'/gmi, "&#039;");
  result = result.replace(/"/gmi, "&quot;");
  return result;
}

function forLoop(array, callback) {
  var index = 0;
  var doNext = function() {
    if (array.length > index) {
      callback(array[index++], doNext, index == array.length - 1);
    }
  }
  doNext();
}

function formatDateTime(t) {
  var d = new Date(t);
  return '{0}년 {1}월 {2}일 {7}요일 {6} {3}시 {4}분 {5}초'.format(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours() - (d.getHours() > 12 ? 12 : 0), d.getMinutes(), d.getSeconds(), d.getHours() > 12 ? '오후' : '오전', (['일', '월', '화', '수', '목', '금', '토'])[d.getDay()]);
}

var hashDictionary = {};

function SHA512(text) {
  if (typeof hashDictionary[text] === 'undefined') {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(text);
    hashDictionary[text] = shaObj.getHash("HEX");
  }
  return hashDictionary[text];
}

function uniqueID() {
  var dt = Date.now();
  var url = location.href;
  var randomized = Math.floor(Math.random() * 48158964189489678525869410);
  return SHA512(String(dt).concat(dt, '\n', url, '\n', String(randomized)));
}

function listenPJAX(callback) {
  // create elements
  var pjaxButton = document.createElement("button");
  var scriptElement = document.createElement("script");

  // configure button
  pjaxButton.style.dispaly = "none";
  pjaxButton.id = "nfFuckingPJAX"
  pjaxButton.addEventListener("click", callback);

  // configure script
  scriptElement.setAttribute("type", "text/javascript");
  scriptElement.innerHTML = '$(document).bind("pjax:end", function(){document.querySelector("button#nfFuckingPJAX").click();})';

  // add elements
  document.body.appendChild(pjaxButton);
  document.head.appendChild(scriptElement);
}



var SET = new function() {
  var discards = ['save', 'load'];
  this.save = function() {
    for (var i in this) {
      if (discards.indexOf(i) != -1) continue;
      GM_setValue('SET_' + i, this[i]);
    }
  };
  this.load = function() {
    var sets = GM_listValues();
    for (var i = 0; i < sets.length; i++) {
      var now = sets[i];
      if (now.indexOf('SET_') != 0) continue;
      if (discards.indexOf(now) != -1) continue;
      this[now.substring(4)] = GM_getValue(now);
    }
  };
  this.delete = function(key) {
    if (discards.indexOf(key) != -1) return;
    GM_deleteValue(key);
    delete this[key];
  };
};
SET.load();

function INITSET() { // Storage INIT
  if (nOu(SET.tempsaves))
    SET.tempsaves = {};
  if (nOu(SET.recentlyUsedTemplates))
    SET.recentlyUsedTemplates = [];
  if (nOu(SET.imgurDeletionLinks))
    SET.imgurDeletionLinks = [];
  if (nOu(SET.discussIdenti))
    SET.discussIdenti = 'icon'; // icon, headBg, none
  if (nOu(SET.discussIdentiLightness))
    SET.discussIdentiLightness = 0.7;
  if (nOu(SET.discussIdentiSaturation))
    SET.discussIdentiSaturation = 0.5;
  if (nOu(SET.favorites))
    SET.favorites = [];
  if (nOu(SET.customIdenticons))
    SET.customIdenticons = {};
  if (nOu(SET.hideDeletedWhenDiscussing))
    SET.hideDeletedWhenDiscussing = 0;
  else if (typeof SET.hideDeletedWhenDiscussing !== "Number")
    SET.hideDeletedWhenDiscussing = Number(SET.hideDeletedWhenDiscussing);
  if (nOu(SET.discussAnchorPreviewType))
    SET.discussAnchorPreviewType = 1; // 0 : None, 1 : mouseover, 2 : quote
  else
    SET.discussAnchorPreviewType = Number(SET.discussAnchorPreviewType);
  if (nOu(SET.removeNFQuotesInAnchorPreview))
    SET.removeNFQuotesInAnchorPreview = false;
  if (nOu(SET.lookupIPonDiscuss))
    SET.lookupIPonDiscuss = true;
  SET.save();
}

var nfMenuDivider = document.createElement("div");
(function() {
  nfMenuDivider.className = "dropdown-divider";
  var secondDivider = document.querySelectorAll('.dropdown-divider')[1];
  secondDivider.parentNode.insertBefore(nfMenuDivider, secondDivider);
})();

function addItemToMemberMenu(text, onclick) {
  var menuItem = document.createElement("a");
  menuItem.className = "dropdown-item";
  menuItem.href = "#NothingToLink";
  menuItem.innerHTML = text;
  menuItem.addEventListener('click', onclick);
  nfMenuDivider.parentNode.insertBefore(menuItem, nfMenuDivider.nextSibling);
}

function getVPNGateIPList(callback) {
  GM_xmlhttpRequest({
    method: "GET",
    url: "http://www.vpngate.net/api/iphone/",
    onload: function(res) {
      var lines = res.responseText.split('\n');
      var result = [];
      for (var i = 0; i < lines.length; i++) {
        if (!/^[\*#]/.test(lines[i]))
          result.push(lines[i].split(',')[1]);
      }
      callback(result);
    }
  })
}

function getRAW(title, onfound, onnotfound) {
  GM_xmlhttpRequest({
    method: 'GET',
    url: 'https://namu.wiki/raw/' + title,
    onload: function(res) {
      if (res.status == 404) {
        onnotfound(title);
        return;
      }
      onfound(res.responseText, title);
    }
  })
}

function makeTabs() {
  var div = document.createElement("div");
  div.className = "nf-tabs";
  div.innerHTML = "<ul></ul>";
  var ul = div.querySelector("ul");
  return {
    tab: function(text) {
      var item = document.createElement("li");
      item.innerHTML = text;
      item.addEventListener('click', function() {
        var selectedTabs = div.querySelectorAll('li.selected');
        for (var i = 0; i < selectedTabs.length; i++) {
          selectedTabs[i].className = selectedTabs[i].className.replace(/selected/mg, '');
        }
        item.className = "selected";
      });
      ul.appendChild(item);
      return {
        click: function(callback) {
          item.addEventListener('click', callback);
          return this;
        },
        selected: function() {
          if (item.className.indexOf('selected') == -1) item.className += ' selected';
          return this;
        }
      };
    },
    get: function() {
      return div;
    }
  };
}

function createDesigner(buttonBar) {
  var Designer = {};
  Designer.button = function(txt) {
    var btn = document.createElement('button');
    btn.className = 'NamaEditor NEMenuButton';
    btn.setAttribute('type', 'button');
    btn.innerHTML = txt;

    buttonBar.appendChild(btn);
    var r = {
      click: function(func) {
        btn.addEventListener('click', func);
        return r;
      },
      hoverMessage: function(msg) {
        btn.setAttribute('title', msg);
        return r;
      },
      right: function() {
        btn.className += ' NEright';
        return r;
      },
      active: function() {
        btn.setAttribute('active', 'yes');
        return r;
      },
      deactive: function() {
        btn.removeAttribute('active')
        return r;
      },
      remove: function() {
        btn.parentNode.removeChild(btn);
        return r;
      },
      use: function() {
        buttonBar.appendChild(btn);
        return r;
      }
    };
    return r;
  };
  Designer.dropdown = function(txt) {
    var dropdownButton = document.createElement("div");
    var dropdown = document.createElement("div");
    var dropdownList = document.createElement("ul");
    dropdownButton.innerHTML = '<div class="NEDropdownButtonLabel NamaEditor">' + txt + '</div>';
    dropdownButton.className = 'NamaEditor NEMenuButton';
    dropdown.className = 'NamaEditor NEDropDown';
    dropdown.appendChild(dropdownList);
    dropdownButton.appendChild(dropdown);
    buttonBar.appendChild(dropdownButton);

    var dbHover = false,
      dbBHover = false;
    dropdown.style.display = 'none';
    dropdownButton.addEventListener('click', function() {
      var dropdowns = buttonBar.querySelectorAll(".NamaEditor.NEMenuButton > .NamaEditor.NEDropDown");
      for (var i = 0; i < dropdowns.length; i++) {
        if (dropdowns[i] != dropdown) {
          dropdowns[i].style.display = 'none';
          dropdowns[i].parentNode.removeAttribute("hover");
        } else if (dropdown.style.display.trim() == 'none') {
          dropdown.style.display = '';
          dropdownButton.setAttribute("hover", "yes");
        } else {
          dropdown.style.display = 'none';
          dropdownButton.removeAttribute("hover");
        }
      }
    });

    var hr = {
      button: function(iconTxt, txt) {
        var liTag = document.createElement('li');
        liTag.innerHTML = '<span class="NEHeadIcon">' + iconTxt + '</span><span class="NEDescText">' + txt + '</span>'
        liTag.addEventListener('click', function() {
          dropdown.style.display = '';
        })
        dropdownList.appendChild(liTag);
        var r = {
          icon: function(iconTxt) {
            liTag.querySelector('.NEHeadIcon').innerHTML = iconTxt;
            return r;
          },
          text: function(txt) {
            liTag.querySElector('.NEDescText').innerHTML = txt;
            return r;
          },
          hoverMessage: function(msg) {
            liTag.setAttribute('title', msg);
            return r;
          },
          click: function(handler) {
            liTag.addEventListener('click', handler);
            return r;
          },
          right: function() {
            liTag.className += 'NEright';
            return r;
          },
          remove: function() {
            dropdownList.removeChild(liTag);
            return r;
          },
          insert: function() {
            dropdownList.appendChild(liTag);
            return r;
          },
          backwalk: function() {
            dropdownList.removeChild(ilTag);
            dropdownList.appendChild(ilTag);
            return r;
          }
        };
        return r;
      },
      right: function() {
        liTag.className += 'NEright';
        return hr;
      },
      hoverMessage: function(txt) {
        dropdownButton.setAttribute('title', txt);
        return hr;
      },
      clear: function() {
        dropdownList.innerHTML = '';
        return hr;
      }
    };
    return hr;
  };
  return Designer;
}

function createTextProcessor(txtarea) {
  var r = {};
  r.value = function() {
    if (arguments.length == 0) return txtarea.value;
    else txtarea.value = arguments[0];
  };
  r.selectionText = function() {
    if (arguments.length == 0) return txtarea.value.substring(txtarea.selectionStart, txtarea.selectionEnd);
    else {
      var s = txtarea.selectionStart;
      var t = txtarea.value.substring(0, txtarea.selectionStart);
      t += arguments[0];
      t += txtarea.value.substring(txtarea.selectionEnd);
      txtarea.value = t;
      txtarea.focus();
      txtarea.selectionStart = s;
      txtarea.selectionEnd = s + arguments[0].length;
    }
  };
  r.selectionStart = function() {
    if (arguments.length == 0) return txtarea.selectionStart;
    else txtarea.selectionStart = arguments[0];
  };
  r.selectionTest = function(r) {
    return this.selectionText().search(r) != -1;
  };
  r.valueTest = function(r) {
    return this.value().search(r) != -1;
  };
  r.selectionEnd = function() {
    if (arguments.length == 0) return txtarea.selectionEnd;
    else txtarea.selectionEnd = arguments[0];
  };
  r.selectionLength = function() {
    if (arguments.length == 0) return (txtarea.selectionEnd - txtarea.selectionStart);
    else txtarea.selectionEnd = txtarea.selectionStart + arguments[0];
  };
  r.select = function(s, e) {
    txtarea.focus();
    txtarea.selectionStart = s;
    if (typeof e !== 'undefined') txtarea.selectionEnd = e;
  }
  r.WrapSelection = function(l, r) {
    if (arguments.length == 1) var r = l;
    var t = this.selectionText();
    if (typeof t === 'undefined' || t == null || t == '') t = '내용';
    var s = this.selectionStart()
    t = l + t + r;
    this.selectionText(t);
    this.select(s + l.length, s + t.length - r.length)
  };
  r.ToggleWrapSelection = function(l, r) {
    function isWrapped(t) {
      return t.indexOf(l) == 0 && t.lastIndexOf(r) == (t.length - r.length);
    }
    if (arguments.length == 1) var r = l;
    var t = this.selectionText();
    var t_m = this.value().substring(this.selectionStart() - l.length, this.selectionEnd() + r.length);
    var wrappedInSelection = isWrapped(t);
    var wrappedOutOfSelection = isWrapped(t_m);
    if (wrappedInSelection) {
      var s = this.selectionStart();
      this.selectionText(t.substring(l.length, t.length - r.length));
      this.select(s, s + t.length - l.length - r.length);
    } else if (wrappedOutOfSelection) {
      var s = this.selectionStart() - l.length;
      this.selectionStart(s);
      this.selectionEnd(s + t_m.length);
      this.selectionText(t_m.substring(l.length, t_m.length - r.length));
      this.select(s, s + t_m.length - l.length - r.length);
    } else {
      this.WrapSelection(l, r);
    }
  };
  return r;
}

function getFile(callback, allowMultiple) {
  if (typeof allowMultiple === "undefined") var allowMultiple = false;
  var elm = document.createElement("input");
  elm.setAttribute("type", "file");
  if (allowMultiple) elm.setAttribute("multiple", "1");
  elm.style.visibility = "hidden";
  elm.setAttribute("accept", "image/*");
  document.body.appendChild(elm);
  elm.addEventListener('change', function(evt) {
    callback(evt.target.files, function() {
      document.body.removeChild(elm);
    })
  });
  elm.click();
}

function mainFunc() {
  // 환경 감지
  var ENV = {};
  ENV.IsSSL = /^https/.test(location.href);
  ENV.IsEditing = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/edit\/(.+?)/.test(location.href);
  ENV.Discussing = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/topic\/([0-9]+?)/.test(location.href);
  ENV.IsDocument = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/w\/(.+)/.test(location.href); //&& document.querySelector('p.wiki-edit-date');
  ENV.IsSettings = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/settings/.test(location.href);
  ENV.IsUserPage = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/contribution\/(?:author|ip)\/.+\/(?:document|discuss)/.test(location.href);
  ENV.IsUploadPage = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/Upload$/.test(location.href);
  ENV.IsDiff = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/diff\/.+/.test(location.href);
  ENV.IsLoggedIn = document.querySelectorAll('img.user-img').length == 1;
  if (ENV.IsLoggedIn) {
    ENV.UserName = document.querySelector('div.user-info > div.user-info > div:first-child').textContent.trim();
  }
  if (document.querySelector("input[name=section]"))
    ENV.section = document.querySelector("input[name=section]").value;
  if (document.querySelector("h1.title > a"))
    ENV.docTitle = document.querySelector("h1.title > a").innerHTML;
  else if (document.querySelector("h1.title"))
    ENV.docTitle = document.querySelector("h1.title").innerHTML;
  if (ENV.Discussing) {
    ENV.topicNo = /^https?:\/\/(?:no-ssl\.|)namu\.wiki\/topic\/([0-9]+)/.exec(location.href)[1];
    ENV.topicTitle = document.querySelector('article > h2').innerHTML;
  }
  if (ENV.IsDiff) {
    //ENV.docTitle = /diff\/(.+?)\?/.exec(location.href)[1];
    ENV.beforeRev = Number(/[\&\?]oldrev=([0-9]+)/.exec(location.href)[1]);
    ENV.afterRev = Number(/[\&\?]rev=([0-9]+)/.exec(location.href)[1]);
  }
  if (nOu(ENV.section))
    ENV.section = -2;
  GM_xmlhttpRequest({
    method: "GET",
    url: "https://wtfismyip.com/json",
    onload: function(res) {
      var ip = JSON.parse(res.responseText).YourFuckingIPAddress;
      if (!ENV.IsLoggedIn) ENV.UserName = ip;
      ENV.IPAddress = ip;
    }
  });

  // 설정 초기화
  INITSET();

  if (ENV.IsEditing || ENV.Discussing) {
    if (document.querySelectorAll("textarea").length == 1 && !document.querySelector("textarea").hasAttribute("readonly")) {
      var rootDiv = document.createElement("div");
      if (ENV.IsEditing) {
        // 탭 추가
        var previewTab = document.createElement("div");
        var diffTab = document.createElement("div");
        var initalPreviewTabHTML = '<iframe id="nfPreviewFrame" name="nfPreviewFrame" style="width: 100%; height: 600px; display: block; border: 1px solid black;"></iframe>';
        document.querySelector('textarea').parentNode.insertBefore(previewTab, document.querySelector('textarea').nextSibling);
        document.querySelector('textarea').parentNode.insertBefore(diffTab, document.querySelector('textarea').nextSibling);

        // 나무위키 자체 편집/미리보기 탭 제거
        document.querySelector('.nav.nav-tabs').setAttribute("style", "display:none;");

        function hideAndShow(no) {
          rootDiv.style.display = no == 0 ? '' : 'none';
          previewTab.style.display = no == 1 ? '' : 'none';
          diffTab.style.display = no == 2 ? '' : "none";
        }
        hideAndShow(0);
        var tabs = makeTabs();
        tabs.tab("편집").selected().click(function() {
          hideAndShow(0);
        });
        tabs.tab("미리보기").click(function() {
          previewTab.innerHTML = initalPreviewTabHTML;
          hideAndShow(1);
          var form = document.querySelector('form#editForm');
          form.setAttribute("method", "POST");
          form.setAttribute("target", "nfPreviewFrame");
          form.setAttribute("action", "/preview/" + ENV.docTitle);
          form.submit();
        });
        tabs.tab("비교").click(function() {
          hideAndShow(2);
          diffTab.innerHTML = '<span style="font-size: 15px;">처리중입니다...</span>';
          var editUrl = 'https://namu.wiki/edit/'.concat(ENV.docTitle, ENV.section != -2 ? '?section='.concat(ENV.section) : '');
          GM_xmlhttpRequest({
            url: editUrl,
            method: "GET",
            onload: function(res) {
              var parser = new DOMParser();
              var doc = parser.parseFromString(res.responseText, "text/html");
              var latestBaseRev = doc.querySelector('input[name="baserev"]').value;
              if (doc.querySelectorAll('textarea').length < 1) {
                diffTab.innerHTML = '<span style="font-size: 15px; color:red;">오류가 발생했습니다.</span>';
                return;
              }
              var remoteWikitext = doc.querySelector('textarea').value;
              var wikitext = document.querySelector("textarea.NamaEditor.NETextarea").value;
              diffTab.innerHTML = '<div style="width: 100%;">' +
                '<div style="padding: 0; width: 100%; margin: 0px; max-height: 600px; overflow: scroll;" id="diffResult">' +
                '</div>' +
                '</div>';
              var result = diffTab.querySelector('#diffResult');
              var base = difflib.stringAsLines(remoteWikitext);
              var newtxt = difflib.stringAsLines(wikitext);

              // create a SequenceMatcher instance that diffs the two sets of lines
              var sm = new difflib.SequenceMatcher(base, newtxt);
              var opcodes = sm.get_opcodes();

              while (result.firstChild) result.removeChild(result.firstChild);
              result.appendChild(diffview.buildView({
                baseTextLines: base,
                newTextLines: newtxt,
                opcodes: opcodes,
                // set the display titles for each resource
                baseTextName: "리비전 r" + document.querySelector('input[name="baserev"]').value,
                newTextName: "편집중",
                contextSize: 3,
                viewType: 2
              }));
            }
          });
        });
        document.querySelector("#editForm").insertBefore(tabs.get(), document.querySelector("#editForm").firstChild);
      }

      // Init (Add Elements)
      var buttonBar = document.createElement('div');
      var txtarea = document.createElement('textarea');
      buttonBar.className = 'NamaEditor NEMenu';
      txtarea.className = 'NamaEditor NETextarea'
      txtarea.name = document.querySelector("textarea").name;
      rootDiv.className += ' NamaEditor NERoot';
      rootDiv.appendChild(buttonBar);
      rootDiv.appendChild(txtarea);

      // Functions To Design
      var Designer = createDesigner(buttonBar);

      // Functions To Process
      var TextProc = createTextProcessor(txtarea);

      // Some Basic MarkUp Functions
      function FontSizeChanger(isIncrease) {
        var pattern = /^{{{\+([1-5]) (.+?)}}}$/;
        var t, s = TextProc.selectionStart();
        if (TextProc.selectionTest(pattern)) {
          var t = TextProc.selectionText();
          var fontSize = t.replace(pattern, '$1');
          var innerText = t.replace(pattern, '$2');
          if (isIncrease) fontSize++;
          else fontSize--;

          if (5 < fontSize) fontSize = 5;
          if (fontSize < 1) fontSize = 1;
          t = '{{{+' + fontSize + ' ' + innerText + '}}}';
        } else {
          t = '{{{+1 ' + TextProc.selectionText() + '}}}';
        }
        TextProc.selectionText(t);
        TextProc.select(s, s + t.length);
      }

      function TextColorChange() {
        var colorMarkUpPattern = /^{{{(#[a-zA-Z0-9]+) (.*)}}}$/;
        var color = '#000000',
          text = '';
        if (TextProc.selectionTest(colorMarkUpPattern)) {
          // 색상 마크업이 적용된 텍스트
          var matches = colorMarkUpPattern.exec(TextProc.selectionText());
          color = matches[1];
          text = matches[2];
        } else if (TextProc.selectionText().lengh == 0) {
          // 선택된 텍스트 없음
          text = '내용';
        } else {
          // 텍스트 선택됨
          text = TextProc.selectionText();
        }
        var w = window.TooSimplePopup();
        var c = w.close;
        w.title('색 지정').content(function(e) {
          var pickerWrapper = document.createElement('div');
          var sliderWrapper = document.createElement('div');
          var picker = document.createElement('div');
          var slider = document.createElement('div');
          var pickerIndicator = document.createElement('div');
          var sliderIndicator = document.createElement('div');
          pickerWrapper.appendChild(picker);
          pickerWrapper.appendChild(pickerIndicator);
          sliderWrapper.appendChild(slider);
          sliderWrapper.appendChild(sliderIndicator);

          picker.className = "NamaEditor FlexiColorPicker Picker";
          pickerIndicator.className = "NamaEditor FlexiColorPicker PickerIndicator";
          slider.className = "NamaEditor FlexiColorPicker Slider";
          sliderIndicator.className = "NamaEditor FlexiColorPicker SliderIndicator";
          pickerWrapper.className = "NamaEditor FlexiColorPicker PickerWrapper";
          sliderWrapper.className = "NamaEditor FlexiColorPicker SliderWrapper";

          ColorPicker.fixIndicators(
            sliderIndicator,
            pickerIndicator
          )
          ColorPicker(slider, picker, function(hex, hsv, rgb, pickerCo, sliderCo) {
            ColorPicker.positionIndicators(
              sliderIndicator,
              pickerIndicator,
              sliderCo, pickerCo
            )
            color = hex;
          }).setHex(color);
          e.appendChild(pickerWrapper);
          e.appendChild(sliderWrapper);
        }).button('지정', function() {
          TextProc.selectionText('{{{' + color + ' ' + text + '}}}');
          c();
        }).button('닫기', c);
      }

      // Add Basic MarkUp Buttons
      var decoDropdown = Designer.dropdown('<span class="ion-wand"></span>').hoverMessage('텍스트 꾸미기');
      decoDropdown.button('<strong>A</strong>', '굵게').click(function() {
        TextProc.ToggleWrapSelection("'''");
      });
      decoDropdown.button('<em>A</em>', '기울임꼴').click(function() {
        TextProc.ToggleWrapSelection("''");
      });
      decoDropdown.button('<del>A</del>', '취소선').click(function() {
        TextProc.ToggleWrapSelection("--");
      });
      decoDropdown.button('<span style="text-decoration: underline;">A</span>', '밑줄').click(function() {
        TextProc.ToggleWrapSelection("__");
      });
      decoDropdown.button('<span style="color:red;">A</span>', '글씨색').click(TextColorChange);
      decoDropdown.button('-', '글씨 작게').click(function() {
        FontSizeChanger(false);
      });
      decoDropdown.button('+', '글씨 크게').click(function() {
        FontSizeChanger(true);
      });

      // Insertable Media Functions
      function namuUpload() {
        function getCopyrightInfo(callback) {
          var win = TooSimplePopup();
          var contelem;
          win.title("저작권 정보");
          win.content(function(el) {
            contelem = el;
            el.innerHTML = '<label>출처</label><input type="text" class="cpinfo" data-name="출처"></input><br>' +
              '<label>날짜</label><input type="text" class="cpinfo" data-name="날짜"></input><br>' +
              '<label>저작자</label><input type="text" class="cpinfo" data-name="저작자"></input><br>' +
              '<label>저작권</label><input type="text" class="cpinfo" data-name="저작권"></input><br>' +
              '<label>기타</label><input type="text" class="cpinfo" data-name="기타"></input><br>' +
              '<label>설명</label><input type="text" class="cpinfo" data-name="설명"></input>' +
              '<p>라이선스, 분류는 구현하기 귀찮습니다. 라이선스는 저작권란에 알아서 써주시고 분류는 알아서 하세요.</p>'
          });
          win.button("삽입", function() {
            var result = "== 기본 정보 ==\n";
            var cpinfos = contelem.querySelectorAll(".cpinfo");
            for (var i = 0; i < cpinfos.length; i++) {
              var cpinfo = cpinfos[i];
              result += "|| " + cpinfo.dataset.name + " || " + cpinfo.value + " ||\n";
            }
            callback(result);
          });
          win.button("닫기", win.close);
        }
        getCopyrightInfo(function(docuText) {
          getFile(function(files, finish) {
            if (files.length < 0) {
              alert('선택된 파일이 없습니다');
              return finish();
            }

            forLoop(files, function(file, next, isLastItem) {
              if (!file) next();
              var win = TooSimplePopup();
              win.title("업로드 중...");
              win.content(function(el) {
                el.innerHTML = '<p>파일을 업로드하고 있습니다. 잠시만 기다려주세요.</p><p>현재 업로드중 : ' + file.name + '</p>';
              });
              var query = new FormData();
              var fn = "파일:" + SHA512(String(Date.now()) + file.name) + "_" + file.name;
              query.append('file', file);
              query.append('document', fn);
              query.append('text', docuText);
              query.append('log', "NamuFix로 자동으로 업로드됨");
              query.append('baserev', 0);
              query.append('identifier', (ENV.IsLoggedIn ? "m" : "i") + ":" + ENV.UserName);
              GM_xmlhttpRequest({
                method: 'POST',
                url: 'https://namu.wiki/Upload',
                data: query,
                onload: function(res) {
                  var parser = new DOMParser();
                  if (parser.parseFromString(res.responseText, "text/html").querySelector("p.wiki-edit-date") != null) {
                    TextProc.selectionText(TextProc.selectionText() + '[[' + fn + ']]');
                  } else {
                    alert("업로드에 실패함 : " + file.name);
                    prompt("copy this, for debugging", res.responseText)
                  }
                  if (isLastItem) {
                    finish();
                  }
                  win.close();
                  next();
                }
              })
            })
          }, true);
        })
      }

      function InsertYouTube() {
        var win = TooSimplePopup();
        win.title('YouTube 동영상 삽입');
        win.content(function(el) {
          el.innerHTML = '<p style="background: cyan; box-shadow: 2px 2px 2px gray; color:white; padding: 8px; border-radius: 3px; margin-bottom: 5px;">YouTube 동영상을 검색하거나 동영상 주소를 입력하여 YouTube 동영상을 삽입할 수 있습니다.</p>' +
            '<p><label for="vidUrl" style="width: 120px; display: inline-block;">YouTube 동영상 주소</label><input type="text" name="vidUrl" id="vidUrl" style="width:620px; max-width: 100vw;"></input><button id="insertUrl">삽입</button></p>' +
            '<hr>' +
            '<div>' +
            '<label for="vidQuery" style="width: 120px; display: inline-block;">검색어</label><input type="text" name="vidQuery" id="vidQuery" style="width:620px; max-width: 100vw;"></input><button id="searchVids">검색</button>' +
            '<div id="results" style="overflow-y: scroll; overflow-x: hidden; width: 820px; max-width: 100vw; height: 400px; max-height: calc(100vh - 300px);"><span style="color:red">검색 결과가 없습니다.</span></div>' +
            '</div>';
        })
        var finish = function(vid) {
            if (vid == null) {
              alert('무언가 잘못된것 같습니다.');
              return;
            }
            TextProc.selectionText(TextProc.selectionText() + '[youtube(' + vid + ')]');
            win.close();
          }
          // 주소로 삽입 기능
        win.content(function(el) {
          var ExtractYouTubeID = function(url) {
            // from Lasnv's answer from http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
            var match = url.match(regExp);
            if (match && match[7].length == 11)
              return match[7];
            else
              return null;
          }
          var insertByUrlFunc = function() {
            var url = el.querySelector('#vidUrl').value;
            var vidId = ExtractYouTubeID(url);
            finish(vidId);
          }
          el.querySelector('#insertUrl').addEventListener('click', insertByUrlFunc);
          el.querySelector('#vidUrl').addEventListener('keyup', function(evt) {
            if (evt.which == 13 || evt.keycode == 13) {
              insertByUrlFunc();
              return false;
            }
          })
        });
        // 검색 기능
        win.content(function(el) {
          // https://developers.google.com/youtube/v3/docs/search/list
          var baseUri = 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyAqi9PjUr_F54U0whrbMeavFfvNap3kjvA&';
          var basicSearchUri = baseUri + 'part=snippet&safeSearch=none&type=video&maxResults=20&videoEmbeddable=true&q=';
          var vidSearchFunc = function() {
            var q = el.querySelector('#vidQuery').value;
            var resultDiv = el.querySelector('#results');
            resultDiv.innerHTML = '<span style="color:orange;">검색중입니다.</span>'
            GM_xmlhttpRequest({
              method: "GET",
              url: basicSearchUri + encodeURIComponent(q),
              onload: function(res) {
                resultDiv.innerHTML = '<ul></ul>';
                var ul = resultDiv.querySelector('ul');
                if (res.status != 200) {
                  resultDiv.innerHTML = '<span style="color:red;">검색중 오류가 발생했습니다.</span>';
                  return;
                }
                var jobj = JSON.parse(res.responseText);
                for (var i = 0; i < jobj.items.length; i++) {
                  var vidNow = jobj.items[i];
                  var li = document.createElement("li");
                  li.height = '90px';
                  li.innerHTML = '<img style="height: 90px;" src="' + vidNow.snippet.thumbnails.default.url + '"></img>' +
                    '<div style="position: relative; display: inline-block; margin-left: 5px; overflow: hidden; width: 670px; max-width: 100vw;">' +
                    '<span style="font-weight: bold; font-size: 12pt; margin-bottom: 3px;">' + vidNow.snippet.title + '</span><button name="insertThis" class="moreFlat">삽입</button><button name="preview" class="moreFlat">미리보기</button><br><span style="font-size:10pt;">' + vidNow.snippet.description + '</span>' +
                    '</div>';
                  li.querySelector('[name="preview"]').parentNode.dataset.videoId = vidNow.id.videoId;
                  li.querySelector('[name="preview"]').addEventListener('click', function(evt) {
                    var previewWin = TooSimplePopup();
                    previewWin.title('미리보기');
                    previewWin.content(function(el) {
                      var iframe = document.createElement("iframe");
                      iframe.setAttribute("frameborder", "0");
                      iframe.setAttribute("src", "//www.youtube.com/embed/" + evt.target.parentNode.dataset.videoId);
                      iframe.style.height = "360px";
                      iframe.style.width = "640px";
                      iframe.style.maxWidth = "100vw";
                      iframe.style.maxHeight = "calc(100vh - 80px)"
                      el.appendChild(iframe);
                    });
                    previewWin.button('닫기', previewWin.close);
                  });
                  li.querySelector('[name="insertThis"]').addEventListener('click', function(evt) {
                    finish(evt.target.parentNode.dataset.videoId);
                  })
                  ul.appendChild(li);
                }
              }
            });
          };

          el.querySelector('#searchVids').addEventListener('click', vidSearchFunc);
          el.querySelector('#vidQuery').addEventListener('keyup', function(evt) {
            if (evt.which == 13 || evt.keycode == 13) {
              vidSearchFunc();
              return false;
            }
          })
          el.querySelector('#vidUrl').focus();
        })
        win.button('닫기', win.close);
      }

      function MapMacro() {
        // title(text), content(callback), foot(callback), button(text,onclick), close
        var win = TooSimplePopup();
        win.title("지도 삽입");
        win.content(function(el) {
          var mapDiv = document.createElement("div");
          mapDiv.id = "NFMapDiv";
          mapDiv.style.maxHeight = "calc(100vh - 100px)";
          mapDiv.style.maxWidth = "100vw";
          mapDiv.style.height = '480px';
          mapDiv.style.width = '640px';
          el.appendChild(mapDiv);
          var initFuncContext = 'var NFMap;\n' +
            'function NFMapInit(){\n' +
            'var firstLocation=new google.maps.LatLng(37.46455,126.67435);\n' +
            'var mapOptions={\n' +
            'zoom: 8,\n' +
            'center: firstLocation\n,' +
            'streetViewControl: false\n' +
            '};\n' +
            'NFMap=new google.maps.Map(document.querySelector("#NFMapDiv"),mapOptions);\n' +
            '}';
          var onloadScript = document.createElement("script");
          onloadScript.innerHTML = initFuncContext;
          el.appendChild(onloadScript);
          setTimeout(function() {
            var mapsAPILib = document.createElement("script");
            mapsAPILib.setAttribute("src", "//maps.googleapis.com/maps/api/js?key=AIzaSyAqi9PjUr_F54U0whrbMeavFfvNap3kjvA&callback=NFMapInit");
            el.appendChild(mapsAPILib);
          }, 500);
        });
        win.button("삽입", function() {
          var lat = unsafeWindow.NFMap.getCenter().lat();
          var lng = unsafeWindow.NFMap.getCenter().lng();
          var zoom = unsafeWindow.NFMap.getZoom();
          TextProc.selectionText(TextProc.selectionText() + ' [Include(틀:지도,장소=' + lat + '%2C' + lng + ',zoom=' + zoom + ')] ');
          win.close();
        })
        win.button("닫기", win.close);
      }

      function DaumTVPotMarkUp() {
        var vurl = prompt('참고 : 개발중인 기능이므로 이상하게 작동할 수 있습니다.\n\n1. 삽입하고픈 TV팟 동영상을 봅니다\n2. 공유 버튼을 누릅니다.\n3. 거기서 복사한 URL을 입력하십시오.');
        var pattern2 = /http:\/\/tvpot\.daum\.net\/v\/(.+?)/;
        if (!pattern2.test(vurl)) {
          alert('지원되지 않는 주소 형식입니다.')
        } else {
          TextProc.selectionText(TextProc.selectionText() + '{{{#!html <iframe src="//videofarm.daum.net/controller/video/viewer/Video.html?vid=' + vurl.replace(pattern2, '$1') + '&play_loc=undefined&alert=true" style="max-height: 100%; max-width:100%;" frameborder=\'0\' scrolling=\'0\' width=\'640px\' height=\'360px\'></iframe>}}}');
        }
      };
      // Add Insertable Things
      var insertablesDropDown = Designer.dropdown('<span class="ion-paperclip"></span>').hoverMessage('삽입 가능한 미디어');
      insertablesDropDown.button('<span class="ion-social-youtube" style="color:red;"></span>', 'YouTube 동영상').click(InsertYouTube);
      insertablesDropDown.button('<span class="ion-map"></span>', '지도').click(MapMacro);
      insertablesDropDown.button('<span class="ion-ios-play-outline" style="color: Aqua;"></span>', '다음 TV팟 동영상').click(DaumTVPotMarkUp);
      insertablesDropDown.button('<span class="ion-images" style="color: #008275;"></span>', '나무위키 이미지 업로드').click(namuUpload);

      Designer.button('<span class="ion-ios-timer-outline"></span>').hoverMessage('아카이브하고 외부링크 삽입').click(function() {
        var win = TooSimplePopup();
        win.title("아카이브 한후 외부링크 삽입");
        var linkTo = "",
          linkText = "",
          WayBack = false,
          WayBack = false,
          WayBackAsMobile = false,
          archiveIs = false,
          archiveLinks = [];
        var refresh;
        win.content(function(container) {
          container.innerHTML = '<h1 style="margin: 0px 0px 5px 0px; font-size: 20px;">링크할 곳(외부링크)</h1>' +
            '<style>#linkTo, #visibleOutput {position: absolute; left: 120px;}</style>' +
            '<label>링크할 대상</label> <input type="text" id="linkTo" placeholder="e.g. http://www.naver.com" /><br>' +
            '<label>표시할 텍스트 (출력)</label> <input type="text" id="visibleOutput" placeholder="e.g. 구글" /><br>' +
            '<h1 style="margin: 5px 0px 5px 0px; font-size: 20px;">아카이브</h1>' +
            '<strong>참고</strong> : 동일한 주소의 아카이브를 자주 하다 보면 아까 했던 아카이브가 또 나올 수도 있습니다, 이런 경우엔 잠시 몇분정도 기다렸다가 하시면 됩니다.<br>' +
            '<strong>참고</strong> : 기존의 아카이브들은 무시됩니다.<br>' +
            '<strong style="color:red;">주의</strong> : 불안정한 기능입니다. 버그에 주의하세요.<br>' +
            '<input type="checkbox" id="WayBack" /> <label><a href="https://archive.org/web/" target="_blank">WayBack Machine</a>으로 아카이브</label>(<input type="checkbox" id="WayBackMobi" /> 모바일 버전으로)<br>' +
            '<input type="checkbox" id="archiveIs" /> <label><a href="https://archive.is/" target="_blank" checked>archive.is</a>에서 아카이브</label>';
          refresh = function() {
            linkTo = container.querySelector('#linkTo').value;
            linkText = container.querySelector('#visibleOutput').value;
            WayBack = container.querySelector('#WayBack').checked;
            WayBackAsMobile = container.querySelector('#WayBackMobi').checked;
            archiveIs = container.querySelector('#archiveIs').checked;
          }
        });
        win.button("박제/삽입", function() {
          var waitwin = TooSimplePopup();
          waitwin.title('박제중....');
          refresh();
          if (linkTo.indexOf('http://') != 0 && linkTo.indexOf('https://') != 0) {
            alert('http:// 또는 https://로 시작하는 외부링크가 아닙니다!');
          }
          waitwin.content(function(container) {
            container.innerHTML = '박제중입니다....'
          });

          function finishLinking() {
            var link = '[[' + linkTo + '|링크]]';
            if (archiveLinks.length != 0) {
              link += '(';
              for (var i = 0; i < archiveLinks.length; i++) {
                link += '[[' + archiveLinks[i] + '|아카이브' + (i + 1) + ']]';
                if (i != archiveLinks.length - 1) link += ',';
              }
              link += ')';
            }
            TextProc.selectionText(link + TextProc.selectionText());
            waitwin.close();
            win.close();
          }

          function archiveOne() {
            var archiveType;
            if (WayBack) {
              archiveType = 'wb';
              WayBack = false;
            } else if (archiveIs) {
              archiveType = 'ai';
              archiveIs = false;
            } else {
              finishLinking();
              return;
            }
            var r = {};
            if (archiveType == 'wb') {
              // 'http://web.archive.org/save/'
              // 1 -> Mobile Agent
              r.method = "GET";
              r.url = "http://web.archive.org/save/" + linkTo;
              if (WayBackAsMobile) {
                r.headers = {};
                r.headers["User-Agent"] = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A341 Safari/528.16";
              }
              r.onload = function(res) {
                if (res.status == 403) {
                  alert('오류가 발생했습니다. 크롤링이 금지된 사이트일 수도 있습니다.');
                  setTimeout(archiveOne, 50);
                  return;
                } else if (res.status != 200) {
                  alert('알 수 없는 오류가 발생했습니다.');
                  setTimeout(archiveOne, 50);
                  return;
                }
                var matches = /var redirUrl = \"(.+?)\";/.exec(res.responseText);
                if (matches == null) {
                  alert('WayBack Machine 아카이브 주소를 얻는 데 실패했습니다.');
                  setTimeout(archiveOne, 50);
                  return;
                }
                var archiveUrl = 'http://web.archive.org' + matches[1];
                archiveLinks.push(archiveUrl);
                setTimeout(archiveOne, 50);
              };
            } else if (archiveType == 'ai') {
              r.method = "GET";
              r.url = "https://archive.is";
              r.onload = function(res) {
                // get submitid
                var parser = new DOMParser();
                var indexDoc = parser.parseFromString(res.responseText, "text/html");
                var token = indexDoc.querySelector("input[name=submitid][value]");
                if (token) {
                  token = token.value;

                  // archive form
                  // 'http://archive.is/submit/'
                  var r2 = {};
                  r2.method = "POST";
                  r2.url = "https://archive.is/submit/";
                  r2.headers = {};
                  r2.headers["Content-Type"] = "application/x-www-form-urlencoded";
                  r2.data = "anyway=1&url=" + encodeURIComponent(linkTo) + "&submitid=" + encodeURIComponent(token);
                  r2.onload = function(res) {
                    var matches = /document\.location\.replace\("(.+?)"\)/.exec(res.responseText);
                    if (matches == null) matches = /<meta property="og:url" content="(.+?)"/.exec(res.responseText);
                    if (matches == null) {
                      alert('archive.is 아카이브 주소를 얻는 데 실패했습니다.');
                      setTimeout(archiveOne, 50);
                      return;
                    }
                    var archiveUrl = matches[1];
                    archiveLinks.push(archiveUrl);
                    setTimeout(archiveOne, 50);
                  }
                  GM_xmlhttpRequest(r2);
                } else {
                  alert('archive.is 아카이브 중 토큰을 얻는 데 실패했습니다.')
                }
              }
            }
            GM_xmlhttpRequest(r);
          }
          archiveOne();
        });
        win.button("닫기", win.close);
      });
      if (ENV.IsEditing) {
        // Manager Class
        var tempsaveManager = new function() {
          var ht = this;
          this.getTitles = function() {
            var r = [];
            for (var i in SET.tempsaves) {
              r.push(i);
            }
            return r;
          }
          this.getByTitle = function(docTitle) {
            SET.load();
            if (nOu(SET.tempsaves[docTitle])) {
              SET.tempsaves[docTitle] = [];
              SET.save();
            }
            return SET.tempsaves[docTitle]; // {section, text, timestamp}
          };
          this.getByTitleAndSectionNo = function(docTitle, sectno) {
            SET.load();
            var b = ht.getByTitle(docTitle);
            var a = [];
            for (var i = 0; i < b.length; i++) {
              if (b[i].section == sectno)
                a.push(b[i]);
            }
            return a;
          }
          this.save = function(docTitle, sectno, timestamp, text) {
            SET.load();
            if (nOu(SET.tempsaves[docTitle])) {
              SET.tempsaves[docTitle] = [];
              SET.save();
            }
            SET.tempsaves[docTitle].push({
              section: sectno,
              timestamp: timestamp,
              text: text
            });
            SET.save();
          }
          this.delete = function(docTitle, sectno, timestamp) {
            SET.load();
            if (nOu(SET.tempsaves[docTitle])) return;
            var newArray = [];
            for (var i = 0; i < SET.tempsaves[docTitle].length; i++) {
              var keepThis = true;
              var now = SET.tempsaves[docTitle][i];
              switch (arguments.length) {
                case 1:
                  keepThis = false;
                  break;
                case 2:
                  if (now.section == sectno) keepThis = false;
                  break;
                case 3:
                  if (now.section == sectno && now.timestamp == timestamp) keepThis = false;
                  break;
              }
              if (keepThis) {
                newArray.push(SET.tempsaves[docTitle][i]);
              }
            }
            SET.tempsaves[docTitle] = newArray;
            SET.save();
          }
          this.MigrateIfThereIs = function() {
            SET.load();
            var autosaves = JSON.parse(GM_getValue("AutoSavedDocuments", "null"));
            if (autosaves != null) {
              var pattern = /(.+?)###sec-(.+?)/;
              for (var i in autosaves) {
                var matches = pattern.exec(i);
                var title = matches[1];
                var sectno = matches[2];
                if (nOu(SET.tempsaves[title])) {
                  SET.tempsaves[title] = [];
                }
                for (var ii in autosaves[i]) {
                  ht.save(title, sectno, ii, autosaves[i][ii]);
                }
              }
              SET.save();
              GM_setValue("AutoSavedDocuments", "null");
            }
          };
        }
        tempsaveManager.MigrateIfThereIs();
        // Tempsave Menu
        var tempsaveDropdown = Designer.dropdown('<span class="ion-ios-pricetags-outline"></span>').hoverMessage('임시저장');
        tempsaveDropdown.button('<span class="ion-ios-pricetag-outline"></span>', '임시저장').click(function() {
          tempsaveManager.save(ENV.docTitle, ENV.section, Date.now(), txtarea.value);
        });
        tempsaveDropdown.button('<span class="ion-filing"></span>', '임시저장 불려오기').click(function() {
          // title(text), content(callback), foot(callback), button(text,onclick), close
          var win = TooSimplePopup();
          win.title('임시저장 불려오기')
          var tempsaveList = tempsaveManager.getByTitle(ENV.docTitle);
          win.content(function(el) {
            el.innerHTML = '<p>현재 편집중인 문단인 경우 문단 번호가 <strong>굵게</strong> 표시됩니다.<br>문단 번호가 -2인 경우는 문단 번호가 감지되지 않은 경우입니다.</p>';
            var divWithscrollbars = document.createElement("div");
            divWithscrollbars.style.height = '300px';
            divWithscrollbars.style.overflow = 'auto';
            var table = document.createElement("table");
            var headrow = document.createElement("tr");
            headrow.innerHTML = '<th>문단 번호</th><th>저장된 날짜와 시간</th><th>불려오기 버튼</th>';
            table.appendChild(headrow);
            for (var i = 0; i < tempsaveList.length; i++) {
              var now = tempsaveList[i];
              var tr = document.createElement("tr");
              tr.innerHTML = '<td>' + (now.section == ENV.section ? '<strong>' : '') + now.section + (now.section == ENV.section ? '</strong>' : '') + '</td><td>' + formatDateTime(now.timestamp) + '</td>'
              var td = document.createElement("td");
              var btn = document.createElement("button");
              btn.setAttribute("type", "button");
              btn.innerHTML = "불려오기";
              btn.dataset.json = JSON.stringify(now);
              btn.addEventListener('click', function(evt) {
                var now = JSON.parse(evt.target.dataset.json);
                txtarea.value = now.text;
              });
              td.appendChild(btn);
              tr.appendChild(td);
              table.appendChild(tr);
            }
            divWithscrollbars.appendChild(table);
            el.appendChild(divWithscrollbars);
          });
          win.button('닫기', win.close);
        });
        tempsaveDropdown.button('<span class="ion-trash-a" style="color:red;"></span>', '이 문서의 모든 임시저장 삭제').click(function() {
          tempsaveManager.delete(ENV.docTitle);
        });
        tempsaveDropdown.button('<span class="ion-trash-a" style="color:orangered;"></span>', '이 문서의 이 문단의 모든 임시저장 삭제').click(function() {
          tempsaveManager.delete(ENV.docTitle, ENV.section);
        });
        tempsaveDropdown.button('<span class="ion-trash-a" style="color:orange;"></span>', '특정 임시저장만 삭제').click(function() {
          // title(text), content(callback), foot(callback), button(text,onclick), close
          var win = TooSimplePopup();
          var tempsaveList = tempsaveManager.getByTitle(ENV.docTitle);
          win.title('임시저장 삭제');
          win.content(function(el) {
            el.innerHTML = '<p>현재 편집중인 문단인 경우 문단 번호가 <strong>굵게</strong> 표시됩니다.<br>문단 번호가 -2인 경우는 문단 번호가 감지되지 않은 경우입니다.</p>';
            var divWithscrollbars = document.createElement("div");
            divWithscrollbars.style.height = '300px';
            divWithscrollbars.style.overflow = 'auto';
            var table = document.createElement("table");
            var headrow = document.createElement("tr");
            headrow.innerHTML = '<th>문단 번호</th><th>저장된 날짜와 시간</th><th>삭제 버튼</th>';
            table.appendChild(headrow);
            for (var i = 0; i < tempsaveList.length; i++) {
              var now = tempsaveList[i];
              var tr = document.createElement("tr");
              tr.innerHTML = '<td>' + (now.section == ENV.section ? '<strong>' : '') + now.section + (now.section == ENV.section ? '</strong>' : '') + '</td><td>' + formatDateTime(now.timestamp) + '</td>'
              var td = document.createElement("td");
              var btn = document.createElement("button");
              btn.setAttribute("type", "button");
              btn.innerHTML = "삭제하기";
              btn.dataset.json = JSON.stringify(now);
              btn.addEventListener('click', function(evt) {
                var now = JSON.parse(evt.target.dataset.json);
                tempsaveManager.delete(ENV.docTitle, now.section, now.timestamp);
                win.close();
              });
              td.appendChild(btn);
              tr.appendChild(td);
              table.appendChild(tr);
            }
            divWithscrollbars.appendChild(table);
            el.appendChild(divWithscrollbars);
          });
          win.button('닫기', win.close);
        });
        setInterval(function() {
          tempsaveManager.save(ENV.docTitle, ENV.section, Date.now(), txtarea.value);
        }, 600000);
      }
      // Template Insert Feature
      var templatesDropdown = Designer.dropdown('<span class="ion-ios-copy-outline"></span>').hoverMessage('템플릿 삽입/최근에 사용한 템플릿');
      var refreshTemplatesDropdown = function() {
        SET.load();
        templatesDropdown.clear();
        var rutl = SET.recentlyUsedTemplates.length;

        function InsertTemplateClosure(na) {
          return function() {
            GM_xmlhttpRequest({
              method: 'GET',
              url: 'https://namu.wiki/raw/' + na,
              onload: function(res) {
                if (res.status == 404) {
                  alert('존재하지 않는 템플릿입니다.');
                  return;
                }
                SET.load();
                if (SET.recentlyUsedTemplates.indexOf(na) == -1) SET.recentlyUsedTemplates.push(na);
                SET.save();
                txtarea.value = res.responseText;
                setTimeout(refreshTemplatesDropdown, 300);
              }
            })
          };
        }
        for (var i = 0; i < (rutl < 5 ? rutl : 5); i++) {
          templatesDropdown.button('<span class="ion-ios-paper-outline"></span>', SET.recentlyUsedTemplates[i]).click(InsertTemplateClosure(SET.recentlyUsedTemplates[i]));
        }
        templatesDropdown.button('<span class="ion-close-round"></span>', '기록 삭제').click(function() {
          SET.load();
          SET.recentlyUsedTemplates = [];
          SET.save();
          setTimeout(refreshTemplatesDropdown, 300);
        });
        templatesDropdown.button('<span class="ion-plus-round"></span>', '템플릿 삽입').click(function() {
          var templateName = prompt('템플릿 이름을 입력하세요.');
          if (!/^템플릿:.+/.test(templateName) && !/.+Template$/.test(templateName) && !confirm('올바른 템플릿 이름이 아닌 것 같습니다. 계속할까요?')) return;
          InsertTemplateClosure(templateName)();
          setTimeout(refreshTemplatesDropdown, 300);
        });
      };
      setTimeout(refreshTemplatesDropdown, 500);

      // set Size
      if (ENV.Discussing)
        rootDiv.style.height = '170px';
      else
        rootDiv.style.height = '600px';

      // Add Keyboard Shortcut
      txtarea.addEventListener('keyup', function(evt) {
        if (evt.ctrlKey && evt.altKey) {
          switch (evt.keyCode) { // Ctrl
            case 66: // B
            case 98:
              TextProc.ToggleWrapSelection("'''");
              break;
            case 73: // I
            case 105:
              TextProc.ToggleWrapSelection("''");
              break;
            case 68: // D
            case 100:
              TextProc.ToggleWrapSelection("--");
              break;
            case 85: // U
            case 117:
              TextProc.ToggleWrapSelection("__");
              break;
            case 219:
            case 123:
            case 91: // [
              FontSizeChanger(false);
              break;
            case 221:
            case 125:
            case 93: // ]
              FontSizeChanger(true);
              break;
          }
        } else if (evt.ctrlKey && evt.shiftKey) { // Ctrl + Shift
          switch (evt.keyCode) {
            case 83: // S
            case 115:
              tempsaveManager.save(ENV.docTitle, ENV.section, Date.now(), txtarea.value);
              break;
            case 73: // I
            case 105:
              namuUpload();
              break;
          }
        } else {
          return;
        }
        return false;
      });

      // Add NamuFix Div
      var oldTextarea = document.querySelector("textarea");
      var wText = oldTextarea.value;
      oldTextarea.parentNode.insertBefore(rootDiv, oldTextarea);
      oldTextarea.parentNode.removeChild(oldTextarea);
      txtarea.value = wText;

      var srwPattern = /\?redirectTo=([^\&]+)/;
      if (srwPattern.test(location.search)) {
        if ((txtarea.value.trim().search(/^#redirect .+/) == 0 || txtarea.value.trim().length == 0) || confirm('빈 문서가 아닌것 같습니다만 그래도 계속?')) {
          txtarea.value = '#redirect ' + decodeURIComponent(srwPattern.exec(location.search)[1]);
          if (document.querySelectorAll('iframe[title="CAPTCHA 위젯"]').length == 0) {
            if (document.querySelector("input#logInput")) document.querySelector("input#logInput").value = "NamuFix를 이용하여 자동 리다이렉트 처리됨.";
            document.querySelector('#editBtn').click();
          }
        }
      }
    }
  } else if (ENV.IsDocument) {
    // 버튼 추가 함수
    function addButton(text, onclick) {
      var aTag = document.createElement("a");
      aTag.className = "btn btn-secondary";
      aTag.setAttribute("role", "button");
      aTag.innerHTML = text;
      aTag.href = "#NothingToLink";
      aTag.addEventListener('click', onclick);
      document.querySelector('.wiki-article-menu > div.btn-group').appendChild(aTag);
    };

    // 리다이렉트 버튼 추가
    addButton('리다이렉트', function(evt) {
      evt.preventDefault();

      var redirectFrom = prompt('어느 문서에서 지금 이문서로 리다이렉트?');
      if (redirectFrom != null && redirectFrom.trim().length != 0)
        location.href = 'https://namu.wiki/edit/' + redirectFrom + '?redirectTo=' + ENV.docTitle;
    });

    // 리다이렉트로 왔을 시 그 라디이렉트 문서 편집/삭제 링크 추가
    if (document.querySelector('div.top-doc-desc a.document') && document.querySelector('div.top-doc-desc').innerHTML.indexOf('에서 넘어옴') != -1) {
      function insertLinkinto(link, element, label, color) {
        var aTag = document.createElement('a');
        aTag.href = link;
        aTag.innerHTML = label;
        if (typeof color !== 'undefined') aTag.style.color = color;
        element.appendChild(aTag);
      }
      var rdTag = document.querySelector('div.top-doc-desc a.document');
      var rdDocumentName = decodeURIComponent(/\/w\/(.+?)\?noredirect=1/.exec(rdTag.href)[1]);
      var editUrl = '/edit/' + rdDocumentName;
      var deleteUrl = '/delete/' + rdDocumentName;

      var sup = document.createElement("sup");
      rdTag.parentNode.insertBefore(sup, rdTag.nextSibling);
      insertLinkinto(editUrl, sup, '(편집)');
      insertLinkinto(deleteUrl, sup, '(삭제)', 'red');
    }
    // 상위 문서로의 링크
    if (ENV.docTitle.indexOf('/') != -1) {
      function spSplit(a, b) {
        var splitted = a.split(b);
        var result = [];
        for (var i = 1; i <= splitted.length; i++) {
          var now = '';
          for (var ii = 0; ii < i; ii++) {
            var append = splitted[ii];
            if (ii != i - 1) append += '/';
            now += append;
          }
          result.push(now);
        }
        return result;
      }
      var higherDocsWE = {};
      var higherDocs = spSplit(ENV.docTitle, '/');
      for (var i = 0; i < higherDocs.length; i++) {
        higherDocsWE[i] = null;
      }
      var codwe = 0;
      var codwnf = 0;
      for (var i = 0; i < higherDocs.length; i++) {
        getRAW(higherDocs[i], function(r, t) {
          higherDocsWE[t] = true;
          codwe++;
        }, function(t) {
          higherDocsWE[t] = false;
          codwnf++;
        });
        if (i == higherDocs.length - 1) {
          var hdinid = setInterval(function() {
            if (codwe + codwnf != higherDocs.length) return;
            var docTitleTag = document.querySelector('h1.title');
            var hdsPT = document.createElement("p");
            var sstl = 0;
            for (var i = 0; i < higherDocs.length; i++) {
              if (!higherDocsWE[higherDocs[i]]) continue;
              var higherDoc = higherDocs[i];
              var a = document.createElement("a");
              a.setAttribute("href", '/w/' + encodeURIComponent(higherDoc));
              a.setAttribute("title", higherDoc);
              a.className = "wiki-link-internal";
              if (i != 0 && higherDoc.substring(sstl).indexOf('/') == 0)
                a.innerHTML = higherDoc.substring(sstl + 1);
              else
                a.innerHTML = higherDoc.substring(sstl);
              sstl = higherDoc.length;
              hdsPT.appendChild(a);
              if (i != higherDocs.length - 1) hdsPT.appendChild(document.createTextNode(" > "));
            }
            docTitleTag.style.marginBottom = '0px';
            hdsPT.style.marginBottom = '25px';
            docTitleTag.parentNode.insertBefore(hdsPT, docTitleTag.nextSibling);
            clearInterval(hdinid);
          }, 200);
        }
      }
    }
  }

  if (ENV.Discussing) {
    // 아이덴티콘 설정들과 변수들
    var isIcon = SET.discussIdenti == 'icon';
    var isThreadicLike = SET.discussIdenti == 'headBg';
    var isIdenticon = SET.discussIdenti == 'identicon';
    var colorDictionary = {},
      identiconDictionary = {};

    // #[0-9]+ 엥커 미리보기
    function mouseoverPreview() {
      var anchors = document.querySelectorAll('.res .r-body .wiki-link-anchor:not([data-nf-title-processed])');
      for (var i = 0; i < anchors.length; i++) {
        var anchor = anchors[i];
        if (!/#[0-9]+$/.test(anchor.href) || anchor.title != ENV.docTitle + '#' + /#([0-9]+)$/.exec(anchor.href)[1]) {
          continue;
        }
        var anchorDirection = document.querySelector('.r-head .num a[id=\'' + /#([0-9]+)$/.exec(anchor.href)[1] + '\']');

        anchor.dataset.target = (anchorDirection) ? anchorDirection.id : "";
        anchor.addEventListener('mouseenter', function(evt) {
          var anchorDirection = document.getElementById(evt.target.dataset.target);
          var obj = {};
          if (anchorDirection == null) {
            obj = {
              talker: "?????????",
              message: "존재하지 않는 메세지입니다.",
              notExists: true
            }
          } else {
            var anchorTarget = anchorDirection.parentNode.parentNode.parentNode;
            obj = {
              talker: anchorTarget.querySelector('.r-head > a').textContent,
              message: anchorTarget.querySelector('.r-body').innerHTML,
              notExists: false
            };
          }
          var elem = document.createElement("div");
          elem.className = 'nfTopicMessage';
          elem.innerHTML = '<div style="font-size: 18px; font-weight: 500; font-family: sans-serif; height: 18px;">{0}</div><div style="margin-top: 15px;">{1}</div>'.format(obj.talker, obj.message);
          elem.style.position = 'absolute';
          elem.style.padding = '10px';
          elem.style.color = 'white';
          elem.style.borderRadius = '4px';
          elem.style.background = obj.notExists ? 'red' : 'black';
          elem.style.zIndex = 3;
          evt.target.appendChild(elem);
          evt.target.title = '';
        });
        anchor.addEventListener('mouseleave', function(evt) {
          //var obj = JSON.parse(evt.target.dataset.targetMessage);
          if (evt.target.querySelector('.nfTopicMessage')) {
            var elemToRemove = evt.target.querySelector('.nfTopicMessage');
            elemToRemove.parentNode.removeChild(elemToRemove);
          }
        });

        anchor.dataset.nfTitleProcessed = true;
      }
      setTimeout(mouseoverPreview, 300);
    }

    function previewAsQuote() {
      var message = document.querySelector('.res:not([data-message-anchor-processed])');
      if (message) {
        message.dataset.messageAnchorProcessed = true;
        var rbody = message.querySelector('.r-body');
        var anchors = rbody.querySelectorAll('.wiki-link-anchor:not([data-nf-title-processed])');
        for (var i = 0; i < anchors.length; i++) {
          var anchor = anchors[i];
          if (!/#[0-9]+$/.test(anchor.href) || anchor.title != ENV.docTitle + '#' + /#([0-9]+)$/.exec(anchor.href)[1]) {
            continue;
          }
          var numbericId = /#([0-9]+)$/.exec(anchor.href)[1];
          var anchorDirection = document.querySelector('.r-head .num a[id=\'' + numbericId + '\']');
          if (anchorDirection == null) continue;
          var anchorTarget = anchorDirection.parentNode.parentNode.parentNode;
          var talker = anchorTarget.querySelector('.r-head > a').textContent,
            message = anchorTarget.querySelector('.r-body').innerHTML,
            talkedAt = anchorTarget.querySelector('.r-head > span.pull-right').textContent;
          var blockquoteId = uniqueID();
          var blockquoteElement = document.createElement("blockquote");
          blockquoteElement.className = "wiki-quote nf-anchor-preview";
          blockquoteElement.innerHTML = message;
          blockquoteElement.id = blockquoteId;
          blockquoteElement.innerHTML += '<div style="text-align: right; font-style: italic;">--#{1}, {0}, {2}</div>'.format(talker, numbericId, talkedAt);
          rbody.insertBefore(blockquoteElement, rbody.firstChild);

          anchor.dataset.quoteId = blockquoteId;
          anchor.addEventListener('mouseenter', function(evt) {
            var quote = document.getElementById(evt.target.dataset.quoteId);
            quote.style.borderColor = '#CCC #CCC #CCC red !important';
            quote.style.boxShadow = '2px 2px 3px orange';
          });
          anchor.addEventListener('mouseleave', function(evt) {
            var quote = document.getElementById(evt.target.dataset.quoteId);
            quote.style.borderColor = '';
            quote.style.boxShadow = '';
          })
        }
        setTimeout(previewAsQuote, 300);
      }
    }
    var previewFunction;
    switch (SET.discussAnchorPreviewType) {
      case 1:
        previewFunction = mouseoverPreview;
        break;
      case 2:
        GM_addStyle('' +
          'blockquote.nf-anchor-preview{' +
          'border-color: #CCC #CCC #CCC #FF9900 !important;' +
          'background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABTklEQVRoge2ZvYrCQBSF71ulEVLIFIIgC5LOaQRhwcbCKSLbCYtFunmDBTuLEKwEKx9ASOsjWNlYni2WwK5ZV83PTMa9B053IedjJpCcS8RisZ5baaIxG/YhfA+eZ8i+QH84g05SlAofSd9c6Cv2ZVQMIuy0rIfP3OqEj0GsQ2E99KVFuL4fQjYgcN7yPoDjctyAsL97vDzehtjrwHrQaw70ngEYgAEYgAFsA4gR9OaAEwDghMNGYyRqmqkeoIfF7oxLnXcL9CqfqQVAIc49FgBiqMpn+ASe8h2wawawbQawbQaw7f8B4HwrQeR4L0REFKt2AwL/dFvFj9WL6sZ3iVELVazgnQcNaKeDebmKPU00poOu8f1AdzAtvx+oQ+HLX7V9watiWttIwncZINNrboniGAAR0eot+HYaDgJk+vqddBiAiOhj8u42AItlQZ8Z9UiwBSnJVAAAAABJRU5ErkJggg==") !important;' +
          'margin: 0.5em 0px !important;' +
          '}'
        );
        previewFunction = previewAsQuote;
        break;
      default:
        previewFunction = function() {};
    }

    // 인용형식 앵커 미리보기안의 앵커 미리보기 삭제 옵션 설정시 CSS 추가
    if (SET.removeNFQuotesInAnchorPreview) {
      GM_addStyle("blockquote.nf-anchor-preview blockquote.nf-anchor-preview {display: none;}");
    }

    // 아이덴티콘
    function identiconLoop() {
      if (/^https?:\/\/(?:no-ssl\.|)namu\.wiki\/discuss\/(.+?)/.test(location.href)) return;
      var messages = document.querySelectorAll('.res:not([data-nfbeauty])');
      var colorHash = isThreadicLike ? new ColorHash({
        lightness: Number(SET.discussIdentiLightness),
        saturation: Number(SET.discussIdentiSaturation)
      }) : new ColorHash();
      if (isIdenticon && document.querySelector('#nf-identicon-css') == null) {
        var cssContent = 'div.nf-identicon { border: 1px solid #808080; margin: 10px; width: 64px; border: 1px black solid; background: white;} .res[data-nfbeauty] {margin-left: 88px; position: relative; top: -76px;}';
        var styleTag = document.createElement("style");
        styleTag.innerHTML = cssContent;
        styleTag.id = "nf-identicon-css";
        document.head.appendChild(styleTag);
      }
      for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
        if (isIcon && message.querySelector('.first-author')) continue;
        if (message.querySelector('[data-nfbeauty]')) continue;
        var n = message.querySelector('.r-head > a').innerHTML;
        if (n.indexOf("/contribution/author") == 0) {
          // 로그인
          n = '!ID!' + n;
        } else {
          // IP
          n = '!IP!' + n;
        }
        n = SHA512(n);

        var nColor;
        if (typeof colorDictionary[n] === 'undefined') {
          nColor = colorHash.hex(n);
          colorDictionary[n] = nColor;
        } else {
          nColor = colorDictionary[n];
        }

        if (isThreadicLike) {
          message.querySelector('.r-head').style.background = nColor;
          message.querySelector('.r-head').style.color = 'white';
          message.querySelector('.r-head > a').style.color = 'white';
          message.querySelector('.r-head .num a').style.color = 'white';
        } else if (isIcon) {
          var a = message.querySelector('.r-head > a');
          var span = document.createElement("span");
          span.style.background = nColor;
          span.style.color = nColor;
          span.style.marginLeft = '1em';
          span.innerHTML = '__';
          a.parentNode.insertBefore(span, a.nextSibling);
        } else if (isIdenticon) {
          var identicon = document.createElement("div");
          identicon.className = "nf-identicon";
          identicon.innerHTML = '<a><img style="width: 64px; height: 64px;"></img></a>';
          identicon.querySelector("img").dataset.hash = n;
          identicon.querySelector("a").dataset.hash = n;
          identicon.querySelector("a").href = "#NothingToLink";
          identicon.querySelector("a").addEventListener('click', function(evt) {
            evt.preventDefault();

            SET.load();
            var h = evt.target.dataset.hash;
            if (typeof SET.customIdenticons[h] !== 'undefined') {
              // custom identicon exists
              if (confirm('이미 이미지가 설정되어 있습니다. 제거할까요?')) {
                delete SET.customIdenticons[h];
                SET.save();
              }
            } else {
              if (!confirm('이 아이디 또는 닉네임에 기존 아이덴티콘 대신 다른 이미지를 설정할 수 있습니다.\n설정할까요?')) return;
              // doesn't exists
              getFile(function(files, finish) {
                if (files.length < 0) {
                  alert('선택된 파일이 없습니다.')
                  if (isLastItem) finish();
                  return;
                }
                if (files.length > 1) {
                  alert('한 개의 파일만 선택해주세요.');
                  finish();
                  return;
                }
                var file = files[0];
                if (file) {
                  var reader = new FileReader();
                  reader.onload = function(evt) {
                    SET.customIdenticons[h] = reader.result;
                    SET.save();
                    alert('설정됐습니다.');
                    finish();
                  };
                  reader.readAsDataURL(file);
                }
              });
            }
          });
          if (typeof identiconDictionary[n] === 'undefined' && typeof SET.customIdenticons[n] !== 'undefined')
            identiconDictionary[n] = SET.customIdenticons[n];
          if (typeof identiconDictionary[n] === 'undefined')
            identiconDictionary[n] = "data:image/png;base64," + new Identicon(n, 64).toString();
          var identiconImage = identiconDictionary[n];
          identicon.querySelector('img').src = identiconImage;
          message.parentNode.insertBefore(identicon, message);

          if (message.parentNode.dataset.id != 1) {
            message.parentNode.style.marginTop = '-76px';
            identicon.style.marginTop = '-66px';
          }
        }
        message.querySelector('.r-head > a').dataset.nfbeauty = true;
        message.dataset.nfbeauty = true;
      }
    }

    function checkIP(vpngateIP) {
      var message = document.querySelector(".res:not([data-ip-checked])");
      if (message) {
        message.dataset.ipChecked = true;
        var ipLink = message.querySelector(".r-head > a");
        var ipPattern = /\/contribution\/ip\/([a-zA-Z0-9\.:]+)\/(?:document|discuss)$/;
        if (ipPattern.test(ipLink.href)) {
          var ip = ipPattern.exec(ipLink.href)[1];
          console.log(ip);
          GM_xmlhttpRequest({
            method: "GET",
            url: "https://tools.keycdn.com/geo.json?host={0}".format(ip),
            onload: function(res) {
              var resObj = JSON.parse(res.responseText);

              var span = document.createElement("span");
              span.style.marginLeft = "1em";
              span.style.color = "red";

              if (resObj.status == "success") {
                var country = resObj.data.geo.country_code;
                var countryName = resObj.data.geo.country_name;
                var isp = resObj.data.geo.isp;
                console.log(country);
                console.log(countryName);
                console.log(isp);

                span.innerHTML = '<span class="flag-icon flag-icon-{0}"></span> [{1}{2}]'.format(country.toLowerCase(), isp, vpngateIP.indexOf(ip) != -1 ? " (VPNGATE)" : "");
              } else {
                span.innerHTML = "[IP조회실패]"
              }
              ipLink.parentNode.insertBefore(span, ipLink.nextSibling);
              console.log(span);

              checkIP(vpngateIP);
            }
          });
        } else {
          checkIP(vpngateIP);
        }
      }
    }

    function discussLoop() {
      // check vpngate
      if(SET.lookupIPonDiscuss)
      getVPNGateIPList(function(result) {
        checkIP(result);
      })

      // attach identicon
      identiconLoop();

      // make previewAsQuote
      previewFunction();
    }
    discussLoop();
    var observer = new MutationObserver(discussLoop);
    observer.observe(document.querySelector("#res-container"), {
      childList: true
    });

    // 취소선 숨기기
    switch (SET.hideDeletedWhenDiscussing) {
      case 1:
        GM_addStyle('.res .r-body del {display: none;}');
        break;
      case 0.5:
        GM_addStyle('.res .r-body del, .res .r-body del a {color: transparent; background: transparent;} .res .r-body del {border: dotted 1px red;}');
        break;
    }
  } else if (ENV.IsUserPage) {
    function insertBeforeTable(element) {
      var bread = document.querySelector("article > ol.breadcrumb.link-nav");
      bread.parentNode.insertBefore(element, bread);
    }

    function makeHeatTable(times) {
      try {
        // 가공
        var maps = {}; // { day: {0: int, 1: int}, .... }
        var maxValue = 0;
        for (var i = 0; i < 7; i++) {
          maps[i] = {};
          for (var ii = 0; ii < 24; ii++) {
            maps[i][ii] = 0;
          }
        }
        for (var i = 0; i < times.length; i++) {
          var ti = times[i];
          var v = ++maps[ti.getDay()][ti.getHours()];
          if (maxValue < v) maxValue = v;
        }

        // 표 생성
        var table = document.createElement("table");
        var headTr = document.createElement("tr");
        headTr.innerHTML = '<th>요일</th>';
        table.appendChild(headTr);
        var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        for (var i = 0; i < 7; i++) {
          var tr = document.createElement("tr");
          tr.innerHTML += '<th>{0}</th>'.format(dayNames[i]);
          for (var ii = 0; ii < 24; ii++) {
            var td = document.createElement("td");
            td.innerHTML = '&nbsp;'
            td.style.background = 'rgba(61,0,61,{0})'.format(maps[i][ii] / maxValue);
            if (i == 0) {
              function twoDigits(a) {
                var p = String(a);
                return p.length == 1 ? '0' + p : p;
              }
              headTr.innerHTML += '<th>{0}:00 ~ {1}:00</th>'.format(twoDigits(ii), twoDigits(ii + 1))
            }
            tr.appendChild(td);
          }
          table.appendChild(tr);
        }
        return table;
      } catch (err) {
        alert(err.message);
      }
    }

    var p = document.createElement("p");
    p.innerHTML += '<style>.contInfo { border-collapse: collapse; border: 1px solid black; padding: 2px;} #contInfo td {padding: 3px;} #contInfo td:nth-child(2) {border-left: 1px solid black;}</style>';
    var ipPattern = /\/ip\/([a-zA-Z0-9:\.]+)\/(?:document|discuss)(?:#.+|)$/;
    if (ipPattern.test(location.href)) {
      // ip
      // insert CSS if not exists
      if (document.querySelector('link[href$="flag-icon.min.css"]') == null) {
        var link = document.createElement("link");
        link.href = "/css/lib/flag-icon-css/css/flag-icon.min.css";
        link.setAttribute("rel", "stylesheet");
        document.head.appendChild(link);
      }
      // check ip
      var ip = ipPattern.exec(location.href)[1];
      var ipInfo = document.createElement("p");
      ipInfo.innerHTML = '<div style="border: 1px black solid; padding: 2px;">IP 관련 정보를 조회중입니다. 잠시만 기다려주세요.</div>'
      insertBeforeTable(ipInfo);
      getVPNGateIPList(function(result) {
        GM_xmlhttpRequest({
          method: "GET",
          url: "http://ip-api.com/json/{0}".format(ip),
          onload: function(res) {
            var resObj = JSON.parse(res.responseText);
            var country = resObj.countryCode;
            var countryName = resObj.country;
            var isp = resObj.isp;
            ipInfo.innerHTML = (
              "<table class=\"contInfo\">" +
              "<tbody>" +
              "<tr><td>국가</td><td><span class=\"flag-icon flag-icon-{0}\"></span> {1}</td></tr>" + // {0} : cotunry, {1} : countryName
              "<tr><td>통신사</td><td>{2}</td></tr>" +
              "<tr><td>VPNGATE?</td><td>{3}</td></tr>" +
              "</tbody>" +
              '<tfoot>' +
              '<tr><td colspan="2" style="border-top: 1px solid black;">기술적인 한계로, VPNGATE 여부는 "현재 VPNGATE VPN인가?"의 여부이지, "작성 당시에 VPNGATE VPN인가?"의 여부가 아닙니다.</td></tr>' +
              '</foot>' +
              "</table>"
            ).format(country.toLowerCase(), countryName, isp, result.indexOf(ip) != -1 ? "Y" : "N");
          }
        });
      });
    }

    if (/\/document(?:#.+|)$/.test(location.href)) {
      var rows = document.querySelectorAll('table tbody tr');
      var contCount = 0,
        contTotalBytes = 0,
        contDocuments = 0,
        deletedDocuments = [],
        createdDocuments = [],
        contributedAt = [];
      var documents = [];
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.querySelectorAll('a').length == 0) continue;
        var documentName = row.querySelector('a').getAttribute('href');
        var contributedBytes = row.querySelector('span.f_r > span').innerHTML;
        var negativeContribution = /^\-[0-9]+/.test(contributedBytes);
        if (/^\+[0-9]+/.test(contributedBytes)) contributedBytes = contributedBytes.substring(contributedBytes.indexOf('+'));
        contributedBytes = Number(contributedBytes);
        if (documents.indexOf(documentName) == -1) documents.push(documentName);
        contCount++;
        if (negativeContribution)
          contTotalBytes -= contributedBytes;
        else
          contTotalBytes += contributedBytes;
        if (row.querySelector('i')) {
          var italicText = row.querySelector('i').innerHTML;
          if (italicText == '(새 문서)' && createdDocuments.indexOf(documentName) == -1) createdDocuments.push(documentName);
          else if (italicText == '(삭제)' && deletedDocuments.indexOf(documentName) == -1) deletedDocuments.push(documentName);
        }

        if (row.querySelector('time')) {
          contributedAt.push(new Date(row.querySelector('time').getAttribute("datetime")));
        }
      }
      p.innerHTML += ('<table class="contInfo">' +
        '<tfoot>' +
        '<tr><td colspan="2" style="border-top: 1px solid black;">최근 30일간의 데이터만 반영되었으므로, 최근 30일 간의 기여 정보입니다.</td></tr>' +
        '</foot>' +
        '<tbody>' +
        '<tr><td>총 기여 횟수</td><td>{0}회</td></tr>' +
        '<tr><td>기여한 바이트 총합</td><td>{1}bytes</td></tr>' +
        '<tr><td>총 기여한 문서 (ACL 변경, 문서 이동 포함) 수</td><td>{2}개</td></tr>' +
        '<tr><td>삭제한 문서 수</td><td>{3}개</td></tr>' +
        '<tr><td>새로 만든 문서 수</td><td>{4}개</td></tr>' +
        '<tr><td>한 문서당 평균 기여 바이트</td><td>{5}bytes</td></tr>' +
        '<tr><td>시간대별 기여/활동 횟수 총합(문서 기여)</td><td><a href="#NothingToLink" id="punch">여기를 눌러 확인</a></td></tr>' +
        '</tbody>' +
        '</table>').format(contCount, contTotalBytes, documents.length, deletedDocuments.length, createdDocuments.length, (contTotalBytes / documents.length));
      p.querySelector('a#punch').addEventListener('click', function(evt) {
        evt.preventDefault();

        var win = TooSimplePopup();
        win.title('시간대별 기여/활동 횟수 총합(문서 기여)');
        win.content(function(element) {
          element.appendChild(makeHeatTable(contributedAt));
        });
        win.button('닫기', win.close);
      })
    } else if (/\/discuss(?:#.+|)$/.test(location.href)) {
      function standardDeviation(numbers) {
        var total = 0;
        for (var i = 0; i < numbers.length; i++) {
          total += numbers[i];
        }
        var avg = total / numbers.length;
        var temp1 = 0;
        for (var i = 0; i < numbers.length; i++) {
          temp1 += Math.pow(numbers[i] - avg, 2);
        }
        temp1 /= numbers.length;
        return Math.sqrt(temp1);
      }
      var rows = document.querySelectorAll('table tbody tr');
      var docuAndTalks = {};
      var talkedAt = [];
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.querySelectorAll('a').length == 0) continue;
        var docuNow = rows[i].querySelector('a').getAttribute('href');
        docuNow = /^\/topic\/([0-9]+)(?:#[0-9]+|)/.exec(docuNow)[1];
        if (docuAndTalks[docuNow]) {
          docuAndTalks[docuNow]++;
        } else {
          docuAndTalks[docuNow] = 1;
        }
        if (row.querySelector('time')) {
          talkedAt.push(new Date(row.querySelector('time').getAttribute("datetime")));
        }
      }
      var totalTalks = 0,
        avgTalks = 0,
        discussCount = 0,
        Talks = [];
      for (var i in docuAndTalks) {
        totalTalks += docuAndTalks[i];
        Talks.push(docuAndTalks[i]);
      }
      discussCount = Object.keys(docuAndTalks).length;
      avgTalks = totalTalks / discussCount;
      p.innerHTML += ('<table class="contInfo">' +
        '<tfoot>' +
        '<tr><td colspan="2" style="border-top: 1px solid black;">최근 30일 간의 토론 정보만 반영되었으므로, 최근 30일 간의 토론 정보입니다.</td></tr>' +
        '</tfoot>' +
        '<tbody>' +
        '<tr><td>총 발언 수</td><td>{0}</td></tr>' +
        '<tr><td>참여한 토론 수</td><td>{1}</td></tr>' +
        '<tr><td>한(1) 토론당 평균 발언 수</td><td>{2}</td></tr>' +
        '<tr><td>한(1) 토론당 발언 수 표준편차</td><td>{3}</td></tr>' +
        '<tr><td>시간대별 기여/활동 횟수 총합(토론)</td><td><a href="#NothingToLink" id="punch">여기를 눌러 확인</a></td></tr>' +
        '</tbody>' +
        '</table>').format(totalTalks, discussCount, avgTalks, standardDeviation(Talks));
      p.querySelector('a#punch').addEventListener('click', function(evt) {
        evt.preventDefault();

        var win = TooSimplePopup();
        win.title('시간대별 기여/활동 횟수 총합(토론)');
        win.content(function(container) {
          container.appendChild(makeHeatTable(talkedAt));
        });
        win.button('닫기', win.close);
      })
    } else {
      delete p;
    }
    if (typeof p !== 'undefined') insertBeforeTable(p);
  } else if (ENV.IsDiff) {
    setTimeout(function() {
      try {
        var diffTitle = document.querySelector('#diffoutput thead th.texttitle');
        if (diffTitle == null) return;
        var baseUri = ENV.IsSSL ? "https://namu.wiki" : "http://no-ssl.namu.wiki";
        var newDifftitle = '<span style="font-weight:lighter;"><a href="{0}/diff/{1}?oldrev={2}&rev={3}">(r{2} vs r{3})</a></span> <a href="{0}/w/{1}?rev={3}" title="r{3} 버전 보기">r{3}</a> vs. <a href="{0}/w/{1}?rev={4}" title="r{4} 버전 보기">r{4}</a> <span style="font-weight:lighter;"><a href="{0}/diff/{1}?oldrev={4}&rev={5}">(r{4} vs r{5})</a></span> <span style="font-weight: lighter;"><a href="{0}/history/{1}">(이 문서의 역사)</a></span>'.format(
          baseUri /*{0}*/ , ENV.docTitle /*{1}*/ , ENV.beforeRev - 1 /*{2}*/ , ENV.beforeRev /*{3}*/ , ENV.afterRev /*{4}*/ , ENV.afterRev + 1 /*{5}*/
        );
        diffTitle.innerHTML = newDifftitle;
      } catch (err) {
        alert(err.message + '\n' + err.stack);
      }
    }, 500);
  }
}

// 아이덴티콘 버그 수정
setInterval(function() {
  if (!/^https?:\/\/(?:no-ssl\.|)namu\.wiki\/discuss\/(.+?)/.test(location.href)) {
    return;
  }
  var identicons = document.querySelectorAll('.nf-identicon');
  for (var i = 0; i < identicons.length; i++) {
    var ide = identicons[i];
    var pa = ide.parentNode;

    pa.removeChild(ide);
    pa.style.marginTop = '';
  }
  if (document.querySelector('#nf-identicon-css') != null) {
    var cssTag = document.querySelector('#nf-identicon-css');
    cssTag.parentNode.removeChild(cssTag);
  }
}, 50);

// 설정 메뉴 추가
addItemToMemberMenu("NamuFix 설정", function(evt) {
  evt.preventDefault();

  var win = TooSimplePopup();
  var elems = {};
  win.title('NamuFix 설정');
  SET.load();
  win.content(function(el) {
    el.innerHTML = '<style>h1.wsmall{font-size: 14pt;}</style>' +
      '<h1 class="wsmall">토론 아이덴티콘</h1>' +
      '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="icon">디시라이트 갤러콘 방식<br>' +
      '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="headBg">스레딕 헬퍼 방식<br>' +
      '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="identicon">아이덴티콘<br>' +
      '<input type="radio" name="discussIdenti" data-setname="discussIdenti" data-setvalue="none">사용 안함' +
      '<h1 class="wsmall">토론에서 익명 기여자 IP주소 조회</h1>' +
      '<p>VPNGate 여부, 통신사, 국가이미지를 IP 주소 옆에 표시합니다. 요청 수가 많을 시 실패할 수 도 있습니다.</p>' +
      '<input type="checkbox" name="lookupIPonDiscuss" data-setname="lookupIPonDiscuss" data-as-boolean>토론시 익명 기여자 IP 주소 조회</input>' +
      '<h1 class="wsmall">토론 아이덴티콘 명도</h1>' +
      '<p>스레딕 헬퍼 방식을 사용하는 경우에만 적용됩니다.</p>' +
      '<label for="discussIdentiLightness">명도</label><input name="discussIdentiLightness" data-setname="discussIdentiLightness" type="range" max="1" min="0" step="0.01"><br>' +
      '<label for="discussIdentiSaturation">순도</label><input name="discussIdentiSaturation" data-setname="discussIdentiSaturation" type="range" max="1" min="0" step="0.01">' +
      '<h1 class="wsmall">토론시 취소선</h1>' +
      '<input type="radio" name="hideDeletedWhenDiscussing" data-setname="hideDeletedWhenDiscussing" data-setvalue="0">표시<br>' +
      '<input type="radio" name="hideDeletedWhenDiscussing" data-setname="hideDeletedWhenDiscussing" data-setvalue="0.5">반숨김<br>' +
      '<input type="radio" name="hideDeletedWhenDiscussing" data-setname="hideDeletedWhenDiscussing" data-setvalue="1">숨기기<br>' +
      '<h1 class="wsmall">토론시 앵커 미리보기</h1>' +
      '<input type="radio" name="discussAnchorPreviewType" data-setname="discussAnchorPreviewType" data-setvalue="0">사용하지 않음<br>' +
      '<input type="radio" name="discussAnchorPreviewType" data-setname="discussAnchorPreviewType" data-setvalue="1">마우스를 올리면 미리보기 표시<br>' +
      '<input type="radio" name="discussAnchorPreviewType" data-setname="discussAnchorPreviewType" data-setvalue="2">토론 메세지 위에 인용형식으로 표시<br>' +
      '<input type="checkbox" name="removeNFQuotesInAnchorPreview" data-setname="removeNFQuotesInAnchorPreview" data-as-boolean>토론 메세지 위에 인용형식으로 표시할때, 인용문 안에 인용 형식으로 표시된 미리보기 제거';
    var optionTags = document.querySelectorAll('[data-setname]');
    SET.load();
    for (var i = 0; i < optionTags.length; i++) {
      var tag = optionTags[i];
      var t = tag.getAttribute('type');
      var sn = tag.dataset.setname;
      if (t == "radio" && tag.dataset.setvalue == SET[sn]) {
        tag.checked = true;
      } else if ((t == "checkbox" && tag.dataset.setvalueOnChecked == SET[sn]) || (t == "checkbox" && tag.hasAttribute("data-as-boolean") && SET[sn])) {
        tag.checked = true;
      } else if (["text", "password", "number", "range"].indexOf(t) != -1) {
        tag.value = ["number", "range"].indexOf(t) != -1 ? Number(SET[sn]) : SET[sn];
      }
    }
  });
  win.button('저장하지 않고 닫기', win.close);
  win.button('저장하고 닫기', function() {
    var optionTags = document.querySelectorAll('[data-setname]');
    SET.load();
    for (var i = 0; i < optionTags.length; i++) {
      var tag = optionTags[i];
      var t = tag.getAttribute('type');
      var sn = tag.dataset.setname;
      if (t == "radio" && tag.checked) {
        SET[sn] = tag.dataset.setvalue;
      } else if (t == "checkbox") {
        SET[sn] = tag.hasAttribute("data-as-boolean") ? tag.checked : tag.checked ? t.dataset.setvalueOnChecked : t.dataset.setvalueOnUnchecked;
      } else if (["text", "password", "number", "range"].indexOf(t) != -1) {
        SET[sn] = tag.value;
      }
    }
    SET.save();
    if(confirm("새로고침해야 설정이 적용됩니다. 새로고침할까요?"))
      location.reload();
    win.close();
  });
});
addItemToMemberMenu("Imgur 이미지 삭제 주소들", function(evt) {
  evt.preventDefault();

  SET.load();
  var win = TooSimplePopup();
  var divWithScrolls = document.createElement("div");
  divWithScrolls.style.overflow = 'scroll';
  divWithScrolls.style.maxHeight = '800px';
  divWithScrolls.style.maxWidth = '1200px';

  var table = document.createElement("table");
  table.innerHTML = '<tr><th style="min-width: 200px;">업로드한 날짜/시각</th><th>이름</th><th>이미지 주소(다이렉트)</th><th>이미지 삭제 주소</th></tr>';
  var addRow = function(dt, dna, dil, del) {
    var tr = document.createElement("tr");
    var appendTd = function(t) {
      var td = document.createElement("td");
      td.innerHTML = t;
      tr.appendChild(td);
    }
    appendTd(formatDateTime(dt));
    appendTd(dna == null ? '<span style="color: red;">정보 없음</span>' : dna);
    appendTd('<a href="' + dil + '" target="_blank">' + dil + '</a>');
    appendTd('<a href="' + del + '" target="_blank">' + del + '</a>');
    table.appendChild(tr);
  }
  for (var i = 0; i < SET.imgurDeletionLinks.length; i++) {
    var ii = SET.imgurDeletionLinks[i];
    addRow(ii.uploadedAt, typeof ii.name !== "undefined" ? ii.name : null, ii.imgUrl, ii.deleteionUrl);
  }
  win.content(function(el) {
    el.appendChild(table);
  });
  win.title('이미지 삭제 주소들');
  win.button('닫기', win.close);
});
addItemToMemberMenu('설정 백업/복원', function(evt) {
  evt.preventDefault();

  if (!confirm('경고 : 이 기능은 불안정합니다.\n그래도 진행하시겠습니까?'))
    return;
  if (confirm('백업입니까?')) {
    var keys = GM_listValues();
    var obj = {};
    for (var i = 0; i < keys.length; i++) {
      var ke = keys[i];
      obj[ke] = GM_getValue(ke);
    }
    prompt('복사해서 어딘가에 보관해두세요.', JSON.stringify(obj));
  } else if (confirm('그러면 복원입니까?')) {
    var obj = prompt('**원문 그대로** 복사하세요.');
    obj = JSON.stringify(obj);
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var ke = keys[i];
      GM_setValue(ke, obj[ke]);
    }
  } else {
    alert('취소됨.');
  }
})

mainFunc();
listenPJAX(mainFunc);

// 업데이트 확인
GM_xmlhttpRequest({
  method: "GET",
  url: "https://api.github.com/repos/LiteHell/NamuFix/releases/latest",
  onload: function(res) {
    var obj = JSON.parse(res.responseText);
    var currentVersion = GM_info.script.version;
    var latestVersion = obj.tag_name;
    if (currentVersion != latestVersion) {
      var scriptUrl = 'https://github.com/LiteHell/NamuFix/raw/' + latestVersion + '/NamuFix.user.js';
      var win = TooSimplePopup();
      win.title('새버전 설치');
      win.content(function(element) {
        // 변경 사항 : obj.body
        element.innerHTML = '업데이트가 있습니다.<br><br>현재 사용중인 버전 : ' + currentVersion + '<br>' +
          '현재 최신 버전 : ' + latestVersion + '<br><br>' +
          latestVersion + '버전에서의 변경 사항<pre style="border-left: 6px solid green; padding: 10px; font-size: 13px; font-family: sans-family;" id="changeLog"></pre>' +
          '<p><a href="' + scriptUrl + '" style="text-decoration: none;"><button type="button" style="display: block; margin: 0 auto;">최신 버전 설치</button></a></p>' +
          '설치 후 새로고침을 해야 적용됩니다.<br>버그 신고 및 건의는 <a href="https://github.com/LiteHell/NamuFix/issues">이슈 트래커</a>에서 해주시면 감사하겠습니다.';
        element.querySelector('#changeLog').innerHTML = obj.body;
      });

      win.button('닫기', win.close);
      win.button('새로고침', function() {
        location.reload();
      });
    }
  }
});