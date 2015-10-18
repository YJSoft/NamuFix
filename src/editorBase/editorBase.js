function editorBase(textarea, callback) {
  var rootElement = document.createElement("div");
  var menuElement = document.createElement("div");
  var textareaParentElement = document.createElement("div");

  // computer height
  var oldHeight = window.getComputedStyle(textarea, null).height;
  var newHeight = "calc("+oldHeight+" + 50px)";

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
