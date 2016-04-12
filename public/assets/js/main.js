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

$(document).ready(function(){

	$(document).on('click', '.open-sidebar', function(){
		if( $('.open-sidebar').hasClass('opened') ){
			// close sidebar
			$('.sidebar').animate({
				'opacity': 0,
			}, 400, function(){
				$('.sidebar').removeClass('visible')
			});

			$('.open-sidebar').removeClass('opened').animate({
				'bottom': '10px'
			}, 400);

		} else {
			// open sidebar
			$('.sidebar').addClass('visible').animate({
				'opacity': 1, 
			}, 400);
			$('.open-sidebar').animate({
				'bottom': '390px'
			}, 400, function(){
				$('.open-sidebar').addClass('opened');
			})
		}
	});

});