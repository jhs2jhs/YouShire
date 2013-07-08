var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;  
var ObjectID = require('mongodb').ObjectID;

exports.db_opt = function(db_cp, qry_obj, req_obj){
    MongoClient.connect('mongodb://127.0.0.1:27017/youshare', function(err, db){
		if (err) throw err;
		db_cp(db, qry_obj, req_obj)
    });
}

function reply_abst(db, qry_obj, req_obj, reply_results){
	if (req_obj.results_callback == undefined){
		if (req_obj.reply_type == 'json') {
			req_obj.res.send(reply_results);
		} else {
			req_obj.res.render('view_question', reply_results);
		}
	} else {
		req_obj.results_callback(qry_obj, reply_results);
	}
}

/////////// view 
exports.question_view = function(db, qry_obj, req_obj){
    var collection = db.collection("question");
    collection.find().toArray(function(err, results){
		db.close();
		var reply_results = {info:"", data:results};
		reply_abst(db, qry_obj, req_obj, reply_results);
    });
}
exports.question_view_single = function(db, obj, req, res){
    var collection = db.collection("question");
    collection.find(obj).limit(1).toArray(function(err, results){
	console.dir(results);
	collection.find({refID:obj._id}).toArray(function(err, replys){
	    // need to deside whether it should be AJAX to retreave replays
	    console.dir(replys);
	    db.close();
	    res.render('view_question_single', {results:results, replys:replys});
	})
    });
}


//////////// modify
exports.question_modify_get = function(db, obj, req, res){
    var collection = db.collection("question");
    collection.find(obj).limit(1).toArray(function(err, results){
	console.dir(results);
	db.close();
	res.render('modify_question_get', {results:results});
    });
}
exports.question_modify_delete = function(db, obj, req, res){
    var collection = db.collection("question");
    collection.remove(obj, {w:1}, function(err, numberOfRemoved){
	console.dir(numberOfRemoved);
	db.close();
	res.redirect('/view/question/');
    });
}
exports.question_modify_save = function(db, obj, req, res){
    var collection = db.collection("question");
    collection.update(obj.criteria, obj.objNew, {w:1}, function(err){
	if (err) console.warm(err.message);
	//console.dir(results);
	db.close();
	res.redirect('/view/question_single/?m_id='+obj.criteria._id);
    });
}

////////////// create
exports.question_insert = function(db, qry_obj, req_obj){
    var collection = db.collection("question");
    collection.insert(qry_obj, {w:1}, function(err, objects){
		if (err) console.warm(err.message);
		if (err && err.message.indexOf('E11000 ') !== -1){
	    	// this _id was already inserted in the database
		}
		db.close();
		var reply_results = {info:"", data:objects};
		reply_abst(db, qry_obj, req_obj, reply_results);
    });
}
exports.question_insert_replay = function(db, obj, req, res){
    var collection = db.collection("question");
    collection.insert(obj, {w:1}, function(err, objects){
	if (err) console.warm(err.message);
	if (err && err.message.indexOf('E11000 ') !== -1){
	    // this _id was already inserted in the database
	}
	//console.log('== question_insert');
	console.log(obj);
	res.redirect('/view/question_single/?m_id='+obj.refID);
    });
}