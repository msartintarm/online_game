/**
   A four-screen Jumbotron. Modeled from
   http://upload.wikimedia.org/wikipedia/commons/e/ee/TD_Banknorth_Garden_Jumbotron.jpg

   Distances measured in pixels
*/
function Jumbotron() { 

    // ThickCyl: inner_radius, width, height, slices, stacks
    // 3 Thick Cyls in the Jumbotron

    var radiusA = 773;
    var radiusB = 758;

    var widthA = 34;
    var widthB = 37;
    
    var heightA = 114;
    var heightB = 171;

    var distB = heightA + 106;

    var slices = 30;
    var stacks = 30;

    this.translateVec = [0,0,0];
    this.total_balls = document.getElementById("stadium_balls").value;
    this.balls_hit = document.getElementById("stadium_balls").value;
    this.display = new GLstring("Balls left: " + this.total_balls, 
				TEXT_TEXTURE3);

    this.thickCylA = new ThickCyl(radiusA, widthA, heightA, slices, stacks);
    this.thickCylB = new ThickCyl(radiusB, widthB, heightB, slices, stacks);
    this.thickCylB.translate([0, 0, distB]);
    this.thickCylA.flip();
    this.thickCylB.flip();
    this.thickCylA.rotatePos();
    this.thickCylB.rotatePos();
    this.thickCylA.wrapTexture(TEXT_TEXTURE3, theCanvas.gl.shader_canvas);
    this.thickCylB.wrapTexture(TEXT_TEXTURE3, theCanvas.gl.shader_canvas);

    // RectangularPrism: a, b, c, d, width
    // The Jumbotrons's screen's corners are symmetrical to the center of the plane,
    // and near the second and third ThickCyl.
    var angleA = Math.PI / 32;
    var angleB = (Math.PI / 2) - angleA;
    var angleC = Math.PI / 64;
    var angleD = (Math.PI / 2) - angleC;
    var distScreen = -distB - heightB - 110;
    var heightScreen = 600; // TODO: actually measure (MST)

    var widthScreen = 50;   // TODO: actually measure (MST)

    var a = vec3.create();
    var b = vec3.create();
    var c = vec3.create();
    var d = vec3.create();

    // sin(angleA) = cos(angleB)
    // cos(angleB) = sin(angleA)
    a[0] = Math.cos(angleB) * radiusA;
    a[2] = Math.sin(angleB) * radiusA;
    d[0] = a[2];
    d[2] = a[0];
    a[1] = distScreen;
    d[1] = distScreen;

    b[0] = Math.cos(angleD) * (radiusA - 140);
    b[2] = Math.sin(angleD) * (radiusA - 140);
    c[0] = b[2];
    c[2] = b[0];
    b[1] = distScreen - heightScreen;
    c[1] = distScreen - heightScreen;

    this.frame = new GLframe(FRAME_BUFF);
    this.jumboScreen = new SixSidedPrism.rectangle(a, b, c, d, widthScreen);
    this.jumboScreen.setSixTextures(FRAME_BUFF, FRAME_BUFF, FRAME_BUFF, 
				    FRAME_BUFF, FRAME_BUFF, FRAME_BUFF);
    this.jumboScreen.flipTextures();
//    this.jumboScreen.setShader(theCanvas.gl.shader_canvas);
    return this;
}

Jumbotron.prototype.translate = function(vec) {
    this.translateVec = vec;
    return this;
};

Jumbotron.prototype.scale = function(val) {
    this.thickCylA.scale(val);
    this.thickCylB.scale(val);
    this.jumboScreen.scale(val);
    return this;
};

Jumbotron.prototype.initBuffers = function(gl_) {
    this.display.initBuffers(gl_);
    this.frame.init(gl_);
    this.thickCylA.initBuffers(gl_);
    this.thickCylB.initBuffers(gl_);
    this.jumboScreen.initBuffers(gl_);
};

Jumbotron.prototype.setShader = function(shader) {
//    this.frame.setShader(shader);
    this.thickCylA.setShader(shader);
//    this.thickCylB.setShader(shader);
//    this.jumboScreen.setShader(shader);
};

Jumbotron.prototype.draw = function(gl_) {

    // check to see if ball cound has changed
//    if(this.balls_hit !== Stadium.total_balls_hit) {
//	this.balls_hit = Stadium.total_balls_hit;
//	this.display.update(gl_, "Balls left: " + 
//			    (this.total_balls - this.balls_hit) + "/" + 
//			    this.total_balls);
//    }


    this.frame.drawScene(gl_);
    
    theMatrix.push();
    theMatrix.translate(this.translateVec);
    this.thickCylA.draw(gl_);
    this.thickCylB.draw(gl_);
    for(var i = 0; i < 4; ++i) {
	this.jumboScreen.draw(gl_);
	theMatrix.rotate(Math.PI / 2, [0, 1, 0]);
    }
    theMatrix.pop();
};
