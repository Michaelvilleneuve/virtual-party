// shapes //
// kynd.info 2014

function Ball(r, p, v) {
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
			hue: 0,
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
		this.checkBorders();
		if (this.vector.length > this.maxVec)
			this.vector.length = this.maxVec;
		this.point += this.vector;
		this.updateShape();
	},

	checkBorders: function() {
		var size = view.size;
		if (this.point.x < -this.radius)
			this.point.x = size.width + this.radius;
		if (this.point.x > size.width + this.radius)
			this.point.x = -this.radius;
		if (this.point.y < -this.radius)
			this.point.y = size.height + this.radius;
		if (this.point.y > size.height + this.radius)
			this.point.y = -this.radius;
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
		if (dist < this.radius + b.radius && dist != 0) {
			var overlap = this.radius + b.radius - dist;
			var direc = (this.point - b.point).normalize(overlap * 0.015);
			this.vector += direc;
			b.vector -= direc;

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
		for (var i = 0; i < this.numSegment; i ++)
			this.boundOffset[i] = this.boundOffsetBuff[i];
	}
};

//--------------------- main ---------------------

var balls = [];
var numBalls = 100;
for (var i = 0; i < numBalls; i++) {
	//var position = 0;
	var position = Point.random() * view.size;
	if(i===0){
		position = new Point(view.size/2, view.size/2);
	}
	var vector = new Point({
		angle: 360,
		length: Math.random() * 10
	});
	var radius = 20;
	balls.push(new Ball(radius, position, vector));
}

function onFrame() {
	
	for (var i = 0; i < balls.length - 1; i++) {
		for (var j = i + 1; j < balls.length; j++) {
			balls[i].react(balls[j]);
		}
	}
	for (var i = 0, l = balls.length; i < l; i++) {
		balls[i].iterate();
	}

	// decelerate and stop the ball if not moved
	for (var i = 1; i < balls.length - 1; i++) {
		if(balls[i].maxVec > 0.1){
			balls[i].maxVec -= 0.1;
		}
	}
}

function onKeyDown(event) {
	for (var i = 1; i < balls.length - 1; i++) {
		balls[i].maxVec = 6;
	}
	if(event.key === "up"){
		for (var i = 1; i < balls.length - 1; i++) {
			balls[i].vector.y += 10;
		}
		socket.emit('move_up');
	}
	if(event.key === "down"){
		for (var i = 1; i < balls.length - 1; i++) {
			balls[i].vector.y -= 10;
		}
		socket.emit('move_down');
	}
	if(event.key === "left"){
		for (var i = 1; i < balls.length - 1; i++) {
			balls[i].vector.x += 10;
		}
		socket.emit('move_left');
	}
	if(event.key === "right"){
		for (var i = 1; i < balls.length - 1; i++) {
			balls[i].vector.x -= 10;
		}
		socket.emit('move_right');
	}
}

function onKeyUp(event) {
}