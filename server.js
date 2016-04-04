// server.js
var express         = require('express');
var app             = express();
var server          = require('http').Server(app);
var io              = require('socket.io').listen(server);
var mongoose 		= require('mongoose');

mongoose.connect(process.env.MONGOLAB_URI);

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8080;

var router = express.Router();              

app.get('/test', function(req, res) {
   res.json({message: "hello"});
});

io.sockets.on('connection', function (socket) {
    console.log('New user connected !');
    console.log('ID :  '+socket.id);    
    socket.on('disconnect', function() {
       
    });
});

server.listen(port, function(){
	console.log("Server running on port: "+port)
});