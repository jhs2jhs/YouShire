
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
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

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
app.use(express.session({cookie: {maxAge:360000000}, secret:"keyboard cat"}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
passport.use(user.my_passport_local_strategy());
passport.serializeUser(user.serialize_user);
passport.deserializeUser(user.deserialize_user);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routing allocation, ** here is the only place to modify the source code.**
app.get('/', routes.index);
app.get("/logout", user.logout);
app.get("/login", user.login_get);
app.post("/login", passport.authenticate("local", { successReturnToOrRedirect: '/', failureRedirect: '/login' }))
app.get("/login_test/", ensureLoggedIn('/login'), user.login_test);

app.all('/user/:user_id/', ensureLoggedIn('/login'), user.profile);

app.all('/observer/:content/', ensureLoggedIn('/login'), observer.action);
app.all('/:action/:content/', ensureLoggedIn('/login'), actions.action);

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