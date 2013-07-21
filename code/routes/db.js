var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;  
var ObjectID = require('mongodb').ObjectID;
var myutil = require("./myutil.js");

var mongodb_url = "mongodb://127.0.0.1:27017/youshare";
exports.mongodb_url = mongodb_url;

// wrapper function for all main entrance
exports.db_opt = function(db_cp, req_obj){
    MongoClient.connect(mongodb_url, function(err, db){
		if (err) throw err;
		db_cp(db, req_obj)
    });
}

// user management
exports.user_find_one = function(db, req_obj){
	var collection = db.collection("user");
    collection.findOne(req_obj.qry_obj, function(err, usr){
    	req_obj.callback(err, usr, req_obj);
    });
}

// abstract function to process for reply back.
function reply_abst(db, req_obj){
	if (req_obj.results_callback == undefined){ // like external request
		if (req_obj.reply_type == 'json') {
			req_obj.res.send(req_obj.reply_results);
		} else { // reply_type == html
			if (req_obj.redirect == undefined){
				req_obj.reply_results.user = req_obj.req.user;
				req_obj.res.render(req_obj.render_page, req_obj.reply_results);
			} else {
				req_obj.res.redirect(req_obj.redirect);
			}
		}
	} else {
		req_obj.results_callback(req_obj);
	}
}
var global_host = "http://localhost:3000";
var global_info = {
	"view all questions":global_host+"/view/question_all/?reply_type=json",
	"view single question":global_host+"/view/question_single/?m_id=???&reply_type=json",
	"view limited number of questions":global_host+"/view/question_limited/?find_limit=10&reply_type=json",
	"view replys to question":global_host+"/view/question_replys/?m_id=???&reply_type=json"
}

/*
 * view 
 */
exports.question_view_all = function(db, req_obj){
    var collection = db.collection("question");
    collection.find(req_obj.qry_obj).toArray(function(err, results){
		db.close();
		req_obj.reply_results = {info:global_info, data:results};
		reply_abst(db, req_obj);
    });
}
exports.question_view_limit = function(db, req_obj){
    var collection = db.collection("question");
    collection.find(req_obj.qry_obj).limit(req_obj.find_limit).toArray(function(err, results){
		db.close();
		req_obj.reply_results = {info:global_info, data:results};
		reply_abst(db, req_obj);
    });
}
exports.question_view_single = function(db, req_obj){
    var collection = db.collection("question");
    collection.find(req_obj.qry_obj).limit(req_obj.find_limit).toArray(function(err, results){
		db.close();
	    req_obj.reply_results = {info:global_info, data:results};
	    reply_abst(db, req_obj);
    });
}
exports.question_view_replys = function(db, req_obj){
    var collection = db.collection("question");
    collection.find(req_obj.qry_obj).limit(req_obj.find_limit).toArray(function(err, results){
		db.close();
	    req_obj.reply_results = {info:global_info, data:results};
	    reply_abst(db, req_obj);
    });
}
exports.question_view_replys_count = function(db, req_obj){
    var collection = db.collection("question");
    collection.aggregate(req_obj.qry_obj, function(err, results){
		db.close();
	    req_obj.reply_results = {info:global_info, data:results};
	    reply_abst(db, req_obj);
    });
}
//////////// 

/*
 * modify
 */
exports.question_modify_get = function(db, req_obj){
    var collection = db.collection("question");
    collection.find(req_obj.qry_obj).limit(1).toArray(function(err, results){
		db.close();
		req_obj.reply_results = {info:global_info, data:results};
		reply_abst(db, req_obj);
    });
}
exports.question_modify_delete = function(db, req_obj){
    var collection = db.collection("question");
    collection.remove(req_obj.qry_obj, {w:1}, function(err, numberOfRemoved){
		db.close();
		req_obj.reply_results = {info:global_info, data:numberOfRemoved};
		reply_abst(db, req_obj);
    });
}
exports.question_modify_delete_all = function(db, req_obj){
    var collection = db.collection("question");
    collection.remove(req_obj.qry_obj, {w:1}, function(err, numberOfRemoved){
		db.close();
		req_obj.reply_results = {info:global_info, data:numberOfRemoved};
		reply_abst(db, req_obj);
    });
}
exports.question_modify_save = function(db, req_obj){
    var collection = db.collection("question");
    collection.update(req_obj.qry_obj.criteria, req_obj.qry_obj.objNew, {w:1}, function(err, results){
		if (err) console.warm(err.message);
		db.close();
		req_obj.reply_results = {info:global_info, data:results};
		reply_abst(db, req_obj);
    });
}
////////////// 

/*
 * create
 */
exports.question_create = function(db, req_obj){
    var collection = db.collection("question");
    collection.insert(req_obj.qry_obj, {w:1}, function(err, objects){
		if (err) console.warm(err.message);
		if (err && err.message.indexOf('E11000 ') !== -1){
	    	// this _id was already inserted in the database
		}
		db.close();
		// to redirect back to correct message 
		req_obj.redirect = req_obj.redirect+"?m_id="+objects[0]._id;
		req_obj.reply_results = {info:global_info, data:objects};
		reply_abst(db, req_obj);
    });
}
exports.question_create_replay = function(db, req_obj){
    var collection = db.collection("question");
    collection.insert(req_obj.qry_obj, {w:1}, function(err, objects){
		if (err) console.warm(err.message);
		if (err && err.message.indexOf('E11000 ') !== -1){
	    	// this _id was already inserted in the database
		}
		req_obj.reply_results = {info:global_info, data:objects};
		reply_abst(db, req_obj);
    });
}