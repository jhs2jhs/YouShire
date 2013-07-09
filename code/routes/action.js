
/*
 * GET actions of message: view | create | follow | modify
 */
var db = require('./db.js')
var ObjectID = require('mongodb').ObjectID;

/*
URL_REQUEST_EXAMPLE = {
	action: [view | create | modify | comment],
	content: [question_all | question_limited | question_single],
	reply_type: [html | json],
	results_type: [undefined | callback],
	find_limit: [10 | n],
	m_id: xxxxxxxxxxxxxxx,
	// following are adding by system after URL processing.
	render_page: [view_question | ...],
	qry_obj: {
	
	},
	reply_results: {
		info:{
	
		},
		data: {
	
		}
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
		results_callback:undefined,
		find_limit:0,
		m_id:undefined,
		render_page:undefined,
		qry_obj:{},
		reply_results:{},
	}
}

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
			action_modify(req_obj, req, res);
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
			var obj_question = {};
			req_obj.render_page = "view_question";
			req_obj.qry_obj = obj_question;
			db.db_opt(db.question_view_all, req_obj);
			break
		case 'question_limited':
			var find_limit = req_obj.param('find_limit');
			var obj_question = {render_page:"view_question", find_limit:find_limit};
			db.db_opt(db.question_view_limit, obj_question, req_obj);
			break
    	case 'question_single':
			var m_id = req.param('m_id');
			var obj_question = {_id:new ObjectID(m_id)};
			db.db_opt(db.question_view_single, obj_question, req_obj, req, res);
			break
    	default:
    }
}

function action_create(req_obj){
    switch (content.toLowerCase()) {
    	case 'question_init':
			res.render('create_question.jade', {});
			break
    	case 'question_init_gmap':
			res.render('create_question_gmap.jade', {});
			break
    	case 'question_init_gmap_full':
			res.render('create_question_gmap_full.jade', {});
			break
    	case 'question_post':
			console.log(req_obj.req.query)
			console.log(req_obj.req.body)
			var title = req_obj.req.param('title');
			var body = req_obj.req.param('body');
			var tags = req_obj.req.param('tags');
			var latlng = req_obj.req.param('latlng');
			var obj_question = {refID:'', title:title, body:body, latlng:latlng, created_at:new Date(), updated_at:new Date(), tags:tags};
			console.log(obj_question);
			db.db_opt(db.question_insert, obj_question, req_obj);
			//create_question_post(req, res);
			break
    case 'question_reply':
	console.log(req.query)
	console.log(req.body)
	var title = req.param('title');
	var body = req.param('body');
	var tags = req.param('tags');
	var latlng = req.param('latlng');
	var ref_id = req.param('ref_id');
	var obj_question = {refID:new ObjectID(ref_id), title:title, body:body, latlng:latlng, created_at:new Date(), updated_at:new Date(), tags:tags};
	console.log(obj_question);
	db.db_opt(db.question_insert_replay, obj_question, req, res);
	break
    default:
    }
}

function action_modify(req_obj, req, res){
    var m_id = req.param('m_id');
    if (m_id == undefined){
	res.send("action and content is setted, but query m_id is not setted");
    }
    switch (content.toLowerCase()) {
    case 'question_get':
	var obj_question = {_id:new ObjectID(m_id)};
	db.db_opt(db.question_modify_get, obj_question, req, res);
	break
    case 'question_delete':
	var obj_question = {_id:new ObjectID(m_id)};
	db.db_opt(db.question_modify_delete, obj_question, req, res);
	break
    case 'question_save':
	 var title = req.param('title');
	var body = req.param('body');
	var tags = req.param('tags');
	var latlng = req.param('latlng');
	var obj_question = {criteria: {_id:new ObjectID(m_id)}, objNew:{$set:{title:title, body:body, tags:tags, latlng:latlng}} };
	db.db_opt(db.question_modify_save, obj_question, req, res);
	break
    default:
    }
}

function create_question_post(req, res){
    
}