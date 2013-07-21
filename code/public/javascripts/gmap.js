var map;
var marker;
var myLatLng;

function loadScript(){
    var meta = document.createElement('meta');
    meta.rel = 'viewport';
    meta.content = 'initial-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyDy8D63AmOXbsuukgwQPF95zz93Uk-OssY&sensor=true&callback=initialize";
    document.head.appendChild(script);
    //detectBrowser();
}

function detectBrowser() {
    var useragent = navigator.userAgent;
    var mapdiv = document.getElementById("map-canvas");
    
    if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
        mapdiv.style.width = '100%';
        mapdiv.style.height = '100%';
	//window.alert('hello');
    } else {
	//window.alert('world');
        mapdiv.style.width = '600px';
        mapdiv.style.height = '800px';
    }
}
      
function initialize() {
    if (navigator.geolocation){
	navigator.geolocation.getCurrentPosition(function(position){
	    myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	    var tag_latlng = document.getElementById('tag_latlng');
	    tag_latlng.value = myLatLng.toString();
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
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        draggle:true,
        animation: google.maps.Animation.DROP,
        title:'click on the map to locate your object'
    });
    get_latlng_on_map_only();
}

function get_latlng_on_map_only(){
    //window.alert(myLatLng.toString());
    google.maps.event.addListener(map, 'click', function(event){
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        var latlng = new google.maps.LatLng(lat, lng);
        
	marker.setAnimation(google.maps.Animation.DROP);
	marker.setPosition(latlng);
	var tag_latlng = document.getElementById('tag_latlng');
	tag_latlng.value = latlng.toString();
    });
}

/*
function hello(){
/*
    google.maps.event.addListener(marker, 'click', function(){
        if (marker.getAnimation() != null){
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    });

    var infowindow = new google.maps.InfoWindow({
        content:"<h1>hello world</>"
    });
    google.maps.event.addListener(map, 'click', function(event){
        //show(marker);
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        var latlng = new google.maps.LatLng(lat, lng);
        marker.setPosition(latlng);
        infowindow.setContent(event.latLng.toString());
        //marker.setMap(map);
        //marker.setMap(map);
        //marker.setClickable(true);
        //marker.setDraggable(true);
        //map.setCenter(event.latLng);
        infowindow.open(map, marker);
    });
    google.maps.event.addListener(marker, 'dragend', function(event){
        console.log(event.latLng.lat());
        infowindow.setContent(event.latLng.lat());
    });
    
}
*/
      
// main to load javascript
window.onload = loadScript;