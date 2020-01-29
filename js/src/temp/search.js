

(function($){
 const search = $('.search');
 const searchLs = $('.searchlist');
 const searchLogo = $('.searchlogo');

 search.on('mouseenter',function(){
 	$(this).addClass('action');
 	searchLogo.addClass('action');
 	searchLs.stop().slideDown(500);
 });
 search.on('mouseleave',function(){
 	$(this).removeClass('action');
 	searchLogo.removeClass('action');
 	searchLs.stop().slideUp(300);
 })

})(jQuery);