define("Skybox", ["SixSidedPrism"], function() {

/**
 *  This is an enormous cube, and the viewer
 *  resides in the interior.
 */
function Skybox() { 
    
    // First, create an enormous cube
    const size = 100000;
    this.o = new SixSidedPrism(
	[-size, size, size],
	[-size,-size, size],
	[ size,-size, size],
	[ size, size, size],
	[-size, size,-size],
	[-size,-size,-size],
	[ size,-size,-size],
	[ size, size,-size]).setSkyBoxTexture(SKYBOX_TEXTURE_REAL);
}

Skybox.prototype.initBuffers = _oInitBuffers;
Skybox.prototype.draw = _oDraw;

});
