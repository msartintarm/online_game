define("Torus", ["GLobject"], function() {

function Torus(innerRadius, outerRadius) { 

    var slices = 50;
    var stacks = 50;

    this.o = new GLobject();

    for (var i = 0; i <= slices; i++) {
	// From 0 to 2pi
	var theta = i * 2 / slices * Math.PI;
	var sin_theta = Math.sin(theta);
	var y = Math.cos(theta);
	for (var j = 0; j <= stacks; j++) {
	    // From 0 to 2 pi
	    var phi = j * 2 / stacks * Math.PI;
	    var cos_phi = Math.cos(phi);
	    var sin_phi = Math.sin(phi);
	    // x = r sin theta cos phi
	    var x = sin_theta * cos_phi;
	    var z = sin_theta * sin_phi;

	    // Normals: similar to the sphere
	    this.o.addNorms(x, y, z);

	    // Done with normals. 
	    // Now, scale y by the inner disk
	    // And find x / z accordingly
	    var xzPlane = outerRadius + (innerRadius * sin_theta);
	    this.o.addPos(xzPlane * cos_phi, 
			  y * innerRadius, 
			  xzPlane * sin_phi);
	    this.o.addColors(0.4,
			     0.5,
			     0.6);
	}
    }

    // We have the vertices now - stitch them 
    //  into triangles
    // C  D 
    //        Two triangles: ABC and BDC
    // A  B   Longitude lines run through AB and  CD
    //        Array indices of C and D are A / B + 1

    for (i = 0; i < slices; i++) {
	for (j = 0; j < stacks; j++) {
	    var A = (i * (stacks + 1)) + j;
	    var C = A + stacks + 1;
	    this.o.addQuadIndexes(C, A);
	}
    }
    
}

Torus.prototype.setShader = _oSetShader;
Torus.prototype.translate = _oTranslate;
Torus.prototype.initBuffers = _oInitBuffers;
Torus.prototype.draw = _oDraw;

});
