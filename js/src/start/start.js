// main.js

(function($){
 let typingBool = false; 
 let typingIdx=0; 
 let tyInt;
 let typingTxt = '정주애를 검색하세요.'; // 타이핑될 텍스트를 가져온다 
 typingTxt=typingTxt.split(""); // 한글자씩 자른다. 
  
 const typing = function(){ 
   if(typingIdx<typingTxt.length){ // 타이핑될 텍스트 길이만큼 반복 
     $(".searchtext").append(typingTxt[typingIdx]); // 한글자씩 이어준다. 
     typingIdx++; 
   } else{ 
     clearInterval(tyInt); //끝나면 반복종료 
     setTimeout(function(){window.location = "./all.html";}, 2000);
   } 
 }

 if(typingBool==false){ // 타이핑이 진행되지 않았다면 
    typingBool=true;     
    tyInt = setInterval(typing,200); // 반복동작 
  }

})(jQuery);
