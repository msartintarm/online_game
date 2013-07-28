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
    this.low_pass.frequency = 100;
    this.low_pass.connect(this.analyser);

    this.audio = [];
    var i; // for init loop

    // Env variable(s) - do not change during execution.
    this.log_music = false;

    // Music related stuff
    this.hi_hat = 0;
    this.total = 0;
    this.total2 = 0;

    this.pause = function() {
	var audio = this.audio[0];
	if(audio.playing) {
	    audio.source.stop(0);
	} else {
	    audio.source.start(0, audio.offset);
	}
	audio.playing = !audio.playing;
	
    };

    this.analyze = function(gl_) {

	// Analyse sound, which influences movement.
	if(this.hi_hat < 5) {
	    
	    var FFTData = new Uint8Array(this.analyser.frequencyBinCount);
	    this.analyser.getByteFrequencyData(FFTData);

	    var sum = FFTData[0] + FFTData[1] + FFTData[2];

	    if(this.total === 0) this.total = sum;
	    if(this.total < 0.1) this.total = 0.1;
	    if(this.total2 === 0) this.total2 = sum;

	    // Rough ratio of this sound to previous sounds
	    if(sum > 2 * this.total && sum > 1.5 * this.total2 ) { 
		this.hi_hat = 11;
		if (this.log_music) {
		    console.log("%.2f", sum / this.total); 
		}
	    }

	    // I'm going to call this the 'rolling average' filter.
	    this.total = this.total * 2/3 + sum/3;
	    this.total2 = sum;
	}

	if (this.hi_hat > 0) this.hi_hat -= 1;
    };


    this.playSound = function() {
	var audio = this.audio[1];
	// Load start time from offset.
	var source = this.web_audio.createBufferSource();
	source.buffer = audio.buffer;
	source.connect(this.web_audio.destination);
	source.start(0,0);
	audio.source = source;
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
	if (auto_start === true) {
	    new_audio.delay = loop_delay;
	    new_audio.length = loop_length;
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
	this.audio.forEach(
	    function(gl_audio) {

		gl_audio.source = this.web_audio.createBufferSource();
		gl_audio.source.connect(gl_audio.dest);
		gl_audio.source.buffer = gl_audio.buffer;
		gl_audio.offset = 0;
		gl_audio.source1 = true;
	    }, this);

	// Done setting up. They will play two seconds after the start of the loop.

	window.setInterval(function() {
	    var time = web.currentTime + 2;
	    [audio[0], audio[2]].forEach(
		function(gl_audio) {
		    if (gl_audio.source1 === true) {
			// set up source 2
			gl_audio.source2 = web.createBufferSource();
			gl_audio.source2.connect(gl_audio.dest);
			gl_audio.source2.buffer = gl_audio.buffer;
			gl_audio.source2.start(time - web.currentTime + gl_audio.delay, 0);
			gl_audio.source1 = false;
		    } else {
			gl_audio.source = web.createBufferSource();
			gl_audio.source.connect(gl_audio.dest);
			gl_audio.source.buffer = gl_audio.buffer;
			gl_audio.source.start(time - web.currentTime + gl_audio.delay, 0);
			gl_audio.source1 = true;
		    }
		}
	    );
	}, 2000);
	
	
    };

    return this;
}

