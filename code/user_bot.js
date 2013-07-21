var querystring = require('querystring');
var domain = require('domain').create();
var request = require('request');
var myutil = require("./routes/myutil.js");
var superagent = require("superagent");

global.user_agent = superagent.agent();


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


//////////////////////////////////////
/*
// median
var ps = {
    p_login: 0.5 // decide whether to login or only want to view the public website
    p_nq: 0.5, //make a new question once login in
    p_npr_l: 0.5, //leave after make a new question || no_interest_view:0.5,
    p_np_vp: 0.5, // view all question after make a new questio. the oposite p will be to view replys to a question || interst_single:0.5,
    p_vpr_l: 0.5, // leave after view a reply or question. 
    p_vpr_vp: 0.5, // interesting on a particular question after viewing all questions. 
    p_vpr_vp_vr: 0.5, // continue to view question after viewing ||  interst_reply:0.5,
    p_vpr_vp_nq : 0.5, // continue to create question or reply after viewing || question_new_question:0.5,
};
*/
// uers are likely to make a reply. 
var ps = {
    p_login: 0.0, // decide whether to login or only want to view the public website
    // after login, it may look at her own question or replys first. 
    p_nq: 0.9, //make a new question once login in 
    p_npr_nl: 0.5, //not leave after make a new question || no_interest_view:0.5,
    p_np_nl_vp: 0.5, // view all question after make a new questio. the oposite p will be to view replys to a question || interst_single:0.5,

    p_vpr_nl: 0.1, // not leave after view a reply or question. 
    p_vpr_nl_npr : 0.5, // may continue make question or reply after make a new question. 
    p_vpr_nl_np : 0.5, // may continue make question after make a new question. 
    p_vpr_vp: 0.1, // interesting on a particular question after viewing all questions. 
    p_vpr_vp_vr: 0.1, // continue to view question after viewing ||  interst_reply:0.5,
    p_vpr_vp_nq : 0.9, // continue to create question or reply after viewing || question_new_question:0.5,

    // user may delete a question first 
};



/* 
 * question & replys create 
 */
function user_question_create(ref_id){
    var lat = get_lat_random();
    var lng = get_lng_random();
    var tags = 'mylocation';    
    var latlng = '('+lat+','+lng+')';
    var reply_type = "json";
    var vars = {};
    if (ref_id == '' || ref_id == undefined){
        var title = 'Qqq:'+(new Date().toString());
        var body = 'this is my answer : '+ title;
        vars.ref_id = '';
        vars.url = myhost+'/create/question_post/'
        vars.content = "question";
    } else {
        var title = 'Rrr:'+(new Date().toString());
        var body = 'this is my rely : '+ title;
        vars.ref_id = ref_id;
        vars.url = myhost+'/create/question_reply/';
        vars.content = "replys";
    }
    vars.ref_id = ref_id;
    global.user_agent
        .get(vars.url)
        .set('Content-Type', 'application/json')
        .query({ref_id:vars.red_id, title:title, body:body, tags:tags, latlng:latlng, reply_type:reply_type})
        .end(function(err, res){
            if (err) {
                myutil.error("== user_question_create ==", err);
                return
            }
            if (res.ok){
                myutil.debug("== user_question_create ==");
                var body = res.text;
                //myutil.debug(res.body, res.text);
                user_question_create_no_leave(body, vars);
            } else {
                myutil.error("== user_question_create ==", err, res.status);
            }
        });

}

function user_question_create_no_leave(body, vars){
    var r = JSON.parse(body);
    data = r.data;
    var m_id = data[0]._id;
    var ref_id = vars.ref_id;
    var p = Math.random();
    if (p > ps.p_npr_nl) {
        // continue create
        var p = Math.random();
        if (p > ps.p_npr_nl_np) {
            user_question_create("")
            return
        }
        // view 
        var p = Math.random();
        if (p > ps.p_npr_nl_vp) {
            // view all question after creating a quetion ot reply. 
            user_question_view("");
        } else {
            // view all the reply after creating a queston or reply.
            if (vars.content == "question") {
                user_question_view(m_id);
            } else {
                user_question_view(ref_id);
            }
        }
    }
}

/* 
 * question & replys view 
 */
function user_question_view(ref_id){
    var reply_type = "json";
    var vars = {};
    if (ref_id == '' || ref_id == undefined){
        vars.url = myhost+'/view/question_all/';
        vars.content = "question";
    } else {
        vars.url = myhost+'/view/question_replys/';
        vars.content = "replys";
    }
    vars.ref_id = ref_id;
    global.user_agent
        .get(vars.url)
        .set('Content-Type', 'application/json')
        .query({m_id:ref_id, reply_type:reply_type})
        .end(function(err, res){
            if (err) {
                myutil.error("== user_question_view ==", err);
                return
            }
            if (res.ok){
                myutil.debug("== user_question_view ==");
                var body = res.text;
                //myutil.debug(res.body, res.text);
                user_question_view_not_leave(body, vars);
            } else {
                myutil.error("== user_question_view ==", err, res.status);
            }
        });
}

function user_question_view_not_leave(body, vars){
    var p = Math.random();
    if (p < ps.p_vpr_nl){
        // by looking at all question, he may leave directly as he is not interesting on any question
        return
    } 
    var p = Math.random();
    if (p > ps.p_vpr_nl_npr) {
        if (p > ps.p_vpr_nl_np) {
            user_question_create("");
            return
        } else {
            if (content == "replys") {
                user_question_create(vars.ref_id);
                return
            }
        }
    }
    // would do other after viewing. view all would be in loop again. 
    var r = JSON.parse(body);
    var data = r.data;
    var i = Math.floor(Math.random()*data.length);
    var p = Math.random();
    if (p > ps.p_vpr_nl_npr) {
        user_question_create("");
    }
    if (p > ps.p_vpr_nl_vp){
        // user may be interest on a particular question.            
        // user may also be always focused on a particular question after login ????
        var msg = data[i];
        var p = Math.random();
        if (p > ps.p_vpr_vp_vr){
            if (ref_id == "" && content=="replys"){
                myutil.error("hello", vars);
            }
            if (vars.content == "question") {
                // user may want to look at all replys to a particular question.
                user_question_view(msg._id);
            } else {
                user_question_view(ref_id);
            }
        } else {
            // by looking at other question and reply, user may be interesting to create a question or reply
            var p = Math.random();
            if (p > ps.p_vpr_vp_nq) {
                // ask a new question after looking others. 
                user_question_create("");
            } else {
                // make a reply after looking others. 
                if (ref_id == "" && vars.content=="replys"){
                    myutil.error("world", vars);

                }
                if (vars.content == "question") {
                    user_question_create(msg._id);
                } else {
                    user_question_create(ref_id);
                }
            }
        }
    }
}

function user_login(username, password){
    myutil.debug(username, password);
    global.user_agent
        .post(myhost+"/login")
        .type("form")
        .set('Content-Type', 'application/json')
        .send({username:username, password:password})
        .end(function(err, res){
            if (err) {
                myutil.error("== user_login ==", err);
                return
            }
            if (res.ok) {
                myutil.debug("== user_login ==");
                var p = Math.random();
                if (p > ps.p_nq) { 
                    user_question_create();
                } else {
                    user_question_view();
                }
            } else {
                myutil.error("== user_login ==", err, res.status);
            }
        });
}
var i = 1;
function user_start(){
    myutil.error(i);
    i = i +1;
    var username = "hello";
    var password = "world";
    var p = Math.random();
    if (p > ps.p_login) {
        user_login(username, password);
    }
    //setTimeout(user_start, 1000);
}

function main(argv){
    user_start();
    //setTimeout(this, 1000);
}

domain.run(function(){
    main(process.argv);
    /*
    for (var i = 99; i < 100; i++){
        myutil.error(i);
        //setTimeout(main, 1000);  
        main();
    }
    myutil.debug("finish");
    */
});