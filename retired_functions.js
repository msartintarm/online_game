       /*================================*/
      /*================================*/
     /*= It's just too time-consuming =*/
    /*== to support things we don't ==*/
   /*=== particularly love, like ====*/
  /*========= flat norms. ==========*/
 /*================================*/
/*================================*/

function GLobject() {
    this.hasFlatNorms = false;
}

/**
 * Sometimes, we'll have to invert the norms 
 *  of objects
 */
GLobject.prototype.invertFlatNorms = function() {
    for (var i = 0; i < this.data["norm_"].length; ++i) {
	this.data["norm_"][i] = -this.data["norm_"][i];
    }
};
var FLATNORMS = false;

/**
   Each quad is made up of four triangles, and hence, 
   the norms -can- be calculated solely through their
   positions. 

   All position data must be stable before this point.
*/
GLobject.prototype.initFlatNorms = function() {

    alert("flat norms are unsupported now. Danger!"); return;
    
    if(FLATNORMS === false || this.hasFlatNorms === true) return;
    this.hasFlatNorms = true;

    var a, b, c, d;
    a = vec3.create();
    b = vec3.create();
    c = vec3.create();
    d = vec3.create();

    this.data["index_"] = [];
    this.data["norm_"] = [];
    this.data["col_"] = [];
    this.data["pos_"] = []; 
    this.data["tex_"] = [];
    // We'll go over one triangle (3 indexes, 3 * data_size elements for each new buffer)
    // This will mean the new buffers will have 3/2 as many elements
    var i = 0;
    while(i < this.data["index"].length) {

	// Load up every element
	this.data["index_"].push(i);
	ind = this.data["index"][i];
	this.data["col_"].push( this.data["col"][ind * 3] );
	this.data["col_"].push( this.data["col"][ind * 3 + 1] );
	this.data["col_"].push( this.data["col"][ind * 3 + 2] );
	this.data["pos_"].push( this.data["pos"][ind * 3] );
	this.data["pos_"].push( this.data["pos"][ind * 3 + 1] );
	this.data["pos_"].push( this.data["pos"][ind * 3 + 2] );
	this.data["tex_"].push( this.data["tex"][ind * 2] );
	this.data["tex_"].push( this.data["tex"][ind * 2 + 1] );
	vec3.set(a, this.data["pos"][ind * 3], 
		    this.data["pos"][ind * 3 + 1], 
		    this.data["pos"][ind * 3 + 2]); 
	i++;
	// 3 times. Only the vector that's set changes.
	this.data["index_"].push(i);
	ind = this.data["index"][i];
	this.data["col_"].push( this.data["col"][ind * 3] );
	this.data["col_"].push( this.data["col"][ind * 3 + 1] );
	this.data["col_"].push( this.data["col"][ind * 3 + 2] );
	this.data["pos_"].push( this.data["pos"][ind * 3] );
	this.data["pos_"].push( this.data["pos"][ind * 3 + 1] );
	this.data["pos_"].push( this.data["pos"][ind * 3 + 2] );
	this.data["tex_"].push( this.data["tex"][ind * 2] );
	this.data["tex_"].push( this.data["tex"][ind * 2 + 1] );
	vec3.set(b, this.data["pos"][ind * 3], 
		    this.data["pos"][ind * 3 + 1], 
		    this.data["pos"][ind * 3 + 2]); 
	i++;
	// Last time.
	this.data["index_"].push(i);
	ind = this.data["index"][i];
	this.data["col_"].push( this.data["col"][ind * 3] );
	this.data["col_"].push( this.data["col"][ind * 3 + 1] );
	this.data["col_"].push( this.data["col"][ind * 3 + 2] );
	this.data["pos_"].push( this.data["pos"][ind * 3] );
	this.data["pos_"].push( this.data["pos"][ind * 3 + 1] );
	this.data["pos_"].push( this.data["pos"][ind * 3 + 2] );
	this.data["tex_"].push( this.data["tex"][ind * 2] );
	this.data["tex_"].push( this.data["tex"][ind * 2 + 1] );
	vec3.set(c, this.data["pos"][ind * 3], 
		    this.data["pos"][ind * 3 + 1], 
		    this.data["pos"][ind * 3 + 2]); 
	i++;
	// Calc norms for these 3 triangles.
	vec3.sub(b, b, a);
	vec3.sub(c, c, a);
	vec3.cross(c, c, b);
	vec3.normalize(c, c);

	this.data["norm_"].push(c[0]);
	this.data["norm_"].push(c[1]);
	this.data["norm_"].push(c[2]);
	this.data["norm_"].push(c[0]);
	this.data["norm_"].push(c[1]);
	this.data["norm_"].push(c[2]);
	this.data["norm_"].push(c[0]);
	this.data["norm_"].push(c[1]);
	this.data["norm_"].push(c[2]);
    }

    if(this.normsInverted) { this.invertFlatNorms(); }

};


function handleKeyDown(theEvent) {

    if(wrongKey) {
	wrongKey = false;
	document.getElementById("keyboard").innerHTML = "";
    }

    switch(theEvent.keyCode) {
	
    case 16: // shift
	theMatrix.toggleSpeed();
	break;
    case 32: // spacebar
	theMatrix.jump();
	if(freeze === 0 && (StadiumInitSeqNum === 4 && stadiumMode)){
	    freezeBirth = Math.round(new Date().getTime()/1000);
	    freeze = 1;
	    //alert("Game Paused");
	}
	document.getElementById("keyboard").innerHTML = 
	    "Jump!";
	break;
    case 39: // ->
	theMatrix.moveLeft();
	document.getElementById("keyboard").innerHTML = 
	    "Jump!";
	break;
    case 37: // left
	theMatrix.moveRight();
	break;
    case 38: // up
	theMatrix.moveForward();
	break;
    case 40: // down
	theMatrix.moveBack();
	break;
    case 65: // a
	theMatrix.lookLeft(2);
	break;
    case 68: // d
	theMatrix.lookRight(2);
	break;	
    case 73: // i
	if(priveledgedMode.val)
	    theMatrix.lookUp();
	break;
    case 75: // k
	if(priveledgedMode.val)
	    theMatrix.lookDown();
	break;
    case 80: 
	if(freeze === 0 && (StadiumInitSeqNum === 4 && stadiumMode)){
	    freezeBirth = Math.round(new Date().getTime()/1000);
	    freeze = 1;
	    alert("Game Paused");
	}
	else if(stadiumMode && StadiumInitSeqNum===4){
	    freeze = 0;
	    freezeOff = 1;
	    alert("Game back in play");
	}
	break;
    case 87: // w
	if(priveledgedMode.val)
	    theMatrix.moveUp();
	break;
    case 83: // s
	if(priveledgedMode.val)
	    theMatrix.moveDown();
	break;
    case 112: // F1: cycle through shaders 
	FLATNORMS = !FLATNORMS;
	theCanvas.changeShaders('shader-fs', 'shader-vs');
	break;
    case 49: //1 : change ball shader
	ball_shader_selectG++;
	console.log("Ball shader: " + kNameG[ball_shader_selectG]);
	break;
    default:
	wrongKey = true;
	document.getElementById("keyboard").innerHTML = 
	    "Key " + theEvent.keyCode + " is undefined.";
	break;
    }
}

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

GLmatrix.prototype.lookLeft = function(distance) {
    if(!stadiumMode || (stadiumMode && StadiumInitSeqNum == 4 && !freeze)){
	radiansToRotate = (lookDist * distance * Math.PI)/10;
	rotateCount = 10;
	vectorRotation = [0,1,0];
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
