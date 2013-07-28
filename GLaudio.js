/**
 * Creates and initializes GLaudio.
 */
function GLaudio() {  

    if (typeof AudioContext !== "undefined") this.web_audio = new AudioContext();
    else if (typeof webkitAudioContext !== "undefined") this.web_audio = new webkitAudioContext();

    else throw new Error('Use a browser that supports AudioContext for music.');

    this.analyser = this.web_audio.createAnalyser();
    this.analyser.fftSize = 32;
    this.analyser.connect(this.web_audio.destination);

    this.low_pass = this.web_audio.createBiquadFilter();
    this.low_pass.type = "lowpass";
    this.low_pass.frequency.value = 200;
    this.low_pass.connect(this.analyser);

    this.audio = [];
    var i; // for init loop

    // Env variable(s) - do not change during execution.
    this.log_music = false;

    // Music related stuff
    this.hi_hat = 0;
    this.total = 0;
    this.total2 = 0;

    this.pause = function() { console.err("Pause not supported."); }; // Need to re-implement

    var triggered = false;

    this.analyze = function(gl_) {

	// Analyse sound, which influences movement.
	if(this.hi_hat < 5) {
	    
	    var FFTData = new Uint8Array(this.analyser.frequencyBinCount);
	    this.analyser.getByteFrequencyData(FFTData);

	    var sum = 0;
	    for(var x = FFTData.length - 1; x >= 0; --x) {
		sum += Math.abs(FFTData[x]);
	    }


	    if(triggered === false) {
		if (sum > 15) { 
		    this.hi_hat = 11;
		    if (this.log_music) console.log("ds %.2f", sum);
		    triggered = true;
		}
	    } else {
		if (sum < 10) {
		    if (this.log_music) console.log("-zzz-"); 
		    triggered = false;
		}
	    }
	}

	if (this.hi_hat > 0) this.hi_hat -= 1;
    };


    this.playSound = function() {
	var audio = this.audio[1];
	// Load start time from offset.
	var source = this.web_audio.createBufferSource();
	source.buffer = audio.buffer;
	source.connect(this.web_audio.destination);
	source.start(1.0);
    };

    this.handleAudioRequest = function(gl_audio, request) {

	this.web_audio.decodeAudioData(
	    request.response,
	    function(the_buffer) {
		gl_audio.buffer = the_buffer;
		if((--this.audio_to_load) === 0) this.playMusic();
	    }.bind(this)
	);
    };

    this.audio_to_load = 0;

    /**
     * Makes an audio object, sets it up, and starts it.
     * Uses the following as a ref:
     * http://chromium.googlecode.com/svn/trunk/samples/audio/index.html
     */
    this.createAudio = function(url, destination, auto_start, loop_delay, loop_length) {

	// Will be decremented once it's loaded
	this.audio_to_load ++;
	var new_audio = {};
	new_audio.auto_play = auto_start;
	new_audio.dest = destination;
	new_audio.delay = 0;
	new_audio.loop_length = null;
	if (auto_start === true) {
	    new_audio.delay = loop_delay;
	    new_audio.loop_length = loop_length;
	}
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer"; // Does this work for any MIME request?
	// Once request has loaded, load and start audio buffer
	request.onload = this.handleAudioRequest.bind(this, new_audio, request);
	try { 
	    request.send(); 
	    this.audio.push(new_audio);
	} catch (e) { 
	    console.log(e.toString()); 
	    return null;
	}
    };

    /**
     * Once all audio elements are loaded, call them with specific start intervals.
     */
    this.playMusic = function() {

	var web = this.web_audio;
	var audio = this.audio;

	// Asynchronously set up each audio element
	audio.forEach(function(gl_audio) {
	    gl_audio.source_num = 0; // number of buffers to rotate between
	    gl_audio.loop_count = gl_audio.delay;
	    gl_audio.source = new Array(6);
	});

	// Done setting up. They will play two seconds after the start of the loop.

	window.setInterval(function() {

	    audio.forEach(
		function(gl_audio) {
		    if(gl_audio.loop_length !== null && 
		       ((++(gl_audio.loop_count)) % gl_audio.loop_length === 0)) {
			// var source1 = gl_audio.source[gl_audio.source_num];
			var source2 = gl_audio.source[(++(gl_audio.source_num)) % 6];
			// set up source 2
			source2 = web.createBufferSource(),
			source2.connect(gl_audio.dest),
			source2.buffer = gl_audio.buffer;
			source2.start(0, 0);
		    }
		}
	    );
	}, 250);
	
	
    };

    return this;
}

