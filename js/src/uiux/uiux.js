

(function($){
 const conbox = $('.conbox');

 conbox.find('li').on('mouseenter',function(){
 	$(this).find('img').addClass('action');
 });
 conbox.find('li').on('mouseleave',function(){
 	$(this).find('img').removeClass('action');
 });


})(jQuery);