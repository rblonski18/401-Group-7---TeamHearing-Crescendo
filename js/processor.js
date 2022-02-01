window.AudioContext = window.AudioContext || window.webkitAudioContext;
MASTERGAIN = 60; MASTERHOLD = 60;
function Processor() {
	this.masterGain = audio.createGain();
	this.mediaHandler =  'XMLHttpRequest';//HTML5|XMLHttpRequest
	this.signalGain = audio.createGain();
	this.noise = function (audiofile, gain, callback) {
		let that = this;

		// media handler
		switch (this.mediaHandler) {
			case 'HTML5':
				let noise = document.createElement('audio');
				noise.addEventListener('canplay',callback,false);
				noise.setAttribute('autoplay','true');
				noise.setAttribute('loop','true');
				noise.setAttribute('src','data/noise/calibrated/'+audiofile+'.wav');

				// source
				this.noiseSource = audio.createMediaElementSource(noise); break;
			case 'XMLHttpRequest':
				let request = new XMLHttpRequest();
				request.open('get','data/noise/calibrated/'+audiofile+'.wav',true);
				request.responseType = 'arraybuffer';
				request.onload = () => {
					audio.decodeAudioData(request.response,
						function(incomingBuffer) {
							that.noiseSource.buffer = incomingBuffer;
							that.noiseSource.start(0);
							if(callback){callback()}
						}
					);
				};
				request.send();

				// source
				this.noiseSource = audio.createBufferSource();
		}

		// specify and connect
		this.noiseSource.loop = true;
		this.noiseGain = audio.createGain();
		this.noiseGain.gain.value = typeof gain !== 'undefined' ? dbi(gain) : 0;
		this.noiseSource.connect(this.noiseGain);
		this.noiseGain.connect(this.masterGain);

		// connect to master gain
		this.masterGain.connect(audio.destination);

		// ?
		audio.resume();//hack
	};
	this.play = function (x, pan) {
		//pan = typeof pan != 'undefined' ? pan : typeof activity != 'undefined' && 'ear' in activity ? activity.ear == 'Left' ? -1 : activity.ear == 'Right' ? 1 : 0 : 0;
		pan = typeof pan != 'undefined' ? pan : ear == 2 ? -1 : ear == 3 ? 1 : 0;

		//
		if (typeof x[0] == 'number') {//monaural input
			// create stereo buffer
			try {
				var buffer = audio.createBuffer(2,x.length,audio.sampleRate);
			} catch (err) {
				alert(err+' '+x.length+' '+audio.sampleRate);
				audio.sampleRate = 48e3;
				var buffer = audio.createBuffer(2,x.length,audio.sampleRate);
			}

			// fill buffer
			var ch0 = buffer.getChannelData(0);
			var ch1 = buffer.getChannelData(1);
			for (let a = 0; a < buffer.length; a++) { ch0[a] = x[a]; ch1[a] = x[a]; }

			// audio source (stereo)
			this.signalSource = audio.createBufferSource(2,x.length,audio.sampleRate);
		} else {//stereo input
			// create stereo buffer
			var buffer = audio.createBuffer(2,x[0].length,audio.sampleRate);

			// fill buffer
			var ch0 = buffer.getChannelData(0);
			var ch1 = buffer.getChannelData(1);
			for (let a = 0; a < buffer.length; a++) { ch0[a] = x[0][a]; ch1[a] = x[1][a]; }

			// audio source (stereo)
			this.signalSource = audio.createBufferSource(2,x[0].length,audio.sampleRate);
		}

		// audio destination
		this.signalSource.buffer = buffer;

		// connect source to splitter
		var splitter = audio.createChannelSplitter(2);
		this.signalSource.connect(splitter);

		// connect splitter to gain
		var gainL = audio.createGain();
		splitter.connect(gainL, 0, 0);
		var gainR = audio.createGain();
		splitter.connect(gainR, 1, 0);

		// connect gains to merger
		var merger = audio.createChannelMerger(2);
		gainL.connect(merger, 0, 0);
		gainR.connect(merger, 0, 1);

		// connect merger to master gain
		merger.connect(this.signalGain);

		// signal gain
		this.signalGain.connect(this.masterGain);

		// connect master gain to audio destination
		this.masterGain.connect(audio.destination);

		// panner
		switch (pan) {
			case -1://left side only
				gainL.gain.value = 1;
				gainR.gain.value = 0; break;
			case 1://right side
				gainL.gain.value = 0;
				gainR.gain.value = 1; break;
			default:
				gainL.gain.value = 1;
				gainR.gain.value = 1;
		}

		// play it
		this.signalSource.start(0);
	};
	this.signal = function (signal, pan, delay, kill, loop) {
		let that = this;//extended scope

		// defaults
		delay = delay ? delay : 0;
		kill = typeof kill != 'undefined' ? kill : true;
		//pan = typeof pan != 'undefined' ? pan : typeof activity != 'undefined' && 'ear' in activity ? activity.ear == 'Left' ? -1 : activity.ear == 'Right' ? 1 : 0 : 0;
		pan = typeof pan != 'undefined' ? pan : ear == 2 ? -1 : ear == 3 ? 1 : 0;
		signal = signal ? signal : 'data/dichotic/calibrated/Track03_Stim1.wav';
		loop = loop ? loop : 0;

		// kill switch
		//if(kill&&typeof source!=='undefined'){source.stop()}

		// splitter
		var splitter = audio.createChannelSplitter(2);

		// connect splitter to gain
		var gainL = audio.createGain();
		splitter.connect(gainL, 0, 0);
		var gainR = audio.createGain();
		splitter.connect(gainR, 1, 0);

		// connect gains to merger
		var merger = audio.createChannelMerger(2);
		gainL.connect(merger, 0, 0);
		gainR.connect(merger, 0, 1);

		// connect merger to signal gain
		merger.connect(this.signalGain);

		// connect signal gain to master gain
		this.signalGain.connect(this.masterGain);

		// connect master gain to audio destination
		this.masterGain.connect(audio.destination);

		// panner
		switch (pan) {
			case -1://left side only
				gainL.gain.value = 1;
				gainR.gain.value = 0; break;
			case 1://right side
				gainL.gain.value = 0;
				gainR.gain.value = 1; break;
			default:
				gainL.gain.value = 1;
				gainR.gain.value = 1;
		}

		// media handler
		globe = signal;
		switch (typeof signal) {
			case 'object':
				if (signal instanceof AudioBuffer) {
					// special case for video elements
					if ('localName' in signal && signal.localName == 'video') {
						source = audio.createBufferSource();
						source.connect(splitter);
						source.start();
					} else {
						source = audio.createBufferSource();
						source.connect(splitter);
						source.buffer = signal;
						if (source.buffer.numberOfChannels == 2) {
							source.connect(splitter);
						} else {
							source.connect(gainL);
							source.connect(gainR);
						}
						source.start();
					}
				} else {
					// array of strings
					if (Array.isArray(signal)) {
						let canplay = 0;
						let source = [];
						for (let a = 0; a < signal.length; a++) {
							source[a] = new Audio(signal[a]);
							source[a].addEventListener('canplaythrough', event => {
								if (++canplay == signal.length) {
									for (let b = 0; b < source.length; b++) {
										if (delay) {
											setTimeout(()=>{
												eSource = audio.createMediaElementSource(source[b]);
												eSource.connect(splitter);
												source[b].play();//play does not work on iPad
											}, delay[b]);
										} else {
											eSource = audio.createMediaElementSource(source[b]);
											eSource.connect(splitter);
											source[b].play();//play does not work on iPad
										}
									}
								}
							});
						}
						break;
					}
				}
				break;
			case 'string':
				var request = new XMLHttpRequest();
				request.open('get',signal,true);
				request.responseType = 'arraybuffer';
				request.onload = () => {
					audio.decodeAudioData(request.response,
						function(incomingBuffer) {
							let source = audio.createBufferSource();
							source.buffer = incomingBuffer;
							if (source.buffer.numberOfChannels == 2) {
								source.connect(splitter);
							} else {
								source.connect(gainL);
								source.connect(gainR);
							}
							source.start();
						}
					);
				};
				request.send();
		}

		//loop
		if (loop==true){source.loop = true;}
	};
	this.snr = function (snr) {
		// convert from dB
		const gain = Math.pow(10,-Math.abs(snr)/20);

		// signal gain
		this.signalGain.gain.value = (snr > 0) ? 1 : gain;

		// noise gain
		if('noiseGain' in this){ this.noiseGain.gain.value = (snr < 0) ? 1 : gain; }
	};
	this.stop = function () {
		if ('noiseGain' in this) {
			switch (this.mediaHandler) {
				case 'HTML5': noise.pause(); break;
				case 'XMLHttpRequest': this.noiseSource.stop(0);
			}
		}
		activity.sound = false;
	};
	this.volume = function (gain) {
		gain = typeof gain !== 'undefined' ? gain : MASTERHOLD;
		MASTERGAIN = gain;
		this.masterGain.gain.value = dbi(Math.min(dsp.calibrate(1000,gain-200),0));
	}
}
