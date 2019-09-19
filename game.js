var shapes = [];
shapes.push(new Shape(new Vector2D(490,160), [new Vector2D(-20,-20),new Vector2D(20,-20),new Vector2D(20,20), new Vector2D(-20,20)])); 
shapes.push(new Shape(new Vector2D(700,370), [new Vector2D(-25,-30),new Vector2D(25,-25),new Vector2D(25,20), new Vector2D(-25,20)])); 

window.countFPS = (function () {
  var lastLoop = (new Date()).getMilliseconds();
  var count = 1;
  var fps = 0;

  return function () {
    var currentLoop = (new Date()).getMilliseconds();
    if (lastLoop > currentLoop) {
      fps = count;
      count = 1;
    } else {
      count += 1;
    }
    lastLoop = currentLoop;
    return fps;
  };
}());

//Base functions
function update() {
	shapes[1].center.x -= 1;
	shapes[1].center.y -= 1;
	var col = collide(shapes[1],shapes[0]);
	if (col) {
		shapes[0].center = new Vector2D(shapes[0].center.x + col.x, shapes[0].center.y + col.y);
	}
}

function draw() {
	var canvas = document.getElementById("gameCanvas");
	if (canvas.getContext) {
		var context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		for (var i=0;i < shapes.length;i++) {
			shapes[i].draw(context);
		}
		context.fillText(countFPS() + "",16,16)
	}
}

function main() {
	update();
	draw();
	requestAnimationFrame(main);
}

requestAnimationFrame(main);

//Classes
function Vector2D(x,y) {
	this.x = x;
	this.y = y;
	
	this.add = function(vector) {
		return new Vector2D(this.x + vector.x, this.y + vector.y);
	}
	
	this.subtract = function(vector) {
		return new Vector2D(this.x - vector.x, this.y - vector.y);
	}
	
	this.dot = function(vector) {
		return (this.x * vector.x) + (this.y * vector.y);
	}
	
	this.unitNormal = function() {
		return new Vector2D((this.y/Math.sqrt(this.x * this.x + this.y * this.y)),-this.x/Math.sqrt(this.x * this.x + this.y * this.y));
	}
	
	this.unit = function() {
		return new Vector2D((this.x/Math.sqrt(this.x * this.x + this.y * this.y)),this.y/Math.sqrt(this.x * this.x + this.y * this.y));
	}
	
	this.magnitude = function() {
		return (this.x * this.x) + (this.y * this.y);
	}
	
	this.cross = function(vector) {
		return this.x * vector.y - this.y * vector.x;
	}
}

function Shape(center, points) {
	this.center = center;
	this.points = points;
	
	this.getTruePoints = function() {
		var a = [];
		for (var i=0;i < this.points.length;i++) {
			a.push(new Vector2D(this.center.x + points[i].x, this.center.y + points[i].y));
		}
		return a;
	}
	
	this.draw = function(ctx) {
		ctx.strokeStyle="#FF0000";
		ctx.fillStyle = 'blue';
		
		if (points.length > 0) {
			ctx.beginPath();
		
			ctx.moveTo(this.center.x + points[0].x, this.center.y + points[0].y);
			for (var i=1; i < points.length; i++) {
				ctx.lineTo(this.center.x + points[i].x, this.center.y + points[i].y);
			}
			ctx.fill();ctx.stroke();
			ctx.closePath();
			
		}
	}
}

function getAxis(shape1, shape2) {
	var axis = [];
	var s1p = shape1.getTruePoints();
	var s2p = shape2.getTruePoints();
	for (var i=0;i < s1p.length;i++) {
		if ( i < s1p.length - 1) {
			axis.push(new Vector2D(s1p[i+1].x - s1p[i].x, s1p[i+1].y - s1p[i].y).unitNormal());
		} else {
			axis.push(new Vector2D(s1p[i].x - s1p[0].x, s1p[i].y - s1p[0].y).unitNormal());
		}
	}
	
	for (var i=0;i < s2p.length;i++) {
		if ( i < s2p.length - 1) {
			axis.push(new Vector2D(s2p[i+1].x - s2p[i].x, s2p[i+1].y - s2p[i].y).unitNormal());
		} else {
			axis.push(new Vector2D(s2p[i].x - s2p[0].x, s2p[i].y - s2p[0].y).unitNormal());
		}
	}
	return axis;
}

function collide(shape1,shape2) {
	var axes = getAxis(shape1, shape2);
	var s1points = shape1.getTruePoints();
	var s2points = shape2.getTruePoints();
	
	
	var translationVectors = [];
	
	for (var i=0; i < axes.length; i++) {
			var scalers1 = [];
			var scalers2 = [];
			for (var a = 0;a < s1points.length;a++) {
				scalers1.push(axes[i].dot(s1points[a]));
				
			}
			//console.log(scalers1);
			for (var b = 0;b < s2points.length;b++) {
				scalers2.push(axes[i].dot(s2points[b]));
			}
			
			var s1max = Math.max(...scalers1);
			var s1min = Math.min(...scalers1);
			var s2max = Math.max(...scalers2);
			var s2min = Math.min(...scalers2);
			
			if (i == 0) {
			//	console.log(scalers1);
			//	console.log(scalers2);
			//	console.log("S1 Max", s1max);
			//console.log("S2 Max", s2max);
			//console.log("S1 Min", s1min);
			//console.log("S2 Min", s2min);
			}
			
			if (s2min > s1max || s2max < s1min) break;
			
			var overlap = s1max > s2max ? -(s2max - s1min) : (s1max - s2min);
			translationVectors.push(new Vector2D(axes[i].x * overlap, axes[i].y * overlap));
	}
	
	if (translationVectors.length < axes.length) return null;
	
	var smallestValue = Number.MAX_SAFE_INTEGER;
	var v; //smallest vector
	for (var j=0;j < translationVectors.length;j++) {
		var mag = translationVectors[j].magnitude();
		if (mag < smallestValue) {
			smallestValue = mag;
			v = translationVectors[j];
		}
	}
	return v;
	
}