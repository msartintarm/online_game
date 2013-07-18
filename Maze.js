define("Maze", ["MazePiece"], function() {

var start;

function Maze() {  
    moveDist = 5.1;
    lookDist = 1/10;
    //f b r l
    //meaning the order this data is pushed in is front, back, left, right wall.
    this.pieces = [];
    this.width = 5;
    this.height = 7;
    this.size = 20;

    this.Piece(BACK_LEFT, BRICK_TEXTURE).atCoord(0,0);
    this.Piece(NO_WALLS).atCoord(1,0);
    this.Piece(FRONT_BACK, BRICK_TEXTURE).atCoord(2,0);
    this.Piece(BACK, BRICK_TEXTURE).atCoord(3,0);
    this.Piece(BACK_RIGHT, BRICK_TEXTURE).atCoord(4,0);
    
    this.Piece(LEFT_RIGHT, BRICK_TEXTURE).atCoord(0,1);
    this.Piece(RIGHT, BRICK_TEXTURE).atCoord(1,1);
    this.Piece(FRONT_LEFT, BRICK_TEXTURE).atCoord(2,1);
    this.Piece(RIGHT, BRICK_TEXTURE).atCoord(3,1);
    this.Piece(RIGHT, BRICK_TEXTURE).atCoord(4,1);

    this.Piece(LEFT_RIGHT, BRICK_TEXTURE).atCoord(0,2);
    this.Piece(FRONT, BRICK_TEXTURE).atCoord(1,2);
    this.Piece(RIGHT, BRICK_TEXTURE).atCoord(2,2);
    this.Piece(RIGHT, BRICK_TEXTURE).atCoord(3,2);
    this.Piece(RIGHT, BRICK_TEXTURE).atCoord(4,2);

    this.Piece(LEFT, BRICK_TEXTURE).atCoord(0,3);
    this.Piece(LEFT, BRICK_TEXTURE).atCoord(1,3);
    this.Piece(FRONT, BRICK_TEXTURE).atCoord(2,3);
    this.Piece(FRONT_LEFT, BRICK_TEXTURE).atCoord(3,3);
    this.Piece(RIGHT, BRICK_TEXTURE).atCoord(4,3);

    this.Piece(LEFT_RIGHT, FLOOR_TEXTURE).atCoord(0,4);
    this.Piece(FRONT, FLOOR_TEXTURE).atCoord(1,4);
    this.Piece(FRONT, FLOOR_TEXTURE).atCoord(2,4);
    this.Piece(RIGHT,FLOOR_TEXTURE).atCoord(3,4);
    this.Piece(FRONT_RIGHT, 
	       [WOOD_TEXTURE, FLOOR_TEXTURE]).atCoord(4,4);

    this.Piece(FRONT_LEFT, FLOOR_TEXTURE).atCoord(0,5);
    this.Piece(FRONT_BACK, FLOOR_TEXTURE).atCoord(1,5);
    this.Piece(NO_LEFT, FLOOR_TEXTURE).atCoord(2,5);
    this.Piece(RIGHT, FLOOR_TEXTURE).atCoord(3,5);
    this.Piece(LEFT_RIGHT, FLOOR_TEXTURE).atCoord(4,5);

    this.Piece(FRONT_LEFT, 
	       [FLOOR_TEXTURE, HEAVEN_TEXTURE]).atCoord(0,6);
    this.Piece(FRONT, FLOOR_TEXTURE).atCoord(1,6);
    this.Piece(FRONT, FLOOR_TEXTURE).atCoord(2,6);
    this.Piece(FRONT, FLOOR_TEXTURE).atCoord(3,6);
    this.Piece(FRONT_RIGHT, FLOOR_TEXTURE).atCoord(4,6);

    // hell room
    this.Piece(NO_FRONT, HELL_TEXTURE).atCoord(1,-1);

    start = true;
}

Maze.prototype.initBuffers = function(gl_) {
    for(var i=0; i < this.pieces.length; ++i){
	this.pieces[i].initBuffers(gl_);
    }
}

Maze.prototype.Piece = function(a,b) {
    var newPiece = new MazePiece(this.size, a,b);
    this.pieces.push(newPiece);
    return newPiece;
}

Maze.prototype.draw = function(gl_) {
    for(var i = 0; i<this.pieces.length; i++){
	this.pieces[i].draw(gl_);
    }
}

var mazeDebug = false;

/**
 *  Remember: (0,0) is top left, (20 * Width, -20 * Height) is
 *  bottom right, in the xz plane
 * 
 *  This function returns false if position is illegal
 */
Maze.prototype.checkPosition = function() {
    var pieceX, pieceZ, curPiece, newPiece;
    var thePos = vec4.fromValues(0,0,0,1);
    var newPos = vec4.fromValues(0,0,0,1);
    var curPos = vec4.fromValues(0,0,0,1);

    vec4.transformMat4(newPos, thePos, theMatrix.vMatrixNew);
    vec4.transformMat4(newPos, newPos, theMatrix.vMatrix);
    vec4.transformMat4(curPos, curPos, theMatrix.vMatrix);

    pieceX = Math.round(curPos[0] / 20);
    pieceZ = Math.round(curPos[2] /-20);
    curPiece = (this.width * pieceZ) + pieceX;
    pieceX = Math.round(newPos[0] / 20);
    pieceZ = Math.round(newPos[2] /-20);
    newPiece = (this.width * pieceZ) + pieceX;

    var piecePosX = newPos[0] % 20;
    var piecePosZ = newPos[2] % 20;

    if(mazeDebug == true) {
	var posStats = document.getElementById("positionCheckStats");
	posStats.style.display = "inline-block";
	posStats.innerHTML = "old position: " + 
	    parseFloat(curPos[0]).toFixed(2) + "," + 
	    parseFloat(curPos[1]).toFixed(2) + "," +  
	    parseFloat(curPos[2]).toFixed(2) +
	    "<br/>new position: " +
	    parseFloat(newPos[0]).toFixed(2) + "," + 
	    parseFloat(newPos[1]).toFixed(2) + "," +  
	    parseFloat(newPos[2]).toFixed(2);
	
	posStats.innerHTML += "<br/> Maze Piece: from " + 
	    curPiece +
	    " to " + newPiece;
	if(piecePosX > 10 && piecePosX < 12) posStats.innerHTML += 
	"<br/> Getting close to right wall..";
	else if(piecePosX > 8 && piecePosX < 10) posStats.innerHTML += 
	"<br/> Getting close to left wall..";
	if(piecePosZ < -10 && piecePosZ > -12) posStats.innerHTML += 
	"<br/> Getting close to top wall..";
	else if(piecePosZ < -8 && piecePosZ > -10) posStats.innerHTML += 
	"<br/> Getting close to bottom wall..";
	}

    if(curPiece == 1) start = false;

    if(!start){
	if(newPiece < 0) { return false; }
	
	if((curPiece >= 0) && 
	   (!this.pieces[curPiece].positionLegal(newPos)) ||
	   (!this.pieces[newPiece].positionLegal(newPos))) {

	    mat4.identity(theMatrix.vMatrixNew, theMatrix.vMatrixNew);
	    if(curPiece == 30){
		alert("You win the game, now I give you GOD mode..");
		priveledgedMode.toggle();
		mat4.translate(theMatrix.vMatrixNew, theMatrix.vMatrixNew, [0,2,-10]);
		
		return true;
	    }
	    else
		return false;
	}	
    }
    return true;
}

});
