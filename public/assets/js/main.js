var socket = io();
var pseudo = prompt("Pseudo?");
socket.emit("set_pseudo", pseudo);

