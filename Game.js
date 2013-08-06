/**
 * Creates and initializes a game.
 */
function Game(gl_) {

    var config = new GameConfig(this);

    // Used in collision detection.
    var WALL_NONE = 0;
    var WALL_N = 1;
    var WALL_S = 2;
    var WALL_W = 3;
    var WALL_E = 4;

    var s = true;

    GLtexture.create(gl_, BRICK_NORMAL_TEXTURE);
    GLtexture.create(gl_, HEAVEN_NORMAL_TEXTURE);

    var audio = new GLaudio();
    var player = new Player(gl_, 50);

    // createAudio(origin URL, destination node, loop[, loop offset, loop time])
    // These are at 120 BPM: 1 sec = 2 beats
    // 0. Low-pass input detects movement, occuring on the half-beat; slightly below 0.25s
    // 1. Non-looping sound, which will be triggered by the above sample
    // 2. Non-looping sound, which will be triggered by the above sample
    // 3. Rest of the song.

    config.initAudio(audio);
//    audio.createAudio("music/beats.mp3", audio.low_pass, true, 1, 8);
//    audio.createAudio("music/Game_Hi Hat_2.wav", audio.web_audio.destination, false);
//    audio.createAudio("music/Game_keys_2.wav", audio.web_audio.destination, false);
//    audio.createAudio("music/backing_beat.wav", audio.delay, true, 0, 8);


    // handles movement
    this.grid = 50;
    this.bg_movement = vec3.create();
    this.cam_movement = vec3.create();
    this.cam_left_count = 0;
    this.cam_right_count = 0;
    this.cam_in_left_move = false;
    this.cam_in_right_move = false;
    this.in_change = false;
    this.change_x = [];

    this.hi_hat = 0;

    // Jump distance is a vector of linear X values
    // When we increment y-pos by these array values, the effect is a parabolic jump

    // new shader effect
    this.floor_effect = 0;

    var floor_width = this.grid;
    this.floor = [];
    this.push_button = [];
    this.three_dee = [];

    // Map uniforms ourself
    GLobject.draw_optimized = true;

    theCanvas.matrix.vTranslate([0,300,750]);

    this.wallPiece = (function(arr) {

    var w = floor_width;
    var h = floor_width;

	return function(x,y) {
	    var x2 = x * w;
	    var y2 = y * h;
	    arr.push(new Quad([x2-w,y2+h,l],
			      [x2-w,  y2,l],
			      [x2+w,y2+h,l],
			      [x2+w,  y2,l])
		     .setTexture(BRICK_TEXTURE).add2DCoords());
	};
    }(this.push_button));


    var wh = 1200;
    var l2= -20;
    this.background = new Quad([-wh, wh, l2],
			       [-wh,-wh, l2],
			       [ wh, wh, l2],
			       [ wh,-wh, l2])
	.setTexture(HEAVEN_TEXTURE)
	.setShader(theCanvas.gl.shader_canvas);

    for(var i=-11; i<=10; ++i) {
	var w_ = floor_width, h_ = -3 * floor_width, l_ = -1;
	this.floor.push(new Quad(
	    [-w_,  0, l_],
	    [-w_, h_, l_],
	    [ w_,  0, l_],
	    [ w_, h_, l_])
			.translate([i * 2 * w_, 0, 40])
			.setTexture(RUG_TEXTURE)
			.add2DCoords());
	this.three_dee.push(new SixSidedPrism(
	    [-w_,  0, l_],
	    [-w_, h_, l_],
	    [ w_, h_, l_],
	    [ w_,  0, l_],
	    [-w_,  0, l_ - floor_width],
	    [-w_, h_, l_ - floor_width],
	    [ w_, h_, l_ - floor_width],
	    [ w_,  0, l_ - floor_width])
			.translate([i * 2.0 * w_, 0, 40])
			.setTexture(RUG_TEXTURE));
	if(i === -11) { this.floor[0].translate([-12 * w_, 0, 0]).add2DCoords();
			this.three_dee[0].translate([-12 * w_, 0, 0]); }
    }

    l = -1;
    var v = 3;
    var d = 12;
    this.wallPiece(d,v);
    v += 1;
    d += 2;
    this.wallPiece(d,v);
    this.push_button[1].magical = true;
    d += 2;
    v += 1;
    this.wallPiece(d,v);
    d += 2;
    v += 1;
    this.wallPiece(d,v);
    d += 2;
    v += 1;
    this.wallPiece(d,v);

    d += 1;
    for(var j = 5; j < 16; ++j) {
	d += 2;
	this.wallPiece(d,v);
    }
    v -= 2;
    d += 4;
    for(var j = 16; j < 19; ++j) {
	d -= 2;
	this.wallPiece(d,v);
    }
    v += 2;
    d -= 4;
    for(var j = 19; j < 22; ++j) {
	d += 2;
	this.wallPiece(d,v);
    }
    v -= 2;
    d += 4;
    for(var j = 22; j < 25; ++j) {
	d -= 2;
	this.wallPiece(d,v);
    }
    v += 2;
    d -= 4;
    for(var j = 25; j < 28; ++j) {
	d += 2;
	this.wallPiece(d,v);
    }

    this.initBuffers = function(gl_) {


	player.initBuffers(gl_);
	this.background.initBuffers(gl_);

	this.floor.forEach(function(flo) { flo.initBuffers(gl_); });
	this.push_button.forEach(function(but) { but.initBuffers(gl_); });
	this.three_dee.forEach(function(cube) { cube.initBuffers(gl_); });
    };

    this.draw = function(gl_) {

	if (audio.analyze() === true) this.hi_hat = 11;
	else if (this.hi_hat > 0) this.hi_hat -= 1;

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
	gl_.uniform1f(unis["hi_hat_u"], this.hi_hat);
	gl_.uniform1f(unis["wall_hit_u"], this.floor_effect);
	gl_.uniform3fv(unis["lightPosU"], [200, 200, -400]);
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

	player.draw(gl_, this.hi_hat);

	theMatrix.push();
	theMatrix.translate(this.bg_movement);

	theCanvas.changeShader(gl_.shader_canvas);
	theMatrix.setVertexUniforms(gl_.shader_canvas);
	gl_.uniform1i(gl_.shader_canvas.unis["sampler1"], gl_.tex_enum[HEAVEN_NORMAL_TEXTURE]);

	this.background.draw(gl_);
	theMatrix.pop();


    };


    this.startCameraLeftMove = function() {

	if (this.cam_in_left_move === true || this.cam_in_right_move === true) return;
	this.cam_movement[0] -= (15 * this.grid);
	this.cam_left_count = 30;
	this.cam_in_left_move = true;
    };

    this.startCameraRightMove = function() {

	if (this.cam_in_right_move === true || this.cam_in_left_move === true) return;
	this.cam_movement[0] += (15 * this.grid);
	this.cam_right_count = 30;
	this.cam_in_right_move = true;
    };
    var triggered = false;
    this.updateMovement = function() {

	var x_ = player.xPos();
	// TODO: restore functionality to these functions
	if(player.xPos() < this.cam_movement[0] - 400) this.startCameraLeftMove();
	else if(player.xPos() > this.cam_movement[0] + 400) this.startCameraRightMove();

	// Handle camera natively as it doesn't need much logic.
	if (this.cam_in_right_move === true) {
	    if ((--this.cam_right_count) < 0) this.cam_in_right_move = false;
	    else theMatrix.vTranslate([this.grid * 0.5, 0, 0]);
	}
	if (this.cam_in_left_move === true) {
	    if ((--this.cam_left_count) < 0) this.cam_in_left_move = false;
	    else theMatrix.vTranslate([-this.grid * 0.5, 0, 0]);
	}

	player.updateMovement(this.hi_hat === 10, audio.playSound);

	// Collision. How far should we go to be on grid?
	var i;
	var length1 = this.floor.length;

	for(i = length1 + this.push_button.length - 1; i >= 0; --i) {

	    var object = (i < length1)? this.floor[i]: this.push_button[i - length1];
	    player.detectCollision(object);
	}

	player.movePostCollision();



	if(this.push_button[0].collided === WALL_N) {
	    if(triggered === false)     {
		audio.createAudio("music/Game_bass_2.wav", audio.delay, true, 0, 16);
		triggered = true;
		this.push_button[1].magical = false;
	    }
	    if (this.floor_effect !== 75) this.floor_effect ++;
	    else console.log("Max Power!");
	} else {
	    if (this.floor_effect > 0) this.floor_effect --;
	}

    };

    return this;
}
