
/**
 * Three intended purposes:
 * 1. Given a config, load it into control panel
 * 2. Given a control-panel config, init game with it
 * 3. Do '1' and '2' with text (file) input
 */
function GameConfig(game) {

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
        "piece-0": ["floor", "rug-texture", "1", "3", ["-22,-1", "20*(+2,+0)"]],
        "piece-1": ["wall", "brick-texture", "1", "1", ["12,3", "+2,+1", "+2,+1", "+2,+1", "12*(+2,+0)",
                                      "+4,-2", "4*(+2,+0)",
                                      "-4,+2", "4*(-2,+0)",
                                      "+4,-2", "4*(+2,+0)",
                                      "-4,+2", "4*(-2,+0)"]],
        "start-position": ["0", "300", "750"]
    };

    var config_div = document.createElement("div");
    document.getElementById("banner").appendChild(config_div);

    var curr_div = config_div; //

    this.TextBox = function(value, width) {
        var text_x = document.createElement("textarea");
        text_x.value = value;
        text_x.style.width = width;
        text_x.rows = 1;
        curr_div.appendChild(text_x);
    };

    var swap_div;

    // create div with title, and leave it open.
    // a button will be created that invokes it.
    this.openDiv = function(title) {

        swap_div = document.createElement("div");

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
        } (swap_div.style));

        config_div.appendChild(button);

        curr_div = swap_div;
    };

    this.closeDiv = function() {
        config_div.appendChild(curr_div);
        curr_div = config_div;
    };

    this.initMisc = function() {
        if (config["grid-size"]) game.grid = config["grid-size"];
        if (config["start-position"]) {
            var cf = config["start-position"];
            var vecz = [];
            cf.forEach(function(x, i) {
                vecz[i] = parseInt(x);
                this.TextBox(x, "30px");
            }, this);
            game.matrix.vTranslate(vecz);
       }
    };

    this.initTextures = function() {
        this.openDiv("Textures:");
        config["textures"].forEach (function(texture) {
            this.TextBox(texture, "100%");
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
        this.closeDiv();
    };

    this.addAudio = function(gl_audio) {
        return function(sound) {
            this.TextBox(sound[0], "99%");
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

        this.openDiv("Music:");
        config["audio"].forEach (this.addAudio(gl_audio), this);
        this.closeDiv();
    };

    this.initPiece = function(arr, piece_name) {
        var p0 = config[piece_name];

        var w = game.grid * parseInt(p0[2]);
        var h = game.grid * parseInt(p0[3]);

        this.openDiv("Piece '" + p0[0] + "':");

        var tex = p0[1];
            tex = (tex === "brick-texture")? BRICK_TEXTURE:
            (tex === "heaven-texture")? HEAVEN_TEXTURE:
            (tex === "rug-texture")? RUG_TEXTURE: null;

        var create = function(x,y) {
	    var x2 = x * w;
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


            if (zzap[2]) this.TextBox(zzap[2], "78%");
            this.TextBox(zzap[3], "20%");

            for(var j = 0; j < loop; ++j) {
                // Either char doesn't exist, is a '-' (decrement), or is  a '+' (increment)
                x = (!zzap[2])? parseInt(zzap[3]):
                    (zzap[2] === "-")? x - parseInt(zzap[3]): x + parseInt(zzap[3]);
                y = (!zzap[4])? parseInt(zzap[5]):
                    (zzap[4] === "-")? y - parseInt(zzap[5]): y + parseInt(zzap[5]);
                create(x,y);
            }

        }
        this.closeDiv();
    };
}
