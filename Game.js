function Game() {  

    // Env variable(s)
    this.log_music = false;

    // handles movement
    this.grid = 50;
    this.movement = vec3.create();
    this.bg_movement = vec3.create();
    this.total = null;
    this.cam_left_count = 0;
    this.cam_right_count = 0;
    this.in_jump = false;
    this.in_left_move = false;
    this.in_right_move = false;

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
	[-floor_width,                0, -1],
	[-floor_width, -2 * floor_width, -1],
	[ floor_width,                0, -1],
	[ floor_width, -2 * floor_width, -1])
	.translate([0, 4 * floor_width, 0])
	.setTexture(BRICK_TEXTURE);

    this.initBuffers = function(gl_) {

	if(!this.web_audio) this.initWebAudio();
	//    this.createAudio("music/elements.mp3");
	this.audio[0] = this.createAudio("music/beats.mp3");

	this.player_string.initBuffers(gl_);
	this.player.initBuffers(gl_);
	this.background.initBuffers(gl_);
	this.push_button.initBuffers(gl_);
	var i;
	for(i = 0; i < this.floor.length; ++i){
	    this.floor[i].initBuffers(gl_);
	}
    };

    this.draw = function(gl_) {

	this.updateMovement();

	theMatrix.push();
	theMatrix.translate(this.movement);
	this.player.draw(gl_);
	theMatrix.pop();
	theMatrix.push();
	theMatrix.translate(this.bg_movement);
	this.background.draw(gl_);
	theMatrix.pop();
	this.push_button.draw(gl_);
	var i;
	for(i = 0; i < this.floor.length; ++i){
	    this.floor[i].draw(gl_);
	}

	
	if (this.log_music) {

	    if(this.hi_hat < 5) {
		
		var FFTData = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(FFTData);

		var sum = FFTData[0] + FFTData[1] + FFTData[2];
		if(this.total === null) this.total = sum;

		if(sum/this.total > 5) { 
		    console.log("%.2f", sum / this.total); 
		    this.hi_hat = 10;
		} else {
		    if (this.hi_hat > 0) this.hi_hat -= 1;
		}
		this.total *= 0.75;
		this.total += (sum / 4);
	    } else {
		this.hi_hat -= 1;
	    }

	    /*
	      for(i = 0; i < 25 && i < FFTData.length; ++i) {
	      if(FFTData[i] < 100) music_data += " "; 
	      if(FFTData[i] < 10) music_data += " "; 
	      if(FFTData[i] === 0) music_data += "  ";
	      else music_data += FFTData[i] + ",";
	      }
	    */
	}
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
		this.log_music = !this.log_music;
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
	this.jumping_up = true;
	this.jumping_down = false;
	this.jump_count = jump_dist.length;
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

    this.updateMovement = function() {

	if(this.player_x_pos < -7) this.startCameraLeftMove();
	else if(this.player_x_pos > 7) this.startCameraRightMove();
	if (this.cam_in_left_move === true) {
	    if ((--this.cam_left_count) < 0) { this.cam_in_left_move = false; return; }
	    theMatrix.vTranslate([-this.grid * 0.5, 0, 0]);
	}

	if (this.cam_in_right_move === true) {
	    if ((--this.cam_right_count) < 0) { this.cam_in_right_move = false; return; }
	    theMatrix.vTranslate([this.grid * 0.5, 0, 0]);
	}

	// Handle left and right movement.
	if (this.in_right_move === true) {
	    
	    if(this.right_started === true) {

		var count = ++this.right_count;
		if (count >= move_dist.length) { 
		    this.in_right_move = false;
		    if (this.right_key_down === true) this.startRightMove();
		    return;
		}
		
		this.movement[0] += move_dist[count] * this.grid;
		this.bg_movement[0] += this.grid / 30;
		
	    } else if(this.hi_hat == 10) {
		this.right_started = true;
		++this.player_x_pos;
		return;
	    } 
	}

	if (this.in_left_move === true) {
	    
	    if(this.left_started === true) {

		var count = (++this.left_count);
		if (count >= move_dist.length) { 
		    this.in_left_move = false;
		    if (this.left_key_down === true) this.startLeftMove();
		    return;
		}
		
		this.movement[0] -= move_dist[count] * this.grid;
		this.bg_movement[0] -= this.grid / 30;
		
	    } else if(this.hi_hat == 10) {
		this.left_started = true;
		--this.player_x_pos;
		return;
	    } 
	}

	// Handle jumps!
	if (this.in_jump === true) 
	    if (this.jumping_up === true) {
		var count = (--this.jump_count);
		if (count <= 0) { this.jumping_up = false; this.jumping_down = true; return; }
		//	console.log(jump_dist[count] + ", " + count);
		this.movement[1] = jump_dist[count];

	    } else {
		var count = (++this.jump_count);
		if (count >= jump_dist.length) { this.in_jump = false; return; }
		//	console.log(jump_dist[count] + ", " + count);
		this.movement[1] = jump_dist[count];
		
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

var x;

// Jump distance is a parabola from 0 to 900/4
var jump_dist = [];
for (x = 0; x <= 30; ++x) {
    jump_dist.push ((900 / 4) - (x*x / 4));
}

// Move distance is a group of numbers, normalized so their sum is 1.0
var move_dist = [];
var move_total = 0;
for (x = 0; x <= 8; ++x) {
    var move_num = 64 - (x*x);
    move_dist.push (move_num);
    move_total += move_num;
}
for (x = 0; x <= 8; ++x) {
    move_dist[x] /= move_total;
}

