var db = require('./db.js')
var ObjectID = require('mongodb').ObjectID;
var action = require('./action.js');

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
			var req_obj = action.get_req_obj();
			req_obj.reply_type = "json";
			req_obj.action = "view";
			req_obj.content = "question_all";
			req_obj.results_callback = sio_question_list;
			req_obj.qry_obj = {socket:socket};
			db.db_opt(db.question_view_all, req_obj);
		});
	});
}

function sio_question_list(req_obj){
	var results = req_obj.reply_results.data;
	//console.log(results);
	socket = req_obj.qry_obj.socket;
	socket.emit("question_list_response", {results:results});
}

