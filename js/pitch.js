function pitch(settings) {
	activity = new Pitch({
		trials: 10
	});
	
	// overrides
	for (let key in settings) { activity[key] = settings[key]; }
	
	// initialize
	activity.test();
}
function Pitch(settings) {
	this.adaptive = new Adaptive({
		rule: 'linear',
		step0: 2,
		stepAdjustment: 1,
		stepMin: 1,
		valueMax: 12,
		valueMin: 1,
		value0: 12
	});
	this.call = undefined;
	this.calls = [];
	this.chance = 0;
	this.chances = 4;
	this.correct = undefined;
	this.ear = undefined;
	this.feedback = true;
	this.instrument = 'piano';
	this.interval = undefined;
	this.intervals = [4,7,12];
	this.message = 'Which note is higher in pitch?';
	this.mode = 2;
	this.note = 36;
	this.path = 'data/intervals/';
	this.practice = undefined;
	this.range = [45,81];
	this.responses = [];
	this.roots = [];
	this.sequence = [];
	this.spacing = undefined;
	this.spacings = []; //the interval for each trial
	this.stimuli = [];
	this.target = [5];
	this.trial = 0;
	this.trials = Infinity;
	this.words = ['1','2'];
	
	// overrides
	for (let key in settings) { this[key] = settings[key]; }
	
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
Pitch.prototype.light = function (index) {
	let that = this;
	// defaults
	if (index === undefined) { index = 0; }
		
	jQuery('#afc'+index).css('color','yellow'); 
	
	// play material
    //this.material.stimulus(index,true);
    
	setTimeout(()=>{jQuery('#afc'+index).css('color',buttonColor);}, 1e3);
};
Pitch.prototype.menu = function () {
	let that = this;
	
	// main
	let main = layout.main(
		'Pitch Discrimination', 
		() => { this.back ? this.back() : layout.menu(); },
		{ 	Settings: () => { this.settings(); }}
	);
	
	// test button
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Test';
	button.onclick = function () { that.test(); };
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
	button.onclick = function () { that.results(); };
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
Pitch.prototype.next = function () {
	let that = this;//extended scope

	//
	this.adaptive.logic(this.correct);
	
	// enable buttons
	for (let a = 0; a < this.alternatives; a++) { jQuery('#afc'+a).button('enable'); }
	
	// increment trial
	this.trial++;
	
	// end run
	if (this.chance == this.chances || this.trial == this.trials) { 
		console.log('saving')
		this.save();
		console.log('saved')
		return;
	}

	//
	this.call = Math.floor(Math.random()*2);
	this.interval = this.intervals[this.call];//?
	this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
	this.stimulus();
}
Pitch.prototype.preload = function () {
	let that = this;	
	
	//
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
				if (counter == total) {
					activity.ready--;
					if (activity.ready == 0) {
						jQuery('.ui-dialog-buttonpane #message').html('Ready.&nbsp;');
						jQuery(".ui-dialog-buttonpane button:contains('Start')").button('enable');
					}
				}
			});
		};
		request.send();
	}
	
	const instrument = 'Piano';
	const files = [33,93];
	let i = 0, total = (files[1]-files[0]+1), url;
	for (let a = files[0]; a <= files[1]; a++) { 
		url = 'data/musescore/3secpiano/'+instrument+'_'+a+'.wav';
		loadAudio(i++,url,total);
	}
};
Pitch.prototype.response = function (button) {
	let that = this;//extended scope
	
	// disable buttons
	for (let a = 0; a < this.alternatives; a++) { jQuery('#afc'+a).button('disable'); }
			
	// log call and response
	this.calls.push(this.call);
	this.roots.push(this.note);
	this.responses[this.responses.length] = button.index;
	this.spacings.push(Number(this.interval));

	// check if correct
	this.correct = (this.call == button.index); 
	
			
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
			if (this.adaptive.value == this.adaptive.valueMin){
				document.getElementById('chance'+this.chance++).src = 'images/score-yay.png';
			}

		} else {
			// score indicator
			if (this.trials == Infinity) {
				score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
				document.getElementById('chance'+this.chance++).src = 'images/score-nay.png';
			} else if (this.trials < 20 && windowwidth > 4) {
				document.getElementById('score'+this.trial).src = 'images/score-nay.png';
			} else if (this.trials != Infinity) {
				score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(1)+'%'+', remaining:'+String(this.trials-this.trial-1);
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
				var item = this.words[this.call]
				document.getElementById('message').innerHTML 
				= 'The correct answer was "'
				+'<span style=\'color:blue\'>'+item+'</span>'+'".<br>'
				+message;
				//document.getElementById('repeat').style.visibility = 'hidden';
				document.getElementById('next').style.display = '';
				this.modeHold = this.mode;
				this.mode = 'practice';
				
				// enable buttons
				this.disabled = true;
				for (var a = 0; a < this.alternatives; a++) {
					jQuery('#afc'+a).button('option','disabled',true);
				}
				return;
			}
		}
	}
	setTimeout(function(){that.next()},1e3);
	
}
Pitch.prototype.results = function () {
	let that = this;
	
	// main
	let main = layout.main('Results', ()=>{that.menu()});
	
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

			console.log(data);
			
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
		
			// scaleType
			var scaleType = 'linear';
				
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
					//hAxis: {maxV ticks: [-48, -42, -36, -30, -24, -18, -12, -6, 0, 6, 12, 18, 24, {v:30, f:"Quiet"}], title: 'Speech Level'},
					hAxis: {scaleType: scaleType},
					title: 'title',
					vAxis: {maxValue: 100, minValue: 0, title: 'Percent Correct'}
				};
				var chart = new google.visualization.ScatterChart(summary);
				chart.draw(data, options);
			}
		},
		error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
		type: 'GET',
		url: 'version/'+version+'/php/pitch.php'
	});
};
Pitch.prototype.save = function (data) {
	var that = this;//extended scope

	// save to database
	jQuery.ajax({
		data: {
			calls : this.calls.join(','),
			ear : this.ear,
			gain : MASTERGAIN,
			intervals : this.intervals.join(','),
			mode: this.mode,
			notes : this.notes,
			practice: this.practice,
			responses : this.responses.join(','),
			roots : this.roots.join(','),
			score : percentCorrect(this.calls,this.responses).toFixed(0),
			spacings : this.spacings.join(','),
			subuser : subuser.ID,
			target: this.target.join(','),
			user : user.ID
		},
		error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
		success: function(data, status){
			console.log(data);
			console.log(data.spacings);
			if (protocol.active) {
				protocol.IDs.push(data);
				protocol.next();
			} else {
				activity.test();
			}
		},
		type: 'POST',
		url: 'version/'+version+'/php/pitch.php'
	});
	console.log('saved');
	console.log(data);
}
Pitch.prototype.settings = function () {
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
	cell.innerHTML = "Pitch"
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
	

	// Intervals
	var input = layout.input(this.intervals);
	input.onblur = function() { 
		//console.log(this.value);
		var values = this.value.split(',');
		for(a=0;a<values.length;a++){values[a]=Number(values[a])}
		that.intervals = values; 
	};
	layoutTableRow(table,++rowIndex,'Intervals:',input,'semitones');

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
			//that.trials = Number(this.value);
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
Pitch.prototype.stimulus = function (call) {	
	//
	processor.signal(this.stimuli[this.note-33]);
	
	//
	let index = 0;
	this.light(index++);
	
	//
	let secondnote = this.call ? this.note+this.adaptive.value : this.note-this.adaptive.value;
	setTimeout(()=>{processor.signal(this.stimuli[secondnote-33])},1e3);
	setTimeout(()=>{this.light(index)},1e3);
		
	//
	if(debug){console.log([this.note+'_'+this.instrument, secondnote+'_'+this.instrument])}
};
Pitch.prototype.test = function () {
	let that = this;//extended scope
	
	//
	this.preload();

	// reset
	this.call = undefined;
	this.calls = [];
	this.chance = 0;
	this.correct = undefined;
	this.interval = undefined;
	this.responses = [];
	this.trial = -1;	
	this.trials = Infinity;
	
	// ?
	for (let i = -12; i <=12; i++){
		this.intervals.push(i);
	}
		
	// exit button
	var exit = document.getElementById('logout');
	exit.onclick = function () {
		layout.dashboard();
		if(protocol){protocol.active=false}
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
	const cells = 3;
	for (let a = 0; a < this.words.length; a++) {				
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
		button.innerHTML = this.words[a];
		button.onclick = function(){that.response(this)};
		button.style.fontSize = '400%';
		button.style.height = '100%';
		button.style.padding = '0%';
		button.style.width = '100%';
		button.value = 0;
		jQuery(button).button();

		// button in cell
		cell.appendChild(button);
		if(iOS){FastClick(button)}
	}
	
	// button color
	buttonColor = jQuery('#afc0').css('color');
			
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

	// next button
	var button = document.createElement('button');
	button.id = 'next';
	button.innerHTML = 'next';
	button.onclick = function () {
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
	button.onclick = function () {

		switch(that.mode){
			case 0:
				that.stimulus();
				break;
			case 1: 
				// play sequence with delay
				var delay = 0;
				for (var a = 0; a < that.sequence.length; a++) {		
					delay += 0.5e3;
					setTimeout((function (a) {
						return function () {
							var index = that.sequence[a];
							var light = index;
							if (index == 0) {
								call = standard;
								that.interval = Number(that.intervals[that.spacing]);
							} else {
								call = target;
								that.interval = Number(that.target)
							};
							that.stimulus(call);
						}
					})(a), delay);
					
					// interstimulus pause
					delay += 2.5e3;
				}
				break;
			case 2:
				that.stimulus();
		}
	
		
	};
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
			for (var a = 0; a < this.trials; a++) {
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
	if (this.behavior == 'Adaptive') {
		var label = document.createElement('span');
		label.id = 'adaptive';
		label.innerHTML = 'Adaptive variable: '+String(this.adaptive.value);
		label.style.paddingLeft = '16px';
		label.style.verticalAlign = 'bottom';
		footer.appendChild(label);
	}
	
	// message
	layout.message('Pitch Discrimination',
		'Listen to the notes and decide if the second note is higher or lower than the first.',
		{
			Start: function () {
				jQuery(this).dialog('destroy').remove();
				that.next();
		}
	});

	// add message next to start button
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Ready.&nbsp;';
	message.style.float = 'right';
	jQuery('.ui-dialog-buttonpane').append(message);
}