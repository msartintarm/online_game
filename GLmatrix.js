define(function() {

/**
   Internally handles matrixes that will be loaded to GL

   Functions manipulating these matrices set flags, ensuring we
   do not perform expensive matrix operations unless necessary
 */
function GLmatrix() {

    // Model, viewing, and light matrix
    this.mMatrix = mat4.create();
    this.vMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.lightMatrix = mat4.create();
    mat4.translate(this.lightMatrix,
		   this.lightMatrix, 
		   [0,400,0]); 

    // Contains rotation or translation that is applied to 
    // viewing matrix upon next frame (set externally)
    this.vMatrixNew = mat4.create();
    
    // Inverted viewing matrix, must be recomputed each
    // time the viewing matrix changes
    this.ivMatrix = mat4.create();

    // Ditto wit hinverted lighting matrix
    this.ilMatrix = mat4.create();

    // Normal and modelview matrices, which need to be
    // recomputed each time the model matrix changes
    this.nMatrix = mat4.create();   // normal
    this.mvMatrix = mat4.create();  // modelview

    // These flags tell us whether to update the matrixes above
    this.mMatrixChanged = true;
    this.vMatrixChanged = true;
    this.pMatrixChanged = true;
    this.vMatrixNewChanged = false;

    // Here is some random, unrelated stuff.
    this.r2 = Math.sqrt(2);
    this.mStack = [];
    this.inJump = false;

    // Toggled by member function 'toggleSpeed'
    this.speedMode = 0;
}

/**
   Writes a perspective view into internal perspective matrix
*/
GLmatrix.prototype.perspective = function(zoom, aRatio, zNear, zFar) {
    mat4.perspective(this.pMatrix, zoom, aRatio, zNear, zFar); 
    this.pMatrixChanged = true;
};

/**
   Writes an orthogonal view into internal perspective matrix
*/
GLmatrix.prototype.ortho = function(left, right, bottom, top, near, far) {
    mat4.ortho(this.pMatrix, left, right, bottom, top, near, far); 
    this.pMatrixChanged = true;
};

GLmatrix.prototype.modelInit = function() {
    mat4.identity(this.mMatrix);
};

GLmatrix.prototype.modelUpdate = function() {
    mat4.identity(this.mMatrix);
    mat4.translate(this.mMatrix,
		   this.mMatrix,
		   [positionX.val,-positionY.val,0]);
    mat4.rotate(
	this.mMatrix,
	this.mMatrix,
	rotateY.val * Math.PI/180,
	[this.r2, this.r2, 0]);
    this.mMatrixChanged = true;
};

GLmatrix.prototype.viewInit = function() {
    mat4.identity(this.vMatrix);
    mat4.identity(this.vMatrixNew);
};

GLmatrix.prototype.viewMaze = function() {
    this.vTranslate([20,2,9.0]);
    this.vRotate(Math.PI, [0, 1, 0]);
};

var StadiumInitSeqNum = 0;
GLmatrix.prototype.viewStadium = function() {
    this.vTranslate([-1500,1000,1500]);
    this.vRotate(-Math.PI/4, [0, 1, 0]);
};

GLmatrix.prototype.translate = function(vector) {
    mat4.translate(this.mMatrix, this.mMatrix, vector); 
    this.mMatrixChanged = true;
};

GLmatrix.prototype.rotate = function(angle, vector) {
    mat4.rotate(this.mMatrix, this.mMatrix, angle, vector); 
    this.mMatrixChanged = true;
};

GLmatrix.prototype.vTranslate = function(vector) {
    mat4.translate(this.vMatrixNew,
		   this.vMatrixNew, 
		   vector); 
    this.vMatrixNewChanged = true;
};

GLmatrix.prototype.lightTranslate = function(vector) {
    mat4.translate(this.lightMatrix,
		   this.lightMatrix, 
		   vector); 
    this.lightMatrixChanged = true;
};

var transLightMatrix = mat4.create();

GLmatrix.prototype.lightRotate = function(x_change, y_change) {

    mat4.identity(transLightMatrix);
    mat4.rotate(
	transLightMatrix,
	transLightMatrix,
	y_change,
	[0, 1, 0]);
    mat4.rotate(transLightMatrix,
		transLightMatrix,
		x_change,
		[1, 0, 0]);
    mat4.multiply(this.lightMatrix, 
		  transLightMatrix,
		  this.lightMatrix);
    this.lightMatrixChanged = true;
};

GLmatrix.prototype.translateN = function(vector) {
    mat4.translate(this.mMatrix, 
		   this.mMatrix,
		   [-vector[0], 
		    -vector[1], 
		    -vector[2]]); 
    this.mMatrixChanged = true;
};

GLmatrix.prototype.rotate = function(rads, vector) {
    mat4.rotate(this.mMatrix, this.mMatrix, rads, vector);
    this.mMatrixChanged = true;
};

GLmatrix.prototype.vRotate = function(rads, vector) {
    mat4.rotate(this.vMatrixNew, this.vMatrixNew, rads, vector);
    this.vMatrixNewChanged = true;
};

GLmatrix.prototype.scale = function(vector) {
    mat4.scale(this.mMatrix, this.mMatrix, vector); 
    this.mMatrixChanged = true;
};
GLmatrix.prototype.mul = function(m) {
    mat4.multiply(this.mMatrix, this.mMatrix, m); 
    this.mMatrixChanged = true;
};

GLmatrix.prototype.vMul = function(v) {
    mat4.multiply(this.vMatrix, this.vMatrix, v); 
    this.vMatrixChanged = true;
};

GLmatrix.prototype.lookUp = function() {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){
	radiansToRotate = (lookDist * 2 * Math.PI)/10;
	rotateCount = 10;
	vectorRotation = [1,0,0];
    }
};

GLmatrix.prototype.lookDown = function() {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){
	radiansToRotate = (lookDist * 2 * Math.PI)/10;
	rotateCount = 10;
	vectorRotation = [-1,0,0];
    }
};

GLmatrix.prototype.lookLeft = function(distance) {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){
	radiansToRotate = (lookDist * distance * Math.PI)/10;
	rotateCount = 10;
	vectorRotation = [0,1,0];
    }
};

GLmatrix.prototype.lookRight = function(distance) {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){
	radiansToRotate = (lookDist * distance * Math.PI)/10;
	rotateCount = 10;
	vectorRotation = [0,-1,0];
    }
};

GLmatrix.prototype.turnAround = function(rads){
    radiansToRotate = rads/10;
    rotateCount = 10;
    vectorRotation = [0,1,0];
};

var moveDist = 20.1; //default to maze
var lookDist = 1/10; //default to maze

GLmatrix.prototype.moveRight = function() {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){
	distToMove = [-moveDist/10,0,0];
	moveCount = 10;
    }
};

GLmatrix.prototype.moveLeft = function() {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){
	distToMove = [moveDist/10,0,0];
	moveCount = 10;
    }
};

GLmatrix.prototype.moveUp = function() {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){
	distToMove = [0,moveDist/10,0];
	moveCount = 10;
    }
};

GLmatrix.prototype.moveDown = function() {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){
	distToMove = [0,-moveDist/10,0];
	moveCount = 10;
    }
};

GLmatrix.prototype.moveForward = function() {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){
        if(moveCount !== 0  && moveAccel <= 5){
            moveAccel += 0.1;
        }
        else if(moveCount === 0){
            moveAccel = 1;
        }
        distToMove = [0,0,(-moveDist/10)*moveAccel];


//        console.log("Accelerating %d", moveAccel);
        moveCount = 10;
    }
};
GLmatrix.prototype.moveBack = function() {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4) && !freeze){
	distToMove = [0,0,moveDist/10];
	moveCount = 10;
    }
};
GLmatrix.prototype.moveInToPlay = function() {
	distToMove = [0,-1,-50/10];
	moveCount = 10;
};
GLmatrix.prototype.dropIn = function() {
    var thePos = vec4.fromValues(0,0,0,1);
    var newPos = vec4.fromValues(0,0,0,1);
    var curPos = vec4.fromValues(0,0,0,1);

    vec4.transformMat4(newPos, thePos, this.vMatrixNew);
    vec4.transformMat4(newPos, newPos, this.vMatrix);
    vec4.transformMat4(curPos, curPos, this.vMatrix);

    distToMove = [0,(-curPos[1]/100)+(12.5/100),-(curPos[2]+400)/100];
    moveCount = 100;
    StadiumInitSeqNum = 2;
};

GLmatrix.prototype.runStadiumInit = function() {
    /*
      StadiumInitSeqNum === 0 
             balls are still flying in to position
      StadiumInitSeqNum === 1 
             balls in position call dropIn function
	     only call dropIn once but it runs 100 frames
      StadiumInitSeqNum === 2
             drop in has finished its 100 frames
      StadiumInitSeqNum === 3
              we are in place
	      turn on priveledgedMode (collision detection only really
	        as you can't move during init sequence anyways)
      StadiumInitSeqNum == 4
              init sequence has completed
     */
    if(stadiumMode && StadiumInitSeqNum === 0){
	this.moveInToPlay();
	//console.log("Made it to seq 1");
	if(ballInitSeqOver === true)
	    StadiumInitSeqNum = 1;
    }
    else if(stadiumMode && StadiumInitSeqNum === 1){
	this.dropIn(); 
	//console.log("Made it to seq 2");
    }
    else if(stadiumMode && StadiumInitSeqNum === 2){
	if(moveCount === 0)
	    StadiumInitSeqNum = 3;
        //console.log("Made it to seq 3");
    }
    else if(stadiumMode && StadiumInitSeqNum === 3){
	priveledgedMode.toggle();
	StadiumInitSeqNum = 4;
	//console.log("Made it to seq 4");
    }
}
    

/**
   Rotate between supported speed modes:
   0 = normal
   1 = slow (.1x)
   2 = fast (10x)
   'Shift' toggles between the modes
*/
GLmatrix.prototype.toggleSpeed = function() {
    this.speedMode += 1;
    this.speedMode %= 3;
    var keyboard = document.getElementById("keyboard");
    switch (this.speedMode) {
    case 1: // Slow speed
	keyboard.innerHTML = "Speed mode: SLOW";
	break;
    case 2: // Fast speed
	keyboard.innerHTML = "Speed mode: FAST";
	break;
    default:  // Normal speed
	keyboard.innerHTML = "Speed mode: NORMAL";
	break;
    }
};

var moveCount = 0;
var moveAccel = 1;
var distToMove = vec3.create();
GLmatrix.prototype.gradualMove = function() {

    if(moveCount > 0) {
	switch (this.speedMode) {
	case 1: // Slow speed
	    this.vTranslate(
		vec3.scale(vec3.create(), distToMove, 0.1),
		distToMove);
	    break;
	case 2: // Fast speed
	    this.vTranslate(
		vec3.scale(vec3.create(), distToMove, 10.0),
		distToMove);
	    break;
	default:  // Normal speed
	    this.vTranslate(distToMove);
	    break;
	}
	moveCount -= 1;
    }
};

var rotateCount = 0;
var radiansToRotate = 0; 
var vectorRotation = [0,0,0];
GLmatrix.prototype.gradualRotate = function() {
    if(rotateCount > 0) {
	this.vRotate(radiansToRotate, vectorRotation);
	rotateCount -= 1;
    }
};

/*
 * Jumps upwards, and rotates the user towards the Jumbotron
 * Pretends the viewer and Jumbotron are on the same axis
 */
GLmatrix.prototype.jump = function() {

    if(this.inJump === true  || freeze) return;
    this.inJump = true;

    // determine view vectors by transposing the known direction: (0,0,-1)
    // we also need the LHS (-1,0,0) to see if the angle is less than 0.

    var viewer_pos = vec4.fromValues(0, 0, 0, 1);
    var curr_dir = vec4.fromValues(0, 0,-1, 1);
    var left_dir = vec4.fromValues(-1, 0, 0, 1);
    // this is actually where the Jumbotron would be if it were on ground
    var jumbo_dir = vec3.fromValues(2640, 0, -2640);

    // calc current positions
    vec4.transformMat4(viewer_pos, viewer_pos, theMatrix.vMatrix);
    vec4.transformMat4(curr_dir, curr_dir, theMatrix.vMatrix);
    vec4.transformMat4(left_dir, left_dir, theMatrix.vMatrix);
    viewer_pos[1] = 0;
    curr_dir[1] = 0;
    left_dir[1] = 0;

    // calc current directions

    vec3.sub(curr_dir, curr_dir, viewer_pos);
    vec3.sub(jumbo_dir, jumbo_dir, viewer_pos);
    vec3.sub(left_dir, left_dir, viewer_pos);
    vec3.normalize(curr_dir, curr_dir);
    vec3.normalize(jumbo_dir, jumbo_dir);
    vec3.normalize(left_dir, left_dir);

    // find angle from dot product
    var the_angle = vec3.dot(jumbo_dir, curr_dir);
    var is_front = (the_angle > 0);
    if(the_angle !== 0) the_angle = Math.acos(the_angle);

    // compensate for the range of arccos
    var is_left = (vec3.dot(jumbo_dir, left_dir) > 0);
    if(!is_left) the_angle = -the_angle;

    if(envDEBUG_JUMP) {
	console.log("current: " + vec3.str(curr_dir));
	console.log("viewer: " + vec4.str(viewer_pos));
	console.log("jumbo:   " + vec3.str(jumbo_dir));
	if (!is_front) console.log("jumbotron is BACK.");
	else console.log("jumbotron is FRONT.");
	if (!is_left) console.log("jumbotron is RIGHT.");
	else console.log("jumbotron is LEFT.");
	console.log("angle:   " + the_angle + " degrees");
    }

    this.jump_rotation = the_angle;

    // must be symmetrical
    this.up3 = 2;
    this.up2 = 8;
    this.up1 = 16;
    this.up0 = 5;
    this.dn0 = 5;
    this.dn1 = 16;
    this.dn2 = 8;
    this.dn3 = 2;
    this.inJump = true;
};

GLmatrix.prototype.newViewAllowed = function() {
    if(mazeMode)
	return myMaze.checkPosition();
    if(stadiumMode)
	return myStadium.checkPosition();
};

/**
 * Input: amount of time to go up for x squares.
 */
GLmatrix.prototype.update = function() {
    if(stadiumMode===1){
	this.runStadiumInit();
	myStadium.updateStadium();
    }

    if(GLobject.has_collided > 0) GLobject.has_collided --;

    const x = 50.0;
    if(this.inJump === false) {
	this.gradualMove();
	this.gradualRotate();
	if(this.vMatrixNewChanged === false) { return; }
	if( priveledgedMode.val || this.newViewAllowed()){
	    // We only check the view if we are
	    //  not in 'god mode'

	    //Multiplies vMatrixNew * vMatrix
	    //therefore if vMatrixNew==identity we have no movement
	    this.vMul(this.vMatrixNew);
	    this.vMatrixChanged = true;
	}
	mat4.identity(this.vMatrixNew);
	return; 
    }
    if(this.up3 >= 0) { 
	this.vTranslate([0, 3*x, 0]); 
	this.vRotate(Math.PI/64,[-1, 0, 0]); 
	this.vRotate(this.jump_rotation / 30, [0, 1, 0]);
	this.up3--;
    } else if(this.up2 >= 0) { 
	this.vTranslate([0, 2*x, 0]); 
	this.vRotate(Math.PI/128,[-1, 0, 0]); 
	this.vRotate(this.jump_rotation / 26, [0, 1, 0]);
	this.up2--;
    } else if(this.up1 >= 0) {
	this.vTranslate([0, 1*x, 0]); 
	this.vRotate(Math.PI/256,[-1, 0, 0]); 
	this.vRotate(this.jump_rotation / 26, [0, 1, 0]);
	this.up1--; 
    } else if(this.up0 >= 0) {
	this.vRotate(this.jump_rotation  * this.up0/ 100, [0, 1, 0]);
	this.up0--; 
    } else if(this.dn0 >= 0) { 
	this.vRotate(this.jump_rotation * (5 - this.dn0) / 100, [0,-1, 0]);
	this.dn0--;
    } else if(this.dn1 >= 0) { 
	this.vRotate(this.jump_rotation / 26, [0,-1, 0]);
	this.vRotate(Math.PI/256,[1, 0, 0]); 
	this.vTranslate([0,-1*x, 0]);
	this.dn1--;
    } else if(this.dn2 >= 0) {
	this.vRotate(this.jump_rotation / 26, [0,-1, 0]);
	this.vRotate(Math.PI/128,[1, 0, 0]); 
	this.vTranslate([0,-2*x, 0]);
	this.dn2--;
    } else if(this.dn3 >= 0) {
	this.vRotate(this.jump_rotation / 30, [0,-1, 0]);
	this.vRotate(Math.PI/64,[1, 0, 0]); 
	this.vTranslate([0,-3*x, 0]);
	this.dn3--;
    } else {
	if(stadiumMode && StadiumInitSeqNum===4){
	    freeze = 0;
	    freezeOff = 1;
	    //alert("Game back in play");
	}
	this.inJump = false; return; 
    }

    this.vMul(this.vMatrixNew);
    mat4.identity(this.vMatrixNew);
    this.vMatrixChanged = true;
};

/**
 * View / model / normal ops I got from:
 http://www.songho.ca/opengl/gl_transform.html
*/
GLmatrix.prototype.setViewUniforms = function(gl_, shader_) {

    if (this.pMatrixChanged === true) {
	this.pMatrixChanged = false;
    }
    if (this.vMatrixChanged === true) {
	// models and lights are transformed by 
	//  inverse of viewing matrix
	mat4.invert(this.ivMatrix, this.vMatrix);
	mat4.mul(this.ilMatrix, this.vMatrix, this.lightMatrix);
	this.vMatrixChanged = false;
    }

    gl_.uniformMatrix4fv(shader_.unis["pMatU"], false, this.pMatrix);
    gl_.uniformMatrix4fv(shader_.unis["vMatU"], false, this.ivMatrix);



    gl_.uniformMatrix4fv(shader_.unis["lMatU"], false, this.ilMatrix);
    gl_.uniform3fv(shader_.unis["lightPosU"], lightPos);
};



/**
 * Per-vertex uniforms must be set each time.
 */
GLmatrix.prototype.setVertexUniforms = function(gl_, shader_) {

    if (this.mMatrixChanged === true) { 
	// perceived normals: (inverse of modelview
	//  transposed) * object normals
	mat4.mul(this.mvMatrix, this.ivMatrix, this.mMatrix);
	mat4.invert(this.nMatrix, this.mvMatrix);
	mat4.transpose(this.nMatrix, this.nMatrix);
	this.mMatrixChanged = false;
    }
    gl_.uniformMatrix4fv(shader_.unis["mMatU"], false, this.mMatrix);
    gl_.uniformMatrix4fv(shader_.unis["nMatU"], false, this.nMatrix);
};

GLmatrix.prototype.push = function() {
    var copy = mat4.clone(this.mMatrix);
    this.mStack.push(copy);
};

GLmatrix.prototype.pop = function() {
    if (this.mStack.length === 0) {
        throw "Invalid pop"; }
    mat4.copy(this.mMatrix, this.mStack.pop());
    this.mMatrixChanged = true;
};

});
