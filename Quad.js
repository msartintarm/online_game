/*
a c 
b d
*/
function Quad(a, b, c, d) { 
    this.o = new GLobject();

    this.o.addPosVec(a);
    this.o.addPosVec(b);   
    this.o.addPosVec(c);   
    this.o.addPosVec(d);

    var temp1 = vec3.create();
    var temp2 = vec3.create();
    var normV = vec3.create();

    vec3.cross(normV, vec3.sub(temp2,b,a), vec3.sub(temp1,c,a));
    vec3.normalize(normV, normV);
    for (var i = 0; i < 4; ++i) {
	this.o.addNormVec(normV);
	this.o.addColors(0.2, 0.5, 0.7);
    }

    this.o.addQuadIndexes(0, 2);


    this.setTexture = function(texture) { 
	this.o.setTexture(texture);
	this.o.initTextures([1,0], [1,1], [0,0], [0,1]);
	return this;
    };
    this.translate = _oTranslate;
    this.setShader = _oSetShader;

    return this;
}

/**
 * Finds min and max x-and-y coordinates.
 */
Quad.prototype.add2DCoords = function() {

    var data_array = this.o.data["pos"];
    this.x_min = Math.min(data_array[0], 
			  data_array[3], 
			  data_array[6], 
			  data_array[9]);

    this.x_max = Math.max(data_array[0], 
			  data_array[3], 
			  data_array[6], 
			  data_array[9]);

    this.y_min = Math.min(data_array[1], 
			  data_array[4], 
			  data_array[7], 
			  data_array[10]);

    this.y_max = Math.max(data_array[1], 
			  data_array[4], 
			  data_array[7], 
			  data_array[10]);
    return this;
};


/*
 * Invert the Y-coords of the texture within
 */
Quad.prototype.flipTexture = function(texture) { 
    for(var i = 0; i < this.o.data["tex"].length; i += 2) {
	this.o.data["tex"][i+1] += 1;
	this.o.data["tex"][i+1] %= 2;
    }
    return this;
};

Quad.prototype.setActive = function(active) { 
    this.o.setActive(active);
    return this;
};

Quad.prototype.setSkyTexture = function(texture, val) { 
    this.o.setTexture(texture);
   
    
    //it is not trivial to get these coordinates to work for an image
    //so do not foolishly rush in here.
    if(val== 0){
	//set the south wall	
	this.o.initTextures([0.249999,0.749999], [0,0.7499999], [0.2499999,0.499999], [0,0.499999]);
	//this.o.initTextures([0.2499999,0.2499999], [0.2499999,0], [0.499999,0.2499999], [0.499999,0]);
    }
    else if(val == 1){
	//north wall
	this.o.initTextures([0.499999,0.499999], [0.7499999,0.499999], [0.499999,0.7499999], [0.7499999,0.7499999]);
    }
    else if(val == 2){
	//east wall
	this.o.initTextures([0.2499999,0.499999], [0.2499999,0.2499999], [0.499999,0.499999], [0.499999,0.2499999]);
    }
    else if(val == 3){
	//west wall
	this.o.initTextures([0.499999,0.7499999], [0.499999,0.99999], [0.2499999,0.7499999], [0.2499999,0.99999]);
    }
    else if(val == 4){
	//bottom wall
	this.o.initTextures([0.99999,0.499999], [0.99999,0.7499999], [0.7499999,0.499999], [0.7499999,0.7499999]);
    }
    else{
	//top wall
	this.o.initTextures([0.499999,0.499999], [0.499999,0.7499999], [0.2499999,0.499999],[0.2499999,0.7499999]);
    }
    return this;
}

Quad.prototype.setStringTexture = function(texture, val) { 
    this.o.setTexture(texture);
    var x_dist = 0.120;
    var x_dist_1 = 0.115
    var x_dist_2 = 0.110;
    var x_dist_3 = 0.105;
    var x_dist_4 = 0.100;
    var x_dist_5 = 0.100;
    var x_dist_6 = 0.098;
    var x_dist_7 = 0.097;
    var x_dist_8 = 0.096;
    var x_dist_9 = 0.096;
    var offset = 0.06;

    if(val==0)
	this.o.initTextures([x_dist,0.0],[x_dist,1.0],[offset,0.0],[offset,1.0]);
    else if(val==1)
	this.o.initTextures([2*x_dist,0.0],[2*x_dist,1.0],[x_dist,0.0],[x_dist,1.0]);
    else if(val==2)
	this.o.initTextures([3*x_dist_2,0.0],[3*x_dist_2,1.0],[2*x_dist_2,0.0],[2*x_dist_2,1.0]);
    else if(val==3)
	this.o.initTextures([4*x_dist_3,0.0],[4*x_dist_3,1.0],[3*x_dist_3,0.0],[3*x_dist_3,1.0]);
    else if(val==4)
	this.o.initTextures([5*x_dist_4,0.0],[5*x_dist_4,1.0],[4*x_dist_4,0.0],[4*x_dist_4,1.0]);
    else if(val==5)
	this.o.initTextures([6*x_dist_4,0.0],[6*x_dist_4,1.0],[5*x_dist_4,0.0],[5*x_dist_4,1.0]);
    else if(val==6)
	this.o.initTextures([7*x_dist_6,0.0],[7*x_dist_6,1.0],[6*x_dist_6,0.0],[6*x_dist_6,1.0]);
    else if(val==7)
	this.o.initTextures([8*x_dist_7,0.0],[8*x_dist_7,1.0],[7*x_dist_7,0.0],[7*x_dist_7,1.0]);
    else if(val==8)
	this.o.initTextures([9*x_dist_8,0.0],[9*x_dist_8,1.0],[8*x_dist_8,0.0],[8*x_dist_8,1.0]);
    else if(val==9)
	this.o.initTextures([10*x_dist_9,0.0],[10*x_dist_9,1.0],[9*x_dist_9,0.0],[9*x_dist_9,1.0]);
    
    return this;
};

Quad.prototype.invertNorms = _oInvertNorms;
Quad.prototype.initBuffers = _oInitBuffers;
Quad.prototype.scale = _oScale;
Quad.prototype.rotatePos = _oRotatePos;
Quad.prototype.rotateNeg = _oRotateNeg;
Quad.prototype.draw = _oDraw;
