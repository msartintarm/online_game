define("MazePiece", ["SixSidedPrism"], function() {

/* 
this function stamps out the walls for one maze piece

the number of walls to build and texture for each wall is an input variable

each wall consists of 4 quads (right now at least)
probably can make this a variable parameter
*/
//function MazePiece(walls, ft, bt, rt, lt) { 
function MazePiece(room_size, walls, textures) { 
    //f,b,r,l boolean variables draw or not
    this.f = walls & FRONT;
    this.b = walls & BACK;
    this.r = walls & RIGHT;
    this.l = walls & LEFT;

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
	if(this.f) { this.ft = textures[texNum++] };
	if(this.b) { this.bt = textures[texNum++] };
	if(this.r) { this.rt = textures[texNum++] };
	if(this.l) { this.lt = textures[texNum] };
    }

    this.objs = [];

    var a,b,c,d,at,bt,ct,dt;

    //always draw the tiled floor
    a = vec3.fromValues(-10, 0, 10);
    b = vec3.fromValues(-10, 0,-10);
    c = vec3.fromValues( 10, 0, 10);
    d = vec3.fromValues( 10, 0,-10);
    this.qFloor = this.Quad(a, b, c, d)
	.setTexture(TILE_TEXTURE);

 /*
   It gets a little confusing in here.  We never share walls, so to preserve
   the coordinate space the walls go from 8.5 to 11.5 (length of 3) expanding
   off of its coordinate space to another.  Since two quads are never stamped
   out on top of each other this gives the apperance of sharing walls.  When
   you see lengths of 11.4 that is to give the long wall texture preference
   over the short edge(looks crappy) when those conflicts do occur.
*/
    if(this.f){ this.qFront = this.FrontWall(this.ft); }
    if(this.l){ this.qLeft = this.LeftWall(this.lt); }
    if(this.r){ this.qRight = this.RightWall(this.rt); }
    if(this.b){ this.qBack = this.BackWall(this.bt); }
    // Bounds - N, S, W, and E - are created within as well.
};

var bX_ = 11.4; // back X coordinates
var h_ = 10;    // height of wall
var bZ_ = 8.5;  // back Z coordinate
var bW_ = 3.0;  // width of back wall 

MazePiece.prototype.FrontWall = function(texture) {
    var front = new SixSidedPrism(
	[ bX_, h_, -(bZ_ + bW_)],
	[ bX_,  0, -(bZ_ + bW_)],
	[ bX_,  0, -(bZ_      )],
	[ bX_, h_, -(bZ_      )],
	[-bX_, h_, -(bZ_ + bW_)],
	[-bX_,  0, -(bZ_ + bW_)],
	[-bX_,  0, -(bZ_      )],
	[-bX_, h_, -(bZ_      )]).setTexture(texture);
    this.objs.push(front);
    this.north = -(bZ_ - 1);
    return front;
}

MazePiece.prototype.LeftWall = function(texture) {
    var left = new SixSidedPrism(
	[-(bZ_ + bW_), h_,-bX_],
	[-(bZ_ + bW_),  0,-bX_],
	[-(bZ_      ),  0,-bX_],
	[-(bZ_      ), h_,-bX_],
	[-(bZ_ + bW_), h_, bX_],
	[-(bZ_ + bW_),  0, bX_],
	[-(bZ_      ),  0, bX_],
	[-(bZ_      ), h_, bX_]).setTexture(texture);
    this.objs.push(left);
    this.west = -(bZ_ - 1);
    return left;
}

MazePiece.prototype.RightWall = function(texture) {
    var right = new SixSidedPrism(
	[bZ_ + bW_, h_, -bX_],
	[bZ_ + bW_,  0, -bX_],
	[bZ_ + bW_,  0,  bX_],
	[bZ_ + bW_, h_,  bX_],
	[bZ_      , h_, -bX_],
	[bZ_      ,  0, -bX_],
	[bZ_      ,  0,  bX_],
	[bZ_      , h_,  bX_]).setTexture(texture);
    this.objs.push(right);
    this.east = bZ_ - 1;
    return right;
}

MazePiece.prototype.BackWall = function(texture) {
    var back = new SixSidedPrism(
	[ bX_, h_, bZ_      ],
	[ bX_,  0, bZ_      ],
	[ bX_,  0, bZ_ + bW_],
	[ bX_, h_, bZ_ + bW_],
	[-bX_, h_, bZ_      ],
	[-bX_,  0, bZ_      ],
	[-bX_,  0, bZ_ + bW_],
	[-bX_, h_, bZ_ + bW_]).setTexture(texture);
    this.objs.push(back);
    this.south = bZ_ - 1;
    return back;
}

MazePiece.prototype.initBuffers = _objsInitBuffers;

/**
 *  Translation will be done right after the object
 *  is created - we need to update our bounds 
 *  accordingly.
 */
MazePiece.prototype.translate = function(vec_) {

    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].translate(vec_);
    }
    if(this.f){ this.north += vec_[2]; }
    if(this.l){ this.west += vec_[0]; }
    if(this.r){ this.east += vec_[0]; }
    if(this.b){ this.south += vec_[2]; }
    return this;
}

// Based upon the piece number, translate it by its coords
MazePiece.prototype.atCoord = function(x, y) {
	this.translate([x * this.size, 0, -y * this.size]);
}

MazePiece.prototype.Quad = _Quad;
MazePiece.prototype.Prism = _Prism;

/**
 *  The intention is that the Maze object will only call the
 *  check upon a maze piece if we are in its jurisdiction.
 *  This is the area it encompasses, plus a buffer zone.
 * 
 */
MazePiece.prototype.positionLegal = function(position) {

    if(this.f && position[2] < this.north) { return false; }
    if(this.b && position[2] > this.south) { return false; }
    if(this.l && position[0] < this.west) { return false; }
    if(this.r && position[0] > this.east) { return false; }

    return true;
}

MazePiece.prototype.draw = function(gl_) {

    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].draw(gl_);
    }
};

});
