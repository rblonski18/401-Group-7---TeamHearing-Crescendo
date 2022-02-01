function synth(settings) {
	activity = new AFC({
		behavior: 'Adaptive',
		chances: 4,
		material: new Synth(settings),
		message: 'Which sound is higher in pitch?',
		mode: 'oddball',
		startmessage: 'Listen for which sound is higher in pitch.',
		trials: Infinity
	});
	
	// overrides
	for (let key in settings) { activity[key] = settings[key]; }
	
	// initialize
	activity.init();
}
function Synth(settings) {
	this.ID = 'synth';//points to database
	this.attack = .04;
	this.bandwidth = [1/4,1/4,1/4,1/4];
	this.condition = 0;
	this.depth = 100;
	this.difference = new Adaptive({rule:'exponential', value0:100, valueMax:200});
	this.duration = .4;
	this.f0 = 110;
	this.formants = [300,870,2240,3000];
	this.gain = -24;//dB rms re sound card max
	this.method = 0;//0:harmonics, 1:SAM tones
	this.mode = 0;//0:constant, 1:variable
	this.pan = 0;
	this.release = .04;
	this.rove = true;
	this.roveFreq = 1/4;
	this.roveGain = 6;
	this.scale = 'log';
	this.shift = 1;
	this.stimuli = [];
	this.tala = true;
	this.title = 'Synthetic Vowels';
	
	// overrides
	for (let key in settings) { this[key] = settings[key]; }
}
Synth.prototype.message = function (result) {
	let entry = result ? result.entry : '',
		f0 = result ? result.f0 : this.f0,
		score = result ? result.adaptive : this.difference.value;
	return entry+' F0 Resolution: '+score.toPrecision(3)+'% (f0:'+f0+').';
}
Synth.prototype.next = function () {
	// adaptive control
	this.difference.logic(activity.correct);
	document.getElementById('adaptive').innerHTML = 'Pitch Difference: '+this.difference.value.toPrecision(3);
	
	// loop through intervals
	let hold_formants; 
	for (let a = 0; a < activity.alternatives; a++) {
		const target = activity.call == a;
		
		// local copy
		let stimulus = jQuery.extend(true,{},this);
		
		// rove & adapt
		with (stimulus) {
			//shift formants according to f0
			switch (f0) {
				case 440: shift = Math.pow(2,5/12); break;
				case 220: shift = Math.pow(2,2/12); break;
				case 110: shift = 1; break;
			}
	
			// assign formant frequencies
			let n, vowels = [1,2,3,4];
			if (a == 0) {
				n = vowels[Math.floor(Math.random()*vowels.length)];
				vowels.splice((n-1),1);
			   
				//
				formants = dsp.formants(n);
				formants = formants.map(function(element){return element*shift;});
				hold_formants = formants.slice();
			} else {
				if (mode) {
					n = vowels[Math.floor(Math.random()*vowels.length)];
					formants = dsp.formants(n);
					formants = formants.map(function(element){return element*shift;});
				} else {
					formants = hold_formants;
				}
			}

			// rove frequency and gain
			if (rove) {
				// frequency roving
				if (roveFreq) {
					f0 *= Math.pow(2,roveFreq*(Math.random()-.5));
				}
				
				// gain roving
				if (roveGain) {
					gain += roveGain*(Math.random()-.5);
				}
			}
			
			// adapt
			f0 = target ? f0*Math.sqrt(1+difference.value/100) : f0/Math.sqrt(1+difference.value/100);

			// tala
			if (tala) {
				bandwidth.unshift(1/4);
				formants.unshift(f0);
			}

			// construct stimuli
			switch (method) {
				case 0: y = dsp.complex3(duration,bandwidth,f0,formants,scale); break;
				case 1: y = dsp.complex4(duration,f0,formants,depth);
			}
			y = dsp.ramp(y,attack,release);
			y = dsp.gain(y,gain);
			
			//
			this.stimuli[a] = y;
		}
	}
}
Synth.prototype.reset = function () {
	this.difference.value = this.difference.value0;
	
	//
	this.pan = activity.ear == 'Left' ? -1 : activity.ear == 'Right' ? 1 : 0;
	
	// reset duration (synchronized lights)
	activity.duration = this.duration;
};
Synth.prototype.save = function (data) {
	data.adaptive = this.difference.value;//dB HL if calibrated
	data.condition = this.condition;
	data.duration = this.duration;
	data.f0 = this.f0;
	data.mode = this.mode;
	return data;
}
Synth.prototype.settings = function (table, rowIndex) {
	let that = this;

	// mode
	var select = layout.select(['Constant','Variable']);
	select.onchange = function () { 
		that.mode = this.selectedIndex;
		activity.settings();
	};
	select.selectedIndex = this.mode;
	layoutTableRow(table,++rowIndex,'Stimulus:',select,'');
	
	// f0
	var input = layout.input(this.f0);
	input.onblur = function(){that.f0=Number(this.value)};
	var txt = this.method==0 ? 'Fundamental frequency:' : 'Modulation frequency:';
	layoutTableRow(table,++rowIndex,txt,input,'Hz');
		
	// stimulus duration
	var input = layout.input(this.duration*1e3);
	input.onblur = function(){that.duration=Number(this.value)/1e3};
	layoutTableRow(table,++rowIndex,'Stimulus duration:',input,'ms');
};
Synth.prototype.stimulus = function (interval) {
	interval = typeof interval !== 'undefined' ? interval : activity.call;
	
	// select interval
	let y = this.stimuli[interval];
	
	// play it
	processor.play(y);
	
	// return y for plotting
	return y;
};