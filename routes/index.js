
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: '2층 1열람실' });
};

exports.lib1 = function(req, res){
  res.render('lib1', { title: '2층 1열람실' });
};



