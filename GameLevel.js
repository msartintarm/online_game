/**
 * Three intended purposes:
 * 1. Given a config for a level, load it into control panel
 * 2. Given a control-panel config, init game with it
 * 3. Do '1' and '2' with text (file) input
 */
function GameLevel(game, config) {

    // Follows configuration and stores associated HTML DOM objects
    var config_shadow = {};

    // Either op doesn't exist (val, is a '-' (= dec old), or is  a '+' (= inc old)
    var newCoordVal = function(old, op, val) {
        return (!op)? parseInt(val):
            (op === "-")? old - parseInt(val):
            (op === "+")? old + parseInt(val): -1;
    };

    //          DIV SETUP

    // Takes a DOM tag type and a pre-existing object.
    // Adds all properties in the object to element, and returns it.
    var createElementMST = function(tag_type, props) {
        var e = document.createElement(tag_type);
        for (var p in props) {
            if (p === "style") { // recursion would also work
                for (var s in props[p]) e[p][s] = props[p][s];
            }
            else e[p] = props[p];
        }
        return e;
    };

    var parent_div = document.createElement("div");

    var wrap = createElementMST("div", { className: "wrap" });
    parent_div.appendChild(wrap);

   var disp = createElementMST("div",
        { id: "display", style: { paddingTop: "8px", width: "100%" }});
    wrap.appendChild(disp);

    var params = createElementMST("div", { id: "game_params",
    style: { display: "inline-block" }});
    disp.appendChild(params);

    var name = createElementMST("div", { style: {
        cssFloat: "left", width: "45%", fontSize: "16px"}});
    name.appendChild(document.createTextNode("Name:"));
    params.appendChild(name);

    var entry = createElementMST("div", { style: {
        cssFloat: "right", width: "55%" }});
    entry.appendChild(createElementMST("input", {
        type: "text", className: "floating stadium_input",
        id: "player_name", value: "Noname" }));
    params.appendChild(entry);

    params.appendChild(document.createElement("br"));

    // Define functions that construct the div elements, then call them.
    this.setupDivs = function() {

        parent_div.style.fontSize = "20px";
        document.getElementById("banner").appendChild(parent_div);

        // Let's start with the printer.
        var p = document.createElement("input");
        p.type = "button";
        p.className = "floating";
        p.value = "Print Config!";
        p.onclick = function() {

            var s = "";
            // If object is an array, recursively call itself. Otherwise, print contents (assume String)
            var recursive_printer = function(target) {
                if (target.childNodes && target.childNodes.length > 0) { // defined and non-zero
                    s += "[";
                    for (var i = 0; i < target.childNodes.length; ++i) {
                        recursive_printer(target.childNodes[i]);
                    }
                    s += "],";
                } else if (target.value && (!target.type || target.type !== "button")) {
                    s += "\"" + target.value + "\"" + ", ";
                }
            };

            s = "var config = {\n";

            console.log(parent_div);

            for(var i = 0; i < parent_div.childNodes.length; ++i) {
                var d = parent_div.childNodes[i];
                if (d.id) {
                    s += "\"" + d.id + "\": ";
                    recursive_printer(d);
                    console.log(s); s = ""; // new-line...
                }
            };

            s +=("};\n");
            console.log(s);
        };

        parent_div.appendChild(p);

        var _Break = function(curr_div) {
            var b = document.createElement("div");
            b.height = "1";
            b.style.clear = "both";
            curr_div.appendChild(b);
        };

        var _CheckBox = function(curr_div, value, selected) {
            var t = document.createElement("textarea");
            t.value = value;
            t.style.width = "50px";
            t.rows = 1;
            curr_div.appendChild(t);
            return t;
        };

        var _TextBox = function(curr_div, value, width) {
            var t = document.createElement("textarea");
            t.value = value;
            t.style.width = width;
            t.style.height = "17px";
            t.rows = 1;

            if (!!config_shadow[curr_div.id]) config_shadow[curr_div.id].push(t);
            else config_shadow[curr_div.id] = [t];

            curr_div.appendChild(t);
            return t;
        };


        var mouse_down = false;

        // We want this to execute press function AND click function
        // , so we pass click function as a closure argument
        var pressMouse = function(other_funct) {
            return function() { mouse_down = !mouse_down; other_funct(); };
        };

        var _Square = function(bg_color) {
            var d = document.createElement("div");
            d.className = "square";
            d.style.backgroundColor = bg_color;

            d.onmouseover = (function(style, color1, color2) {
                var is_c1 = true;
                return function() {
                    if (mouse_down === false) return;
                    is_c1 = !is_c1;
                    style.backgroundColor = (is_c1)? color1: color2;
                };
            } (d.style, bg_color, "#4455ff"));

            d.onmousedown = (function(click_funct, div_style) {
                // We want this to execute press function AND click function
                // , so we pass click function as a closure argument
                var the_color = div_style.color;
                return function() {
                    mouse_down = !mouse_down;
                    div_style.color = (mouse_down)? "#123456": the_color;
                    click_funct(); };
            } (d.onmouseover, parent_div.style));
            parent_div.appendChild(d);
            return d;
        };

        // create div with title, and return it.
        // a button will be created that shows / hides it.
        //
        //    [ button with title ]  |
        //   ------------------------|
        //   --initially hidden div--|
        //   ------------------------|

        var _openDiv = function(title, div_id) {

            var d = document.createElement("div");
            if (div_id) d.id = div_id;

            var b = document.createElement("input");
            b.type = "button";
            b.className = "floating";
            b.value = title;

            // Returns a function that toggles it on / off
            // Also sets it up to be 'none' by default
            b.onclick = (function(s) {
                s.display = "none";
                return function() {
                    if(s.display === "none") s.display = "inline-block";
                    else s.display = "none";
                };
            } (d.style));

            var brake = document.createElement("div");
            brake.style.borderBottomStyle = "solid";
            brake.style.borderBottomWidth = "2px";
            brake.style.borderTopStyle = "solid";
            brake.style.borderTopWidth = "2px";
            brake.style.height = "1px";
            brake.style.width = "95%";
            brake.style.borderBottomColor = "#662211";
            brake.style.backgroundColor = "#33110a";
            brake.style.borderTopColor = "#130a08";
            parent_div.appendChild(brake);
            parent_div.appendChild(b);
            parent_div.appendChild(d);

            parent_div = d;

            return d;
        };

        var _closeDiv = function(curr_div) {
            parent_div = parent_div.parentElement;
        };

        var _initMiscDiv = function() {
            var d = _openDiv("Misc", "start-position");
            if (config["start-position"]) {
                config["start-position"].forEach(function(x, i) {
                    _TextBox(d, x, "30px");
                }, this);
            }
            _closeDiv();
        };

        var _initTexturesDiv = function() {
            var d = _openDiv("Textures:", "textures");
            config["textures"].forEach (function(t) {
                _TextBox(d, t, "96%");
            }, this);
            _closeDiv();
        };

        var _initAudioDiv = function() {
            var d = _openDiv("Music:", "audio");
            config["audio"].forEach (function(s) {
                // audio-low-pass", "loop", "1", "8"
                _TextBox(d, s[0], "96%");
                _CheckBox(d, "loop?", s[2]);
                if (s[2] === "loop") {
                    _TextBox(d, s[3], "30px");
                    _TextBox(d, s[4], "30px");
                } else {
                    _TextBox(d, "n/a", "30px");
                    _TextBox(d, "n/a", "30px");
                }

            }, this);
            _closeDiv();
        };

        var squares = {};

        var div_piece_count = 0;

        var _initPieceDiv = function(piece_name) {

            div_piece_count += 1;

            var p = config[piece_name];
            // name, texture, array of x-y coordinate strings
            var c = _openDiv("Piece '" + p[0] + "':", piece_name);

            c.style.fontSize = "9pt";
            _TextBox(c, p[0], "96%").style.display = "none";
            _TextBox(c, p[1], "96%");
            c.appendChild(document.createTextNode(" Width:"));
            _TextBox(c, p[2], "20px");
            c.appendChild(document.createTextNode(", height:"));
            _TextBox(c, p[3], "20px");

            c.style.color = "#ff2200";
            var d = _openDiv("Coordinates");

            var coords = p[4];

            var x = 0;
            var y = 0;

            for(var i = 0; i < coords.length; ++i) {

                var termA = /(?:([0-9]+)\*\()?([-+])*([0-9]+)\,([-+])*([0-9]+)\)?/;
                var zzap = termA.exec(coords[i]);
                // Index 1: loop count (opt); 2, 4: inc sign (opt); 3, 5: value (non-opt)
                var loop = (zzap[1])? zzap[1]: 1;

                for(var j = 0; j < loop; ++j) {
                    x = newCoordVal(x, zzap[2], zzap[3]);
                    y = newCoordVal(y, zzap[4], zzap[5]);
                    if ((!x && x !== 0) ||
                        (!y && y !== 0))
                        console.log("Error parsing string for " + zzap[0] +
                                    " w/ nums " + zzap[3] + " and " + zzap[5]);
                    // Two-level assoc map. Stored with 'y' first because that's
                    // how we iterate over it to map
                    if (squares[y] === undefined) squares[y] = {};
                    squares[y][x] = (j == 0)?
                        "s" + div_piece_count + "-" + zzap.input:
                        "s" + div_piece_count;
                }

            }

            for(var b = 10; b > -3; --b) {
                _Break(d);
                var y = parseInt(b);
                if (squares[y] === undefined) for(var a = -8; a < 30; ++a)
                    _Square("#ff4433");

                else for(var a = -8; a < 30; ++a) {

                    var x = parseInt(a);
                    if (squares[y][x] === undefined) _Square("#ff4433");

                    // No type checking here (let type conversion do its thing)
                    else if (squares[y][x].charAt(1) == div_piece_count) {
                        if (squares[y][x].length > 2)
                            _Square("#99ff66").value = String(x + "," + y);
                        else _Square("#33bb33").value = String(x + "," + y);
                    } else _Square("#3333dd");
                }
            }
            _closeDiv();
            _closeDiv();
        };

        _initPieceDiv("piece-0");
        _initPieceDiv("piece-1");
        _initAudioDiv();
        _initTexturesDiv();
        _initMiscDiv();
    };

    this.initMisc = function() {
        if (config["grid-size"]) this.grid = config["grid-size"];
        else console.error("No grid size specified!");
        if (config["start-position"]) {
            var vecz = [];
            config["start-position"].forEach(function(x, i) {
                vecz[i] = parseInt(x);
            }, this);
            game.matrix.vTranslate(vecz);
       }
    };

    this.initTextures = function() {
        config["textures"].forEach (function(texture) {
            var t =
                (texture === "brick-texture")? BRICK_TEXTURE:
                (texture === "heaven-texture")? HEAVEN_TEXTURE:
                (texture === "rug-texture")? RUG_TEXTURE: null;
            var n =
                (texture === "brick-texture")? BRICK_NORMAL_TEXTURE:
                (texture === "heaven-texture")? HEAVEN_NORMAL_TEXTURE: null;
            if (t) GLtexture.create(gl_, t);
            if (n) GLtexture.create(gl_, n);
        }, this);
    };

    this.addAudio = function(gl_audio) {
        return function(sound) {
            var web_node =
                (sound[1] === "audio-low-pass")? gl_audio.low_pass:
                (sound[1] === "audio-output")? gl_audio.web_audio.destination:
                (sound[1] === "audio-delay")? gl_audio.delay: null;

            if (!sound[2] || sound[2] === "")
                gl_audio.createAudio(sound[0],  // URL (relative)
                                     web_node,  // Web Audio node (filter) type
                                     false);    // Loop?
            else if (sound[2] === "loop")
                gl_audio.createAudio(sound[0], web_node, true,
                                     parseInt(sound[3]),  // Loop start beat
                                     parseInt(sound[4])); // Loop  repeat factor
        };
    };

    this.initAudio = function(gl_audio) {
        config["audio"].forEach (this.addAudio(gl_audio), this);
    };

    this.initPiece = function(arr, piece_name) {
        var p = config[piece_name];

        var tex = p[1];
            tex = (tex === "brick-texture")? BRICK_TEXTURE:
            (tex === "heaven-texture")? HEAVEN_TEXTURE:
            (tex === "rug-texture")? RUG_TEXTURE: null;

        var w = this.grid * parseInt(p[2]); // actually, width / 2
        var h = this.grid * parseInt(p[3]);

        var create = function(x,y) {

	    var x2 = x * w * 2;
	    var y2 = y * h;
            var l = -1;
	    arr.push(new Quad([x2-w,y2+h,l],
			      [x2-w,  y2,l],
			      [x2+w,y2+h,l],
			      [x2+w,  y2,l])
		     .setTexture(tex).add2DCoords());
        };

        var coords = p[4];

        var x = 0;
        var y = 0;
        for(var i = 0; i < coords.length; ++i) {

            var termA = /(?:([0-9]+)\*\()?([-+])*([0-9]+)\,([-+])*([0-9]+)\)?/;
            var zzap = termA.exec(coords[i]);
            // Index 1: loop count (opt); 2, 4: inc sign (opt); 3, 5: value (non-opt)
            var loop = (zzap[1])? zzap[1]: 1;


//            if (zzap[2]) this.TextBox(zzap[2], "78%");
//            this.TextBox(zzap[3], "20%");

            for(var j = 0; j < loop; ++j) {
                // Either char doesn't exist, is a '-' (decrement), or is  a '+' (increment)
                x = newCoordVal(x, zzap[2], zzap[3]);
                y = newCoordVal(y, zzap[4], zzap[5]);
                create(x,y);
            }

        }
    };
}
