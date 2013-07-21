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
/*
// uers are ramdonly
var ps = {
    p_login: 0.0, // decide whether to login or only want to view the public website

    p_np_max : 0.9 ,
    p_np_min : 0.6 ,
    p_mypr_max : 0.6,
    p_mypr_min : 0.3 ,
    p_vp_max : 0.3 ,
    p_vp_min : 0.1 ,

    p_np_vpr_max : 0.9 ,
    p_np_vpr_min : 0.6 ,
    p_np_npr_max : 0.6 ,
    p_np_npr_min : 0.3 ,
    p_np_loop_max : 0.3 ,
    p_np_loop_min : 0.1 ,

    p_vp_vpr_max : 0.9 ,
    p_vp_vpr_min : 0.6 ,
    p_vp_npr_max : 0.6 ,
    p_vp_npr_min : 0.3 ,
    p_vp_loop_max : 0.3 ,
    p_vp_loop_min : 0.1 ,

    p_mypr_vpr_max : 0.9 ,
    p_mypr_vpr_min : 0.6 ,
    p_mypr_npr_max : 0.6 ,
    p_mypr_npr_min : 0.3 ,
    p_mypr_loop_max : 0.3 ,
    p_mypr_loop_min : 0.1 ,

    // user may delete a question first 
};*/

// uers are likely to make a reply. 
var ps = {
    p_login: 0.0, // decide whether to login or only want to view the public website

    p_np_max : 0.9 ,
    p_np_min : 0.6 ,
    p_mypr_max : 0.6,
    p_mypr_min : 0.3 ,
    p_vp_max : 0.3 ,
    p_vp_min : 0.1 ,

    p_np_vpr_max : 0.9 ,
    p_np_vpr_min : 0.8 ,
    p_np_npr_max : 0.8 ,
    p_np_npr_min : 0.3 ,
    p_np_loop_max : 0.3 ,
    p_np_loop_min : 0.1 ,

    p_vp_vpr_max : 0.9 ,
    p_vp_vpr_min : 0.8 ,
    p_vp_npr_max : 0.8 ,
    p_vp_npr_min : 0.3 ,
    p_vp_loop_max : 0.3 ,
    p_vp_loop_min : 0.1 ,

    p_mypr_vpr_max : 0.9 ,
    p_mypr_vpr_min : 0.8 ,
    p_mypr_npr_max : 0.8 ,
    p_mypr_npr_min : 0.3 ,
    p_mypr_loop_max : 0.3 ,
    p_mypr_loop_min : 0.1 ,
    
    // user may delete a question first 
};


function decision(vars){
    var p = Math.random();
    //myutil.error(p, vars.current_status);
    if (vars.current_status == "user_login"){
        if (p > ps.p_np_min && p < ps.p_np_max) { 
            user_question_create("");
        } else if (p > ps.p_vp_min && p < ps.p_vp_max) {
            user_question_view("");
        } else if (p > ps.p_mypr_min && p < ps.p_mypr_max) {
            user_related_question_view("");
        }
        return
    } else if (vars.current_status == "user_question_create") {
        // view specific quetion or reply
        if (p > ps.p_np_vpr_min && p < ps.p_np_vpr_max) { 
            if (vars.content == "question") {
                // user may want to look at all replys to a particular question.
                user_question_view(vars.m_id);
            } else {
                user_question_view(vars.ref_id);
            }
            return
        }
        // ask or reply to a spefici question 
        if (p > ps.p_np_npr_min && p < ps.p_np_npr_max) {
            if (vars.ref_id == "" && vars.content=="replys"){
                myutil.error("world", vars);
            }
            if (vars.content == "question") {
                user_question_create(vars.m_id);
            } else {
                user_question_create(vars.ref_id);
            }
            return
        }
        // new loop
        if (p > ps.p_np_loop_min && p < ps.p_np_loop_max){
            decision({current_status:"user_login"});
        }
        return
    } else if (vars.current_status == "user_question_view") {
        // view specific quetion or reply
        if (p > ps.p_vp_vpr_min && p < ps.p_vp_vpr_max) { 
            if (vars.content == "question") {
                // user may want to look at all replys to a particular question.
                user_question_view(vars.msg._id);
            } else {
                user_question_view(vars.ref_id);
            }
            return
        }
        // ask or reply to a spefici question 
        if (p > ps.p_vp_npr_min && p < ps.p_vp_npr_max) {
            if (vars.ref_id == "" && vars.content=="replys"){
                myutil.error("world", vars);
            }
            if (vars.content == "question") {
                user_question_create(vars.msg._id);
            } else {
                user_question_create(vars.ref_id);
            }
            return
        }
        // new loop
        if (p > ps.p_vp_loop_min && p < ps.p_vp_loop_max){
            decision({current_status:"user_login"});
        }
        return
    } else if (vars.current_status == "user_related_question_view") {
        if (p > ps.p_mypr_vpr_min && p < ps.p_mypr_vpr_max) { 
            if (vars.content == "question") {
                // user may want to look at all replys to a particular question.
                user_related_question_view(vars.msg._id);
            } else {
                user_related_question_view(vars.ref_id);
            }
            return
        }
        // ask or reply to a spefici question 
        if (p > ps.p_mypr_npr_min && p < ps.p_mypr_npr_max) {
            if (vars.ref_id == "" && vars.content=="replys"){
                myutil.error("world", vars);
            }
            if (vars.content == "question") {
                user_question_create(vars.msg._id);
            } else {
                user_question_create(vars.ref_id);
            }
            return
        }
        // new loop
        if (p > ps.p_mypr_loop_min && p < ps.p_mypr_loop_max){
            decision({current_status:"user_login"});
        }
        return
    } else {

    }
}


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
    //myutil.error(ref_id);
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
    //vars.ref_id = ref_id;
    global.user_agent
        .get(vars.url)
        //.set('Content-Type', 'application/json')
        .query({ref_id:vars.ref_id, title:title, body:body, tags:tags, latlng:latlng, reply_type:reply_type})
        .end(function(err, res){
            if (err) {
                myutil.error("== user_question_create ==", err);
                return
            }
            if (res.ok){
                myutil.debug("== user_question_create ==");
                var body = res.text;
                //myutil.debug(res.body, res.text);
                //user_question_create_no_leave(body, vars);
                var r = JSON.parse(body);
                data = r.data;
                var m_id = data[0]._id;
                vars.m_id = m_id;
                vars.current_status = "user_question_create";
                decision(vars);
            } else {
                myutil.error("== user_question_create ==", err, res.status);
            }
        });

}

/* 
 * user related question & replys view 
 */
function user_related_question_view(ref_id){
    var reply_type = "json";
    var vars = {};
    if (ref_id == '' || ref_id == undefined){
        vars.url = myhost+'/view/user_question_all/';
        vars.content = "question";
    } else {
        vars.url = myhost+'/view/user_question_replys/';
        vars.content = "replys";
    }
    vars.ref_id = ref_id;
    global.user_agent
        .get(vars.url)
        .set('Content-Type', 'application/json')
        .query({m_id:ref_id, reply_type:reply_type})
        .end(function(err, res){
            if (err) {
                myutil.error("== user_related_question_view ==", err);
                return
            }
            if (res.ok){
                myutil.debug("== user_related_question_view ==");
                var body = res.text;
                //myutil.debug(res.body, res.text);
                //user_related_question_view_not_leave(body, vars);
                var r = JSON.parse(body);
                var data = r.data;
                var i = Math.floor(Math.random()*data.length);
                myutil.info(data.length, i);
                var msg = data[i];// ref_id = msg._id somtime
                vars.msg = msg;
                if (vars.msg == undefined) {vars.msg = {}; vars.msg._id= '';}
                vars.current_status = "user_related_question_view";
                decision(vars);
            } else {
                myutil.error("== user_related_question_view ==", err, res.status);
            }
        });
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
                //user_question_view_not_leave(body, vars);
                var r = JSON.parse(body);
                var data = r.data;
                var i = Math.floor(Math.random()*data.length);
                var msg = data[i];
                vars.msg = msg;
                if (vars.msg == undefined) {vars.msg = {}; vars.msg._id= '';}
                vars.current_status = "user_question_view";
                decision(vars);
            } else {
                myutil.error("== user_question_view ==", err, res.status);
            }
        });
}

function user_login(username, password){
    //myutil.debug(username, password);
    vars = {};
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
                vars.current_status = "user_login";
                decision(vars);
            } else {
                myutil.error("== user_login ==", err, res.status);
            }
        });
}
var i = 1;
function user_start(){
    i = i +1;
    var j = Math.floor(Math.random()*100);
    myutil.error(i, j);
    var username = "user_"+j;
    var password = "user_"+j;
    var p = Math.random();
    if (p > ps.p_login) {
        user_login(username, password);
    }
    setTimeout(user_start, 1000);
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