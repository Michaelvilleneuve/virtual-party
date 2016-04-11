var socket = io();
var pseudo = prompt("Pseudo?");
socket.emit("set_pseudo", pseudo);
socket.on('update', function(user){
	console.log(user);
});


