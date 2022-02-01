function itd(settings) {
	activity = new AFC({
		behavior: 'Adaptive',
		chances: 4,
		ear: 'Both',
		material: new ITD(settings),
		message: 'Did the sound move left or right?',
		mode: 'oddball',
		options: {speech: false},
		practice: false,
		trials: Infinity
	});
	
	// overrides
	for (let key in settings) { activity[key] = settings[key]; }
	
	// initialize
	activity.init();
}
function ITD(settings) {
	this.ID = 'itd';
	this.attack = 0;
	this.delay = new Adaptive({rule:'exponential', value0:800, valueMax:1e3});
	this.depth = 200;
	this.duration = .4;
	this.f0 = 100;
	this.f1 = 1000;
	this.f1Left = undefined;
	this.f1Right = undefined;
	this.fs = audio.sampleRate;
	this.gain = -24;
	this.gainLeft = undefined;
	this.gainRight = undefined;
	this.release = 0;
	this.startmessage = 'You will hear two sounds, listen which way the sound moves.';
	this.stimuli = [];
	this.title = 'ITD Discrimination';
	this.words = ['Left','Right'];
	
	// overrides
	for (let key in settings) { this[key] = settings[key]; }
}
ITD.prototype.generateStimuli = function (difference) {
	difference = typeof difference !== 'undefined' ? difference : this.difference.value;
	
	// loop through intervals
	for (let a = 0; a < activity.alternatives; a++) {

		const target = activity.call == a;
		let stimulus = jQuery.extend(true,{},this);
		
		// 
		with (stimulus) {
			
			// initialize variables
			var attack = Math.round(this.attack*this.fs),
				gainL = Math.sqrt(2)*Math.pow(10,(this.gainLeft-100)/20);
				gainR = Math.sqrt(2)*Math.pow(10,(this.gainRight-100)/20);
				m = 2,
				release = Math.round(this.release*fs),
				samples = Math.ceil(duration*f0)*(fs/f0);
			
			// delay in samples
			var delayOffset = 0;
			var delay = this.delay.value*fs*1e-6,
				delayL = target ? delay : 0,
				delayR = target ? 0 : delay;
				delayL -= delayOffset;
				delayR += delayOffset;
		
			// generate stimulus
			let x = [[],[]];
			
			// left ear
			for (let n = 0; n < delayL; n++) { x[0][n] = 0; }
			for (let n = Math.ceil(delayL); n < (samples+delayL); n++) {
				x[0][n] = gainL*Math.sin(2*Math.PI*f1Left*(n-delayL)/fs)
				* Math.max(1-m*(1+Math.cos(2*Math.PI*(n-delayL)*f0/fs))/2,0);
			}
			for (let n = Math.ceil(delayL); n < Math.ceil(delayL)+attack; n++) {
				x[0][n] *= (1-Math.cos(Math.PI*(n-delayL)/attack))/2;
			}
			for (let n = 0; n < release; n++) {
				x[0][Math.ceil(delayL)+samples-n-1] *= (1-Math.cos(Math.PI*(n-delayL)/release))/2;
			}
			for (let n = samples+delayL; n < samples+delayR; n++) { x[0][n] = 0; }
			
			// right ear
			for (let n = 0; n < delayR; n++) { x[1][n] = 0; }
			for (let n = Math.ceil(delayR); n < (samples+delayR); n++) {
				x[1][n] = gainR*Math.sin(2*Math.PI*f1Right*(n-delayR)/fs)
				* Math.max(1-m*(1+Math.cos(2*Math.PI*(n-delayR)*f0/fs))/2,0);
			}
			for (let n = Math.ceil(delayR); n < Math.ceil(delayR)+attack; n++) {
				x[1][n] *= (1-Math.cos(Math.PI*(n-delayR)/attack))/2;
			}
			for (let n = 0; n < release; n++) {
				x[1][Math.ceil(delayR)+samples-n-1] *= (1-Math.cos(Math.PI*(n-delayR)/release))/2;
			}
			for (let n = samples+delayR; n < samples+delayL; n++) { x[1][n] = 0; }
			
			// assign to stimuli
			this.stimuli[a] = x;
		}
	}
}
ITD.prototype.message = function (result) {
	return 'Discrimination Threshold: '+this.delay.value.toFixed(0)+' \u03BCsec.';
};
ITD.prototype.next = function () {
	// adapt delay 
	this.delay.logic(activity.correct);
	
	// feedback
	document.getElementById('adaptive').innerHTML 
		= 'Interaural timing difference: '+String(this.delay.value.toFixed(0))+' \u03BCsec';
		
	// generate stimulus
	this.generateStimuli(0);
}
ITD.prototype.play = function () {
	var that = this;
	switch(document.getElementById('playbackmode').value) {
		case 'Sequential':
			that.stimulus(1,-1);
			setTimeout(function(){that.stimulus(1,1)},1e3);
			break;
		case 'Simultaneous':
			that.stimulus(1,0);
	}
};
ITD.prototype.protocols = function (options, callbacks, messages) {
	options.push(
		'ITD Discrimination (F0: 110, 220, 440 Hz)'
	);
	callbacks.push(
		() => {
			protocol = new Protocol();
			protocol.activity = 'itd';
			protocol.random = false;
			const f0 = [110,220,440], f1 = [1e3];
			for (let a = 0; a < f0.length; a++) {
				for (let b = 0; b < f1.length; b++) {
					protocol.settings.push({
						material: new ITD({
							f0: f0[a],
							f1: f1[b]
						}),
					});
				}
			}
			protocol.start();
		}
	);
	messages.push(
		''
	);
	return [options,callbacks,messages];
};
ITD.prototype.reset = function () {
	//
	activity.duration = this.duration;
	activity.lights = false;
	
	//
	this.delay.reset();
	this.f1Left = this.f1;
	this.f1Right = this.f1;
	this.fs = audio.sampleRate;
	this.gainLeft = MASTERGAIN;
	this.gainRight = MASTERGAIN;
	
	//
	//this.special();
};
ITD.prototype.results = function () {
	let that = this;
	
	// main
	let main = layout.main('Results', ()=>{activity.menu()});
	
	// footer
	layout.footer();
	
	// loading...
	var span = document.createElement('span');
	span.id = 'loading';
	span.innerHTML = 'Loading...';
	main.appendChild(span);
		
	// database GET
	jQuery.ajax({
		data: {
			password: user.password,
			subuser: subuser ? subuser.ID : 72,
			user: user ? user.ID : 72
		},
		success: function(data, status) {
			// remove the loading child
			document.getElementById('main').removeChild(document.getElementById('loading'));
			
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
			for (var item = 0; item < results.length; item++) {
				var result = results[item];
				
				// calculate adaptive variable and score
				var series = result.series.split(',');
				var adaptive = Number(series[series.length-1]);//last value
				
				// score
				var score = Number(result.score);
					
				// heading
				var heading = document.createElement('h3');
				heading.innerHTML =  result.entry+' &rarr; Discrimination Threshold: '+adaptive+' '+' \u03BCsec';
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
			
				// data
				var data = [];
				data[0] = ['Trial','Discrimination Threshold'];
				var series = result.series.split(',');
				for (var a = 1; a <= series.length; a++) { data[a] = [a, Number(series[a-1])]; }
			
				// adaptive variable versus trial
				var chart = new google.visualization.LineChart(chart_div),
					data = google.visualization.arrayToDataTable(data);
				chart.draw(data, {
						chartArea: {height: '50%', width: '70%'},
						hAxis: {title: 'Trial'},
						legend: {position: 'none'},
						title: 'Adaptive Series',
						vAxis: {
							logScale: true,
							maxValue: 2000, 
							minValue: 1,
							ticks: [
								{v:1, f:'1'}, 
								{v:10, f:'10'}, 
								{v:100, f:'100'}, 
								{v:1000, f:'1000'}
							],
							title: 'Adaptive Variable ('+' \u03BCsec'+')'
						}
				});
			
				// sort results for summary plot
				resultsSorted.push([Number(result.f1),Number(adaptive)]);
			}
	
			// accordion (activate)
			jQuery(accordion).accordion({
				active: false,
				collapsible: true,
				heightStyle: 'content'
		   });
		
			// summary chart
			var data = [];
			data[0] = ['Frequency (Hz)','Discrimination Threshold'];
			for (var a = 0; a < resultsSorted.length; a++) { data.push(resultsSorted[a]); }
			var data = google.visualization.arrayToDataTable(data);
			var chart = new google.visualization.ScatterChart(summary);
			chart.draw(data, {
				chartArea: {width: '70%'},
				hAxis: {
					logScale: true, 
					maxValue: 16000, 
					minValue: 100, 
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
					title: 'Frequency (Hz)'
				},
				legend: {position: 'none'},
				title: 'ITD Discrimination',
				vAxis: {
					logScale: true,
					maxValue: 2000, 
					minValue: 1,
					ticks: [
						{v:1, f:'1'}, 
						{v:10, f:'10'}, 
						{v:100, f:'100'}, 
						{v:1000, f:'1000'}
					],
					title: 'Discrimination Threshold ('+' \u03BCsec'+')'
				}
			});
		},
		type: 'GET',
		url: 'version/'+version+'/php/itd.php'
	});
};
ITD.prototype.save = function (data) {
	data.adaptive = this.delay.value;
	data.duration = this.duration;
	data.f0 = this.f0;
	data.f1 = this.f1;
	data.f1Left = this.f1Left;
	data.f1Right = this.f1Right;
	data.gainLeft = this.gainLeft;
	data.gainRight = this.gainRight;
	data.series = this.delay.history.join(',');
	return data;
}
ITD.prototype.settings = function (table, rowIndex) {
	let that = this;
	
	// f0
	var input = layout.input(this.f0);
	input.onblur = function() { that.f0 = Number(this.value); };
	layoutTableRow(table,++rowIndex,'Modulation frequency:',input,'Hz');
	
	// f1
	var input = layout.input(this.f1);
	input.onblur = function() { that.f1 = Number(this.value); };
	layoutTableRow(table,++rowIndex,'Carrier frequency:',input,'Hz');
	
	// stimulus duration
	var input = layout.input(this.duration*1e3);
	input.onblur = function () { that.duration = Number(this.value)/1e3; };
	layoutTableRow(table,++rowIndex,'Stimulus duration:',input,'ms');
};
ITD.prototype.special = function () {	//adjust left ear first
	let that = this;
	this.rove = false;//?
	this.generateStimuli(0);
	
	// special start dialog
	var dialog = document.createElement('div');
	dialog.innerHTML = 'Set your left ear to a comfortable loudness.<br><br>';
	dialog.style.fontSize = 'larger';
	dialog.style.textAlign = 'center';
	dialog.title = 'Volume and Pitch Matching';
	
	// settings table
	var table = document.createElement('table');
	table.style.width = '100%';
	dialog.appendChild(table);
	
	// row index
	var index = 0;
	
	// top row (left ear) - loudness
	var row = table.insertRow(index++);
	var cell = row.insertCell(0);
	cell.innerHTML = 'Volume (left):';
	cell.style.textAlign = 'right';
	cell.style.width = '20%';
	var cell = row.insertCell(1);
	cell.style.width = '30%';
	var inputLL = document.createElement('input');
	inputLL.id = 'gainL';
	inputLL.value = MASTERGAIN;
	jQuery(inputLL).button();
	cell.appendChild(inputLL);
	inputLL.onchange = function(){
		MASTERGAIN = Number(document.getElementById('gainL').value);
		processor.volume(MASTERGAIN);
		that.stimulus(1,-1)//play();
	};
	inputLL.onkeypress = function(e) {
		//that.gainLeft = document.getElementById('gainL').value-100;
		if(e.keyCode === 13){this.onchange()}
	};
	
	// -
	var cell = row.insertCell(2);
	cell.innerHTML = 'dB';
	cell.style.textAlign = 'left';
	cell.style.width = '50%';
	var buttonLLdec = document.createElement('button');
	buttonLLdec.innerHTML = '-';
	buttonLLdec.onclick = function () {
		MASTERGAIN -= 2;
		that.gainLeft = MASTERGAIN;
		document.getElementById('gainL').value = MASTERGAIN;
		console.log('left: ',that.gainLeft,'right: ',that.gainRight)
		processor.volume(MASTERGAIN);
		that.generateStimuli(0);
		that.stimulus(1,-1)//play();
	};
	buttonLLdec.style.marginLeft = '5%';
	buttonLLdec.style.width = '20%';
	jQuery(buttonLLdec).button();
	cell.appendChild(buttonLLdec);
	
	// +
	var buttonLLinc = document.createElement('button');
	buttonLLinc.innerHTML = '+';
	buttonLLinc.onclick = function () {
		MASTERGAIN = Math.min(MASTERGAIN+2,100);
		that.gainLeft = MASTERGAIN;
		document.getElementById('gainL').value = MASTERGAIN;
		console.log('left: ',that.gainLeft,'right: ',that.gainRight)
		processor.volume(MASTERGAIN);
		that.generateStimuli(0);
		that.stimulus(1,-1)//play();
	};
	buttonLLinc.style.marginLeft = '5%';
	buttonLLinc.style.width = '20%';
	jQuery(buttonLLinc).button();
	cell.appendChild(buttonLLinc);
	
	// dialog
	jQuery(dialog).dialog({
		buttons: {
			Repeat: function(){
				if (this.stimuli == undefined){
					that.generateStimuli(0);
				}
				that.stimulus(1,-1);
			},
			Okay: function () {
				that.gainLeft = MASTERGAIN;
				that.gainRight = that.gainLeft;
				that.special1();
				jQuery(this).dialog('destroy').remove();			}
		},
		modal: true,
		resizable: false,
		width: .8*jQuery(window).width()
	});
}
ITD.prototype.special1 = function () { //adjust right ear
	let that = this;
	this.rove = false;//?
	
	// special start dialog
	var dialog = document.createElement('div');
	dialog.innerHTML = 'Set your right ear to a matching loudness and frequency.<br><br>';
	dialog.style.fontSize = 'larger';
	dialog.style.textAlign = 'center';
	dialog.title = 'Volume and Pitch Matching';
	
	// settings table
	var table = document.createElement('table');
	table.style.width = '100%';
	dialog.appendChild(table);
	
	// row index
	var index = 0;
	
	// simultaneous or sequential
	var row = table.insertRow(index++);
	var cell = row.insertCell(0);
	cell.innerHTML = 'Playback:';
	cell.style.textAlign = 'right';
	cell.style.width = '20%';
	var cell = row.insertCell(1);
	cell.style.width = '30%';
	var select = layout.select(['Simultaneous','Sequential']);
	select.id = 'playbackmode';
	cell.appendChild(select);
	
	// top row (right ear) - loudness 
	var row = table.insertRow(index++);
	var cell = row.insertCell(0);
	cell.innerHTML = 'Volume (right):';
	cell.style.textAlign = 'right';
	cell.style.width = '20%';
	var cell = row.insertCell(1);
	cell.style.width = '30%';
	var inputRL = document.createElement('input');
	inputRL.id = 'gainR';
	inputRL.value = MASTERGAIN;
	jQuery(inputRL).button();
	cell.appendChild(inputRL);
	
	// input
	var cell = row.insertCell(2);
	cell.innerHTML = 'dB';
	cell.style.textAlign = 'left';
	cell.style.width = '50%';
	inputRL.onchange = function(){
		//that.gainRight = Math.min(100,Number(document.getElementById('gainR').value))+that.gain-MASTERGAIN;
		document.getElementById('gainR').value =  that.gainRight-that.gain+MASTERGAIN;
		that.generateStimuli(0);
		that.play();
	};
	inputRL.onkeypress = function(e) {
		//that.gainRight = document.getElementById('gainR').value-100;
		if(e.keyCode === 13){this.onchange()}
	};
	
	// -
	var buttonRLdec = document.createElement('button');
	buttonRLdec.innerHTML = '-';
	buttonRLdec.onclick = function () {
		that.gainRight -= 2;
		document.getElementById('gainR').value =  that.gainRight; //-that.gain+MASTERGAIN;
		console.log('left: ',that.gainLeft,'right: ',that.gainRight)
		that.generateStimuli(0);
		that.play();
	};
	buttonRLdec.style.marginLeft = '5%';
	buttonRLdec.style.width = '20%';
	jQuery(buttonRLdec).button();
	cell.appendChild(buttonRLdec);
	
	// +
	var buttonRLinc = document.createElement('button');
	buttonRLinc.innerHTML = '+';
	buttonRLinc.onclick = function () {
		that.gainRight = Math.min(that.gainRight+2,100);
		document.getElementById('gainR').value =  that.gainRight; //-that.gain+MASTERGAIN;
		console.log('left: ',that.gainLeft,'right: ',that.gainRight)
		that.generateStimuli(0);
		that.play();
	};
	buttonRLinc.style.marginLeft = '5%';
	buttonRLinc.style.width = '20%';
	jQuery(buttonRLinc).button();
	cell.appendChild(buttonRLinc);
	
	// top row (right ear) - frequency 
	var row = table.insertRow(index++);
	var cell = row.insertCell(0);
	cell.innerHTML = 'Frequency (right):';
	cell.style.textAlign = 'right';
	cell.style.width = '20%';
	var cell = row.insertCell(1);
	cell.style.width = '30%';
	var inputRF = document.createElement('input');
	inputRF.id = 'f1R';
	inputRF.value = this.f1;
	jQuery(inputRF).button();
	cell.appendChild(inputRF);
	var cell = row.insertCell(2);
	cell.innerHTML = 'Hz';
	cell.style.textAlign = 'left';
	cell.style.width = '50%';
	inputRF.onchange = function(){
		that.f1Right = document.getElementById('f1R').value;
		that.generateStimuli(0);
		that.play();
	};
	inputRF.onkeypress = function(e) {
		that.f1Right = document.getElementById('f1R').value;
		if(e.keyCode === 13){this.onchange()}
	};
	
	//
	var buttonRFdec = document.createElement('button');
	buttonRFdec.innerHTML = '-';
	buttonRFdec.onclick = function () {
		that.f1Right = Number(that.f1Right);
		that.f1Right -= 2;
		document.getElementById('f1R').value = that.f1Right;
		that.generateStimuli(0);
		that.play();
	};
	buttonRFdec.style.marginLeft = '5%';
	buttonRFdec.style.width = '20%';
	jQuery(buttonRFdec).button();
	cell.appendChild(buttonRFdec);
	
	//
	var buttonRFinc = document.createElement('button');
	buttonRFinc.innerHTML = '+';
	buttonRFinc.onclick = function () {
		that.f1Right = Number(that.f1Right);
		that.f1Right += 2;
		document.getElementById('f1R').value = that.f1Right;
		that.generateStimuli(0);
		that.play();
	};
	buttonRFinc.style.marginLeft = '5%';
	buttonRFinc.style.width = '20%';
	jQuery(buttonRFinc).button();
	cell.appendChild(buttonRFinc);
	
	// dialog
	jQuery(dialog).dialog({
		buttons: {
			Repeat: function(){
				that.play();
			},
			Okay: function () {
				jQuery(this).dialog('destroy').remove();
			}
		},
		modal: true,
		resizable: false,
		width: .8*jQuery(window).width()
	});
}
ITD.prototype.start = function () {	
	//
	layout.message(
		this.title,
		this.startmessage, 
		{
			Start: function () { 
				jQuery(this).dialog('destroy').remove();
				activity.disabled = false;
				activity.next();
				
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
	});

	// add message next to start button
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Ready.&nbsp;';
	message.style.float = 'right';
	jQuery('.ui-dialog-buttonpane').append(message);
	
	//
	this.special();
}
ITD.prototype.stimulus = function (interval,pan) {
	interval = typeof interval !== 'undefined' ? interval : activity.call;
	pan = typeof pan !== 'undefined' && typeof pan !== "boolean" ? pan : 0;
	
	// select interval
	let y = this.stimuli[interval];
	
	// play it
	processor.play(y,pan);
	
	// return y for plotting
	return y;
};