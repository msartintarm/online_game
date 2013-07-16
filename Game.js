Game.grid = 50;

function Game() {  

    moveDist = 100.1;
    lookDist = 1/15;

    this.hit_sound = [];
    
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

    var player_width = Game.grid;
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

    Game.loadAudio("music/elements.mp3");
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
    theMatrix.translate(Game.movement);
    this.player.draw(gl_);
    theMatrix.pop();
    this.background.draw(gl_);
    var i;
    for(i = 0; i < this.floor.length; ++i){
	this.floor[i].draw(gl_);
    }
};

Game.movement = vec3.create();

Game.prototype.mapKeys = function() {

    document.onkeydown = function(the_event) {

	switch(the_event.keyCode) {
	case 39: // ->
	    Game.movement[0] += Game.grid;
	    break;
	case 37: // left
	    Game.movement[0] -= Game.grid;
	    break;
	case 38: // up
	    break;
	case 40: // down
	    break;
	case 32: // Spacebar
	    if(theCanvas.audio.playing) {
		console.log(theCanvas.audio.time);
		theCanvas.audio.offset += theCanvas.audio.currentTime - 
		    theCanvas.audio.time;
		console.log("Playing for " + theCanvas.audio.offset + 
			    " seconds.");
		theCanvas.audio_source.stop(0);
	    } else {
		// Load start time from offset.
		theCanvas.audio_source = theCanvas.audio.createBufferSource();
		theCanvas.audio_source.buffer = Game.audio_buffer;
		theCanvas.audio_source.connect(theCanvas.audio.destination);
		console.log("Starting after " + theCanvas.audio.offset + 
			    " seconds.");
		theCanvas.audio_source.start(0, theCanvas.audio.offset);
		theCanvas.audio.time = theCanvas.audio.currentTime;
	    }
	    theCanvas.audio.playing = !theCanvas.audio.playing;
	    break;
	default:
	    break;
	}
    };
};

/**
 * This code is written from scratch, using the following as a ref:
 * http://chromium.googlecode.com/svn/trunk/samples/audio/index.html
*/
Game.loadAudio = function(url) {

    if(!theCanvas.audio) {
	theCanvas.audio = new webkitAudioContext();
	theCanvas.analyser = theCanvas.audio.createAnalyser();
	theCanvas.analyser.fftSize = 2048;

	theCanvas.audio_source = theCanvas.audio.createBufferSource();
	theCanvas.audio_source.connect(theCanvas.analyser);
	theCanvas.analyser.connect(theCanvas.audio.destination);
    }


    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer"; // I'm assuming this is MIME

    theCanvas.audio_time = 0;

    request.onload = function() {
	theCanvas.audio.decodeAudioData(
	    request.response,
	    function(the_buffer) {
		Game.audio_buffer = the_buffer;
		theCanvas.audio_source.buffer = Game.audio_buffer;
		// Save initial time we start audio, so we can pause / play.
		theCanvas.audio.time = theCanvas.audio.currentTime;
		theCanvas.audio.offset = 0;
		theCanvas.audio.playing = true;
		theCanvas.audio_source.start(0,0);
	    }
	);
    };
    request.send();
};
