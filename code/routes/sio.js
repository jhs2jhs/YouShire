exports.mysio = function(sio){
    sio_test(sio);
};

function sio_test(io){
    io.sockets.on('connection', function (socket) {
	socket.emit('news', { hello: 'world', time:new Date()});
	socket.on('my other event', function (data) {
	    console.log(data);
	    //socket.emit('news', { hello: 'world',  time:new Date()});
	});
    });
}