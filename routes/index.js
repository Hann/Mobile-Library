
/*
 * GET home page.
 */

var parse = require('../parse');

exports.index = function(req, res){
    parse('1', function(seat_info){
	res.render('index', { title: '2층 1열람실' , roomstate : JSON.stringify(seat_info)});
    });
};

exports.lib22 = function(req, res){
    parse('2', function(seat_info){
	res.render('lib22', { title: '2층 2열람실' , roomstate : JSON.stringify(seat_info)});
 	});
};

exports.lib23 = function(req, res){
    parse('3', function(seat_info){
	res.render('lib23', { title: '2층 3열람실' , roomstate : JSON.stringify(seat_info)});
	});
};
exports.lib46 = function(req, res){
    parse('4', function(seat_info){
        res.render('lib46', { title: '4층 6열람실' , roomstate : JSON.stringify(seat_info) });
	});
};
exports.lib47 = function(req, res){
    parse('5', function(seat_info){
        res.render('lib47', { title: '4층 7열람실' , roomstate : JSON.stringify(seat_info) });
	});
};

