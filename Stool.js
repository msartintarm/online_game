const base_leg_distance = (19.625/2)/6;
const base_leg_width = (0.6/6);
const min_stool_height = 24.75/6;
const tilt = -min_stool_height*Math.sin(15*(Math.PI/180));
const seat_radius = (11.75/2)/60;
var colorVec;

function Stool() { 
    this.objs = [];
    var x_ = base_leg_width;
    var y_ = min_stool_height;
    var z_offset = base_leg_distance;
    var z_ = base_leg_width;
    var a_ = vec3.fromValues( x_,  y_, -z_ + z_offset + tilt);
    var b_ = vec3.fromValues( x_,   0, -z_ + z_offset);
    var c_ = vec3.fromValues( x_,   0,  z_ + z_offset);
    var d_ = vec3.fromValues( x_,  y_,  z_ + z_offset + tilt);
    var e_ = vec3.fromValues(-x_,  y_, -z_ + z_offset + tilt);
    var f_ = vec3.fromValues(-x_,   0, -z_ + z_offset);
    var g_ = vec3.fromValues(-x_,   0,  z_ + z_offset);
    var h_ = vec3.fromValues(-x_,  y_,  z_ + z_offset + tilt);

    this.stoolLeg = this.Prism(a_, b_, c_, d_, e_, f_, g_, h_);

    this.disk1t = this.Disk(0.01,0.047,30,30);
    this.cylinder1 = this.Cyl(0.047,0.05,0.015,30,30);
    this.disk1b = this.Disk(0.015,0.05,30,30);
    //    this.disk1b.invert();
    colorVec = vec3.fromValues(0.5, 0, 0);
    this.cylinder2 = this.Cyl(0.015,0.015,0.06,30,120); 
    this.cylinder2.drawScrew();
    vec3.set(colorVec, 0.0, 0.5, 0.5);
    this.disk3t = this.Disk(0.015,0.065,30,30);
    this.cylinder3 = this.Cyl(0.065,0.070,0.015,30,30);
    this.disk3b = this.Disk(0.015,0.070,30,30);
    //    this.disk3b.invert();
    this.torus1 = this.Torus(0.008,0.115);

    //moving parts
    vec3.set(colorVec, 0.25, 0, 0.5);
    this.disk4 = this.Disk(0,seat_radius,30,30); 
    this.cylinder4 = this.Cyl(seat_radius,seat_radius,0.005,30,30);
    this.cylinder5 = this.Cyl(seat_radius,seat_radius/2,0.0075,30,30);

    vec3.set(colorVec, 0.5, 0.5, 0.5);
    this.cylinder6 = this.Cyl(seat_radius/2,seat_radius/4,0.0015,30,30);
    this.cylinder6.invertNorms();
    vec3.set(colorVec, 0, 0.5, 0.5);
    this.cylinder7 = this.Cyl(seat_radius/4,0.01,0.006,30,30);
    vec3.set(colorVec, 0, 0, 0.5);
    this.cylinder8 = this.Cyl(0.01,0.01,0.16,30,30);
    vec3.set(colorVec, 0.5, 0.5, 0.5);
    this.disk5 = this.Disk(0,0.003,30,30);

    return this;
}

Stool.prototype.Prism = _Prism;
Stool.prototype.Disk = _Disk;
Stool.prototype.Cyl = _Cyl;
Stool.prototype.Torus = _Torus;
Stool.prototype.setShader = _objsSetShader;
Stool.prototype.initBuffers = _objsInitBuffers;

Stool.prototype.draw = function(gl_) {
    seat_height = 2;
    var seat_location = min_stool_height + 12*(seat_height/60)+12*0.02;

    //draws the legs of the stool
    for (var i = 0; i < 4; ++i) {
	theMatrix.rotate(Math.PI/2, [0, 1.0, 0]);
	this.stoolLeg.draw(gl_);
    }
    
    //draw first fat cylinder
    theMatrix.push();
    theMatrix.translate([0,min_stool_height,0]);
    theMatrix.scale([12,12,12]);    
    theMatrix.rotate(Math.PI/2, [1, 0, 0]);

    this.disk1t.draw(gl_);
    this.cylinder1.draw(gl_);
    theMatrix.translate([0,0,0.015]);
    this.disk1b.draw(gl_);

    //draw long cylinder between two fats
    this.cylinder2.draw(gl_);

    //draw bottom fat cylinder
    theMatrix.translate([0,0,0.06]);
    this.disk3t.draw(gl_);
    this.cylinder3.draw(gl_);
    theMatrix.translate([0,0,0.015]);
    this.disk3b.draw(gl_);

    //draw torus
    theMatrix.translate([0,0,0.2]);
    theMatrix.rotate(-Math.PI/2, [1, 0, 0]);
    this.torus1.draw(gl_);

    theMatrix.pop();

    //moving parts
    theMatrix.push();
    theMatrix.translate([0,seat_location,0]);
    theMatrix.rotate((seat_height/4.375)*100*Math.PI, [0, 1, 0]);
    theMatrix.rotate(Math.PI/2, [1, 0, 0]);
    theMatrix.scale([12,12,12]); 
    this.disk4.draw(gl_);
    this.cylinder4.draw(gl_);

    theMatrix.translate([0,0,0.005]);
    this.cylinder5.draw(gl_);
    theMatrix.translate([0,0,0.0075]);
    this.cylinder6.draw(gl_);
    theMatrix.translate([0,0,0.0015]);
    this.cylinder7.draw(gl_);
    theMatrix.translate([0,0,0.006]);
    this.cylinder8.draw(gl_);

    theMatrix.pop();
    
};
