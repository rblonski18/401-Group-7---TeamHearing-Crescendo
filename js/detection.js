function detection(settings){
	activity = new Detection();
	
	// overrides
	for (let key in settings) { activity[key] = settings[key]; }
	
	// initialize
	activity.init();
}
function Detection(settings){
	this.adaptive = new Adaptive({rule:'linear', value:MASTERGAIN, valueMax:76});
	this.call = undefined;
	this.calls = [];
	this.chance = 0;
	this.chances = 3;
	this.correct = 0;
	this.delay = 1e3;
	this.disabled = false;
	this.duration = 0.4;
	this.feedback = true;
	this.frequency = 1000;
	this.init = ()=>{this.test()};
	this.ratio = 0.25;
	this.repeat = true;
	this.responses = [];
	this.trials = Infinity;
	
	// overrides
	for (let key in settings) { this[key] = settings[key]; }
	
	// keypress
	document.onkeypress = function (e) {
		e = e || window.event;
		if (e.keyCode == 32 || e.key == 0) { jQuery('#repeat').click(); }
		for (let a = 1; a < 3; a++) {
			if (e.key == a) {
				jQuery('#afc'+String(a-1)).click();
			}
		}
		if (e.key == '?') { this.settings(); }
	};
}
Detection.prototype.menu = function(){
	// main
	var main = layout.main(
		'Detection Thresholds', 
		() => { this.back ? this.back() : layout.menu(); },
		{ Settings: () => { this.settings(); }}
	);
	
	// test button
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Test';
	button.onclick = () => { this.test(); };
	button.style.fontSize = '150%';
	button.style.height = '40%';
	button.style.left = '8%';
	button.style.position = 'absolute';
	button.style.top = '30%';
	button.style.width = '38%';
	var img = document.createElement('img');
	img.src = 'images/speech.png';
	img.style.height = '60%';
	jQuery(button).button();
	button.appendChild(img);
	main.appendChild(button);
	if(iOS){FastClick(button)}
	
	// results button
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Results';
	button.onclick = () => { this.results(); };
	button.style.fontSize = '150%';
	button.style.height = '40%';
	button.style.right = '8%';
	button.style.position = 'absolute';
	button.style.top = '30%';
	button.style.width = '38%';
	var img = document.createElement('img');
	img.src = 'images/results.png';
	img.style.height = '60%';
	jQuery(button).button();
	button.appendChild(img);
	main.appendChild(button);
	if(iOS){FastClick(button)}
	
	// footer
	layout.footer();
};
Detection.prototype.next = function(){
	let that = this;//extended scope

	// increment trial
	this.trial++;
	
	// end run
	if (this.chance == this.chances || this.trial == this.trials) { this.save(); return; }
	
	// enable buttons
	for (let a = 0; a < 2; a++) { jQuery('#afc'+a).button('enable'); }
	this.disabled = false;
	
	// update adaptive variable
	if (this.call || !this.correct) {
		this.adaptive.logic(this.correct);
		document.getElementById('adaptive').innerHTML 
		= 'Adaptive variable: '+this.adaptive.value.toFixed(1);
	}
	
	// new call
	this.call = Math.random() > this.ratio ? 1 : 0;
	
	//
	this.stimulus();
}
Detection.prototype.response = function(button){
	if(this.disabled){return}
	
	// disable buttons
	for (let a = 0; a < 2; a++) { jQuery('#afc'+a).button('disable'); }
	this.disabled = true;
			
	// check if correct
	this.correct = this.call == button.index;
	
	// log call and response
	this.calls.push(this.call);
	this.responses.push(button.index);
			
	// feedback
	if (this.feedback) {
		if (this.correct) {
			// feedback
			var img = document.createElement('img');
			img.src = 'images/check.png';
			img.style.bottom = '10%';
			img.style.height = '40%';
			img.style.position = 'absolute';
			img.style.right = '10%';
			img.style.zIndex = '10';
			button.appendChild(img);
			jQuery(img).fadeOut(1000);
			
			// score indicator
			if (this.trials == Infinity) {
				score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
			} else if (this.trials < 20){
				document.getElementById('score'+this.trial).src = 'images/score-yay.png';
			} else {
				score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%'+', remaining: '+String(this.trials-this.trial-1);
			}
		} else {
			// feedback
			var img = document.createElement('img');
			img.src = 'images/X.png';
			img.style.bottom = '10%';
			img.style.height = '40%';
			img.style.position = 'absolute';
			img.style.right = '10%';
			img.style.zIndex = '10';
			button.appendChild(img);
			jQuery(img).fadeOut(1e3);
			
			// score indicator
			if (this.trials == Infinity) {
				score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
				document.getElementById('chance'+this.chance++).src = 'images/score-nay.png';
			} else if (this.trials < 20 && windowwidth > 4) {
				document.getElementById('score'+this.trial).src = 'images/score-nay.png';
			} else if (this.trials != Infinity) {
				score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(1)+'%'+', remaining:'+String(this.trials-this.trial-1);
			}	
		
			// practice
			if (this.practice) {
				// message
				const item = '?';
				const message = 'Click on any item to practice.';
				document.getElementById('message').innerHTML = 'The correct answer was "'+'<span style=\'color:blue\'>'+item+'</span>'+'".<br>'+message;
				document.getElementById('next').style.display = '';
				this.modeHold = this.mode;
				this.mode = 'practice';
				
				// enable buttons
				this.disabled = false;
				for (let a = 0; a < this.words.length; a++) { 
					jQuery('#afc'+a).button('option','disabled',false);
				}
				return;
			}
		}
	}
	
	// next
	setTimeout(()=>{this.next()},this.delay);
}
Detection.prototype.results = function(){
	var that = this;
	
	// main
	var main = layout.main('Results', ()=>{this.menu()});
	
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
			for (let a = 0; a < results.length; a++) {
				let result = results[a];
				
				// calculate adaptive variable and score
				var series = result.adaptive.split(',');
				var adaptive = Number(series[series.length-1]);//last value
					
				// heading
				var heading = document.createElement('h3');
				heading.innerHTML = result.entry+' &rarr; Detection Threshold: '+adaptive+' dB';
				accordion.appendChild(heading);
				
				// container
				var container = document.createElement('div');
				accordion.appendChild(container);
				
				// information
				for (let key in result) {
					container.insertAdjacentHTML('beforeend',key+': '+result[key]+'<br>');
				}
				container.setAttribute('unselectable','off');
				
				// chart into container
				var chart_div = document.createElement('div');
				chart_div.style.width = '80%';
				container.appendChild(chart_div);
			
				// data
				var data = [];
				data[0] = ['Trial','Adaptive Variable'];
				for (let a = 1; a <= series.length; a++) {
					data[a] = [a, Number(series[a-1])];
				}
			
				// adaptive variable versus trial
				var chart = new google.visualization.LineChart(chart_div),
					data = google.visualization.arrayToDataTable(data),
					options = {
						chartArea: {height: '50%', width: '70%'},
						hAxis: {title: 'Trial'},
						title: 'Adaptive Series',
						vAxis: {scaleType: 'linear', title: 'Adaptive Variable'}
				};
				chart.draw(data, options);
			
				// sort results for summary plot
				resultsSorted.push([Number(result.frequency),Number(adaptive)]);
			}
	
			// accordion (activate)
			jQuery(accordion).accordion({
				active: false,
				collapsible: true,
				heightStyle: 'content'
			});
		
			// summary chart
			var data = [];
			data[0] = ['something','my-title'];
			for (let a = 0; a < resultsSorted.length; a++) {
				data.push(resultsSorted[a]);
			}
			var data = google.visualization.arrayToDataTable(data);
			var chart = new google.visualization.ScatterChart(summary);
			chart.draw(data, {
				chartArea: {left:'13%', height:'70%', width:'82%'},
				hAxis: {
					logScale: true, 
					maxValue: 16000, 
					minValue: 100, 
					ticks: [
						{v:125, f:'125'}, 
						{v:250, f:'250'}, 
						{v:500, f:'500'}, 
						{v:1000, f:'1000'}, 
						{v:2000, f:'2000'}, 
						{v:4000, f:'4000'}, 
						{v:8000, f:'8000'},
						{v:16000, f:'16000'}
					], 
					title: 'Frequency (Hz)',
					titleTextStyle: {
						fontSize: 18
					}
				},
				legend: {position: 'none'},
				vAxis: {
					direction: -1, 
					maxValue: 100, 
					minValue: -10, 
					ticks: [
						{v:-10, f:''}, 
						{v:0, f:'0'}, 
						{v:10, f:''}, 
						{v:20, f:'20'}, 
						{v:30, f:''}, 
						{v:40, f:'40'}, 
						{v:50, f:''}, 
						{v:60, f:'60'}, 
						{v:70, f:''}, 
						{v:80, f:'80'}, 
						{v:90, f:''}, 
						{v:100, f:'100'}
					],
					title: 'Detection Threshold (dB)',
					titleTextStyle: {
						fontSize: 18
					}
				}
			});
		},
		type: 'GET',
		url: 'version/'+version+'/php/detection.php'
	});
};
Detection.prototype.save = function(data){
	// save to database
	jQuery.ajax({
		data: {
			adaptive: this.adaptive.history.join(','),
			calls: this.calls.join(','),
			ear: this.ear,
			frequency: this.frequency,
			gain: MASTERGAIN,
			practice: this.practice,
			responses: this.responses.join(','),
			subuser: subuser.ID,
			user: user.ID
		},
		error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
		success: function(data, status){
			if (protocol.active) {
				protocol.IDs.push(data);
				protocol.next();
			} else {
				activity.menu();
			}
		},
		type: 'POST',
		url: 'version/'+version+'/php/detection.php'
	});
}
Detection.prototype.settings = function(){
	var that = this;
	
	// main
	var main = layout.main(
		'Settings',
		() => { this.menu(); },
		{ Test: () => { this.test(); } }
	);
	
	// settings table
	var table = document.createElement('table');
	table.className = 'ui-widget-content';
	table.style.fontSize = '80%';
	table.style.width = '100%';
	main.appendChild(table); 
	var rowIndex = -1;
	
	// stimulus mode
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Stimulus mode:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select(['Frequency','Tilt']);
	select.onchange = function () { that.mode = this.selectedIndex; };
	select.value = this.mode ? 'Tilt' : 'Frequency';
	cell.appendChild(select);
	if (widgetUI) { jQuery(select).selectmenu({change:select.onchange}); }
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	// notes
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Notes:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var input = document.createElement('input');
	input.onblur = function () {
		that.notes = this.value;
	};
	input.style.width = '100%';
	if (widgetUI) {
		input.style.textAlign = 'left';
		jQuery(input).button();
	}
	cell.appendChild(input);
	var cell = row.insertCell(2);
	cell.style.width = '20%';
		
	// practice mode
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Practice mode:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select(['Off','On']);
	select.onchange = function () { that.practice = this.value == 'On'; };
	select.value = this.practice ? 'On' : 'Off';
	cell.appendChild(select);
	if (widgetUI) { jQuery(select).selectmenu({change:select.onchange}); }
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	// help message
	help = layout.help(
		'Practice Mode',
		'Practice mode allows the user to practice after missing an item.'
	);
	cell.appendChild(help);
	
	// behavior
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = (this.noise == 'Off')
		? 'Speech Level:'
		: 'Speech to Noise Ratio:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select(['Adaptive','Constant']);
	select.onchange = function () {
		that.behavior = this.value;
		that.chances = (that.behavior === 'Adaptive') ? 4 : Infinity;
		that.trials = (that.behavior === 'Adaptive') ? Infinity : 20;
		that.settings();
	};
	select.value = this.behavior;
	cell.appendChild(select);
	if (widgetUI) { jQuery(select).selectmenu({change:select.onchange}); }
	
	// chances | trials
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = (this.behavior === 'Adaptive')
		? 'Chances:'
		: 'Trials:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var input = document.createElement('input');
	input.onblur = function () {
		if (this.behavior === 'Adaptive') {
			that.chances = Number(this.value);
		} else {
			that.trials = Number(this.value);
		}
	};
	input.style.width = '100%';
	input.value = (this.behavior === 'Adaptive')
		? this.chances
		: this.trials;
	if (widgetUI) {
		input.style.textAlign = 'left';
		jQuery(input).button();
	}
	cell.appendChild(input);
		
	// footer
	layout.footer();
}
Detection.prototype.stimulus = function(){
	// 
	const message = document.getElementById('message').innerHTML;
	document.getElementById('message').style.color = 'green';
	document.getElementById('message').innerHTML = 'Listen';
	
	// stimulus
	if (this.call) {
		setTimeout(() => {
			gain = -dsp.calibrate(this.f1,-this.adaptive.value)-db(processor.masterGain.gain.value);
			processor.play(dsp.gain(dsp.ramp(dsp.tone(this.duration,this.frequency)),gain));
		}, 400);
	}
	
	//
	setTimeout(()=>{
		document.getElementById('message').style.color = 'black';
		document.getElementById('message').innerHTML = message;
	}, 800);
}
Detection.prototype.test = function(){
	var that = this;
	
	// reset
	this.adaptive.reset();
	this.call = undefined;
	this.calls = [];
	this.chance = 0;
	this.responses = [];

	// main
	var main = layout.main();
	
	// afc container
	var container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '5%';
	container.style.height = '70%';
	container.style.width = '90%';
	container.style.left = '5%';
	main.appendChild(container);
	
	// button table
	var table = document.createElement('table');
	table.id = 'response_table';
	table.style.height = '100%';
	table.style.width = '100%';
	container.appendChild(table);

	// response buttons
	const words = ['No','Yes'];
	var cells = words.length;
	for (let a = 0; a < words.length; a++) {				
		// insert cell into table
		if (a%cells == 0) {
			var row = table.insertRow(a/cells);
			row.style.height = '100%';
			row.style.width = '100%';
		}
		var cell = row.insertCell(a%cells);
		cell.style.width = '25%';

		// response buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.id = 'afc'+a;
		button.index = a;
		button.innerHTML = words[a];
		button.onclick = function () { that.response(this); };
		button.style.fontSize = '400%';
		button.style.height = '100%';
		button.style.marginLeft = '5%';
		button.style.width = '90%';
		button.value = 0;
		jQuery(button).button();

		// button in cell
		cell.appendChild(button);
		if(iOS){FastClick(button)}
	}
		
	// controls
	var controls = document.createElement('div');
	controls.className = 'ui-widget-content';
	controls.style.position = 'absolute';
	controls.style.bottom = '5%';
	controls.style.height = '15%';
	controls.style.width = '90%';
	controls.style.left = '5%';
	controls.style.padding = '8px';
	main.appendChild(controls);
	
	// message
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Was there a tone?';
	message.style.display = 'inline-block';
	message.style.fontSize = '200%';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	message.style.paddingLeft = '5%';
	message.style.width = '50%';
	controls.appendChild(message);

	// next button
	var button = document.createElement('button');
	button.id = 'next';
	button.innerHTML = 'next';
	button.onclick = function () {
		document.getElementById('next').style.display = 'none';
		document.getElementById('message').innerHTML = 'Ready!';
		jQuery('#response').button('enable');
	};
	button.style.color = 'green';
	button.style.cssFloat = 'right';
	button.style.display = 'none';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	controls.appendChild(button);
	
	// repeat button
	var button = document.createElement('button');
	button.id = 'repeat';
	button.innerHTML = 'repeat';
	button.onclick = ()=>{this.stimulus()};
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);
	
	// footer
	var footer = layout.footer();
	
	// chances indicator
	if (this.chances != Infinity) {
		var chances = document.createElement('span');
		chances.id = 'chances';
		var help = layout.help('Chances',
			'\"Chances\" are the number of mistakes allowed.'
			+'<br>Chances are not lost for mistakes made at the beginning of the test, '
			+'<br>or for mistakes made in a row.'
		);
		help.style.height = '1em';
		chances.appendChild(help);
		chances.insertAdjacentHTML('beforeend',' Chances: ');
		for (let a = 0; a < this.chances; a++) {
			var img = document.createElement('img');
			img.id = 'chance'+a;
			img.src = 'images/score-nan.png';
			jQuery(img).addClass('score');
			chances.appendChild(img);
		}
		chances.style.verticalAlign = 'bottom';
		footer.appendChild(chances);
	}
	
	// score indicator
	var score = document.createElement('span');
	score.id = 'score';
	score.insertAdjacentHTML('beforeend',' Score: ');
	if (this.trials != Infinity) {
		if (this.trials < 20) {
			for (let a = 0; a < this.trials; a++) {
				var img = document.createElement('img');
				img.id = 'score'+a;
				img.src = 'images/score-nan.png';
				jQuery(img).addClass('score');
				score.appendChild(img);
			}
		} else {
			score.innerHTML = 'Score: '+0+', remaining: '+String(this.trials-this.trial-1);
		}
	}
	score.style.paddingLeft = '16px';
	score.style.verticalAlign = 'bottom';
	footer.appendChild(score);
	
	// break
	var br = document.createElement('br');
	footer.appendChild(br);
	
	// adaptive variable
	var label = document.createElement('span');
	label.id = 'adaptive';
	label.innerHTML = 'Adaptive variable: '+String(this.adaptive.value);
	label.style.paddingLeft = '16px';
	label.style.verticalAlign = 'bottom';
	footer.appendChild(label);

	// start dialog
	layout.message(
		'Detection Thresholds',
		'Listen for the tone.',
		{	Start: function () {
				jQuery(this).dialog('destroy').remove();
				that.next();
		}}
	);

	// add message next to start button
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Ready.&nbsp;';
	message.style.float = 'right';
	jQuery('.ui-dialog-buttonpane').append(message);
}