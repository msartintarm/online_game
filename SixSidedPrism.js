define("SixSidedPrism", ["Quad"], function() {

/**
   Front face (facing X):    Back face (facing X):
    AD                        EH
    BC         E----H         FG
              /|   /|
             A----D |           
             | F -|-G          
             |/   |/            
             B----C             

    Start with 4 most positive X coords.
    Negative Z first two, negative Y second and third.
 */
function SixSidedPrism(a, b, c, d, e, f, g, h) { 
    this.objs = [];

    // Front and back faces.
    this.q1 = this.Quad(a,b,d,c);
    this.q2 = this.Quad(h,g,e,f);

    // Side faces.
    this.q3 = this.Quad(d,c,h,g);
    this.q4 = this.Quad(e,f,a,b);

    // Top and bottom faces.
    this.q5 = this.Quad(c,b,g,f);
    this.q6 = this.Quad(h,e,d,a);
    return this;
};

/**
   Returns a SixSidedPrism with equivalent front / back faces
*/
SixSidedPrism.rectangle = function(a, b, c, d, width) {

    var e = vec3.clone(a);
    var f = vec3.clone(b);
    var g = vec3.clone(c);
    var h = vec3.clone(d);
    var temp1 = vec3.create();
    var temp2 = vec3.create();
    var backV = vec3.create();

    // Must compute the vector for the back face (e-h). It will
    //  be going in the opposite direction of the normal vector.
    vec3.cross(backV, vec3.sub(temp2,c,a), vec3.sub(temp1,b,a));
    vec3.normalize(backV, backV);
    vec3.scale(backV, backV, -width);

    vec3.add(e, e, backV);
    vec3.add(f, f, backV);
    vec3.add(g, g, backV);
    vec3.add(h, h, backV);

    return new SixSidedPrism(a, b, c, d, e, f, g, h);
}	

SixSidedPrism.prototype.Quad = _Quad;
SixSidedPrism.prototype.scale = _objsScale;
SixSidedPrism.prototype.setShader = _objsSetShader;
SixSidedPrism.prototype.translate = _objsTranslate;

SixSidedPrism.prototype.setTexture = function(texture) {
    for(var i = 0; i < this.objs.length; ++i) {
	this.objs[i].setTexture(texture);
    }
    return this;
}

SixSidedPrism.prototype.setSixTextures = function(a,b,c,d,e,f) {
    this.q1.setTexture(a);
    this.q2.setTexture(b);
    this.q3.setTexture(c);
    this.q4.setTexture(d);
    this.q5.setTexture(e);
    this.q6.setTexture(f);
    return this;
}

SixSidedPrism.prototype.flipTextures = function() {
    this.q1.flipTexture();
    this.q2.flipTexture();
    this.q3.flipTexture();
    this.q4.flipTexture();
    this.q5.flipTexture();
    this.q6.flipTexture();
    return this;
}

SixSidedPrism.prototype.setSkyBoxTexture = function(texture) {
    this.q1.setSkyTexture(texture, 0);
    this.q2.setSkyTexture(texture, 1);
    this.q3.setSkyTexture(texture, 2);
    this.q4.setSkyTexture(texture, 3);
    this.q5.setSkyTexture(texture, 4);
    this.q6.setSkyTexture(texture, 5);
    return this;
}

SixSidedPrism.prototype.initBuffers = function(gl_) {
    this.q1.initBuffers(gl_);
    this.q2.initBuffers(gl_);
    this.q3.initBuffers(gl_);
    this.q4.initBuffers(gl_);
    this.q5.initBuffers(gl_);
    this.q6.initBuffers(gl_);
};

SixSidedPrism.prototype.draw = function(gl_) {

    this.q1.draw(gl_);
    this.q2.draw(gl_);
    this.q3.draw(gl_);
    this.q4.draw(gl_);
    this.q5.draw(gl_);
    this.q6.draw(gl_);
};

});
