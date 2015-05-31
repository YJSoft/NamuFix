/** Include("src/Editor/Features/BasicMarkUp.js") **/
Dialog.openDialog({Title:"테스트"},function(bridge){
  bridge.content.innerHTML="HEY!";
  bridge.setTitle("테스트테스트");
  bridge.addButton("테스트1",function(){alert("1");});
  bridge.addBlueButton("테스트2",function(){alert("2");});
});
