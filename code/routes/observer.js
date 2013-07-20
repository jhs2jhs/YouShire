var db = require('./db.js')
var ObjectID = require('mongodb').ObjectID;
var action = require("./action.js");
var myutil = require("./myutil.js");

exports.action = function(req, res){
    var req_obj = new action.get_req_obj();
    req_obj.content = req.param('content');
    if (req_obj.content == undefined){
		res.send("action is seted, but query content should == question");
    }
    req_obj.res = res;
    req_obj.req = req;
    switch (req_obj.content.toLowerCase()){
    	case 'question':
			question(req_obj);
			break
    	default:
			res.send("query action should == view | create | follow | modify, you passed in "+req.param('action'));
    }
};

function question(req_obj){
	req_obj.res.render('observer_question', {});
}