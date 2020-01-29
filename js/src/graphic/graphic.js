

(function($){
	const graphicsArea = $('.graphicsArea');
	const graphicLi = graphicsArea.children('li');
	const graphicLink = graphicLi.children('a');
	const graphicTx = graphicLink.find('dd');
	const graphicDiv = graphicsArea.find('div');

	let graphic = false;

	graphicLink.on('mouseenter',function(){
		graphic = true;
		if(graphic){
			$(this).find('dd').addClass('act');
		}
	});
	
	graphicLink.on('mouseleave',function(){
		let hasClass = graphicDiv.hasClass('act');
		if(!hasClass){
			graphicTx.removeClass('act');
			graphic = false;
		}else{
			$(this).find('dd').removeClass('act');
		}
	});

	graphicLink.on('click',function(){
		graphic = false;
		$(this).next('div').addClass('act');
	});
})(jQuery);