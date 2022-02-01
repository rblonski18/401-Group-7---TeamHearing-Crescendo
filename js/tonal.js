function tonal(settings) {
	activity = new AFC({
		adaptive: new Adaptive({
			rule: 'exponential',
			step0: 2,
			valueMax: 100,
			value0: 100
		}),
		alternatives: 3,
		duration: 0.4,
		material: new Tonal(),
		message: 'Which sound was higher in pitch?',
		mode: 'oddball',
		options: {percept: true, speech: false}
	});
	for (var key in settings) {
		activity[key] = settings[key];
	}
	activity.init();
}
function Tonal(settings) {
	this.ID = 'tonal';
	this.startmessage = 'This is a practice exercise for pitch discrimination.';
	this.title = 'Tonal';
	
	// stimulus
	this.amplitude = -12;
	this.amplitudeLeft = -12;
	this.amplitudeRight = -12;
	this.amplitudeRove = 0; // range in % of possible values
	this.difference = 100; // % difference between standard and target
	this.duration = 0.4;
	this.f0 = 0;
	this.f1 = 500;
	this.fs = 44100;
	for (var key in settings) {
		this[key] = settings[key];
	}
}
Tonal.prototype.adaptive = function (adaptive) {
	this.difference = adaptive.value;
	
	//
	document.getElementById('adaptive').innerHTML = 
				'&nbsp; &nbsp; Frequency difference: '+String(this.difference)+'%';
}
Tonal.prototype.protocols = function (id) {
	// protocol (child)
	var button = document.createElement('button');
	button.innerHTML = 'Child';
	button.onclick = function () {
		var f0s = [100,200],
			f1s = [500,2000],
			i = 0;
		protocol.settings = [];
		for (var a = 0; a < f0s.length; a++) {
			for (var b = 0; b < f1s.length; b++) {
				protocol.settings[i++] = {
					alternatives: 2,
					chances: 6,
					material: new Harmonics({f0:f0s[a], f1:f1s[b]}),
				};
			}
		}
		protocol.start();
	};
	button.style.color = 'green';
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.fontWeight = 'bold';
	button.style.height = '64px';
	button.style.margin = '16px';
	jQuery(button).button();
	main.appendChild(button);
	if (iOS) { FastClick(button); }

	// protocol (4-note patterns)
	var button = document.createElement('button');
	button.id = '4-notes';
	button.innerHTML = '4-notes';
	button.onclick = function () {
		var f0s = [100,200,400],
			f1s = [500,2000],
			i = 0;
		protocol.settings = [];
		for (var a = 0; a < f0s.length; a++) {
			for (var b = 0; b < f1s.length; b++) {
				protocol.settings[i++] = {
					alternatives: 2,
					chances: 6,
					intervals: 4,
					material: new Harmonics({f0:f0s[a], f1:f1s[b]}),
					message: 'Repeat the pattern.',
					mode: 'pattern',
					words: ['low','high']
				};
			}
		}
		protocol.start();
	};
	button.style.color = 'green';
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.fontWeight = 'bold';
	button.style.height = '64px';
	button.style.margin = '16px';
	jQuery(button).button();
	main.appendChild(button);
	if (iOS) { FastClick(button); }
	
	// auto-click option
	if (id) { document.getElementById(id).click(); }
};
Tonal.prototype.stimulus = function (call) {
	f1 = (call == 0)
		? this.f1
		: this.f1*(1+this.difference/100);
		
	// samples
	if (this.f0 == 0) {
		var samples = Math.ceil(this.duration*this.fs);
	} else {
		// round up to integer number of periods of f0
		var samples = Math.ceil(this.duration*this.f0)*(this.fs/this.f0);
	}
	
	// generate stimulus
	var modulation = [],
		ramp = [],
		x = [];
	for (var n = 0; n < samples; n++) {
		modulation = (this.f0 == 0) ? 1 : 0.5*(1-Math.cos(2*Math.PI*this.f0*n/this.fs));
		ramp = 0.5*(1-Math.cos(2*Math.PI*n/samples));
		x[n] = ramp*modulation*Math.sin(2*Math.PI*f1*n/this.fs);
	}
	
	// gain
	var gain = Math.pow(10,this.amplitude/20)/x.rms();
	for (var n = 0; n < x.length; n++) {
		x[n] = gain*x[n];
	}
	
	// buffer the array
	var myArrayBuffer = audio.createBuffer(1,x.length,audio.sampleRate);
	var nowBuffering = myArrayBuffer.getChannelData(0);
	for (var a = 0; a < myArrayBuffer.length; a++) {
		nowBuffering[a] = x[a];
	}
	
	// start audio source
	var source = audio.createBufferSource(1,x.length,audio.sampleRate);
	source.buffer = myArrayBuffer;
	source.connect(audio.destination);
	source.start(audio.currentTime);
};
Tonal.prototype.summaryChart = function (sorted,summary) {
	// prep data
	var data = [];
	data[0] = ['F0 Discrimination',this.title];
	for (var a = 0; a < sorted.length; a++) {
		data.push(sorted[a]);
	}
	data = google.visualization.arrayToDataTable(data);
	
	// draw chart
	var chart = new google.visualization.ScatterChart(summary);
	chart.draw(data,{
		chartArea: {width:'70%'},
		hAxis: {direction:-1, scaleType:'log', ticks:[0.1,1,10,100], title:'F0 Discrimination'},
		title: this.title,
		vAxis: {maxValue:100, minValue:0, title:'Percent Correct'}
	});
}