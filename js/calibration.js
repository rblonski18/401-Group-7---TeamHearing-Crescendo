function calibration(){
	activity = new Calibration();
	activity.layout();
}
function Calibration(){
	this.source = 'Pure Tone';
}
Calibration.prototype.calibrate = function(){
	try { signal.disconnect(0); javascriptNode.disconnect(0); } catch(e) {}
	switch (this.source) {
		case 'Pure Tone': this.tone(); break;
		case 'Pink Noise': this.pink(); break;
		case 'White Noise': this.white2();
	}
}
Calibration.prototype.brown = function() {
	if (typeof audio === 'undefined') {audio = new AudioContext();}
	
	// signal
	var bufferSize = 4096;
    var lastOut = 0.0;
    signal = audio.createScriptProcessor(bufferSize, 1, 1);
    signal.onaudioprocess = function(e) {
        var output = e.outputBuffer.getChannelData(0);
        var rms = 0;
        for (var i = 0; i < bufferSize; i++) {
            var white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // (roughly) compensate for gain
            rms = rms + lastOut*lastOut;
        }
        rms = Math.sqrt(rms/bufferSize);
        var max = 0;
        for (var i = 0; i < bufferSize; i++) {
            output[i] = output[i] / rms;
            max = Math.max(max, Math.abs(output[i]));
        }
        document.getElementById('info').innerHTML = max;
    }

	// gain
	gain = audio.createGain();
	gain.gain.value = 0.0625;
	
	// connect
	signal.connect(gain);
	gain.connect(processor.masterGain);
}
Calibration.prototype.pink = function() {
	if (typeof audio === 'undefined') {audio = new AudioContext();}
	
	// signal
	var bufferSize = 4096;
	var b0, b1, b2, b3, b4, b5, b6;
	b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
 	signal = audio.createScriptProcessor(bufferSize, 1, 1);
	signal.onaudioprocess = function(e) {
		var output = e.outputBuffer.getChannelData(0);
		var rms = 0;
		for (var i = 0; i < bufferSize; i++) {
			var white = Math.random() * 2 - 1;
			b0 = 0.99886 * b0 + white * 0.0555179;
			b1 = 0.99332 * b1 + white * 0.0750759;
			b2 = 0.96900 * b2 + white * 0.1538520;
			b3 = 0.86650 * b3 + white * 0.3104856;
			b4 = 0.55000 * b4 + white * 0.5329522;
			b5 = -0.7616 * b5 - white * 0.0168980;
			output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
			output[i] *= 0.11; // (roughly) compensate for gain
			b6 = white * 0.115926;
			
			rms = rms + output[i]*output[i];
		}
		rms = Math.sqrt(rms/bufferSize);
		var max = 0;
		for (var i = 0; i < bufferSize; i++) {
			output[i] = Math.pow(10,-24/20)*output[i] / rms;
			max = Math.max(max, Math.abs(output[i]));
		}
		
		// recalculate rms
		var rms = 0;
		for (var i = 0; i < bufferSize; i++) {
			rms = rms + output[i]*output[i];
    	}
		rms = Math.sqrt(rms/bufferSize);
		
		// display info
		document.getElementById('info').innerHTML = 'RMS power: ' + dsp.db(rms) + ' dB'
			+ '<br>Peak amplitude: ' + dsp.db(max) + ' dB';
	}

	// gain
	gain = audio.createGain();
	gain.gain.value = 1;
	
	// connect
	signal.connect(gain);
	gain.connect(processor.masterGain);
}
Calibration.prototype.harmonics = function() {
	if (typeof audio === 'undefined') {audio = new AudioContext();}
	
	//
	var frequency = 110;
	var numCoeffs = 30;//Math.floor(22050/frequency);
	var realCoeffs = new Float32Array(numCoeffs);
	var imagCoeffs = new Float32Array(numCoeffs);
	realCoeffs[0] = 0;
	imagCoeffs[0] = 0;
	for (var i = 1; i < numCoeffs; i++) {
		realCoeffs[i] = 0;
		imagCoeffs[i] = .01/(numCoeffs-1);
	}
	var wave = audio.createPeriodicWave(realCoeffs, imagCoeffs);
	console.log(wave);
	// signal
	signal = audio.createOscillator();
	signal.frequency.value = 110;
	signal.setPeriodicWave(wave);
	
	// filter
	filter = audio.createBiquadFilter();
	filter.type = 'bandpass';
	filter.frequency.value = 500;
	filter.Q.value = 10;
	console.log(filter);
	
	// gain
	gain = audio.createGain();
	gain.gain.value = Math.pow(10,-24/20)*(2/Math.sqrt(2));
    
	// connect
	signal.connect(filter);
	filter.connect(gain);
	gain.connect(processor.masterGain);
	signal.start(0);
}
function getAverageVolume(array) {
	var values = 0;
	var average;

	var length = array.length;

	// get all the frequency amplitudes
	for (var i = 0; i < length; i++) {
		values += array[i];
	}

	average = values / length;
	return average;
}
Calibration.prototype.tone = function() {
	if (typeof audio === 'undefined') {audio = new AudioContext();}
	
	// signal
	signal = audio.createOscillator();
	signal.frequency.value = 1000;
	
	// gain
	gain = audio.createGain();
	gain.gain.value = Math.pow(10,-24/20)*(2/Math.sqrt(2));

	// connect
	signal.connect(gain);
	gain.connect(processor.masterGain);
	signal.start(0);
	
	// display info
	document.getElementById('info').innerHTML = 'RMS power: -24 dB'
		+ '<br>Peak amplitude: ' + dsp.db(gain.gain.value) + ' dB';
}
Calibration.prototype.white = function() {
	if (typeof audio === 'undefined') {audio = new AudioContext();}
	
	// buffer
	var bufferSize = 2 * audio.sampleRate,
    noiseBuffer = audio.createBuffer(1, bufferSize, audio.sampleRate),
    output = noiseBuffer.getChannelData(0),
    rms = 0;
	for (var i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
		rms = rms + output[i]*output[i];
    }
	rms = Math.sqrt(rms/bufferSize);
	var max = 0;
	for (var i = 0; i < bufferSize; i++) {
		output[i] = 0.0625*output[i] / rms;
		max = Math.max(max, Math.abs(output[i]));
	}
	document.getElementById('info').innerHTML = rms;

	// signal
	signal = audio.createBufferSource();
	signal.buffer = noiseBuffer;
	signal.loop = true;

	// gain
	gain = audio.createGain();
	gain.gain.value = 1;
	
	// connect
	signal.connect(gain);
	gain.connect(processor.masterGain);
	signal.start(0);
}
Calibration.prototype.white2 = function() {
	if (typeof audio === 'undefined') {audio = new AudioContext();}
	
	// signal
	var bufferSize = 4096;
	signal = audio.createScriptProcessor(bufferSize, 1, 1);
	signal.onaudioprocess = function(e) {
		var output = e.outputBuffer.getChannelData(0);
		
		// calculate rms
		var rms = 0;
		for (var i = 0; i < bufferSize; i++) {
			output[i] = Math.random() * 2 - 1;
			rms = rms + output[i]*output[i];
    	}
		rms = Math.sqrt(rms/bufferSize);
		
		// scale and calculate max output
		var max = 0;
		for (var i = 0; i < bufferSize; i++) {
			output[i] = Math.pow(10,-24/20) * output[i] / rms;
			max = Math.max(max, Math.abs(output[i]));
		}
		
		// recalculate rms
		var rms = 0;
		for (var i = 0; i < bufferSize; i++) {
			rms = rms + output[i]*output[i];
    	}
		rms = Math.sqrt(rms/bufferSize);
		
		// display info
		document.getElementById('info').innerHTML = 'RMS power: ' + dsp.db(rms) + ' dB'
			+ '<br>Peak amplitude: ' + dsp.db(max) + ' dB';
	}
	
	// gain
	gain = audio.createGain();
	gain.gain.value = 1;
	
	// connect
	signal.connect(gain);
	gain.connect(processor.masterGain);
}

// Set the frequency of the oscillator and start it running.
Calibration.prototype.startTone = function(frequency) {
    var now = audio.currentTime;
    
    oscillator.frequency.setValueAtTime(frequency, now);
    
    // Ramp up the gain so we can hear the sound.
    // We can ramp smoothly to the desired value.
    // First we should cancel any previous scheduled events that might interfere.
    gain.gain.cancelScheduledValues(now);
    
    // Anchor beginning of ramp at current value.
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0.5, audio.currentTime + 0.1);
    
}
Calibration.prototype.stopTone = function() {
    var now = audio.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0.0, audio.currentTime + 1.0);
}
Calibration.prototype.layout = function() {
	var that = this;
	
	// main
	var main = layout.main(
		'Calibration',
		()=>{
			if(typeof mode!=='undefined'&&mode=='clinic'){clinic()}
			else{layout.dashboard()}},
		{	
			Help: () => {
				layout.message('Calibration','All sounds in TeamHearing are calibrated to have the same output level, as measured by root-mean-square (RMS) power. '
				+ 'To calibrate to a specific Sound Pressure Level (SPL), play one of the calibration sound sources and adjust '
				+ 'your system volume using an SPL meter.');
			}
		}
	);
	
	// calibration table
	var calibration = document.createElement('div');
	calibration.className = 'ui-widget-content';
	main.appendChild(calibration);
	
	//
	var table = document.createElement('table');
	table.style.width = '100%';
	calibration.appendChild(table);
	
	//
	var rowIndex = -1;
	
	// calibration
	var select = layout.select(['Uncalibrated','iPad 1','iPad 2','Surface Pro','ASUS','Laptop 1']);
	select.onchange = function () {
		document.cookie = 'calibration = ' + this.value;
		console.log(this.value);
	};
	select.value = getCookie('calibration') ? getCookie('calibration') : 'Uncalibrated';
	help = layout.help(
		'Calibration Mode',
		'Calibration mode allows the user to set the calibration curve based on their device.'
	);
	layoutTableRow(table, ++rowIndex, 'Calibration mode:', select, '',help);	
	
	// source
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Calibration Sound:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = document.createElement('select');
	select.style.fontSize = '100%';
	select.style.width = '100%';
	options = ['Pure Tone','Pink Noise','White Noise'];
	for (var a=0; a<options.length; a++) {
		var option = document.createElement('option');
		option.innerHTML = options[a];
		option.value = options[a];
		select.appendChild(option);
	}
	cell.appendChild(select);
	if (!iOS) {
		$(select).selectmenu({change: function() {
			that.source = this.value;
			button = document.getElementById('calibrate');
			if (button.playing) {
				button.onclick();
				button.onclick();
			}
		}});
	} else {
		select.onchange = function() {
			that.source = this.value;
			button = document.getElementById('calibrate');
			if (button.playing) {
				button.onclick();
				button.onclick();
			}
		};
	}
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	// help message
	var help = layout.help('Calibration Sound','The Pure Tone sound source is a 1000 Hz sinusoid.<br><br>'
				+'The White Noise sound source is generated by drawing from a uniform distribution.<br><br>'
				+'The Pink Noise sound source is generated by filtering the White Noise through a -3 dB per octave lowpass filter.<br><br>'
				+'All sound sources are scaled such that the root-mean-square amplitude is -24 dB relative to the peak amplitude of your sound card. Please adjust your '
				+'system\'s volume controls using a sound pressure level meter if you desire playback to be at a specific SPL.<br><br>'
				+'Acknowledgements: NoiseShack at NoiseShack.com');
	cell.appendChild(help);
	
	// master gain
	var input = layout.input(MASTERGAIN);
	input.onblur = function() {
		MASTERGAIN = Math.min(this.value,100);
		MASTERHOLD = MASTERGAIN;
		processor.volume(MASTERGAIN); 
		this.value = MASTERGAIN;
	};
	layoutTableRow(table,++rowIndex,'Master gain:',input,'dB');
	
	// calibrate button
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	var cell = row.insertCell(1);
	var button = document.createElement('button');
	button.id = 'calibrate';
	button.innerHTML = 'Start';
	button.onclick = function() {
		if (!this.playing) {
			that.calibrate();
			$(this).button({ label: 'stop' });
			this.playing = true;
		} else {
			gain.gain.value = 0;
			try { signal.disconnect(0); } catch(e) {}
			$(this).button({ label: 'start' });
			this.playing = false;
		}
	};
	cell.appendChild(button);
	jQuery(button).button();
	
	// info
	var info = document.createElement('span');
	info.id = 'info';
	jQuery(main).append(info);
	
	//
	layout.footer();
}