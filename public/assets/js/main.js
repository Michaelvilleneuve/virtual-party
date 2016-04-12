var socket = io();
var pseudo = prompt("Pseudo?");
socket.emit("set_pseudo", pseudo);
socket.on('message', function(message){
	document.getElementById('messages').innerHTML = document.getElementById('messages').innerHTML + "<br/><span>" + message.user.pseudo + ":</span>" + message.message;
});

document.onkeypress = kp;
function kp(e){
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode
    if(charCode===13){
		send();
	}
}

function send() {
	socket.emit("message", document.getElementById("message").value);
	document.getElementById("message").value = "";
}
