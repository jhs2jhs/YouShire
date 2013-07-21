
/*
 * GET actions of message: view | create | follow | modify
 */
var db = require('./db.js')
var ObjectID = require('mongodb').ObjectID;
var myutil = require("./myutil.js");

/*
URL_REQUEST_EXAMPLE = {
	action: [view | create | modify | comment],
	content: [question_all | question_limited | question_single],
	reply_type: [html | json],
	user_scope: [me | group | all],
	results_type: [undefined | callback],
	find_limit: [10 | n],
	m_id: xxxxxxxxxxxxxxx,
	title:'';
	body:'';
	tags:'';
	latlng:'';
	// following are adding by system after URL processing.
	render_page: [view_question | ...],
	qry_obj: {
	
	},
	reply_results: {
		info:{
	
		},
		data: {
	
		}
	},
	sio:{
		socket:undefined,
	}
}
*/

function get_req_obj(){
	var req_obj = {
		req:undefined,
		res:undefined,
		action:undefined,
		content:undefined,
		reply_type:undefined,
		user_scope:undefined,
		results_callback:undefined,
		find_limit:0,
		m_id:undefined,
		render_page:undefined,
		redirect:undefined,
		qry_obj:{},
		reply_results:{},
		sio:{socket:undefined}
	};
	return req_obj;
}

exports.get_req_obj = get_req_obj;

// routing distribution : source code entrance. 
exports.action = function(req, res){
	var req_obj = new get_req_obj();
	req_obj.reply_type = req.param("reply_type"); // define which format it should reply with. it can only be html or json so far
    req_obj.action = req.param('action'); // view | create | follow | modify
    req_obj.content = req.param('content');
    if (req_obj.action == undefined){
		res.send("query action should == view | create | follow | modify");
    }
    if (req_obj.content == undefined){
		res.send("action is seted, but query content should == question");
    }
    if (req_obj.reply_type == undefined){ // if not specify, it would reply html format
    	req_obj.reply_type = "html";
    } else if (req_obj.reply_type.toLowerCase() != "json") {
    	req_obj.reply_type = "html";
    } else {
    	req_obj.reply_type = 'json';
    }
    req_obj.results_callback = undefined; // external request would always want res.reply, internal request would always want callback to process the results. 
    req_obj.req = req;
    req_obj.res = res;
     
    switch (req_obj.action.toLowerCase()){
    	case 'view':
			action_view(req_obj);
			break
    	case 'create':
			action_create(req_obj);
			break
    	case 'modify':
			action_modify(req_obj);
			break
    	case 'follow':
			res.send("hello");
			break
    	default:
			res.send("query action should == view | create | follow | modify, you passed in "+req.param('action'));
    }
};


function action_view(req_obj){
    switch (req_obj.content.toLowerCase()) {
    	case 'question_all':
			req_obj.render_page = "view_question";
			req_obj.qry_obj = {refID:""};
			db.db_opt(db.question_view_all, req_obj);
			break
		case 'question_limit':
			req_obj.find_limit = parseInt(req_obj.req.param('find_limit'));
			req_obj.render_page = "view_question";
			req_obj.qry_obj = {};
			db.db_opt(db.question_view_limit, req_obj);
			break
    	case 'question_single':
    		req_obj.find_limit = 1;
    		req_obj.render_page = "view_question_single";
			req_obj.m_id = req_obj.req.param('m_id');
			req_obj.qry_obj = {_id:new ObjectID(req_obj.m_id)};
			db.db_opt(db.question_view_single, req_obj);
			break
		case 'question_replys':
			req_obj.reply_type = "json"; // can only reply with JSON.
    		//req_obj.render_page = "view_question_reply";
			req_obj.m_id = req_obj.req.param('m_id');
			req_obj.qry_obj = {_id:new ObjectID(req_obj.m_id)};
			db.db_opt(db.question_view_replys, req_obj);
			break
    	default:
    }
}

function action_create(req_obj){
    switch (req_obj.content.toLowerCase()) {
    	case 'question_init':
			req_obj.res.render('create_question.jade', {user:req_obj.req.user});
			break
    	case 'question_init_gmap':
			req_obj.res.render('create_question_gmap.jade', {user:req_obj.req.user});
			break
    	case 'question_init_gmap_full': // it is not implemented
			req_obj.res.render('create_question_gmap_full.jade', {user:req_obj.req.user});
			break
    	case 'question_post':
    		//req_obj.render_page = "view_question_single"; should be redirect
    		req_obj.redirect = "/view/question_single/"
			var title = req_obj.req.param('title');
			var body = req_obj.req.param('body');
			var tags = req_obj.req.param('tags');
			var latlng = req_obj.req.param('latlng');
			var user_id = req_obj.req.user._id.toString(); // it can be undefined, or undefined or anything. need to double check,
			var username = req_obj.req.user.username;
			var ref_id = '';
			req_obj.qry_obj = {refID:ref_id, author_id:user_id, author_name: username, title:title, body:body, latlng:latlng, created_at:new Date(), updated_at:new Date(), tags:tags};
			db.db_opt(db.question_create, req_obj);
			break
    	case 'question_reply':
			var title = req_obj.req.param('title');
			var body = req_obj.req.param('body');
			var tags = req_obj.req.param('tags');
			var latlng = req_obj.req.param('latlng');
			var ref_id = req_obj.req.param('ref_id');
			var user_id = req_obj.req.user._id.toString(); // it can be undefined, or undefined or anything. need to double check,
			var username = req_obj.req.user.username;
			req_obj.redirect = "/view/question_single/?m_id="+ref_id;
			req_obj.qry_obj = {refID:ref_id	, author_id:user_id, author_name: username, title:title, body:body, latlng:latlng, created_at:new Date(), updated_at:new Date(), tags:tags};
			db.db_opt(db.question_create_replay, req_obj);
			break
    	default:
    }
}

function action_modify(req_obj){
    req_obj.m_id = req_obj.req.param('m_id');
    if (req_obj.m_id == undefined && req_obj.content.toLowerCase() != "question_delete_all"){
		req_obj.res.send("action and content is setted, but query m_id is not setted");
    }
    switch (req_obj.content.toLowerCase()) {
    	case 'question_get':
    		req_obj.render_page = "modify_question_get";
			req_obj.qry_obj = {_id:new ObjectID(req_obj.m_id)};
			db.db_opt(db.question_modify_get, req_obj);
			break
    	case 'question_delete':
    		req_obj.redirect = '/view/question_all/?reply_type='+req_obj.reply_type;
			req_obj.qry_obj = {_id:new ObjectID(req_obj.m_id)};
			db.db_opt(db.question_modify_delete, req_obj);
			break
		case 'question_delete_all':
    		req_obj.redirect = '/view/question_all/?reply_type='+req_obj.reply_type;
			req_obj.qry_obj = {};
			db.db_opt(db.question_modify_delete_all, req_obj);
			break
    	case 'question_save':
    	    req_obj.redirect = '/view/question_single/?reply_type='+req_obj.reply_type+"&m_id="+req_obj.m_id;
	 		var title = req_obj.req.param('title');
			var body = req_obj.req.param('body');
			var tags = req_obj.req.param('tags');
			var latlng = req_obj.req.param('latlng');
			req_obj.qry_obj = {criteria: {_id:new ObjectID(req_obj.m_id)}, objNew:{$set:{title:title, body:body, tags:tags, latlng:latlng}} };
			db.db_opt(db.question_modify_save, req_obj);
			break
    	default:
    }
}

function create_question_post(req, res){
    
}