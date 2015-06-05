/** Include("src/Editor/Features/BasicMarkUp.js") **/
editorModifier.addButton('테','Dialog TEST',function(){showDialog({
  title:"테스트",
  content:'<span style="color:red;">테스트입니다</span>',
  contentFunc:function(c){c.innerHTML+="진짜로";},
  buttons:[
    {value:"닫기",color:"red",onclick:function(){showDialog.close();}},
    {value:"테스트1",color:"blue",onclick:function(){alert('111');}},
    {value:"테스트2",onclick:function(){alert('222');}}
  ]
});});
