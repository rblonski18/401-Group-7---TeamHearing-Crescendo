function percept(){
	activity = new Percept();
	activity.menu();
}
function Percept(){
	// procedure
	this.activity = 'Harmonic Frequency Discrimination';
	this.audio = 'HTML5'; // HTML5 | riffwave
	this.call = 0;
	this.chance = 0;
	this.chances;
	this.chances0 = 4;
	this.channels = 1;
	this.correct = 0;
	this.difference0;
	this.difference;
	this.happy = true;
	this.interval = 0;
	this.intervals = 2;
	this.message;
	this.practice = 'Off';
	this.score = [];
	this.series = [];
	this.status = undefined;
	this.step;
	this.step0 = 2;
	this.stepalpha = Math.pow(2,-1/4);
	this.stepmin = Math.pow(2,1/2);
	this.stepmode = "Exponential";
	this.subjective = true;
	this.trial = 0;
	
	// signal
	this.amplitude = -24;
	this.amplitudeRove = 0;//range in % of possible values
	this.duration = 400;
	this.filterCF = 1000;
	this.frequency = 1000;
	this.frequencyRove = 0.5;//range in octaves
	this.modulation = 100;
	this.pause = 200;
	this.rampduration = 40;
	this.samplerate = 44100;
	this.targetAmplitude;
	this.targetDuration;
	this.targetFrequency;
}
Percept.prototype.defaults = function(){
	switch (this.activity) {
		case "Harmonic Frequency Discrimination":
			this.difference0 = 1;
			this.duration = 400;
			this.frequency = 110;
			this.filter = [];
			switch (this.filterCF) {//half-octave filters
				case 500: this.filter[0] = [0.0123, 0, -0.0123]; this.filter[1] = [1, -1.9705, 0.9755]; break;
				case 1000: this.filter[0] = [0.0242, 0, -0.0242]; this.filter[1] = [1, -1.9318, 0.9516]; break;
				case 2000: this.filter[0] = [0.0473, 0, -0.0473]; this.filter[1] = [1, -1.8285, 0.9054];
			}
			this.message = "Which sound is higher in pitch?";
			this.subjective = false;
			break;
		case "Modulation Frequency Discrimination":
			this.difference0 = 1;
			this.duration = 1000;
			this.frequency = 1000;
			this.message = "Which sound is higher in pitch?";
			this.modulation = 100;
			this.rampduration = 100;
			this.subjective = false;
			break;
		case "Pure Tone Detection Thresholds":
			this.difference0 = this.amplitude;
			this.duration = 400;
			this.frequency = 1000;
			this.message = "Which sound is louder?";
			this.stepmode = "Linear";
			this.step0 = 12;
			this.step = this.step0;
			this.stepalpha = Math.pow(2,-1/4);
			this.stepmin = Math.pow(2,1/2);
			this.subjective = false;
			break;
		case "Pure Tone Frequency Discrimination":
			this.difference0 = 1;
			this.duration = 400;
			this.frequency = 1000;
			this.message = "Which sound is higher in pitch?";
			this.subjective = false;
			break;
		case "Pure Tone Intensity Discrimination":
			this.difference0 = 12;
			this.duration = 400;
			this.frequency = 1000;
			this.message = "Which sound is louder?";
			this.subjective = false;
			break;
		case "Forward Masking":
			this.difference0 = 12;
			this.duration = 390;
			this.frequency0 = 1000;
			this.message = "Which interval contains the tone pip?";
			this.rampduration = 5;
			this.stepmode = "Linear";
			this.step0 = 6;
			this.step = this.step0;
			this.stepalpha = Math.pow(2,-1/4);
			this.stepmin = Math.pow(2,1/2);
			this.targetDuration = 10;
			this.targetFrequency = 1400;
			this.subjective = false;
			break;
		case "Backward Masking":
			this.amplitude = -24;
			this.difference0 = 12;
			this.duration = 390;
			this.frequency0 = 1000;
			this.message = "Which interval contains the tone pip?";
			this.rampduration = 5;
			this.stepmode = "Linear";
			this.step0 = 6;
			this.step = this.step0;
			this.stepalpha = Math.pow(2,-1/4);
			this.stepmin = Math.pow(2,1/2);
			this.targetDuration = 10;
			this.targetFrequency = 1400;
			this.subjective = false;
			break;
		case 'Binaural Pip Lateralization':
			this.channels = 2;
			this.duration = 40;
			this.message = 'Which sound is higher in pitch?';
			this.rampduration = 20;
			this.subjective = true;
	}
	this.reset();
};
Percept.prototype.generate = function(){
console.log(this);
	data = new Array();
	for (var interval=0; interval<this.intervals; interval++) {
		switch (this.activity) {
			case "Harmonic Frequency Discrimination":
				// amplitude roving
				var amplitude = this.amplitude-this.amplitudeRove*Math.random();
			
				// frequency roving
				if (interval == 0) {var frequencyRoved = this.frequency*Math.pow(2,this.frequencyRove*(Math.random()-0.5));}
			
				// adaptive variables
				if (interval == this.call) {var frequency = frequencyRoved*(1+this.difference);} 
				else {var frequency = frequencyRoved;}
			
				// generate signal
				var x = this.generateFilteredPulseTrain(this.duration,frequency);
				x = this.generateRamp(x,this.rampduration,this.rampduration);
				x = this.generateNormalized(x,amplitude);
			
				// add pause between intervals
				if (data.length == 0){data = x;}
				else {data = this.generateSummer(data,0,x,data.length+Math.round(this.pause*audio.sampleRate/1000));}
			
				break;
			case "Modulation Frequency Discrimination":
				// amplitude roving
				var amplitude = this.amplitude-this.amplitudeRove*Math.random();
			
				// frequency roving
				if (interval == 0) {var frequencyRoved = this.modulation*Math.pow(2,this.frequencyRove*(Math.random()-0.5));}
			
				// adaptive modulation frequency
				if (interval == this.call) {var modulation = frequencyRoved*(1+this.difference);} 
				else {var modulation = frequencyRoved;}
			
				// generate signal
				var x = this.generateSinusoid(amplitude,this.duration,this.frequency);
				x = this.generateModulation(x,modulation,2*Math.PI*Math.random());
				x = this.generateRamp(x,this.rampduration,this.rampduration);
			
				// add pause between intervals
				if (data.length == 0){data = x;}
				else {data = this.generateSummer(data,0,x,data.length+Math.round(this.pause*audio.sampleRate/1000));}
			
				break;
			case "Pure Tone Detection Thresholds":		
				// adaptive amplitude
				if (interval == this.call) {var amplitude = this.difference;} 
				else {var amplitude = -Infinity;}
			
				// generate signal
				var x = this.generateSinusoid(amplitude,this.duration,this.frequency);
				x = this.generateRamp(x,this.rampduration,this.rampduration);
			
				// add pause between intervals
				if (data.length == 0){data = x;}
				else {data = this.generateSummer(data,0,x,data.length+Math.round(this.pause*audio.sampleRate/1000));}
			
				break;
			case "Pure Tone Frequency Discrimination":
				// amplitude roving
				var amplitude = this.amplitude-this.amplitudeRove*Math.random();
			
				// frequency roving
				if (interval == 0) {var frequencyRoved = this.frequency*Math.pow(2,this.frequencyRove*(Math.random()-0.5));}
			
				// adaptive frequency
				if (interval == this.call) {var frequency = frequencyRoved*(1+this.difference);} 
				else {var frequency = frequencyRoved;}
			
				// generate signal
				var x = this.generateSinusoid(amplitude,this.duration,frequency);
				x = this.generateRamp(x,this.rampduration,this.rampduration);
			
				// add pause between intervals
				if (data.length == 0){data = x;}
				else {data = this.generateSummer(data,0,x,data.length+Math.round(this.pause*audio.sampleRate/1000));}
			
				break;
			case "Pure Tone Intensity Discrimination":
				// roving
				if (interval == 0) {
					var amplitudeRoved = this.amplitude-this.amplitudeRove*Math.random();
					var frequency = this.frequency*Math.pow(2,this.frequencyRove*(Math.random()-0.5));
				}
			
				// adaptive amplitude
				if (interval == this.call) {var amplitude = amplitudeRoved;} 
				else {var amplitude = amplitudeRoved-this.difference;}
			
				// generate signal
				var x = this.generateSinusoid(amplitude,this.duration,frequency);
				x = this.generateRamp(x,this.rampduration,this.rampduration);
			
				// add pause between intervals
				if (data.length == 0){data = x;}
				else {data = this.generateSummer(data,0,x,data.length+Math.round(this.pause*audio.sampleRate/1000));}
			
				break;
			case "Forward Masking":
				// masker
				var masker = this.generateRampedSinusoid(this.amplitude,this.duration,this.frequency,this.rampduration);

				// pip amplitude
				if (interval == this.call) {var amplitude = this.amplitude+this.difference;} 
				else {var amplitude = -Infinity;}
			
				// target
				var target = this.generateRampedSinusoid(amplitude,this.targetDuration,this.targetFrequency,this.rampduration);
			
				// combine
				var x = this.generateSummer(masker,0,target,masker.length);
			
				// add pause between intervals
				if (data.length == 0){data = x;}
				else {data = this.generateSummer(data,0,x,data.length+Math.round(this.pause*audio.sampleRate/1000));}

				break;
			case "Backward Masking":
				// masker
				var masker = this.generateRampedSinusoid(this.amplitude,this.duration,this.frequency,this.rampduration);

				// pip amplitude
				if (interval == this.call) {var amplitude = this.amplitude+this.difference;} 
				else {var amplitude = -Infinity;}
			
				// target
				var target = this.generateRampedSinusoid(amplitude,this.targetDuration,this.targetFrequency,this.rampduration);
			
				// combine
				var x = this.generateSummer(target,0,masker,target.length);
			
				// add pause between intervals
				if (data.length == 0){data = x;}
				else {data = this.generateSummer(data,0,x,data.length+Math.round(this.pause*audio.sampleRate/1000));}
			
				break;
			case "Binaural Pip Lateralization":
				console.log(this);
			
				// generate signal
				var x = this.generateSinusoid(this.amplitude,this.duration,this.frequency);
				x = this.generateRamp(x,this.rampduration,this.rampduration);
				x = this.generateBinaural(x,0);
				data = x;
			
				break;
		}
	}
	this.play();
	console.log(data.max());
	console.log(data.min());
	console.log(data.mean());
	console.log(data.rms());
	//this.plot(data);
};
Percept.prototype.generateBinaural = function(x,channel){
	console.log(channel);
	var b = 0;
	var y = new Array(2*x.length);
	for (var a=0; a<x.length; a++) {
		if (channel == 0) { y[b++] = x[a]; y[b++] = 0; } 
		else { y[b++] = 0; y[b++] = x[a]; }
	}
	return y;
}
Percept.prototype.generateFilteredPulseTrain = function(duration,frequency){
	console.log(duration,frequency);
	// reset
	var period = this.samplerate/frequency;
	var pulsedistance = 0;
	var pulsetrain = new Array();
	var samples = duration*this.samplerate/1000;
	var x = new Array(samples);
		
	// generate filtered pulse train
	for (var a=0; a<samples; a++) {
		// keep track of pulse distance
		if (pulsedistance > period/2) {pulsedistance = pulsedistance-period;}
	
		// interpolated pulse train (sync function)
		if (pulsedistance == 0) {pulsetrain[a] = 1;} else {pulsetrain[a] = Math.sin(Math.PI*pulsedistance)/(Math.PI*pulsedistance);}
		pulsedistance++;
		
		// filter
		if (a > 1) {x[a] = this.filter[0][0]*pulsetrain[a]+this.filter[0][1]*pulsetrain[a-1]+this.filter[0][2]*pulsetrain[a-2]-this.filter[1][1]*x[a-1]-this.filter[1][2]*x[a-2];}
		else if (a == 1) {x[a] = this.filter[0][0]*pulsetrain[a]+this.filter[0][1]*pulsetrain[a-1]-this.filter[1][1]*x[a-1];}
		else if (a == 0) {x[a] = this.filter[0][0]*pulsetrain[a];}
	}
	return x;
};
Percept.prototype.generateModulation = function(x,modulation,phase){
	for (var a=0; a<x.length; a++) {x[a] = x[a]*(0.5+0.5*Math.cos(a*2*Math.PI*modulation/this.samplerate+phase));}
	return x;
};
Percept.prototype.generateNormalized = function(x,amplitude){
	scale = Math.pow(10,amplitude/20)/x.rms();// scale amplitude -24 dB re peak output
	for (var a=0; a<x.length; a++) {x[a] = scale*x[a];}
	return x;
};
Percept.prototype.generateRamp = function(x,attack,release){
	var attack = attack*this.samplerate/1000;
	var release = release*this.samplerate/1000;
	for (var a=0; a<x.length; a++) {
		if (a < attack) {ramp = a/attack;} 
		else if (a > x.length-release) {ramp = (x.length-a)/release;}
		else {ramp = 1;}
		x[a] = ramp*x[a];
	}
	return x;
};
Percept.prototype.generateRampedSinusoid = function(amplitude,duration,frequency,attack,release){
	console.log(amplitude,duration,frequency);
	if (!release){release = attack;}
	var attack = attack*this.samplerate/1000;
	var release = release*this.samplerate/1000;
	var samples = duration*this.samplerate/1000;
	var scale = (2/Math.sqrt(2))*Math.pow(10,amplitude/20);// convert amplitude dB to linear scale
	var x = new Array();
	for (var a=0; a<samples; a++) {
		if (a < attack) {ramp = a/attack;} 
		else if (a > samples-release) {ramp = (samples-a)/release;}
		else {ramp = 1;}
		x[a] = ramp*scale*Math.sin(a*2*Math.PI*frequency/this.samplerate);
	}
	return x;
};
Percept.prototype.generateSinusoid = function(amplitude,duration,frequency){
	console.log(amplitude,duration,frequency);
	var samples = duration*this.samplerate/1000;
	var scale = (2/Math.sqrt(2))*Math.pow(10,amplitude/20);
	var x = new Array(samples);
	for (var a=0; a<samples; a++) {x[a] = scale*Math.sin(2*Math.PI*frequency*a/this.samplerate);}
	return x;
};
Percept.prototype.generateSummer = function(x,x0,y,y0){
	var index = 0;
	var samples = Math.max(x.length+x0,y.length+y0);
	var z = new Array();
	for (var a=0; a<samples; a++) {
		if ((a>x0)&&(a<x0+x.length)) { z[a] = x[a-x0]; } else { z[a] = 0; }
		if ((a>y0)&&(a<y0+y.length)) { z[a] = z[a]+y[a-y0]; }  
	}
	return z;
};
Percept.prototype.menu = function(){
	var that = this;

	// main
	var main = layout.main(
		'Psychoacoustics',
		function () { layout.testing(); },
		{
			Results: function () { that.results(); }
		}		
	);
	
	// menu
	var menu = document.createElement('div');
	var options = ['Harmonic Frequency Discrimination','Modulation Frequency Discrimination','Pure Tone Detection Thresholds',
		'Pure Tone Frequency Discrimination','Pure Tone Intensity Discrimination',
		'Forward Masking','Backward Masking'];
	var a = 0;
	var messages = [
		'<b>'+options[a++]+'</b><br>'+'Pitch ranking task using harmonic complexes filtered in spectral regions. Sounds are presented and the task is to judge which is highest in pitch.',
		'<b>'+options[a++]+'</b><br>'+'Pitch ranking task using modulated tones. Sounds are presented and the task is to judge which is highest in pitch.',
		'<b>'+options[a++]+'</b><br>'+'Pitch ranking task using pure tones. Sounds are presented and the task is to judge which is highest in pitch.',
		'<b>'+options[a++]+'</b><br>'+'Loudness ranking task using pure tones. Sounds are presented and the task is to judge which is loudest.', 
		'<b>'+options[a++]+'</b><br>'+'Forward masked detection of a pure tone pip following a pure tone masking pip.',
		'<b>'+options[a++]+'</b><br>'+'Backward masked detection of a pure tone pip preceding a pure tone masking pip.'];
	for (var a=0; a<options.length; a++) {
		option = options[a];
		
		// help
		var help = layout.help(option,messages[a]);
		help.style.cssFloat = 'right';
		help.style.zindex = 10;
		
		// item
		var item = document.createElement('li');
		item.id = a;
		item.onclick = function(){that.activity=options[this.id]; that.defaults(); that.settings();};
		
		// anchor
		var anchor = document.createElement('a');
		anchor.id = 'menuitem'+a;
		
		// icon
		img = document.createElement('img');
		img.src = '/images/psi.png';
		img.style.height = '1.5em';
		
		// anchor
		anchor.appendChild(img);
		anchor.innerHTML = anchor.innerHTML+' '+option;
		menu.appendChild(item);
		item.appendChild(anchor);
		anchor.appendChild(help);
	}
	main.appendChild(menu);
	$(menu).menu();
	
	// footer
	layout.footer();
};
Percept.prototype.next = function(){
	if (this.correct) {
		this.score[this.trial++] = 1;
		if (!this.happy) {
			this.step = Math.max(Math.pow(this.step,this.stepalpha),this.stepmin);
			this.happy = true;
		}
		switch (this.stepmode) {
			case "Exponential": this.difference = this.difference*Math.pow(this.step,-1); break;
			case "Linear": this.difference = this.difference-this.step;
		}
		var img = document.createElement('img');
		img.src = '/images/score-yay.png';
		document.getElementById('score').appendChild(img);
	} else {
		this.score[this.trial++] = 0;
		document.getElementById('chance'+this.chance).src = '/images/score-nay.png';
		this.chance++;
		this.chances--;

		// if out of chances, end the run
		if (this.chances == 0) {
			this.save();
			this.status = 'Complete';
			return;
		}

		// if happy, step
		if (this.happy) {
			this.step = Math.max(Math.pow(this.step,this.stepalpha),this.stepmin);
			this.happy = false;
		}
		
		// difference
		switch ( this.stepmode ) {
			case "Exponential": this.difference = this.difference*Math.pow(this.step,3); break;
			case "Linear": this.difference = this.difference+3*this.step;
		}
		this.difference = Math.min(this.difference,this.difference0);
	}
	this.series.push(this.difference.toFixed(4));
	
	//
	this.call = Math.floor(this.intervals*Math.random());
};
Percept.prototype.play = function(){
	var channel = 0;
	var frameCount = data.length;
	var myArrayBuffer = audio.createBuffer(this.channels, frameCount, audio.sampleRate);
	var nowBuffering = myArrayBuffer.getChannelData(channel);
	for (var i=0; i<frameCount; i++) {nowBuffering[i] = data[i];}
	
	var source = audio.createBufferSource(this.channels, frameCount, audio.sampleRate);
	source.buffer = myArrayBuffer;
	source.connect(audio.destination);
	source.start();
	
	// disable then enable
	for (var a=0; a<this.intervals; a++) {document.getElementById('afc'+a).disabled=true;}
	var delay = this.intervals*this.duration+(this.intervals-1)*this.pause;
	for (var a=0; a<this.intervals; a++) {setTimeout((function(interval){return function(){document.getElementById('afc'+interval).disabled=false;}})(a),delay);}
	
	// lights
	var delay = 0;
	for (var a=0; a<this.intervals; a++) {
    	setTimeout((function(interval) {return function() {
        	$('#afc'+interval).css('color','yellow');
        }})(a),delay);
    	delay += this.duration;
    	setTimeout((function(interval) {return function() {
        	$('#afc'+interval).css('color',buttonColor);
        }})(a),delay);
        delay += this.pause;
	}
}
Percept.prototype.plot = function(data){
	console.log(this); console.log(data);
	
	// dialog: add note
	var dialog = document.createElement('div');
	dialog.title = 'Audio Figure';

	// content
	var content = document.createElement('p');
	content.innerHTML = 'Audio Figure<br><br>';
	canvas = document.createElement('canvas');
	canvas.style.height = '300px';
	canvas.style.width = '600px';
	var line = canvas.getContext('2d');
	line.beginPath();
	line.moveTo(0, 150*(data[0]+.5));
	var samples = 8200;
	for (var a=0; a<samples; a++) {
		line.lineTo(600*a/samples, 150*(data[a]+.5));
	}
	line.stroke();
	content.appendChild(canvas);
	dialog.appendChild(content);

	// dialog
	$(dialog).dialog({
		buttons: { Close: function() { $(this).dialog('destroy').remove(); } },
		modal: true,
		width: 'auto'//0.6*$(window).width()
	});
}
Percept.prototype.protocols = function(){
	this.protocol = true;
	this.protocolIndex = 0;
	this.protocolSettings = [];
	this.protocolSettings[0] = [];
	this.protocolSettings[0][0] = ['duration',100];
	this.protocolSettings[0][1] = ['frequency',220];
	this.protocolSettings[0][2] = ['pause',200];
	this.protocolSettings[1] = [];
	this.protocolSettings[1][0] = ['frequency',220];
	this.protocolSettings[2] = [];
	this.protocolSettings[2][0] = ['frequency',440];
	
	//
	this.defaults(0);
	
	//
	var settings = this.protocolSettings[this.protocolIndex];
	for (index=0; index<settings.length; index++) {this[settings[index][0]] = settings[index][1];}
	
	//
	this.test();
};
Percept.prototype.reset = function(){
	this.chance = 0;
	this.chances = this.chances0;
	this.correct = 0;
	this.difference = this.difference0;
	this.score = [];
	this.step = this.step0;
	this.trial = 0;
};
Percept.prototype.results = function(){
	that = this;
	jQuery.ajax({
		data: {
			password: user.password,
			subuser: subuser.ID,
			user: user.ID
		},
		error: function(jqXHR, textStatus, errorThrown) {console.log(jqXHR, textStatus, errorThrown);},
		success: function(data, status) {
			results = jQuery.parseJSON(data);
			results.sort(compare);
			results.reverse();
			that.resultsUI();
		},
		type: 'GET',
		url: '/version/'+version+'/php/percept.php',
	});
};
Percept.prototype.resultsUI = function PerceptResultsUI(){
	var that = this;
	
	// main
	var main = layout.main();
	
	// back button
	layout.backbutton(function(){that.menu()});
	
	// heading
	var heading = document.createElement('h1');
	heading.id = 'title';
	heading.innerHTML = 'Results';
	heading.style.display = 'inline-block';
	main.appendChild(heading);
	
	// horizontal rule
	$(main).append('<hr class=\'ui-widget-header\'>');
	
	// summary chart
	var activities = ['Harmonic Frequency Discrimination','Modulation Frequency Discrimination','Pure Tone Frequency Discrimination','Pure Tone Intensity Discrimination','Forward Masking','Backward Masking'];
	var resultsSorted = [];
	jQuery.each(activities, function(index) { resultsSorted[index] = []; });
	var summary = document.createElement('div');
	main.appendChild(summary);
	
	// details subheading
	$(main).append('<h3>Details</h3>');
	
	// horizontal rule
	$(main).append('<hr class=\'ui-widget-header\'>');
	
	// accordion
	var accordion = document.createElement('div');
	accordion.id = 'results';
	$(main).append(accordion);

	// content
	for (var index=0; index<results.length; index++) {
		result = results[index];
	
		// score
		var score;
		switch (result.activity) {
				case 'Harmonic Frequency Discrimination':
				case 'Modulation Frequency Discrimination':
				case 'Pure Tone Frequency Discrimination': score = (100*Number(result.difference)).toFixed(2)+' %'; break;
				default: score = Number(result.difference).toFixed(2)+' dB';
			}
		
		// heading
		var heading = document.createElement('h3');
		heading.innerHTML = result.entry+' &rarr; '+result.activity+': '+score;
		accordion.appendChild(heading);
		
		// container
		var container = document.createElement('div');
		accordion.appendChild(container);
		
		// information
		var info = document.createElement('p');
		for(var key in result) {
			$(info).append(key+': '+result[key]+'<br>');
		}
		container.appendChild(info);
		
		// difference chart
		if (true) {
			chart_div = document.createElement('div');
			chart_div.style.width = '80%';
			container.appendChild(chart_div);
			var data = [];
			data[0] = ['Trial', 'Difference'];
			difference = result.series.split(',');
			
			switch (result.activity) {
				case 'Harmonic Frequency Discrimination':
				case 'Pure Tone Frequency Discrimination':
					var vLog = true;
					for (var trial=1; trial<=difference.length; trial++) {
						data[trial] = [trial, 0.1*Math.round(1000*Number(difference[trial-1]))];
					}
					break;
				case 'Pure Tone Intensity Discrimination':
					vLog = true;
					for (var trial=1; trial<=difference.length; trial++) {
						data[trial] = [trial, Number(difference[trial-1])];
					}
				default:
					vLog = false;
					for (var trial=1; trial<=difference.length; trial++) {
						data[trial] = [trial, Number(difference[trial-1])];
					}
			}
			
			var chart = new google.visualization.LineChart(chart_div);
			var data = google.visualization.arrayToDataTable(data);
			var options = {
				chartArea: {height: '50%', width: '70%'},
				hAxis: {title: 'Trial'},
				title: 'Adaptive Series',
				vAxis: {logScale: vLog, title: 'Difference'}
			};
			chart.draw(data, options);
		}
		
		//
		if (false) {
			// update button
			var button = document.createElement('button');
			button.innerHTML = 'update';
			button.onclick = function() { notesUpdateUI(index); notesReadUI(); };
			$(button).button();
			container.appendChild(button);
		
			// cancel button
			var button = document.createElement('button');
			button.innerHTML = 'delete';
			button.onclick = function() { notesDeleteConfirmation(index); notesReadUI(); };
			$(button).button();
			container.appendChild(button);
		}
	}
	
	//
	$(accordion).accordion({
		active: false,
		collapsible: true,
		heightStyle: 'content'
    });
};
Percept.prototype.save = function(){
	
	// results dialog
	var correct = this.score.reduce(function(prev,cur){return prev+cur;})
	var percentcorrect = (correct/this.score.length)*100;
	var scoremessage = "You answered "+correct+" out of "+this.score.length+" correctly ("+Math.round(percentcorrect.toFixed(2))+"%).<br>"
		
	// difference message
	var differencemessage = "";
	switch (this.activity) {
		case "Harmonic Frequency Discrimination":
		case "Modulation Frequency Discrimination":
		case "Pure Tone Frequency Discrimination": differencemessage = "The final difference was: " + Math.round(10000*this.difference)/100 + "%.<br><br>"; break;
		case "Pure Tone Intensity Discrimination":
		case "Forward Masking":
		case "Backward Masking": differencemessage = "The final difference was: " + Math.round(100*this.difference)/100 + " dB.<br><br>";
	}

	// settings
	var settings = 'duration,'+String(this.duration)+';frequency,'+String(this.frequency)+';intervals,'+String(this.intervals)+';pause,'+String(this.pause);
	console.log(settings);
	
	// dialog (Results)
	var results = document.createElement('div');
	results.id = 'dialog';
	results.title = 'Results';
	results.style.fontSize = 'larger';
	results.style.textAlign = 'center';
	$(results).append(scoremessage+'<br>');
	$(results).append(differencemessage);
	var button = document.createElement('button');
	button.innerHTML = 'Okay';
	button.onclick = function() {
		$('#dialog').dialog('destroy').remove();
		$('#logout').css('visibility','visible');
		percept();
	};
	$(button).button();
	$(results).append(button);
	$('body').append(results);
	$(results).dialog({
		close: function(){
			$(this).dialog('destroy').remove();
		},
		modal: true,
		resizable: false,
		width: 0.4*$(window).width()
	});

	// database POST
	var series = 
	jQuery.ajax({
		data: {
			activity: this.activity,
			correct: this.correct,
			difference: this.difference,
			series: this.series.join(','),
			practice: this.practice,
			settings: settings,
			subuser: subuser.ID,
			user: user.ID
		},
		error: function(jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); },
		success: function(data, status) {},
		type: 'POST',
		url: '/version/'+version+'/php/percept.php'
	});
};
Percept.prototype.settings = function(){
	var that = this;

	// main
	var main = layout.main(
		'Settings',
		function () { that.menu(); },
		{ Test: function () { that.test();} }
	);
	
	// settings
	var settings = document.createElement('div');
	settings.className = 'ui-widget-content';
	main.appendChild(settings);
	
	// settings table
	var table = document.createElement('table');
	table.style.width = '100%';
	settings.appendChild(table);
	var rowIndex = -1;
	
	// practice on|off
	if (false) {
		var row = table.insertRow(++rowIndex);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'Practice mode:';
		cell.style.textAlign = 'right';
		cell.style.width = '40%';
		var cell = row.insertCell(1);
		cell.style.width = '40%';
		var select = document.createElement('select');
		select.onchange = function(){
			if(this.selectedIndex==0){that.practice=false}else{that.practice=true}
			Settings(that);
		};
		select.style.fontSize = '100%';
		select.style.width = '100%';
		options = ['Off','On'];
		for (var a = 0, items = options.length; a < items; a++) {
			var option = document.createElement('option');
			option.innerHTML = options[a];
			option.value = options[a];
			select.appendChild(option);
		}
		if(that.practice){select.value='On'}else{select.value='Off'};
		cell.appendChild(select);
		if(!iOS){$(select).selectmenu({change:select.onchange})}
		var cell = row.insertCell(2);
		cell.style.width = '20%';
		
		// help message
		help = layout.help('Practice Mode','Practice mode allows the user to practice after missing an item.');
		cell.appendChild(help);
	}
	
	// intervals
	var select = layout.select(['2','3','4']);
	select.onchange = function(){that.intervals = Number(this.value);};
	select.value = this.intervals;
	layoutTableRow(table,++rowIndex,'Intervals',select,'');

	// duration
	var input = document.createElement('input');
	input.onblur = function() {that.duration = Number(this.value);};
	input.value = this.duration;
	layoutTableRow(table,++rowIndex,'Interval duration:',input,'ms');
	
	// pause
	var input = document.createElement('input');
	input.onblur = function() {that.pause = Number(this.value);};
	input.value = this.pause;
	layoutTableRow(table,++rowIndex,'Interval pause:',input,'ms');

	// standard frequency
	var input = document.createElement('input');
	input.onblur = function() {that.frequency = Number(this.value);};
	input.value = this.frequency;
	layoutTableRow(table,++rowIndex,'Standard frequency:',input,'Hz');
	
	// filter specifications
	if (this.activity == "Harmonic Frequency Discrimination") {
		var select = layout.select(['500','1000','2000']);
		select.onchange = function(){ 
			that.filterCF = Number(this.value);
			switch (that.filterCF) {//half-octave filters
				case 500: that.filter[0] = [0.0123, 0, -0.0123]; that.filter[1] = [1, -1.9705, 0.9755]; break;
				case 1000: that.filter[0] = [0.0242, 0, -0.0242]; that.filter[1] = [1, -1.9318, 0.9516]; break;
				case 2000: that.filter[0] = [0.0473, 0, -0.0473]; that.filter[1] = [1, -1.8285, 0.9054];
			}
		};
		select.value = this.filterCF;
		layoutTableRow(table,++rowIndex,'Filter frequency:',select,'Hz');
	}
	
	// modulation frequency
	if (this.activity == 'Modulation Frequency Discrimination') {
		var input = document.createElement('input');
		input.onblur = function() {that.modulation = Number(this.value);};
		input.value = this.modulation;
		layoutTableRow(table,++rowIndex,'Modulation frequency:',input,'Hz');
	}
	
	//
	main.appendChild(settings);
};
Percept.prototype.test = function(){
	var that = this;
	
	// defaults
	//this.defaults();
	
	// main
	var main = layout.main();
	
	// table
	var container = document.createElement('div');
	container.className = 'ui-widget-content';
	container.style.position = 'absolute';
	container.style.top = '15%';
	container.style.height = '50%';
	container.style.width = '80%';
	container.style.left = '10%';
	var table = document.createElement('table');
	table.id = 'afc_table';
	table.style.height = '100%';
	table.style.position = 'absolute';
	table.style.width = '100%';
	container.appendChild(table);
	main.appendChild(container);
	
	// afc table
	var cells = this.intervals;
	var words = [];
	for (var a=0; a<this.intervals; a++) {
		words[a] = a+1;
	
		// table cells
		if (a%cells == 0) {
			var row = table.insertRow(a/cells);
			row.style.width = '100%';
		} else {
			var row = table.rows[Math.floor(a/cells)];
		}
		var cell = row.insertCell(a%cells);
		cell.style.margin = '0px';
		cell.style.padding = '0px';
		cell.style.width = 100/cells+'%';

		// response buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.id = 'afc'+String(a);
		button.index = a;
		button.innerHTML = words[a];
		button.onclick = function() {
			for (var b=0; b<this.intervals; b++){$('#afc'+b).css('color',buttonColor);}
			document.getElementById('repeat').focus();
			
			//
			that.correct = (this.index==that.call);
			
			// feedback
			if (that.correct) {
				var img = document.createElement('img');
				img.src = '/images/check.png';
				img.style.position = 'absolute';
				img.style.height = '40%';
				img.style.bottom = '10%';
				this.appendChild(img);
				$(img).fadeOut(1000);
			} else {
				// feedback
				var img = document.createElement('img');
				img.src = '/images/X.png';
				img.style.position = 'absolute';
				img.style.height = '40%';
				img.style.bottom = '10%';
				this.appendChild(img);
				$(img).fadeOut(1000);
			}
					
			//
			that.next();
			if(that.status=='Complete'){return;}
			that.generate();
		};
		button.style.fontSize = '400%';
		button.style.height = '100%';
		button.style.margin = '0px';
		button.style.padding = '0px';
		button.style.width = '100%';
		$(button).button();
		cell.appendChild(button);
		if (iOS) {FastClick(button);}
	}
	buttonColor = $('#afc0').css('color');
	
	// controls
	var controls = document.createElement('div');
	controls.className = 'ui-widget-content';
	controls.style.position = 'absolute';
	controls.style.bottom = '5%';
	controls.style.height = '15%';
	controls.style.width = '80%';
	controls.style.left = '10%';
	controls.style.padding = '8px';
	
	// controls: message
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = this.message;
	message.style.display = 'inline-block';
	message.style.fontSize = '120%';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	controls.appendChild(message);
	main.appendChild(controls);
	
	// controls: next button
	if (this.subjective) {
		var next = document.createElement('button');
		next.id = 'next';
		next.innerHTML = 'next';
		next.onclick = function() {};
		next.style.color = 'green';
		next.style.cssFloat = 'right';
		next.style.fontSize = '150%';
		next.style.height = '100%';
		next.style.marginLeft = '16px';
		$(next).button();
		controls.appendChild(next);
	}
	
	// controls: repeat
	var repeat = document.createElement('button');
	repeat.id = 'repeat';
	repeat.innerHTML = 'repeat';
	repeat.onclick = function(){that.play();};
	repeat.style.cssFloat = 'right';
	repeat.style.height = '100%';
	repeat.style.visibility = 'visible';
	$(repeat).button();
	controls.appendChild(repeat);
	if (iOS) {FastClick(repeat);}

	// footer
	footer = layout.footer();

	// footer: chances
	var chances = document.createElement('h2');
	chances.id = 'chances';
	chances.innerHTML = 'Chances: ';
	chances.style.display = 'inline';
	chances.style.marginLeft = '16px';
	chances.style.verticalAlign = 'bottom';
	footer.appendChild(chances);
	
	// footer: chances images
	var scores = this.chances;
	for (a=0; a<scores; a++) {
		var img = document.createElement('img');
		img.id = 'chance'+a;
		img.src = '/images/score-nan.png';
		chances.appendChild(img);
	}
	
	// footer: score
	var score = document.createElement('h2');
	score.id = 'score';
	score.innerHTML = ' Score: ';
	score.style.display = 'inline';
	score.style.marginLeft = '16px';
	score.style.verticalAlign = 'bottom';
	footer.appendChild(score);
	
	// footer: stats
	var stats = document.createElement('h2');
	stats.id = 'stats';
	stats.style.display = 'inline';
	stats.style.marginLeft = '32px';
	footer.appendChild(stats);
	
	// footer: exit
	var exit = document.createElement('img');
	exit.onclick = function(){percept();};
	exit.src = '/images/exit.png';
	exit.style.height = '100%';
	exit.style.position = 'absolute';
	exit.style.right = '1%';
	exit.style.top = '1%';
	footer.appendChild(exit);
	if (iOS) {FastClick(exit);}
	
	// start dialog
	var dialog = document.createElement('div');
	dialog.id = 'dialog';
	dialog.innerHTML = 'Press "Start" to begin.<br><br>';
	dialog.style.fontSize = 'larger';
	dialog.style.textAlign = 'center';
	dialog.title = 'Ready';
	var start = document.createElement('button');
	start.innerHTML = 'Start';
	start.onclick = function(){
		$(dialog).dialog('destroy').remove();
		this.call = Math.floor(this.intervals*Math.random());
		that.generate();
	};
	start.style.color = 'green';
	start.style.fontSize = 'larger';
	start.style.fontWeight = 'bold';
	$(start).button();
	if (iOS) {FastClick(start);}
	dialog.appendChild(start);
	document.body.appendChild(dialog);
	$(dialog).dialog({
		close: function(){
			$(this).dialog('destroy').remove();
		},
		modal: true,
		resizable: false,
		width: 0.4*$(window).width()
	});
};