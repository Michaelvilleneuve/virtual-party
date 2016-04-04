// server.js
var express         = require('express');
var app             = express();
var server          = require('http').Server(app);
var io              = require('socket.io').listen(server);
var User 			= require('./models/user');

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8080;

var router = express.Router();              

app.get('/users', function(req, res) {	
	User.find(function (err, users) {
  		if (err) return console.error(err);
  		res.json(users);
	});   	
});

io.sockets.on('connection', function (socket) {
    var user = new User({ pseudo: '', socketId: socket.id,  pos_x: 0, pos_y: 0});
    user.save(function (err, user) {
	  	if (err) return console.error(err);	  	
	});

	socket.on('set_pseudo', function(pseudo){
		user.pseudo = pseudo;
		user.save();
	});

    socket.on('disconnect', function() {
       user.remove();
    });
});

server.listen(port, function(){
	console.log("Server running on port: "+port);
});