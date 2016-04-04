
var mongoose 		= require('mongoose');

mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("connected to db");
});

module.exports = db;