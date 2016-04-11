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
        socket.emit('user', user);
	});
	
	var step = 10;

	function update() {
		user.save();
		socket.broadcast.emit('update', {id: socket.id, pos_x:user.pos_x, pos_y:user.pos_y});
	}
	function sendMessage(message, users) {
        for (var i = 0; i < users.length; i++) {
            socket.to(users[i].socketId).emit('message', { message:message, user: user });
        }
        socket.emit('message', { message:message, user: user });
    }

	socket.on('set_pseudo', function(pseudo){
		user.pseudo = pseudo;
		User.find(function (err, users) {
	  		if (err) return console.error(err);
			socket.emit('users', users);
		}); 
		update();
	});

    socket.on('move_left', function(x){
    	user.pos_x -= step;
    	update();
    });

    socket.on('move_right', function(x){
    	user.pos_x += step;
    	update();
    });

    socket.on('move_up', function(x){
    	user.pos_y += step;
    	update();
    });

    socket.on('move_down', function(x){
    	user.pos_y -= step;
    	update();
    });

    socket.on('message', function(message) {
       User.find().
            where('pos_x').gt(user.pos_x - 30).lt(user.pos_x + 30).
            where('pos_y').gt(user.pos_y - 30).lt(user.pos_y + 30).
            exec(
            function (err, users) {
                if (err) return console.error(err);
                sendMessage(message, users);
            }); 
    });

    socket.on('disconnect', function(x) {
       user.remove();
    });
});

server.listen(port, function(){
	console.log("Server running on port: "+port);
});