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
			var obj = {socket:socket};
			db.db_opt_cp(db.question_list, sio_question_list, obj);
		});
	});
}

function sio_question_list(results_obj, socket_obj){
	var results = results_obj.question_list;
	//console.log(results);
	socket = socket_obj.socket;
	socket.emit("question_list_response", {results:results});
}

