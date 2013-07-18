define("StadiumPiece", ["SixSidedPrism"], function() {

/* 
This function stamps out the walls for one maze piece

the number of walls to build and texture for each wall is an input variable

each wall consists of 4 quads (right now at least)
probably can make this a variable parameter
*/
function StadiumPiece(room_size, walls, movingWalls, textures,
		     sbX_, sh_, sbZ_, sbW_) { 
    this.y_positionEWMoving = -200;
    this.y_positionNSMoving = -200;

    //f,b,r,l boolean variables draw or not
    this.f = walls & FRONT;
    this.b = walls & BACK;
    this.r = walls & RIGHT;
    this.l = walls & LEFT;


    this.fM = movingWalls & FRONT;
    this.rM = movingWalls & RIGHT;
    this.bM = movingWalls & BACK;
    this.lM = movingWalls & LEFT;

    this.timeStep = 0;
    this.ballReflected = false;
    this.viewerReflected = false;

    // only affects translate at the moment: TODO (mst)
    this.size = room_size;

    // Array with textures for each wall (can have up to 4 textures)
    // If instead a texture object is passed, uses it for  all walls
    if(!isNaN(textures)) {
	    this.ft = textures;
	    this.bt = textures;
	    this.rt = textures;
	    this.lt = textures;
    } else {
	var texNum = 0;
	if(this.f || this.fM) { this.ft = textures[texNum]; texNum++; }
	if(this.b) { this.bt = textures[texNum]; texNum++; }
	if(this.r || this.rM) { this.rt = textures[texNum]; texNum++; }
	if(this.l) { this.lt = textures[texNum]; }
    }

    this.objs = [];
    this.objsMoveFront = [];
    this.objsMoveRight = [];

    var a,b,c,d,at,bt,ct,dt;

    //always draw the tiled floor
    a = vec3.fromValues(-this.size/2, 0, this.size/2);
    b = vec3.fromValues(-this.size/2, 0,-this.size/2);
    c = vec3.fromValues( this.size/2, 0, this.size/2);
    d = vec3.fromValues( this.size/2, 0,-this.size/2);
    this.qFloor = this.Quad(a, b, c, d).setTexture(TILE_TEXTURE);

 /*
   It gets a little confusing in here.  We never share walls, so to preserve
   the coordinate space the walls go from 8.5 to 11.5 (length of 3) expanding
   off of its coordinate space to another.  Since two quads are never stamped
   out on top of each other this gives the apperance of sharing walls.  When
   you see lengths of 11.4 that is to give the long wall texture preference
   over the short edge(looks crappy) when those conflicts do occur.
*/
    if(this.f || this.fM){ 
	this.qFront = this.FrontWall(this.ft, this.fM,
		     sbX_, sh_, sbZ_, sbW_); }
    if(this.l){ 
	this.qLeft = this.LeftWall(this.lt, this.lM,
		     sbX_, sh_, sbZ_, sbW_); }
    if(this.r || this.rM){ 
	this.qRight = this.RightWall(this.rt, this.rM,
		     sbX_, sh_, sbZ_, sbW_); }
    if(this.b){ 
	this.qBack = this.BackWall(this.bt, this.bM,
		     sbX_, sh_, sbZ_, sbW_); }
    //don't draw wall, but need collision checks
    if(this.bM)
	this.south = sbZ_ - 31;	
    if(this.lM)
	this.west = -(sbZ_ - 31);

    // Bounds - N, S, W, and E - are created within as well.
}

/**
   The stadium parameters are named with repsect to the front wall.
   (It is across the negative Z-plane facing the viewer.
   Calculated in Stadium.js
   sbX_: length across positive and negative X-axis
   sh_: height in Y direction starting at 0
   sbZ_: Offset from the viewer in (negative) Z-direction
   sbW_: Width of wall, from base Z offset towards the viewer

*/
StadiumPiece.prototype.FrontWall = function(texture, move,
		     sbX_, sh_, sbZ_, sbW_) {
    var front = new SixSidedPrism(
	[ sbX_, sh_, -(sbZ_ + sbW_)],
	[ sbX_,  0,  -(sbZ_ + sbW_)],
	[ sbX_,  0,  -(sbZ_      )],
	[ sbX_, sh_, -(sbZ_      )],
	[-sbX_, sh_, -(sbZ_ + sbW_)],
	[-sbX_,  0,  -(sbZ_ + sbW_)],
	[-sbX_,  0,  -(sbZ_      )],
	[-sbX_, sh_, -(sbZ_      )]).setTexture(texture);
    if(move) this.objsMoveFront.push(front);
    else this.objs.push(front);
    this.north = -(sbZ_ - 15);
    return front;
};

StadiumPiece.prototype.LeftWall = function(texture, move,
		     sbX_, sh_, sbZ_, sbW_) {
    var left = new SixSidedPrism(
	[-(sbZ_ + sbW_), sh_,-sbX_],
	[-(sbZ_ + sbW_),   0,-sbX_],
	[-(sbZ_      ),    0,-sbX_],
	[-(sbZ_      ),  sh_,-sbX_],
	[-(sbZ_ + sbW_), sh_, sbX_],
	[-(sbZ_ + sbW_),   0, sbX_],
	[-(sbZ_      ),    0, sbX_],
	[-(sbZ_      ),  sh_, sbX_]).setTexture(texture);
    this.objs.push(left);
    this.west = -(sbZ_ - 15);
    return left;
};

StadiumPiece.prototype.RightWall = function(texture, move,
		     sbX_, sh_, sbZ_, sbW_) {
    var right = new SixSidedPrism(
	[sbZ_ + sbW_, sh_, -sbX_],
	[sbZ_ + sbW_,  0, -sbX_],
	[sbZ_ + sbW_,  0,  sbX_],
	[sbZ_ + sbW_, sh_,  sbX_],
	[sbZ_      , sh_, -sbX_],
	[sbZ_      ,  0, -sbX_],
	[sbZ_      ,  0,  sbX_],
	[sbZ_      , sh_,  sbX_]).setTexture(texture);
    if(move) this.objsMoveRight.push(right);
    else this.objs.push(right);
    this.east = sbZ_ - 15;
    return right;
};

StadiumPiece.prototype.BackWall = function(texture, move,
		     sbX_, sh_, sbZ_, sbW_) {
    var back = new SixSidedPrism(
	[ sbX_, sh_, sbZ_      ],
	[ sbX_,  0, sbZ_      ],
	[ sbX_,  0, sbZ_ + sbW_],
	[ sbX_, sh_, sbZ_ + sbW_],
	[-sbX_, sh_, sbZ_      ],
	[-sbX_,  0, sbZ_      ],
	[-sbX_,  0, sbZ_ + sbW_],
	[-sbX_, sh_, sbZ_ + sbW_]).setTexture(texture);
    this.objs.push(back);
    this.south = sbZ_ - 15;
    return back;
};

StadiumPiece.prototype.initBuffers = function(gl_){

    var i;
    for(i = 0; i < this.objs.length; ++i) {
//	this.objs[i].setShader(gl_.shader_stadium);
	this.objs[i].initBuffers(gl_);
    }
    for(i = 0; i < this.objsMoveFront.length; ++i) {
//	this.objsMoveFront[i].setShader(gl_.shader_stadium);
	this.objsMoveFront[i].initBuffers(gl_);
    }
    for(i = 0; i < this.objsMoveRight.length; ++i) {
//	this.objsMoveRight[i].setShader(gl_.shader_stadium);
	this.objsMoveRight[i].initBuffers(gl_);
    }
};

/**
 *  Translation will be done right after the object
 *  is created - we need to update our bounds 
 *  accordingly.
 */
StadiumPiece.prototype.translate = function(vec_) {

    var i;
    for(i = 0; i < this.objs.length; ++i) {
	this.objs[i].translate(vec_);
    }

    for(i = 0; i < this.objsMoveFront.length; ++i) {
	this.objsMoveFront[i].translate(vec_);
    }

    for(i = 0; i < this.objsMoveRight.length; ++i) {
	this.objsMoveRight[i].translate(vec_);
    }

    if(this.f || this.fM){ this.north += vec_[2]; }
    if(this.l || this.lM){ this.west += vec_[0]; }
    if(this.r || this.rM){ this.east += vec_[0]; }
    if(this.b || this.bM){ this.south += vec_[2]; }
    return this;
};

// Based upon the piece number, translate it by its coords
StadiumPiece.prototype.atCoord = function(x, y) {
    this.translate([x * this.size, 0, -y * this.size]);
    return this;
};

StadiumPiece.prototype.Quad = _Quad;
StadiumPiece.prototype.Prism = _Prism;

/**
 *  The intention is that the Stadium object will only call the
 *  check upon a maze piece if we are in its jurisdiction.
 *  This is the area it encompasses, plus a buffer zone.
 * 
 */
StadiumPiece.prototype.reflect = function(currentPosition, newPosition, index, flip){
   var hypt, oppo, angle;
    hypt = vec3.distance(
	vec3.fromValues(currentPosition[0], currentPosition[1], currentPosition[2]),
	vec3.fromValues(newPosition[0],newPosition[1],newPosition[2]));
    oppo = Math.abs(currentPosition[index]-newPosition[index]);
    
    angle = 2*Math.asin(oppo/hypt);
    
    //flip x or z for direction of angle
    if(index == 2) index = 0;
    else if(index === 0) index = 2;

    if(flip) angle = -1*angle;

    //heading in -x direction
    if(currentPosition[index]-newPosition[index] > 0){
	angle = angle*-1;
    }
    
    theMatrix.turnAround(angle);
};

StadiumPiece.prototype.positionLegal = function(currentPosition, newPosition) {
    this.viewerReflected = false;

    if(this.f && newPosition[2] < this.north) { 
	//alert("reflecting front");
	this.viewerReflected = true;
	this.reflect(currentPosition, newPosition, 2, true);
	return false; 
    }
    if(this.b && newPosition[2] > this.south) { 
	//console.log("reflectingBack");
	this.viewerReflected = true;
	this.reflect(currentPosition, newPosition, 2, false);
	return false; 
    }
    if(this.l && newPosition[0] < this.west) { 
	this.viewerReflected = true;
	this.reflect(currentPosition, newPosition, 0, false);
	return false; 
    }
    if(this.r && newPosition[0] > this.east) { 
	this.viewerReflected = true;
	this.reflect(currentPosition, newPosition, 0, true);
	return false; 
    }

    //moving north?
    var northBound = false;
    if(newPosition[2]-currentPosition[2] < 0) northBound = true;

    if((this.fM && northBound) && newPosition[2] < this.north &&
      this.y_positionEWMoving >= -125) { 
	this.reflect(currentPosition, newPosition, 2, true);
	this.viewerReflected = true;
	return false; 
    }
    if((this.bM && !northBound) && newPosition[2] > this.south &&
      this.y_positionEWMoving >= -125) { 
	this.reflect(currentPosition, newPosition, 2, false);
	this.viewerReflected = true;
	return false; 
    }
    if(this.rM && newPosition[0] > this.east &&
       this.y_positionNSMoving >= -125){
	this.reflect(currentPosition, newPosition, 0, true);
	this.viewerReflected = true;
	return false; 
      }
    if(this.lM && newPosition[0] < this.west &&
       this.y_positionNSMoving >= -125){
	this.reflect(currentPosition, newPosition, 0, false);
	this.viewerReflected = true;
	return false; 
      }

    return true;
};

StadiumPiece.prototype.ballPositionLegal = function(currentPosition, newPosition, ball) {
    //check to see if we are hitting a wall 
    //if we are reflect the balls velocity vector accordingly
    this.ballReflected = false;
    if(this.f && newPosition[2] < this.north) { 
	ball.reflect(false);
    }
    if(this.b && newPosition[2] > this.south) { 
	ball.reflect(false);
    }
    if(this.l && newPosition[0] < this.west) { 
	ball.reflect(true);
    }
    if(this.r && newPosition[0] > this.east) { 
	ball.reflect(true);
    }

    //moving north?
    var northBound = false;
    if(newPosition[2]-currentPosition[2] < 0) northBound = true;

    //moving north?
    var eastBound = false;
    if(newPosition[0]-currentPosition[0] > 0) 
	eastBound = true;

    if((this.fM && northBound) && newPosition[2] < this.north &&
      this.y_positionEWMoving >= -125) { 
	this.ballReflected = true;
	ball.reflect(false);
    }
    if((this.bM && !northBound) && newPosition[2] > this.south &&
      this.y_positionEWMoving >= -125) { 
	this.ballReflected = true;
	ball.reflect(false);
    }
    if((this.rM && eastBound) && newPosition[0] > this.east &&
       this.y_positionNSMoving >= -125){
	console.log("eastbound wall");
	this.ballReflected = true;
	ball.reflect(true);
      }
    if((this.lM && !eastBound) && newPosition[0] < this.west &&
       this.y_positionNSMoving >= -125){
	console.log("westbound wall");
	this.ballReflected = true;
	ball.reflect(true);
      }

    return true;
};

StadiumPiece.prototype.draw = function(gl_) {

    var i;

    for(i = 0; i < this.objs.length; ++i) {
	this.objs[i].draw(gl_);
    }

    //after balls have dropped in start moving the walls (that move)
    if(ballInitSeqOver === true){
	if(frame_draw === false) { 
	    //console.log("timeStep: %d", this.timeStep);
	    this.y_positionEWMoving = 100*(Math.sin(this.timeStep/(2*Math.PI)))-100;
	    this.y_positionNSMoving = 100*Math.cos(this.timeStep/(2*Math.PI))-100;
	    if(this.timeStep == 540) this.timeStep = 0;
	    else this.timeStep += 0.1;
	}
	
	if(this.y_positionEWMoving >= -100){
	    for(i = 0; i < this.objsMoveFront.length; ++i) {
		//console.log("here2 %f", this.y_positionEWMoving);
		theMatrix.push();
		theMatrix.translate([0,this.y_positionEWMoving,0]);
		this.objsMoveFront[i].draw(gl_);
		theMatrix.pop();
	    }
	}
	
	if(this.y_positionNSMoving >= -100){
	    for(i = 0; i < this.objsMoveRight.length; ++i) {
//		console.log("here3 %f", this.y_positionNSMoving);
		theMatrix.push();
		theMatrix.translate([0,this.y_positionNSMoving,0]);
		this.objsMoveRight[i].draw(gl_);
		theMatrix.pop();
	    }
	}
    
    }
};

});
