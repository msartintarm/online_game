// -- Textures -- // 
const WOOD_TEXTURE = 0;
const HEAVEN_TEXTURE = 1;
const HELL_TEXTURE = 2;
const FLOOR_TEXTURE = 3;
const OPERA_TEXTURE = 4;
const BRICK_TEXTURE = 5;
const TILE_TEXTURE = 6;
const NO_TEXTURE = 7;
const SKYBOX_TEXTURE_0 = 8;
const SKYBOX_TEXTURE_1 = 9;
const SKYBOX_TEXTURE_2 = 10;
const SKYBOX_TEXTURE_3 = 11;
const SKYBOX_TEXTURE_4 = 12;
const SKYBOX_TEXTURE_5 = 13;
const RUG_TEXTURE = 14;
const SKYBOX_TEXTURE_REAL = 15;
// -- Framebuffer -- // 
const FRAME_BUFF = 16;
const TEXT_TEXTURE = 17;
const TEXT_TEXTURE2 = 18;
const TEXT_TEXTURE3 = 19;
const TEXT_TEXTURE4 = 20;
const BRICK_NORMAL_TEXTURE = 21;
const HEAVEN_NORMAL_TEXTURE = 22;

// -- Maze Piece wall locations -- //
const FRONT = 0x1; // 0001
const BACK = 0x2; // 0010
const RIGHT = 0x4; // 0100
const LEFT = 0x8; // 1000

const NO_FRONT = BACK | RIGHT | LEFT;
const NO_LEFT = BACK | RIGHT | FRONT;
const BACK_LEFT = BACK | LEFT;
const NO_WALLS = 0x0;
const FRONT_BACK = FRONT | BACK;
const FRONT_RIGHT = RIGHT | FRONT;
const BACK_RIGHT = RIGHT | BACK;
const LEFT_RIGHT = RIGHT | LEFT;
const FRONT_LEFT = FRONT | LEFT;


// -- Environment Variables -- //
const envDEBUG = true;
const envDEBUG_JUMP = true;

//-- Bakk shader variables -- //
//Code for the special ball shader was taken from 
//https://code.google.com/p/html5rocks/source/browse/www.html5rocks.com/content/tutorials/webgl/webgl_fundamentals/static/webgl/webgl-2d-image-3x3-convolution.html?r=daa158f1e6a08e0c889ca9ceb09f77c57420740c
var ball_shader_selectG = 19;
var kNameG = new Array(
	'normal',
	'gaussianBlur',
	'gaussianBlur2',
	'gaussianBlur3',
	'unsharpen',
	'sharpness',
	'sharpen',
	'edgeDetect',
	'edgeDetect2',
	'edgeDetect3',
	'edgeDetect4',
	'edgeDetect5',
	'edgeDetect6',
	'sobelHorizontal',
	'sobelVertical',
	'previtHorizontal',
	'previtVertical',
	'boxBlur',
	'triangleBlur',
	'emboss'
    );	
  var kernelsG = {
	normal: [
	    0, 0, 0,
	    0, 1, 0,
	    0, 0, 0
	],
	gaussianBlur: [
	    0.045, 0.122, 0.045,
	    0.122, 0.332, 0.122,
	    0.045, 0.122, 0.045
	],
	gaussianBlur2: [
	    .01, 0, 0,
	    0, 0, 0,
	    0.01, 0, 0
	],
	gaussianBlur3: [
	    2, 2, 2,
	    2, 0, 2,
	    2, 2, 2
	],
	unsharpen: [
		-1, -1, -1,
		-1,  9, -1,
		-1, -1, -1
	],
	sharpness: [
	    0,-1, 0,
		-1, 5,-1,
	    0,-1, 0
	],
	sharpen: [
		-1, -1, -1,
		-1, 16, -1,
		-1, -1, -1
	],
	edgeDetect: [
		-0.125, -0.125, -0.125,
		-0.125,  1,     -0.125,
		-0.125, -0.125, -0.125
	],
	edgeDetect2: [
		-1, -1, -1,
		-1,  8, -1,
		-1, -1, -1
	],
	edgeDetect3: [
		-5, 0, 0,
            0, 0, 0,
            0, 0, 5
	],
	edgeDetect4: [
		-1, -1, -1,
            0,  0,  0,
            1,  1,  1
	],
	edgeDetect5: [
		-1, -1, -1,
            2,  2,  2,
		-1, -1, -1
	],
	edgeDetect6: [
		-5, -5, -5,
		-5, 39, -5,
		-5, -5, -5
	],
	sobelHorizontal: [
            1,  2,  1,
            0,  0,  0,
		-1, -2, -1
	],
	sobelVertical: [
            1,  0, -1,
            2,  0, -2,
            1,  0, -1
	],
	previtHorizontal: [
            1,  1,  1,
            0,  0,  0,
		-1, -1, -1
	],
	previtVertical: [
            1,  0, -1,
            1,  0, -1,
            1,  0, -1
	],
	boxBlur: [
            0.111, 0.111, 0.111,
            0.111, 0.111, 0.111,
            0.111, 0.111, 0.111
	],
	triangleBlur: [
            0.0625, 0.125, 0.0625,
            0.125,  0.25,  0.125,
            0.0625, 0.125, 0.0625
	],
	emboss: [
            -2, -1,  0,
	    -1,  1,  1,
            0,  1,  2
    ]
};
