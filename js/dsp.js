jQuery.ajax({
	data: {
		subuser: subuser.ID
	},
	success: function(data, status) {
		temp = data;
		console.log(temp);
		console.log(window.jQuery);
		console.log(jQuery.parseJSON(data));
		if (data.length > 2) {
			loudness = jQuery.parseJSON(data)[0].loudness.split(',').number();
			MASTERGAIN = loudness[2];
			MASTERHOLD = MASTERGAIN;
		}
	},
	type: 'GET',
	url: 'version/'+version+'/php/loudness.php'
});
dsp = {
  add: function (x, y, delay) {
		const fs = typeof audio !== 'undefined' && 'sampleRate' in audio ? audio.sampleRate : 44100;
		delay = delay ? Math.round(delay*fs) : 0;
		delay = Math.max(delay,0);

		// extend y if necessary
		if (y.length < delay + x.length) {
			for (let n = y.length; n <= delay + x.length; n++) {
				y[n] = 0;
			}
		}

		//
    for (let n = 0; n < x.length; n++) {
			y[n+delay] += x[n];
		}
		return y;
    },
	bandpass: function (bw, x, x0) {
		return Math.max(1-Math.pow((x-x0)/bw, 2), 0);
	},
	calibrate: function (frequency, gain, calibration) {
		// defaults
		frequency = typeof frequency !== 'undefined' ? frequency : 1000,
		gain = typeof gain !== 'undefined' ? gain : 0,
		calibration = typeof calibration !== 'undefined'
				? calibration : getCookie('calibration')
					? getCookie('calibration') : 'no';

		// convert frequency to log spacing
		frequency = Math.log2(frequency/125);

		// which compensation
		let coefficients = [[100],[100]];
		switch (calibration) {
			case 'iPad 1': coefficients = [[0.2992,-3.614,10.42,9.117,73.71],[0.1506,-1.868,3.986,16.32,73.08]];break;
			case 'iPad 2': coefficients = [[0.1122,-0.9031,-2.411,29.01,72.77],[0.008996,0.6228,-9.592,37.81,72.68]];break;
			case 'Surface Pro': coefficients = [[-2.407,20.34,67.46],[-2.407,20.34,67.46]];break;
			case 'ASUS': coefficients = [[-0.8571,7.69,80.83],[-1.054,8.958,78.46]];break;
			case 'Laptop 1': coefficients = [[-3.6871,24.6934,65.2391],[-3.6871,24.6934,65.2391]];
		}

		// calculate compensation
		let compensation = [gain,gain];
		for (let a = 0; a < coefficients.length; a++) {
			for (let b = 0; b < coefficients[a].length; b++) {
				compensation[a] += coefficients[a][b]*Math.pow(frequency,coefficients[a].length-b-1);
			}
		}
		return compensation[0].toFixed();
	},
	complex: function (duration, f0, slope) {
		if (f0 == 0) { alert('f0 cannot be 0'); return; }

		// inputs
		duration = duration ? duration : .4;
		f0 = f0 ? f0 : 110;
		slope = slope ? slope : -1;//dB per 100 Hz
		console.log(duration,f0,slope);

		// init
		const upperBound = 4e3;//audio.sampleRate/2
		let gain = 0, spectrum = [], y = [];

		// harmomic complex
		for (let n = 1; n <= upperBound/f0; n++) {//loop over harmonics
			gain = Math.pow(10,(slope*f0*(n-1)/100)/20);
			y = dsp.add(dsp.tone(duration,f0*n,gain,0),y);
		}
		return dsp.gain(y,-24,'','rms');
	},
	complex1: function (duration, filter, f0) {
		if(f0==0){alert('f0 cannot be 0');return}
		spectrum = [];
		const upperBound = 1e4;//audio.sampleRate/2
		let gain, y = [];
		for (let n = 1; n <= upperBound/f0; n++) {
			gain = dsp.polyfilter(filter.bandwidth,f0*n,filter.frequency,filter.type);
			spectrum.push(gain);
			if(!gain){continue}
			y = dsp.add(dsp.tone(duration,f0*n,gain,0),y);
		}
		//console.log(filter.frequency); dsp.plot(spectrum);
		return dsp.gain(y,-24);
	},
	complex2: function (duration,filter,f0) {
		const fs = typeof audio !== 'undefined' && 'sampleRate' in audio ? audio.sampleRate : 44100;

		var a = filter[1],
			b = filter[0];
			period = fs/f0,
			pulsedistance = 0,
			x = [];
		for (var n = 0; n < duration*fs; n++) {
			// keep track of pulse distance
			if (pulsedistance > period/2) {
				pulsedistance -= period;
			}

			// interpolated pulse train (sync function)
			x[n] = pulsedistance == 0
				? 1
				: Math.sin(Math.PI*pulsedistance)/(Math.PI*pulsedistance);

			// filter
			if (n > 1) {
				y[n] = b[0]*x[n]+b[1]*x[n-1]+b[2]*x[n-2]-a[1]*y[n-1]-a[2]*y[n-2];
			} else if (n == 1) {
				y[n] = b[0]*x[n]+b[1]*x[n-1]-a[1]*y[n-1];
			} else if (n == 0) {
				y[n] = b[0]*x[n];
			}

			// increment pulsedistance
			pulsedistance++;
		}
		return y;
	},
	complex3: function (duration, bandwidth, f0, formants, scale) {
		if (f0 == 0) { alert('f0 cannot be 0'); return; }

		// inputs
		duration = duration ? duration : .01;
		bandwidth = bandwidth ? bandwidth : [10, 440, 440, 440];
		f0 = f0 ? f0 : 220;
		formants = formants ? formants : [100, 500, 1000, 2000];
		scale = scale ? scale : 'linear';
		console.log(duration,bandwidth,f0,formants,scale);

		// init
		const slope = -6, upperBound = 1000;//audio.sampleRate/2
		let gain = 0, spectrum = [], y = [];

		// harmomic complex
		let bw, x, x0;
		for (let n = 1; n <= upperBound/f0; n++) {//loop over harmonics
			let gain0 = 0;
			for (let a = 0; a < formants.length; a++) {//loop over formants
				//
				bw = Array.isArray(bandwidth) ? bandwidth[a] : bandwidth;
				x = scale == 'linear' ? f0*n : Math.log2(f0*n);
				x0 = scale == 'linear' ? formants[a] : Math.log2(formants[a]);

				//
				gain = dsp.bandpass(bw, x, x0);
				gain *= dbi(slope*Math.log2(n));
				gain = Math.max(gain0, gain);
				gain0 = gain;
			}
			console.log(gain0); spectrum.push(gain0);
			if(!gain){continue}
			y = dsp.add(dsp.tone(duration, f0*n, gain0, 0), y);
		}
		//dsp.plot(spectrum);
		return dsp.gain(y,-24);
	},
	complex4: function (duration, f0, formants, depth) {
		duration = duration ? duration : .4;
		f0 = f0 ? f0 : 100;
		formants = formants ? formants : [500,1000,2000];
		depth = depth ? depth : 100;
		console.log(duration,f0,formants,depth);

		// init
		let gain, m, x = [], y = [];
		const slope = -6;

		// loop over formants
		for (let a = 0; a < formants.length; a++) {
			//
			gain = dbi(slope*Math.log2(formants[a]/formants[0]));

			// tone
			x = dsp.tone(duration,formants[a],gain,0);

			// modulate
			m = depth.isArray ? depth[a]/100 : depth/100;
			if (f0 != formants[a]) {
				x = dsp.modulation(x,f0,m);
			}

			// add to mix
			y = dsp.add(x,y);
		}
		return dsp.gain(y,-24);
	},
	db: function (x) {
		return 20*Math.log(x)/Math.LN10;
	},
  gain: function (x, gain, method, mode) {
		method = method ? method : 'dB';
		mode = mode ? mode : '';
		let scale;

		//
		switch (method) {
			case 'dB': gain = Math.pow(10, gain/20); break;
		}

		//
		switch (mode) {
			case 'rms':
				let rms = 0;
				for (let n = 0; n < x.length; n++) {
					rms += x[n]*x[n];
				}
				rms = Math.sqrt(rms/x.length);
				gain = gain/rms;
				break;
		}

		// change x's rms to gain
		for (let n = 0; n < x.length; n++) {
			x[n] *= gain;
		}
		return x;
	},
	filter: function (x, filter) {
		// shorthand
		const a = filter[0];//feedback
		const b = filter[1];//feedforward

		// assumes 2nd order (for now)
		let y = [];
		y[0] = b[0]*x[0];
		y[1] = b[0]*x[1] + b[1]*x[0] - a[1]*y[0];
		for (let n = 2; n < x.length; n++) {
			y[n] = b[0]*x[n] + b[1]*x[n-1] + b[2]*x[n-2] - a[1]*y[n-1] - a[2]*y[n-2];
		} return y;
	},
	formants: function (x) {
		switch (x) {
			case 1: //AA
				return [730,1090,2440,4000];
			case 2: //AE
				return [660,1720,2410,4000];
			case 3: //AH
				return [520,1190,2390,4000];
			case 4: //ER
				return [490,1350,1690,4000];
			case 5: //IY
				return [270,2290,3010,4000];
			case 6: //UW
				return [300,870,2240,4000];
		}
	},
	interleave: function (x, y) {
		var n = 0, n_x = 0, n_y = 0, z = [];
		while (n < 2*x.length) {
			z[n++] = x[n_x++];
			z[n++] = y[n_y++];
		} return z;
	},
	logistic: function (bw, x, x0) {
		return 1/(1+Math.exp((x0-x)/bw));
	},
	modulation: function (y, f0, m) {
		f0 = typeof f0 !== 'undefined' ? f0 : 100,
		m = typeof m !== 'undefined' ? m : 1;

		//
		const fs = typeof audio !== 'undefined' && 'sampleRate' in audio ? audio.sampleRate : 44100;

		//
		if (f0) {
			for (let n = 0; n < y.length; n++) {
				y[n] *= Math.max(1-m*(1+Math.cos(2*Math.PI*n*f0/fs))/2,0);
			}
		}
		return y;
	},
	noise: function (duration) {
		const fs = typeof audio !== 'undefined' && 'sampleRate' in audio ? audio.sampleRate : 44100;
		let x = [];
		for (let n = 0; n < duration*fs; n++) {
			x[n] = Math.random()-0.5;
		}
		return x;
	},
	noise_filter: function (filter) {
		const fs = typeof audio !== 'undefined' && 'sampleRate' in audio ? audio.sampleRate : 44100;

		// inputs
		let frequency = filter ? filter.frequency : 5e3;
		let bandwidth_octave = filter ? filter.bandwidth : 1;

		//
		bandwidth_hz = (Math.pow(2,bandwidth_octave)-1)*frequency;
		R = Math.exp(-Math.PI*bandwidth_hz/fs);

		// feedback coefficients
		a0 = 1;
		a1 = -2*R*Math.cos(2*Math.PI*frequency/fs);
		a2 = Math.pow(R,2);
		a = [a0,a1,a2];

		// feedforward coefficients
		b0 = (1-Math.pow(R,2))/2;
		b1 = 0;
		b2 = -b0;
		b = [b0,b1,b2];

		return [a,b];
	},
	plot: function (x) {
		signal = x;
		console.log(x);
		// dialog: add note
		let dialog = document.createElement('div');
		dialog.title = 'Audio Figure';

		// content & canvas
		let content = document.createElement('p');
		content.innerHTML = 'Audio Figure<br><br>';
		let canvas = document.createElement('canvas');
		content.appendChild(canvas);
		dialog.appendChild(content);

		// dialog
		jQuery(dialog).dialog({
			buttons: {
				Close: function() {
					jQuery(this).dialog('destroy').remove();
				}
			},
			modal: true,
			width: 'auto'//0.8*$(window).width()
		});

		//
		if (typeof x[0] == 'number') {
			const max = x.max();
			const samples = x.length;

			// mono
			let line = canvas.getContext('2d');
			line.beginPath();
			line.moveTo(0,75);
			for (let a = 0; a < samples; a++) {
				line.lineTo(300*a/samples,75-75*x[a]/max);
			}
			line.strokeStyle = 'blue';
			line.stroke();
		} else {// stereo
			const max = Math.max(x[0].max(),x[1].max());
			const samples = x[0].length;

			// left
			var line = canvas.getContext('2d');
			line.beginPath();
			line.moveTo(0,75);
			for (let a = 0; a < samples; a++) {
				line.lineTo(300*a/samples,75-75*x[0][a]/max);
			}
			line.strokeStyle = 'blue';
			line.stroke();

			// right
			var line = canvas.getContext('2d');
			line.beginPath();
			line.moveTo(0,75);
			for (let a = 0; a < samples; a++) {
				line.lineTo(300*a/samples,75-75*x[1][a]/max);
			}
			line.strokeStyle = 'red';
			line.stroke();
		}
	},
	polyfilter: function (bw, x, x0, type) {
		return type == 'lowpass' && x < x0 ? 1 : type == 'highpass' && x > x0 ? 1 : Math.max(1-Math.pow((Math.log2(x)-Math.log2(x0))/bw,2),0);
	},
	ramp: function (x, attack, release) {
		attack = attack ? attack : 20e-3;
		release = release ? release : 20e-3;
		const fs = typeof audio !== 'undefined' ? audio.sampleRate : 44100;

		// attack
		attack = Math.round(attack*fs);
		for (let n = 0; n < attack; n++) {
			x[n] *= (1-Math.cos(Math.PI*n/attack))/2;
		}

		// release
		release = Math.round(release*fs);
		for (let n = 0; n < release; n++) {
			x[x.length-n-1] *= (1-Math.cos(Math.PI*n/release))/2;
		}
		return x;
	},
	tone: function (duration, frequency, gain, phase) {
		const fs = typeof audio !== 'undefined' && 'sampleRate' in audio ? audio.sampleRate : 44100;

		// inputs
		duration = duration ? duration : .4;
		frequency = frequency ? frequency : 1e3;
		gain = gain ? gain : 1;
		phase = phase ? phase : 0;

		// construct signal
		let y = [];
		for (let n = 0; n < duration*fs; n++) {
			y[n] = gain*Math.sin(2*Math.PI*frequency*n/fs+phase);
		}
		return y;
	}
};
gui = {
	gain: function (settings) {
		// set gain to last saved value
		if (typeof MASTERHOLD !== 'undefined') {
			MASTERGAIN = MASTERHOLD;
			processor.volume(MASTERGAIN);
		}

		// change SNR
		SNRHOLD = typeof activity != 'undefined' && 'snr' in activity ? activity.snr : Infinity;
		processor.snr(Infinity);

		// volume dialog
		let dialog = document.createElement('div');
		let message = (typeof settings == 'object' && 'message' in settings) ? settings.message : 'Adjust the volume to be comfortable.';
		dialog.innerHTML = message + '<br><br>';
		dialog.style.fontSize = 'larger';
		dialog.style.textAlign = 'center';
		dialog.title = 'Volume';

		// dialog table
		let table = document.createElement('table');
		table.style.width = '100%';
		dialog.appendChild(table);

		// top row
		let index = 0;
		var row = table.insertRow(index++);

		// Gain
		var cell = row.insertCell(0);
		cell.innerHTML = 'Gain:';
		cell.style.textAlign = 'right';
		cell.style.width = '25%';

		// input
		var cell = row.insertCell(1);
		cell.style.width = '50%';
		var input = document.createElement('input');
		input.id = 'gain';
		input.onchange = function () {
			MASTERGAIN = Math.min(this.value,100);
			processor.masterGain.gain.value = dbi(Math.min(dsp.calibrate(1e3,MASTERGAIN-200),0));
			document.getElementById('gain').value = MASTERGAIN;
			if (typeof settings == 'object' && 'file' in settings) {
				processor.signal(settings.file);
			} else if ('material' in activity) {
				activity.material.stimulus();
			} else {
				activity.stimulus();
			}
		};
		input.onkeypress = function (e) {
			if (e.keyCode === 13) {
				if (typeof settings == 'object' && 'file' in settings) {
					processor.signal(settings.file);
				} else if ('material' in activity) {
					activity.material.stimulus();
				} else {
					activity.stimulus();
				}
			}
		};
		input.style.width = '80%';
		input.value = MASTERGAIN;
		jQuery(input).button();
		cell.appendChild(input);

		// dB
		var cell = row.insertCell(2);
		cell.innerHTML = 'dB';
		cell.style.textAlign = 'left';
		cell.style.width = '25%';

		// second row
		var row = table.insertRow(index++);
		var cell = row.insertCell(0);
		cell.style.width = '25%';

		// down & up buttons
		var cell = row.insertCell(1);
		cell.style.width = '50%';

		// down
		var button = document.createElement('button');
		button.innerHTML = '-';
		button.onclick = function () {
			MASTERGAIN -= 2;
			document.getElementById('gain').value = MASTERGAIN;
			document.getElementById('gain').onchange();
		};
		button.style.marginLeft = '0%';
		button.style.width = '40%';
		jQuery(button).button();
		if(iOS){FastClick(button)}
		cell.appendChild(button);

		// up
		var button = document.createElement('button');
		button.innerHTML = '+';
		button.onclick = function () {
			MASTERGAIN = Math.min(MASTERGAIN+2,100);
			document.getElementById('gain').value = MASTERGAIN;
			document.getElementById('gain').onchange();
		};
		button.style.marginLeft = '10%';
		button.style.width = '40%';
		jQuery(button).button();
		if(iOS){FastClick(button)}
		cell.appendChild(button);

		// dialog
		jQuery(dialog).dialog({
			buttons: {
				Okay: function () {
					//
					MASTERHOLD = MASTERGAIN;

					// reset material
					if (typeof activity != 'undefined' && 'material' in activity && 'reset' in activity.material) { activity.material.reset(); }

					// reset SNR
					processor.snr(typeof SNRHOLD == 'number' ? SNRHOLD : SNRHOLD.value);

					// check for settings callback
					if (typeof settings == 'object' && 'callback' in settings) { settings.callback(); }

					// destroy
					jQuery(this).dialog('destroy').remove();
				}
			},
			modal: true,
			resizable: false,
			width: windowwidth < 4 ? jQuery(window).width() : .8 * jQuery(window).width()
		});
	},
	loudness: function (callback, frequency, which) {
		callback = callback ? callback : () => { assignment(); };
		frequency = frequency ? frequency : 1e3;
		which = which ? which : 3;

		// init
		if (typeof loudness === 'undefined') { loudness = [0,0,0,0]; }

		// special start dialog
		var dialog = document.createElement('div');
		dialog.innerHTML = 'Adjust the volume as indicated.<br><br>';
		dialog.style.fontSize = 'larger';
		dialog.style.textAlign = 'center';
		dialog.title = 'Loudness Levels';

		// settings table
		var table = document.createElement('table');
		table.style.width = '100%';
		dialog.appendChild(table);

		// add rows for loudness controls
		for (let a = 0; a < 4; a++) { addRow(a); }

		// add row helper function
		function addRow(index) {
			switch(index){
				case 0: label = 'Soft:'; break;
				case 1: label = 'Medium Soft:'; break;
				case 2: label = 'Medium:'; break;
				case 3: label = 'Medium Loud:';
			}

			// label
			var row = table.insertRow(index);
			var cell = row.insertCell(0);
			cell.innerHTML = label;
			cell.style.textAlign = 'right';
			cell.style.width = '40%';

			// input
			var cell = row.insertCell(1);
			cell.style.width = '20%';
			var input = document.createElement('input');
			input.id = 'gain'+index;
			input.onchange = function(){
				loudness[index] = Math.min(this.value,100);
				processor.volume(loudness[index]);
				document.getElementById('gain'+index).value = loudness[index];
				processor.play(dsp.ramp(dsp.tone(.4,frequency)));
			};
			input.onkeypress = function(e) {
				if(e.keyCode === 13){this.onchange()}
			};
			input.value = loudness[index];
			jQuery(input).button();
			cell.appendChild(input);

			// dB
			var cell = row.insertCell(2);
			cell.innerHTML = 'dB';
			cell.style.textAlign = 'left';
			cell.style.width = '40%';

			// down
			var button = document.createElement('button');
			button.innerHTML = '-';
			button.onclick = function(){
				loudness[index] -= 2;
				document.getElementById('gain'+index).value = loudness[index];
				document.getElementById('gain'+index).onchange();
			};
			button.style.marginLeft = '10%';
			button.style.width = '30%';
			jQuery(button).button();
			if(iOS){FastClick(button)}
			cell.appendChild(button);

			// up
			var button = document.createElement('button');
			button.innerHTML = '+';
			button.onclick = function(){
				loudness[index] = Math.min(loudness[index]+2,100);
				document.getElementById('gain'+index).value = loudness[index];
				document.getElementById('gain'+index).onchange();
			};
			button.style.marginLeft = '5%';
			button.style.padding = '0%';
			button.style.width = '30%';
			jQuery(button).button();
			if(iOS){FastClick(button)}
			cell.appendChild(button);
		}

		// dialog
		jQuery(dialog).dialog({
			buttons: {
				Okay: function(){
					jQuery(this).dialog('destroy').remove();

					//
					MASTERGAIN = loudness[which];
					MASTERHOLD = MASTERGAIN;
					processor.volume(MASTERGAIN);

					// protocol copy in case of fast responders
					const p = Object.assign({}, protocol);

					// database
					jQuery.ajax({
						data:{
							loudness: loudness.join(','),
							subuser: subuser.ID,
							user: user.ID
						},
						success:function(data,status){
							protocol.IDs.push(data);
							jQuery.ajax({
								data:{
									activity: 'loudness',
									ear: ear,
									IDs: p.IDs.join(','),
									protocol: p.ID,
									subuser: subuser.ID,
									user: user.ID,
									webVersion: version
								},
								success: function (data,status) { callback(); },
								type:'POST',
								url:'version/' + version + '/php/protocol.php'
							});
						},
						type: 'POST',
						url: 'version/' + version + '/php/loudness.php'
					});
				}
			},
			modal: true,
			resizable: false,
			width: typeof windowwidth != 'undefined' && windowwidth < 4 ? jQuery(window).width() : .8 * jQuery(window).width()
		});
	}
};
