/**
 * GLobject abstracts away buffers and arrays of data,
 *  allowing us to work at a high level without
 *  tripping over low-level implementation details.
 */
function GLobject() {

    this.data = {};
    this.buff = {};
    this.shader = -1;

    // Data to load into buffers
    this.data["norm"] = [];
    this.data["pos"] = [];
    this.data["col"] = [];
    this.data["index"] = [];
    this.data["tex"] =  [];

    this.textureNum = NO_TEXTURE;

    // Quads use an index position counter
    this.indexPos = 0;

    // Ensure any repeat initialization
    //  of this object's data will do it correctly
    this.normsInverted = false;
    this.hasFlatNorms = false;

    // default values
    this.ambient_coeff = 0.1;
    this.diffuse_coeff = 0.7;
    this.specular_coeff = 0.0;
    this.specular_color = vec3.fromValues(0.8, 0.8, 0.8);

    /**
     * Pass 3 numbers into the object's internal arrays
     *
     * rewritten a la http://jsperf.com/array-indexing-in-loops
     */
    this.addNorms = function(x,y,z) {
	this.data["norm"].push(x);
	this.data["norm"].push(y);
	this.data["norm"].push(z); };
    this.addPos = function(x,y,z) {
	this.data["pos"].push(x);
	this.data["pos"].push(y);
	this.data["pos"].push(z); };
    this.addColors = function(x,y,z) {
	this.data["col"].push(x);
	this.data["col"].push(y);
	this.data["col"].push(z); };
    this.addTexture = function(x,y) {
	this.data["tex"].push(x);
	this.data["tex"].push(y); };
    this.addIndexes = function(x,y,z) {
	this.data["index"].push(x);
	this.data["index"].push(y);
	this.data["index"].push(z); };

    /**
     * Or, pass a vec3
     * (only with arrays that it makes sense for)
     */
    this.addNormVec =
	function(vec) { this.data["norm"].push(vec[0]);
			this.data["norm"].push(vec[1]);
			this.data["norm"].push(vec[2]); };
    this.addPosVec =
	function(vec) { this.data["pos"].push(vec[0]);
			this.data["pos"].push(vec[1]);
			this.data["pos"].push(vec[2]); };
    this.addColorVec =
	function(vec) { this.data["col"].push(vec[0]);
			this.data["col"].push(vec[1]);
			this.data["col"].push(vec[2]); };

    /**
     * Sometimes, we'll have to invert the norms
     *  of objects
     */
    this.invertNorms = function() {
	this.normsInverted = true;
	for (var i = 0; i < this.data["norm"].length; ++i) {
	    this.data["norm"][i] = -this.data["norm"][i];
	}
    };

    /**
     * Sometimes, we'll have to invert the norms
     *  of objects
     */
    this.invertFlatNorms = function() {
	for (var i = 0; i < this.data["norm_"].length; ++i) {
	    this.data["norm_"][i] = -this.data["norm_"][i];
	}
    };

    /**
     *  A---C
     *  |  /|    Two triangles: ABC and BDC
     *  |/  |
     *  B---D
     */
    this.addQuadIndexes = function(a, c) {
	this.data["index"].push(a);
	this.data["index"].push(a+1);
	this.data["index"].push(c);
	this.data["index"].push(c+1);
	this.data["index"].push(c);
	this.data["index"].push(a+1);
    };

    /**
       Buffers a quadrilateral.
    */
    this.Quad = function(a, b, c, d) {
	this.addPosVec(a);
	this.addPosVec(b);
	this.addPosVec(c);
	this.addPosVec(d);

	var temp1 = vec3.create();
	var temp2 = vec3.create();
	var normV = vec3.create();

	vec3.cross(normV, vec3.sub(temp1,b,a), vec3.sub(temp2,c,a));

	for (var i = 0; i < 4; ++i) {
	    this.addNormVec(normV);
	    this.addColors(0.3, 0.5, 0.7);
	}
	this.addQuadIndexes(this.indexPos,
			    this.indexPos + 2);
	this.indexPos += 4;
	return this;
    };

    this.initTextures = function(at, bt, ct, dt) {
	this.addTexture(at[0], at[1]);
	this.addTexture(bt[0], bt[1]);
	this.addTexture(ct[0], ct[1]);
	this.addTexture(dt[0], dt[1]);
    };

    /**
     *   Based upon the enumerated texture chosen,
     *   selects which lighting attributes this object
     *   will receive.
     *
     *   These values are uniforms - the same for each vertice
     */
    this.setTexture = function(theTexture) {

	this.textureNum = theTexture;

	switch(theTexture) {
	case HELL_TEXTURE:
	    //vec3.set(this.specular_color, 0.7, 0.2, 0.2);
	    this.specular_coeff = 0.0;
	    this.ambient_coeff = 0.0;
	    this.diffuse_coeff = 1.0;
	    var theTexture = new GLtexture(theCanvas.gl, this.textureNum);
	    break;
	case FLOOR_TEXTURE:
	    this.ambient_coeff = 0.2;
	    this.diffuse_coeff = 0.4;
	    var theTexture = new GLtexture(theCanvas.gl, this.textureNum);
	    break;
	case BRICK_TEXTURE:
	    this.ambient_coeff = 0.1;
	    this.diffuse_coeff = 0.2;
	    var theTexture = new GLtexture(theCanvas.gl, this.textureNum);
	    break;
	case TILE_TEXTURE:
	    this.ambient_coeff = 0.1;
	    this.diffuse_coeff = 0.3;
	    var theTexture = new GLtexture(theCanvas.gl, this.textureNum);
	    break;
	case RUG_TEXTURE:
	    this.ambient_coeff = 0.9;
	    this.specular_coeff = 1.0;
	    var theTexture = new GLtexture(theCanvas.gl, this.textureNum);
	    break;
	case SKYBOX_TEXTURE_0:
	case SKYBOX_TEXTURE_1:
	case SKYBOX_TEXTURE_2:
	case SKYBOX_TEXTURE_3:
	case SKYBOX_TEXTURE_4:
	case SKYBOX_TEXTURE_5:
	case SKYBOX_TEXTURE_REAL:
	    this.ambient_coeff = 2.4;
	    this.diffuse_coeff = 0.0;
	    vec3.set(this.specular_color, 0.0, 0.0, 0.0);
	    var theTexture = new GLtexture(theCanvas.gl, this.textureNum);
	    break;
	case WOOD_TEXTURE:
	case HEAVEN_TEXTURE:
	    var theTexture = new GLtexture(theCanvas.gl, this.textureNum);
	    break;
	case TEXT_TEXTURE:
	case TEXT_TEXTURE2:
	case TEXT_TEXTURE3:
	case TEXT_TEXTURE4:
	    // For certain textures, we want _no_ position-dependent lighting.
	    this.ambient_coeff = 5.0;
	    this.diffuse_coeff = 0.0;
	    vec3.set(this.specular_color, 0.0, 0.0, 0.0);
	    //	this.specular_coeff = 1.0;
	    break;
	case FRAME_BUFF:
	    this.ambient_coeff = 3.0;
	    this.diffuse_coeff = 0.7;
	    break;
	case NO_TEXTURE:
	    break;
	default:
	    alert("Unsupported texture number " + theTexture + " in GLobject.js", theTexture);
	    break;
	}
	return this;
    };

    /**
     * Once the arrays are full, call to
     *  buffer WebGL with their data
     */
    this.initBuffers = function(gl_) {

	if(this.textureNum === NO_TEXTURE) {
	    // See if we need to create 'dummy' data

	    if(this.data["tex"].length < 1) {
		var i, max;
		for(i = 0, max = this.data["norm"].length / 3; i < max; ++i) {
		    this.data["tex"].push(0);
		    this.data["tex"].push(0);
		}
	    }

	}

	this.bufferData(gl_, "norm", 3);
	this.bufferData(gl_, "pos", 3);
	this.bufferData(gl_, "col", 3);
	this.bufferData(gl_, "tex", 2);
	this.bufferElements(gl_, "index");
    };

    /**
       Buffer data fpr a single vertex attribute array.
    */
    this.bufferData = function(gl_, attribute, size) {

	var theData = this.data[attribute];
	if(theData.length < 1) { this.buff[attribute] = -1; return; }
	this.buff[attribute] = gl_.createBuffer();
	gl_.bindBuffer(gl_.ARRAY_BUFFER, this.buff[attribute]);
	gl_.bufferData(gl_.ARRAY_BUFFER,
		       new Float32Array(theData),
		       gl_.STATIC_DRAW);
	this.buff[attribute].itemSize = size;
	this.buff[attribute].numItems = theData.length / size;
    };

    /**
       Buffer data fpr vertex elements.
    */
    this.bufferElements = function(gl_, elem_name) {

	var theData = this.data[elem_name];
	this.buff[elem_name] = gl_.createBuffer();
	gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, this.buff[elem_name]);
	gl_.bufferData(gl_.ELEMENT_ARRAY_BUFFER,
		       new Uint16Array(theData),
		       gl_.STATIC_DRAW);
	this.buff[elem_name].itemSize = 1;
	this.buff[elem_name].numItems = theData.length;
    };

    // Flip across the Z-axis.
    this.flip = function(vec) {
	for(var i = 0; i < this.data["pos"].length; i += 3) {
	    this.data["pos"][i+2] = -this.data["pos"][i+2];
	    this.data["norm"][i+2] = -this.data["norm"][i+2];
	}
	return this;
    };

    // Rotate around the Y-axis
    this.rotateXZ = function(vec) {
	var temp;
	for(var i = 0; i < this.data["pos"].length; i += 3) {
	    temp = this.data["pos"][i];
	    this.data["pos"][i]   = -this.data["pos"][i+2];
	    this.data["pos"][i+2] = temp;
	}
	return this;
    };

    // X becomes Y, Y becomes Z, Z becomes X
    this.rotatePos = function(vec) {
	var temp;
	for(var i = 0; i < this.data["pos"].length; i += 3) {
	    temp = this.data["pos"][i];
	    this.data["pos"][i]   = this.data["pos"][i+1];
	    this.data["pos"][i+1] = this.data["pos"][i+2];
	    this.data["pos"][i+2] = temp;
	    temp = this.data["norm"][i];
	    this.data["norm"][i]   = this.data["norm"][i+1];
	    this.data["norm"][i+1] = this.data["norm"][i+2];
	    this.data["norm"][i+2] = temp;
	}
	return this;
    };

    // X becomes Z, Y becomes X, Z becomes Y
    this.rotateNeg = function(vec) {
	var temp;
	for(var i = 0; i < this.data["pos"].length; i += 3) {
	    temp = this.data["pos"][i+2];
	    this.data["pos"][i+2]   = this.data["pos"][i+1];
	    this.data["pos"][i+1] = this.data["pos"][i];
	    this.data["pos"][i] = temp;
	    temp = this.data["norm"][i+2];
	    this.data["norm"][i+2]   = this.data["norm"][i+1];
	    this.data["norm"][i+1] = this.data["norm"][i];
	    this.data["norm"][i] = temp;
	}
	return this;
    };

    this.scale = function(num) {
	for(var i = 0; i < this.data["pos"].length; ++i) {
	    this.data["pos"][i] *= num;
	}
	return this;
    };

    this.translate = function(vec) {
	for(var i = 0; i < this.data["pos"].length; ++i) {
	    this.data["pos"][i] += vec[i%3];
	}
	return this;
    };

    GLobject.has_collided = 0;

    /**
       Link GL's pre-loaded attributes to the  program
       Then send the 'draw' signal to the GPU
    */
    this.linkAttribs = function(gl_, shader_) {

	if(shader_.unis["frames_elapsed_u"] !== null)
	    gl_.uniform1f(shader_.unis["frames_elapsed_u"], theCanvas.frame_count);

	if(shader_.unis["ambient_coeff_u"] !== null)
	    gl_.uniform1f(shader_.unis["ambient_coeff_u"], this.ambient_coeff);
	if(shader_.unis["diffuse_coeff_u"] !== null)
	    gl_.uniform1f(shader_.unis["diffuse_coeff_u"], this.diffuse_coeff);

	// check to see if texture is used in shader
	gl_.uniform1i(shader_.unis["sampler0"], gl_.tex_enum[this.textureNum]);

	if(shader_.unis["specular_color_u"] !== null) {
	    gl_.uniform3fv(shader_.unis["specular_color_u"], this.specular_color); }

	this.linkAttrib(gl_, shader_, "vNormA", "norm");
	this.linkAttrib(gl_, shader_, "vPosA", "pos");
	this.linkAttrib(gl_, shader_, "vColA", "col");
	this.linkAttrib(gl_, shader_, "textureA", "tex");
    };

    /**
     * Does type checking to ensure these attribs exist.
     * - If object contains it but shader does not, ignores it
     * - If shader contains it but object does not, turns attrib off
     * - If both have it, make sure attrib is enabled
     */
    this.linkAttrib = function(gl_, gl_shader, gpu_name, cpu_name) {

	var gpu_attrib = gl_shader.attribs[gpu_name];
	var cpu_attrib = this.buff[cpu_name];

	if(gpu_attrib !== -1) {
	    if(cpu_attrib === -1) {
		if(gl_shader.attrib_enabled[gpu_name] === true) {
		    gl_.disableVertexAttribArray(gpu_attrib);
		    gl_shader.attrib_enabled[gpu_name] = false;
		}
	    } else {
		if(gl_shader.attrib_enabled[gpu_name] === false) {
		    gl_.enableVertexAttribArray(gpu_attrib);
		    gl_shader.attrib_enabled[gpu_name] = true;
		}
		gl_.bindBuffer(gl_.ARRAY_BUFFER, cpu_attrib);
		gl_.vertexAttribPointer(gpu_attrib, cpu_attrib.itemSize, gl_.FLOAT, false, 0, 0);
	    }
	}
    };

    /**
       Send the divide-and-conquer 'draw' signal to the GPU
       Attributes must first be linked (as above).
    */
    this.drawElements = function(gl_) {
	gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, this.buff["index"]);
	gl_.drawElements(gl_.TRIANGLES,
			 this.buff["index"].numItems, gl_.UNSIGNED_SHORT, 0);
    };

    /**
     * Point to, and draw, the buffered triangles
     */
    this.draw = function(gl_) {

	var shader_;
	if(this.shader !== -1) shader_ = this.shader;
	else if(this.textureNum === NO_TEXTURE)
	    shader_ = theCanvas.shader["color"];
	else
	    shader_ = theCanvas.shader["default"];

	// The high level object is expected to handle these things itself
	// if this is off (it'll set the shaders itself).
/*
	if (GLobject.draw_optimized === false) {
	    theCanvas.changeShader(shader_);
	    theMatrix.setViewUniforms(shader_);
	    theMatrix.setVertexUniforms(shader_);
	}
*/
	this.linkAttribs(gl_, shader_);
	this.drawElements(gl_);
    };

    return this;
}

GLobject.draw_optimized = false;
