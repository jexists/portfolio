(function(){
	const studyLink = $('.studylink').find('a');
	const studyInfo = $('#studyinfo');

	const computer =[
	{title:"html", width:"85%", img:"html.png"}
	{title:"css", width:"85%", img:"html.png"}
	{title:"scss", width:"85%", img:"html.png"}
	{title:"js(jQuery)", width:"85%", img:"html.png"}
	{title:"gulp", width:"85%", img:"html.png"}
	{title:"git", width:"85%", img:"html.png"}
	];

	let i;
	studyLink.on('click',function(e){
		e.preventDefault();
		i = $(this).parent('li').index();
		$(this).parent('li').addClass('action');
		$(this).parent('li').siblings().removeClass('action');
		studyInfo.find('div').eq(i).show();
		studyInfo.find('div').eq(i).siblings('div').hide();
	});

})(jQuery);