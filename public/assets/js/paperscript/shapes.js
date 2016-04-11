function Ball(i, r, p, v) {
	this.socketId = i;
	this.radius = r;
	this.point = p;
	this.vector = v;
	this.maxVec = 4;
	this.numSegment = 60;
	this.boundOffset = [];
	this.boundOffsetBuff = [];
	this.sidePoints = [];
	this.path = new Path({
		fillColor: {
			hue: 260,
			saturation: 1,
			brightness: 0.6
		},
		blendMode: 'lighter'
	});

	for (var i = 0; i < this.numSegment; i ++) {
		this.boundOffset.push(this.radius);
		this.boundOffsetBuff.push(this.radius);
		this.path.add(new Point());
		this.sidePoints.push(new Point({
			angle: 360 / this.numSegment * i,
			length: 1
		}));
	}
}
Ball.prototype = {
	iterate: function() {
		if (this.vector.length > this.maxVec)
			this.vector.length = this.maxVec;
		this.point += this.vector;
		this.updateShape();
	},

	updateShape: function() {
		var segments = this.path.segments;
		for (var i = 0; i < this.numSegment; i ++)
			segments[i].point = this.getSidePoint(i);

		this.path.smooth();
		for (var i = 0; i < this.numSegment; i ++) {
			if (this.boundOffset[i] < this.radius / 4)
				this.boundOffset[i] = this.radius / 4;
			var next = (i + 1) % this.numSegment;
			var prev = (i > 0) ? i - 1 : this.numSegment - 1;
			var offset = this.boundOffset[i];
			offset += (this.radius - offset) / 15;
			offset += ((this.boundOffset[next] + this.boundOffset[prev]) / 2 - offset) / 3;
			this.boundOffsetBuff[i] = this.boundOffset[i] = offset;
		}
	},

	react: function(b) {
		var dist = this.point.getDistance(b.point);
		if (dist < (this.radius + b.radius + 15) && dist != 0) {
			var overlap = this.radius + b.radius - dist;
			var direc = (this.point - b.point).normalize(overlap * 0.015);
			this.vector += direc;
			b.vector -= direc/10;

			var from = this.point;
			var to = b.point;
			var path = new Path.Line(from, to);
			path.strokeColor = {
				hue: 360,
				saturation: 1,
				brightness: 0.6
			};
			lines.addChild(path);

			this.calcBounds(b);
			b.calcBounds(this);
			this.updateBounds();
			b.updateBounds();
		}
	},

	getBoundOffset: function(b) {
		var diff = this.point - b;
		var angle = (diff.angle + 180) % 360;
		return this.boundOffset[Math.floor(angle / 360 * this.boundOffset.length)];
	},

	calcBounds: function(b) {
		for (var i = 0; i < this.numSegment; i ++) {
			var tp = this.getSidePoint(i);
			var bLen = b.getBoundOffset(tp);
			var td = tp.getDistance(b.point);
			if (td < bLen) {
				this.boundOffsetBuff[i] -= (bLen  - td) / 2;
			}
		}
	},

	getSidePoint: function(index) {
		return this.point + this.sidePoints[index] * this.boundOffset[index];
	},

	updateBounds: function() {
		for (var i = 0; i < this.numSegment; i ++){
			this.boundOffset[i] = this.boundOffsetBuff[i];
		}
	}
};

function onFrame() {

	lines.removeChildren();
	
	for (var i = 0; i < balls.length; i++) {
		for (var j = i + 1; j < balls.length; j++) {
			balls[i].react(balls[j]);
		}
	}
	for (var i = 0, l = balls.length; i < l; i++) {
		balls[i].iterate();
	}

	// decelerate and stop the ball if not moved
	for (var i = 1; i < balls.length; i++) {
		if(balls[i].maxVec > 0.1){
			balls[i].maxVec -= 0.2;
		}
	}
}

function onKeyDown(event) {
	for (var i = 1; i < balls.length; i++) {
		balls[i].maxVec = 6;
	}
	if(event.key === "up" || event.key === "z"){
		for (var i = 1; i < balls.length; i++) {
			balls[i].vector.y += 10;
			currentUser.pos_y -= 10;
		}
		socket.emit('move_up');
	}
	if(event.key === "down" || event.key === "s"){
		for (var i = 1; i < balls.length; i++) {
			balls[i].vector.y -= 10;
			currentUser.pos_y += 10;
		}
		socket.emit('move_down');
	}
	if(event.key === "left" || event.key === "q"){
		for (var i = 1; i < balls.length; i++) {
			balls[i].vector.x += 10;
			currentUser.pos_x -= 10;
		}
		socket.emit('move_left');
	}
	if(event.key === "right" || event.key === "d"){
		for (var i = 1; i < balls.length; i++) {
			balls[i].vector.x -= 10;
			currentUser.pos_x += 10;
		}
		socket.emit('move_right');
	}
}

function onKeyUp(event) {
}

paper.view.setCenter(0,0);

balls = [];
var lines = new Group();
var numBalls = 50;
socket.on('user', function(user){
	currentUser = user;
});

function createBall(user){
	var position = new Point(user.pos_x, user.pos_y);
	var id = user.socketId;
	var vector = new Point({
		angle: 360,
		length: Math.random() * 10
	});
	var radius = 20;
	var pseudoDefined = true;
	if(user.pseudo === "" || user.pseudo == undefined){
		pseudoDefined = false;
	}
	if(pseudoDefined || balls.length === 0){
		balls.push(new Ball(id, radius, position, vector));
	}
	console.log("pseudoDefined = "+pseudoDefined);
	console.log("pseudo = "+user.pseudo);
	console.log(balls);
}

socket.on('users', function(users){

	createBall(currentUser);

	for (var i = 0; i < (users.length - 1); i++) {
		if( users[i].socketId !== currentUser.socketId){
			createBall(users[i]);
		}
	}

	balls[0].path.fillColor.hue = 320;
	balls[0].maxVec = 0;
	balls[0].p = new Point(view.size/2, view.size/2);

});

socket.on('update', function(user){
	var user = user;
	console.log(user);
	var ballAlreadyExists = false;
	console.log(balls.length)
	for (var i = 0; i < balls.length; i++) {
		if(balls[i].socketId === user.socketId){
			balls[i].point.x = (currentUser.pos_x + user.pos_x)*6;
			balls[i].point.y = (currentUser.pos_y - user.pos_y)*6;
			ballAlreadyExists = true;
			break;
			console.log("break");
		} else {
			console.log(balls[i].socketId);
			console.log(user.socketId);
		}
	}
	if(!ballAlreadyExists){
		createBall(user);
		console.log("balle créée");
	}
});