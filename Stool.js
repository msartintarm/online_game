const base_leg_distance = (19.625/2)/6;
const base_leg_width = (0.6/6);
const min_stool_height = 24.75/6;
const tilt = -min_stool_height*Math.sin(15*(Math.PI/180));
const seat_radius = (11.75/2)/60
var colorVec;

function Stool() { 
    var x_ = base_leg_width;
    var y_ = min_stool_height;
    var z_offset = base_leg_distance;
    var z_ = base_leg_width;
    this.stoolLeg = new SixSidedPrism(
	  new vec3( x_,  y_,  z_ + z_offset + tilt),
	  new vec3( x_,   0,  z_ + z_offset),
	  new vec3( x_,   0, -z_ + z_offset),
	  new vec3( x_,  y_, -z_ + z_offset + tilt),
	  new vec3(-x_,  y_,  z_ + z_offset + tilt),
	  new vec3(-x_,   0,  z_ + z_offset),
	  new vec3(-x_,   0, -z_ + z_offset),
	  new vec3(-x_,  y_, -z_ + z_offset + tilt)
    );

    this.disk1t = new Disk(0.01,0.047,30,30);
    this.cylinder1 = new Cylinder(0.047,0.05,0.015,30,30);
    this.disk1b = new Disk(0.015,0.05,30,30);
    this.disk1b.invert();
    colorVec = [0.5,0,0];
    this.cylinder2 = new Cylinder(0.015,0.015,0.06,30,300); 

    colorVec = [0,0.5,0.5];
    this.disk3t = new Disk(0.015,0.065,30,30);
    this.cylinder3 = new Cylinder(0.065,0.070,0.015,30,30);
    this.disk3b = new Disk(0.015,0.070,30,30);
    this.disk3b.invert();
    this.torus1 = new Torus(0.008,0.115);

    //moving parts
    colorVec = [0.25,0,.5];
    this.disk4 = new Disk(0,seat_radius,30,30); 
    this.cylinder4 = new Cylinder(seat_radius,seat_radius,0.005,30,30);
    this.cylinder5 = new Cylinder(seat_radius,seat_radius/2,0.0075,30,30);
    this.cylinder5.invertNorms();

    colorVec = [.5,.5,.5];
    this.cylinder6 = new Cylinder(seat_radius/2,seat_radius/4,0.0015,30,30);
    this.cylinder6.invertNorms();
    colorVec = [0,.5,.5];
    this.cylinder7 = new Cylinder(seat_radius/4,0.01,0.006,30,30);
    colorVec = [0,0,.5];
    this.cylinder8 = new Cylinder(0.01,0.01,0.16,30,30);
    colorVec = [.5,.5,.5];
    this.disk5 = new Disk(0,0.003,30,30);
}

Stool.prototype.initBuffers = function(gl_) {
    this.stoolLeg.initBuffers(gl_);
    this.disk1t.initBuffers(gl_);
    this.cylinder1.initBuffers(gl_);
    this.disk1b.initBuffers(gl_);

    this.cylinder2.initBuffers(gl_);
    this.cylinder2.drawScrew(gl_);

    this.disk3t.initBuffers(gl_);
    this.cylinder3.initBuffers(gl_);
    this.disk3b.initBuffers(gl_);
    this.torus1.initBuffers(gl_);
    this.disk4.initBuffers(gl_);
    this.cylinder4.initBuffers(gl_);
    this.cylinder5.initBuffers(gl_);
    this.cylinder6.initBuffers(gl_);
    this.cylinder7.initBuffers(gl_);
    this.cylinder8.initBuffers(gl_);
    this.disk5.initBuffers(gl_);
}

Stool.prototype.draw = function(gl_, buffer_) {

    //draws the legs of the stool
    for (var i = 0; i < 4; ++i) {
	theMatrix.rotate(Math.PI/2, [0, 1.0, 0]);
	this.stoolLeg.draw(gl_, buffer_);
    }
    
    //draw first fat cylinder
    theMatrix.push();
    theMatrix.translate([0,min_stool_height,0]);
    theMatrix.scale([12,12,12]);    
    theMatrix.rotate(Math.PI/2, [1, 0, 0]);

    this.disk1t.draw(gl_, buffer_);
    this.cylinder1.draw(gl_, buffer_);
    theMatrix.translate([0,0,0.015]);
    this.disk1b.draw(gl_, buffer_);

    //draw long cylinder between two fats
    this.cylinder2.draw(gl_, buffer_);

    //draw bottom fat cylinder
    theMatrix.translate([0,0,0.06]);
    this.disk3t.draw(gl_, buffer_);
    this.cylinder3.draw(gl_, buffer_);
    theMatrix.translate([0,0,0.015]);
    this.disk3b.draw(gl_, buffer_);

    //draw torus
    theMatrix.translate([0,0,0.2]);
    theMatrix.rotate(-Math.PI/2, [1, 0, 0]);
    this.torus1.draw(gl_, buffer_);

    theMatrix.pop();

    //moving parts
    theMatrix.push();
    seat_height = stoolHeight.val;
    var seat_location = min_stool_height + 12*(seat_height/60)+12*0.02;
    theMatrix.translate([0,seat_location,0]);
    theMatrix.rotate((seat_height/4.375)*100*Math.PI, [0, 1, 0]);
    theMatrix.rotate(Math.PI/2, [1, 0, 0]);
    theMatrix.scale([12,12,12]); 
    this.disk4.draw(gl_, buffer_);
    this.cylinder4.draw(gl_, buffer_);

    theMatrix.translate([0,0,0.005]);
    this.cylinder5.draw(gl_, buffer_);
    theMatrix.translate([0,0,0.0075]);
    this.cylinder6.draw(gl_, buffer_);
    theMatrix.translate([0,0,0.0015]);
    this.cylinder7.draw(gl_, buffer_);
    theMatrix.translate([0,0,0.006]);
    this.cylinder8.draw(gl_, buffer_);

    theMatrix.rotate(-Math.PI/2, [1, 0, 0]);
    theMatrix.translate([0,-0.13,0]);
//    var copy = mat4.create();
//    mat4.set(mvMatrix,copy);
    for(var i=0;i<0.12;i=i+0.0001){
//	mat4.set(copy,mvMatrix);
//	theMatrix.translate([0, .0001, 0]);
//	theMatrix.rotate(1, [0, 1/16 * Math.PI, 0]);
//	theMatrix.translate([0, 0, 0.011]);
//	this.disk5.draw();
	}
    theMatrix.pop();
    
}
