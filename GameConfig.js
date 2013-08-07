/**
 * Three intended purposes:
 * 1. Given a config, load it into control panel
 * 2. Given a control-panel config, init game with it
 * 3. Do '1' and '2' with text (file) input
 */
function GameConfig(game) {

    if (GameConfig.prototype._instance) return GameConfig.prototype._instance;

    GameConfig.prototype._instance = this;


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

    // Define functions that construct the div elements, then call them.
    this.setupDivs = function() {

        var config_div = document.createElement("div");
        config_div.style.fontSize = "20px";
        document.getElementById("banner").appendChild(config_div);

        var curr_div = config_div;

        var _Break = function() {
            var breakz = document.createElement("div");
            breakz.height = "1";
            breakz.style.clear = "both";
            curr_div.appendChild(breakz);
        };

        var _CheckBox = function(value, selected) {
            var text_x = document.createElement("textarea");
            text_x.value = value;
            text_x.style.width = "50px";
            text_x.rows = 1;
            curr_div.appendChild(text_x);
        };

        var _TextBox = function(value, width) {
            var text_x = document.createElement("textarea");
            text_x.value = value;
            text_x.style.width = width;
            text_x.rows = 1;
            curr_div.appendChild(text_x);
        };

        var _Square = function(color) {
            var d = document.createElement("div");
            d.style.width = "3px";
            d.style.height = "4px";
            d.style.borderLeftWidth = "1px";
            d.style.borderLeftStyle = "solid";
            d.style.borderBottomWidth = "1px";
            d.style.borderBottomStyle = "solid";
            d.style.cssFloat = "left";
            d.onclick = (function(s, c) {
                s.clicked = false;
                s.backgroundColor = c;
                return function() {
                    console.log(s.backgroundColor + " " + c);
                    if (s.clicked === false) {
                        s.backgroundColor = "#4455ff";
                    }
                    else s.backgroundColor = c;
                    s.clicked = !s.clicked;
                };
            } (d.style, color));
            curr_div.appendChild(d);
        };

        // create div with title, and leave it open.
        // a button will be created that invokes it.
        var _openDiv = function(title) {

            curr_div = document.createElement("div");

            var button = document.createElement("input");
            button.type = "button";
            button.className = "floating";
            button.value = title;
            // Function sets div to be hidden by default,
            //   then returns a function that toggles it on / off
            button.onclick = (function(s) {
                s.display = "none";
                return function() {
                    if(s.display === "none")
                        s.display = "inline-block";
                    else s.display = "none";
                };
            } (curr_div.style));

            config_div.appendChild(button);

        };

        var _closeDiv = function() {
            config_div.appendChild(curr_div);
            curr_div = config_div;
        };

        var _initMiscDiv = function() {
            _openDiv("Misc");
            if (config["start-position"]) {
                config["start-position"].forEach(function(x, i) {
                    _TextBox(x, "30px");
                }, this);
            }
            _closeDiv();
        };

        var _initTexturesDiv = function() {
            _openDiv("Textures:");
            config["textures"].forEach (function(texture) {
                _TextBox(texture, "96%");
            }, this);
            _closeDiv();
        };

        var _initAudioDiv = function(gl_audio) {
            _openDiv("Music:");
            config["audio"].forEach (function(sound) {
                // audio-low-pass", "loop", "1", "8"
                _TextBox(sound[0], "96%");
                _CheckBox("loop?", sound[2]);
                if (sound[2] === "loop") {
                    _TextBox(sound[3], "30px");
                    _TextBox(sound[4], "30px");
                } else {
                    _TextBox("n/a", "30px");
                    _TextBox("n/a", "30px");
                }

            }, this);
            _closeDiv();
        };

        var squares = {};

        var div_piece_count = 0;

        var _initPieceDiv = function(piece_name) {

            div_piece_count += 1;

            var p0 = config[piece_name];
            _openDiv("Piece '" + p0[0] + "':");

            var tex = p0[1];
            tex = (tex === "brick-texture")? BRICK_TEXTURE:
                (tex === "heaven-texture")? HEAVEN_TEXTURE:
                (tex === "rug-texture")? RUG_TEXTURE: null;


            var coords = p0[4];

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
                    // Two-level assoc map. Stored with 'y' first because that's
                    // how we iterate over it to map
                    if (!squares[y]) squares[y] = {};
                    squares[y][x] = div_piece_count;
                }

            }

            for(var b = 10; b > -3; --b) {

                _Break();
                for(var a = -8; a < 30; ++a) {
                    if (squares[b] && squares[b][a]) {
                        if (squares[b][a] === div_piece_count) _Square("#66ff66");
                        else _Square("#3333dd");
                    } else _Square("#ff4433");
                }
            }
            _closeDiv();
        };

        _initPieceDiv("piece-0");
        _initPieceDiv("piece-1");
        _initAudioDiv();
        _initTexturesDiv();
        _initMiscDiv();
    };

    this.setupDivs();

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
        var p0 = config[piece_name];

        var tex = p0[1];
            tex = (tex === "brick-texture")? BRICK_TEXTURE:
            (tex === "heaven-texture")? HEAVEN_TEXTURE:
            (tex === "rug-texture")? RUG_TEXTURE: null;

        var w = game.grid * parseInt(p0[2]); // actually, width / 2
        var h = game.grid * parseInt(p0[3]);

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

        var coords = p0[4];

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
