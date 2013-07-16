
var ballInitSeqOver; //signals to GLmatrix when all the balls are in place
var frame_draw = false;

function Stadium() {  
    
    moveDist = 100.1;
    lookDist = 1/15;
    ballInitSeqOver = false;
    
    this.gameStart = 0.0;

    this.hit_sound = [];
    
    this.hit_sound[0] = new Audio("drums_1.wav");
    this.hit_sound[0].load();
    this.hit_sound[1] = new Audio("drums_2.wav");
    this.hit_sound[1].load();
    this.hit_sound[2] = new Audio("drums_3.wav");
    this.hit_sound[2].load();
    this.hit_sound[3] = new Audio("drums_4.wav");
    this.hit_sound[3].load();
    this.hit_sound[4] = new Audio("drums_5.wav");
    this.hit_sound[4].load();
    
    //f b r l
    //meaning the order this data is pushed in is front, back, left, right wall.
    this.pieces = [];
    this.height = 7;

    this.balls = [];
    this.numberBalls = document.getElementById("stadium_balls").value;
    toggle_element("stadium_params");
    toggle_element("stadium_options");
    //# of maze pieces per side of the square floor
    //must be divisble by 5280
    var piecesPerSide = 24;
    var pieceLength = 5280/24;
    this.size = pieceLength;
    this.width = piecesPerSide;

    this.intro_string = new GLstring(
	"Welcome to our game, ", TEXT_TEXTURE, theCanvas.gl.shader_canvas);
    this.intro_string2 = new GLstring(document.getElementById("stadium_name").value + ".",
	TEXT_TEXTURE4, theCanvas.gl.shader_canvas);
    this.numbers = new GLstring("0 1 2 3 4 5 6 7 8 9", TEXT_TEXTURE2);
    this.jumboScreen = new Jumbotron();
    this.jumboScreen.translate([2640,1500,-2640]);

    if(5280%piecesPerSide !== 0)
	alert("Not a proper selection of pieces per side");

    var dist = 300;
    var length = 80;
    var height = 600;
    var width = 50;
    this.intro2 = new Quad(
	[-dist + length, height + width, dist + length],
	[-dist + length, height,         dist + length],
	[-dist - length, height + width, dist - length],
	[-dist - length, height,         dist - length]);
    this.intro = new Quad(
	[-dist + length, height + (2 * width), dist + length],
	[-dist + length, height + width,       dist + length],
	[-dist - length, height + (2 * width), dist - length],
	[-dist - length, height + width,       dist - length]);
    this.intro.setTexture(TEXT_TEXTURE);
    this.intro2.setTexture(TEXT_TEXTURE4);
    this.intro.setShader(theCanvas.gl.shader_canvas);
    this.intro2.setShader(theCanvas.gl.shader_canvas);
    

    //initializes the field...floor and walls
    this.Field();
    this.InitBalls();
    return this;
}

Stadium.prototype.initBuffers = function(gl_) {

    this.intro.initBuffers(gl_);
    this.intro_string.initBuffers(gl_);
    this.intro2.initBuffers(gl_);
    this.intro_string2.initBuffers(gl_);
    this.numbers.initBuffers(gl_);
    for(var i=0; i < this.pieces.length; ++i){
	this.pieces[i].initBuffers(gl_);
    }

    for(i=0; i < this.balls.length; ++i){
	this.balls[i].initBuffers(gl_);
    }
    this.jumboScreen.initBuffers(gl_);
};

Stadium.prototype.InitBalls = function(){
    for(var i=0; i < this.numberBalls; ++i){
	var x_dist = Math.round(Math.random()*5000);
	var z_dist = Math.round(Math.random()*-5000);
	this.balls.push(new Ball([x_dist,0,z_dist], 
				 this.numberBalls,
				 TEXT_TEXTURE2));
    }
};

Stadium.prototype.Field = function(){

    var sbX_ = this.size/2;
    var sh_ = this.size/2;
    var sbZ_ = this.size/2;
    var sbW_ = 30.0; 

    //stamp out square floor with proper variables
    for(var i=0;i<this.width; i++){
	for(var j=0;j<this.width; j++){
	    var wall = 0;
	    var movingWall = 0;
	    if(i===0)
		wall |= BACK;
	    if(j===0)
		wall |= LEFT;
	    if(i===(this.width-1))
		wall |= FRONT;
	    if(j===(this.width-1))
		wall |= RIGHT;
	    //sets the actual wall down
	    if(i===((this.width/2)-1) ){
		if(j !== (this.width/4) &&
		   j !== (this.width*3/4) )
		    movingWall |= FRONT;
	    }
	    //for collision on the other side
	    if(i===(this.width/2) ){
		if(j !== (this.width/4) &&
		   j !== (this.width*3/4) )
		    movingWall |= BACK;
	    }
	    
	    if(j===((this.width/2)-1) ){
		if(i !== (this.width/4) &&
		   i !== (this.width*3/4) )		
		    movingWall |= RIGHT;
	    }
	    if(j==((this.width/2)) ){
		if(i !== (this.width/4) &&
		   i !== (this.width*3/4) )		
		movingWall |= LEFT;
	    }
	    
	    this.pieces.push(
		new StadiumPiece(
		    this.size, wall, movingWall, BRICK_TEXTURE,
		    sbX_, sh_, sbZ_, sbW_).atCoord(j,i));	 
	}
    }
};

var last_seq_num = 0;

Stadium.prototype.draw = function(gl_) {

    if(last_seq_num !== StadiumInitSeqNum) {
	this.intro_string.update(gl_, "You have 40 seconds");
    this.intro_string2.update(gl_, "to play the game. " + StadiumInitSeqNum);
	last_seq_num = StadiumInitSeqNum;



    }


    if(ballInitSeqOver === false){	
	this.intro.draw(gl_);
	this.intro2.draw(gl_);
    }

    for(i = 0; i < this.balls.length; i++){
	this.balls[i].draw(gl_);
    }

    for(i = 0; i<this.pieces.length; i++){
	this.pieces[i].draw(gl_);
    }
    this.jumboScreen.draw(gl_);
};

Stadium.total_balls_hit = 0;
Stadium.sound_cycle = 0;


Stadium.prototype.updateStadium = function() {
    
    //we haven't looked at any balls yet so lets reset the collisions
    //this flag will tell us when we have a collision so that we 
    //do not encounter a deadlock type situation where both balls
    //are setting reflections on each other
    var numBallsHit = 0;
    var gameOver = false;
    for(var i = 0; i<this.balls.length; i++){
	//clear collision value
	this.balls[i].ballCollide = false;
	//check number of balls that are hit to see if game has been won
	if(this.balls[i].hit === true && !this.balls[i].gameOver)
	    numBallsHit++;
	//if one ball has finished all of them have
	if(this.balls[i].gameOver)
	    gameOver = true;
    }

    if (Stadium.total_balls_hit !== numBallsHit) {
	this.hit_sound[Stadium.sound_cycle++].play();
	Stadium.sound_cycle %= 5;
	Stadium.total_balls_hit = numBallsHit;   					     
    }

    //this is how you win the game
    if(numBallsHit == this.numberBalls){
	gameOver = true;
	var endTime = Math.round(new Date().getTime()/1000)-this.gameStart-this.balls[0].frozenTime;
	var theWindow = window.open(
	    "GLvictory.html?time=" + endTime, 
	    "",
	    "height=148,width=410,location=no,scrollbars=no");
	theWindow.focus();
    }
    
    ballInitSeqOver = true;
    for(i = 0; i < this.balls.length; i++){
	//if one of the balls is still in init then we are as well
	if(this.balls[i].init)
	    ballInitSeqOver = false;
	
	//the game has ended let every ball know
	if(gameOver)
	    this.balls[i].gameOver = true;

	//check to see if balls hit something, ball collide 
	if(this.balls[i].velocity !== 0 && !this.balls[i].ballCollide){
	    //update the ball position
	    this.balls[i].updatePosition(false);
	    
	    //check both current and new piece
	    //checks viewer collision even if you aren't moving
	    //need a new method here, for when the viewer is not moving
	    var viewerPos = vec4.fromValues(0,0,0,1);
	    vec4.transformMat4(viewerPos, viewerPos, theMatrix.vMatrix);
	    this.balls[i].detectBallViewerCollision(viewerPos);
	    
	    var curPos = this.balls[i].oldPosition;
	    var newPos = this.balls[i].position;
	    
	    //calculate the pieces we need to check
	    var pieceX, pieceZ;
	    pieceX = Math.round(curPos[0] / this.size);
	    pieceZ = Math.round(curPos[2] /-this.size);
	    curPiece = (this.width * pieceZ) + pieceX;
	    
	    pieceX = Math.round(newPos[0] / this.size);
	    pieceZ = Math.round(newPos[2] /-this.size);
	    newPiece = (this.width * pieceZ) + pieceX;
	    
	    for(var j=0; j<this.balls.length; j++){
		//don't check detection with itself
		if(j!=i)
		    this.balls[i].checkBallCollision(this.balls[j]);
	    }
	    
	    if(this.pieces[curPiece])
		this.pieces[curPiece].ballPositionLegal(curPos, newPos, this.balls[i]);
	    if(this.pieces[newPiece] && !this.pieces[curPiece].ballReflected)
		this.pieces[newPiece].ballPositionLegal(curPos, newPos, this.balls[i]);
	}
	this.balls[i].update(this.gameStart);
	
    }

    //when StadiumInitSeqNum === 3 the viewer has sucessfuly dropped into the maze
    if(StadiumInitSeqNum === 3){
	console.log("%d num balls", this.numberBalls);
	//priveledgedMode.toggle();
	this.gameStart = Math.round(new Date().getTime()/1000);
	console.log("gameStart %f", this.gameStart);
    }
}

var stadium_check_position = false;
/**
 *  Remember: (0,0) is top left, (20 * Width, -20 * Height) is
 *  bottom right, in the xz plane
 * 
 *  This function returns false if position is illegal
 */
Stadium.prototype.checkPosition = function() {
    var pieceX, pieceZ, curPiece, newPiece;
    var thePos = vec4.fromValues(0,0,0,1);
    var newPos = vec4.fromValues(0,0,0,1);
    var curPos = vec4.fromValues(0,0,0,1);

    vec4.transformMat4(newPos, thePos, theMatrix.vMatrixNew);
    vec4.transformMat4(newPos, newPos, theMatrix.vMatrix);
    vec4.transformMat4(curPos, curPos, theMatrix.vMatrix);

    pieceX = Math.round(curPos[0] / this.size);
    pieceZ = Math.round(curPos[2] /-this.size);
    curPiece = (this.width * pieceZ) + pieceX;

    pieceX = Math.round(newPos[0] / this.size);
    pieceZ = Math.round(newPos[2] /-this.size);
    newPiece = (this.width * pieceZ) + pieceX;

    var piecePosX = newPos[0] % this.size;
    var piecePosZ = newPos[2] % this.size;

    if(stadium_check_position === true) {
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

	posStats.innerHTML += "<br/> Stadium Piece: from " + 
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

    if(newPiece < 0) { return false; }

    //see if we collide with a ball
    if(this.pieces[curPiece]){
	if(!this.pieces[curPiece].positionLegal(curPos, newPos)){
	    mat4.identity(theMatrix.vMatrixNew, theMatrix.vMatrixNew);
	    curPos[0] = newPos[0];
	    curPos[2] = newPos[2];
	}
    }    
    if(this.pieces[newPiece] && !this.pieces[curPiece].viewerReflected){
	if(!this.pieces[newPiece].positionLegal(curPos, newPos)){
	    mat4.identity(theMatrix.vMatrixNew, theMatrix.vMatrixNew);
	    curPos[0] = newPos[0];
	    curPos[2] = newPos[2];
	}
    }
    if(!this.pieces[newPiece] && !this.pieces[curPiece]){
	alert("You got eaten by the wall.  You lose and die");
    }

    for(var i = 0; i<this.balls.length; i++){
	GLobject.has_collided += 20 *
	this.balls[i].detectViewerCollision(curPos, newPos, true);
	this.balls[i].getRotationAngle(curPos);
    }
    return true;
};
