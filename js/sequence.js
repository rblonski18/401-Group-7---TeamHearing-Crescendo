function harmonics(settings) {
	// defaults
	let defaults = {
		behavior: 'Adaptive',
		chances: 4,
		mode: 'oddball',
		percept: true,
		trials: Infinity
	}
	for (let key in defaults) { if (!(key in settings)) { settings[key] = defaults[key]; }}

	// initialize activity
	activity = new AFC(settings);

	// inialize material
	activity.material = new Harmonics(settings);

	// initialize
	activity.init();
}
function Harmonics(settings) {
	this.ID = 'harmonics';//points to database
	this.activity = 2;//0:DTs, 1:FDTs, 2:F0DTs, 3:IDTs, 4:MDTs
	this.attack = .04;
	this.depth = 200;//modulation depth (%, 200 is transposed)
	this.difference = new Adaptive({rule:'exponential', value0:100, valueMax:200});
	this.duration = .4;
	this.filter = {bandwidth:1/4, frequency:1000, type:'lowpass'};
	this.fs = undefined;//soon obsolete, controlled by audio context
	this.f0 = 110;
	this.f0_rove = 1/4;
	this.f1 = 1000;
	this.f1_rove = 1/4;
	this.gain = -12;//dB rms re sound card max
	this.gain_rove = 6;
	this.masker = false;//delay:0, f0:220, f1:4000;
	this.method = 0;//0:modulated sinusoids, 1:filtered complexes, 2:modulated chirps, 3:modulated noise
	this.pan = 0;
	this.release = .36;
	this.stimuli = [];
	this.title = 'Percept';

	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }

	// special cases
	switch (this.activity) {
		case 0: this.difference = new Adaptive({rule:'linear'}); this.f1_rove = 0; this.gain_rove = 0;
		activity.volume = {message: 'Set the volume to be soft but audible.'};
	}

	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }
}
Harmonics.prototype.adaptive = function () {
	this.difference.logic(activity.correct);

	// message depends on activity
	if (activity.feedback) {
		const score = this.difference.value.toPrecision(3);
		let message;
		switch (this.activity) {
			case 0: message = 'Level: ' + score + ' dB'; break;
			case 1: message = 'Frequency difference: ' + score + '%'; break;
			case 2: case 5: message = 'F0 difference: ' + score + '%'; break;
			case 3: message = 'Intensity difference: ' + score + ' dB'; break;
			case 4: message = 'Modulation depth: ' + score + '%';
		}
		document.getElementById('adaptive').innerHTML = message;
	}
}
Harmonics.prototype.message = function (result) {
	const activity = result ? result.activity : this.activity,
		difference = result ? result.difference : this.difference.value,
		entry = result ? result.entry : '',
		f0 = result ? result.f0 : this.f0,
		f1 = result ? result.f1 : this.f1,
		score = difference.toPrecision(3);
	switch (this.activity) {
		case 0: message = entry + ' Detection Threshold: ' + score + ' dB at ' + f1 + ' Hz.'; break;
		case 1: message = entry + ' Frequency Resolution: ' + score + '% at ' + f1 + ' Hz.'; break;
		case 2: case 5: message = entry + ' F0 Resolution: ' + score + '% (f0:' + f0 + ', f1:' + f1 + ').'; break;
		case 3: message = entry + ' Intensity difference: ' + score + ' dB (f0:' + f0 + ', f1:' + f1 + ').'; break;
		case 4: message = entry + ' Modulation depth: ' + score + '% (f0:' + f0 + ', f1:' + f1 + ').';
	}
	return message;
}
Harmonics.prototype.next = function () {
	//
	let f0_hold, f1_hold, gain_hold, y;

	// loop through intervals
	for (let a = 0; a < activity.alternatives; a++) {
		const target = activity.call == a;

		// local copy
		let stimulus = jQuery.extend(true,{},this);

		// rove & adapt
		with (stimulus) {
			const diff = difference.value;
			switch (activity) {
				case 0://DTs
					// rove
					f0 = f0 * Math.pow(2,f0_rove*(Math.random()-.5));
					f1 = f1 * Math.pow(2,f1_rove*(Math.random()-.5));

					// adapt
					gain = target
						? -dsp.calibrate(f1,-diff) - db(processor.masterGain.gain.value)
						: -Infinity;
					break;
				case 1://FDTs
					// rove
					f0 = this.f0 * Math.pow(2,f0_rove*(Math.random()-.5));
					if (a == 0) {
						f1 = f1 * Math.pow(2,f1_rove*(Math.random()-.5));
						f1_hold = f1;
					} else {
						f1 = f1_hold;
					}
					gain = this.gain + gain_rove * (Math.random()-.5)

					// adapt
					f1 = target ? f1 * Math.sqrt(1+diff/100) : f1 / Math.sqrt(1+diff/100);
					break;
				case 2://F0DTs
					// rove
					if (a == 0) {
						f0 = f0 * Math.pow(2,f0_rove*(Math.random()-.5));
						f0_hold = f0;
					} else {
						f0 = f0_hold;
					}
					f1 = this.f1 * Math.pow(2,f1_rove*(Math.random()-.5));
					gain = this.gain + gain_rove * (Math.random()-.5);

					// adapt
					f0 = target ? f0 * Math.sqrt(1+diff/100) : f0 / Math.sqrt(1+diff/100);
					break;
				case 3://IDTs
					// rove
					if (a == 0) {
						f0 = f0 * Math.pow(2,f0_rove*(Math.random()-.5));
						f1 = f1 * Math.pow(2,f1_rove*(Math.random()-.5));
						gain = gain + gain_rove * (Math.random()-.5);
						f0_hold = f0;
						f1_hold = f1;
						gain_hold = gain;
					} else {
						f0 = f0_hold;
						f1 = f1_hold;
						gain = gain_hold;
					}

					// adapt
					gain = target ? gain : gain - diff;
					break;
				case 4://MDTs
					// rove
					f0 = this.f0 * Math.pow(2,f0_rove*(Math.random()-.5));
					f1 = this.f1 * Math.pow(2,f1_rove*(Math.random()-.5));
					gain = this.gain + gain_rove * (Math.random()-.5);

					// adapt
					depth = target ? diff : 0;
					break;
				case 5://joint F0/F1
					// rove
					if (a == 0) {
						f0 = f0 * Math.pow(2,f0_rove*(Math.random()-.5));
						f0_hold = f0;
					} else {
						f0 = f0_hold;
					}
					gain = this.gain + gain_rove * (Math.random()-.5);

					// adapt
					f0 = target ? f0 * Math.sqrt(1+diff/100) : f0/Math.sqrt(1+diff/100);
					f1 = 4 * f0;
			}
			if(debug){console.log(depth.toFixed(1),f0.toFixed(1),f1.toFixed(1),gain.toFixed(1))}

			// construct stimuli
			switch (method) {
				case 0://modulated tone
					y = dsp.tone(duration,f1,1,0);
					y = dsp.modulation(y,f0,depth/100);
					break;
				case 1://filtered complex
					filter.frequency = f1;
					y = dsp.complex(duration,f0,-1);
					break;
				case 2://chirped modulation
					let frequencyDifference = f0*(Math.pow(2,change*direction)-1),
						phasef0 = 0,
						phasef1 = f1/fs;
					for (let n = 0; n < samples; n++) {
						if (n >= (duration*fs)-(0.2*fs)) {
							f0 += frequencyDifference/(0.2*fs);
						}
						phasef0 += f0/fs;
						mod = Math.max(1-m*Math.cos(2*Math.PI*phasef0)-Math.max(m-1,0),0);
						y[n] = Math.sin(2*Math.PI*n*(f1/fs))*mod;
					}
					break;
				case 3://modulated noise
					y = dsp.noise(duration);
					const coeffs = dsp.noise_filter(filter);
					y = dsp.filter(y,coeffs);
					y = dsp.modulation(y,f0,depth/100);
			}

			// ramp
			y = dsp.ramp(y,attack,release);

			// gain
			y = dsp.gain(y,gain);

			// masker
			if (masker) {
				var delay = masker.delay ? Math.round(masker.delay*fs) : 0,
					f0 = masker.f0_track ? masker.f0_track.last() : masker.f0,
					f1 = masker.f1_track ? masker.f1_track.last() : masker.f1,
					masker = [],
					samples = delay+y.length;
				if(debug){console.log('masker: delay',delay,'f0',f0.toFixed(),'f1',f1.toFixed())}

				// modulated tone
				masker = dsp.tone(duration,f1,1,0);
				masker = dsp.modulation(masker,f0,depth/100);

				// ramp
				masker = dsp.ramp(masker,attack,release);

				// add target into masker
				if (delay > 0) {
					for (let n = 0; n < y.length; n++) {
						masker[n+delay] += y[n];
					}
					y = masker;
				} else {
					for (let n = 0; n < masker.length; n++) {
						y[n-delay] += masker[n];
					}
				}
			}

			// save into object
			this.stimuli[a] = y;
		}
	}
}
Harmonics.prototype.protocols = function (options, callbacks, messages) {
	var that = this;

	// protocols based on activity
	switch (this.activity) {
		case 0://detection thresholds
			options.push(
				'Detection Thresholds at 250, 1000, 4000, and 8000 Hz',
				'Detection Thresholds from 125 to 8000 Hz (octave steps)'
			);
			callbacks.push(
				function () {
					protocol.activity = 'harmonics';
					protocol.random = false;
					protocol.settings = [];
					var f1 = [250,1e3,4e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								method: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							})
						});
					}
					protocol.start();
				},
				function () {
					protocol.activity = 'harmonics';
					protocol.random = false;
					protocol.settings = [];
					var f0 = [0], f1 = [125,250,500,1000,2000,4000,8000,12000], i = 0;
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								method: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							})
						});
					}
					protocol.start();
				}
			);
			messages.push(
				'',
				''
			);
			break;
		case 1://frequency discrimination
			options.push(
				'Frequency Discrimination at 500, 1000, 2000 Hz',
				'Frequency Discrimination from 125 to 8000 Hz (octave steps)'
			);
			callbacks.push(
				function () {
					protocol.activity = 'harmonics';
					protocol.random = false;
					protocol.settings = [];
					var f1 = [500,1000,2000];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings[a] = {
							material: new Harmonics({
								activity: that.activity,
								duration: 0.4,
								f0: 0,
								f1: f1[a],
								method: that.method
							}),
						};
					}
					protocol.start(3);
				},
				function () {
					protocol.activity = 'harmonics';
					protocol.random = false;
					protocol.settings = [];
					var f1 = [125,250,500,1000,2000,4000,8000];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings[a] = {
							material: new Harmonics({
								activity: that.activity,
								f0: 0,
								f1: f1[a],
								method: that.method
							})
						};
					}
					protocol.start();
				}
			);
			messages.push(
				'',
				''
			);
			break;
		case 2://f0 discrimination
			options.push(
				'F0 Discrimination at 110, 220, 440 Hz'
			);
			callbacks.push(
				function () {
					protocol.activity = 'harmonics';
					protocol.settings = [];
					var f0 = [110,220,440];
					for (var a = 0; a < f0.length; a++) {
						protocol.settings[a] = {
							material: new Harmonics({
								activity: that.activity,
								f0: f0[a],
								f1: 1000,
								method: that.method
							}),
						};
					}
					protocol.start(3);
				}
			);
			messages.push('');
			break;
		case 3://intensity discrimination
			options.push(
				that.method == 0
				? 'Loudness Discrimination at 500, 1000, 2000 Hz'
				: 'Loudness Discrimination at 110, 220, 440 Hz'
			);
			callbacks.push(
				function () {
					var f0 = that.method == 0 ? [0] : [110,220,440],
						f1 = that.method == 0 ? [500,1000,2000] : [1000],
						i = 0;

					protocol.activity = 'harmonics';
					protocol.settings = [];
					for (var a = 0; a < f0.length; a++) {
						for (var b = 0; b < f1.length; b++) {
							protocol.settings[i++] = {
								material: new Harmonics({
									activity: that.activity,
									f0: f0[a],
									f1: f1[b],
									method: that.method
								}),
							};
						}
					}
					protocol.start();
				}
			);
			messages.push('');
			break;
		case 4://modulation detection
			options.push(
				'Modulation Detection at 10, 110, 220, 440 Hz'
			);
			callbacks.push(
				function() {
					protocol.activity = 'harmonics';
					protocol.random = false;
					protocol.settings = [];
					var f0 = [10,110,220,440];
					for (var a = 0; a < f0.length; a++) {
						protocol.settings[a] = {
							alternatives: 3,
							material: new Harmonics({
								activity: that.activity,
								f0: f0[a],
								f1: 1000,
								method: 0
							})
						};
					}
					protocol.start();
				}
			);
			messages.push('');
	}
	return [options,callbacks,messages];
};
Harmonics.prototype.reset = function () {
	// ear
	this.pan = activity.ear == 'Left' ? -1 : activity.ear == 'Right' ? 1 : 0;

	// activity switch
	switch (this.activity) {
		case 0:
			activity.behavior = 'Adaptive';
			activity.message = 'Which interval contained the tone?';
			this.difference.value0 = MASTERGAIN;
			this.difference.valueMax = 100;
			this.roveGain = 0;
			this.startmessage = 'Listen for the tone.';
			this.title = 'Detection Thresholds';
			break;
		case 1:
		case 2:
		case 5:
			activity.message = 'Which sound was higher in pitch?';
			this.startmessage = 'Listen for the sound with the higher pitch.';
			this.title = 'Frequency Discrimination';
			break;
		case 3:
			activity.message = 'Which sound was louder?';
			this.roveGain = 0;
			this.startmessage = 'Listen for the louder sound.';
			this.title = 'Intensity Discrimination';
			break;
		case 4:
			activity.behavior = 'Adaptive';
			activity.message = 'Which sound was modulated?';
			this.startmessage = 'Listen for the modulated sound.';
			this.title = 'Modulation Detection';
	}

	// adaptive variable
	this.difference.reset();

	// reset duration (synchronized lights)
	activity.duration = this.duration;

	//
	this.next();
};
Harmonics.prototype.results = function (data) {
	// parse results
	results = jQuery.parseJSON(data);
	results.sort(compare);

	// no results
	if (results.length == 0) {
		main.insertAdjacentHTML('beforeend','No results.');
		return;
	}

	// summary chart (init)
	var resultsSorted = [];
	var summary = document.createElement('div');
	summary.style.height = '50%';
	main.appendChild(summary);

	// details
	main.insertAdjacentHTML('beforeend','<h3>History</h3>');

	// horizontal rule
	main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');

	// accordion (init)
	var accordion = document.createElement('div');
	accordion.id = 'results';
	main.appendChild(accordion);

	// accordion (content)
	var scaleType = (this.difference.rule == 'linear') ? 'linear' : 'log';
	for (let item = 0, items = results.length; item < items; item++) {
		var result = results[item];

		// threshold
		var series = result.series.split(','),
			threshold = Number(series[series.length-1]);//last value
		result.difference = threshold;

		// condition
		var condition = [2,4].indexOf(this.activity) > -1 ? result.f0 : result.f1;

		// heading
		var heading = document.createElement('h3');
		heading.innerHTML = this.message(result);
		accordion.appendChild(heading);

		// container
		var container = document.createElement('div');
		accordion.appendChild(container);

		// information
		for (var key in result) {
			container.insertAdjacentHTML('beforeend',key+': '+result[key]+'<br>');
		}
		container.setAttribute('unselectable','off');

		// chart into container
		var chart_div = document.createElement('div');
		chart_div.style.width = '80%';
		container.appendChild(chart_div);

		// adaptive track
		var data = [];
		data[0] = ['Trial','Adaptive Variable'];
		var series = result.series.split(',');
		for (var a = 1; a <= series.length; a++) {
			data[a] = [a, Number(series[a-1])];
		}

		// adaptive variable versus trial
		var chart = new google.visualization.LineChart(chart_div),
			data = google.visualization.arrayToDataTable(data);
		chart.draw(data, {
				chartArea: {height: '50%', width: '70%'},
				hAxis: {title: 'Trial'},
				legend: {position: 'none'},
				title: 'Adaptive Series',
				vAxis: {scaleType: scaleType, title: 'Adaptive Variable'}
		});

		// sort results for summary plot
		resultsSorted.push([Number(condition),Number(threshold)]);
	}

	// accordion (activate)
	jQuery(accordion).accordion({
		active: false,
		collapsible: true,
		heightStyle: 'content'
	});

	// summary chart
	var data = [],
		title = 'Detection Thresholds',
		xdata = 'Frequency',
		xlabel = 'Frequency (Hz)',
		ydata = 'Detection Threshold',
		ylabel = 'Detection Threshold (dB)',
		yscale = (this.activity == 0) ? 'linear' : 'log';

	//
	switch (this.activity) {
		case 1:title='Frequency Discrimination';ydata='Discrimination Threshold';ylabel=ydata+' (%)';break;
		case 2:case 5:title='F0 Discrimination';ydata='Discrimination Threshold';ylabel=ydata+' (%)';break;
		case 3:title='Intensity Discrimination';ydata='Discrimination Threshold';ylabel=ydata+'(dB)';break;
		case 4:title='Modulation Detection';ylabel='Detection Thresholds (%)';
	}

	// activity configuration
	var vAxis = (this.activity == 0)
		? {
			maxValue: 60,
			minValue: -20,
			scaleType: yscale,
			textStyle : {
				fontSize: 24 // or the number you want
			},
			ticks: [-20,0,20,40,60],
			title: ylabel,
			titleTextStyle: {
				fontSize: 36
			},
			viewWindow: {
				max: 60,
				min: -20
			}
		} : {
			scaleType: yscale,
			textStyle : {
				fontSize: 24 // or the number you want
			},
			title: ylabel,
			titleTextStyle: {
				fontSize: 36
			},
		};

	// draw the chart
	var data; data[0] = [xdata,ydata];
	for (let a = 0; a < resultsSorted.length; a++) { data.push(resultsSorted[a]); }
	var data = google.visualization.arrayToDataTable(data);
	var chart = new google.visualization.ScatterChart(summary);
	chart.draw(data,{
		chartArea: {width:'80%'},
		hAxis: {
			logScale: true,
			maxValue: 16000,
			minValue: 100,
			textStyle : {
				fontSize: 24 // or the number you want
			},
			ticks: [
				{v:125, f:''},
				{v:250, f:'250'},
				{v:500, f:''},
				{v:1000, f:'1000'},
				{v:2000, f:''},
				{v:4000, f:'4000'},
				{v:8000, f:''},
				{v:16000, f:'16000'}
			],
			title: 'Frequency (Hz)',
			titleTextStyle: {
				fontSize: 36
			}
		},
		legend: {position: 'none'},
		title: title,
		vAxis: vAxis
	});
}
Harmonics.prototype.save = function (data) {
	data.activity = this.activity + 4;
	data.depth = this.depth;
	data.duration = this.duration;
	data.filtertype = this.filter.type;
	data.f0 = this.f0;
	data.f1 = this.f1;
	data.f02 = this.masker ? this.masker.f0 : 0;
	data.f12 = this.masker ? this.masker.f1 : 0;
	data.method = this.method;
	data.series = this.difference.history.join(',');
	return data;
}
Harmonics.prototype.settings = function (table, rowIndex) {
	let that = this;

	// activity
	var select = layout.select([
		'Detection',
		'Frequency Discrimination',
		'F0 Discrimination',
		'Intensity Discrimination',
		'Modulation Detection'
	]);
	select.onchange = function () {
		that.activity = this.selectedIndex;
		that.reset();
	};
	select.selectedIndex = this.activity;
	layoutTableRow(table,++rowIndex,'Activity:',select,'');

	// stimulus
	var select = layout.select([
		'Modulated Tone',
		'Filtered Harmonic Complex',
		'Modulated Chirps',
		'Modulated Noise'
	]);
	select.onchange = function () {
		that.method = this.selectedIndex;
		activity.settings();
	};
	select.selectedIndex = this.method;
	layoutTableRow(table,++rowIndex,'Stimulus:',select,'');

	// f0
	var input = layout.input(this.f0);
	input.onblur = function() { that.f0 = Number(this.value); };
	var txt = (this.method == 0) ? 'Modulation frequency:' : 'Fundamental frequency:';
	layoutTableRow(table,++rowIndex,txt,input,'Hz');

	// f1 | filter frequency
	var input = layout.input(this.f1);
	input.onblur = function() {
		that.f1 = Number(this.value);
	};
	var txt = (this.method == 0) ? 'Carrier frequency:' : 'Filter frequency:';
	layoutTableRow(table,++rowIndex,txt,input,'Hz');

	// filter type
	if (this.method == 1) {
		var select = layout.select(['bandpass','highpass','lowpass']);
		select.onchange = function () {
			that.filter.type = this.value;
		};
		select.value = this.filter.type;
		layoutTableRow(table,++rowIndex,'Filter type:',select,'Hz');
	}

	// stimulus duration
	var input = layout.input(this.duration*1e3);
	input.onblur = function () { that.duration = Number(this.value)/1e3; };
	layoutTableRow(table,++rowIndex,'Stimulus duration:',input,'ms');
};
Harmonics.prototype.start = function () {
	switch (this.activity) {
		case 1:
		case 2:
		case 5:
			layout.message(this.title,
				'In this exercise, you are trying to hear which tone is higher in pitch. '
				+'Before starting, you can listen to examples '
				+'by pressing the buttons below.',
				{
					Low: ()=>{activity.material.stimulus(1)},
					High: ()=>{activity.material.stimulus(0)},
					Okay: function () {
						jQuery(this).dialog('destroy').remove();
						activity.disabled = false;
						activity.next();
					}
				}
			);
			break;
		case 3:
			layout.message(this.title,
				'In this exercise, you are trying to hear which tone is louder. '
				+'Before starting, you can listen to examples '
				+'by pressing the buttons below.',
				{
					Softer: ()=>{activity.material.stimulus(1)},
					Louder: ()=>{activity.material.stimulus(0)},
					Okay: function () {
						jQuery(this).dialog('destroy').remove();
						activity.disabled = false;
						activity.next();
					}
				}
			);
			break;
		case 4:
			layout.message(this.title,
				'In this exercise, you are trying to hear modulation of a tone.'
				+'</br>Before starting, you can listen to examples '
				+'by pressing the buttons below.',
				{
					Modulated: ()=>{activity.material.stimulus(0)},
					Unmodulated: ()=>{activity.material.stimulus(1)},
					Okay: function () {
						jQuery(this).dialog('destroy').remove();
						activity.disabled = false;
						activity.next();
					}
				}
			);
			break;
		default:
			layout.message(this.title,
				this.startmessage
				+' Press Okay to start.',
				{
					Okay: function () {
						jQuery(this).dialog('destroy').remove();
						activity.disabled = false;
						activity.next();
					}
				}
			);
	}

	// keypress
	document.onkeypress = function (e) {
		e = e || window.event;
		if (e.keyCode == 32 || e.key == 0) { jQuery('#repeat').click(); }
		for (let a = 1; a < 10; a++) {
			if (e.key == a) {
				jQuery('#afc'+String(a-1)).click();
			}
		}
		if (e.key == '?') { activity.settings(); }
	};
}
Harmonics.prototype.stimulus = function (interval) {
	interval = typeof interval !== 'undefined' ? interval : activity.call;
	//
	if (this.stimuli["length"] == 0) {
		this.next();
	}

	// select interval
	let y = this.stimuli[interval];

	// play it
	processor.play(y);

	// return y for plotting
	return y;
};
Harmonics.prototype.variable = function () {
	// message depends on activity
	const score = this.difference.value.toPrecision(3);
	let message;
	switch (this.activity) {
		case 0: message = 'Intensity: ' + score + ' dB'; break;
		case 1: message = 'Frequency difference: ' + score + '%'; break;
		case 2: case 5: message = 'F0 difference: ' + score + '%'; break;
		case 3: message = 'Intensity difference: ' + score + ' dB'; break;
		case 4: message = 'Modulation depth: ' + score + '%'; break;
		default: message = this.activity;
	}
	return message;
};
