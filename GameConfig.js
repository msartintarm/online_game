/**
 * Three intended purposes:
 * 1. Given a config, load it into control panel
 * 2. Given a control-panel config, init game with it
 * 3. Do '1' and '2' with text (file) input
 */
function GameConfig(game) {

    if (GameConfig.prototype._singleton !== undefined) {
        return GameConfig.prototype._singleton.updatedVersion(game);
    }

    this.updatedVersion = function(new_game) {
        game = new_game;
        return this;
    };

    GameConfig.prototype._singleton = this;

    //            CONFIGURATION
    // Figure out some way to convert this to document eventually
    var config = {
        "grid-size": 50,
        "textures": ["brick-texture", "heaven-texture", "rug-texture"],
        // Origin URL, destination node, loop[, loop offset, loop time])
        // These are at 120 BPM: 1 sec = 2 beats
        // 0. Low-pass input detects movement, occuring on the half-beat; slightly below 0.25s
        // 1. Non-looping sound, which will be triggered by the above sample
        // 2. Non-looping sound, which will be triggered by the above sample
        // 3. Rest of the song.
        "audio": [["music/beats.mp3", "audio-low-pass", "loop", "1", "8"],
                  ["music/Game_Hi Hat_2.wav", "audio-output"],
                  ["music/Game_keys_2.wav", "audio-output"],
                  ["music/backing_beat.wav", "audio-delay", "loop", "0", "8"]],
        // Syntax of pieces: name, texture, array of x-y coordinate strings
        // String values can either be absolute, or relative to prev. strings
        // Can also specify loops of continuous increments
        "piece-0": ["floor", "rug-texture", "1", "3", ["-11,-1", "20*(+1,+0)"]],
        "piece-1": ["wall", "brick-texture", "1", "1", ["6,3", "+1,+1", "+1,+1", "+1,+1", "12*(+1,+0)",
                                                        "+4,-2", "4*(+2,+0)",
                                                        "-4,+2", "4*(-2,+0)",
                                                        "+4,-2", "4*(+2,+0)",
                                                        "-4,+2", "4*(-2,+0)"]],
        "start-position": ["0", "300", "750"]
    };

    // Either op doesn't exist (val, is a '-' (= dec old), or is  a '+' (= inc old)
    var newCoordVal = function(old, op, val) {
        return (!op)? parseInt(val):
            (op === "-")? old - parseInt(val):
            (op === "+")? old + parseInt(val): -1;
    };

    //          DIV SETUP
    var parent_div = document.createElement("div");

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
                } else if (target.value) {
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
            var breakz = document.createElement("div");
            breakz.height = "1";
            breakz.style.clear = "both";
            curr_div.appendChild(breakz);
        };

        var _CheckBox = function(curr_div, value, selected) {
            var t = document.createElement("textarea");
            t.value = value;
            t.style.width = "50px";
            t.rows = 1;
            curr_div.appendChild(t);
        };

        var _TextBox = function(curr_div, value, width) {
            var t = document.createElement("textarea");
            t.value = value;
            t.style.width = width;
            t.rows = 1;
            curr_div.appendChild(t);
        };

        // We want this to execute press function AND click function
        // , so we pass click function as a closure argument
        var pressMouse = function(other_funct) {
            return function() { mouse_down = !mouse_down; other_funct(); };
        };

        var mouse_down = false;

        var _Square = function(curr_div, color) {
            var d = document.createElement("div");
            d.className = "square";

            d.onmouseover = (function(style, color1) {
                var is_c1 = false;
                var color2 = "#4455ff";
                style.backgroundColor = color1;
                return function() {
                    if (mouse_down === false) return;
                    console.log("over! " + style.backgroundColor);
                    style.backgroundColor = (is_c1)? color1: color2;
                    is_c1 = !is_c1;
                };
            } (d.style, color));

            d.onmousedown = (function(click_funct, div_style) {
                // We want this to execute press function AND click function
                // , so we pass click function as a closure argument
                var the_color = div_style.color;
                return function() {
                    mouse_down = !mouse_down;
                    div_style.color = (mouse_down)? "#123456": the_color;
                    click_funct(); };
            } (d.onmouseover, curr_div.style));

            curr_div.appendChild(d);
            return d;
        };

        // create div with title, and return it.
        // a button will be created that shows / hides it.
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
            var d = _openDiv("Piece '" + p[0] + "':", piece_name);

            _TextBox(d, p[1], "96%");
            d.appendChild(document.createTextNode(" x: "));
            _TextBox(d, p[2], "20px");
            d.appendChild(document.createTextNode(" y: "));
            _TextBox(d, p[3], "20px");

            _openDiv("Coordinates");

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
                    if(j == 0) console.log ("yeaa." + zzap.input);
                }

            }

            for(var b = 10; b > -3; --b) {
                _Break(d);
                var y = parseInt(b);
                if (squares[y] === undefined) for(var a = -8; a < 30; ++a) _Square(d, "#ff4433");

                else for(var a = -8; a < 30; ++a) {

                    var x = parseInt(a);
                    if (squares[y][x] === undefined) _Square(d, "#ff4433");

                    // No type checking here (let type conversion do its thing)
                    else if (squares[y][x].charAt(1) == div_piece_count) {
                        if (squares[y][x].length > 2)
                            _Square(d, "#99ff66").value = squares[y][x].substr(3);
                        else _Square(d, "#33bb33");
                    } else _Square(d, "#3333dd");
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
        if (config["grid-size"]) game.grid = config["grid-size"];
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

        var w = game.grid * parseInt(p[2]); // actually, width / 2
        var h = game.grid * parseInt(p[3]);

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
