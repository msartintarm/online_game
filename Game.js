/**
 * Creates and initializes a game.
 */
function Game() {  

    // Used in collision detection.
    const WALL_NONE = 0;
    const WALL_N = 1;
    const WALL_S = 2;
    const WALL_W = 3;
    const WALL_E = 4;

    var theTexture2 = new GLtexture(theCanvas.gl, BRICK_NORMAL_TEXTURE);
    var theTexture3 = new GLtexture(theCanvas.gl, HEAVEN_NORMAL_TEXTURE);

    var audio = new GLaudio();

    // createAudio(origin URL, destination node, loop[, loop offset, loop time])
    // These are at 120 BPM: 1 sec = 2 beats
    // 1. Low-pass input detects movement, occuring on the half-beat; slightly below 0.25s
    // 2. Non-looping sound, which will be triggered by the above sample
    // 3. Rest of the song.
    audio.createAudio("music/beats.mp3", audio.low_pass, true, 1, 8);
    audio.createAudio("music/electro_hat.wav", audio.web_audio.destination, false);
    audio.createAudio("music/backing_beat.wav", audio.web_audio.destination, true, 0, 8);

    var i; // for init loop

    // handles movement
    this.grid = 50;
    this.movement = vec3.fromValues(0, 2, 0);
    this.movement_old = vec3.create();
    this.bg_movement = vec3.create();
    this.total = null;
    this.total2 = null;
    this.cam_left_count = 0;
    this.cam_right_count = 0;
    this.in_jump = false;
    this.cam_in_left_move = false;
    this.cam_in_right_move = false;
    this.in_left_move = false;
    this.in_right_move = false;
    this.in_change = false;
    this.change_x = [];

    this.right_key_down = false;
    this.left_key_down = false;
    this.jump_key_down = false;

    // Jump distance is a vector of linear X values
    // When we increment y-pos by these array values, the effect is a parabolic jump
    this.jump_dist = [];
    for (i = 0; i <= 30; ++i) {
	this.jump_dist.push (15 - (i / 2));
    }

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
    
    // Setup player textures
    this.player_name = "Oname";
    document.getElementById("player_name").focus();
    document.getElementById("player_name").value = this.player_name;
    // Specify string to use, texture ID, and shader to use
    this.player_string = new GLstring(this.player_name, TEXT_TEXTURE, theCanvas.gl.shader_player);
    this.left_string = new GLstring("left", TEXT_TEXTURE, theCanvas.gl.shader_player);
    this.right_string = new GLstring("right", TEXT_TEXTURE, theCanvas.gl.shader_player);
    this.jump_string = new GLstring("jump", TEXT_TEXTURE, theCanvas.gl.shader_player);
    this.collision_string = new GLstring("Ouch!", TEXT_TEXTURE, theCanvas.gl.shader_player);

    // new shader effect
    this.floor_effect = 0;

    var player_width = this.grid;
    var bg_width = 1200;
    var floor_width = player_width;
    this.floor = [];
    this.push_button = [];
    this.three_dee = [];
    theCanvas.matrix.vTranslate([0,300,750]);

    this.player = new Quad(
	[ player_width / 2, player_width, -1],
	[ player_width / 2,            0, -1],
	[-player_width / 2, player_width, -1],
	[-player_width / 2,            0, -1])
	.setTexture(TEXT_TEXTURE)
	.setShader(theCanvas.gl.shader_player);
    this.player_x_pos = 0;
    this.player_y_pos = 0;
    this.player_width = player_width / 2;
    this.player_height = player_width;

    this.background = new Quad(
	[-bg_width, bg_width, -20],
	[-bg_width,-bg_width, -20],
	[ bg_width, bg_width, -20],
	[ bg_width,-bg_width, -20])
	.setTexture(HEAVEN_TEXTURE)
	.setShader(theCanvas.gl.shader_canvas);

    for(var i = -10; i <= 10; ++i) {
	this.floor.push(new Quad(
	    [-floor_width,                0, -1],
	    [-floor_width, -3 * floor_width, -1],
	    [ floor_width,                0, -1],
	    [ floor_width, -3 * floor_width, -1])
			.translate([i * floor_width * 2, 0, 40])
			.setTexture(RUG_TEXTURE)
			.add2DCoords());
	this.three_dee.push(new SixSidedPrism(
	    [-floor_width,                0, -1],
	    [-floor_width, -3 * floor_width, -1],
	    [ floor_width, -3 * floor_width, -1],
	    [ floor_width,                0, -1],
	    [-floor_width,                0, -1 - floor_width],
	    [-floor_width, -3 * floor_width, -1 - floor_width],
	    [ floor_width, -3 * floor_width, -1 - floor_width],
	    [ floor_width,                0, -1 - floor_width])
			.translate([i * floor_width * 2, 0, 40])
			.setTexture(RUG_TEXTURE));
	// todo: turn into a '
//	this.floor[i + 10].x_
    }

    this.push_button[0] = new Quad(
	[-floor_width, 4 * floor_width, -1],
	[-floor_width, 3 * floor_width, -1],
	[ floor_width, 4 * floor_width, -1],
	[ floor_width, 3 * floor_width, -1])
	.setTexture(BRICK_TEXTURE)
	.add2DCoords();

    this.initBuffers = function(gl_) {
	
	this.mapKeys(); 

	GLobject.draw_optimized = true;

	// Basically in our game, we know this stuff only
	// ever gets called in certain patterns.
	theCanvas.changeShader(gl_.shader);
	theMatrix.setViewUniforms(gl_.shader);
	gl_.uniformMatrix4fv(gl_.shader.unis["pMatU"], false, theMatrix.pMatrix);
	theCanvas.changeShader(gl_.shader_player);
	theMatrix.setViewUniforms(gl_.shader_player);
	gl_.uniformMatrix4fv(gl_.shader_player.unis["pMatU"], false, theMatrix.pMatrix);
	theCanvas.changeShader(gl_.shader_canvas);
	theMatrix.setViewUniforms(gl_.shader_canvas);
	gl_.uniformMatrix4fv(gl_.shader_canvas.unis["pMatU"], false, theMatrix.pMatrix);

//	gl_.uniform1f(player_shader.unis["hi_hat_u"], this.hi_hat);

	this.player_string.initBuffers(gl_);
	this.left_string.initBuffers(gl_);
	this.right_string.initBuffers(gl_);
	this.jump_string.initBuffers(gl_);
	this.collision_string.initBuffers(gl_);
	this.player.initBuffers(gl_);
	this.background.initBuffers(gl_);

	for(i = 0; i < this.floor.length; ++i){
	    this.floor[i].initBuffers(gl_);
	}
	for(i = 0; i < this.push_button.length; ++i){
	    this.push_button[i].initBuffers(gl_);
	}
	for(i = 0; i < this.three_dee.length; ++i){
	    this.three_dee[i].initBuffers(gl_);
	}
    };

    this.draw = function(gl_) {

	audio.analyze();


	// Analyse movement, which draws upon sound, and activated moves.
	this.updateMovement();

	// The draw calls themself. Heavily optimize here by manually loading
	// matrices and setting shaders. This reduces redundant calls
	// to shader progs.

	//    this.player : gl_.shader_player
	//    this.background : gl_.shader_canvas
	//    this.floor : gl_.shader

	theCanvas.changeShader(gl_.shader);
	theMatrix.setViewUniforms(gl_.shader);
	var unis = gl_.shader.unis;
	gl_.uniform1f(unis["hi_hat_u"], audio.hi_hat);
	gl_.uniform1f(unis["wall_hit_u"], this.floor_effect);
	gl_.uniform3fv(unis["lightPosU"], [0, 0, 500]);
	gl_.uniform1i(unis["sampler1"], gl_.tex_enum[BRICK_NORMAL_TEXTURE]);

	for(i = 0; i < this.floor.length; ++i){
	    this.floor[i].draw(gl_);
	}

	for(i = 0; i < this.push_button.length; ++i){
	    this.push_button[i].draw(gl_);
	}

	for(i = 0; i < this.three_dee.length; ++i){
	    this.three_dee[i].draw(gl_);
	}

	theMatrix.push();
	theMatrix.translate(this.movement);

	var player_shader = this.player.o.shader;
	theCanvas.changeShader(player_shader);
	var unis = player_shader.unis;
	gl_.uniform1f(unis["hi_hat_u"], audio.hi_hat);
	theMatrix.setVertexUniforms(player_shader);

	this.player.draw(gl_);
	theMatrix.pop();

	theMatrix.push();
	theMatrix.translate(this.bg_movement);

	theCanvas.changeShader(gl_.shader_canvas);
	theMatrix.setVertexUniforms(gl_.shader_canvas);
	gl_.uniform1i(gl_.shader_canvas.unis["sampler1"], gl_.tex_enum[HEAVEN_NORMAL_TEXTURE]);

	this.background.draw(gl_);
	theMatrix.pop();

	
    };

    /**
     * Binds keys to document object.
     * This should be done as part of initialization.
     */
    this.mapKeys = function() {

	document.onkeyup = function(the_event) {

	    switch(the_event.keyCode) {
	    case 39: this.right_key_down = false; break;
	    case 37: this.left_key_down = false; break;
	    case 38: // up
		this.startJump();
		this.jump_key_down = false;
		break;
	    default:
		break;
	    }
	}.bind(this);

	document.onkeydown = function(the_event) {

	    switch(the_event.keyCode) {
	    case 39: // right
		if(this.right_key_down === true) break;
		this.right_key_down = true;
		this.startRightMove();
		break;
	    case 37: // left
		if(this.left_key_down === true) break;
		this.left_key_down = true;
		this.startLeftMove();
		break;
	    case 38: // up
		if(this.jump_key_down === true) break;
		this.jump_key_down = true;
		this.startJump();
		break;
	    case 40: // down
		audio.log_music = !(audio.log_music);
		break;
	    case 32: // Spacebar
		audio.pause();
		break;
	    default:
		break;
	    }
	}.bind(this);
    };

    this.startJump = function() {

	if (this.in_jump === true) return;
	this.jump_string.initBuffers(theCanvas.gl);
	this.jump_started = false;
	this.jumping_up = true;
	this.jumping_down = false;
	this.jump_count = -1;
	this.in_jump = true;
    };

    this.startLeftMove = function() {


	if (this.in_left_move === true) return;
	this.left_string.initBuffers(theCanvas.gl);
	this.left_count = -1;
	this.left_started = false;
	this.in_left_move = true;
    };

    this.startRightMove = function() {

	if (this.in_right_move === true) return;
	this.right_string.initBuffers(theCanvas.gl);
	this.right_count = -1;
	this.right_started = false;
	this.in_right_move = true;
    };

    this.startCameraLeftMove = function() {

	if (this.cam_in_left_move === true) return;
	this.player_x_pos += 7;
	this.cam_left_count = 14;
	this.cam_in_left_move = true;
    };

    this.startCameraRightMove = function() {

	if (this.cam_in_right_move === true) return;

	this.player_x_pos -= 7;
	this.cam_right_count = 14;
	this.cam_in_right_move = true;
    };

    this.changeMovement = function() {
	var count = ++this.change_count;
	if (count >= this.change_x.length) { 
	    this.in_change = false;
	    return;
	}

	console.log("movement frame " + count + ": " + this.change_x[count]);
	
	this.movement[0] += this.change_x[count] * this.grid;
	this.bg_movement[0] += this.grid / 30;

    };

    this.moveRight = function() {
	if (this.right_started === false) return;
	var count = ++this.right_count;
	if (count >= this.move_dist.length) { 
	    this.in_right_move = false;
	    if (this.right_key_down === true) this.startRightMove();
	    return;
	}
	
	this.movement[0] += this.move_dist[count] * this.grid;
	this.bg_movement[0] += this.grid / 30;

    };

    this.moveLeft = function () {
	var count = (++this.left_count);
	if (count >= this.move_dist.length) { 
	    this.in_left_move = false;
	    if (this.left_key_down === true) this.startLeftMove();
	    return;
	}

	this.movement[0] -= this.move_dist[count] * this.grid;
	this.bg_movement[0] -= this.grid / 30;

    };

    this.detectCollision = function(object) {

	// First, check vertical indexes. Next, check horizontal indexes.
	if (this.movement[1] + this.player_height > object.y_min &&
	    this.movement[1] <= object.y_max &&
	    this.movement[0] - this.player_width < object.x_max && 
	    this.movement[0] + this.player_width > object.x_min) {

	    // Which side of the box did we cross during the previous frame?
	    if (this.movement_old[1] >= object.y_max)
		return WALL_N;
	    if (this.movement[1] >= object.y_max) return WALL_N;
	    if (this.movement_old[1] + this.player_height <= object.y_min) return WALL_S;
	    if (this.movement_old[0] - this.player_width >= object.x_max) return WALL_E;
	    if (this.movement_old[0] + this.player_width <= object.x_min) return WALL_W;
	} 
	return WALL_NONE;
		
    };

    this.updateMovement = function() {

	vec3.copy(this.movement_old, this.movement);

	// TODO: restore functionality to these functions
	if(this.player_x_pos < -7) this.startCameraLeftMove();
	else if(this.player_x_pos > 7) this.startCameraRightMove();

	// Check whether it's time to initiate a move that's been triggered.
        if (this.in_right_move === true && audio.hi_hat == 10) { 
	    this.right_started = true; audio.playSound(); } 
        if (this.in_left_move === true && this.left_started === false && audio.hi_hat == 10) { 
	    this.left_started = true; audio.playSound(); } 
	if (this.in_jump === true && this.jump_started === false && audio.hi_hat == 10) { 
	    this.jump_started = true; } 



	// Handle camera natively as it doesn't need much logic.
	if (this.cam_in_right_move === true) {
	    if ((--this.cam_right_count) < 0) this.cam_in_right_move = false;
	    else theMatrix.vTranslate([this.grid * 0.5, 0, 0]);
	}
	if (this.cam_in_left_move === true) {
	    if ((--this.cam_left_count) < 0) this.cam_in_left_move = false;
	    else theMatrix.vTranslate([-this.grid * 0.5, 0, 0]);
	}

	// We may be 'changing a move' due to collision constraints.
	// Otherwise, all other moves are valid and there's no particular priority.
	if (this.in_change === true) this.changeMovement();
	if (this.in_right_move === true && this.right_started === true) this.moveRight();
	if (this.in_left_move === true && this.left_started === true) this.moveLeft();
	if (this.in_jump === true && this.jump_started === true) {

	    if (this.jumping_up === true) {
		var count = (++this.jump_count);
		if (count >= this.jump_dist.length) { 
		    this.jumping_up = false; 
		    this.jumping_down = true; 
		    this.jump_count = 0;
		} else {
		    this.movement[1] += 15 - (count / 2);
		}

	    } else {
		var count = (++this.jump_count);
		this.movement[1] -= count;
	    }
	}

	// Can we move here, or would a collision prevent it?

	// Collision. How far should we go to be on grid?
	var grid_dist;
	var i;
	var on_wall = false;
	var length1 = this.floor.length;
	for(i = length1 + this.push_button.length - 1; i >= 0; --i) { 

	    var object = (i < length1)? 
		this.floor[i]:
		this.push_button[i - length1];
	    object.collided = this.detectCollision(object);

	    if(object.collided !== WALL_NONE)

	    switch (object.collided) {
	    case WALL_W:
		this.collision_string.initBuffers(theCanvas.gl);
		// Convert to 1.0 scale, round to integer, convert back
		this.movement[0] = this.grid * Math.floor(this.movement[0] / this.grid);
		this.in_right_move = false;
		break;
	    case WALL_E:
		// Convert to 1.0 scale, round to integer, convert back
		this.movement[0] = this.grid * Math.ceil(this.movement[0] / this.grid);
		this.in_left_move = false;
		break;
	    case WALL_N: // Here, just move to the top of the wall.
		if(this.jumping_down === true && this.in_jump === true) {
		    this.movement[1] = object.y_max;
		    this.in_jump = false;
		    this.jumping_down = false;
		    this.player_string.initBuffers(theCanvas.gl);
		}
		on_wall = true;
		break;
	    case WALL_S:
		this.jump_count = 0;
		this.jumping_up = false; 
		this.jumping_down = true; 
		break;
	    default: // WALL_NONE
		break;
	    } 
	}

	if(this.push_button[0].collided === WALL_N) this.floor_effect += 1;
	else if (this.floor_effect > 0) this.floor_effect -= 1; 

	if(this.floor_effect > 0) console.log("floor effect: " + this.floor_effect);


	if(on_wall === false && this.in_jump === false) {
	    console.log("freefallin!");
	    this.jump_count = 0;
	    this.jumping_up = false; 
	    this.jumping_down = true; 
	    this.jump_started = false;
	    this.in_jump = true;
	}
    };

    return this;
}

