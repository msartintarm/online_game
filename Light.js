define("Light", ["Sphere"], function() {

function Light() {
    colorVec = [0,0,0];
    if(!stadiumMode)
	this.o = new Sphere(-0.05)
	.translate(lightPos);
    else
	this.o = new Sphere(-0.05)
	.translate(lightPos);
}

Light.prototype.initBuffers = function(gl_) {
    this.o.initBuffers(gl_);
}

Light.prototype.draw = function(gl_) {
    theMatrix.push();
    theMatrix.mul(theMatrix.vMatrix);
    theMatrix.mul(theMatrix.lightMatrix);
    this.o.draw(gl_);
    theMatrix.pop();
}

});
