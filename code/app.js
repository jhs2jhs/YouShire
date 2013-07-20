
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , actions = require('./routes/action')
  , observer = require('./routes/observer')
  , http = require('http')
, path = require('path');
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var db = require("./routes/db.js");
var myutil = require("./routes/myutil");

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.methodOverride());
// for passport
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({cookie: {maxAge:360000}, secret:"keyboard cat"}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
passport.use(user.my_passport_local_strategy());
passport.serializeUser(user.serialize_user);
passport.deserializeUser(user.deserialize_user);

/*
passport.deserializeUser(function(id, done){
  myutil.debug("deserialize_user");
  var req_obj = {};
  req_obj.qry_obj = {_id: id };
  req_obj.callback = deserialize_user_cp;
  req_obj.done = done;
  return db.db_opt(db.user_find_one, req_obj);
});*/



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routing allocation, ** here is the only place to modify the source code.**
app.get("/users", passport.authenticate('local'), user.authenticate_local);
app.get("/cool_user/", user.hello_user);
//app.get('/', routes.index);
//app.all('/observer/:content/', passport.authenticate('local'), observer.action);
app.all('/observer/:content/', observer.action);
app.all('/:action/:content/', actions.action);


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//////////
/*
//http://stackoverflow.com/questions/10164312/node-js-express-js-passport-js-stay-authenticated-between-server-restart
app.use(express.session({
    secret:'awesome unicorns',
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore(
        {db:mongoose.connection.db},
        function(err){
            console.log(err || 'connect-mongodb setup ok');
        })
}));*/
//http://passportjs.org/guide/username-password/
// https://github.com/jaredhanson/passport-local/tree/master/examples



// socket.io configuration
var io = require('socket.io').listen(server);
app.get('/hello', function(req, res){
    res.render('sio_test', {});
});
var sio = require('./routes/sio');
sio.mysio(io);