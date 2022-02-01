function AFC(settings) {
	this.adaptive = undefined;
	this.alternatives = 2;
	this.back = () => {};
	this.behavior = 'Constant';
	this.call = 0;
	this.calls = [];
	this.chance = undefined;
	this.chances = Infinity;
	this.controls = [];
	this.correct = undefined;
	this.delay = 500;//ms
	this.disabled = true;
	this.duration = 1;
	this.ear = 'Not Specified';
	this.feedback = true;
	this.gain = 40;
	this.init = () => { this.test(); };
	this.jitter = 0;
	this.lastchance = false;
	this.level = undefined;
	this.lights = false;
	this.material = undefined;
	this.message = 'Which word did you hear?';
	this.mode = 'identification';
	this.noise = 'Off';
	this.notes = undefined;
	this.pause = 0.2;
	this.percept = false;
	this.practice = false;
	this.ready = 0;
	this.repeat = true;
	this.responses = [];
	this.sequence = [];
	this.setting = 0;
	this.snr = Infinity;
	this.sound = true;
	this.speech = false;
	this.startmessage = 'You will hear a spoken word.<br>Match the word with the correct button.';
	this.trial = undefined;
	this.trials = 10;
	this.volume = false;

	// ear control
	if (ear != 0) {
		switch (ear) {
			case 1: this.ear = 'Not Specified'; break;
			case 2: this.ear = 'Left'; break;
			case 3: this.ear = 'Right'; break;
			case 4: this.ear = 'Both';
		}
	}

	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }

	// adaptive variable
	switch (this.adaptive) {
		case 'gain': this.gain = new Adaptive(settings); break;
		case 'snr': this.snr = new Adaptive(settings);
	}

	// corrections
	switch (this.behavior) {
		case 'Adaptive': this.trials = Infinity; break;
		case 'Constant': this.chances = Infinity;
	}

	// global variable for canceling intervals
	timeouts = [];
}
AFC.prototype.check = function() {
	let that = this;
	let dialog = layout.message('Intervals','Identify the interval between notes.');

	// database
	jQuery.ajax({
		data: {
			ear: ear,
			method: 'highscore',
			subuser: subuser.ID,
			user: user.ID
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.error(errorThrown);
			that.level = undefined;
			that.test();
		},
		success: function (data, status) {
			data = jQuery.parseJSON(data);
			console.log(data);
			that.level =  data.length == 0 ? 1 : data[0].level+1;
			that.test();
			jQuery(dialog).dialog('destroy').remove();
		},
		type: 'GET',
		url: 'version/' + version + '/php/' + this.material.ID + '.php'
	});
}
AFC.prototype.levels = function() {
	if (this.level == undefined) { return; }
	if (this.level == 1) { this.snr = Infinity; }
	else { this.snr = 12 - 6 * (this.level-2); }
}
AFC.prototype.menu = function () {
	let that = this;

	// main
	let main = layout.main(
		('title' in that.material) ? that.material.title : 'Menu',
		() => { that.back ? that.back() : layout.menu(); },
		{
			Protocols: () => { that.protocols(); },
			Settings: () => { that.settings(); }
		}
	);

	// test button
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Test';
	button.onclick = function () { this.disabled = true; that.test(); };
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
	if(iOS){FastClick(button)}

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
	if(iOS){FastClick(button)}

	// footer
	layout.footer();
};
AFC.prototype.next = function () {
	let that = this;

	// keywords
	if (this.mode == 'keywords' && this.trial >= 0) {
		this.score[this.trial] = [];
		for (let a = 0; a < this.material.keywords[this.trial].length; a++) {
			var button = document.getElementById('afc'+a);
			this.score[this.trial][a] = Number(button.value);
			button.value = 0;
		}
	}

	// increment trial
	this.trial++;

	// keywords
	if (this.mode == 'keywords') { this.material.select(this.trial); }

	// last chance or last trial
	if ((this.chance == this.chances) || (this.trial == this.trials)) {
		// clear onkeypress
		document.onkeypress = null;

		// lastchance function in material
		if (this.lastchance && this.material.lastchance) {
			this.material.lastchance();
			return;
		}

		// log calls & responses
		let calls = [], responses = [];
		if (this.trials < 200) {
			for (let a = 0; a < this.trials; a++) {
				calls.push(this.calls[this.calls.length-this.trials+a]);
				responses.push(this.responses[this.responses.length-this.trials+a]);
			}
		} else {
			calls = this.calls;
			responses = this.responses;
		}

		// score message
		const score = percentCorrect(calls,responses).toPrecision(4);
		let message = ('message' in this.material)
		? this.material.message()
		: (this.behavior == 'Adaptive')
			? (this.noise == 'Off')
				? 'Speech Reception Threshold: '+this.gain.value+' dB.'
				: 'Speech Reception Threshold: '+this.snr.value+' dB SNR.'
			: 'Score: '+score+'%.';

		// data (common)
		let data = {
			behavior: this.behavior,
			calls: this.calls.join(','),
			ear: this.ear,
			gain: MASTERGAIN,
			level: this.level,
			noise: this.noise,
			practice: this.practice ? 'On' : 'Off',
			responses: this.responses.join(','),
			score: score,
			series: (typeof this.gain == 'object') ? this.gain.history.join(',') : (typeof this.snr == 'object') ? this.snr.history.join(',') : false,
			setting: this.setting,
			snr: (typeof this.snr == 'number') ? Math.min(this.snr,100) : Math.min(this.snr.value,100),
			subuser: subuser.ID,
			user: user.ID
		};

		// data (material specific)
		if ('save' in this.material) { data = this.material.save(data); }

		// save to database
		jQuery.ajax({
			data: data,
			error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
			success: function(data, status) {
				if(protocol.active){
					protocol.IDs.push(data);
					layout.message(activity.material.title, message, ()=>{protocol.next()});
				} else {
					layout.message(activity.material.title, message, ()=>{that.results()});
				}
			},
			type: 'POST',
			url: 'version/'+version+'/php/'+this.material.ID+'.php'
		});

		// stop processor
		processor.stop();
		return;
	}

	// update adaptive variable in material
	if ('adaptive' in this.material) {
		this.material.adaptive();
	}

	// adaptive gain
	if (typeof this.gain == 'object') {
		this.gain.logic(this.correct);
		document.getElementById('adaptive').innerHTML = 'Level: ' + this.gain.value + ' dB';
		processor.volume(this.gain.value);
	}

	// adaptive snr
	if (typeof this.snr == 'object') {
		this.snr.logic(this.correct);
		document.getElementById('adaptive').innerHTML = 'SNR: ' + this.snr.value + ' dB';
		processor.snr(this.snr.value);
	}

	// sequencer
	this.sequence = [];
	switch (this.mode) {
		case 'CRM':
			this.call = Math.floor(32*Math.random());
			this.sequence = [this.call];
			break;
		case 'identification':
			this.call = ('select' in this.material)
				? this.material.select()
				: Math.floor(this.alternatives*Math.random());
			this.sequence = [this.call];
			break;
		case 'keywords':
			this.call = ('select' in this.material)
				? this.material.select()
				: Math.floor(this.alternatives*Math.random());
			this.sequence = [this.call];
			break;
		case 'oddball':
			this.call = Math.floor(this.alternatives*Math.random());
			for (let a = 0; a < this.alternatives; a++) {
				this.sequence[a] = a;//(a == this.call) ? 1 : 0;
			}
			break;
		case 'pattern':
			while (this.sequence.sum() == 0 || this.sequence.sum() == this.intervals) {
				for (let a = 0; a < this.intervals; a++) {
					this.sequence[a] = Math.floor(Math.random()*this.alternatives);
				}
			}
	}

	// material option (next)
	if ('next' in this.material) { this.material.next(); }

	// clear timeouts for early responses
	for (let a = 0; a < timeouts.length; a++) {
		clearTimeout(timeouts[a]);
	}
	timeouts = [];

	// play sequence
	setTimeout(()=>{this.playSequence(true)},this.delay);
};
AFC.prototype.play = function (index, init, light) {
	let that = this;

	// defaults
	if (index === undefined) { index = 0; }
	if (init === undefined) { init = true; }
	if (light === undefined) { light = index; }

	// lights on
	if (this.lights) {
		jQuery('#afc'+light).css('color','yellow');
	}

	// play material
	this.material.stimulus(index,init);

	// lights off
	if (this.lights) {
		setTimeout((function (light) {
			return function () {
				jQuery('#afc'+light).css('color',buttonColor);
			}
		})(light), this.duration*1e3);
	}
};
AFC.prototype.playSequence = function (init) {
	let that = this;

	// enable buttons
	this.disabled = false;
	for (let a = 0; a < this.alternatives; a++) {
		jQuery('#afc'+a).button('option','disabled',false);
	}

	// play sequence with delay
	let delay = 0;
	for (let a = 0; a < this.sequence.length; a++) {
		// set timers
		timeouts[a] = setTimeout((function (a) {
			return function () {
				var index = that.sequence[a];
				var light = (that.mode == 'oddball' || that.modeHold == 'oddball') ? a : index;
				that.play(index,init,light);
			}
		})(a), delay*1e3);

		// interstimulus pause
		delay += this.duration + this.pause;
	}
}
AFC.prototype.protocols = function () {
	let that = this;

	// main
	let main = layout.main('Protocols', () => { that.menu(); });

	// menu
	let menu = document.createElement('div');

	// init menu info
	let callbacks = [], messages = [], options = [];

	// menu options
	if (this.speech) {
		callbacks.push(
			// Speech Reception at 6, 0, and -6 dB SNR
			() => {
				protocol = new Protocol();
				protocol.activity = activity.material.ID;
				protocol.open = () => { gui.gain(); };
				protocol.random = false;
				const snr = [6,0,-6];
				for (let a = 0; a < snr.length; a++) {
					protocol.settings.push({
						behavior: 'Constant',
						chances: Infinity,
						lastchance: false,
						noise: 'Speech-Shaped Noise',
						snr: snr[a],
						trials: 20
					});
				}
				protocol.start();
			},
			// Speech Reception Thresholds in Quiet and Different Types of Background Noise
			() => {
				protocol = new Protocol();
				protocol.activity = activity.material.ID;
				protocol.open = () => { gui.gain(); };
				protocol.random = false;
				const noise = ['Off','Exciting Ride','Speech-Shaped Noise','Two Talker Masker (English)'];
				let adaptive;
				for (let a = 0; a < noise.length; a++) {
					protocol.settings.push({
						behavior: 'Adaptive',
						noise: noise[a],
						trials: Infinity
					});
				}
				protocol.start();
			},
			// Release from Masking (Voicing Cues)
			() => {
				protocol = new Protocol();
				protocol.activity = activity.material.ID;
				protocol.open = () => { gui.gain(); };
				const noise = ['Female_Mix','Male_Mix'], talkers = ['0','4'];
				for (let a = 0; a < noise.length; a++) {
					for (let b = 0; b < talkers.length; b++) {
						protocol.settings.push({
							behavior: 'Adaptive',
							controls: [],
							material: activity.material.ID === 'crm'
								? new CRM({talkers:talkers[a]})
								: activity.material,
							noise: noise[b],
							trials: Infinity
						});
					}
				}
				protocol.start(3);
			}
		);
		messages.push(
			'',
			'',
			''
		);
		options.push(
			'Speech Reception at 6, 0, and -6 dB SNR',
			'Speech Reception Thresholds in Quiet and Different Types of Background Noise',
			'Release from Masking (Voicing Cues)'
		);
	}

	// material protocols
	if ('protocols' in this.material) {
		[options,callbacks,messages] = this.material.protocols(options,callbacks,messages);
	}

	// menu: build
	for (let a = 0; a < options.length; a++) {
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
		img.src = 'images/runningman.png';
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
		if(iOS){FastClick(item)}
	}
	jQuery(menu).menu();
	main.appendChild(menu);

	// footer
	layout.footer();
};
AFC.prototype.results = function () {
	let that = this;

	// main
	let main = layout.main('Results', () => { this.menu(); });

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
			activity: that.material.activity+4,
			password: user.password,
			subuser: subuser ? subuser.ID : 72,
			user: user ? user.ID : 72
		},
		success: function(data, status) {
			// remove the loading child
			document.getElementById('main').removeChild(document.getElementById('loading'));

			// use the material results if present
			if ('results' in that.material) { that.material.results(data); return; }

			// parse results
			results = jQuery.parseJSON(data);
			results.sort(compare);

			// no results
			if (results.length == 0) { main.insertAdjacentHTML('beforeend','No results.'); return; }

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
			for (var item = 0, items = results.length; item < items; item++) {
				var result = results[item];

				// calculate adaptive variable and score
				console.log(result);
				var series = result.series.split(',').map(Number);
				var adaptive = series[series.length-1];//last value
				var adaptive4 = series.reversals();
				result.adaptive = adaptive;
				result.adaptive4 = adaptive4;

				// score
				var score;
				if (result.behavior === 'Adaptive') {
					score = 75;
				} else {
					try {
						score = percentCorrect(result.calls.split(','),result.responses.split(','));
						score = Number(score.toFixed(1));
					} catch (err) {
						try {
							score = Number(result.score);
						} catch (err) {
							score = undefined;
						}
					}
				}

				// snr
				var snr;
				if (result.behavior == 'Adaptive') {
					snr = series[series.length-1];
				} else {
					try {
						snr = result.noise == 'Off' ? 30 : result.snr;
						snr = Number(snr);
					} catch (err) {}
				}
				snr = Math.min(30,snr);

				// heading
				var heading = document.createElement('h3');
				heading.innerHTML = ('message' in that.material)
					? that.material.message(result)
					: (result.noise == 'Off')
						? (result.behavior === 'Adaptive')
							? result.entry+' &rarr; 75% SRT: '+snr+' dB in Quiet'
							: result.entry+' &rarr; '+score+'% in Quiet'
						: (result.behavior === 'Adaptive')
							? result.entry+' &rarr; 75% SRT: '+snr+' dB SNR in '+result.noise
							: result.entry+' &rarr; '+score+'% at '+snr+' dB SNR in '+result.noise;
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

				// series chart for adaptive procedures
				if (result.behavior === 'Adaptive') {
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
						chartArea: {height: '50%', width: '80%'},
						hAxis: {title: 'Trial'},
						legend: {position: 'none'},
						title: 'Adaptive Series',
						vAxis: {scaleType: 'linear', title: 'Adaptive Variable'}
					});
				}

				// sort results for summary plot
				if (!(result.behavior === 'Adaptive' && result.noise === 'Off')) {
					resultsSorted.push([snr, score]);
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
				var data = [];
				data[0] = ['SNR',that.material.title];
				for (var a = 0; a < resultsSorted.length; a++) { data.push(resultsSorted[a]); }
				var data = google.visualization.arrayToDataTable(data);
				var chart = new google.visualization.ScatterChart(summary);
				chart.draw(data, {
					chartArea: {width:'80%'},
					hAxis: {
						maxValue:30,
						minValue:-30,
						scaleType:'linear',
						ticks: [
						{v:-30, f:'Noisy'},
						{v:-24, f:'-24'},
						{v:-18, f:''},
						{v:-12, f:'-12'},
						{v:-6, f:''},
						{v:0, f:'0'},
						{v:6, f:''},
						{v:12, f:'12'},
						{v:18, f:''},
						{v:24, f:'24'},
						{v:30, f:'Quiet'}
					],
						title:'Signal-to-Noise Ratio (dB)'
					},
					legend: {position: 'none'},
					title: that.material.title,
					vAxis: {maxValue: 100, minValue: 0, title: 'Percent Correct'}
				});
			}
		},
		type: 'GET',
		url: 'version/'+version+'/php/'+that.material.ID+'.php'
	});
};
AFC.prototype.settings = function () {
	let that = this;

	// main
	let main = layout.main(
		'Settings',
		() => { this.menu(); },
		{
			Test: () => {
				(this.material.layout)
					? this.material.layout()
					: this.test();
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

	// ear
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

	// feedback
	var select = layout.select(['Off','On']);
	select.onchange = function () { that.feedback = this.value == 'On'; };
	select.value = this.feedback ? 'On' : 'Off';
	help = layout.help(
		'Visual Feedback',
		'Turns correct-answer feedback on or off.'
	);
	layoutTableRow(table, ++rowIndex, 'Visual feedback:', select, '',help);

	// practice mode
	var select = layout.select(['Off','On']);
	select.onchange = function () { that.practice = this.value == 'On'; };
	select.value = this.practice ? 'On' : 'Off';
	help = layout.help(
		'Practice Mode',
		'Practice mode allows the user to practice after missing an item.'
	);
	layoutTableRow(table, ++rowIndex, 'Practice mode:', select, '',help);

	// repeat button
	var select = layout.select(['Off','On']);
	select.onchange = function () { that.repeat = this.value == 'On'; };
	select.value = this.repeat ? 'On' : 'Off';
	help = layout.help(
		'Repeat Button',
		'Turns the "Repeat" button on or off.'
	);
	layoutTableRow(table, ++rowIndex, 'Repeat button:', select, '',help);

	// alternatives
	if (this.mode == 'oddball') {
		var input = layout.input(this.alternatives);
		input.onblur = function () { that.alternatives = Number(this.value); };
		layoutTableRow(table,++rowIndex,'Alternatives:',input,'');
	}

	// master gain
	var input = layout.input(MASTERGAIN);
	input.onblur = function() {
		MASTERGAIN = Math.min(this.value,76);
		MASTERHOLD = MASTERGAIN;
		processor.volume(MASTERGAIN);
		activity.material.stimulus(0);
		this.value = MASTERGAIN;
	};
	layoutTableRow(table,++rowIndex,'Master gain:',input,'dB');

	// percept settings
	if (this.percept) {

		// interstimulus interval
		var input = layout.input(this.pause*1e3);
		input.onblur = function () { that.pause = Number(this.value)/1e3; };
		layoutTableRow(table,++rowIndex,'Interstimulus interval:',input,'ms');

		// stimulus
		var select = layout.select(['SAM Tone','Filtered Harmonic Complex']);
		select.onchange = function () {
			that.mode = this.selectedIndex;
			activity.settings();
		};
		select.selectedIndex = this.mode;
		layoutTableRow(table,++rowIndex,'Stimulus:',select,'');

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

		// stimulus duration
		var input = layout.input(this.material.duration*1e3);
		input.onblur = function () {
			that.material.duration = Number(this.value)/1e3;
			that.duration = that.material.duration;
		};
		layoutTableRow(table,++rowIndex,'Stimulus duration:',input,'ms');
	}

	// speech settings
	if (this.speech) {
		if (this.noise == 'Off') {
			if (this.behavior == 'Adaptive' && typeof this.gain == 'number') {
				this.gain = new Adaptive({value0:60, valueMax:76});
			} else if (this.behavior == 'Constant' && typeof this.gain == 'object') {
				this.gain = 60;
			}
			this.snr = Infinity;
		} else {
			if (this.behavior == 'Adaptive' && typeof this.snr == 'number') {
				this.snr = new Adaptive({value0:12, valueMax:24});
			} else if (this.behavior == 'Constant' && typeof this.snr == 'object') {
				this.snr = 12;
			}
		}

		// background noise
		var select = layout.select([
			'Off',
			'Speech-Shaped Noise',
			'Exciting Ride',
			'Two Talker Masker (English)',
			'Two Talker Masker (Spanish)'
		]);
		select.onchange = function () {
			that.noise = this.value;
			that.settings();
		};
		select.value = this.noise;
		layoutTableRow(table,++rowIndex,'Background noise:',select,'');

		// behavior
		var select = layout.select(['Adaptive','Constant']);
		select.onchange = function () {
			that.behavior = this.value;
			that.chances = (that.behavior == 'Adaptive') ? 3 : Infinity;
			that.trials = (that.behavior == 'Adaptive') ? Infinity : 10;
			that.settings();
		};
		select.value = this.behavior;
		layoutTableRow(table,++rowIndex,'Procedure:',select,'');

		// gain || snr
		var row = table.insertRow(++rowIndex);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		if (this.behavior === 'Adaptive') {
			var span = document.createElement('span');
			span.innerHTML = 'Initial ';
			span.style.color = 'blue';
			cell.appendChild(span);
		}
		cell.innerHTML = (this.noise == 'Off')
			? cell.innerHTML + ' Speech Level:'
			: cell.innerHTML = cell.innerHTML + ' Speech to Noise Ratio:';
		cell.style.textAlign = 'right';
		cell.style.width = '40%';
		var cell = row.insertCell(1);
		cell.style.width = '40%';
		var input = document.createElement('input');
		input.onblur = function () {
			if (that.behavior == 'Adaptive') {
				if (that.noise == 'Off') {
					that.gain.value0 = Number(this.value);
				} else {
					that.snr.value0 = Number(this.value);
				}
			} else {
				if (that.noise == 'Off') {
					that.gain = Number(this.value);
				} else {
					that.snr = Number(this.value);
				}
			}
		};
		input.style.width = '100%';
		input.value = (that.behavior == 'Adaptive')
		? (that.noise == 'Off')
			? this.gain.value0
			: this.snr.value0
		: (that.noise == 'Off')
			? this.gain
			: this.snr;
		if (widgetUI) {
			input.style.textAlign = 'left';
			jQuery(input).button();
		}
		cell.appendChild(input);
		var cell = row.insertCell(2);
		cell.innerHTML = 'dB';
		cell.style.width = '20%';
	}

	// chances | trials
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = (this.behavior === 'Adaptive') ? 'Chances:' : 'Trials:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var input = document.createElement('input');
	input.onblur = function () {
		if (that.behavior === 'Adaptive') {
			that.chances = Number(this.value);
		} else {
			that.trials = Number(this.value);
		}
	};
	input.style.width = '100%';
	input.value = (this.behavior === 'Adaptive') ? this.chances : this.trials;
	if (widgetUI) {
		input.style.textAlign = 'left';
		jQuery(input).button();
	}
	cell.appendChild(input);

	// material settings
	if ('material' in this && 'settings' in this.material) {
		rowIndex = this.material.settings(table,rowIndex);
	}

	// footer
	layout.footer();
};
AFC.prototype.test = function () {
	let that = this;

	// check database for level
	if (this.level == 0) { this.check(); return; }

	// reset
	this.calls = [];
	this.chance = 0;
	this.correct = undefined;
	this.levels();
	this.responses = [];
	this.score = [];
	this.sound = true;
	this.trial = -1;

	//
	if (this.snr == null) { this.snr = Infinity; }

	// reset gain if adaptive
	if (typeof this.gain == 'object') { this.gain.reset(); }

	// reset snr if adaptive
	if (typeof this.snr == 'object') {
		this.snr.reset(() => { processor.snr(this.snr.value); });
	} else {
		processor.snr(this.snr);
	}

	// lights on for oddball
	if (this.mode == 'oddball') { this.lights = true; }

	// reset material
	try { this.material.reset(); } catch(e) { console.log(e); }

	// reset master gain
	processor.volume();

	// exit button
	var exit = document.getElementById('logout');
	exit.onclick = function () {
		this.style.visibility = 'hidden';
		processor.stop();
		if (protocol && protocol.active) {
			protocol.active = false;
			if ('callback' in protocol) { protocol.callback(); }
		} else { that.menu(); }
	};
	exit.src = 'images/exit.png';
	exit.style.visibility = 'visible';
	exit.title = 'exit test';

	// main
	var main = layout.main();

	// afc container
	var container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '2%';
	container.style.height = '77%';
	if ('video' in this.material && this.material.video == 'On') {
		container.style.width = '66%';
	} else {
		container.style.width = '96%';
	}
	container.style.left = '2%';
	main.appendChild(container);

	// response table
	var table = document.createElement('table');
	table.id = 'afc_table';
	table.style.position = 'absolute';
	table.style.height = '100%';
	table.style.width = '100%';
	container.appendChild(table);

	// response table (definition)
	switch (this.alternatives) {
		case 2: var cells = 2, rows = 1; break;
		case 3: if (windowwidth < windowheight) {
			var cells = 1, rows = 3; alert('yeah');
		} else {
			var cells = 3, rows = 1;
		} break;
		case 4: if (windowwidth < windowheight) {
				var cells = 2, rows = 2;
			} else {
				var cells = 4, rows = 1;
			} break;
		case 6: var cells = 3, rows = 2; break;
		case 8: var cells = 4, rows = 2; break;
		case 9: var cells = 3, rows = 3; break;
		case 10: var cells = 2, rows = 5; break;
		case 12: if (table.clientHeight > table.clientWidth) {
				var cells = 3, rows = 4;
			} else {
				var cells = 4, rows = 3;
			} break;
		case 20: if (table.clientHeight > table.clientWidth) {
				var cells = 4, rows = 5;
			} else {
				var cells = 5, rows = 4;
			} break;
		case 25: var cells = 5, rows = 5; break;
		default: var cells = this.alternatives, rows = 1;
	}
	var cellWidth = 100/cells+'%';
	var rowHeight = 100/rows+'%';
	var imageHeight = 75/rows+'%';

	// response buttons
	for (let a = 0; a < this.alternatives; a++) {
		// insert cell into table
		if (a%cells == 0) {
			var row = table.insertRow(a/cells);
			row.style.height = rowHeight;
			row.style.width = '100%';
		} else {
			var row = table.rows[Math.floor(a/cells)];
		}
		var cell = row.insertCell(a%cells);
		cell.style.padding = '.2em';
		cell.style.width = cellWidth;

		// response buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.id = 'afc' + String(a);
		button.index = a;
		button.innerHTML = ('words' in this.material) ? this.material.words[a] : String(a+1);
		button.onclick = function () {
			if (that.disabled) { return; }

			// response modes
			switch (that.mode) {
				case 'identification':
				case 'oddball':
					// disable buttons
					that.disabled = true;
					for (let a = 0; a < that.alternatives; a++) {
						jQuery('#afc'+a).button('disable');
					}

					// log call and response
					that.calls[that.calls.length] = that.call;
					that.responses[that.responses.length] = this.index;

					// check if correct
					that.correct = (that.call == this.index);
					if (!that.correct) { that.chance++; }

					// feedback
					if (that.feedback) {
						if (that.correct) {
							// feedback
							var img = document.createElement('img');
							img.src = 'images/check.png';
							img.style.bottom = '10%';
							img.style.height = '40%';
							img.style.position = 'absolute';
							img.style.right = '10%';
							img.style.zIndex = '10';
							this.appendChild(img);
							jQuery(img).fadeOut(that.delay);

							// score indicator
							if (that.trials == Infinity) {
								score.innerHTML
								= 'Score: '+percentCorrect(that.calls,that.responses).toFixed(0)+'%';
							} else if (that.trials < 20 && windowwidth > 4) {
								document.getElementById('score'+that.trial).src
								= 'images/score-yay.png';
							} else {
								score.innerHTML
								= 'Score: '+percentCorrect(that.calls,that.responses).toFixed(0)+'%'
								+', remaining: '+String(that.trials-that.trial-1);
							}
						} else {
							// chance indicator
							if (that.chances != Infinity) {
								document.getElementById('chance'+that.chance).src = 'images/score-nay.png';
							}

							// score indicator
							if (that.trials == Infinity) {
								score.innerHTML = 'Score: '+percentCorrect(that.calls,that.responses).toFixed(0)+'%';
							} else if (that.trials < 20 && windowwidth > 4) {
								document.getElementById('score'+that.trial).src = 'images/score-nay.png';
							} else if (that.trials != Infinity) {
								score.innerHTML
								= 'Score: '+percentCorrect(that.calls,that.responses).toFixed(1)+'%'
								+', remaining:'+String(that.trials-that.trial-1);
							}

							// feedback
							var img = document.createElement('img');
							img.src = 'images/X.png';
							img.style.bottom = '10%';
							img.style.height = '40%';
							img.style.position = 'absolute';
							img.style.right = '10%';
							img.style.zIndex = '10';
							this.appendChild(img);
							jQuery(img).fadeOut(that.delay);

							// practice
							if (that.practice) {
								// message
								var item = that.material.words
										? that.material.active
											? that.material.words[that.material.active[that.call]]
											: that.material.words[that.call]
										: that.call+1,
									message = that.mode == 'oddball'
										? 'Repeat for practice.'
										: 'Click on any item to practice.';
								document.getElementById('message').innerHTML
								= 'The correct answer was "'
								+'<span style=\'color:blue\'>'+item+'</span>'+'".<br>'
								+message;
								//document.getElementById('repeat').style.visibility = 'hidden';
								document.getElementById('next').style.display = '';
								that.modeHold = that.mode;
								that.mode = 'practice';

								// enable buttons
								that.disabled = false;
								for (let a = 0; a < that.alternatives; a++) {
									jQuery('#afc'+a).button('option','disabled',false);
								}
								return;
							}
						}
					}
					setTimeout(()=>{that.next()},100);
					break;
				case 'keywords':
					this.value = ++this.value%2;

					// regardless, try to clear
					try {
						var button = document.getElementById('afc'+this.index);
						button.removeChild(button.childNodes[1]);
					} catch (error) { console.dir(error); }

					// toggle check mark
					if (this.value == 0) {
						//that.score[that.trial][a] = 0;
					} else {
						//that.score[that.trial][a] = 1;
						var check = document.createElement('img');
						check.src = 'images/check.png';
						check = document.createElement('img');
						check.src = 'images/check.png';
						check.style.bottom = '10%';
						check.style.height = '20%';
						check.style.position = 'absolute';
						check.style.right = '10%';
						jQuery(document.getElementById('afc'+this.index)).append(check);
					}
					//that.next();
					break;
				case 'pattern':
					if (!('index' in that)) { that.index = 0; }

					// play response
					that.play(this.index);

					// correct response?
					if (this.index == that.sequence[that.index]) {

						// update the pattern indicator
						document.getElementById('pattern'+that.index).src = 'images/score-yay.png';

						// end of pattern?
						if (++that.index == that.sequence.length) {
							that.index = 0;

							// flash a check-mark
							var img = document.createElement('img');
							img.src = 'images/check.png';
							img.style.position = 'absolute';
							img.style.height = '40%';
							img.style.bottom = '10%';
							this.appendChild(img);
							jQuery(img).fadeOut(1e3);

							// score indicator
							if (that.practice) {
								// game on
								that.correct = false;
								that.lights = false;
								that.practice = false;
							} else {
								that.correct = true;
								if (that.trials <= 25 || that.trials == Infinity) {
									var img = document.createElement('img');
									img.src = 'images/score-yay.png';
									document.getElementById('score').appendChild(img);
								} else {
									document.getElementById('score').innerHTML = 'program me';
								}
							}

							// next sequence
							setTimeout(function () {
								// reset sequence indicator
								for (var a = 0; a < that.intervals; a++) {
									document.getElementById('pattern'+a).src
									= 'images/score-nan.png';
								}

								// next sequence
								that.next();
							}, 2e3);
						}
					} else {
						// disable buttons
						that.disabled = true;
						for (var a = 0; a < that.alternatives; a++) {
							jQuery('#afc'+a).button('option','disabled',true);
						}

						// update the pattern indicator
						document.getElementById('pattern'+that.index).src = 'images/score-nay.png';

						// flash an X
						var img = document.createElement('img');
						img.src = 'images/X.png';
						img.style.position = 'absolute';
						img.style.height = '40%';
						img.style.bottom = '10%';
						this.appendChild(img);
						jQuery(img).fadeOut(2e3);

						// update chance indicator
						if (!that.practice) {
							document.getElementById('chance'+that.chance++).src = 'images/score-nay.png';
						}

						// reset index
						that.index = 0;

						// practice mode
						that.lights = true;
						that.practice = true;

						// play it again
						setTimeout(function () {
							// reset sequence indicator
							for (var a = 0; a < that.intervals; a++) {
								document.getElementById('pattern'+a).src = 'images/score-nan.png';
							}

							// generate sequence
							that.playSequence(false);
						}, 2e3);
					}
					break;
				case 'practice':
					// practice signal
					var index = that.modeHold == 'oddball'
						? that.call == this.index ? 1 : 0
						: this.index;
					that.play(index);

					// feedback
					var img = document.createElement('img');
					img.src = 'images/sound.png';
					img.style.position = 'absolute';
					img.style.height = '40%';
					img.style.bottom = '10%';
					this.appendChild(img);
					jQuery(img).fadeOut(1000);
					return;
			}
		};
		button.style.fontSize = that.speech ? that.alternatives > 20 ? '80%' : '100%' : windowwidth < 4 || that.alternatives > 3 ? '200%' : '200%';
		button.style.height = '100%';
		//button.style.padding = '1%';
		button.style.width = '100%';
		button.value = 0;
		jQuery(button).button();

		// button in cell
		cell.appendChild(button);
		if(iOS){FastClick(button)}
	}

	// button color
	buttonColor = jQuery('#afc0').css('color');

	// optional image for response buttons
	if ('images' in this.material) { this.material.images(); }

	// second container for media
	var container = document.createElement('div');
	container.id = 'media';
	if ('video' in this.material && this.material.video == 'On') {
		// video
		var media = document.createElement('video');
		media.autoplay = true;
		media.controls = true;
		media.id = 'mediaElement';
		media.preload = true;
		media.style.height = '96%';
		media.style.left = '2%';
		media.style.position = 'absolute';
		media.style.top = '2%';
		media.style.width = '96%';
		media.style.zIndex = '10';

		// media container
		container.className = 'ui-widget-content ui-corner-all';
		container.style.position = 'absolute';
		container.style.top = '4%';
		container.style.height = '74%';
		container.style.width = '28%';
		container.style.right = '2%';
		container.appendChild(media);
	}
	else {
		// audio only
		var media = document.createElement('video');
		media.autoplay = true;
		media.id = 'mediaElement';
		media.preload = true;

		//
		container.style.display = 'none';
		container.appendChild(media);
	}
	main.appendChild(container);

	// pattern indicator
	if (this.mode == 'pattern') {
		var pattern = document.createElement('div');
		pattern.style.position = 'absolute';
		pattern.style.top = '70%';
		pattern.style.height = '10%';
		pattern.style.width = '80%';
		pattern.style.left = '10%';
		pattern.style.padding = '8px';
		for (var a = 0; a < this.intervals; a++) {
			var img = document.createElement('img');
			img.id = 'pattern'+a;
			img.src = 'images/score-nan.png';
			img.style.height = '32px';
			pattern.appendChild(img);
		}
		main.appendChild(pattern);
	}

	// controls
	var controls = document.createElement('div');
	controls.className = 'ui-widget-content ui-corner-all';
	controls.style.position = 'absolute';
	controls.style.bottom = '2%';
	controls.style.height = '17%';
	controls.style.width = '96%';
	controls.style.left = '2%';
	controls.style.padding = '.5%';
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

	// next button
	var button = document.createElement('button');
	button.id = 'next';
	button.innerHTML = 'next';
	button.onclick = function () {
		this.style.display = that.mode == 'keywords' ? 'inline-block' : 'none';
		document.getElementById('message').innerHTML = that.message;
		document.getElementById('repeat').style.visibility = 'visible';
		that.mode = that.modeHold;
		that.next();
	};
	button.style.color = 'green';
	button.style.cssFloat = 'right';
	button.style.display = this.controls.indexOf('next') > -1 ? 'inline-block' : 'none';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	controls.appendChild(button);

	// all button
	var button = document.createElement('button');
	button.id = 'all';
	button.index = 0;
	button.innerHTML = 'all';
	button.onclick = function () {
		for (let a = 0; a < that.material.keywords[that.trial].length; a++) {
			document.getElementById('afc'+a).onclick();
		}
	};
	button.style.cssFloat = 'right';
	button.style.display = this.controls.indexOf('all') > -1 ? 'inline-block' : 'none';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);

	// repeat button
	var button = document.createElement('button');
	button.id = 'repeat';
	button.innerHTML = 'repeat';
	button.onclick = () => { if (this.sound) { this.playSequence(false) } };
	button.style.cssFloat = 'right';
	button.style.display = this.repeat ? 'inline' : 'none';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);

	// controls: plot
	if (debug) {
		var button = document.createElement('button');
		button.id = 'plot';
		button.innerHTML = 'plot';
		button.onclick = () => {
			x = that.material.stimulus(0);
			dsp.plot(x);
		};
		button.style.cssFloat = 'right';
		button.style.height = '100%';
		button.style.visibility = 'visible';
		jQuery(button).button();
		controls.appendChild(button);
		if (iOS) { FastClick(button); }
	}

	// footer
	var footer = layout.footer();
	if (this.feedback) {
		// chances
		if (this.chances != Infinity) {
			var chances = document.createElement('span');
			chances.id = 'chances';
			/*var help = layout.help('Chances',
				'\"Chances\" are the number of mistakes allowed.'
				+'<br>Chances are not lost for mistakes made at the beginning of the test, '
				+'<br>or for mistakes made in a row.'
			);
			help.style.height = '1em';
			chances.appendChild(help);*/
			chances.insertAdjacentHTML('beforeend',' Chances: ');
			for (let a = 1; a <= this.chances; a++) {
				var img = document.createElement('img');
				img.id = 'chance'+a;
				img.src = 'images/score-nan.png';
				jQuery(img).addClass('score');
				chances.appendChild(img);
			}
			chances.style.verticalAlign = 'bottom';
			footer.appendChild(chances);
		}

		// score
		var score = document.createElement('span');
		score.id = 'score';
		score.insertAdjacentHTML('beforeend',' Score: ');
		if (this.trials != Infinity) {
			if (this.trials < 20 && windowwidth > 4) {
				// score bubbles
				for (let a = 0; a < this.trials; a++) {
					var img = document.createElement('img');
					img.id = 'score'+a;
					img.src = 'images/score-nan.png';
					jQuery(img).addClass('score');
					score.appendChild(img);
				}
			} else {
				// score
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
		label.innerHTML = 'variable' in this.material
		? this.material.variable()
		: this.snr == Infinity
			? 'Quiet' : 'SNR: ' + String(this.snr);
		label.style.paddingLeft = '16px';
		label.style.verticalAlign = 'bottom';
		footer.appendChild(label);
	} else {
		var span = document.createElement('span');
		span.insertAdjacentHTML('beforeend',' Testing ');
		span.style.verticalAlign = 'bottom';
		footer.appendChild(span);
	}

	// start dialog
	if ('material' in activity && 'start' in activity.material) {
		activity.material.start();
	} else {
		layout.message(
			this.material.title,
			('startmessage' in this.material) ? this.material.startmessage : this.startmessage,
			{
				Start: function () {
					jQuery(this).dialog('destroy').remove();
					that.disabled = false;
					that.next();

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

		/* add message next to start button
		var message = document.createElement('span');
		message.id = 'message';
		message.innerHTML = that.level != undefined ? 'You are on level '+that.level+'.&nbsp;' : '';
		message.style.float = 'right';
		jQuery('.ui-dialog-buttonpane').append(message);*/
	}

	// please wait
	callback = () => {
		if (this.noise != 'Off') {
			this.ready++;

			// disable start
			jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
			jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');

			// start noise
			const snr = typeof this.snr == 'number' ? this.snr : this.snr.value;
			const gain = snr < 0 ? 0 : -snr;//dB
			processor.noise(this.noise, gain, () => {
				this.ready--;
				if (this.ready == 0) {
					jQuery('.ui-dialog-buttonpane #message').html(that.level != undefined ? 'You are on level ' + that.level+'.&nbsp;' : 'Ready.&nbsp;');
					jQuery(".ui-dialog-buttonpane button:contains('Start')").button('enable');
				}
			});
		}
	};

	// master volume
	if (this.volume) {
		if (typeof this.volume === 'object') {
			this.volume.callback = callback;
		} else {
			this.volume = {callback : callback};
		}
		gui.gain(this.volume);
	} else {
		callback();
	}

	// material preload
	if ('preload' in this.material) { this.material.preload(); }
};
