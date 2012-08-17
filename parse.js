var http = require('http');
var fs = require('fs');
var querystring = require('querystring');

var pattern = {
    roomStatus : /<td[^>]+?'Style(\d+)'[\s\S]+?<b>(\d+)[\s\S]+?<\/td>/g
};

var parse  = function(room_no, callback){
    var postData = querystring.stringify({
	    '__VIEWSTATE' : '/wEPDwUKLTEwNjQ2NDYzMmRkNvIkHSDcMPShlVCoeK6CYlPI74M=',
	    '__EVENTVALIDATION' : '/wEWAgLBxI27BgLJ0ILXB6VQ5ryrGb10yK8m4rVJaiv5d4qW',
	    'Roon_no' : room_no
	});

    var source = '';
    var options = {
	host : '166.104.209.78',
	port : 80,
	path : '/EZ5500/SEAT/RoomStatus.aspx',
	method : 'POST',
	headers : {
	    'User-Agent' : 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/535.19 (KHTML, like Gecko) Ubuntu/12.04 Chromium/18.0.1025.151 Chrome/18.0.1025.151 Safari/535.19',
	    'Content-Type' : 'application/x-www-form-urlencoded',
	    'Content-Length' : postData.length
	}
    
    };

    var req = http.request(options, function(res){
	    res.setEncoding('utf8');
	    res.on('data', function(chunk){
		    source += chunk;
		});
	    res.on('end', function(){
		    var match;
		    var seat_infomation = [];
		    while(match = pattern.roomStatus.exec(source)){
			seat_infomation.push({
				status : match[1],
				    room_no  : match[2]
				    });
		    }
		    callback(seat_infomation);
		});
	});
    req.on('error', function(error){
	    console.log('problem with request: ' + error.message);
	});

    req.write(postData);
    req.end();
};

module.exports = parse;