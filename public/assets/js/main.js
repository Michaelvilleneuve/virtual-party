var socket = io();
var pseudo = prompt("Pseudo?");
socket.emit("set_pseudo", pseudo);
socket.on('message', function(message){
	document.getElementById('messages').innerHTML = document.getElementById('messages').innerHTML + "<p><span>" + message.user.pseudo + ":</span>" + message.message +'</p>';
});

document.onkeypress = kp;
function kp(e){
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode
    if(charCode===13){
    	e.preventDefault();
    	e.stopPropagation();
		send();
	}
}

function send() {
	socket.emit("message", document.getElementById("message").value);
	document.getElementById("message").value = "";
}
