
$(function(){     
    window.mySwipe = new Swipe(document.getElementById('slider'), {
	startSlide: 0,
	speed: 400,
	callback: function(event, index, elem) {

      // do something cool

	}
    });
var threeStatus = {
    1 : "unused",
    9 : "disable",
    10 : "used"
};

for (var i = 0; i < room.length; i++){
    var room_no = room[i].room_no;
    var status = room[i].status;
    $('#_' + room_no).addClass(threeStatus[status]);
}
  });



function moveToAskFm() {
    window.open('http://ask.fm/HannJS');
}