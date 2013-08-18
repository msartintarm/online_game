/**
 * A bunch of utility functions we created.
 */
var colorVec;
var freeze = 0;
var freezeBirth = 0;
var freezeOff = 0;
// Default lighting and viewer positions
var lightPos =  [0,0,0];


// Quad constructor that pushes
// it to an internal 'objs' array,
// making it easier to draw
function _Quad(a,b,c,d) {
    var newQuad = new Quad(a,b,c,d);
    this.objs.push(newQuad);
    return newQuad;
}

function _Prism(a,b,c,d,e,f,g,h) {
    var newPrism = new SixSidedPrism(a,b,c,d,e,f,g,h);
    this.objs.push(newPrism);
    return newPrism;
}

function _Disk(a,b,c,d) {
    var newDisk = new Disk(a,b,c,d);
    this.objs.push(newDisk);
    return newDisk;
}

function _Cyl(a,b,c,d,e) {
    var newCyl = new Cylinder(a,b,c,d,e);
    this.objs.push(newCyl);
    return newCyl;
}

//Maze.prototype.function Piece(a,b,c,d,e,f,g,h) {
//    var newPiece = new MazePiece(a,b,c,d,e,f,g,h);
//    this.pieces.push(newPiece);
//    return newCyl;
//}

function _Torus(a,b) {
    var newTorus = new Torus(a,b);
    this.objs.push(newTorus);
    return newTorus;
}

function _obj_function(f_in) {

    var f = function() {
	for(var i = 0; i < this.objs.length; ++i) {
	    this.objs[i].f_in;
	}
    };
    return f;
}

//    _objsInitBuffers = _obj_function(initBuffers(gl_));
/**
 *  Functions for high-level objects
 *  that contain arrays of shapes
 */
function _objsInitBuffers(gl_) {


    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].initBuffers(gl_);
    }
    return this;
}

function _objsTranslate(vec_) {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].translate(vec_);
    }
    return this;
}

function _objsFlip() {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].flip();
    }
    return this;
}

function _objsScale(vec) {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].scale(vec);
    }
    return this;
}

function _objsRotatePos() {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].rotatePos();
    }
    return this;
}

function _objsRotateXZ() {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].rotateXZ();
    }
    return this;
}

function _objsRotateNeg() {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].rotateNeg();
    }
    return this;
}


function _objsSetShader(vec) {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].setShader(vec);
    }
    return this;
}

function _objsDraw(gl_) {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].draw(gl_);
    }
    return this;
}

/**
 *  Functions for low-level objects
 *  that contain single shapes
 */
function _oInitBuffers(gl_) {
    this.o.initBuffers(gl_);
    return this;
}

function _oDraw(gl_) {
    this.o.draw(gl_);
}

function _oDrawAgain(gl_) {
    this.o.drawAgain(gl_);
}

function _oTranslate(vec_) {
    this.o.translate(vec_);
    return this;
}

function _oScale(vec_) {
    this.o.scale(vec_);
    return this;
}

function _oFlip() {
    this.o.flip();
    return this;
}

function _oRotateXZ() {
    this.o.rotateXZ();
    return this;
}

function _oRotatePos() {
    this.o.rotatePos();
    return this;
}

function _oRotateNeg() {
    this.o.rotateNeg();
    return this;
}

function _oSetShader(shader) {
    this.o.shader = shader;
    return this;
}

function _oInvertNorms() {
    var oData = this.o.data["norm"];
    for(var i = 0; i < oData.length; ++i) {
	oData[i] = -oData[i];
    }
    return this;
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl_, id) {
    var shaderScript = document.getElementById(id);

    // Didn't find an element with the specified ID; abort.

    if (!shaderScript) {
	return null;
    }

    // Walk through the source element's children, building the
    // shader source string.

    var theSource = "";
    var currentChild = shaderScript.firstChild;

    while(currentChild) {
	if (currentChild.nodeType == 3) {
	    theSource += currentChild.textContent;
	}

	currentChild = currentChild.nextSibling;
    }

    // Now figure out what type of shader script we have,
    // based on its MIME type.

    var shader;

    if (shaderScript.type == "x-shader/x-fragment") {
	shader = gl_.createShader(gl_.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
	shader = gl_.createShader(gl_.VERTEX_SHADER);
    } else {
	return null;  // Unknown shader type
    }

    // Send the source to the shader object
    gl_.shaderSource(shader, theSource);

    // Compile the shader program
    gl_.compileShader(shader);

    // See if it compiled successfully

    if (!gl_.getShaderParameter(shader, gl_.COMPILE_STATUS)) {
	alert("An error occurred compiling the shaders: " +
	      gl_.getShaderInfoLog(shader));
	return null;
    }
    return shader;
}

var click_x = null;
var click_y = null;

var mouse_movement = false;

function handleMouseDown(event) {
    GLobject.has_collided += 3;
    mouse_movement = !mouse_movement;
    click_x = event.clientX;
    click_y = event.clientY;
}

function handleMouseUp(event) {}

function handleMouseMove(event) {

    if (mouse_movement === false) { return; }

    var move_x = event.clientX - click_x;
    var move_y = event.clientY - click_y;

    if((move_x < -0.2) || (move_x > 0.2))
	theMatrix.lookRight(Math.PI / 180 * 2 * ((move_x) / 3));

    if(move_y < -0.1) theMatrix.moveForward();
    else if(move_y > 0.1) theMatrix.moveBack();
}
