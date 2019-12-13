(function(){
	const projLink = $('.projLink').find('a');
	const project = $('#project');

	const LinkFunc = function(mythis,info,div,n){
		mythis.parent('li').addClass('action');
		mythis.parent('li').siblings().removeClass('action');
		info.find(div).eq(n).show();
		info.find(div).eq(n).siblings('div').hide();
	}
	let i;
	projLink.on('click',function(e){
		e.preventDefault();
		i = $(this).parent('li').index();
		LinkFunc($(this),project,'div',i);
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