/**
   Internally handles matrixes that will be loaded to GL

   Functions manipulating these matrices set flags, ensuring we
   do not perform expensive matrix operations unless necessary
 */
function GLmatrix(gl_) {

    this.gl = gl_;

    this.matrices = new Float32Array(48);

    // Model, viewing, and light matrix
    this.mMatrix = this.matrices.subarray(0, 16);
    this.ivMatrix = this.matrices.subarray(16,32);
    this.nMatrix = this.matrices.subarray(32,48);

    mat4.identity(this.mMatrix);
    mat4.identity(this.ivMatrix);
    mat4.identity(this.nMatrix);
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
//    this.ivMatrix = mat4.create();

    // Ditto wit hinverted lighting matrix
    this.ilMatrix = mat4.create();

    // Normal and modelview matrices, which need to be
    // recomputed each time the model matrix changes
//    this.nMatrix = mat4.create();   // normal
    this.mvMatrix = mat4.create();  // modelview

    // These flags tell us whether to update the matrixes above
    this.mMatrixChanged = true;
    this.vMatrixChanged = true;
    this.pMatrixChanged = true;
    this.vMatrixNewChanged = false;

    // Here is some random, unrelated stuff.
    this.mStack = [];

    this.distToMove = vec3.create();

    // Toggled by member function 'toggleSpeed'
    this.speedMode = 0;

var moveDist = 20.1; //default to maze
var lookDist = 1/10; //default to maze

/**
   Writes a perspective view into internal perspective matrix
*/
this.perspective = function(zoom, aRatio, zNear, zFar) {
    mat4.perspective(this.pMatrix, zoom, aRatio, zNear, zFar);
    this.pMatrixChanged = true;
};

/**
   Writes an orthogonal view into internal perspective matrix
*/
this.ortho = function(left, right, bottom, top, near, far) {
    mat4.ortho(this.pMatrix, left, right, bottom, top, near, far);
    this.pMatrixChanged = true;
};

this.viewMaze = function() {
    this.vTranslate([20,2,9.0]);
    this.vRotate(Math.PI, [0, 1, 0]);
};

this.translate = function(vector) {
    mat4.translate(this.mMatrix, this.mMatrix, vector);
    this.mMatrixChanged = true;
};

this.rotate = function(angle, vector) {
    mat4.rotate(this.mMatrix, this.mMatrix, angle, vector);
    this.mMatrixChanged = true;
};

this.vTranslate = function(vector) {
    mat4.translate(this.vMatrixNew,
		   this.vMatrixNew,
		   vector);
    this.vMatrixNewChanged = true;
};

this.translateN = function(vector) {
    mat4.translate(this.mMatrix,
		   this.mMatrix,
		   [-vector[0],
		    -vector[1],
		    -vector[2]]);
    this.mMatrixChanged = true;
};

this.rotate = function(rads, vector) {
    mat4.rotate(this.mMatrix, this.mMatrix, rads, vector);
    this.mMatrixChanged = true;
};

this.vRotate = function(rads, vector) {
    mat4.rotate(this.vMatrixNew, this.vMatrixNew, rads, vector);
    this.vMatrixNewChanged = true;
};

this.scale = function(vector) {
    mat4.scale(this.mMatrix, this.mMatrix, vector);
    this.mMatrixChanged = true;
};
this.mul = function(m) {
    mat4.multiply(this.mMatrix, this.mMatrix, m);
    this.mMatrixChanged = true;
};

this.vMul = function(v) {
    mat4.multiply(this.vMatrix, this.vMatrix, v);
    this.vMatrixChanged = true;
};

this.lookUp = function() {
	radiansToRotate = (lookDist * 2 * Math.PI)/10;
	rotateCount = 10;
	vectorRotation = [1,0,0];
};

this.lookDown = function() {
	radiansToRotate = (lookDist * 2 * Math.PI)/10;
	rotateCount = 10;
	vectorRotation = [-1,0,0];
};

this.lookRight = function(distance) {
	radiansToRotate = (lookDist * distance * Math.PI)/10;
	rotateCount = 10;
	vectorRotation = [0,-1,0];
};

this.turnAround = function(rads){
    radiansToRotate = rads/10;
    rotateCount = 10;
    vectorRotation = [0,1,0];
};

this.moveForward = function() {
    if(moveCount !== 0  && moveAccel <= 5){
        moveAccel += 0.1;
    }
    else if(moveCount === 0){
        moveAccel = 1;
    }
    this.distToMove = [0,0,(-moveDist/10)*moveAccel];

    moveCount = 10;
};

this.moveBack = function() {
    this.distToMove = [0,0,moveDist/10];
    moveCount = 10;
};

this.moveInToPlay = function() {
	this.distToMove = [0,-1,-50/10];
	moveCount = 10;
};

/**
   Rotate between supported speed modes:
   0 = normal
   1 = slow (.1x)
   2 = fast (10x)
   'Shift' toggles between the modes
*/
this.toggleSpeed = function() {
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

this.gradualMove = function() {

    if(moveCount > 0) {
	switch (this.speedMode) {
	case 1: // Slow speed
	    this.vTranslate(
		vec3.scale(vec3.create(), this.distToMove, 0.1),
		this.distToMove);
	    break;
	case 2: // Fast speed
	    this.vTranslate(
		vec3.scale(vec3.create(), this.distToMove, 10.0),
		this.distToMove);
	    break;
	default:  // Normal speed
	    this.vTranslate(this.distToMove);
	    break;
	}
	moveCount -= 1;
    }
};

var rotateCount = 0;
var radiansToRotate = 0;
var vectorRotation = [0,0,0];
this.gradualRotate = function() {
    if(rotateCount > 0) {
	this.vRotate(radiansToRotate, vectorRotation);
	rotateCount -= 1;
    }
};

/**
 * Input: amount of time to go up for x squares.
 */
this.update = function() {

    if(GLobject.has_collided > 0) GLobject.has_collided --;

    const x = 50.0;
    this.gradualMove();
    this.gradualRotate();
    if(this.vMatrixNewChanged === false) { return; }

    //Multiplies vMatrixNew * vMatrix
    //therefore if vMatrixNew==identity we have no movement
    this.vMul(this.vMatrixNew);
    this.vMatrixChanged = true;
    mat4.identity(this.vMatrixNew);
    return;
};

/**
 * View / model / normal ops I got from:
 http://www.songho.ca/opengl/gl_transform.html
*/
this.setViewUniforms = function(shader_) {

    var gl_ = this.gl;
    var unis = shader_.unis;
    if (this.vMatrixChanged === true) {
	// models and lights are transformed by
	//  inverse of viewing matrix
	mat4.invert(this.ivMatrix, this.vMatrix);
	mat4.mul(this.ilMatrix, this.vMatrix, this.lightMatrix);
	this.vMatrixChanged = false;
    }

    gl_.uniformMatrix4fv(unis["mvnMatU"], false, this.matrices);
    gl_.uniformMatrix4fv(unis["lMatU"], false, this.ilMatrix);
};



/**
 * Per-vertex uniforms must be set each time.
 */
this.setVertexUniforms = function(shader_) {

    if (this.mMatrixChanged === true) {
	// perceived normals: (inverse of modelview
	//  transposed) * object normals
	mat4.mul(this.mvMatrix, this.ivMatrix, this.mMatrix);
	mat4.invert(this.nMatrix, this.mvMatrix);
	mat4.transpose(this.nMatrix, this.nMatrix);
	this.mMatrixChanged = false;
    }

    this.gl.uniformMatrix4fv(shader_.unis["mvnMatU"], false, this.matrices);
};

this.push = function() {
    var copy = mat4.clone(this.mMatrix);
    this.mStack.push(copy);
};

this.pop = function() {
    if (this.mStack.length === 0) {
        throw "Invalid pop"; }
    mat4.copy(this.mMatrix, this.mStack.pop());
    this.mMatrixChanged = true;
};

    return this;
}
