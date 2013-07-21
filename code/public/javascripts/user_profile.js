function loadScript(){
    var socket = io.connect(location.origin);
	var div_user_id = document.getElementById("user_id");
	var user_id = div_user_id.value;
	console.log(user_id);
	//socket.emit('question_list_request', {results_scope:"question_replys", time:new Date().toString(), m_id:m_id});
	socket.emit('view_question_request', {results_scope:"user_question_all", user_id:user_id, time:new Date().toString()});
	socket.on("view_user_question_all_response", view_user_question_all_response);
	socket.emit('view_question_request', {results_scope:"user_question_replys", user_id:user_id, time:new Date().toString()});
	socket.on("view_user_question_replys_list_response", view_user_question_replys_list_response);
}

function view_user_question_all_response(data){
	console.log(data)
	var div = document.getElementById("my_questions");
	var html = "";
	for (i in data.data) {
		var msg = data.data[i];
		console.log(msg);
		m_author_name = msg.author_name;
    	m_id = msg._id;
    	m_latlng = msg.latlng;
    	m_ref_id = msg.refID;
    	m_tags = msg.tags;
    	m_title = msg.title;
    	m_body = msg.body;
    	//var latlng_str = m_latlng.replace("(", "").replace(")", "").split(",");
    	//var lat = parseFloat(latlng_str[0]);
    	//var lng = parseFloat(latlng_str[1]);
    	//var m_latlng = new google.maps.LatLng(lat, lng);
    	html = html + "<div><table><tr><td>"+m_id+"</td><td>"+m_body+"</td><td>"+m_author_name+"</td></tr></table></div>";
	}
	div.innerHTML = html;
}
function view_user_question_replys_list_response(data){
	console.log(data)
	var div = document.getElementById("my_replys");
	var html = "";
	for (i in data.data) {
		var msg = data.data[i];
		console.log(msg);
		m_author_name = msg.author_name;
    	m_id = msg._id;
    	m_latlng = msg.latlng;
    	m_ref_id = msg.refID;
    	m_tags = msg.tags;
    	m_title = msg.title;
    	m_body = msg.body;
    	//var latlng_str = m_latlng.replace("(", "").replace(")", "").split(",");
    	//var lat = parseFloat(latlng_str[0]);
    	//var lng = parseFloat(latlng_str[1]);
    	//var m_latlng = new google.maps.LatLng(lat, lng);
    	html = html + "<div><table><tr><td>"+m_id+"</td><td>"+m_body+"</td><td>"+m_author_name+"</td></tr></table></div>";
	}
	div.innerHTML = html;
}
      
// main to load javascript
window.onload = loadScript;