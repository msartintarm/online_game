/**
 * Creates and initializes GLaudio.
 * This serves as a wrapper to control a WebGL AudioContext and
 * associated JS file loads.
 *
 * Has a
 */
function GLaudio() {

    var SHIFT=16;
    var SPACE=32;
    var LEFT=37;
    var UP=38;
    var RIGHT=39;
    var DOWN=40;
    var _A=65;

    // Increments each time playBuffer is called. Use % for specific time domains
    var beat_count = 0;

    var NUM_LOOP_BUFFERS = 6;

    if (typeof AudioContext !== "undefined") this.web_audio = new AudioContext();
    else if (typeof webkitAudioContext !== "undefined") this.web_audio = new webkitAudioContext();

    else throw new Error('Use a browser that supports AudioContext for music.');

    this.delay = this.web_audio.createDelay();
    this.delay.delayTime.value = 0.060;
    this.delay.connect(this.web_audio.destination);

    this.analyser = this.web_audio.createAnalyser();
    this.analyser.fftSize = 32;

    this.low_pass = this.web_audio.createBiquadFilter();
    this.low_pass.type = "lowpass";
    this.low_pass.frequency.value = 200;
    this.low_pass.connect(this.analyser);

    this.audio = [];

    // Env variable(s) - do not change during execution.
    this.log_music = false;

    // Music related stuff
    this.total = 0;
    this.total2 = 0;

    this.pause = function() { console.err("Pause not supported."); }; // Need to re-implement

    this.analyze = (function(analyser, log_output) {

        var triggered = false;
        var size = analyser.frequencyBinCount;
	var FFTData = new Uint8Array(size);
        var log_string = "";

        return function() {
	    analyser.getByteFrequencyData(FFTData);

	    var sum = 0;
	    for(var x = size - 1; x >= 0; --x) {
	        sum += Math.abs(FFTData[x]);
	    }

	    if (this.log_music) log_string += " " + sum;

	    if(triggered === false) {
	        // Analyse whether sound is above a certain threshhold.
	        if (sum > 8) {
		    if (log_output) log_string += "! ";
		    triggered = true;
		    return true;
	        }
	    } else {
	        if (sum < 2) {
		    if (log_output) console.log(log_string + "."), log_string = "";
		    triggered = false;
	        }
	    }
        };
    } (this.analyser, this.log_music));

    // Close out function context to the world.
    this.playSound = (function(web_audio, sounds) {

        var sound_map = function(num) {
            if (num == LEFT) return 1;
            if (num == RIGHT) return 1;
            if (num == UP)  return 1;
        };

	return function(num, length) {
	    var source = web_audio.createBufferSource();
	    source.buffer = sounds[sound_map(num)].buffer;
	    source.connect(web_audio.destination);
	    if (!length) source.start(0, 0);
	    else source.start(0, length);
	};
    } (this.web_audio, this.audio));

    /**
     * Makes an audio object, sets it up, and starts it.
     * The following was used as a ref:
     * http://chromium.googlecode.com/svn/trunk/samples/audio/index.html
     */
    this.createAudio = (function(web) {

        var createAudioRequest = function(audio_url, audio_load_fn, auto_start) {

	    var r = new XMLHttpRequest();
	    r.open("GET", audio_url, true);
	    r.responseType = "arraybuffer"; // Does this work for any MIME request?

	    // Once request has loaded, load and start audio buffer
	    r.onload =  function() { web.decodeAudioData(r.response, audio_load_fn); };
	    try { r.send();
                  return true;
                } catch (e) {
                    console.log(e.toString());
	            return false;
                }
        };

        return function(url, destination, auto_start, loop_delay, loop_length) {
	    var new_audio = {
	        dest: destination,
	        auto_start: false,
	        loop_length: (loop_length)? loop_length: 0,
	        delay: (loop_delay)? loop_delay: 0,
	        source_num: 0, // number of buffers to rotate between
	        source: new Array(NUM_LOOP_BUFFERS)
	    };

            var audio_load_f = function(the_buffer) {
		new_audio.buffer = the_buffer;
		new_audio.auto_start = auto_start;
		if (auto_start === true) {
		    console.log("new music set up to play. ");
		} else {
		    console.log("new music set up, not to play. ");
		}
	    };

            if (createAudioRequest(url, audio_load_f, auto_start) === true)
	        this.audio.push(new_audio);

        };
    } (this.web_audio));

    /**
     * Create audio that is triggered by a specific event.
     * Returns funct to play the audio..?
     */
    this.triggerAudio = function (url, dest, length, condition_f) {
        var whoami = this;
        return function() {
            if(condition_f() === true) {
                whoami.createAudio(url, dest, true, 0, length);
                return true;
            }
            else return false;
        };
    };

    /**
     * Create and start self-calling, closed function to play audio[] elements.
     */
    var playBuffer = (function(web, audio) {

	// Use Web Audio's super-accurate internal clock to sync elements
	var start_time = web.currentTime + 0.250; // 250 ms

	// Actual function! Is isolated within its own scope.
	return function() {
	    beat_count ++;
            audio.forEach(function (gl_audio) {
		if(gl_audio.auto_start === true &&
		   (beat_count % gl_audio.loop_length) === gl_audio.delay) {

		    // set up new source
		    var new_source = gl_audio.source[(++(gl_audio.source_num)) %
						     gl_audio.source.length];
		    new_source = web.createBufferSource(),
		    new_source.connect(gl_audio.dest),
		    new_source.buffer = gl_audio.buffer;
		    new_source.start(start_time - web.currentTime, 0);
		}
	    });
	    // Elements will play 250 ms after this call
	    start_time += 0.250;
	    var new_timeout = (start_time - 0.050 - web.currentTime) * 1000;
	    window.setTimeout(playBuffer, new_timeout);
        };
    } (this.web_audio, this.audio));

    // 50-ms cushion to figure out things above
    window.setTimeout(playBuffer, 200); // 200 ms

    return this;
}
