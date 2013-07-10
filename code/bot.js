var querystring = require('querystring');
var domain = require('domain').create();
var request = require('request');
var myutil = require("./routes/myutil.js");


/*
 * simulation configuration
 */
var mylat = 30.2835;
var mylng = 120.2623;
function get_lat_random(){
    return mylat - 2*(0.5 - 1* Math.random());
}
function get_lng_random(){
    return mylng - 2*(0.5 - 1* Math.random());
}
 
var myhost = 'http://localhost:3000';
var p_new_question = 0.5;
var ps = {
    new_question:0.5,
    no_interest_view:0.5,
    interst_single:0.5,
    interst_reply:0.5,
    question_new_question:0.5,
};


function http_request(err_callback, response_process, vars){
    var r_options = {
	uri: vars.uri,
	method:'GET',
	timeout:2000,
	maxRedirects:10,
	headers:{'Accept':'text/html/json'}
    }
    var request_function = function(error, response, body){
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
    var lat = get_lat_random();
    var lng = get_lng_random();
    var tags = 'mylocation';    
    var latlng = '('+lat+','+lng+')';
    var reply_type = "json";
    var url = '';
    var vars = {};
    //var url_q = querystring.stringify({ref_id:ref_id, title:title, body:body, tags:tags, latlng:latlng, reply_type:reply_type});
    if (ref_id == '' || ref_id == undefined){
        var title = 'Q:'+(new Date().toString());
        var body = 'this is my answer : '+ title;
        var url_q = querystring.stringify({ref_id:"", title:title, body:body, tags:tags, latlng:latlng, reply_type:reply_type});
        url = myhost+'/create/question_post/?'+url_q;
        vars.uri = url
        vars.content = "question";
    } else {
        var title = 'R:'+(new Date().toString());
        var body = 'this is my rely : '+ title;
        var url_q = querystring.stringify({ref_id:ref_id, title:title, body:body, tags:tags, latlng:latlng, reply_type:reply_type});
        url = myhost+'/create/question_reply/?'+url_q;
        vars.uri = url;
        vars.content = "replys";
    }
    vars.ref_id = ref_id;
    http_request(question_create_err_callback, question_create_response_process, vars);
}

function question_create_err_callback(vars, response, body){
    myutil.debug('question_create_err_cp');
}

function question_create_response_process(callback, vars, response, body){
    myutil.debug('question_create', vars.content, vars.ref_id);
    var r = JSON.parse(body);
    data = r.data;
    var m_id = data[0]._id;
    var ref_id = vars.ref_id;
    var p = Math.random();
    if (p > ps.question_create_out) {
        // leave after creating a question or reply
        return
    } else {
        var p = Math.random();
        if (p > ps.question_create_view_question) {
            question_view();
        } else {
            if (vars.content == "question") {
                question_view(m_id);
            } else {
                question_view(ref_id);
            }
        }
    }
}

/* 
 * question & replys view 
 */
function question_view(ref_id){
    var reply_type = "json";
    var url = '';
    var vars = {};
    var url_q = querystring.stringify({m_id:ref_id, reply_type:reply_type});
    if (ref_id == '' || ref_id == undefined){
        url = myhost+'/view/question_all/?'+url_q;
        vars.uri = url;
        vars.content = "question";
    } else {
        url = myhost+'/view/question_replys/?'+url_q;
        vars.uri = url;
        vars.content = "replys";
    }
    vars.ref_id = ref_id;
    http_request(question_view_err_callback, question_view_response_process, vars);
}

function question_view_err_callback(vars, response, body){
    myutil.debug('question_view_err_cp');
    myutil.debug(response);
    //myutil.debug(body);
}

function question_view_response_process(callback, vars, response, body){
    myutil.debug("question_view", vars.content, vars.ref_id);
    var p = Math.random();
    if (p < ps.no_interest_view){
        // by looking at all question, he may leave directly as he is not interesting on any question
        return
    }
    var r = JSON.parse(body);
    var data = r.data;
    var i = Math.floor(Math.random()*data.length);
    var ref_id = vars.ref_id;
    var p = Math.random();
    if (p > ps.interst_single){
        // user may be interest on a particular question.            
        // user may also be always focused on a particular question after login ????
        myutil.info(i, p);
        var msg = data[i];
        var p = Math.random();
        if (p > ps.interst_reply){
            if (ref_id == "" && vars.content=="replys"){
                myutil.error("hello", vars);
            }
            if (vars.content == "question") {
                // user may want to look at all replys to a particular question.
                question_view(msg._id);
            } else {
                question_view(ref_id);
            }
        } else {
            // by looking at other question and reply, user may be interesting to create a question or reply
            var p = Math.random();
            if (p > ps.question_new_question) {
                // ask a new question after looking others. 
                question_create("");
            } else {
                // make a reply after looking others. 
                if (ref_id == "" && vars.content=="replys"){
                    myutil.error("world", vars);

                }
                if (vars.content == "question") {
                    question_create(msg._id);
                } else {
                    question_create(ref_id);
                }
            }
        }
    } 
}

var i = 0; 
function loop(){
    myutil.info('loop:'+i);
    var p = Math.random();
    if (p > ps.new_question) { 
        // user may create question directly. 
        question_create('');
    } else {
        // another possible if to get all his reply first and then answer the question. ???
        // user may decide to view question first to see what other people talking about
        question_view('');
    }
    setTimeout(loop, 1000);        
    i = i + 1;
}

function main(argv){
    loop();
    //question_create("");
    //question_create("51dba2960308f60417000002");
}
domain.run(function(){
    main(process.argv);
});