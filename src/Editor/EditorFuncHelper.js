var WikiText= new function(){
  this.docTitle = document.querySelector('h1.title > a').innerHTML;
  this.docSectionNo = document.querySelector("#editForm > input[name=section]").value;

  var txtarea=document.querySelector('textarea[name=content]');
  this.isSomethingSelected=function(){
    return txtarea.selectionStart!=txtarea.selectionEnd;
  }
  this.getSelected=function(){
    var r=txtarea.value;
    var s=txtarea.selectionStart;
    var e=txtarea.selectionEnd;
    return r.substring(s,e);
  }
  this.replaceSelected=function(str){
    var r=txtarea.value;
    var s=txtarea.selectionStart;
    var e=txtarea.selectionEnd;
    txtarea.value=r.substring(0,s)+str+r.substring(e);
    txtarea.focus();
    txtarea.selectionStart=s;
    txtarea.selectionEnd=s+str.length;
  }
  this.ToggleWrapSelected=function(l){
    if (arguments.length > 1){
      var r = arguments[1];
    }else{
      var r = l;
    }
    var p=WikiText.getSelected();
    if(p.indexOf(l)!=0||p.substring(p.length-r.length)!=r){
      p=l+p+r;
    }else{
      p=p.substring(l.length,p.length-r.length)
    }
    WikiText.replaceSelected(p);
  }

}();
