define("StoolPyramid", ["Stool", "Quad"], function() {

function StoolPyramid() { 
    this.objs = [];
    this.sp = new Stool();
    colorVec = [1,0,0];
    this.disk = new Disk(1, 2, 30, 30);
    this.sphere = new Sphere(2);
    this.cylinder = new Cylinder(1,2,3,150,150);
    this.torus = new Torus(0.2,2);

    a = vec3.fromValues(-15, 0, 5);
    b = vec3.fromValues(-15, 0,-25);
    c = vec3.fromValues( 15, 0, 5);
    d = vec3.fromValues( 15, 0,-25);
    this.floor = new Quad(a,b,c,d);
    this.floor.setTexture(RUG_TEXTURE);

    this.objs.push(this.sp);
    this.objs.push(this.disk);
    this.objs.push(this.sphere);
    this.objs.push(this.cylinder);
    this.objs.push(this.torus);
    this.objs.push(this.floor);

    //will set the value to rotate
    rotateY.setInc(6);
}

//StoolPyramid.prototype.Stool = _Stool;
StoolPyramid.prototype.initBuffers = _objsInitBuffers;

const d_ = 2.75; // Arbitrary const denoting dist betwen chairs

StoolPyramid.prototype.draw = function(gl_) {

    var seat_location = min_stool_height + 12*(stoolHeight.val/60)+12*0.02;
    if(rotateY.val > 180){
	stoolHeight.setStoolHeight(-0.2);
    }
    else stoolHeight.setStoolHeight(0.2);

    var r2 = Math.sqrt(2);

    //place other objects
    theMatrix.push();
    theMatrix.translate([40,2,-100]);
    theMatrix.rotate(rotateY.val*Math.PI/180, [r2,r2,0]);
    this.disk.draw(gl_);
  
    theMatrix.translate([0,0,-0.001]);
    theMatrix.rotate(Math.PI,[0,1,0]);
    this.disk.draw(gl_);
    theMatrix.pop();

    theMatrix.push();
    theMatrix.translate([80,2,-100]);
    theMatrix.rotate(rotateY.val*Math.PI/180, [r2,r2,0]);
    this.sphere.draw(gl_);
    theMatrix.pop();

    theMatrix.push();
    theMatrix.translate([80,3,-80]);
    theMatrix.rotate(rotateY.val*Math.PI/180, [r2,r2,0]);
    this.torus.draw(gl_);
    theMatrix.pop();

    theMatrix.push();
    theMatrix.translate([40,4,-20]);
    theMatrix.rotate(rotateY.val*Math.PI/180, [r2,r2,0]);
    this.cylinder.draw(gl_);
    theMatrix.pop();

    //place stool pyramid
    theMatrix.push();
    theMatrix.translate([-40,0,-110]);
    this.floor.draw(gl_);
    for(var i = 5; i > 0; --i) {
	theMatrix.push();
	this.drawBase(gl_, i);
	theMatrix.pop();
	theMatrix.translate([0, seat_location, -d_]);
    }
    theMatrix.pop();
};

StoolPyramid.prototype.drawBase = function(gl_, size) {

    for(var i = 0; i < size; ++i) {
	for(var j = 0; j < size - 1; ++j) {
	    this.sp.draw(gl_);
	    theMatrix.translate([-d_, 0, -d_]);
	}
	this.sp.draw(gl_);
	theMatrix.translate([(size) * d_, 0,
			     (size - 2) * d_]);
    }
};

});
