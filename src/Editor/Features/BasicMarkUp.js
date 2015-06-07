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
var fontColorMarkUp = function(){
  var setColor=function(hex){
    var a=WikiText.getSelected();
    var ColouredPattern=/{{{#[a-zA-Z0-9]+ (.+?)}}}/;
    var selected=WikiText.getSelected();
    if(selected==null || selected == '')
      selected='내용';
    if(ColouredPattern.test(selected)){
      selected='{{{'+hex+' '+ColouredPattern.exec(selected)[1]+'}}}';
    }else{
      selected='{{{'+hex+' '+selected+'}}}';
    }
    WikiText.replaceSelected(selected);
  };
  var nowSelected=null;
  showDialog({
    title:"글씨색 변경",
    content:'<p>색을 고르고 확인 버튼을 누르세요.</p><p>선택하신 색은 <span id="ctys">(아직 선택하지 않음)</span><span id="ctysHex"></span>입니다.</p>',
    beforeShow:function(container){
      // <span id="ctys">이색</span>입니다.</p><div id="colorPicker" class="cp-default"></div>
      var colpick=document.createElement("div");
      colpick.className="cp-default";
      ColorPicker(colpick,function(hex,hsv,rgb){
        nowSelected=hex;
        if(document.querySelector("#ctys")){
          document.querySelector("#ctys").style.background=hex;
          document.querySelector("#ctys").style.color=hex;
        }
        if(document.querySelector("#ctysHex")){
          document.querySelector("#ctysHex").textContent='('+hex+')';
        }

      });
      container.appendChild(colpick);
    },
    buttons:[
      {value:"취소",
      onclick:function(){showDialog.close();}},
      {value:"확인",
      color:"blue",
      onclick:function(){if(nowSelected!=null) setColor(nowSelected); showDialog.close();}}
    ]
  });
};

editorModifier.addButton('<strong>가</strong>', '굵게', WrapClosure("'''"));
editorModifier.addButton('<i>가</i>', '기울게', WrapClosure("''"));
editorModifier.addButton('<del>가</del>', '취소선', WrapClosure("--"));
editorModifier.addButton('<u>가</u>', '밑줄', WrapClosure("__"));
editorModifier.addButton('가<sub>가</sub>', '아랫첨자', WrapClosure(",,"));
editorModifier.addButton('가<sup>가</sup>', '윗첨자', WrapClosure("^^"));
editorModifier.addButton('<span style="font-size:75%;">가</span>', '글씨 작게', fontSizeMarkUp(-1));
editorModifier.addButton('<span style="font-size:125%;">가</span>', '글씨 크게', fontSizeMarkUp(1));
editorModifier.addButton('<span style="color:red;">가</span>','글씨색',fontColorMarkUp);
