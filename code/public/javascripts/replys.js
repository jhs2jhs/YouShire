var map;
var marker;
var myLatLng;

function loadScript(){
    var socket = io.connect(location.origin);
	var div_m_id = document.getElementById("question_id");
	var m_id = div_m_id.value;
	console.log(m_id);
	socket.emit('question_replys_list_request', {time:new Date().toString(), m_id:m_id});
	socket.on("question_replys_list_response", function(data){
		console.log(data)
		var div = document.getElementById("question_replys_list");
		var html = "";
		for (i in data.data) {
			var msg = data.data[i];
			console.log(msg);
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
    		html = html + "<div> <p>"+m_id+"</div>";
		}
		div.innerHTML = html;
		
	});
}
      
// main to load javascript
window.onload = loadScript;