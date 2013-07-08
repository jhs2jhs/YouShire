var myLatLng;
var map;
var markers = {};
var infowindows = {};

google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(position){
	    	myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	    	initialize_local();
		});
    } else {
		myLatLng = new google.maps.LatLng(-34.397, 150.644);
		initialize_local();
    }
}

function initialize_local(){
    var mapOptions = {
		center: myLatLng,
		zoom: 8,
		panControl:true,
        zoomControl:true,
        mapTypeControl:true,
        scaleControl:true,
        streetViewControl:true,
        overviewMapControl:true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
	marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        draggle:true,
        animation: google.maps.Animation.BOUNCE,
        title:'click on the map to locate your object'
    });

    sio_register();
}


function sio_register(){
	var socket = io.connect(location.origin);
	socket.on('news', function (data) {
		console.log(data);
        socket.emit('my other event', { my: 'data' });
    }); 
    socket.on("question_init", function(data){
    	console.log("question_init", data);
    	socket.emit("question_list_request", {time:new Date()});
    });
    socket.on("question_list_response", function(data){
    	console.log("question_list_response", data);
    	var msgs = data.results;
    	for (i in msgs) {
    		msg = msgs[i];
    		m_id = msg._id;
    		m_latlng = msg.latlng;
    		m_ref_id = msg.refID;
    		m_tags = msg.tags;
    		m_title = msg.title;
    		m_body = msg.body;
    		var latlng_str = m_latlng.replace("(", "").replace(")", "").split(",");
    		var lat = parseFloat(latlng_str[0]);
    		var lng = parseFloat(latlng_str[1]);
    		var m_latlng = new google.maps.LatLng(lat, lng);
    		if (markers[m_id] == undefined) {
    			var marker = new google.maps.Marker({
    				position: m_latlng,
    				map:map,
    				title:m_title,
    				animation:google.maps.Animation.DROP
    			});
    			marker.m_id = m_id;
    			marker.m_ref_id = m_ref_id;
    			marker.m_tags = m_tags;
    			marker.m_title = m_tags;
    			marker.m_body = m_body;
    			markers[m_id] = marker;
    			var infowindow = new google.maps.InfoWindow({content:m_title});
    			infowindow.is_shown = false;
    			marker.info_window = infowindow;
    			infowindows[m_id] = infowindow;
    			google.maps.event.addListener(marker, 'click', function(event){
    				// this keyword is used to refer to marker object. 
    				if (this.info_window.is_shown == false) {
    					this.info_window.open(map, this);
    					this.info_window.is_shown = true;
    				} else {
    					this.info_window.close();
    					this.info_window.is_shown = false;
    				}
    			});
    		} else {
    			markers[m_id].setPosition(m_latlng);
    		}
    	}
    	setTimeout(sio_question_list_request, 5000);
    });
    function sio_question_list_request(){
		socket.emit("question_list_request", {time:new Date()});
	}	
}


