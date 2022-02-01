function musescore(settings){
	activity = new Musescore(settings);

	// overrides
	for (let key in settings) { if (key in activity) { activity[key] = settings[key]; } }

	// initialize
	activity.init();
}
function Musescore(settings){
	this.ID = 'harmony';
	this.call = undefined;
	this.calls = [];
	this.chance = 0;
	this.chances = 4;
	this.disabled = false;
	this.ear = undefined;
	this.f0 = undefined;
	this.feedback = true;
	this.filetype = '.mp4';
	this.init = () => { this.test(); };
	this.instrument = 0;
	this.instrument2 = 0;
	this.instrumentList = [];
	this.instrument2List = [];
	this.instruments = ['piano','guitar','violin','tenor sax'];
	this.interval = 12;
	this.intervalpair = 0;
	this.intervals = [1,2,3,4,5,6,7,8,9,10,11,12];
	this.intervalsList = [];
	this.level = undefined;
	this.mode = 0; //mode = 0: pitch discrimination, mode = 1: instrument identification
	this.note = undefined;
	this.note2 = undefined;
	this.path = ['data/musescore/3secpiano/','data/musescore/3secguitar/','data/musescore/3secviolin/','data/musescore/3sectenorsax/'];
	this.path2 = ['data/musescore/vocoder/Noise/Full_Modulation/','data/musescore/vocoder/Noise/Reduced_Modulation/','data/musescore/vocoder/Sine/Full_Modulation/','data/musescore/vocoder/Sine/Reduced_Modulation/'];
	this.practice = 0;
	this.range = [39,72];
	this.ready = 0;
	this.responses = [];
	this.roots = [];
	this.stimuli = [];
	this.timbreMode = 0; //timbreMode = 0: instrument is piano, timbreMode = 1: each pair of notes is the same instrument, timbreMode = 2: randomize instrument for each pair of notes
	this.title = 'Musescore';
	this.trial = -1;
	this.trials = Infinity;
	this.vocoder = 0; //vocoder = true: Ravi's test, vocoder = false: musescore test
	this.vocoderTone = 0; //vocoderTone = 0: Noise Full Modulation, vocoderTone = 1: Noise Reduced Modulation, vocoderTone = 2: Sine Full Modulation, vocoderTone = 3: Sine Reduced Modulation
	this.words = ['1','2'];

	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }

	// global variable for canceling intervals
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
Musescore.prototype.check = function () {
	let that = this;
	let dialog = layout.message(this.title,
		'In this exercise, determine which instrument is playing.'
		+'</br>Before starting, you can listen to examples '
		+'by pressing the buttons below.',
		{
			Piano: ()=>{this.note = this.range[0]+Math.floor((this.range[1]-this.range[0]-2)*Math.random());
				this.instrument=0;
				this.stimulus();},
			//Guitar: ()=>{activity.note = this.range[0]+Math.floor((this.range[1]-this.range[0])*Math.random());
			//	this.instrument=1;
			//	this.stimulus();},
			//Violin: ()=>{activity.note = this.range[0]+Math.floor((this.range[1]-this.range[0])*Math.random());
			//	this.instrument=2;
			//	this.stimulus();},
			TenorSax: ()=>{activity.note = this.range[0]+Math.floor((this.range[1]-this.range[0]-2)*Math.random());
				this.instrument=1;
				this.stimulus();},
			Okay: function () {
				jQuery(this).dialog('destroy').remove();
				activity.disabled = false;
			}
		}
	);
}
Musescore.prototype.menu = function () {
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
Musescore.prototype.next = function () {
	let that = this;//extended scope

	// increment trial
	this.trial++;
	//score.innerHTML = 'Trials remaining: '+String(this.trials-this.trial-1);

	// end run
	if ((this.chance == this.chances)||(this.trial == this.trials)) { this.save(); return; }

	// enable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('enable'); }
	this.disabled = false;

	// clear timeouts for early responses
	for (let a = 0; a < timeouts.length; a++) {
		clearTimeout(timeouts[a]);
	}
	timeouts = [];

	//stimulus
	switch (this.mode){
		case 0:
			// roving
			this.note = this.range[0]+Math.round((this.range[1]-this.range[0]-2)*Math.random());
			//this.roots.push(this.note);

			//interval
			this.call = Math.floor(Math.random()*2);
			if (this.call == 0){
				this.note2 = this.note - Math.floor(this.interval/2);
				this.note = this.note + Math.round(this.interval/2);
				this.roots.push(this.note);
			} else{
				this.note2 = this.note + Math.floor(this.interval/2);
				this.note = this.note - Math.round(this.interval/2);
				this.roots.push(this.note);
			}

			//instrument
			switch(this.timbreMode){
				case 0: //instrument = piano
					if (this.vocoder==1){
						this.instrument = 1;
						this.instrument2 = 1;
					} else{
						this.instrument = this.instrument;
						this.instrument2 = this.instrument;
					}
					break;
				case 1: //each pair of notes is the same instrument
					this.instrument = Math.floor(this.instruments.length*Math.random());
					this.instrument2 = this.instrument;
					break;
				case 2: //randomize instrument for each pair of notes
					this.instrument = Math.floor(this.instruments.length*Math.random());
					this.instrument2 = Math.floor(this.instruments.length*Math.random());
					while (this.instrument2 == this.instrument){
						this.instrument2 = Math.floor(this.instruments.length*Math.random());
					}
			}

			// stimulus
			this.stimulus();

			//console.log('note 1 = ',this.note,', instrument = ',this.instruments[this.instrument],', vocoderTone = ',this.vocoderTone);
			//console.log('note 2 = ',this.note2,', instrument = ',this.instruments[this.instrument2], ', vocoderTone = ',this.vocoderTone);
			break;
		case 1:
			this.note = this.range[0]+Math.floor((this.range[1]-this.range[0]-2)*Math.random());
			this.roots.push(this.note);
			this.instrument = Math.floor(this.instruments.length*Math.random());
			this.stimulus();
			console.log('note 1 = ',this.note);
			console.log('instrument =',this.instruments[this.instrument]);
			break;
		case "practice":
	}

	/*
	// call random interval, with a consonant/disonnant interval always paired together
	if (this.intervalpair.length==1){
		this.interval = Number(this.intervalpair);
		this.intervalpair = [];
	} else{
		this.intervals = this.intervals.shuffle();
		this.intervalpair = this.intervals.pop();
		this.intervalpair = this.intervalpair.shuffle();
		this.interval = Number(this.intervalpair.pop());
	}

	// roving
	this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
	this.roots.push(this.note);

	// stimulus
	this.stimulus();

	// change option
	if (this.intervals.length == 0 && this.intervalpair.length==0) {
		this.intervals = [[0,1],[6,7],[11,12]];
	}
	console.log('note 1 = ',this.note);
	console.log('note 2 = ',this.note + this.interval);
	*/
}
Musescore.prototype.preload = function () {
	let that = this;

	/* check if already preloaded
	if ( typeof materials != "undefined" && 'musescore' in materials) {
		console.log('already loaded');
		this.stimuli = materials.musescore;
		return;
	}*/

	// set to 1
	activity.ready++;

	// disable start
	jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
	jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');

	// load audio function
	var counter = 0;
	var index = 0;
	function loadAudio(i,a) {
		var request = new XMLHttpRequest();
		if (that.vocoder == 1) {
			var url = that.path2[i] + "guitar_" + (a+33) + that.filetype;
		} else {
			var url = that.path[i] + that.instruments[i] + "_" + (a+that.range[0]) + that.filetype;
		}
		console.log(url);
		request.index = index;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function (a) {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				if (counter == (that.range[1]-that.range[0]+1)*that.instruments.length) {
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

	// load audio - only preloading midi-notes 33-94
	if (that.vocoder == 1) {
		for (var i = 0; i<that.path2.length;i++){
			for (var a = 0; a < 61; a++) {
				loadAudio(i,a);
				index++;
			}
		}
	} else{
		for (var i = 0; i < that.path.length; i++) {
			for (var a = 0; a < (this.range[1]-this.range[0]+1); a++) {
				loadAudio(i,a);
				index++;
			}
		}
	}

	// store globally
	materials.musescore = this.stimuli;

};
Musescore.prototype.response = function(button){
	let that = this;
	if(this.disabled){return}

	// disable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('disable'); }
	this.disabled = true;

	// log call and response
	switch (this.mode){
		case 0:
			this.calls.push(this.call);
			this.responses.push(button.index);
			this.instrumentList.push(this.instrument);
			this.instrument2List.push(this.instrument2);
			this.intervalsList.push(this.interval);
			if (this.call == button.index){
				this.interval = this.interval-1;
			} else{
				this.interval = this.interval+3;
			}
			break;
		case 1:
			this.call = this.instrument;
			this.calls.push(this.call);
			this.responses.push(button.index);
			this.instrumentList.push(this.instrument);
			this.instrument2List.push(undefined);
			this.intervalsList.push(this.interval);

	}
	this.interval = Math.max(Math.min(this.interval,12),1);
	/*
	if ((this.interval==0)||(this.interval==7)||(this.interval==12)) {this.call=0;}
	if ((this.interval==1)||(this.interval==6)||(this.interval==11)) {this.call=1;}
	this.calls.push(this.call);
	this.intervalsList.push(this.interval);
	this.responses.push(button.index);
	*/

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
				score.innerHTML = 'Pitch Discrimination: ' + this.interval + ' MIDI notes';
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
				score.innerHTML = 'Pitch Discrimination: ' + this.interval + ' MIDI notes';
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
Musescore.prototype.results = function(){
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
		url: 'version/'+version+'/php/musescore.php'
	});
};
Musescore.prototype.save = function(data){
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
			vocoder: this.vocoder,
			vocoderTone: this.vocoderTone
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
		url: 'version/'+version+'/php/musescore.php'
	});
}
Musescore.prototype.settings = function(){
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

	// vocoder
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Vocoder:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select(['Off','On']);
	select.onchange = function () { that.vocoder = this.value == 'On'; };
	select.value = this.vocoder ? 'On' : 'Off';
	cell.appendChild(select);
	if (widgetUI) { jQuery(select).selectmenu({change:select.onchange}); }
	var cell = row.insertCell(2);
	cell.style.width = '20%';

	// instrument
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Instrument:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select(['Piano','Guitar','Violin','Tenor Sax']);
	select.onchange = function () {
		that.instrument = that.instruments.indexOf(this.value)
		console.log(that.instrument);
	};
	//select.value = this.instrument;
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
Musescore.prototype.stimulus = function(){
	let that = this;

	// clear timeouts for early responses
	for (let a = 0; a < timeouts.length; a++) {
		clearTimeout(timeouts[a]);
	}
	timeouts = [];

	switch (this.mode){
		case 0:
			if (this.note == undefined){
				processor.signal(this.stimuli[0])
			} else if (this.vocoder==1){
				const path1 = this.stimuli[(this.vocoderTone*61)+(this.note-33)];
				const path2 = this.stimuli[(this.vocoderTone*61)+(this.note2-33)];
				processor.signal(path1);
				timeouts.push(setTimeout(()=>{ processor.signal(path2)}, 1000));
			} else{
				//processor.signal([this.stimuli[this.note-this.range[0]],this.stimuli[this.note+this.interval-this.range[0]]],0,[0,2e3]);
				const path1 = this.stimuli[(this.instrument*61)+(this.note-33)];
				const path2 = this.stimuli[(this.instrument2*61)+(this.note2-33)];
				processor.signal(path1);
				timeouts.push(setTimeout(()=>{ processor.signal(path2)}, 1000));

				//processor.signal(this.stimuli[this.note+this.interval-this.range[0]],0,2e3);
			}
			break;
		case 1:
			if (this.note == undefined){
				processor.signal(this.stimuli[0])
			} else {
			const pathstring1 = this.stimuli[(this.instrument*(this.range[1]-this.range[0]+1)+this.note-this.range[0])];
			const pathstring2 = this.stimuli[(this.instrument*(this.range[1]-this.range[0]+1)+this.note+1-this.range[0])];
			const pathstring3 = this.stimuli[(this.instrument*(this.range[1]-this.range[0]+1)+this.note+2-this.range[0])];
			processor.signal(pathstring1);
			timeouts.push(setTimeout(()=>{ processor.signal(pathstring2)}, 1000));
			timeouts.push(setTimeout(()=>{ processor.signal(pathstring3)}, 2000));
			}

	}

	/*
	// play interval
	if ('preload' in this) {
		//processor.signal([this.stimuli[this.note-this.range[0]],this.stimuli[this.note+this.interval-this.range[0]]],0,[0,1e3]);
		processor.signal(this.stimuli[this.note-this.range[0]]);
		processor.signal(this.stimuli[this.note+this.interval-this.range[0]],0,1e3);
	} else {
		const pathstring1 = this.path+this.instrument+'_'+this.note+that.filetype;
		const pathstring2 = this.path+this.instrument+'_'+String(this.note+Number(this.interval))+that.filetype;
		processor.signal([pathstring1,pathstring2],0,[0,1e3]);
		if(debug){console.log('\n',pathstring1,'\n',pathstring2)}
	}
	*/
};
Musescore.prototype.test = function(){
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
	this.interval = 12;
	this.roots = [];
	this.responses = [];
	this.trial = -1;
	timeouts = [];

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
	if (this.mode==1){
		this.words = this.instruments; //['Piano','Guitar','Violin','Tenor Sax'];
	}
	if (windowheight > windowwidth) {
		var cells = 1, rows = this.words.length;
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
		button.id = 'afc' + a;
		button.index = a;
		button.innerHTML = this.words[a];
		button.onclick = function () { that.response(this); };
		button.style.fontSize = windowheight > windowwidth ? '100%' : '200%';
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
	controls.style.height = '15%';
	controls.style.width = '90%';
	controls.style.left = '5%';
	controls.style.padding = '8px';
	main.appendChild(controls);

	// message
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Which instrument is playing?';
	message.style.display = 'inline-block';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	message.style.width = '50%';
	controls.appendChild(message);

	if (this.mode==1) {
		message.innerHTML = 'Which instrument is playing?';
	}

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
		if (this.chances < 100) {
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
	score.insertAdjacentHTML('beforeend',' Pitch Discrimination: '+ this.interval + ' MIDI notes');
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
			score.innerHTML = 'Pitch Discrimination: ' + this.interval + ' MIDI notes';
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

	// message
	layout.message('Musescore','Indicate which instrument is playing.',{
		Start: function () {
			jQuery(this).dialog('destroy').remove();
			that.next();
		}
	});

	//preload
	activity.preload();

	//check
	if (this.mode==1){this.check(); return;}

	// master volume
	if (this.volume) {gui.gain(this.volume);}
}
