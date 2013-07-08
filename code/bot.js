var querystring = require('querystring');
var domain = require('domain').create();
var request = require('request');

var mylat = 30.2835;
var mylng = 120.2623;
var myhost = 'http://localhost:3000';

function debug(msg){
    console.log('\tDEBUG:'+msg);
}
function warm(msg){
    console.log('==WARM:'+msg);
}

function http_request(callback, response_process, vars){
    var r_options = {
	uri: vars.uri,
	method:'GET',
	timeout:2000,
	maxRedirects:10,
	headers:{'Accept':'text/html/json'}
    }
    var request_function = function(error, response, body){
	if (! error && response.statusCode==200){
	    response_process(callback, vars, response, body)
	} else {
	    if (response != undefined){
		warm(response.statusCode);
	    }
	    callback();
	}
    }
    request(r_options, request_function);
}

function question_create(ref_id){
    var lat = mylat + (1 - Math.random());
    var lng = mylng + (1 - Math.random());
    var title = 'q:'+(new Date().toString());
    var body = 'this is my answer : '+ title;
    var tags = 'mylocation';
    var latlng = (lat+','+lng);
    var url_q = querystring.stringify({title:title, body:body, tags:tags, latlng:latlng});
    var url = '';
    if (ref_id == ''){
	url = myhost+'/create/question_post/?'+url_q;
    } else {
	url = myhost+'/create/question_reply?'+url_q;
    }
    var vars = {uri:url};
    debug('url:'+vars.uri);
    http_request(question_create_callback, question_create_response_process, vars);
}

function question_create_callback(){
    debug('question_create_cp');
}

function question_create_response_process(callback, vars, response, body){
    debug(body.toString());
    callback();
}

var i = 0; 
function loop(){
    debug('loop:'+i);
    question_create('')
    setTimeout(loop, 1000);        
    i = i + 1;
}

function main(argv){
    loop();    
}
domain.run(function(){
    main(process.argv);
});