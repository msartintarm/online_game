
function Game() {  

    moveDist = 100.1;
    lookDist = 1/15;

    this.grid = 50;
    this.hit_sound = [];
    this.movement = vec3.create();

    
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

    var bg_width = 600;
    this.background = new Quad(
	[-bg_width, bg_width, -2],
	[-bg_width,-bg_width, -2],
	[ bg_width, bg_width, -2],
	[ bg_width,-bg_width, -2]);

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

    return this;
}

Game.prototype.initBuffers = function(gl_) {

    this.createAudio("music/elements.mp3");
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

Game.prototype.draw = function(gl_) {

    theMatrix.push();
    theMatrix.translate(this.movement);
    this.player.draw(gl_);
    theMatrix.pop();
    this.background.draw(gl_);
    var i;
    for(i = 0; i < this.floor.length; ++i){
	this.floor[i].draw(gl_);
    }
    if (log_music) {
	var FFTData = new Uint8Array(this.analyser.frequencyBinCount);
	this.analyser.getByteTimeDomainData(FFTData);
	var i;
	if(FFTData[0] < 100) console.log(FFTData[0]); 
	else console.log("-");
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
var log_music = true;
Game.prototype.mapKeys = function() {

    document.onkeydown = function(the_event) {

	switch(the_event.keyCode) {
	case 39: // ->
	    this.movement[0] += this.grid;
	    break;
	case 37: // left
	    this.movement[0] -= this.grid;
	    break;
	case 38: // up
	    log_music = !log_music;
	    break;
	case 40: // down
	    break;
	case 32: // Spacebar
	    var audio = this.audio[0];
	    if(audio.playing) {
		console.log(audio.elapsed_time);
		audio.offset += this.web_audio.currentTime - 
		    audio.time;
		console.log("Playing for " + audio.offset + " seconds.");
		audio.source.stop(0);
	    } else {
		// Load start time from offset.
		audio.source = this.web_audio.createBufferSource();
		audio.source.buffer = audio.buffer;
		audio.source.connect(this.web_audio.destination);
		console.log("Starting after " + audio.offset + " seconds.");
		audio.source.start(0, theCanvas.audio.offset);
		audio.elapsed_time = this.web_audio.currentTime;
	    }
	    audio.playing = !audio.playing;
	    break;
	default:
	    break;
	}
    }.bind(this);
};

Game.prototype.handleAudioRequest = function(gl_audio, request) {

    this.web_audio.decodeAudioData(
	request.response,
	function(the_buffer) {
	    gl_audio.buffer = the_buffer;
	    // Save initial time we start audio, so we can pause / play.
	    gl_audio.source = this.web_audio.createBufferSource();
	    gl_audio.source.connect(this.analyser);
	    gl_audio.source.buffer = gl_audio.buffer;
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

    if(!this.web_audio) this.initWebAudio();

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer"; // Does this work for any MIME request?
    // Once request has loaded, load and start audio buffer
    request.onload = this.handleAudioRequest.bind(this, this.audio[0], request);
    request.send();
};

Game.prototype.initWebAudio = function() {

    if (typeof AudioContext !== "undefined") this.web_audio = new AudioContext();
    else if (typeof webkitAudioContext !== "undefined") this.web_audio = new webkitAudioContext();
    else throw new Error('Use a browser that supports AudioContext for music.');

    this.analyser = this.web_audio.createAnalyser();
    this.analyser.fftSize = 32;
    this.analyser.connect(this.web_audio.destination);

    this.audio = [{}];
};
