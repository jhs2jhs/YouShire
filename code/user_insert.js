var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;  
var ObjectID = require('mongodb').ObjectID;
var myutil = require("./routes/myutil.js");

var mongodb_url = "mongodb://127.0.0.1:27017/youshare";

function db_opt(username, password, callback){
    MongoClient.connect(mongodb_url, function(err, db){
		if (err) throw err;
		var collection = db.collection("user");
		collection.update(
			{username: username},
			{$set: {password: password}},
			{upsert:true},
			function(err){
				db.close();
				console.log(username);
				callback();
			});

    });
}

db_opt("hello", "world", function(){});
db_opt("world", "hello", function(){});
db_opt("admin", "admin", function(){});

var i = 1;
function user_loop(){
	if (i < 100){
		var username = "user_"+i;
		var password = "user_"+i;
		db_opt(username, password, user_loop);
	}
	i = i + 1
}

user_loop();
