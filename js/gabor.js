loadscript('numeric.min',()=>{loadscript('gab')});
function gabor(settings) {
	activity = new Gabor();
	
	// overrides
	for (var key in settings) { activity[key] = settings[key]; }
	
	// initialize
	activity.init();
}
function Gabor(settings) {
	this.ID = 'gabor';
	this.adaptive = new Adaptive({rule:'exponential'});
	this.angle = 90;
	this.call = undefined;
	this.calls = [];
	this.chance = 0;
	this.chances = 3;
	this.correct = 0;
	this.disabled = false;
	this.frequency = 40;
	this.init = function () { this.test(); };
	this.message = 'Which way did the image turn?';
	this.mode = 1;//0:
	this.repeat = true;
	this.responses = [];
	this.roveAngle = 90;//degrees
	this.roveFrequecy = 1/4;//octaves
	this.title = 'Gabor Gratings';
	this.trials = Infinity;
	
	// overrides
	for (var key in settings) { this[key] = settings[key]; }
}
Gabor.prototype.menu = function () {	
	// main
	var main = layout.main(
		this.title, 
		() => { this.back ? this.back() : layout.menu(); },
		{ 	//Protocols: function () { that.protocols(); },
			Settings: () => { this.settings(); }}
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
Gabor.prototype.next = function (response) {
	var that = this;
	
	// standard & target
	standard = Object.assign({},this);
	target = Object.assign({},this);
	
	// angle roving
	if (this.roveAngle) {
		var rove = this.roveAngle*(Math.random()-.5);
		standard.angle += rove;
		target.angle += rove;
	}

	// frequency roving
	if (this.roveFreq) {
		var rove = Math.pow(2,this.roveFreq*(Math.random()-.5));
		standard.frequency *= rove;
		target.frequency *= rove;
	}
	
	// adaptive variables
	switch (this.mode) {
		case 0: //angle
			target.angle += this.adaptive.value;
			break;
		case 1: //frequency
			target.frequency += this.adaptive.value;
	}
	
	// remove focus from afc button
	document.activeElement.blur();

	// if not first pass
	if (this.call !== undefined) {
		// return if disabled
		if (this.disabled) { return; }
		
		// disable
		this.disabled = true;
	
		// check if correct
		var correct = this.call == response;
		
		// log response
		this.responses[this.responses.length] = response;
		
		// score indicator
		if (correct) {
			var img = document.createElement('img');
			img.src = 'images/score-yay.png';
			jQuery(img).addClass('score');
			document.getElementById('score').appendChild(img);
		} else {
			document.getElementById('chance'+this.chance++).src = 'images/score-nay.png';
			--this.chances;
		}
		
		// feedback
		var img = document.createElement('img');
		img.src = correct ? 'images/check.png' : 'images/X.png';
		img.style.bottom = '10%';
		img.style.height = '40%';
		img.style.position = 'absolute';
		img.style.right = '10%';
		img.style.zIndex = '10';
		document.getElementById('afc'+response).appendChild(img);
		jQuery(img).fadeOut(400,function() {
			that.disabled = false;
			if (!that.chances) {
				layout.message(
					'Gabor Density Discrimination', 
					that.mode
					? 'Resolution for frequency: '+that.adaptive.value.toPrecision(3)+'.'
					: 'Resolution for angle: '+that.adaptive.value.toPrecision(3)+'.',
					function () { protocol.next(); }
				);
				jQuery.ajax({
					data: {
						behavior: that.behavior,
						calls: that.calls.join(','),
						mode: that.mode,
						notes: that.notes,
						responses: that.responses.join(','),
						series: that.adaptive.history.join(','),
						subuser: subuser.ID,
						user: user.ID
					},
					type: 'POST',
					url: 'version/'+version+'/php/gabor.php'
				});
			}
		});
		if (!that.chances) { return; }
	}
	
	// adaptive variable
	this.adaptive.logic(correct);
	document.getElementById('adaptive').innerHTML
		= 'Adaptive variable: '+String(this.adaptive.value.toPrecision(2));
	
	// call
	this.call = Math.round(Math.random());
	this.calls[this.calls.length] = this.call;
	
	// play it
	this.stimulus();
}
Gabor.prototype.results = function () {
	var that = this;
	
	// main
	var main = layout.main('Results', () => { this.menu(); });
	
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
			//results.reverse();
			
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
		
			// scaleType
			var scaleType = (that.adaptive.rule == 'linear') ? 'linear' : 'log';
				
			// accordion (content)
			for (var item = 0, items = results.length; item < items; item++) {
				var result = results[item];
				
				// calculate adaptive variable and score
				var series = result.series.split(',');
				var adaptive = Number(series[series.length-1]);//last value
				result.adaptive = adaptive;
				
				// score
				var score;
				try {
					score = percentCorrect(result.calls.split(','),result.responses.split(','));
					score = Number(score.toFixed(1));
				} catch (err) {
					try {
						score = result.score;
					} catch (err) {
						score = undefined;
					}
				}
					
				// heading
				var heading = document.createElement('h3');
				heading.innerHTML = result.entry+' &rarr; '+score+'% at '+adaptive;
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
				data[0] = ['Trial','Adaptive Variable'];
				var series = result.series.split(',');
				for (var a = 1; a <= series.length; a++) {
					data[a] = [a, Number(series[a-1])];
				}
			
				// adaptive variable versus trial
				var chart = new google.visualization.LineChart(chart_div),
					data = google.visualization.arrayToDataTable(data),
					options = {
						chartArea: {height: '50%', width: '70%'},
						hAxis: {title: 'Trial'},
						title: 'Adaptive Series',
						vAxis: {scaleType: scaleType, title: 'Adaptive Variable'}
				};
				chart.draw(data, options);
			
				// sort results for summary plot
				resultsSorted.push([Number(adaptive), score]);
				//resultsSorted.push([result.spacing, score]);
				//resultsSorted.push([Math.min(Number(series[series.length-1]),30), score]);
			}
	
			// accordion (activate)
			jQuery(accordion).accordion({
				active: false,
				collapsible: true,
				heightStyle: 'content'
		   });
		
			// summary chart
			if ('material' in that && 'summaryChart' in that.material) {
				that.material.summaryChart(resultsSorted,summary);
			} else {
				var data = [];
				data[0] = ['something','my-title'];
				for (var a = 0; a < resultsSorted.length; a++) {
					data.push(resultsSorted[a]);
				}
				var data = google.visualization.arrayToDataTable(data);
				var options = {
					chartArea: {width: '70%'},
					//hAxis: {maxV ticks: [-48, -42, -36, -30, -24, -18, -12, -6, 0, 6, 12, 18, 24, {v:30, f:"Quiet"}], title: 'Speech Level'},
					hAxis: {scaleType: scaleType},
					title: 'title',
					vAxis: {maxValue: 100, minValue: 0, title: 'Percent Correct'}
				};
				var chart = new google.visualization.ScatterChart(summary);
				chart.draw(data, options);
			}
		},
		type: 'GET',
		url: 'version/'+version+'/php/gabor.php'
	});
};
Gabor.prototype.settings = function () {
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
Gabor.prototype.stimulus = function () {
	var angle1 = this.call ? target.angle : standard.angle,
		angle2 = this.call ? standard.angle : target.angle;
		freq1 = this.call ? target.frequency : standard.frequency,
		freq2 = this.call ? standard.frequency : target.frequency;
		
	// play it
	jQuery('#gabor').attr('src',gaborgen(angle1,freq1));
	setTimeout(function(){jQuery('#gabor').attr('src',gaborgen(angle2,freq2))},400);
}
Gabor.prototype.test = function () {
	var that = this;
	
	// reset
	this.adaptive.reset();
	this.call = undefined;
	this.calls = [];
	this.chance = 0;
	this.chances = 4;
	this.message = this.mode ? 'Do the gratings contract or expand?' : 'Which way does the image turn?';
	this.responses = [];

	// main
	var main = layout.main();
	
	// afc container
	var container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '5%';
	container.style.height = '70%';
	container.style.width = '45%';
	container.style.left = '5%';
	main.appendChild(container);
	
	// frequency slider
	var div = document.createElement('div');
	div.id = 'frequency-slider';
	div.style.display = 'none';
	div.style.position = 'absolute';
	div.style.top = '5%';
	div.style.height = '5%';
	div.style.width = '100%';
	div.style.left = '0%';
	container.appendChild(div);
	jQuery(function() {
		jQuery('#frequency-slider').slider({
			range: 'max',
			min: 0,
			max: 100,
			value: 50,
			step: .1,
			slide: function( event, ui ) {
				that.frequency = ui.value;
				jQuery('#frequency').val(ui.value);
				jQuery('#gabor').attr('src',
					gaborgen(that.tilt,that.frequency));
			}
		});
		jQuery('#frequency').val(jQuery('#frequency-slider').slider('value'));
	});
	
	// tilt slider
	var div = document.createElement('div');
	div.id = 'tilt-slider';
	div.style.display = 'none';
	div.style.position = 'absolute';
	div.style.top = '15%';
	div.style.height = '5%';
	div.style.width = '100%';
	div.style.left = '0%';
	container.appendChild(div);
	jQuery(function() {
		jQuery('#tilt-slider').slider({
			range: 'max',
			min: -90,
			max: 90,
			value: 0,
			step: 1,
			slide: function( event, ui ) {
				that.tilt = ui.value;
				jQuery('#gabor').attr('src',
					gaborgen(that.tilt,that.frequency));
			}
		});
		jQuery('#tilt').val(jQuery('#tilt-slider').slider('value'));
	});
	
	// afc0 button
	var button = document.createElement('button');
	button.id = 'afc0';
	button.innerHTML = this.mode ? 'contract' : 'left';
	button.onclick = () => { this.next(0); };
	button.style.position = 'absolute';
	button.style.height = '42%';
	button.style.top = '0%';
	button.style.width = '92%';
	button.style.left = '0%';
	button.style.margin = '4%';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	container.appendChild(button);
	
	// afc1 button
	var button = document.createElement('button');
	button.id = 'afc1';
	button.innerHTML = this.mode ? 'expand' : 'right';
	button.onclick = () => { this.next(1); };
	button.style.position = 'absolute';
	button.style.height = '42%';
	button.style.top = '50%';
	button.style.width = '92%';
	button.style.left = '0%';
	button.style.margin = '4%';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	container.appendChild(button);

	// gabor image
	var img = document.createElement('img');
	img.id = 'gabor';
	img.src = gaborgen(50, 50);
	img.style.position = 'absolute';
	img.style.top = '5%';
	img.style.height = '70%';
	img.style.width = '45%';
	img.style.left = '50%';
	main.appendChild(img);
	
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
	message.innerHTML = this.message;
	message.style.display = 'inline-block';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	message.style.width = '50%';
	controls.appendChild(message);
	
	// repeat button
	var button = document.createElement('button');
	button.id = 'repeat';
	button.innerHTML = 'repeat';
	button.onclick = () => { this.stimulus(); };
	button.style.cssFloat = 'right';
	button.style.display = this.repeat ? 'inline' : 'none';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);
	
	// footer
	var footer = layout.footer();
	
	// exit button
	var exit = document.createElement('img');
	exit.onclick = () => {
		this.menu();
		if (protocol) { protocol.active = false; }
	};
	exit.src = 'images/exit.png';
	exit.style.height = '100%';
	exit.style.position = 'absolute';
	exit.style.right = '1%';
	exit.style.top = '1%';
	footer.appendChild(exit);
	
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
		'Visual Discrimination',
		this.mode 
		? 'Decide if the image expands or contracts.'
		: 'Decide which way the image turns.',
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