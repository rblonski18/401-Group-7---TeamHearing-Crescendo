function Keywords(settings) {
	this.alternatives = 4;
	this.behavior = 'Constant';
	this.chance = undefined;
	this.chances = Infinity;
	this.controls =[];
	this.correct = undefined;
	this.ear = 'Not Specified';
	this.init = ()=>{this.test()};
	this.material = undefined;
	this.noise = 'Off';
	this.notes = undefined;
	this.practice = 'Off';
	this.score = undefined;
	this.snr = Infinity;
	this.source = undefined;
	this.threshold = 3;
	this.trial = undefined;
	this.trials = 20;
	
	// overrides
	for (let key in settings) { this[key] = settings[key]; }
}
Keywords.prototype.menu = function () {
	// main
	let main = layout.main(
		'Menu', 
		() => {
			if (user.role == 'Client') {
				layout.dashboard();
			} else {
				(this.back)
					? this.back()
					: layout.speech();
			}
		},
		{ 	Protocols: () => { this.protocols(); },
			Settings: () => { this.settings(); }}
	);
	
	// test button
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Test';
	button.onclick = () => { this.test(); };
	button.style.fontSize = '150%';
	button.style.height = '50%';
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
	if(iOS){FastClick(button);}

	// results button
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Results';
	button.onclick = () => { this.results(); };
	button.style.fontSize = '150%';
	button.style.height = '50%';
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
	if(iOS){FastClick(button);}
	
	// footer
	layout.footer();
};
Keywords.prototype.next = function () {
	let that = this;
	
	// sentence scoring rule
	this.correct = (this.score[this.trial].sum() >= this.threshold);
	
	// score indicator
	if (this.correct) {
		if (this.trials == Infinity) {
			let img = document.createElement('img');
			img.src = 'images/score-yay.png';
			jQuery(img).addClass('score');
			document.getElementById('score').appendChild(img);
		} else if (this.trials < 20) {
			document.getElementById('score'+this.trial).src = 'images/score-yay.png';
		} else {
			score.innerHTML = 'Score: '+this.score.pc2().toFixed(1)+'%'+', remaining: '+String(this.trials-this.trial-1);
		}
	} else {
		if (this.trials < 20) {
			document.getElementById('score'+this.trial).src = 'images/score-nay.png';
		} else if (this.trials != Infinity) {
			score.innerHTML = 'Score: '+this.score.pc2().toFixed(1)+'%'+', remaining:'+String(this.trials-this.trial-1);
		}
		// chance indicator
		if (this.chances != Infinity) {
			document.getElementById('chance'+this.chance++).src = 'images/score-nay.png';
		}
	}

	// increment trial
	this.trial++;
	
	// update processor
	if (this.behavior == 'Adaptive') { processor.snr(this.snr.value); }
	
	// last trial or last chance
	if ((this.trial == this.trials) || (this.chance == this.chances)) {
		// test complete
		let dialog = document.createElement('div');
		dialog.id = 'dialog';
		dialog.innerHTML = 'Test complete.<br>';
		dialog.style.fontSize = 'larger';
		dialog.style.textAlign = 'center';
		dialog.title = 'Test complete';
		document.body.appendChild(dialog);
		jQuery(dialog).dialog({
			buttons: {
				Okay: function () {
					jQuery(this).dialog('destroy').remove();
					
					// shake & bake
					that.save();
				},
			},
			modal: true,
			resizable: false,
			width: 0.4*jQuery(window).width()
		});
		
		// special message
		if (this.material.special) { this.material.special(); }
		
		// stop processor
		try {
			processor.stop();
		} catch (err) {
			console.dir(err);
		}
		return;
	}
	
	// update adaptive variable
	if (this.behavior == 'Adaptive') {
		this.snr.logic(this.correct);
		
		// display
		var msg = (this.noise == 'Off') ? 'Gain: ' : 'SNR: ';
		document.getElementById('adaptive').innerHTML = msg+String(this.snr.value)+' dB';
			
		// update processor
		processor.snr(this.snr.value);
	}
	
	// add score
	this.score.push(new Array(this.material.keywords[this.trial].length).fill(0));

	// change and play signal
	this.source = this.material.select(this.trial);
	processor.signal(this.source);
};
Keywords.prototype.protocols = function () {
	var that = this;
	
	// main
	main = layout.main('Protocols', function () { that.menu(); } );
	
	// material protocols
	if ('protocols' in this.material) { this.material.protocols(); return; }
	
	//
	// menu
	var menu = document.createElement('div');
	
	// menu options
	var options = [
		'Speech Reception at 6, 0, and -6 dB SNR',
		'Speech Reception Thresholds in Quiet and Different Types of Background Noise',
		'Release from Masking (Voicing Cues)'
	];
	var callbacks = [
		function () {
			var ind = 0, snr = [6,0,-6];
			protocol.settings = [];
			for (var a = 0; a < snr.length; a++) {
				protocol.settings[ind++] = {
					adaptive: new Adaptive({value0:snr[a]}),
					behavior: 'Constant',
					chances: Infinity,
					lastchance: false,
					trials: Infinity//overwritten
				};
			}
			protocol.random = false;
			protocol.start();
		},
		function () {
			var noise = [
				'Off',
				'Exciting Ride',
				'Speech-Shaped Noise',
				'Two Talker Masker (English)'
			];
			protocol.settings = [];
			for (var a = 0; a < noise.length; a++) {
				var adaptive = a == 0 ? new Adaptive({value0:-40}) : new Adaptive();
				protocol.settings[a] = {
					adaptive: adaptive,
					behavior: 'Adaptive',
					lastchance: true,
					noise: noise[a]
				};
			}
			protocol.start();
		},
		function () {
			protocol.settings = [];
			var ind = 0,
				noise = ['Female_Mix','Male_Mix'],
				talkers = ['0','4'];
			for (var a = 0; a < noise.length; a++) {
				for (var b = 0; b < talkers.length; b++) {
					protocol.settings[ind++] = {
						adaptive: new Adaptive(),
						behavior: 'Adaptive',
						lastchance: true,
						material: activity.material.ID == 'crm' 
							? new CRM({talkers:talkers[a]}) 
							: activity.material,
						noise: noise[b]
					};
				}
			}
			protocol.start(3);
		}
	];
	var messages = [
		'',
		'',
		''
	];
	var imagelist = [
		'runningman.png',
		'runningman.png',
		'runningman.png'
	];
	
	// menu: build
	for (var a = 0; a < options.length; a++) {	
		// help
		var help = layout.help(options[a],messages[a]);
		help.style.cssFloat = 'right';
		help.style.zindex = 10;			
		
		// item
		var item = document.createElement('li');
		item.id = a;
		item.onclick = function () {
			document.getElementById('home').title = 'Return home.';
			callbacks[this.id]();
		};
		
		// icon
		var img = document.createElement('img');
		img.src = 'images/'+imagelist[a];
		img.style.height = '1.5em';
		img.style.paddingRight = '8px';
		
		// title
		var span = document.createElement('span');
		span.innerHTML = options[a];
		span.style.display = 'inline-block';
		
		// anchor
		var anchor = document.createElement('a');
		anchor.id = 'menuitem'+a;
		anchor.appendChild(img);
		anchor.appendChild(span);
		menu.appendChild(item);
		item.appendChild(anchor);
		anchor.appendChild(help);
		if (iOS) { FastClick(item); };
	}
	jQuery(menu).menu();
	main.appendChild(menu);

	// footer
	layout.footer();
};
Keywords.prototype.results = function () {
	let that = this;

	// main
	let main = layout.main('Results', () => { this.menu(); });
	
	// footer
	layout.footer();
	
	// loading...
	let span = document.createElement('span');
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
			
			// use the material results if present
			if ('material' in that && 'results' in that.material) {
				that.material.results(data);
				return;
			}
			
			// parse results
			results = jQuery.parseJSON(data);
			results.sort(compare);
			
			// no results
			if (results.length == 0) {
				main.insertAdjacentHTML('beforeend','No results.');
				return;
			}
			
			// summary chart (init)
			let resultsSorted = [];
			let summary = document.createElement('div');
			summary.style.height = '50%';
			main.appendChild(summary);
	
			// details
			main.insertAdjacentHTML('beforeend','<h3>History</h3>');
		
			// horizontal rule
			main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');
	
			// accordion (init)	
			let accordion = document.createElement('div');
			accordion.id = 'results';
			main.appendChild(accordion);
		
			// scaleType
			let scaleType = (that.snr.rule == 'linear') ? 'linear' : 'log';
				
			// accordion (content)
			let adaptive, adaptive4, result, score, series, snr;
			for (let item = 0, items = results.length; item < items; item++) {
				result = results[item];
				
				// score
				score = result.score.split(';');
				for (let a = 0; a < score.length; a++) {
					score[a] = score[a].split(',');
				}
				for (let a = 0; a < score.length; a++) {
					for (b = 0; b < score[a].length; b++) {
						score[a][b] = Number(score[a][b]);
					}
				}
				score = score.pc2();
				result.score = score.toFixed(1);

				// snr
				if ('series' in result) {
					series = result.series.split(',').map(Number);
					adaptive = series[series.length-1];//last value
					adaptive4 = series.reversals();
					result.adaptive = adaptive;
					result.adaptive4 = adaptive4;
					snr = (that.material.ID == 'matrix') ? adaptive4 : adaptive;
					result.snr = snr;
				}
				
				// sort results for summary plot
				resultsSorted.push([snr, score]);
					
				// heading
				var heading = document.createElement('h3');
				heading.innerHTML = ('message' in that.material)
					? that.material.message(result)
					: (result.noise == 'Off')
						? (result.behavior === 'Adaptive')
							? result.entry+' &rarr; Detection SRT: '+snr+'dB in Quiet'
							: result.entry+' &rarr; '+score+'% in Quiet'
						: (result.behavior === 'Adaptive')
							? result.entry+' &rarr; 50% SRT: '+snr+' dB SNR in '+result.noise
							: result.entry+' &rarr; '+score+'% at '+snr+' dB SNR in '+result.noise;
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
				if ('series' in result) {
					var chart_div = document.createElement('div');
					chart_div.style.width = '80%';
					container.appendChild(chart_div);
				
					// data
					data = [];
					data[0] = ['Trial','SNR'];
					for (let a = 1; a <= series.length; a++) {
						data[a] = [a, Number(series[a-1])];
					}
				
					// snr versus trial
					var chart = new google.visualization.LineChart(chart_div);
					data = google.visualization.arrayToDataTable(data);
					chart.draw(data, {
						chartArea: {height: '50%', width: '70%'},
						hAxis: {title: 'Trial'},
						title: 'SNR',
						vAxis: {scaleType: scaleType, title: 'SNR'}
					});
				}
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
				data = [];
				data[0] = ['SNR','Sentences'];
				for (let a = 0; a < resultsSorted.length; a++) {
					data.push(resultsSorted[a]);
				}
				var chart = new google.visualization.ScatterChart(summary);
				data = google.visualization.arrayToDataTable(data);
				chart.draw(data, {
					chartArea: {width: '60%'},
					hAxis: {scaleType: scaleType},
					title: that.material.title,
					vAxis: {maxValue: 100, minValue: 0, title: 'Percent Correct'}
				});
			}
		},
		type: 'GET',
		url: 'version/'+version+'/php/'+that.material.ID+'.php'
	});
};
Keywords.prototype.save = function () {	
	//
	let correctItems = 0, correctParts = 0, totalItems = this.score.length, totalParts = 0;
	for (let a = 0; a < this.score.length; a++) {
		if (this.score[a].sum() == this.score[a].length) {
			correctItems++;
		}
		correctParts += this.score[a].sum();
		totalParts += this.score[a].length;
	}
	
	// score dialog
	let dialog = document.createElement('div');
	dialog.id = 'dialog';
	const pc1 = 100 * correctItems / totalItems;
	const pc2 = 100 * correctParts / totalParts;
	dialog.innerHTML = 'Sentences: '+correctItems+' out of '+totalItems+' correct ('+pc1.toFixed(1)+' %). </br>'
		+'Keywords: '+correctParts+' out of '+totalParts+' correct ('+pc2.toFixed(1)+' %). </br>' ;
	dialog.style.fontSize = 'larger';
	dialog.style.textAlign = 'center';
	dialog.title = 'Score';
	document.body.appendChild(dialog);
	
	//
	jQuery(dialog).dialog({
		buttons: {Okay:function(){jQuery(this).dialog('destroy').remove();},},
		modal: true,
		resizable: false,
		width: 'auto'//0.4 * $(window).width()
	});
	
	// save data
	jQuery.ajax({
		data: {
			behavior: this.behavior,
			ear: this.ear,
			noise: this.noise,
			notes: this.notes,
			practice: this.practice,
			score: this.score.join(';'),
			series: (typeof this.snr == 'number') ? this.snr : this.snr.history.join(','),
			snr: (typeof this.snr == 'number') ? this.snr : this.snr.history.join(','),
			subuser: subuser.ID,
			user: user.ID
		},
		success: () => { this.results(); },
		type: 'POST',
		url: 'version/'+version+'/php/'+this.material.ID+'.php'
	});
};
Keywords.prototype.settings = function () {
	var that = this;
	
	// main
	var main = layout.main(
		'Settings',
		function () { that.menu(); },
		{
			Test: function () {
				(that.material.layout)
					? that.material.layout() 
					: that.test();
			}
		}
	);
	
	// settings table
	var table = document.createElement('table');
	table.className = 'ui-widget-content';
	table.style.fontSize = '80%';
	table.style.width = '100%';
	main.appendChild(table); 
	var rowIndex = -1;
	
	// ear tested	
	var select = layout.select(['Not Specified','Both','Left','Right']);
	select.onchange = function () { that.ear = this.value; };
	select.value = this.ear;
	layoutTableRow(table, ++rowIndex, 'Ear tested:', select, '');
	
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
	input.onblur = function () { that.notes = this.value; };
	if (widgetUI) {
		input.style.outline = 'none';
		input.style.paddingBottom = '.4em';
		input.style.paddingLeft = '1em';
		input.style.paddingRight = '1em';
		input.style.paddingTop = '.4em';
		input.style.width = '100%';
		input.className = 'ui-widget ui-state-default ui-corner-all'; 
	}
	cell.appendChild(input);
	var cell = row.insertCell(2);
	cell.style.width = '20%';

	// background noise
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Background noise:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select([
		'Off',
		'Speech-Shaped Noise',
		'Exciting Ride',
		'Two Talker Masker (English)',
		'Two Talker Masker (Spanish)'
	]);
	select.onchange = function () {
		that.noise = this.value;
		that.snr = (that.noise == 'Off')
			? (typeof that.snr == 'number')
				? 0 : new Adaptive({value0:0,valueMax:0})
			: (typeof that.snr == 'number')
				? 12 : new Adaptive({value0:12,valueMax:Infinity});
		that.settings();
	};
	select.value = this.noise;
	cell.appendChild(select);
	if(widgetUI){jQuery(select).selectmenu({change:select.onchange});}
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	// behavior
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Procedure:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select(['Adaptive','Constant']);
	select.onchange = function () {
		that.behavior = this.value;
		that.chances = (that.behavior == 'Adaptive') ? 4 : Infinity;
		that.snr = (that.behavior == 'Adaptive')
			? (that.noise == 'Off')
				? new Adaptive({value0:0,valueMax:0}) 
				: new Adaptive({value0:12,valueMax:Infinity})
			: (that.noise == 'Off')
				? 0 : 12;
		that.trials = (that.behavior == 'Adaptive') ? Infinity : 20;
		that.settings();
	};
	select.value = this.behavior;
	cell.appendChild(select);
	if(widgetUI){jQuery(select).selectmenu({change:select.onchange});}
	
	// gain
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	if (this.behavior === 'Adaptive') {
		var span = document.createElement('span');
		span.innerHTML = 'Initial ';
		span.style.color = 'blue';
		cell.appendChild(span);
	}
	cell.innerHTML = (that.noise == 'Off')
		? cell.innerHTML + ' Speech Level:'
		: cell.innerHTML = cell.innerHTML + ' Signal to Noise Ratio:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var input = document.createElement('input');
	input.onblur = function () {
		if (typeof that.snr == 'number') {
			that.snr = Number(this.value);
		} else {
			that.snr.value0 = Number(this.value);
		}
	};
	input.style.width = '100%';
	input.value = (typeof this.snr == 'number') ? this.snr : this.snr.value0;
	if (widgetUI) {
		input.style.textAlign = 'left';
		jQuery(input).button();
	}
	cell.appendChild(input);
	var cell = row.insertCell(2);
	cell.innerHTML = 'dB';
	cell.style.width = '20%';
	
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
	
	// material settings
	if ('material' in this && 'settings' in this.material) {
		rowIndex = this.material.settings(table,rowIndex);
	}
	
	/*

	// Voice Protocol
	var button = document.createElement('button');
	button.innerHTML = 'Voice';
	button.onclick = function () {
		protocol.settings = []; var a = 0;
		protocol.settings[a++] = {'chances':4,'noise':'crisp','repeat':false};
		protocol.settings[a++] = {'chances':4,'noise':'crisp','repeat':false};
		protocol.settings[a++] = {'chances':4,'noise':'crisp_6','repeat':false};
		protocol.settings[a++] = {'chances':4,'noise':'crisp_6','repeat':false};
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
	
	// SRT Protocol
	var button = document.createElement('button');
	button.innerHTML = 'SRT Protocol';
	button.onclick = function () {
		protocol.settings = [];
		protocol.settings[0] = {'noise':'Off'};
		protocol.settings[1] = {'noise':'Exciting Ride'};
		protocol.settings[2] = {'noise':'Speech-Shaped Noise'};
		protocol.settings[3] = {'noise':'Two Talker Masker (English)'};
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
	
	// SRM Protocol
	var button = document.createElement('button');
	button.innerHTML = 'SRM Adult';
	button.onclick = function () {
		protocol.settings = [];
		protocol.settings[0] = {'noise':'Speech-Shaped Noise'};
		protocol.settings[1] = {'noise':'Speech-Shaped NoiseL'};
		protocol.settings[2] = {'noise':'Speech-Shaped NoiseR'};
		protocol.settings[3] = {'noise':'Exciting Ride'};
		protocol.settings[4] = {'noise':'Exciting RideL'};
		protocol.settings[5] = {'noise':'Exciting RideR'};
		protocol.settings[6] = {'noise':'Two Talker Masker (English)'};
		protocol.settings[7] = {'noise':'Two Talker Masker (English)L'};
		protocol.settings[8] = {'noise':'Two Talker Masker (English)R'};
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
	
	// SRM Child
	var button = document.createElement('button');
	button.innerHTML = 'SRM Child';
	button.onclick = function () {
		protocol.settings = []; var a = 0;
		protocol.settings[a++] = {'noise':'crisp'};
		protocol.settings[a++] = {'noise':'crisp_L'};
		protocol.settings[a++] = {'noise':'crisp_R'};
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

	// material protocols
	if (this.material.protocols) {
		this.material.protocols();
	}*/
		
	// footer
	layout.footer();
};
Keywords.prototype.test = function () {
	let that = this;

	// reset
	this.chance = 0;
	this.score = [];
	this.score[0] = new Array(that.material.keywords[0].length).fill(0);
	this.trial = 0;
	if ('reset' in this.material) { this.material.reset(); }
	
	// reset snr if adaptive
	if (typeof this.snr == 'object') {
		this.snr.reset(()=>{processor.snr(this.snr.value)});
	} else {
		processor.snr(this.snr);
	}
	
	// header
	layout.header('test',this.material.title);
	
	// main
	var main = layout.main();
	
	// container
	var container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '5%';
	container.style.left = '5%';
	container.style.height = '70%';
	container.style.width = '90%';
	main.appendChild(container);
	
	// button table
	var table = document.createElement('table');
	table.id = 'afc_table';
	table.style.height = '100%';
	table.style.position = 'absolute';
	table.style.width = '100%';
	container.appendChild(table);

	// build the table
	var cells = this.alternatives;
	for (var a = 0; a < cells; a++) {
		if (a%cells == 0) {
			var row = table.insertRow(a/cells);
			row.style.width = '100%';
		} else {
			var row = table.rows[Math.floor(a/cells)];
		}
		var cell = row.insertCell(a%cells);
		cell.style.width = 100/cells + '%';

		// buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.id = 'keyword' + String(a);
		button.index = a;
		button.innerHTML = that.material.keywords[that.trial][a];
		button.onclick = function () {
			that.score[that.trial][this.index] = ++that.score[that.trial][this.index] % 2;
			
			// feedback (checks on keywords)
			if (that.score[that.trial][this.index] == 1) {
				check = document.createElement('img');
				check.src = 'images/check.png';
				check.style.bottom = '10%';
				check.style.height = '20%';
				check.style.position = 'absolute';
				check.style.right = '10%';
				this.appendChild(check);
			} else {
				this.removeChild(this.childNodes[1]);
			}
		};
		button.style.fontSize = 'larger%';
		button.style.height = '100%';
		button.style.width = '100%';
		jQuery(button).button();
		cell.appendChild(button);
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
	message.innerHTML = this.material.phrases[0];
	message.style.display = 'inline-block';
	message.style.fontSize = '100%';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	controls.appendChild(message);
	
	// next button
	var next = document.createElement('button');
	next.id = 'next';
	next.innerHTML = 'next';
	next.onclick = function () { that.next(); };
	next.style.color = 'green';
	jQuery(next).css('float','right');
	next.style.fontSize = 'larger';
	next.style.height = '100%';
	next.style.marginLeft = '2%';
	jQuery(next).button();
	controls.appendChild(next);
	
	// all button
	var button = document.createElement('button');
	button.id = 'all';
	button.index = 0;
	button.innerHTML = 'all';
	button.onclick = function () {
		this.index = ++this.index%2;
		for (var a = 0; a < that.material.keywords[that.trial].length; a++) {
			// regardless, try to clear
			try {
				var button = document.getElementById('keyword'+a); 
				button.removeChild(button.childNodes[1]);
			} catch (error) {}
			if (this.index == 0) {
				that.score[that.trial][a] = 0;
			} else {
				that.score[that.trial][a] = 1;
				var check = document.createElement('img');
				check.src = 'images/check.png';
				check = document.createElement('img');
				check.src = 'images/check.png';
				check.style.bottom = '10%';
				check.style.height = '20%';
				check.style.position = 'absolute';
				check.style.right = '10%';
				$(document.getElementById('keyword'+a)).append(check);
			}
		}
	}
	jQuery(button).css('float','right');
	button.style.fontSize = 'larger';
	button.style.height = '100%';
	button.style.marginLeft = '2%';
	jQuery(button).button();
	controls.appendChild(button);
	
	// repeat button
	var repeat = document.createElement('button');
	repeat.id = 'repeat';
	repeat.innerHTML = 'repeat';
	repeat.onclick = function () { 
		try {
			console.log(that.source);
			processor.signal(that.source); 
		} catch (err) {
			console.dir(err);
		}
	};
	jQuery(repeat).css('float','right');
	repeat.style.fontSize = 'larger';
	repeat.style.height = '100%';
	repeat.style.visibility = 'visible';
	jQuery(repeat).button();
	controls.appendChild(repeat);
	
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
		for (var a = 0; a < this.chances; a++) {
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
	
	// scoring help
	var help = layout.help('Keyword Scoring','If the listener correctly identifies 3 or more of the keywords, '
		+ 'a green score bubble is given; otherwise, it is marked red. '
		+ 'This \"3 or more\" rule is also used by the adaptive procedure to adjust noise levels.');
	help.style.height = '1em';
	score.appendChild(help);
	jQuery(score).append(' ');
	
	// score indicator
	var score = document.createElement('span');
	score.id = 'score';
	score.insertAdjacentHTML('beforeend',' Score: ');
	if (this.trials != Infinity) {
		if (this.trials < 20) {
			// score bubbles
			for (var a = 0; a < this.trials; a++) {
				var img = document.createElement('img');
				img.id = 'score'+a;
				img.src = 'images/score-nan.png';
				jQuery(img).addClass('score');
				score.appendChild(img);
			}
		} else {
			// score
			score.innerHTML = 'Score: '+0+', remaining: '+String(this.trials-this.trial);
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
	label.innerHTML = (typeof this.snr == 'number') 
		? 'SNR: '+String(this.snr)
		: 'SNR: '+String(this.snr.value);
	label.style.paddingLeft = '16px';
	label.style.verticalAlign = 'bottom';
	footer.appendChild(label);
	
	// noise meter
	if (processor.noise && (processor.behavior == 'Adaptive')) {
		// label
		var label = document.createElement('h2');
		label.innerHTML = '&nbsp; &nbsp; &nbsp;Noise meter: ';
		label.style.display = 'inline';
		label.style.verticalAlign = 'bottom';
		footer.appendChild(label);
		
		// meter
		var meter = document.createElement('div');
		meter.id = 'noiseMeter';
		meter.style.display = 'inline-block';
		meter.style.height = '60%';
		meter.style.width = '30%';
		jQuery(meter).progressbar({value: 0});
		footer.appendChild(meter);
	}
	
	// exit button
	var exit = document.createElement('img');
	exit.onclick = function () {
		this.style.visibility = 'hidden';
		processor.stop();
		if (protocol && protocol.active) { 
			protocol.active = false; 
			if ('callback' in protocol) { protocol.callback(); }
		} else { that.menu(); }
	};
	exit.src = 'images/exit.png';
	exit.style.height = '100%';
	exit.style.position = 'absolute';
	exit.style.right = '1%';
	exit.style.top = '1%';
	footer.appendChild(exit);
	
	// start dialogue
	var dialog = document.createElement('div');
	dialog.id = 'dialog';
	dialog.innerHTML = 'Mark the keywords that are correctly identified.<br>';
	dialog.style.fontSize = 'larger';
	dialog.style.textAlign = 'center';
	dialog.title = this.material.title;
	document.body.appendChild(dialog);
	jQuery(dialog).dialog({
		buttons: {
			Start: function(){
				jQuery(this).dialog('destroy').remove();
				that.source = that.material.select(that.trial);
				try {
					processor.signal(that.source);
				} catch (err) {
					console.dir(err);
				}
			},
		},
		modal: true,
		resizable: false,
		width: 0.6*jQuery(window).width()
	});
	
	// please wait
	if (this.noise != 'Off') {
		jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
		var message = document.createElement('span');
		message.id = 'message';
		message.innerHTML = 'Please wait, preparing test...&nbsp;';
		message.style.float = 'right';
		jQuery('.ui-dialog-buttonpane').append(message);
	
		// start noise
		const snr = (typeof this.snr == 'number') ? this.snr : this.snr.value;
		const gain = snr < 0 ? 0 : -snr;//dB
		processor.noise(this.noise, gain, function () {
			jQuery(".ui-dialog-buttonpane #message").html('Ready.&nbsp;');
			jQuery(".ui-dialog-buttonpane button:contains('Start')").button("enable");
		});
	}
};