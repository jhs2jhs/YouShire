var myLatLng;
var map;
var markers = [];
var socket;
var flag_auto_load = false;

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
		zoom: 10,
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

    socket = io.connect(location.origin);
    sio_question_view();
}

function buttom_empty_db(){
    socket.emit("modify_question_request", {results_scope:"question_delete_all", qry_lmt:0, time:new Date()});
}

function buttom_load_once(){
    //socket = io.connect(location.origin);
    flag_auto_load = false;
    emit_view_question_request();
}

function buttom_load_auto_on(){
    //socket = io.connect(location.origin);
    flag_auto_load = true;
    emit_view_question_request();
}
function buttom_load_auto_off(){
    flag_auto_load = false;
}

function latlng_parse(m_latlng){
    var latlng_str = m_latlng.replace("(", "").replace(")", "").split(",");
    var lat = parseFloat(latlng_str[0]);
    var lng = parseFloat(latlng_str[1]);
    var m_latlng = new google.maps.LatLng(lat, lng);
    return m_latlng;
}

function emit_view_question_request(){
    socket.emit("view_question_request", {results_scope:"question_all", qry_lmt:0, time:new Date()});
}

function sio_question_view(){
    //var socket = io.connect(location.origin);
    socket.on("modify_question_delete_all_response", function(data){
        console.log("buttom: empty ", data.data, flag_auto_load);
    });
    socket.on("view_question_all_response", function(data){
        console.log(socket.socket.connected);
    	var msgs = data.data;
        //console.log(msgs);
        var marker_ids = [];
    	for (i in msgs) {
    		msg = msgs[i];
    		m_id = msg._id;
    		//m_ref_id = msg.refID;
    		m_tags = msg.tags;
    		m_title = msg.title;
    		//m_body = msg.body;
    		m_latlng = latlng_parse(msg.latlng);
            marker_ids[m_id] = true;
    		if (markers[m_id] == undefined) {
    			var marker = new google.maps.Marker({
    				position: m_latlng,
    				map:map,
    				title:m_title,
    				animation:google.maps.Animation.DROP
    			});
    			marker.m_id = m_id;
    			//marker.m_ref_id = m_ref_id;
    			marker.m_tags = m_tags;
    			marker.m_title = m_tags;
    			//marker.m_body = m_body;
                marker.info_window = undefined;
    			markers[m_id] = marker;
    		} else {
    			markers[m_id].setPosition(m_latlng);
    		}
    	}
        for (i in markers) {
            marker = markers[i];
            if (marker_ids[marker.m_id] == true){
                continue
            } else {
                marker.setMap(null);
                marker = null;
            }
        }
        socket.emit("view_question_request", {results_scope:"question_replys_count", qry_lmt:0, time:new Date()});
    });
    socket.on("view_question_replys_count_response", function(data){
        console.log("view_question_replys_count_response", data);
        var msgs = data.data;
        for (i in msgs) {
            msg = msgs[i];
            m_ref_id = msg._id;
            m_count = msg.count;
            var marker = markers[m_ref_id];
            if (marker == undefined) {
                console.log("marker undefined", m_ref_id);
                continue;
            }
            if (marker.info_window == undefined) {
                var infowindow = new google.maps.InfoWindow({
                    content:m_count.toString(),
                    maxWidth:1,
                });
                infowindow.is_shown = true;
                infowindow.open(map, marker);
                infowindow.m_count = m_count.toString();
                marker.info_window = infowindow;
            } else {
                var infowindow = marker.info_window;
                if (infowindow.m_count != m_count.toString()){
                    infowindow.m_count = m_count.toString();
                    infowindow.setContent(m_count.toString());
                    //infowindow.is_shown = true;
                    infowindow.open(map, marker);
                } else {
                    //infowindow.is_shown = false;
                    infowindow.close();
                }
                
            }
            // also need to check if the reply is finished all, so need to remove from map.
        }
        console.log("buttom auto load: ", flag_auto_load);
        if (flag_auto_load == true) {
            setTimeout(sio_question_list_request, 2000);
        }   
    });
    function sio_question_list_request(){
        console.log("===========");
        if (flag_auto_load == true) {
            socket.emit("view_question_request", {results_scope:"question_all", qry_lmt:0, time:new Date()});
        }
    }
    
}
