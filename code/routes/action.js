
/*
 * GET actions of message: view | create | follow | modify
 */
var db = require('./db.js')
var ObjectID = require('mongodb').ObjectID;

exports.action = function(req, res){
    action = req.param('action');
    content = req.param('content');
    if (action == undefined){
	res.send("query action should == view | create | follow | modify");
    }
    if (content == undefined){
	res.send("action is seted, but query content should == question");
    }
    switch (action.toLowerCase()){
    case 'view':
	action_view(action, content, req, res);
	break
    case 'create':
	action_create(action, content, req, res);
	break
    case 'modify':
	action_modify(action, content, req, res);
	break
    case 'follow':
	res.send("hello");
	break
    default:
	res.send("query action should == view | create | follow | modify, you passed in "+req.param('action'));
    }
};

function action_view(action, content, req, res){
    switch (content.toLowerCase()) {
    case 'question':
	var obj_question = {};
	db.db_opt(db.question_view, obj_question, req, res);
	break
    case 'question_single':
	var m_id = req.param('m_id');
	var obj_question = {_id:new ObjectID(m_id)};
	db.db_opt(db.question_view_single, obj_question, req, res);
	break
    default:
    }
}

function action_create(action, content, req, res){
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
	console.log(req.query)
	console.log(req.body)
	var title = req.param('title');
	var body = req.param('body');
	var tags = req.param('tags');
	var latlng = req.param('latlng');
	var obj_question = {refID:'', title:title, body:body, latlng:latlng, created_at:new Date(), updated_at:new Date(), tags:tags};
	console.log(obj_question);
	db.db_opt(db.question_insert, obj_question, req, res);
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

function action_modify(action, content, req, res){
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