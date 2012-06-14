$(function(){     
      $("#page1").bind("swipeleft",function(){
			   $.mobile.changePage("#page2");
		       });
      $("#page2").bind("swiperight",function(){
			   $.mobile.changePage("#page1",{reverse:true});
		       });
  });