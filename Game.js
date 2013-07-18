
function Game() {  

    moveDist = 100.1;
    lookDist = 1/15;

    this.grid = 50;
    this.hit_sound = [];
    this.movement = vec3.create();
    this.floor_movement = vec3.create();
    this.bg_movement = vec3.create();
    this.total = null;
    
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
    
    this.player_string = new GLstring(
	"Player ", TEXT_TEXTURE, theCanvas.gl.shader_canvas);
    this.intro_string2 = new GLstring(document.getElementById("stadium_name").value + ".",
				      TEXT_TEXTURE4, theCanvas.gl.shader_canvas);

    var player_width = this.grid;
    this.player = new Quad(
	[ player_width, 2 * player_width, -1],
	[ player_width,                0, -1],
	[-player_width, 2 * player_width, -1],
	[-player_width,                0, -1]);

    var bg_width = 1200;
    this.background = new Quad(
	[-bg_width, bg_width, -20],
	[-bg_width,-bg_width, -20],
	[ bg_width, bg_width, -20],
	[ bg_width,-bg_width, -20]);

    this.floor = [];
    var floor_width = player_width;
    var i;
    for(i = -10; i <= 10; ++i) {
	this.floor.push(new Quad(
	    [-floor_width,                0, -1],
	    [-floor_width, -2 * floor_width, -1],
	    [ floor_width,                0, -1],
	    [ floor_width, -2 * floor_width, -1])
			.translate([i * floor_width * 2, 0, 0])
			.setTexture(RUG_TEXTURE));
    }

    this.player.setTexture(TEXT_TEXTURE);
    this.background.setTexture(HEAVEN_TEXTURE);
    this.player.setShader(theCanvas.gl.shader_canvas);
    this.background.setShader(theCanvas.gl.shader_canvas);
    
    theMatrix.vTranslate([0,0,1000]);

    this.player.xPos = 0;
    this.player.yPos = 0;

    return this;
}

Game.prototype.initBuffers = function(gl_) {

    if(!this.web_audio) this.initWebAudio();
//    this.createAudio("music/elements.mp3");
    this.createAudio("music/beats.mp3");
    this.mapKeys();

    this.player_string.initBuffers(gl_);
    this.intro_string2.initBuffers(gl_);
    this.player.initBuffers(gl_);
    this.background.initBuffers(gl_);
    var i;
    for(i = 0; i < this.floor.length; ++i){
	this.floor[i].initBuffers(gl_);
    }
};

Game.hi_hat = 0;

Game.prototype.up_count = 0;
Game.prototype.down_count = 0;
Game.prototype.draw = function(gl_) {

    if (this.inJump === true) this.jump();

    theMatrix.push();
    theMatrix.translate(this.movement);
    this.player.draw(gl_);
    theMatrix.pop();
    theMatrix.push();
    theMatrix.translate(this.bg_movement);
    this.background.draw(gl_);
    theMatrix.pop();
    var i;
    theMatrix.push();
    theMatrix.translate(this.floor_movement);
    for(i = 0; i < this.floor.length; ++i){
	this.floor[i].draw(gl_);
    }
    theMatrix.pop();

    
    if (log_music) {

	var FFTData = new Uint8Array(this.analyser.frequencyBinCount);
	this.analyser.getByteFrequencyData(FFTData);


	var sum = FFTData[0] + FFTData[1] + FFTData[2];
	if(this.total === null) this.total = sum;

	if(sum/this.total > 16) { 
	    console.log("%.2f", sum / this.total); 
	    Game.hi_hat = 10;
	} else {
	    if (Game.hi_hat > 0) Game.hi_hat -= 1;
	}

	this.total *= 0.75;
	this.total += (sum / 4);

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
var log_music = false;

/**
 * Binds keys to document object.
 * This should be done as part of initialization.
 */
Game.prototype.mapKeys = function() {

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
	    this.movement[0] += this.grid;
	    this.bg_movement[0] += this.grid / 30;
	    break;
	case 37: // left
	    if(this.left_key_down === true) break;
	    this.left_key_down = true;
	    this.movement[0] -= this.grid;
	    this.bg_movement[0] -= this.grid / 30;
	    break;
	case 38: // up
	    if(this.jump_key_down === true) break;
	    this.jump_key_down = true;
	    this.startJump();
	    break;
	case 40: // down
	    log_music = !log_music;
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

var jump_dist = [];

var x;

for (x = 0; x <= 30; ++x) {
    jump_dist.push ((900 / 4) - (x*x / 4));
}

Game.prototype.inJump = false;

Game.prototype.startJump = function() {
    if (this.inJump === true) return;
    this.jumping_up = true;
    this.jumping_down = false;
    this.jump_count = jump_dist.length;
    this.inJump = true;

}

Game.prototype.jump = function() {

    // Might change asynchronously; must assign within evaluation.?

    if (this.jumping_up === true) {
	var count = (--this.jump_count);
	if (count <= 0) { this.jumping_up = false; this.jumping_down = true; return; }
//	console.log(jump_dist[count] + ", " + count);
	this.movement[1] = jump_dist[count];

    } else if (this.jumping_down === true) {
	var count = (++this.jump_count);
	if (count >= jump_dist.length) { this.jumping_down = false; return; }
//	console.log(jump_dist[count] + ", " + count);
	this.movement[1] = jump_dist[count];
	    
    } else { this.inJump = false; }
}

Game.prototype.initWebAudio = function() {

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

    this.audio = [{}];
};

Game.prototype.handleAudioRequest = function(gl_audio, request) {

    this.web_audio.decodeAudioData(
	request.response,
	function(the_buffer) {
	    gl_audio.buffer = the_buffer;
	    // Save initial time we start audio, so we can pause / play.
	    gl_audio.source = this.web_audio.createBufferSource();
	    gl_audio.source.connect(this.low_pass);
	    gl_audio.source.buffer = gl_audio.buffer;
	    gl_audio.source.loop = true;
	    gl_audio.elapsed_time = this.web_audio.currentTime;
	    gl_audio.offset = 0;
	    gl_audio.playing = true;
	    gl_audio.source.start(0,0);
	}.bind(this)
    );
};

/**
 * Creates an audio element, sets it up, and starts it.
 * Uses the following as a ref:
 * http://chromium.googlecode.com/svn/trunk/samples/audio/index.html
*/

Game.prototype.createAudio = function(url) {

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer"; // Does this work for any MIME request?
    // Once request has loaded, load and start audio buffer
    request.onload = this.handleAudioRequest.bind(this, this.audio[0], request);
    request.send();
};
