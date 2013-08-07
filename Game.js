/**
 * Creates and initializes a game.
 */
function Game(gl_) {

    // The Singleton was already created previously,
    //  but it needs an up-to-date Game reference.
    var config = GameConfig(this);

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

    var thah = [];

    config.initAudio(audio);

    this.matrix = theCanvas.matrix;

    // handles movement
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

    config.initMisc(); // this.grid and viewing translation

    this.floor = [];
    config.initPiece(this.floor, "piece-0");
    // new shader effect
    this.floor_effect = 0;

    this.push_button = [];
    config.initPiece(this.push_button, "piece-1");
    this.push_button[1].magical = true;

    // Placeholder for 3d blocks -- MST
    this.three_dee = [];

    // Map uniforms ourself
    GLobject.draw_optimized = true;

    var wh = 1200;
    var l2= -20;
    this.background = new Quad([-wh, wh, l2],
			       [-wh,-wh, l2],
			       [ wh, wh, l2],
			       [ wh,-wh, l2])
	.setTexture(HEAVEN_TEXTURE)
	.setShader(theCanvas.gl.shader_canvas);


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
	if(x_ < this.cam_movement[0] - 400) this.startCameraLeftMove();
	else if(x_ > this.cam_movement[0] + 400) this.startCameraRightMove();

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
