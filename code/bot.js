var querystring = require('querystring');
var domain = require('domain').create();
var request = require('request');
var myutil = require("./routes/myutil.js");

var mylat = 30.2835;
var mylng = 120.2623;
var myhost = 'http://localhost:3000';

function http_request(err_callback, response_process, vars){
    var r_options = {
	uri: vars.uri,
	method:'GET',
	timeout:2000,
	maxRedirects:10,
	headers:{'Accept':'text/html/json'}
    }
    var request_function = function(error, response, body){
        //myutil.debug(! error && response.statusCode==200);
        if (! error && response.statusCode==200){
	       response_process(err_callback, vars, response, body)
        } else {
	       if (response != undefined){
		      myutil.error(response.statusCode);
	       }
	       err_callback(vars, response, body);
	   }
    }
    request(r_options, request_function);
}

/* 
 * question & replys create 
 */
function question_create(ref_id){
    var lat = mylat + (1 - Math.random());
    var lng = mylng + (1 - Math.random());
    var tags = 'mylocation';    
    var latlng = (lat+','+lng);
    var reply_type = "json";
    var url = '';
    var vars = {};
    var url_q = querystring.stringify({ref_id:ref_id, title:title, body:body, tags:tags, latlng:latlng, reply_type:reply_type});
    if (ref_id == ''){
        var title = 'Q:'+(new Date().toString());
        var body = 'this is my answer : '+ title;
        url = myhost+'/create/question_post/?'+url_q;
        vars.uri = url
        vars.content = "question";
    } else {
        var title = 'R:'+(new Date().toString());
        var body = 'this is my rely : '+ title;
        url = myhost+'/create/question_reply/?'+url_q;
        vars.uri = url;
        vars.content = "replys";
    }
    http_request(question_create_err_callback, question_create_response_process, vars);
}

function question_create_err_callback(vars, response, body){
    myutil.debug('question_create_cp');
    myutil.debug(response);
    myutil.debug(body);
}

function question_create_response_process(callback, vars, response, body){
    myutil.debug(body.toString());
    myutil.debug(response.toString());
    callback();
}

/* 
 * question & replys view 
 */
function question_view(ref_id){
    var reply_type = "json";
    var url = '';
    var vars = {};
    var url_q = querystring.stringify({m_id:ref_id, reply_type:reply_type});
    if (ref_id == ''){
        url = myhost+'/view/question_all/?'+url_q;
        vars.uri = url;
        vars.content = "question";
    } else {
        url = myhost+'/view/question_replys/?'+url_q;
        vars.uri = url;
        vars.content = "replys";
    }
    http_request(question_view_err_callback, question_view_response_process, vars);
}

function question_view_err_callback(vars, response, body){
    myutil.debug('question_view_err_cp');
    myutil.debug(response);
    //myutil.debug(body);
}

function question_view_response_process(callback, vars, response, body){
    myutil.debug("question_view_response_cp");
    var r = JSON.parse(body);
    data = r.data;
    var i = Math.floor(Math.random()*data.length);
    var p = Math.random();
    if (p > 0.5){
        myutil.info(i, p);
        var msg = data[i];
        question_create(msg._id);
    } else {

    }
}

var i = 0; 
function loop(){
    myutil.info('loop:'+i);
    //question_create('')
    //question_create("51dba2960308f60417000002");
    question_view("");
    setTimeout(loop, 1000);        
    i = i + 1;
}

function main(argv){
    loop();    
}
domain.run(function(){
    main(process.argv);
});