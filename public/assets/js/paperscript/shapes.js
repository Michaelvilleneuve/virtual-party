console.log(view.size);

function Ball(i, r, p, v, pseudo) {
	this.socketId = i;
	this.radius = r;
	this.point = p;
	this.vector = v;
	this.maxVec = 0;
	this.numSegment = 60;
	this.boundOffset = [];
	this.boundOffsetBuff = [];
	this.sidePoints = [];
	this.path = new Path({
		fillColor: {
			hue: 0,
			saturation: 0,
			brightness: 0.47
		},
		blendMode: 'lighter'
	});
	this.textPosition = new Point(this.point.x + 15, this.point.y - 20);
	this.text = new PointText({
		point: this.textPosition,
		content: pseudo,
		fillColor: 'black',
		fontFamily: 'Executive',
	    fontWeight: 'regular',
	    fontSize: 24
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
			path.strokeColor = "#09438B";
			path.fillColor = "#09438B";
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

	if(typeof yourball !== "undefined") {

		for (var j = 0; j < balls.length; j++) {
			yourball.react(balls[j]);
		}
		yourball.iterate();
	}

	for (var i = 0, l = balls.length; i < l; i++) {
		balls[i].iterate();
	}
	// decelerate and stop the ball if not moved
	/*for (var i = 1; i < balls.length; i++) {
		if(balls[i].maxVec > 0.1){
			balls[i].maxVec -= 0.2;
		}
	}*/
}

if(window.innerWidth <= 1024){
	window.ondevicemotion = function(event) {
	  abscisses = event.accelerationIncludingGravity.x
	  ordonnees = event.accelerationIncludingGravity.y

	  if(typeof currentUser !== "undefined") {
		  // left
		  if (abscisses > 3) {
		  	left();
		  }

		  // right
		  if (abscisses < -3) {
		  	right();
		  }

		  // down
		  if (ordonnees > 6) {
		  	down();
		  }

		  // up
		  if (ordonnees < 0) {
		  	up();
		  }
	  }
	}
}

function up() {
	for (var i = 0; i < balls.length; i++) {
		balls[i].point.y += 10;
		balls[i].text.point.y += 10;
	}
	currentUser.pos_y -= 10;
	socket.emit('move_up');
}
function down() {
	for (var i = 0; i < balls.length; i++) {
		balls[i].point.y -= 10;
		balls[i].text.point.y -= 10;
	}
	currentUser.pos_y += 10;
	socket.emit('move_down');
}
function left() {
	for (var i = 0; i < balls.length; i++) {
		balls[i].point.x += 10;
		balls[i].text.point.x += 10;
	}
	currentUser.pos_x -= 10;
	socket.emit('move_left');
}
function right() {
	for (var i = 0; i < balls.length; i++) {
		balls[i].point.x -= 10;
		balls[i].text.point.x -= 10;
	}
	currentUser.pos_x += 10;
	socket.emit('move_right');
}

function onKeyDown(event) {

	if(event.key === "up" || event.key === "z"){
		up();
	}
	if(event.key === "down" || event.key === "s"){
		down();
	}
	if(event.key === "left" || event.key === "q"){
		left();
	}
	if(event.key === "right" || event.key === "d"){
		right();
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
	createYourBall(currentUser);
	document.getElementById('pseudo').innerHTML = currentUser.pseudo;
});

function createYourBall(user){
	var datas = definePos(user);

	yourball = new Ball(datas.id, datas.radius, datas.position, datas.vector, user.pseudo);

	yourball.path.fillColor = "#09438B";
	yourball.p = new Point(view.size/2, view.size/2);
}

function createBall(user){
	var datas = definePos(user);

	if(user.pseudo === "" || user.pseudo == undefined){
		datas.pseudoDefined = false;
	}

	if(datas.pseudoDefined || balls.length === 0){
		balls.push(new Ball(datas.id, datas.radius, datas.position, datas.vector, user.pseudo));
	}
}

function definePos(user) {
	var pos_x = typeof currentUser === "undefined" ? 0 : currentUser.pos_x;
	var pos_y = typeof currentUser === "undefined" ? 0 : currentUser.pos_y;

	var datas = {
		id: user.socketId,
		position: new Point((user.pos_x - pos_x) , (user.pos_y - pos_y)),
		positionText: new Point((user.pos_x - pos_x - 20) , (user.pos_y - pos_y - 20)),
		vector: new Point({
			angle: 360,
			length: 100
		}),
		radius: 20,
		pseudoDefined: true
	}
	return datas;
}

function refresh() {
	document.getElementById('infos').innerHTML = balls.length+1 + ' utilisateur(s) en ligne';
}

/** Réception des utilisateurs **/
socket.on('users', function(users){

	for (var i = 0; i < (users.length - 1); i++) {
		createBall(users[i]);
	}

	refresh();
});

/** Mise à jour d'un utilisateur **/
socket.on('update', function(u){ 

	var userToUpdate = u;
	var ballAlreadyExists = false;

	var pos_x = typeof currentUser === "undefined" ? 0 : currentUser.pos_x;
	var pos_y = typeof currentUser === "undefined" ? 0 : currentUser.pos_y;

	for (var i = 0; i < balls.length; i++) {
		if(balls[i].socketId === userToUpdate.socketId){
			balls[i].point.x = userToUpdate.pos_x - pos_x;
			balls[i].point.y = userToUpdate.pos_y - pos_y;
			balls[i].text.point.x = userToUpdate.pos_x - pos_x + 15;
			balls[i].text.point.y = userToUpdate.pos_y - pos_y - 20;
			ballAlreadyExists = true;
			break;
		}
	}

	if(!ballAlreadyExists){
		createBall(userToUpdate);
	}

	refresh();
});

/** Suppression **/
socket.on('remove', function(user){

	for (var i = 0; i < balls.length; i++) {
		if(balls[i].socketId === user.socketId){
			try {
				balls[i].path.remove();	
				balls.splice(i, 1);
			} catch(err) {
				console.log(err);
			}
		}
	}
	refresh();
});
