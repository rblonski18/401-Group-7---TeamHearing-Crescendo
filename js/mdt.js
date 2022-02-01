function mdt() {
	activity = new AFC({
		adaptive:new Adaptive({
			rule:'linear',
			step0:6,
			valueMax:0,
			value0:0
		}),
		alternatives:3,
		duration:0.4,
		material:new MDT(),
		mode:'oddball',
		options:{percept:true, speech:false}
	});
	activity.menu();
}
function MDT() {
	this.ID = 'mdt';
	this.title = 'MDT';
	
	// stimulus
	this.amplitude = -24;
	this.amplitudeLeft = -24;
	this.amplitudeRight = -24;
	this.amplitudeRove = 0; // range in % of possible values
	this.depth = 0;
	this.difference = 100; // % difference between standard and target
	this.duration = 0.4;
	this.f0 = 100;
	this.f1 = 500;
	this.filter = [];
	this.fs = 44100;
}
MDT.prototype.adaptive = function (adaptive) {
	this.difference = adaptive.value;
	
	//
	document.getElementById('adaptive').innerHTML = 
				'&nbsp; &nbsp; Modulation depth: '+String(this.difference)+'%';
}
MDT.prototype.protocols = function () {
	// protocol
	var button = document.createElement('button');
	button.innerHTML = 'Protocol';
	button.onclick = function () {
		protocol.settings = [];
		protocol.settings[0] = {f0:100,f1:500};
		protocol.settings[1] = {f0:200,f1:500};
		protocol.settings[2] = {f0:100,f1:2000};
		protocol.settings[3] = {f0:200,f1:2000};
		protocol.start();
	};
	button.style.color = 'green';
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.fontWeight = 'bold';
	button.style.height = '64px';
	button.style.margin = '16px';
	$(button).button();
	main.appendChild(button);
	if (iOS) { FastClick(button); }
};
MDT.prototype.stimulus = function (call) {
	// depth : standard|target
	var depth = (call == 0)
		? 0
		: this.difference;
	
	// samples: round up to integer number of periods of f0
	var samples = Math.ceil(this.duration*this.f0)*(this.fs/this.f0);
	
	// generate stimulus
	var m = Math.pow(10,depth/20),
		modulation = [],
		ramp = [],
		x = [];
	if (call == 0) {
		for (var n = 0; n < samples; n++) {
			ramp = 0.5*(1-Math.cos(2*Math.PI*n/samples));
			x[n] = ramp*modulation*Math.sin(2*Math.PI*f1*n/this.fs);
		}
	} else {
		for (var n = 0; n < samples; n++) {
			modulation = 1-m+(m/2)*(1-Math.cos(2*Math.PI*n*this.f0/this.fs));
			ramp = 0.5*(1-Math.cos(2*Math.PI*n/samples));
			x[n] = ramp*modulation*Math.sin(2*Math.PI*f1*n/this.fs);
		}
	}
	
	// gain
	var gain = Math.pow(10,this.amplitude/20)/x.rms();
	for (var n = 0; n < x.length; n++) { x[n] = gain*x[n]; }
	
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
MDT.prototype.summaryChart = function (sorted,summary) {
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