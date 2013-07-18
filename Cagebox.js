define("Cagebox", ["SixSidedPrism"], function() {

/**
 *  This is an enormous cube, and the viewer
 *  resides in the interior.
 */
function Cagebox() { 
    
    // First, create an enormous cube
    const size = 500;
    this.o = new SixSidedPrism(
	[-size, size, size],
	[-size,-size, size],
	[ size,-size, size],
	[ size, size, size],
	[-size, size,-size],
	[-size,-size,-size],
	[ size,-size,-size],
	[ size, size,-size])
    // Next, set it to 6 images of Nicolas Cage's face
	.setSixTextures(
	    SKYBOX_TEXTURE_1,
	    SKYBOX_TEXTURE_2,
	    SKYBOX_TEXTURE_3,
	    SKYBOX_TEXTURE_4,
	    SKYBOX_TEXTURE_5,
	    SKYBOX_TEXTURE_0);
}

Cagebox.prototype.initBuffers = _oInitBuffers;
Cagebox.prototype.draw = _oDraw;

});
