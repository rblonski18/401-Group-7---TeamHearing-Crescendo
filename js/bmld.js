function bmld(settings) {
	activity = new AFC({
		adaptive: new Adaptive({
			rule: 'linear',
			step0: 6,
			valueMax: 12,
			value0: 12
		}),
		alternatives: 3,
		material: new BMLD(),
		mode: 'oddball'
	});
	for (var key in settings) {
		activity[key] = settings[key];
	}
	activity.init();
}
function BMLD() {
	this.ID = 'bmld';
	this.title = 'BMLD';
	
	// stimulus
	this.amplitude = -24;
	this.amplitudeLeft = -24;
	this.amplitudeRight = -24;
	this.amplitudeRove = 0; // range in % of possible values
	this.delayLeft = 0;
	this.delayRight = 0;
	this.difference = 100; // % difference between standard and target
	this.duration = .4;
	this.f0 = 100;
	this.f1 = 500;
	this.filter = [];
	this.fs = 44100;
	this.gainLeft = -24;
	this.gainRight = -24;
}
BMLD.prototype.adaptive = function (adaptive) {
	this.difference = adaptive.value;
	
	//
	document.getElementById('adaptive').innerHTML = 
				'&nbsp; &nbsp; Frequency resolution: '+String(this.difference)+'%';
}
BMLD.prototype.protocols = function () {
	// protocol (HI Adult)
	var button = document.createElement('button');
	button.innerHTML = 'HI Adult';
	button.onclick = function () {
		protocol.settings = [];
		protocol.settings[0] = {delayRight:0,f1:500,match:true};
		protocol.settings[1] = {delayRight:1000e-6,f1:500,match:true};
		protocol.settings[2] = {delayRight:0,f1:1000,match:true};
		protocol.settings[3] = {delayRight:500e-6,f1:1000,match:true};
		protocol.settings[4] = {delayRight:0,f1:2000,match:true};
		protocol.settings[5] = {delayRight:250e-6,f1:2000,match:true};
		protocol.settings[6] = {delayRight:0,f1:4000,match:true};
		protocol.settings[7] = {delayRight:125e-6,f1:4000,match:true};
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
	
	// protocol (NH Adult)
	var button = document.createElement('button');
	button.innerHTML = 'NH Adult';
	button.onclick = function () {
		protocol.settings = [];
		protocol.settings[0] = {delayRight:0,f1:500,match:false};
		protocol.settings[1] = {delayRight:1000e-6,f1:500,match:false};
		protocol.settings[2] = {delayRight:0,f1:1000,match:false};
		protocol.settings[3] = {delayRight:500e-6,f1:1000,match:false};
		protocol.settings[4] = {delayRight:0,f1:2000,match:false};
		protocol.settings[5] = {delayRight:250e-6,f1:2000,match:false};
		protocol.settings[6] = {delayRight:0,f1:4000,match:false};
		protocol.settings[7] = {delayRight:125e-6,f1:4000,match:false};
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

// protocol (Child)
	var button = document.createElement('button');
	button.innerHTML = 'Child';
	button.onclick = function () {
		protocol.settings = [];
		protocol.settings[0] = {delayRight:0,f1:500};
		protocol.settings[1] = {delayRight:1000e-6,f1:500};
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
};
BMLD.prototype.reset = function () {
	activity.duration = this.duration;
	switch (this.f1) {//half-octave filters
		case 500: this.filter[0] = [0.0061,0,-0.0061]; this.filter[1] = [1,-1.9827,0.9877]; break;
		case 1000: this.filter[0] = [0.0122,0,-0.0122]; this.filter[1] = [1,-1.9556,0.9756]; break;
		case 2000: this.filter[0] = [0.0241,0,-0.0241]; this.filter[1] = [1,-1.8730,0.9517];
	}
};
BMLD.prototype.settings = function (table, rowIndex) {
	var that = this;
	
	// f0
	var input = layout.input(this.f0);
	input.onblur = function() { that.f0 = Number(this.value); };
	var txt = (this.mode == 0) ? 'Modulation frequency:' : 'Fundamental frequency:'
	layoutTableRow(table,++rowIndex,txt,input,'Hz');
	
	// f1
	if (this.mode == 1) {
		var select = layout.select(['500','1000','2000']);
		select.onchange = function () { 
			that.f1 = Number(this.value);
			that.reset();
		};
		select.value = this.f1;
		layoutTableRow(table,++rowIndex,'Filter frequency:',select,'Hz');
	} else {
		// carrier frequency
		var input = layout.input(this.f1);
		input.onblur = function() { that.f1 = Number(this.value); };
		layoutTableRow(table,++rowIndex,'Carrier frequency:',input,'Hz');
	}
	
	// duration
	var input = layout.input(this.duration*1e3);
	input.onblur = function () { that.duration = Number(this.value)/1e3; };
	layoutTableRow(table,++rowIndex,'Stimulus duration:',input,'ms');
};
BMLD.prototype.stimulus = function (call) {
	if (call == 0) {
		var gainL = 0;
		var gainR = 0;
	} else {	
		var gainL = Math.sqrt(2)*Math.pow(10,(this.gainLeft+this.difference)/20);
		var gainR = Math.sqrt(2)*Math.pow(10,(this.gainRight+this.difference)/20);	
	}

	// modulated tone pip
	var delayL = this.delayLeft*this.fs;
	var delayR = this.delayRight*this.fs;
	var samples = Math.ceil(this.duration*this.f0)*(this.fs/this.f0)+Math.max(delayL,delayR);	
	var x = [];
	for (var n = 0; n < samples; n++) {
		if (n < delayL || n > (samples-delayL)) {
			x[2*n] = 0;
		} else {
			x[2*n] = gainL
				*(1-Math.cos(2*Math.PI*this.f0*(n-delayL)/this.fs))
				*Math.sin(2*Math.PI*this.f1*(n-delayL)/this.fs);
		}
		if (n < delayR || n > (samples-delayR)) {
			x[2*n+1] = 0;
		} else {
			x[2*n+1] = gainR
				*(1-Math.cos(2*Math.PI*this.f0*(n-delayR)/this.fs))
				* Math.sin(2*Math.PI*this.f1*(n-delayR)/this.fs);
		}
	}

	// add noise
	var noise = dsp.noise(x.length/2);
	noise = dsp.filter(noise, this.filter);
	noise = dsp.gain(noise, -24);
	noise = dsp.interleave(noise, noise);
	for (var n = 0; n < x.length; n++) {
		x[n] = x[n] + noise[n];
	}

	// attack and release ramps
	//x = dsp.ramp(x);

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
	
	return x;
};
BMLD.prototype.summaryChart = function (sorted,summary) {
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