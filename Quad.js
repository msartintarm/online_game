/*
a c 
b d
*/
function Quad(a, b, c, d) { 
    this.o = new GLobject();
    this.indexPos = 0;

    this.o.addPosVec(a);
    this.o.addPosVec(b);   
    this.o.addPosVec(c);   
    this.o.addPosVec(d);

    var normalVec = crossVec3(subVec3(b,a), 
			      subVec3(c,a));
    for (var i = 0; i < 4; ++i) {
	this.o.addNormVec(normalVec);
	this.o.addColors(1, 0, 0);
    }

    this.o.addQuadIndexes(
	this.indexPos++,
	this.indexPos++,
	this.indexPos++,
	this.indexPos++);
  
}

Quad.prototype.initTextures = function(at, bt, ct, dt) { 
    this.o.addTexture(at.x, at.y);
    this.o.addTexture(bt.x, bt.y);
    this.o.addTexture(ct.x, ct.y); 
    this.o.addTexture(dt.x, dt.y);
}

Quad.prototype.initBuffers = function(gl_) {
    this.o.initBuffers(gl_);
};

Quad.prototype.draw = function(gl_, buffers_) {
    this.o.drawBuffers(gl_, buffers_);
};
