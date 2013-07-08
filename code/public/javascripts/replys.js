var map;
var marker;
var myLatLng;

function loadScript(){
    var script = document.createElement("script");
    script.src = '/socket.io/socket.io.js';
    document.head.appendChild(script);
    var socket = io.connect('http://localhost:3000');
    socket.on('news', function(data){
	console.log(data);
	socket.emit('my other event', {my:'data'});
    });
}
      
// main to load javascript
window.onload = loadScript;