var db = require('./db.js')
var ObjectID = require('mongodb').ObjectID;
var action = require('./action.js');

exports.mysio = function(io){
	io.sockets.on('connection', function (socket) {
    	sio_on_question(socket);
    	sio_on_question_replys(socket);
    });
};


/*
 * need to check if return is in format or not
 */
function sio_on_question(socket){
	socket.on("question_list_request", function(data){
		//console.log(data);
		var req_obj = action.get_req_obj();
		req_obj.reply_type = "json";
		req_obj.action = "view";
		req_obj.content = "question_all";
		req_obj.results_callback = sio_question_list;
		req_obj.sio.socket = socket;
		req_obj.qry_obj = {};
		db.db_opt(db.question_view_all, req_obj);
	});
}

function sio_question_list(req_obj){
	// the method can be abstracted into interface here.
	var results = req_obj.reply_results.data;
	socket = req_obj.sio.socket;
	socket.emit("question_list_response", {results:results});
}

/*
 *
 */
 function sio_on_question_replys(socket){
	socket.on("question_replys_list_request", function(data){
		//console.log(data);
		var req_obj = action.get_req_obj();
		req_obj.reply_type = "json";
		req_obj.action = "view";
		req_obj.content = "question_replys";
		req_obj.m_id = data.m_id;
		req_obj.results_callback = sio_question_replys_list;
		req_obj.sio.socket = socket;
		req_obj.qry_obj = {_id:new ObjectID(req_obj.m_id)};
		db.db_opt(db.question_view_replys, req_obj);
	});
}
function sio_question_replys_list(req_obj){
	// the method can be abstracted into interface here.
	var reply_results = req_obj.reply_results;
	socket = req_obj.sio.socket;
	socket.emit("question_replys_list_response", reply_results);
}

