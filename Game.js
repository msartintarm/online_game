// Used in collision detection.
const WALL_NONE = 0;
const WALL_N = 1;
const WALL_S = 2;
const WALL_W = 3;
const WALL_E = 4;

/**
 * Creates and initializes a game.
 */
function Game() {  

    var i; // for init loop

    // Env variable(s) - do not change during execution.
    this.log_music = false;

    // handles movement
    this.grid = 50;
    this.movement = vec3.create();
    this.movement_old = vec3.create();
    this.bg_movement = vec3.create();
    this.total = null;
    this.total2 = null;
    this.cam_left_count = 0;
    this.cam_right_count = 0;
    this.in_jump = false;
    this.in_left_move = false;
    this.in_right_move = false;
    this.in_change = false;
    this.change_x = [];

    // Jump distance is a vector of linear X values
    // When we increment y-pos by these array values, the effect is a parabolic jump
    this.jump_dist = [];
    for (i = 0; i <= 30; ++i) {
	this.jump_dist.push (15 - (i / 2));
    }

    // Move distance is a group of numbers, normalized so their sum is 1.0
    this.move_dist = [];
    move_total = 0;
    for (i = 0; i <= 8; ++i) {
	var move_num = 64 - (i*i);
	this.move_dist.push (move_num);
	move_total += move_num;
    }
    for (i = 0; i <= 8; ++i) {
	this.move_dist[i] /= move_total;
    }

    // Music related stuff
    this.hit_sound = [];
    this.hit_sound[0] = new Audio("drums_1.wav");
    this.hit_sound[1] = new Audio("drums_2.wav");
    this.hit_sound[2] = new Audio("drums_3.wav");
    this.hit_sound[3] = new Audio("drums_4.wav");
    this.hit_sound[4] = new Audio("drums_5.wav");
    this.hit_sound[0].load();
    this.hit_sound[1].load();
    this.hit_sound[2].load();
    this.hit_sound[3].load();
    this.hit_sound[4].load();

    this.hi_hat = 0;
    
    this.player_name = document.getElementById("stadium_name").value;

    this.player_string = new GLstring(this.player_name, 
				      TEXT_TEXTURE, 
				      theCanvas.gl.shader_player);
    var player_width = this.grid;
    var bg_width = 1200;
    var floor_width = player_width;
    this.floor = [];

    theMatrix.vTranslate([0,0,1000]);

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
	    [-floor_width, -2 * floor_width, -1],
	    [ floor_width,                0, -1],
	    [ floor_width, -2 * floor_width, -1])
			.translate([i * floor_width * 2, 0, 0])
			.setTexture(RUG_TEXTURE));
    }

    this.push_button = new Quad(
	[-floor_width, 4 * floor_width, -1],
	[-floor_width, 2 * floor_width, -1],
	[ floor_width, 4 * floor_width, -1],
	[ floor_width, 2 * floor_width, -1])
	.setTexture(BRICK_TEXTURE);
    this.push_button.x_min =    -floor_width;
    this.push_button.x_max =     floor_width;
    this.push_button.y_min = 2 * floor_width;
    this.push_button.y_max = 4 * floor_width;
    

    this.initBuffers = function(gl_) {

	GLobject.draw_optimized = true;

	// Basically in our game, we know this stuff only
	// ever gets called in certain patterns.
	theCanvas.changeShader(theCanvas.gl.shader);
	theMatrix.setViewUniforms(theCanvas.gl, theCanvas.gl.shader);
	gl_.uniformMatrix4fv(theCanvas.gl.shader.unis["pMatU"], false, theMatrix.pMatrix);
	theCanvas.changeShader(theCanvas.gl.shader_player);
	theMatrix.setViewUniforms(theCanvas.gl, theCanvas.gl.shader_player);
	gl_.uniformMatrix4fv(theCanvas.gl.shader_player.unis["pMatU"], false, theMatrix.pMatrix);
	theCanvas.changeShader(theCanvas.gl.shader_canvas);
	theMatrix.setViewUniforms(theCanvas.gl, theCanvas.gl.shader_canvas);
	gl_.uniformMatrix4fv(theCanvas.gl.shader_canvas.unis["pMatU"], false, theMatrix.pMatrix);

	if(!this.web_audio) this.initWebAudio();
	//    this.createAudio("music/elements.mp3");
	this.audio[0] = this.createAudio("music/beats.mp3");

	this.player_string.initBuffers(gl_);
	this.player.initBuffers(gl_);
	this.background.initBuffers(gl_);
	this.push_button.initBuffers(gl_);

	for(i = 0; i < this.floor.length; ++i){
	    this.floor[i].initBuffers(gl_);
	}
    };

    this.draw = function(gl_) {

	// Analyse sound, which influences movement.
	if(this.hi_hat < 5) {
	    
	    var FFTData = new Uint8Array(this.analyser.frequencyBinCount);
	    this.analyser.getByteFrequencyData(FFTData);

	    var sum = FFTData[0] + FFTData[1] + FFTData[2];

	    if(this.total === null) this.total = sum;
	    if(this.total < 0.1) this.total = 0.1;
	    if(this.total2 === null) this.total2 = sum;

	    // Rough ratio of this sound to previous sounds
	    if(sum > 2 * this.total && sum > 1.5 * this.total2 ) { 
		this.hi_hat = 11;
		if (this.log_music) {
		    console.log("%.2f", sum / this.total); 
		}
	    }

	    // I'm going to call this the 'rolling average' filter.
	    this.total = this.total * 2/3 + sum/3;
	    this.total2 = sum;
	}
	this.hi_hat = (this.hi_hat > 1) ? this.hi_hat - 1: 0;

	// Analyse movement, which draws upon sound, and activated moves.
	this.updateMovement();

	if (!!player_shader && player_shader.unis["hi_hat_u"] !== -1) {
	    theCanvas.changeShader(player_shader);
	    gl_.uniform1f(player_shader.unis["hi_hat_u"], this.hi_hat);
	}

	// The draw calls themself. Heavily optimize here by manually loading
	// matrices and setting shaders. This reduces redundant calls
	// to shader progs.

	//    this.player : theCanvas.gl.shader_player
	//    this.background : theCanvas.gl.shader_canvas
	//    this.push_button : theCanvas.gl.shader

	theCanvas.changeShader(theCanvas.gl.shader);
	theMatrix.setViewUniforms(theCanvas.gl, theCanvas.gl.shader);

	for(i = 0; i < this.floor.length; ++i){
	    this.floor[i].draw(gl_);
	}

	this.push_button.draw(gl_);

	theMatrix.push();
	theMatrix.translate(this.movement);

	var player_shader = this.player.o.shader;
	theCanvas.changeShader(player_shader);
	theMatrix.setVertexUniforms(theCanvas.gl, player_shader);
	gl_.uniform1f(player_shader.unis["hi_hat_u"], this.hi_hat);

	this.player.draw(gl_);
	theMatrix.pop();

	theMatrix.push();
	theMatrix.translate(this.bg_movement);

	theCanvas.changeShader(theCanvas.gl.shader_canvas);
	theMatrix.setVertexUniforms(theCanvas.gl, theCanvas.gl.shader_canvas);

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
		this.log_music = !(this.log_music);
		break;
	    case 32: // Spacebar
		var audio = this.audio[0];
		if(audio.playing) {
		    audio.offset += this.web_audio.currentTime - 
			audio.elapsed_time;
		    console.log("Playing for " + audio.offset + " seconds.");
		    audio.source.stop(0);
		} else {
		    // Load start time from offset.
		    audio.source = this.web_audio.createBufferSource();
		    audio.source.buffer = audio.buffer;
		    audio.source.loop = true;
		    audio.source.connect(this.low_pass);
		    console.log("Starting after " + audio.offset + " seconds.");
		    audio.source.start(0, audio.offset);
		    audio.elapsed_time = this.web_audio.currentTime;
		}
		audio.playing = !audio.playing;
		break;
	    default:
		break;
	    }
	}.bind(this);
    };

    this.startJump = function() {

	if (this.in_jump === true) return;
	this.jump_started = false;
	this.jumping_up = true;
	this.jumping_down = false;
	this.jump_count = -1;
	this.in_jump = true;
    };

    this.startLeftMove = function() {

	if (this.in_left_move === true) return;
	this.left_count = -1;
	this.left_started = false;
	this.in_left_move = true;
    };

    this.startRightMove = function() {

	if (this.in_right_move === true) return;
	this.right_count = -1;
	this.right_started = false;
	this.in_right_move = true;
    };

    this.startCameraLeftMove = function() {

	if (this.cam_in_left_move) return;
	this.player_x_pos += 7;
	this.cam_left_count = 14;
	this.cam_in_left_move = true;
    };

    this.startCameraRightMove = function() {

	if (this.cam_in_right_move) return;

	this.player_x_pos -= 7;
	this.cam_right_count = 14;
	this.cam_in_right_move = true;
    };

    this.startRightMove = function() {

	if (this.in_right_move === true) return;
	this.right_count = -1;
	this.right_started = false;
	this.in_right_move = true;
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
	    if (this.right_key_down === true) { this.startRightMove(); this.moveRight(); }
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

    this.detectCollision = function() {

	// First, check vertical indexes. Next, check horizontal indexes.
	if (this.movement[1] + this.player_height > this.push_button.y_min &&
	    this.movement[1] < this.push_button.y_max &&
	    this.movement[0] - this.player_width < this.push_button.x_max && 
	    this.movement[0] + this.player_width > this.push_button.x_min) {

	    // Collision detected. Which side of the box did we cross? Look at old
	    // movement to determine this.
	    if (this.movement_old[1] >= this.push_button.y_max) return WALL_N;
	    if (this.movement_old[1] + this.player_height <= this.push_button.y_min) return WALL_S;
	    if (this.movement_old[0] - this.player_width >= this.push_button.x_max) return WALL_E;
	    if (this.movement_old[0] + this.player_width <= this.push_button.x_min) return WALL_W;
	} 
	return WALL_NONE;
		
    };

    this.updateMovement = function() {

	vec3.copy(this.movement_old, this.movement);

	if(this.player_x_pos < -7) this.startCameraLeftMove();
	else if(this.player_x_pos > 7) this.startCameraRightMove();

	// Check whether it's time to initiate a move that's been triggered.
        if (this.in_right_move === true && this.hi_hat == 10) { 
	    this.right_started = true; } 
        if (this.in_left_move === true && this.left_started === false && this.hi_hat == 10) { 
	    this.left_started = true; } 
	if (this.in_jump === true && this.jump_started === false && this.hi_hat == 10) { 
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
		} else {
		    this.movement[1] += 15 - (count / 2);
		}

	    } else {
		var count = (--this.jump_count);
		if (count < 0) { 
		    this.in_jump = false; 
		} else {
		    this.movement[1] -= 15 - (count / 2);
		}
	    }
	}

	// Can we move here, or would a collision prevent it?
	var wall_hit = this.detectCollision();
	if (wall_hit !== WALL_NONE) {

	    // Collision. How far are we from the grid? Let's determine on a scale of 0-1.
	    var grid_dist;
	    switch (wall_hit) {
	    case WALL_W:
		grid_dist = this.movement[0] / this.grid;
		grid_dist -= Math.floor(grid_dist);
		this.movement[0] -= grid_dist * this.grid;
		this.in_right_move = false;
		break;
	    case WALL_E:
		grid_dist = this.movement[0] / this.grid;
		grid_dist -= Math.ceil(grid_dist);
		this.movement[0] -= grid_dist * this.grid;
		this.in_left_move = false;
		break;
	    } 

	    var active_moves = "";
	    if (this.in_left_move === true) active_moves += "l";
	    if (this.in_right_move === true) active_moves += "r";
	    if (this.in_jump === true) active_moves += "j";
	    console.log("yo, collision. " + wall_hit + ", " + active_moves);

	}

    };

    this.initWebAudio = function() {

	if (typeof AudioContext !== "undefined") this.web_audio = new AudioContext();
	else if (typeof webkitAudioContext !== "undefined") this.web_audio = new webkitAudioContext();
	else throw new Error('Use a browser that supports AudioContext for music.');

	this.web_audio.sampleRate = 22050;

	this.analyser = this.web_audio.createAnalyser();
	this.analyser.fftSize = 32;
	this.analyser.connect(this.web_audio.destination);

	this.low_pass = this.web_audio.createBiquadFilter();
	this.low_pass.type = "lowpass";
	this.low_pass.frequency = 100;
	this.low_pass.connect(this.analyser);

	this.audio = [];
    };

    this.handleAudioRequest = function(gl_audio, request) {

	this.web_audio.decodeAudioData(
	    request.response,
	    function(the_buffer) {
		gl_audio.buffer = the_buffer;
		// Save initial time we start audio, so we can pause / play.
		gl_audio.source = this.web_audio.createBufferSource();
		gl_audio.source.connect(this.low_pass);
		gl_audio.source.buffer = gl_audio.buffer;
		gl_audio.source.loop = true;
		gl_audio.source.loopEnd = 2.0;
		// Duplicate this for another buffer.
		gl_audio.buffer2 = the_buffer;
		gl_audio.source2 = this.web_audio.createBufferSource();
		gl_audio.source2.connect(this.low_pass);
		gl_audio.source2.buffer = gl_audio.buffer2;
		gl_audio.elapsed_time = this.web_audio.currentTime;
		gl_audio.offset = 0;
		gl_audio.playing = true;
		gl_audio.source.start(0,0);
//		gl_audio.source2.start(2,0);
		this.mapKeys(); }.bind(this)
	);
    };

    /**
     * Creates an audio element, sets it up, and starts it.
     * Uses the following as a ref:
     * http://chromium.googlecode.com/svn/trunk/samples/audio/index.html
     */

    this.createAudio = function(url) {

	var x = {};
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer"; // Does this work for any MIME request?
	// Once request has loaded, load and start audio buffer
	request.onload = this.handleAudioRequest.bind(this, x, request);
	request.send();
	return x;
    };

    return this;
}

