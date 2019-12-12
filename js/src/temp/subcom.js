//common.js

(function($){
	const body = $('body');
	const wrap = $('#wrap');
	const headBox = $('#headBox');
	//const footBox = $('#footBox');

	const JsLink = (temp) => {
		return body.append(`<script src="../../js/src/temp/${temp}.js"></script>`);
	};

	headBox.load('../temp/subheadBox.html',function(){
		JsLink('search');
	});
	//footBox.load('./src/footer.html');



})(jQuery);