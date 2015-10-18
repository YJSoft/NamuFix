// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://no-ssl.namu.wiki/*
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @include     http://issue.namu.wiki/*
// @version     151018.0.0
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/master/NamuFix.user.js
// @require     https://raw.githubusercontent.com/LiteHell/NamuFix/master/FlexiColorPicker.js
// @require     https://raw.githubusercontent.com/Caligatio/jsSHA/v2.0.1/src/sha512.js
// @require     https://raw.githubusercontent.com/zenozeng/color-hash/master/dist/color-hash.js
// @require     http://www.xarg.org/download/pnglib.js
// @require     https://raw.githubusercontent.com/stewartlord/identicon.js/master/identicon.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min.js
// @require     https://raw.githubusercontent.com/LiteHell/TooSimplePopupLib/master/TooSimplePopupLib.js
// @require     https://cdn.rawgit.com/kpdecker/jsdiff/49dece07ae3b3e9e2e9a57592f467de3dff1aabc/diff.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_info
// @run-at      document-end
// ==/UserScript==

var conditionalLoader = (function() {
    var objects = {},
        loaded = [];
    var t = {};
    t.register = function() {
        if (arguments.length == 1) {
            objects[arguments[0].pattern] = arguments[0]
        } else if (arguments.length == 2) {
            objects[arguments[0]] = arguments[1];
        }
    };
    t.load = function() {
        var patterns = Object.keys(objects);
        for (var i = 0; i < patterns.length; i++) {
            var pattern = patterns[i];
            var loadThis = false;
            loadThis = typeof pattern === "string" ? getEnvironment()[pattern] : pattern.test(location.pathname);
            if (loadThis) {
                var objToload = typeof objects[pattern] === "function" ? new objects[pattern] : objects[pattern];
                objToload.load();
                if (objToload.loaded)
                    loaded.push(objToload);
            }
        }
    };
    t.clean = function() {
        var l = loaded.length;
        clearAllIntervals_s();
        for (var i = 0; i < l; i++) {
            loaded[i].unload();
        }
        loaded = loaded.splice(0, l);
    }
    return t;
})();

(function() {
    // callbacks
    function callbackWhenStarted() {
        clearAllIntervals_s();
        conditionalLoader.clean();
    }

    function callbackWhenFinished() {
        conditionalLoader.load();
    }

    // create elements
    var pjaxButton = document.createElement("button"), // pjax:start
        pjaxButton2 = document.createElement("button"); // pjax:end
    var scriptElement = document.createElement("script");

    // configure button
    [pjaxButton, pjaxButton2].forEach(function(item, index) {
        item.style.display = "none";
        item.id = "nfFuckingPJAX".concat(index);
        item.addEventListener("click", index == 0 ? callbackWhenStarted : callbackWhenFinished);
        document.body.appendChild(item);
    });

    // configure script
    scriptElement.setAttribute("type", "text/javascript");
    scriptElement.innerHTML = '$(document).bind("pjax:end", function(){document.querySelector("button#nfFuckingPJAX1").click();});' +
        '$(document).bind("pjax:start", function(){document.querySelector("button#nfFuckingPJAX0").click();});';

    // add script
    document.head.appendChild(scriptElement);
})();

if (typeof Array.prototype.forEach === "undefined") {
    Array.prototype.forEach = function(callback) {
        var index = 0;

        function recursiveLoop() {
            var now = index++;
            if (now < this.length) {
                callback(this[now], now, this);
            } else {
                return;
            }
            recursiveLoop();
        }
        recursiveLoop();
    };
}
if (typeof Array.prototype.contains === "undefined") {
    Array.prototype.contains = function(item) {
        return this.indexOf(item) != -1;
    };
}
if (typeof Array.prototype.remove === "undefined") {
    Array.prototype.remove = function(item) {
        var removed = this;
        while (true) {
            var index = removed.indexOf(item);
            if (index < 0) break;
            removed = removed.splice(index, 1);
        }
        return removed;
    }
}

(function(global) {
    var intervalList = [];
    global.setInterval_s = function(func, interval) {
        var no = setInterval(func, interval);
        intervalList.push(no);
        return no;
    }
    global.clearInterval_s = function(no) {
        if (intervalList.contains(no)) {
            clearInterval(no);
        }
        intervalList = intervalList.remove(no);
    }
    global.clearAllIntervals_s = function() {
        var l = intervalList.length;
        for (var i = 0; i < l; i++) {
            clearInterval(intervalList[i]);
        }
        intervalList = intervalList.splice(0, l);
    }
})(this);

function bsModal() {
    var root = document.createElement("div");
    var controller = {};

    root.className = "modal";
    root.style.display = "none";
    root.setAttribute("role", "dialog");
    root.innerHTML = '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button><h4 class="modal-title">NamuFix</h4></div><div class="modal-body"><p>오류?</p></div><div class="modal-footer"></div></div></div>';

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

function getEnvironment() {
    var ENV = {};
    ENV.IsSSL = location.protocol == "https:";
    ENV.IsEditing = /^\/edit\/(.+?)/.test(location.pathname);
    ENV.IsDiscussing = /^\/topic\/([0-9]+?)/.test(location.pathname);
    ENV.IsDocument = /^\/w\/(.+)/.test(location.pathname); //&& document.querySelector('p.wiki-edit-date');
    ENV.IsSettings = /^\/settings/.test(location.pathname);
    ENV.IsUserPage = /^\/contribution\/(?:author|ip)\/.+\/(?:document|discuss)/.test(location.pathname);
    ENV.IsUploadPage = /^\/Upload$/.test(location.pathname);
    ENV.IsDiff = /^\/diff\/.+/.test(location.pathname);
    ENV.IsLoggedIn = document.querySelector('img.user-img') != null;
    if (ENV.IsLoggedIn) {
        ENV.UserName = document.querySelector('div.user-info > div.user-info > div:first-child').textContent.trim();
    }
    if (document.querySelector("input[name=section]"))
        ENV.section = document.querySelector("input[name=section]").value;
    else
        ENV.section = -2;
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
    return ENV;
}

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

function recusriveFor(array, callback) {
    if (array.length < 1) return;
    var index = 0;

    function recusriveLoop() {
        var now = index++;
        if (now == array.length | now > array.length) return;
        callback(array[now], now, array.length, recusriveLoop);
    }
    recusriveLoop();
}

function editorBase(textarea, callback) {
    var rootElement = document.createElement("div");
    var menuElement = document.createElement("div");
    var textareaParentElement = document.createElement("div");

    // computer height
    var oldHeight = window.getComputedStyle(textarea, null).height;
    var newHeight = "calc(" + oldHeight + " + 50px)";

    // set height
    rootElement.style.height = newHeight;

    // add Editor
    textarea.parentNode.insertBefore(rootElement, textarea);

    // move textarea
    textareaParentElement.appendChild(textarea);
    textareaParentElement.className = "textarea";
    menuElement.className = "menu";
    rootElement.className = "nf-editor";

    // append to root Element
    rootElement.appendChild(menuElement);
    rootElement.appendChild(textareaParentElement);

    var r = {};
    r.button = function(text, callback) {
        // make button
        var button = document.createElement("div");
        button.className = "button nf-menu-icon-style";
        button.innerHTML = text;

        // make caontroller
        var controller = {
            activate: function() {
                if (button.className.indexOf('active') == -1) button.className = 'button nf-menu-icon-style active';
            },
            deactivate: function() {
                if (button.className.indexOf('active') != -1) button.className = 'button nf-menu-icon-style';
            },
            click: function(callback) {
                button.addEventListener("click", function() {
                    callback(this);
                });
            },
            getElement: function() {
                return button;
            }
        };

        // add Handler
        if (arguments.length > 1) button.addEventListener("click", function() {
            callback(controller);
        });

        // append
        menuElement.appendChild(button);
        return controller;
    };
    r.dropdown = function(text, callback) {
        var dropdownElement = document.createElement("div");
        var dropdownController = {};
        var subMenus = [];
        var activated = false;
        var tether = null;

        // init dropdown element
        dropdownElement.className = "nf-dropdown-menu";
        dropdownElement.style.display = 'none';
        dropdownElement.innerHTML = "<ul></ul>";
        var ul = dropdownElement.querySelector('ul');

        // add to somewhere
        document.querySelector('article').appendChild(dropdownElement);

        // render function
        function render() {
            dropdownElement.innerHTML = '<ul class="dropdown-list"></ul>';
            ul = dropdownElement.querySelector('ul');
            for (var i = 0; i < subMenus.length; i++) {
                var subMenu = subMenus[i];
                var button = document.createElement("li");
                button.innerHTML = '<div class="dropdown-item-icon nf-menu-icon-style">'.concat(subMenu.icon, '</div><div class="dropdown-item-description">', subMenu.text, '</div>');

                // add Handlers
                if (typeof subMenu.onclick === "function") {
                    button.addEventListener("click", subMenu.onclick);
                } else if (typeof subMenu.onclick === "object" && subMenu.onclick.constructor == Array) {
                    for (var j = 0; j < subMenu.onclick.length; j++) {
                        button.addEventListener("click", subMenu.onclick[i]);
                    }
                }

                // appendChild
                ul.appendChild(button);
            }
        }

        // controller
        dropdownController.button = function(icon, text, callback) {
            subMenus.push({
                icon: icon,
                text: text,
                onclick: callback
            });
            render();
        };

        // add Button
        this.button(text, function(controller) {
            if (activated) {
                controller.deactivate();
                if (tether != null) {
                    tether.disable();
                    tether.destroy();
                    tether = null;
                }
                dropdownElement.style.display = 'none';
            } else {
                controller.activate();
                dropdownElement.style.display = '';
                tether = new Tether({
                    element: dropdownElement,
                    target: controller.getElement(),
                    attachment: 'top left',
                    targetAttachment: 'bottom left'
                });
            }
            activated = !activated;
        });
        callback(dropdownController);
    };
    r.destroy = function() {
        rootElement.parentNode.insertBefore(textarea, rootElement);
        rootElement.parentNode.removeChild(rootElement);
    };
    r.getDOMElement = function() {
        return rootElement;
    }
    callback(r);
}

function textHelper(textarea, callback) {
    var r = {};
    r.value = function() {
        if (arguments.length == 0) return textarea.value;
        else textarea.value = arguments[0];
    };
    r.selectionText = function() {
        if (arguments.length == 0) return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        else {
            var s = textarea.selectionStart;
            var t = textarea.value.substring(0, textarea.selectionStart);
            t += arguments[0];
            t += textarea.value.substring(textarea.selectionEnd);
            textarea.value = t;
            textarea.focus();
            textarea.selectionStart = s;
            textarea.selectionEnd = s + arguments[0].length;
        }
    };
    r.selectionStart = function() {
        if (arguments.length == 0) return textarea.selectionStart;
        else textarea.selectionStart = arguments[0];
    };
    r.selectionTest = function(r) {
        return this.selectionText().search(r) != -1;
    };
    r.appendTest = function(v) {
        this.selectionText(this.selectionText().concat(v));
    }
    r.valueTest = function(r) {
        return this.value().search(r) != -1;
    };
    r.selectionEnd = function() {
        if (arguments.length == 0) return textarea.selectionEnd;
        else textarea.selectionEnd = arguments[0];
    };
    r.selectionLength = function() {
        if (arguments.length == 0) return (textarea.selectionEnd - textarea.selectionStart);
        else textarea.selectionEnd = textarea.selectionStart + arguments[0];
    };
    r.select = function(s, e) {
        textarea.focus();
        textarea.selectionStart = s;
        if (typeof e !== 'undefined') textarea.selectionEnd = e;
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
    callback(r);
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

function NamuUploader() {
    var _funclocal = this;
    this.onuploaded = function() {};
    this.onstarted = function() {};
    this.upload = function(options) {
        _funclocal.onstarted(options);
        var query = new FormData();
        query.append('file', options.file);
        query.append('document', options.name);
        query.append('text', options.description);
        query.append('log', options.log);
        query.append('baserev', 0);
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://namu.wiki/Upload',
            data: query,
            onload: function(res) {
                var parser = new DOMParser();
                options.successed = parser.parseFromString(res.responseText, "text/html").querySelector("p.wiki-edit-date") != null;
                _funclocal.onuploaded(options);
            }
        })
    }
}

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

conditionalLoader.load();

GM_addStyle("/* basic */\n\n.nf-editor {\n  border: #3D414D 1px solid;\n}\n.nf-editor > .menu {\n  box-sizing: border-box;\n  width: 100%;\n  height: 50px;\n  background: #3D414D\n}\n.nf-editor > .textarea {\n  width: 100%;\n  height: calc(100% - 50px);\n}\n.nf-editor > .textarea > textarea {\n  width: 100%;\n  height: 100% !important;\n}\n\n/* duplicated styles */\n\n.nf-menu-icon-style {\n  height: 50px;\n  width: 40px;\n  text-align: center;\n  font-size: 20px !important;\n  line-height: 30px;\n  padding: 10px;\n}\n\n/* menu and menu buttons */\n\n.nf-editor > .menu > .button {\n  box-sizing: border-box;\n  color: white;\n  cursor: pointer;\n  display: inline-block;\n}\n.nf-editor > .menu > .button:hover, .nf-editor > .menu > .button:active, .nf-editor > .menu > .button.active {\n  background: #808080;\n}\n\n/* menu dropdowns */\n\n.nf-dropdown-menu {\n  background: #3D414D;\n  color: white;\n  z-index: 1005;\n}\n.nf-dropdown-menu > ul.dropdown-list {\n  list-style-type: none;\n  /* ignore default style */\n  padding: 0 !important;\n  margin: 0 !important;\n}\n.nf-dropdown-menu > ul.dropdown-list > li {\n  cursor: pointer;\n}\n.nf-dropdown-menu > ul.dropdown-list > li > .dropdown-item-icon {\n  color: white;\n  display: inline-block;\n}\n.nf-dropdown-menu > ul.dropdown-list > li > .dropdown-item-description {\n  color: white;\n  display: inline-block;\n  height: 50px;\n  box-sizing: border-box;\n  padding: 15px 3px 15px 5px;\n  font-size: 20px;\n  line-height: 20px;\n}\n\r\n.nf-tabs > ul {\r\n  padding: 0px !important;\r\n  margin: 0px !important;\r\n}\r\n.nf-tabs > ul > li {\r\n  display: inline-block;\r\n  font-family: sans-serif !important;\r\n  border: none;\r\n  background: #646771;\r\n  color: white;\r\n  padding: 8px 20px 5px 20px;\r\n  font-weight: normal;\r\n  list-style-type: none;\r\n  cursor: pointer;\r\n}\r\n.nf-tabs > ul > li.selected {\r\n  background: #31343E;\r\n}\r\n");
