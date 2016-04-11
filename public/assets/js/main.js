var socket = io();
var pseudo = prompt("Pseudo?");
socket.emit("set_pseudo", pseudo);
socket.on('message', function(message){
	document.getElementById('messages').innerHTML = document.getElementById('messages').innerHTML + "<br/>" + message.user.pseudo + ":" + message.message;
});
function send() {
	socket.emit("message", document.getElementById("message").value);
	document.getElementById("message").value = "";
}

