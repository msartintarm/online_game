
/**
 * Three intended purposes:
 * 1. Given a config, load it into control panel
 * 2. Given a control-panel config, init game with it
 * 3. Do '1' and '2' with text (file) input
 */
function GameConfig(game) {

    // Figure out some way to convert this to document eventually
    var config = {
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
        "grid-size": 50,
        // Syntax of pieces: name, texture, array of x-y coordinate strings
        // String values can either be absolute, or relative to prev. strings
        // Can also specify loops of continuous increments
        "piece-0": ["floor", "rug-texture", ["-11,0", "20*(+1,0)"]],
        "piece-1": ["wall", "brick-texture", ["3,12", "+1,+2", "+2,+1", "+2,+1", "12*(+2,+0)",
                                      "-2,+4", "4*(+0,-2)",
                                      "-2,+4", "4*(+0,-2)",
                                      "-2,+4", "4*(+0,-2)"]],
        "start-position": ["0", "300", "750"]
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
        });
    };

    this.initAudio = function(gl_audio) {

        config["audio"].forEach (function (sound) {
            var web_node =
                (sound[1] === "audio-low-pass")? gl_audio.low_pass:
                (sound[1] === "audio-output")? gl_audio.web_audio.destination:
                (sound[1] === "audio-delay")? gl_audio.delay: null;
            console.log(web_node);
            if (!sound[2] || sound[2] === "")
                gl_audio.createAudio(sound[0],  // URL (relative)
                                     web_node,  // Web Audio node (filter) type
                                     false);    // Loop?
            else if (sound[2] === "loop")
                gl_audio.createAudio(sound[0], web_node, true,
                                     parseInt(sound[3]),  // Loop start beat
                                     parseInt(sound[4])); // Loop  repeat factor
        });
    };
/*
        "piece-0": ["floor", "rug", ["-11,0", "20*(+1,0)"]],
        "piece-1": ["wall", "brick", ["3,12", "+1,+2", "+2,+1", "+2,+1", "12*(+2,+0)",
                                      "-2,+4", "4*(+0,-2)",
                                      "-2,+4", "4*(+0,-2)",
                                      "-2,+4", "4*(+0,-2)"]],
*/
    this.initPiece = function(arr) {
        var p0 = config["piece-0"];
        var w = 50;
        var h = -3 * 50;

        var tex = p0[1];
            tex = (tex === "brick-texture")? BRICK_TEXTURE:
            (tex === "heaven-texture")? HEAVEN_TEXTURE:
            (tex === "rug-texture")? RUG_TEXTURE: null;

        var create = function(x,y) {
	    var x2 = x * 2 * w;
	    var y2 = y * w;
            var l = -1;
                console.log(x2 + "," + y2);
	    arr.push(new Quad([x2-w,y2+h,l],
			      [x2-w,  y2,l],
			      [x2+w,y2+h,l],
			      [x2+w,  y2,l])
		     .setTexture(tex).add2DCoords());
        };

        var coords = p0[2];


        var x = 0;
        var y = -3;
        for(var i = 0; i < coords.length; ++i) {

            var termA = /(?:([0-9]+)\*\()?([-+])*([0-9]+)\,([-+])*([0-9]+)\)?/;

            var zzap = termA.exec(coords[i]);

            // Index 1: loop count; 2, 4: inc sign; 3, 5: value
            var loop = (zzap[1])? zzap[1]: 1;

            for(var j = 0; j < loop; ++j) {

                x = (!zzap[2])? parseInt(zzap[3]):
                    (zzap[2] === "-")? x - parseInt(zzap[3]):
                    x + parseInt(zzap[3]);

                y = (!zzap[4])? parseInt(zzap[5]):
                    (zzap[4] === "-")? y - parseInt(zzap[5]):
                    y + parseInt(zzap[5]);

                console.log(x + "," + y);
                create(x,y);
            }

        }
    };
}
