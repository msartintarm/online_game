/**
 * Creates and initializes GLaudio.
 * This serves as a wrapper to control a WebGL AudioContext and 
 * associated JS file loads.
 *
 * Has a 
 */
function GLaudio() {  

    const NUM_LOOP_BUFFERS = 6;

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
    var i; // for init loop

    // Env variable(s) - do not change during execution.
    this.log_music = false;

    // Music related stuff
    this.total = 0;
    this.total2 = 0;

    this.pause = function() { console.err("Pause not supported."); }; // Need to re-implement

    var triggered = false;
    var log_string = "";

    this.analyze = function() {

	// Analyse whether sound is above a certain threshhold.
	var analyser = this.analyser, size = analyser.frequencyBinCount;
	var FFTData = new Uint8Array(size);
	this.analyser.getByteFrequencyData(FFTData);
	
	var sum = 0;
	for(var x = size - 1; x >= 0; --x) {
	    sum += Math.abs(FFTData[x]);
	}

	if (this.log_music) log_string += " " + sum;
	
	if(triggered === false) {
	    if (sum > 8) { 
		if (this.log_music) log_string += "! ";
		triggered = true;
		return true;
	    }
	} else {
	    if (sum < 2) {
		if (this.log_music) console.log(log_string + "."), log_string = ""; 
		triggered = false;
	    }
	}

    };

    // Close out function context to the world.
    this.playSound = (function(web_audio, sounds) { 

	return function(num, length) {
	    var source = web_audio.createBufferSource();
	    source.buffer = sounds[num].buffer;
	    source.connect(web_audio.destination);
	    if (!length) source.start(0, 0);
	    else source.start(0, length);
	};
    } (this.web_audio, this.audio));
    
    this.handleAudioRequest = (function(web) { 
	return function(gl_audio, request, auto_start) {

	    web.decodeAudioData(
		request.response,
		function(the_buffer) {
		    gl_audio.buffer = the_buffer;
		    gl_audio.auto_start = auto_start;
		    if (auto_start === true) {
			console.log("new music set up to play. ");
		    } else {
			console.log("new music set up, not to play. ");
		    }
		}
	    );
	}; 
    } (this.web_audio));

    /**
     * Makes an audio object, sets it up, and starts it.
     * Uses the following as a ref:
     * http://chromium.googlecode.com/svn/trunk/samples/audio/index.html
     */
    this.createAudio = function(url, destination, auto_start, loop_delay, loop_length) {

	// Will be decremented once it's loaded
	var new_audio = {};
	new_audio.dest = destination;
	new_audio.delay = (loop_delay)? loop_delay: 0;
	new_audio.loop_length = (loop_length)? loop_length: 0;
	new_audio.auto_start = false;
	new_audio.source_num = 0; // number of buffers to rotate between
	new_audio.source = new Array(NUM_LOOP_BUFFERS);


	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer"; // Does this work for any MIME request?
	// Once request has loaded, load and start audio buffer
	request.onload = this.handleAudioRequest.bind(this, new_audio, request, auto_start);
	try { 
	    request.send(); 
	    this.audio.push(new_audio);
	} catch (e) { 
	    console.log(e.toString()); 
	    return null;
	}
    };


    /**
     * Create and start self-calling, closed function to play audio[] elements.
     */
    var playBuffer = (function(web, audio) { 
	
	// Use Web Audio's super-accurate internal clock to sync elements
	var start_time = web.currentTime + 0.250; // 250 ms
	// Increments each time playBuffer is called. Use % for specific time domains
	var beat_count = 0;
	
	// Actual function! Is isolated within its own scope.
	return function() {
	    beat_count ++;
	    for(var i = 0; i < audio.length; ++i) {
		var gl_audio = audio[i];
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
	    }
	    // Elements will play 250 ms after this call
	    start_time += 0.250;
	    var new_timeout = (start_time - 0.050 - web.currentTime) * 1000;
	    window.setTimeout(playBuffer, new_timeout);
	};
    }) (this.web_audio, this.audio);
    
    // 50-ms cushion to figure out things above
    window.setTimeout(playBuffer, 200); // 200 ms

    return this;
}

