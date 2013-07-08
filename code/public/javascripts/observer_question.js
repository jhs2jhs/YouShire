var myLatLng;
var map;

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
}
