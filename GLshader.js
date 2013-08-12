

function GLshader() {
    this.fragment = [];
    this.vertex = [];

    var frameFn = function(frame_id, shader_id) {
        var f = document.getElementById(frame_id);
        if (f === null) console.error(frame_id + " is null!");
        f = f.contentWindow ?
            f.contentWindow.document:
            f.contentDocument;

        return f.getElementById(shader_id).value;
    };

    this.f_decls = frameFn("shader_default", "f_decls");
    this.v_decls = frameFn("shader_default", "v_decls");





    this.fragment["color"] = "\
void colorize() {\n\
  vec3 ambColor = colorV / 3.0 * ambient_coeff_u;\n\
  vec3 diffColor = colorV / 3.0 * diffuseV * diffuse_coeff_u;\n\
  vec3 specColor = specular_color_u * specular();\n\
  gl_FragColor = vec4(ambColor + diffColor + specColor, 1.0);\n\
}\n\
\n\
void main(void) {\n\
  colorize();\n\
}\n\
";

    this.fragment["canvas"] = frameFn("shader_canvas", "frag");
    this.fragment["player"] = frameFn("shader_player", "frag");

    this.fragment["default"] = document.getElementById("shader_frag_default").value;
    this.fragment["frame"] = "\
void main(void) {\n\
\n\
  gl_FragColor = vec4(colorV * vec3(2.0, 0.0, 0.5) * specular(), 1.0);\n\
}\n\
";

    this.vertex["color"] = "\
void main(void) {\n\
\n\
// Viewing space coordinates of light / vertex\n\
vModel = (mvnMatU[1] * mvnMatU[0]  * vec4(vPosA, 1.0)).xyz;\n\
lModel = mvnMatU[1] * lMatU * vec4(lightPosU, 1.0);\n\
\n\
  // -- Position -- //\n\
\n\
  gl_Position = pMatU * mvnMatU[1] * mvnMatU[0] * vec4(vPosA, 1.0);\n\
\n\
  // -- Lighting -- //\n\
\n\
  // Ambient components we'll leave until frag shader\n\
  colorV = vColA;\n\
\n\
  // Diffuse component\n\
  lightNorm = normalize(lModel.xyz - vModel.xyz);\n\
\n\
  vertNorm = normalize((mvnMatU[2] * vec4(vNormA,1.0)).xyz);\n\
  diffuseV = dot(vertNorm, lightNorm);\n\
  if (diffuseV < 0.0) { diffuseV = 0.0; }\n\
}       \n\
";

    this.vertex["default"] = document.getElementById("shader_vert_default").value;
    this.vertex["player"] = document.getElementById("shader_vert_player").value;
}


/*
 * http://dev.opera.com/articles/view/raw-webgl-part1-getting-started/
 */
GLshader.prototype.init = function(gl_, gl_shader, frag_name, vert_name) {

    var f_shader = gl_.createShader(gl_.FRAGMENT_SHADER);
    gl_.shaderSource(f_shader, "" + this.f_decls + this.fragment[frag_name]);
    gl_.compileShader(f_shader);

    var v_shader = gl_.createShader(gl_.VERTEX_SHADER);
    gl_.shaderSource(v_shader, "" + this.v_decls + this.vertex[vert_name]);
    gl_.compileShader(v_shader);

    gl_.attachShader(gl_shader, v_shader);
    gl_.attachShader(gl_shader, f_shader);

    // Firefox says macs behave poorly if
    // an unused attribute is bound to index 0
    // So we specify 'position' before the link.
    gl_.bindAttribLocation(gl_shader, 0, "vPosA");

    gl_.linkProgram(gl_shader);

    if (!gl_.getProgramParameter(gl_shader, gl_.LINK_STATUS)) {
	return -1;
    }

    return 0;
};

GLshader.prototype.cleanup = function() {
    this.fragment = null;
    this.vertex = null;

    this.f_decls = null;
    this.v_decls = null;
};
