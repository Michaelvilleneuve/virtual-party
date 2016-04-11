var socket = io();
var pseudo = prompt("Pseudo?");
<<<<<<< HEAD
socket.emit("set_pseudo", pseudo);
=======
socket.emit("set_pseudo", pseudo);
socket.on('message', function(message){
	document.getElementById('messages').innerHTML = document.getElementById('messages').innerHTML + "<br/>" + message.user.pseudo + ":" + message.message;
});
function send() {
	socket.emit("message", document.getElementById("message").value);
	document.getElementById("message").value = "";
}

>>>>>>> 83ff2f9794d85758367647d262a53c1fe83d8e0f
