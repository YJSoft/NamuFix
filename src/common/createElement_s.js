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
