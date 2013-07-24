/**
   Creates a texture and fills it with the contents of a string.
   'theStr ing.texture_num' should be used externally to find
   the texture to set
 */
function GLstring(text_to_write, string_num, shader_) {
    this.active = (++ theCanvas.gl.active);
    this.num = string_num;
    theCanvas.gl.tex_enum[this.num] = this.active;
    this.shader = (shader_)? shader_: theCanvas.gl.shader;
    this.text = text_to_write;
    this.canvas = document.getElementById('textureCanvas');
    this.sampler = (++ this.shader.sampler);
    this.texture = -1;

    var ctx = this.canvas.getContext("2d");
    if(!ctx) { alert("Error initializing text."); }

    var textSize = 112;
    ctx.font = textSize + "px Arial";

	// Use logs to round the text width and height to the nearest power of 2
    this.canvas.width = Math.pow(2,
	Math.ceil(Math.log(ctx.measureText(this.text).width) / Math.LN2));
    this.canvas.height = 2 * Math.pow(2,
	Math.ceil(Math.log(textSize) / Math.LN2));
    this.canvas.style.borderStyle = "solid";
    this.canvas.style.borderWidth = "2px";

    ctx.font = textSize + "px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = "#123456";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, this.canvas.width/2, this.canvas.height/2);
    ctx.fillStyle = "#B8A47A";
    ctx.fillText(this.text, this.canvas.width/2 + 1, this.canvas.height/2 + 1);
    ctx.fillStyle = "#127596";
    ctx.fillText(this.text, this.canvas.width/2 + 2, this.canvas.height/2 + 2);
    ctx.fillStyle = "#556677";
    ctx.fillText(this.text, this.canvas.width/2 + 3, this.canvas.height/2 + 3);

    return this;
}

GLstring.prototype.initBuffers = function(gl_) {

  if(this.texture === -1) this.texture = gl_.createTexture();
    gl_.activeTexture(gl_.TEXTURE0 + this.active);
    gl_.bindTexture(gl_.TEXTURE_2D, this.texture);

    gl_.texParameteri(gl_.TEXTURE_2D, 
			  gl_.TEXTURE_WRAP_S, 
			  gl_.CLAMP_TO_EDGE);
    gl_.texParameteri(gl_.TEXTURE_2D, 
			  gl_.TEXTURE_WRAP_T, 
			  gl_.CLAMP_TO_EDGE);
    gl_.texImage2D(gl_.TEXTURE_2D, 0, gl_.RGBA, gl_.RGBA, 
		       gl_.UNSIGNED_BYTE, this.canvas);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.LINEAR);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR_MIPMAP_NEAREST);

    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR);
    gl_.generateMipmap(gl_.TEXTURE_2D);

    theCanvas.changeShader(this.shader);
    var gl_sampler = gl_.getUniformLocation(
	this.shader, "sampler" + this.sampler);
    gl_.uniform1i(gl_sampler, this.active);

    console.log("str: [" + this.active + "," + 
		this.sampler + "," + this.num + "]");
    document.getElementById("glcanvas_status").innerHTML += 
    "str: [" + this.active + "," + this.sampler + "," + this.num + "]</br>";
    
};

GLstring.prototype.draw = function(gl_) { return; };
GLstring.prototype.update = function(gl_, new_string) {
    this.text = new_string;
    this.initBuffers(gl_);
};


