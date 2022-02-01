function intervals(settings){
	activity = new Intervals(settings);

	// overrides
	for (let key in settings) { if (key in activity) { activity[key] = settings[key]; } }

	// initialize
	activity.init();
}
function Intervals(settings){
	this.ID = 'intervals';
	this.call = undefined;
	this.calls = [];
	this.disabled = true;
	this.ear = undefined;
	this.feedback = true;
	this.init = () => { this.test(); };
	this.instrument = 'piano';
	this.interval = undefined;
	this.intervals = [4,7,12];
	this.level = undefined;
	this.mode = 0;
	this.note = undefined;
	this.path = 'data/musescore/3secpiano/';
	this.practice = true;
	this.range = [33,72];
	this.responses = [];
	this.roots = [];
	this.sequence = [];//used in mode 1, which is buggy
	this.stimuli = [];
	this.target = 7;//used in mode 1, which is buggy
	this.title = 'Intervals';
	this.trial = -1;
	this.trials = 10;
	this.words = ['Major 3rd','Perfect 5th','Octave'];

	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }

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
Intervals.prototype.check = function(){
	let that = this;
	let dialog = layout.message('Intervals','Identify the interval between notes.');
	jQuery.ajax({
		data: {
			method: 'highscore',
			subuser: subuser.ID,
			user: user.ID
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert(errorThrown);
			that.level = 0;
			that.test();
		},
		success: function (data, status) {
			data = jQuery.parseJSON(data);
			that.level =  data.length == 0 ? 0 : data[0].level+1;
			that.test();
			jQuery(dialog).dialog('destroy').remove();
		},
		type: 'GET',
		url: 'version/'+version+'/php/intervals.php'
	});
}
Intervals.prototype.levels = function(){
	const intervals = [[2,12],[2,7],[7,12],[4,7,12],[2,4,7],[1,2,3,4]];
	const range = [[45,45],[39,51],[57,57],[51,63],[69,69],[63,75]];
	let levels = [];
	for (let a = 0; a < intervals.length; a++) {
		for (let b = 0; b < range.length; b++) {
			levels.push({intervals:intervals[a], range:range[b]});
		}
	}
	if (this.level < levels.length) {
		this.intervals = levels[this.level].intervals;
		this.range = levels[this.level].range;
	} else {
		console.log('custom');
	}

	//
	const words = ['Unison','Minor Second','Major Second','Minor Third','Major Third','Perfect Fourth','Tritone',
					'Perfect Fifth','Minor Sixth','Major Sixth','Minor Seventh','Major Seventh','Octave'];
	this.words = [];
	for (let a = 0; a < this.intervals.length; a++) { this.words[a] = words[this.intervals[a]]; }
}
Intervals.prototype.menu = function(){
	// main
	let main = layout.main(
		this.title,
		() => { this.back ? this.back() : layout.menu() },
		{ Settings: () => { this.settings() } }
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
Intervals.prototype.next = function(){
	let that = this;//extended scope

	// increment trial
	this.trial++;

	// end run
	if (this.trial == this.trials) { this.save(); return; }

	// enable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('enable'); }
	this.disabled = false;

	// stimulus
	switch (this.mode) {
		case 0:
			this.call = Math.floor(Math.random()*this.intervals.length);
			this.interval = this.intervals[this.call];
			this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
			this.stimulus();
			break;
		case 1:
			this.alternatives = 2;
			this.call = Math.floor(this.alternatives*Math.random());
			for (let a = 0; a < this.alternatives; a++) {
				this.sequence[a] = (a == this.call) ? 1 : 0;
			}
			this.note = 33 + Math.round(12*Math.random());
			this.spacing = Math.floor(Math.random()*this.intervals.length);

			// play sequence with delay
			var delay = 0;
			for (let a = 0; a < this.sequence.length; a++) {
				delay += 0.5e3;
				setTimeout((function (a) {
					return function () {
						var index = that.sequence[a];
						var light = index;
						if (index == 0) {
							that.interval = Number(that.intervals[that.spacing]);
						}else{
							that.interval = that.target;
						};
						that.stimulus();
					}
				})(a), delay);

				// interstimulus pause
				delay += 2.5e3;
			}
	}
}
Intervals.prototype.preload = function(){
	let that = this;

	// initialize
	activity.ready++;

	// disable start
	jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
	jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');

	// load audio function
	let counter = 0;
	function loadAudio(a,url,total) {
		let request = new XMLHttpRequest();
		request.index = a;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function (a) {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				//console.log(counter,total);
				if (counter == total) {
					// enable start
					jQuery(".ui-dialog-buttonpane button:contains('Start')").button('enable');

					// message
					if (that.level > 100) {
						jQuery('.ui-dialog-buttonpane #message').html('Ready.&nbsp;');
					} else {
						jQuery('.ui-dialog-buttonpane #message').html('You are on level '+String(that.level+1)+' of 36.&nbsp&nbsp');
					}

				}
			});
		};
		request.send();
	}

	// load audio
	let i = 0, total = 61, url;
	for (let a = 33; a <= 93; a++) {
		url = this.path + this.instrument + '_' + a + '.mp4';
		loadAudio(i++,url,total);
	}
};
Intervals.prototype.response = function(button){
	if (this.disabled) { return }

	// disable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('disable'); }
	this.disabled = true;

	// log call and response
	this.calls.push(this.call);
	this.roots.push(this.note);
	this.responses.push(button.index);

	// feedback
	if (this.feedback) {
		if (this.call == button.index) {
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
			// score indicator
			if (this.trials == Infinity) {
				score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
			} else if (this.trials <20 && windowwidth > 4) {
				document.getElementById('score'+this.trial).src = 'images/score-nay.png';
			} else if (this.trials != Infinity) {
				score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(1)+'%'+', remaining: '+String(this.trials-this.trial-1);
			}

			// feedback
			var img = document.createElement('img');
			img.src = 'images/X.png';
			img.style.bottom = '10%';
			img.style.height = '40%';
			img.style.position = 'absolute';
			img.style.right = '10%';
			img.style.zIndex = '10';
			button.appendChild(img);
			jQuery(img).fadeOut(1000);

			// practice
			if (this.practice) {
				// message
				document.getElementById('message').innerHTML = 'The correct answer was "'+'<span style=\'color:blue\'>'
				+ this.words[this.call] + '</span>' + '".<br>Press repeat for practice.';
				document.getElementById('next').style.display = '';

				// hold mode and switch to practice
				this.modeHold = this.mode;
				this.mode = 'practice';
				return;
			}
		}
	}
	setTimeout(()=>{this.next()},1e3);
}
Intervals.prototype.results = function(){
	let that = this;

	// main
	let main = layout.main('Results', ()=>{ this.menu(); });

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
			for (let item = 0, items = results.length; item < items; item++) {
				var result = results[item];

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
				heading.innerHTML = result.entry+' &rarr; '+score+'%';
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

				// sort results for summary plot
				resultsSorted.push([1, score]);
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
					hAxis: {scaleType: 'linear'},
					title: 'title',
					vAxis: {maxValue: 100, minValue: 0, title: 'Percent Correct'}
				};
				var chart = new google.visualization.ScatterChart(summary);
				chart.draw(data, options);
			}
		},
		error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
		type: 'GET',
		url: 'version/'+version+'/php/intervals.php'
	});
};
Intervals.prototype.save = function(data){
	// save to database
	jQuery.ajax({
		data: {
			calls: this.calls.join(','),
			ear: this.ear,
			gain: MASTERGAIN,
			intervals: this.intervals.join(','),
			level: this.level,
			mode: this.mode,
			notes: this.notes,
			practice: this.practice,
			responses: this.responses.join(','),
			roots: this.roots.join(','),
			score: percentCorrect(this.calls,this.responses).toFixed(0),
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
		url: 'version/'+version+'/php/intervals.php'
	});
}
Intervals.prototype.settings = function(){
	let that = this;

	// main
	let main = layout.main(
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
	var select = layout.select(['Identify the Interval','Pick the Perfect 4th']);
	select.onchange = function () { that.mode = this.selectedIndex; };
	select.value = this.mode ? 'Pick the Perfect 4th' : 'Identify the Interval';
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
	input.onblur = function () { that.notes = this.value; };
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

	// Intervals
	var input = layout.input(this.intervals);
	input.onblur = function() {
		var values = this.value.split(',');
		for( let a = 0; a < values.length; a++) {
			values[a] = Number(values[a]);
		}
		that.intervals = values;
	};
	layoutTableRow(table,++rowIndex,'Intervals:',input,'semitones');

	// footer
	layout.footer();
}
Intervals.prototype.stimulus = function(){
	processor.signal(this.stimuli[this.note-33]);
	setTimeout(()=>{processor.signal(this.stimuli[this.note+this.interval-33])},1e3);
};
Intervals.prototype.test = function(){
	let that = this;//extended scope

	// check database for level
	if (typeof this.level === 'undefined') {
		this.check(); return;
	}

	// reset
	this.call = undefined;
	this.calls = [];
	this.interval = undefined;
	this.levels();
	this.responses = [];
	this.trial = -1;

	// exit button
	let exit = document.getElementById('logout');
	exit.onclick = function () {
		if (protocol && protocol.active) {
			protocol.active = false;
			if ('callback' in protocol) {
				protocol.callback();
			}
		} else {
			that.menu();
		}
		this.style.visibility = 'hidden';
	};
	exit.src = 'images/exit.png';
	exit.style.visibility = 'visible';
	exit.title = 'exit test';

	// main
	var main = layout.main();

	// afc container
	var container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '5%';
	container.style.height = '65%';
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
	if (this.mode==1){
		this.words = this.instruments; //['Piano','Guitar','Violin','Tenor Sax'];
	}
	if (windowheight > windowwidth) {
		var cells = 1; rows = this.words.length;
	} else {
		var cells = this.words.length, rows = 1;
	}
	var cellWidth = 100/cells+'%';
	var rowHeight = 100/rows+'%';

	//
	for (let a = 0; a < this.words.length; a++) {
		// insert cell into table
		if (a % cells == 0) {
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
		button.id = 'afc'+a;
		button.index = a;
		button.innerHTML = this.words[a];
		button.onclick = function(){ that.response(this); };
		button.style.fontSize = '200%';
		button.style.height = '100%';
		button.style.padding = '0%';
		button.style.width = '100%';
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
	controls.style.height = '20%';
	controls.style.width = '90%';
	controls.style.left = '5%';
	controls.style.padding = '8px';
	main.appendChild(controls);

	// next button
	var button = document.createElement('button');
	button.id = 'next';
	button.innerHTML = 'next';
	button.onclick = function () {
		this.style.display = 'none';
		document.getElementById('message').innerHTML = 'Which interval did you hear?';
		that.mode = that.modeHold;
		that.next();
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
	button.onclick = () => { this.stimulus(); };
	button.style.cssFloat = 'right';
	button.style.display = 'inline-block';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);

	// message
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Which interval did you hear?';
	message.style.fontWeight = 'bold';
	controls.appendChild(message);

	// footer
	var footer = layout.footer();

	// score indicator
	var score = document.createElement('span');
	score.id = 'score';
	score.insertAdjacentHTML('beforeend',' Score: ');
	if(this.trials!=Infinity){
		if(this.trials<20){
			for(var a=0;a<this.trials;a++){
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
	var br = document.createElement("br");
	footer.appendChild(br);

	// adaptive variable
	if(this.behavior=='Adaptive'){
		var label = document.createElement('span');
		label.id = 'adaptive';
		label.innerHTML = 'Adaptive variable: '+String(this.adaptive.value);
		label.style.paddingLeft = '16px';
		label.style.verticalAlign = 'bottom';
		footer.appendChild(label);
	}

	// start dialog
	layout.message('Intervals','Identify the interval between notes.',{
		Start: function () {
			jQuery(this).dialog('destroy').remove();
			setTimeout(()=>{that.next()},1e3)
		}
	});

	/* add message next to start button
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Please wait...&nbsp;';
	message.style.float = 'right';
	jQuery('.ui-dialog-buttonpane').append(message);*/

	// preload
	this.preload();
}
