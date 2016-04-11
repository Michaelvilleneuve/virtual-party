var mongoose 		= require('mongoose');
var db 				= require('../db');

var userSchema = mongoose.Schema({    	
    pseudo: String,        
    socketId: String,
    pos_x: Number,
    pos_y: Number
});

var User = mongoose.model('User', userSchema);
User.remove({}).exec();

module.exports = User;
