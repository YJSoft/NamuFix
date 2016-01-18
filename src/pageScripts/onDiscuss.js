conditionalLoader.register("IsDiscussing", function() {
  var observer = null;

  var colorHash = new ColorHash();
  function beautify(){
    
  }
  this.load = function() {
    // 토론 컨테이너 불려오기
    var container = document.querySelector("#res-container");
    // 없으면 로드 실패
    if (container == null) {
      this.loaded = false;
      return;
    }
    this.loaded = true;

    // 옵저버 선언
    observer = new MutationObserver(function(objs) {
      objs.forEach(function(obj) {
        var node = obj.addedNodes;
      })
    });
    observer.observe(container, {
      childList: true
    })
  }
  this.unload = function() {
    observer.disconnect();
  }
});
