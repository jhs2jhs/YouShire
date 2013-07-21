var db = require('./db.js')
var ObjectID = require('mongodb').ObjectID;
var action = require('./action.js');
var myutil = require("./myutil.js");

exports.mysio = function(io){
	io.sockets.on('connection', function (socket) {
    	sio_on_question(socket);
    });
};


/*
 * need to check if return is in format or not
 */
/*
sio.arguments = {
	results_scope : {
		question_all,

		},
	qry_lmt : 0 | 10 | ...,

}
*/
function sio_on_question(socket){
	sio_on_question_modify(socket);
	sio_on_question_view(socket);
}

/*
 *
 */
function sio_on_question_modify(socket){
	socket.on("modify_question_request", function(data){
		var req_obj = action.get_req_obj();
		req_obj.results_scope = data.results_scope;
		req_obj.reply_type = "json";
		req_obj.action = "modify";
		req_obj.sio.socket = socket;
		myutil.debug(req_obj.results_scope);
		switch (req_obj.results_scope) {
			case "question_delete_all":
				req_obj.sio.reply_event_keyword = "modify_question_delete_all_response";
				req_obj.results_callback = sio_question_modify;
				req_obj.content = "question_delete_all";
				req_obj.qry_obj = {};
				db.db_opt(db.question_modify_delete_all, req_obj);
				break;
			default:
				myutil.error("sio modify_question_request has wrong result_scope value:", req_obj.results_scope);
				socket.disconnect(true);
		}
	});
}

function sio_question_modify(req_obj){
	myutil.debug(req_obj.results_scope);
	switch (req_obj.results_scope) {
		default:
			var results = req_obj.reply_results;
			socket = req_obj.sio.socket;
			socket.emit(req_obj.sio.reply_event_keyword, results);
			break
	}
}


/*
 *
 */
function sio_on_question_view(socket){
	socket.on("view_question_request", function(data){
		var req_obj = action.get_req_obj();
		req_obj.results_scope = data.results_scope;
		req_obj.reply_type = "json";
		req_obj.action = "view";
		req_obj.sio.socket = socket;
		switch (req_obj.results_scope) {
			case "question_all":
				req_obj.sio.reply_event_keyword = "view_question_all_response";
				req_obj.results_callback = sio_question_view;
				req_obj.content = "question_all";
				req_obj.qry_obj = {refID:""};
				db.db_opt(db.question_view_all, req_obj);
				break;
			case "user_question_all":
				req_obj.sio.reply_event_keyword = "view_user_question_all_response";
				req_obj.results_callback = sio_question_view;
				req_obj.content = "user_question_all";
				req_obj.qry_obj = {refID:"", author_id:data.user_id};
				myutil.error(req_obj.qry_obj);
				db.db_opt(db.question_view_all, req_obj);
				break;
			case "question_replys_count":
				req_obj.sio.reply_event_keyword = "view_question_replys_count_response";
				req_obj.results_callback = sio_question_view;
				req_obj.content = "question_replys_count";
				req_obj.qry_obj = [
					{$match:{
						refID: {$ne: ""},
					}},
					{$group:{
						_id:"$refID", count:{$sum:1}
					}}
				];
				db.db_opt(db.question_view_replys_count, req_obj);
				break;
			case "question_replys":
				req_obj.sio.reply_event_keyword = "question_replys_list_response";
				req_obj.content = "question_replys";
				req_obj.m_id = data.m_id;
				req_obj.results_callback = sio_question_view;
				req_obj.qry_obj = {refID:req_obj.m_id};
				db.db_opt(db.question_view_replys, req_obj);
				break
			case "user_question_replys":
				req_obj.sio.reply_event_keyword = "view_user_question_replys_list_response";
				req_obj.content = "question_replys";
				req_obj.m_id = data.m_id;
				req_obj.results_callback = sio_question_view;
				req_obj.qry_obj = {author_id:data.user_id};
				db.db_opt(db.question_view_replys, req_obj);
				break
			default:
				myutil.error("sio view_question_request has wrong result_scope value:", req_obj.results_scope);
				socket.disconnect(true);
		}
	});
}

function sio_question_view(req_obj){
	myutil.debug(req_obj.results_scope);
	switch (req_obj.results_scope) {
		default:
			var results = req_obj.reply_results;
			socket = req_obj.sio.socket;
			socket.emit(req_obj.sio.reply_event_keyword, results);
			break
	}
}


