
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/2/1', routes.index);
app.get('/2/2', routes.lib22);
app.get('/2/3', routes.lib23);
app.get('/2/6', routes.lib46);
app.get('/4/7', routes.lib47);


app.listen(1221, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
