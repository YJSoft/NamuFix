function showDialog(params){
  // 내부 함수
  var RemoveElement=function(elem){elem.parentNode.removeChild(elem);};

  // 정적 함수
  showDialog.close=function(){
    var RemoveElement=function(elem){elem.parentNode.removeChild(elem);};
    if(document.querySelector(".DialogParent")!=null){
      RemoveElement(document.querySelector(".DialogParent"));
    }
  };

  // 매개변수 기본값 처리
  var data={
    withTitle:true,
    title:"NamuFix",
    withCloseButton:true,
    content:"잠시만 기다려주세요....",
    beforeShow:function(){},
    withButtonsOnBottoms:true,
    buttons:[{value:"닫기",onclick:function(){}}]
    //buttons:[{color:"Blue",value:"확인",onclick:function(){}},{color:"Red",value:"취소",onclick:function(){}}]
  };
  for(var i in params){
    data[i]=params[i];
  }

  // 기존 다이얼로그 존재시 제거
  if(document.querySelector(".DialogParent")!=null)
    RemoveElement(document.querySelector(".DialogParent"));

  // 필수 요소 변수 선언
  var Parent=document.createElement("div");
  var Dialog=document.createElement("div");

  // 부모-자식 관계 설정
  Dialog.className="Dialog";
  Parent.className="DialogParent";
  Parent.appendChild(Dialog);

  // 제목과 닫기 버튼
  if(data.withTitle || data.withCloseButton){
    var TitleArea=document.createElement("div");
    TitleArea.className="TitleArea";
    if(data.withTitle){
      var TitleSpan=document.createElement("span");
      TitleSpan.id="Title";
      TitleSpan.innerHTML=data.title;
      TitleArea.appendChild(TitleSpan);
    }
    if(data.withCloseButton){
      var CloseButton=document.createElement("a");
      CloseButton.setAttribute("href","#");
      CloseButton.addEventListener("click",showDialog.close);
      CloseButton.id="Close";
      CloseButton.innerHTML='<span class="icon ion-close"></span>';
      TitleArea.appendChild(CloseButton);
    }
    Dialog.appendChild(TitleArea);
  }

  var Container=document.createElement("div");
  Container.className="Container";
  Container.innerHTML=data.content;
  data.beforeShow(Container);
  Dialog.appendChild(Container);

  if(data.withButtonsOnBottoms){
    var Buttons=document.createElement("div");
    Buttons.className="Buttons";
    for(var i=0;i<data.buttons.length;i++){
      var btnDat=data.buttons[i];
      var Button=document.createElement("button");
      Button.setAttribute("type","button");
      // 색 지정
      if((typeof btnDat.color !== "undefined") && (btnDat.color!=null)){
        switch(btnDat.color.toLowerCase()){
          case "blue":
            Button.className="BlueButton"
            break;
          case "red":
            Button.className="RedButton";
            break;
        }
      }
      Button.innerHTML=btnDat.value;
      Button.addEventListener("click",btnDat.onclick);
      Buttons.appendChild(Button);
    }
    Dialog.appendChild(Buttons);
  }
  document.body.appendChild(Parent);
}
