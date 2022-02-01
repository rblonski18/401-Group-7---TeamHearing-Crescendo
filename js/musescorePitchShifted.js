function musescorePitchShifted(settings){
	activity = new MusescorePitchShifted(settings);

	// overrides
	for (let key in settings) { activity[key] = settings[key]; }

	// initialize
	activity.init();
}
function MusescorePitchShifted(settings){
	this.ID = 'harmony';
	this.call = undefined;
	this.calls = [];
	this.chance = 0;
	this.chances = 4;
	this.disabled = false;
	this.ear = undefined;
	this.f0 = undefined;
	this.feedback = true;
	this.init = () => { this.test(); };
	this.instrument = 0;
	this.instrument2 = 0;
	this.instrumentList = [];
	this.instrument2List = [];
	this.instruments = ['piano','tenor sax']; //['piano','guitar','violin','tenor sax']
	this.interval = 33;
	this.intervalsList = [];
	this.level = undefined;
	this.note = undefined;
	this.path = ['data/musescore/pitchshiftedpiano/','data/musescore/pitchshiftedtenorsax/']; //['data/musescore/pitchshiftedpiano/','data/musescore/pitchshiftedguitar/','data/musescore/pitchshiftedviolin/','data/musescore/pitchshiftedtenorsax/'];
	this.practice = 0;
	this.range = [39,51];
	this.ready = 0;
	this.responses = [];
	this.roots = [];
	this.stimuli = [];
	this.timbreMode = 2; //timbreMode = 0: instrument is piano, timbreMode = 1: each pair of notes is the same instrument, timbreMode = 2: randomize instrument for each pair of notes
	this.title = 'MusescorePitchShifted';
	this.trial = -1;
	this.trials = Infinity;
	this.words = ['1','2'];

	// overrides
	for (let key in settings) { this[key] = settings[key]; }

	timeouts = [];

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
MusescorePitchShifted.prototype.check = function () {
	let that = this;
	let dialog = layout.message(this.title,
		'In this exercise, determine which instrument is playing.'
		+'</br>Before starting, you can listen to examples '
		+'by pressing the buttons below.',
		{
			Piano: ()=>{this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
				this.instrument=0;
				processor.signal(this.stimuli[(this.note-this.range[0])*33-1]);},
			//Guitar: ()=>{activity.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
			//	this.instrument=1;
			//	processor.signal(this.stimuli[this.instrument*(this.range[1]-this.range[0]+1)*33+(this.note-this.range[0])*33-1]);},
			//Violin: ()=>{activity.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
			//	this.instrument=2;
			//	processor.signal(this.stimuli[this.instrument*(this.range[1]-this.range[0]+1)*33+(this.note-this.range[0])*33-1]);},
			TenorSax: ()=>{activity.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
				this.instrument=1;
				processor.signal(this.stimuli[this.instrument*(this.range[1]-this.range[0]+1)*33+(this.note-this.range[0])*33-1]);},
			Okay: function () {
				jQuery(this).dialog('destroy').remove();
				activity.disabled = false;
				that.next();
			}
		}
	);
}
MusescorePitchShifted.prototype.menu = function () {
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
MusescorePitchShifted.prototype.next = function () {
	let that = this;//extended scope

	// increment trial
	this.trial++;
	//score.innerHTML = 'Trials remaining: '+String(this.trials-this.trial-1);

	// end run
	if ((this.chance == this.chances)||(this.trial == this.trials)) { this.save(); return; }

	// enable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('enable'); }
	this.disabled = false;

	// roving
	this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
	this.roots.push(this.note);

	//call
	this.call = Math.floor(Math.random()*2);

	//instrument
	switch(this.timbreMode){
		case 0: //entire test is the same isntrument
			this.instrument = this.instrument;
			this.instrument2 = this.instrument;
			break;
		case 1: //each pair of notes is the same instrument
			this.instrument = Math.floor(this.instruments.length*Math.random());
			this.instrument2 = this.instrument;
			break;
		case 2:
			this.instrument = Math.floor(this.instruments.length*Math.random());
			this.instrument2 = Math.floor(this.instruments.length*Math.random());
			while (this.instrument2 == this.instrument){
				this.instrument2 = Math.floor(this.instruments.length*Math.random());
			}
	}

	// clear timeouts for early responses
	for (let a = 0; a < timeouts.length; a++) {
		clearTimeout(timeouts[a]);
	}
	timeouts = [];

	// stimulus
	this.stimulus();

	console.log('instrument = ',this.instrument,'instrument2 = ',this.instrument2,'note = ',this.note,'interval = ',this.interval,'call = ',this.call);
}
MusescorePitchShifted.prototype.preload = function () {
	var that = this;

	// set to 1
	activity.ready++;

	// disable start
	jQuery(".ui-dialog-buttonpane button:contains('Okay')").button('disable');
	jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');

	// load audio function
	var counter = 0;
	var index = 0;
	function loadAudio(c,a,b) {
		var request = new XMLHttpRequest();
		var url = that.path[c]+that.instruments[c]+'_'+(a+that.range[0])+'_'+String(b)+'.mp4';
		console.log(url);
		request.index = index;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function (a) {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				if (counter == ((that.range[1]-that.range[0]+1)*33)*that.instruments.length) {
					activity.ready--;
					if (activity.ready == 0) {
						jQuery('.ui-dialog-buttonpane #message').html('Ready.&nbsp;');
						jQuery(".ui-dialog-buttonpane button:contains('Okay')").button('enable');
					}
				}
			});
		};
		request.send();
	}

	// load audio - only preloading notes in the range
	for (var c = 0; c<this.instruments.length; c++) {
		for (var a = 0; a < (this.range[1]-this.range[0]+1); a++) {
			for (var b = 1; b<34; b++) {
				loadAudio(c,a,b);
				index++;
			}
		}
	}

};
MusescorePitchShifted.prototype.response = function (button) {
	let that = this;
	if(this.disabled){return}

	// disable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('disable'); }
	this.disabled = true;

	// log call and response
	this.calls.push(this.call);
	this.responses.push(button.index);
	this.intervalsList.push(this.interval);
	this.instrumentList.push(this.instrument);
	this.instrument2List.push(this.instrument2);
	if (this.call == button.index){
		this.interval = this.interval-1;
	} else{
		this.interval = this.interval+3;
	}
	this.interval = Math.max(Math.min(this.interval,33),1);


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
				score.innerHTML = 'Pitch Resolution: ' + Math.round(Math.pow(2,((this.interval-14)/3))) + '%';
				if (this.intervalsList[this.intervalsList.length-1]==1){
					that.chance++;
					document.getElementById('chance'+that.chance).src = 'images/score-yay.png';
				}
			} else if (this.trials < 20){
				document.getElementById('score'+this.trial).src = 'images/score-yay.png';
			} else {
				score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%'+', remaining: '+String(this.trials-this.trial-1);
			}
		} else {
			that.chance++;
			// score indicator
			if ((this.trials == Infinity)&&(this.chances != Infinity)){
				document.getElementById('chance'+that.chance).src = 'images/score-nay.png';
				//score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
				score.innerHTML = 'Pitch Resolution: ' + Math.round(Math.pow(2,((this.interval-14)/3))) + '%';
			} else if (this.trials <20 && windowwidth > 4) {
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
MusescorePitchShifted.prototype.results = function () {
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

			console.log(data);

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
		url: 'version/'+version+'/php/musescorePitchShifted.php'
	});
};
MusescorePitchShifted.prototype.save = function (data) {
	// save to database
	jQuery.ajax({
		data: {
			calls: this.calls.join(','),
			ear: this.ear,
			f0: this.f0,
			gain: MASTERGAIN,
			instrument: this.instrumentList.join(','),
			instrument2: this.instrument2List.join(','),
			intervals: this.intervalsList.join(','),
			mode: this.mode,
			notes: this.notes,
			practice: this.practice,
			responses: this.responses.join(','),
			roots: this.roots.join(','),
			score: percentCorrect(this.calls,this.responses).toFixed(0),
			subuser: subuser.ID,
			timbreMode: this.timbreMode,
			user: user.ID,
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
		url: 'version/'+version+'/php/musescorePitchShifted.php'
	});
}
MusescorePitchShifted.prototype.settings = function () {
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
	var select = layout.select(['Pitch Discrimination','Instrument Identification']);
	select.onchange = function () { that.mode = this.selectedIndex; };
	select.value = this.mode ? 'Instrument Identification': 'Pitch Discrimination';
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

	// footer
	layout.footer();
}
MusescorePitchShifted.prototype.stimulus = function () {
	let that = this;

	// clear timeouts for early responses
	for (let a = 0; a < timeouts.length; a++) {
		clearTimeout(timeouts[a]);
	}
	timeouts = [];

	//button color
	jQuery('#afc0').css('color',buttonColor)
	jQuery('#afc1').css('color',buttonColor)

	if (this.note == undefined){
		processor.signal(this.stimuli[0])
	} else {
		const path1 = this.stimuli[((this.instrument*(this.range[1]-this.range[0]+1)*33)+(this.note-this.range[0])*33)+(this.interval)-1];
		const path2 = this.stimuli[((this.instrument2*(this.range[1]-this.range[0]+1)*33)+(this.note-this.range[0])*33)];;
		if (this.call==0) {
			processor.signal(path1);
			timeouts.push(setTimeout(()=>{ processor.signal(path2)}, 1000));
		} else{
			processor.signal(path2);
			timeouts.push(setTimeout(()=>{ processor.signal(path1)}, 1000));
		}
	}

	//change button colors
	jQuery('#afc0').css('color','yellow');
	timeouts.push(setTimeout(()=>{jQuery('#afc0').css('color',buttonColor)},1000));
	timeouts.push(setTimeout(()=>{jQuery('#afc1').css('color','yellow')},1000));
	timeouts.push(setTimeout(()=>{jQuery('#afc1').css('color',buttonColor)},2000));


};
MusescorePitchShifted.prototype.test = function () {
	let that = this;//extended scope

	// add message next to start button
	if (this.level > 100) {
		let message = document.createElement('span');
		message.id = 'message';
		message.innerHTML = 'You are on level '+String(this.level+1)+' of 36.&nbsp&nbsp';
		message.style.float = 'right';
		jQuery('.ui-dialog-buttonpane').append(message);
	}

	// reset
	this.call = undefined;
	this.calls = [];
	this.interval = 33;
	this.roots = [];
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
	var cells = this.words.length;
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
	message.innerHTML = 'Which tone is higher in pitch?';
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
		this.style.display = 'none';
		document.getElementById('message').innerHTML = 'Which tone is higher in pitch?';
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
	}

	// score indicator
	var score = document.createElement('span');
	score.id = 'score';
	score.insertAdjacentHTML('beforeend',' Pitch Resolution: '+ Math.round(Math.pow(2,((this.interval-14)/3))) + '%');
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
			//score.innerHTML = 'Score: '+0+', remaining: '+String(this.trials-this.trial-1);
			score.innerHTML = 'Pitch Resolution: ' + Math.round(Math.pow(2,((this.interval-14)/3))) + '%';
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

	//check
	if (this.timbreMode==2){
		this.check();
	} else {
		// okay message
		layout.message('Musescore Pitch Shifted','Indicate which tone is higher in pitch.',{
			Okay: function () {
				jQuery(this).dialog('destroy').remove();
				that.next();
			}
		});
	}

	//preload
	activity.preload();

	// master volume
	if (this.volume) {gui.gain(this.volume);}

}
