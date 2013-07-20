
/*
 * GET users listing.
 */

var db = require("./db.js");
var LocalStrategy = require('passport-local').Strategy;
var passport = require("passport");
var myutil = require("./myutil.js");
var ObjectID = require("mongodb").ObjectID;

/*
 * test http://localhost:3000/users?username=hello&password=world
 */
exports.my_passport_local_strategy = function(){
  var my_strategy = new LocalStrategy(
  	function(username, password, done) {
      myutil.debug("my_passport_local_strategy ====", username);
      var req_obj = {};
      req_obj.qry_obj = {username: username };
      req_obj.callback = user_find_one_cp;
      req_obj.username = username;
      req_obj.password = password;
      req_obj.done = done;
      //myutil.debug(req_obj);
      return db.db_opt(db.user_find_one, req_obj);
    }
  );
  return my_strategy;
};

function user_find_one_cp(err, user, req_obj){
  //myutil.debug(err, user);
  if (err) { return req_obj.done(err); }
  if (!user) {
    return req_obj.done(null, false, { message: 'Incorrect username.' });
  }
  if (!user.password == req_obj.password) {
    return req_obj.done(null, false, { message: 'Incorrect password.' });
  }
  myutil.debug("user_find_one_cp");
  return req_obj.done(null, user);
}

function serialize_user (user, done) {
  myutil.debug("serialize_user");
  done(null, user._id);
}
function deserialize_user (id, done) {
  myutil.debug("deserialize_user");
  var req_obj = {};
  req_obj.qry_obj = {_id: new ObjectID(id) };
  req_obj.callback = deserialize_user_cp;
  req_obj.done = done;
  myutil.debug("req_obj", req_obj);
  return db.db_opt(db.user_find_one, req_obj);
}
function deserialize_user_cp (err, user, req_obj){
  myutil.debug("deserialize_user_cp", err, user);
  req_obj.done(err, user);
}


/*
 *
 */
exports.authenticate_local = function(req, res){
  //myutil.debug(req);
  myutil.error(req.user.username);
  myutil.error(req.user);
  //res.send(req.user, req.session);
  res.redirect('/cool_user/');
};
exports.serialize_user = serialize_user;
exports.deserialize_user = deserialize_user;

exports.hello_user = function(req, res){
  myutil.debug(req.user, req.session);
  res.send(req.user);
};

exports.list = function(req, res){
  res.send("respond with a resource");
};