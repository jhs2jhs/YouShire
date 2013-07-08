var db = require('./db.js')
var ObjectID = require('mongodb').ObjectID;

exports.mysio = function(sio){
    sio_test(sio);
    sio_question(sio);
};

function sio_test(io){
    io.sockets.on('connection', function (socket) {
		socket.emit('news', { hello: 'world', time:new Date()});
		socket.on('my other event', function (data) {
	    	//console.log(data);
	    	//socket.emit('news', { hello: 'world',  time:new Date()});
		});
    });
}

function sio_question(io){
	io.sockets.on('connection', function(socket){
		socket.emit("question_init", {hello:"world"});
		socket.on("question_list_request", function(data){
			//console.log(data);
			var qry_obj = {socket:socket};
			var req_obj = {reply_type:"json", action:"view", content:"question", req:"", res:"", results_callback:sio_question_list};
			db.db_opt(db.question_view, qry_obj, req_obj);
		});
	});
}

function sio_question_list(qry_obj, reply_results){
	var results = reply_results.data;
	//console.log(results);
	socket = qry_obj.socket;
	socket.emit("question_list_response", {results:results});
}

