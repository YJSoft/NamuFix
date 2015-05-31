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
      if(!document.body.contains(dialogParent))
        document.body.appendChild(dialogParent);
      if (dinfo.withTitle) {
        var titleElement = document.createElement("span");
        titleElement.id = "DialogTitle";
        titleElement.innerHTML = dinfo.Title;
        dialog.appendChild(titleElement);
      }
      if (dinfo.withCloseButton) {
        var CloseButtonIcon=document.createElement("span");
        CloseButtonIcon.className="icon ion-close-round";
        CloseButtonIcon.id="CloseDialog";
        var CloseButton=document.createElement("a");
        CloseButton.appendChild(CloseButtonIcon);
        CloseButton.setAttribute("href","#");
        CloseButton.addEventListener("click",closer);
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
        setHeight: function(h){container.style.height=h;},
        setWidth: function(w){container.style.width=w;}
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
