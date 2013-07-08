var db = require('./db.js')
var ObjectID = require('mongodb').ObjectID;

exports.action = function(req, res){
    content = req.param('content');
    if (content == undefined){
		res.send("action is seted, but query content should == question");
    }
    switch (content.toLowerCase()){
    	case 'question':
			question(req, res);
			break
    	default:
			res.send("query action should == view | create | follow | modify, you passed in "+req.param('action'));
    }
};

function question(req, res){
	res.render('observer_question', {});
}