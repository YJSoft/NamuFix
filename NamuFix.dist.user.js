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

function SHA512(strToHash) {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(strToHash);
    var hash = shaObj.getHash("HEX");
}

function bsModal() {
    var root = document.createElement("div");
    var controller = {};

    root.className = "modal";
    root.style.display = "none";
    root.setAttribute("role", "dialog");
    root.innerHTML = '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">NamuFix</h4></div><div class="modal-body"><p>오류?</p></div><div class="modal-footer"></div></div></div>';

    var modalBody = root.querySelector(".modal-body");
    var body = document.body;
    body.appendChild(root);
    controller.title = function(value) {
        root.querySelector(".modal-header > .modal-title").textContent = value;
    };
    controller.content = function(callback) {
        callback(modalBody);
    };
    controller.button = function(text, callback) {
        var btn = document.createElement("button");
        btn.className = "btn btn-default";
        btn.setAttribute("type", "button");
        btn.innerHTML = text;
        btn.addEventListener("click", function() {
            callback(modalBody);
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
    controller.destroy = function() {
        if (root.parentNode != null) root.parentNode.removeChild(root);
    }
    controller.removable = function(object) {
        object.makeRemovable(root);
    }
    return controller;
}

(function(global) {
    global.createElement_s = function() {
        var id = uniqueID();
        this.createElement = function(tagName) {
            var elem = document.createElement(tagName);
            this.makeRemovable(elem);
            return elem;
        }
        this.makeRemovable = function(elem) {
            elem.dataset.nfRemovable = true;
            elem.dataset.nfRemovableId = id;
        }
        this.removeAllElements = function() {
            var elements = document.querySelectorAll("[data-nf-removable]");
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                if (element.dataset.nfRemovableId == id && element.parentNode != null) {
                    element.parentNode.removeChild(element);
                }
            }
        }
    }
})(this)

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

function uniqueID() {
    var r = Math.floor(Math.random() * Date.now());
    r += "\n" + location.href;
    r += "\n" + document.href;
    return SHA512(r);
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
    r.removable = function(object) {
        object.makeRemovable(rootElement);
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
    r.appendSelection = function(r) {
        this.selectionText(this.selectionText().concat(r));
    }
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
        },
        removable: function(obj) {
            obj.makeRemovable(div);
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
    this.getLicensesAndCategories = function(callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://namu.wiki/Upload',
            onload: function(res) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(res.responseText, "text/html");
                var result = {
                    licenses: [],
                    categories: []
                };
                var licenseOptions = doc.querySelectorAll("#licenseSelect option");
                var categoryOptions = doc.querySelectorAll("#categorySelect option");
                for (var i = 0; i < licenseOptions.length; i++) {
                    var licenseOption = licenseOptions[i];
                    if (licenseOption.value.trim().length != 0) {
                        result.licenses.push(licenseOption.value);
                    }
                }
                for (var i = 0; i < categoryOptions.length; i++) {
                    var categoryOption = categoryOptions[i];
                    if (categoryOption.value.trim().length != 0) {
                        result.categories.push(categoryOption.value);
                    }
                }
                callback(result);
            }
        })
    };
}

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
                            '          <div><input type="file" accept="image/*" id="file" multiple></div>' +
                            '          <label for="filename">파일 이름</label>' +
                            '            <div class="input-group">' +
                            '              <input type="text" class="form-control" id="filename">' +
                            '            </div>' +
                            '            <p>참고 : 파일이 여러개면 파일 이름은 그 파일 각각의 이름으로 결정됩니다.</p>' +
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

conditionalLoader.load();

GM_addStyle("/* basic */\n\n.nf-editor {\n  border: #3D414D 1px solid;\n}\n.nf-editor > .menu {\n  box-sizing: border-box;\n  width: 100%;\n  height: 50px;\n  background: #3D414D\n}\n.nf-editor > .textarea {\n  width: 100%;\n  height: calc(100% - 50px);\n}\n.nf-editor > .textarea > textarea {\n  width: 100%;\n  height: 100% !important;\n}\n\n/* duplicated styles */\n\n.nf-menu-icon-style {\n  height: 50px;\n  width: 40px;\n  text-align: center;\n  font-size: 20px !important;\n  line-height: 30px;\n  padding: 10px;\n}\n\n/* menu and menu buttons */\n\n.nf-editor > .menu > .button {\n  box-sizing: border-box;\n  color: white;\n  cursor: pointer;\n  display: inline-block;\n}\n.nf-editor > .menu > .button:hover, .nf-editor > .menu > .button:active, .nf-editor > .menu > .button.active {\n  background: #808080;\n}\n\n/* menu dropdowns */\n\n.nf-dropdown-menu {\n  background: #3D414D;\n  color: white;\n  z-index: 1005;\n}\n.nf-dropdown-menu > ul.dropdown-list {\n  list-style-type: none;\n  /* ignore default style */\n  padding: 0 !important;\n  margin: 0 !important;\n}\n.nf-dropdown-menu > ul.dropdown-list > li {\n  cursor: pointer;\n}\n.nf-dropdown-menu > ul.dropdown-list > li > .dropdown-item-icon {\n  color: white;\n  display: inline-block;\n}\n.nf-dropdown-menu > ul.dropdown-list > li > .dropdown-item-description {\n  color: white;\n  display: inline-block;\n  height: 50px;\n  box-sizing: border-box;\n  padding: 15px 3px 15px 5px;\n  font-size: 20px;\n  line-height: 20px;\n}\n\r\n.nf-tabs > ul {\r\n  padding: 0px !important;\r\n  margin: 0px !important;\r\n}\r\n.nf-tabs > ul > li {\r\n  display: inline-block;\r\n  font-family: sans-serif !important;\r\n  border: none;\r\n  background: #646771;\r\n  color: white;\r\n  padding: 8px 20px 5px 20px;\r\n  font-weight: normal;\r\n  list-style-type: none;\r\n  cursor: pointer;\r\n}\r\n.nf-tabs > ul > li.selected {\r\n  background: #31343E;\r\n}\r\n");
