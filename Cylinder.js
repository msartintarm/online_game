function Cylinder(base_radius, top_radius, height, slices, stacks) { 

    var colorVec = vec3.create();;

    this.o = new GLobject();

    this.base_radius = base_radius;
    this.top_radius = top_radius;
    this.height = height;
    this.slices = slices;
    this.stacks = stacks;

    var radius_change = top_radius - base_radius;
    var radius_step_size = radius_change/stacks;
    var radius = base_radius;

    var theta = Math.atan((base_radius-top_radius)/height);
    var z_norm = Math.sin(theta);
    var xy =  Math.cos(theta);
    
    var nData = this.o.data["norm"];
    var pData = this.o.data["pos"];
    var cData = this.o.data["col"];

    for (var i = 0; i <= stacks; i++) {
	// From 0 to height
	var z = (i/stacks)*height;
	if(i!=0) radius += radius_step_size;

	for (var j = 0; j <= slices; j++) {
	    // From 0 to 2 pi
	    var phi = j / (slices/2) * Math.PI;
	    // x = r sin theta cos phi
	    var x = 1 * Math.cos(phi);
	    var y = 1 * Math.sin(phi);

	    var x_norm = x*xy;
	    var y_norm = y*xy
	    // z norm = sin theta


	    nData.push(x_norm);
	    nData.push(y_norm);
	    nData.push(z_norm);

	    pData.push(radius * x);
	    pData.push(radius * y);
	    pData.push(z);

	    cData.push(colorVec[2]);
	    cData.push(colorVec[1]);
	    cData.push(colorVec[0]);

	}
    }

    // We have the vertices now - stitch them 
    //  into triangles
    // A  C 
    //        Two triangles: ABC and BDC
    // B  D   Longitude lines run through AB and  CD
    //        Array indices of C and D are A / B + 1

    var index_uses = [];
    var cData = this.o.data["col"];
    var iData = this.o.data["index"];

    for (var i = 0; i < this.stacks; i++) {
	for (var j = 0; j < this.slices; j++) {


	    var A = (i * (this.slices + 1)) + j;
	    var B = A + this.slices + 1;
	    var C = A + 1;
	    var D = B + 1;



	    if(!index_uses[A]) { 
		index_uses[A] = 1; index_uses[B] = 1; 
		cData[3*C] = 0;
		cData[3*C+1] = 0.7;
		cData[3*C+2] = 0.7;
		cData[3*D] = 0;
		cData[3*D+1] = 0;
		cData[3*D+2] = 1;
	    } else {
		cData[3*A] = 1;
		cData[3*A+1] = 0;
		cData[3*A+2] = 0;
		cData[3*B] = 0;
		cData[3*B+1] = 1;
		cData[3*B+2] = 0;
		cData[3*C] = 0;
		cData[3*C+1] = 0.7;
		cData[3*C+2] = 0.7;
		cData[3*D] = 0;
		cData[3*D+1] = 0;
		cData[3*D+2] = 1;
	    }

	    iData.push(A);
	    iData.push(B);
	    iData.push(C);
	    iData.push(B);
	    iData.push(D);
	    iData.push(C);
	}
    }
}

Cylinder.prototype.invertNorms = _oInvertNorms;

Cylinder.prototype.wrapText = function() {
    return;
    this.o.setTexture(TEXT_TEXTURE);

    var xPos, yPos;
    for (var latitude = 0; i <= this.stacks; i++) {
	yPos = i / (this.stacks - 1);
	
	for (var j = 0; j <= this.slices; j++) {
	xPos = 10 * (j / (this.slices)) % 1;
	    this.o.addTexture(xPos, yPos);
	}
    }
};

Cylinder.prototype.drawScrew = function() {

    var radius_change = this.top_radius - this.base_radius;
    var radius_step_size = radius_change/this.stacks;
    var radius = this.base_radius;

    var theta = Math.atan(Math.abs(this.top_radius-this.base_radius)/this.height);
    var z_norm = Math.sin(theta);
    var xy =  Math.cos(theta);

    var radius = this.base_radius;

    var index = 0;

    var minAngle = 0;
    var maxAngle = 3 / (this.slices/2) * Math.PI;

    for (var i = 1; i <= this.stacks - 4; i++) {
	// From 0 to height
	var z = (i/this.stacks)*this.height;
	if(i!=0) radius += radius_step_size;

	for (var j = 0; j <= this.slices; j++) {

	    // From 0 to 2 pi
	    var phi = j / (this.slices/2) * Math.PI;
	    // x = r sin theta cos phi

	    if(minAngle < phi && phi < maxAngle) {
		const slicesPlus = this.slices + 1;
	    var x = 1 * Math.cos(phi);
	    var y = 1 * Math.sin(phi);
		this.o.data["pos"][index] /= 0.7;
		this.o.data["pos"][index+1] /= 0.7;
		this.o.data["pos"][index+(3*slicesPlus)] *= 0.7;
		this.o.data["pos"][index+1+(3*slicesPlus)] *= 0.7;
		this.o.data["pos"][index-(3*slicesPlus)] *= 0.7;
		this.o.data["pos"][index+1-(3*slicesPlus)] *= 0.7;
		this.o.data["col"][index] = 1.0;
		this.o.data["col"][index+1] = 1.0;
		this.o.data["col"][index+2] = 1.0;
	    }

	    index += 3;
	}
	minAngle += 1 / this.slices * Math.PI * 2;
	maxAngle += 1 / this.slices * Math.PI * 2;
	minAngle %= Math.PI * 2;
	maxAngle %= Math.PI * 2;
    }

};


Cylinder.prototype.wrapTexture = function(the_texture) {

    this.o.setTexture(the_texture);

    var x_, y_;

    for (var i = 0; i <= this.stacks; i++) {
	y_ = i / this.stacks;
	for (var j = 0; j <= this.slices; j++) {
	    x_ = (4 * j / this.stacks) % 1;
	    this.o.data["tex"].push(x_);
	    this.o.data["tex"].push(y_);
	}
    }

};

Cylinder.prototype.initBuffers = _oInitBuffers;
Cylinder.prototype.flip = _oFlip;
Cylinder.prototype.scale = _oScale;
Cylinder.prototype.rotatePos = _oRotatePos;
Cylinder.prototype.rotateNeg = _oRotateNeg;
Cylinder.prototype.setShader = _oSetShader;
Cylinder.prototype.translate = _oTranslate;
Cylinder.prototype.draw = _oDraw;
