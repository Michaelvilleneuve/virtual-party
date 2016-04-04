var socket = io();
var pseudo = prompt("Pseudo?");
socket.emit("set_pseudo", pseudo);

socket.on('users', function(users){
	console.log(users);
});

socket.on('update', function(user){
	console.log(user);
});


