
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

    var player_width = 50;
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
			.translate([i * floor_width, 0, 0])
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

    this.player.draw(gl_);
    this.background.draw(gl_);
    var i;
    for(i = 0; i < this.floor.length; ++i){
	this.floor[i].draw(gl_);
    }
};
