(function(){
	const studyLink = $('.studylink').find('a');
	const studyInfo = $('#studyinfo');
	const abilityLink = $('.abilityLink').find('a');
	const abilityInfo = $('#ability');
	const prizeLink = $('.prizelink').find('a');
	const prizeInfo = $('#prize');

	const comUrl = '../img/program/'
	const computer =[
	{title:"html", width:"85%", img: comUrl + "html.png"},
	{title:"css / scss", width:"75%", img: comUrl + "css.png"},
	/*{title:"scss", width:"70%", img: comUrl + "html.png"},*/
	{title:"js(jQuery)", width:"80%", img: comUrl + "js.png"},
	{title:"gulp", width:"60%", img: comUrl + "gulp.png"},
	{title:"git", width:"65%", img: comUrl + "git.png"},
	{title:"adobe photoshop", width:"80%", img: comUrl + "ps.png"},
	{title:"adobe illustrator", width:"90%", img: comUrl + "ai.png"},
	{title:"adobe indesign", width:"85%", img: comUrl + "id.png"},
	{title:"microsoft office", width:"78%", img: comUrl + "ms.png"},
	{title:"auto cad", width:"80%", img: comUrl + "cad.png"},
	{title:"3d max", width:"70%", img: comUrl + "max.png"},
	{title:"sony vegas", width:"65%", img: comUrl + "sony.png"}
	];
	const langUrl = '../img/language/'
	const language = [
	{title:"korea", width:"98%",img:langUrl + 'kor.png'},
	{title:"english", width:"78%",img:langUrl + 'eng.png'},
	{title:"tagalog", width:"30%",img:langUrl + 'fil.png'}
	];

	const compCan = $('.compcan');
	const comLi = compCan.find('li');
	let comLiLeng = comLi.length;
	
	const langCan = $('.language');
	const langLi = langCan.find('li');
	let langLiLeng = langLi.length;
  const comW = function(){
		for(let i=0; i<comLiLeng; i++){
			comLi.eq(i).find('div').css({backgroundImage: "url("+ computer[i].img +")"})
			comLi.eq(i).find('dt').text(computer[i].title);
			comLi.eq(i).find('span').animate({width: computer[i].width},1000);
			comLi.eq(i).find('dd').append('<em></em>');
			comLi.eq(i).find('em').text(computer[i].width);
		}
  };
  comW();

	const LinkFunc = function(mythis,info,div,n){
		mythis.parent('li').addClass('action');
		mythis.parent('li').siblings().removeClass('action');
		info.find(div).eq(n).show();
		info.find(div).eq(n).siblings('div').hide();
	}
	let i;
	studyLink.on('click',function(e){
		e.preventDefault();
		i = $(this).parent('li').index();
		LinkFunc($(this),studyInfo,'div',i);
	});
 const langW = function(){
	for(let i=0; i<langLiLeng; i++){
		langLi.eq(i).find('div').css({backgroundImage: "url("+ language[i].img +")"})
		langLi.eq(i).find('dt').text(language[i].title);
		langLi.eq(i).find('span').animate({width: language[i].width},1000);
		langLi.eq(i).find('dd').append('<em></em>');
		langLi.eq(i).find('em').text(language[i].width);
	}
 };

  let p;
  prizeLink.on('click',function(e){
  	e.preventDefault();
  	p = $(this).parent('li').index();
  	LinkFunc($(this),prizeInfo,'div',p);
  });

	let c;
	abilityLink.on('click',function(e){
		e.preventDefault();
		c = $(this).parent('li').index();
		if(c == 0){
			langLi.find('span').removeAttr('style');
			comW();
		}else{
			comLi.find('span').removeAttr('style');
			langW();
		}

		LinkFunc($(this),abilityInfo,'div.can',c);
/*		abilityInfo.find('span').css({width:0});*/

	});

  let text, successful;
  const copyBtn = $('.copy').children('a'); 
  const copyInput = $('#text');

  copyBtn.on('click', function(e) { 
		e.preventDefault();
		// a의 텍스트값을 가져옴 
	
  let copyText = document.getElementById("copy");
  copyText.select();
  document.execCommand("Copy");

	});

})(jQuery);