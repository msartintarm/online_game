/**
 * Creates and initializes a player. Very similar to quad.
 * Methods will be used by game.
 */
function Player(gl_, grid_size) {  

    // Used in collision detection.
    var WALL_NONE = 0;
    var WALL_N = 1;
    var WALL_S = 2;
    var WALL_W = 3;
    var WALL_E = 4;

    var i; // for init loop
    
    // Setup player textures
    this.name = document.getElementById("player_name").value;
    this.movement = vec3.create();
    this.movement_old = vec3.create();

    // Specify string to use, texture ID, and shader to use
    var player_string = new GLstring(this.name, TEXT_TEXTURE, theCanvas.gl.shader_player);
    var left_string = new GLstring("left", TEXT_TEXTURE, theCanvas.gl.shader_player);
    var right_string = new GLstring("right", TEXT_TEXTURE, theCanvas.gl.shader_player);
    var jump_string = new GLstring("jump", TEXT_TEXTURE, theCanvas.gl.shader_player);
    var collision_string = new GLstring("Ouch!", TEXT_TEXTURE, theCanvas.gl.shader_player);

    this.jump_count = 0;
    this.left_count = 0;
    this.right_count = 0;
    this.left_started = false;
    this.right_started = false;
    this.in_jump = false;
    this.jumping_up = true;
    this.jumping_down = false;
    this.in_left_move = false;
    this.in_right_move = false;

    this.right_key_down = false;
    this.left_key_down = false;
    this.jump_key_down = false;

    var player_width = grid_size;
    this.grid = grid_size;

    // Move distance is a group of numbers, normalized so their sum is 1.0
    this.move_dist = [];
    var move_total = 0;
    for (i = 0; i <= 8; ++i) {
	var move_num = 64 - (i*i);
	this.move_dist.push (move_num);
	move_total += move_num;
    }
    for (i = 0; i <= 8; ++i) {
	this.move_dist[i] /= move_total;
    }

    // x is width (from -w to w), y is height (from 0 to h), z is length (never varies over l)
    var w = grid_size / 2;
    var h = grid_size;
    var l = -1;

    // Experimental. Add the underlying GLobject of the Quad directly to this.
    // This might be a cool way of faking inheritance.
    Quad.bind(this)([ w, h, l],
		    [ w, 0, l],
		    [-w, 0, l],
		    [-w, h, l]);
    this.o.setTexture(TEXT_TEXTURE);
    this.o.initTextures([1,0], [1,1], [0,0], [0,1]);
    this.o.shader = theCanvas.gl.shader_player;
    this.width = w;
    this.height = h;

    this.initBuffers = (function(gl, shader) {

	return function() {
	theCanvas.changeShader(shader);
	theMatrix.setViewUniforms(shader);
	gl.uniformMatrix4fv(shader.unis["pMatU"], false, theMatrix.pMatrix);

	player_string.initBuffers(gl);
	left_string.initBuffers(gl);
	right_string.initBuffers(gl);
	jump_string.initBuffers(gl);
	collision_string.initBuffers(gl);
	this.o.initBuffers(gl);
	};
    }(gl_, gl_.shader_player));

    this.draw = function(gl_, hi_hat) {

	theMatrix.push();
	theMatrix.translate(this.movement);

	var player_shader = this.o.shader;
	theCanvas.changeShader(player_shader);
	var unis = player_shader.unis;
	gl_.uniform1f(unis["hi_hat_u"], hi_hat);
	theMatrix.setVertexUniforms(player_shader);

	this.o.draw(gl_);
	theMatrix.pop();

    };

    this.startJump = function() {

	if (this.in_jump === true) return;
	jump_string.initBuffers(theCanvas.gl);
	this.jump_started = false;
	this.jumping_up = true;
	this.jumping_down = false;
	this.jump_count = 0;
	this.in_jump = true;
    };

    this.startLeftMove = function() {

	if (this.in_left_move === true) return;
	left_string.initBuffers(theCanvas.gl);
	this.left_count = -1;
	this.left_started = false;
	this.in_left_move = true;
	if(this.in_right_move === true && this.right_started === false) {
	    this.in_right_move = false;
	}

    };

    this.startRightMove = function() {

	if (this.in_right_move === true) return;
	right_string.initBuffers(theCanvas.gl);
	this.right_count = -1;
	this.right_started = false;
	this.in_right_move = true;
	if(this.in_left_move === true && this.left_started === false) {
	    this.in_left_move = false;
	}
    };

    this.moveRight = function() {
	if (this.right_started === false) return;
	var count = ++this.right_count;
	if (count >= this.move_dist.length) { 
	    this.in_right_move = false;
	    if (this.right_key_down === true) this.startRightMove();
	    return;
	}
	
	this.movement[0] += this.move_dist[count] * player_width;

    };

    this.moveLeft = function () {
	var count = (++this.left_count);
	if (count >= this.move_dist.length) { 
	    this.in_left_move = false;
	    if (this.left_key_down === true) this.startLeftMove();
	    return;
	}

	this.movement[0] -= this.move_dist[count] * player_width;

    };

    var on_wall = false;

    this.detectCollision = function(object) {

	if(!!object.magical) { object.collided = WALL_NONE; return; }

	// First, check vertical indexes. Next, check horizontal indexes.
	if (this.movement[1] + this.height > object.y_min &&
	    this.movement[1] <= object.y_max &&
	    this.movement[0] - this.width < object.x_max && 
	    this.movement[0] + this.width > object.x_min) {
	    
	    // Which side of the box did we cross during the previous frame?
	    if (this.movement_old[1] >= object.y_max ||
		this.movement[1] >= object.y_max) { 
		object.collided = WALL_N;
		on_wall = true;
		// Here, just move to the top of the wall.
		if(this.jumping_down === true && this.in_jump === true) {
		    this.movement[1] = object.y_max;
		    this.in_jump = false;
		    this.jumping_down = false;
		    player_string.initBuffers(theCanvas.gl);
		}
	    } else if (this.movement_old[1] + this.height <= object.y_min) {
		object.collided = WALL_S;
		this.jump_count = 0;
		this.jumping_up = false; 
		this.jumping_down = true; 
	    } else if (this.movement_old[0] - this.width >= object.x_max) {
		object.collided = WALL_E;
		// Convert to 1.0 scale, round to integer, convert back
		this.movement[0] = this.grid * Math.ceil(this.movement[0] / this.grid);
		this.in_left_move = false;
		if (this.left_key_down === true) this.startLeftMove();
	    } else if (this.movement_old[0] + this.width <= object.x_min) {
		object.collided = WALL_W;
		collision_string.initBuffers(theCanvas.gl);
		// Convert to 1.0 scale, round to integer, convert back
		this.movement[0] = this.grid * Math.floor(this.movement[0] / this.grid);
		this.in_right_move = false;
		if (this.right_key_down === true) this.startRightMove();
	    } else console.log("Collision error..?"); 
	} else {
	    object.collided = WALL_NONE;
	}
    };

    this.movePostCollision = function() {
	if (on_wall === false && this.in_jump === false) {
	    console.log("freefallin!");
	    this.jump_count = 0;
	    this.jumping_up = false; 
	    this.jumping_down = true; 
	    this.jump_started = false;
	    this.in_jump = true;
	}
	on_wall = false;
    };

    this.xPos = function() { return this.movement[0]; }
    this.yPos = function() { return this.movement[1]; }

    // Called before draw.
    this.updateMovement = function(on_beat, audio_method) {

	if(this.movement[1] < -500) { vec3.set(this.movement, 0,10,0); return; }

	vec3.copy(this.movement_old, this.movement);

	// Check whether it's time to initiate a move that's been triggered.
	if (on_beat === true) {
            if (this.in_right_move === true) { 
		this.right_started = true; audio_method(1); } 
            if (this.in_left_move === true && this.left_started === false) { 
		this.left_started = true; audio_method(1); } 
	    if (this.in_jump === true && this.jump_started === false) { 
		this.jump_started = true; audio_method(2, 0.25); } 
	}

	// We may be 'changing a move' due to collision constraints.
	// Otherwise, all other moves are valid and there's no particular priority.
	if (this.in_right_move === true && this.right_started === true) this.moveRight();
	if (this.in_left_move === true && this.left_started === true) this.moveLeft();
	if (this.in_jump === true && this.jump_started === true) {

	    if (this.jumping_up === true) {
		var count = (++this.jump_count);
		var up_dist = 15 - (count / 2);
		if (up_dist <= 0) { 
		    this.jumping_up = false; 
		    this.jumping_down = true; 
		    this.jump_count = 0;
		} else {
		    this.movement[1] += up_dist;
		}

	    } else {
		var count = (++this.jump_count);
		this.movement[1] -= count;
	    }
	}
    };

    return this;
}

