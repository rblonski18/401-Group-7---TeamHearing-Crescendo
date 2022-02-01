function majorMinor(settings){
	activity = new MajorMinor(settings);
	
	// overrides
	for (let key in settings) { activity[key] = settings[key]; }

	// initialize
	activity.init();
}
function MajorMinor(settings){
	this.ID = 'majorMinor';
	this.call = undefined;
	this.calls = [];
	this.disabled = false;
	this.duration = undefined;
	this.duration2 = undefined;
	this.ear = undefined;
	this.feedback = true;
	this.init = () => { this.test(); };
	this.major = undefined;
	this.minor = undefined;
	this.mode = 1;
	this.note = 1;
	this.path = ['data/emotion/60bpm/','data/musescore/3secpiano/'];
	this.practice = 1;
	this.ready = 0;
	this.responses = [];
	this.range = [39,72];
	this.roots = [];
	this.stimuli = [];
	this.stimulusMode = 2; //0 = emotion 60bpm sound files, 1 = scales, 2 = arpeggios
	this.title = 'Major or Minor';
	this.trial = -1;
	this.trials = 10;
	this.words = ['major','minor'];
	this.words2 = ['1','2'];
	this.volume = 1;

	// overrides
	for (let key in settings) { this[key] = settings[key]; }

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
MajorMinor.prototype.check = function(){
	let that = this;
	let dialog = layout.message(this.title,
		'In this exercise, determine if the chord is major or minor.'
		+'</br>Before starting, you can listen to examples '
		+'by pressing the buttons below.',
		{
			Major: ()=>{
				if (this.stimulusMode==0) {	
					activity.note = Math.floor((this.stimuli.length*0.5)*Math.random())+1;
					processor.signal(this.stimuli[(this.note-1)*2])
				} else if (this.stimulusMode==1){
					this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
					this.major = [this.stimuli[(this.note-this.range[0])],this.stimuli[(this.note-this.range[0]+2)],this.stimuli[(this.note-this.range[0]+4)]];//,this.stimuli[(this.note-this.range[0]+5)],this.stimuli[(this.note-this.range[0]+7)],this.stimuli[(this.note-this.range[0]+9)],this.stimuli[(this.note-this.range[0]+11)],this.stimuli[(this.note-this.range[0]+12)]];
					for (let a = 0; a < this.major.length; a++){
						setTimeout(()=>{ processor.signal(this.major[a],undefined,undefined,false)}, 750*a);		
					}
				} else if (this.stimulusMode==2){
					this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
					this.major = [this.stimuli[(this.note-this.range[0])],this.stimuli[(this.note-this.range[0]+4)],this.stimuli[(this.note-this.range[0]+7)]];
					for (let a = 0; a < this.major.length; a++){
						setTimeout(()=>{ processor.signal(this.major[a],undefined,undefined,false)}, 750*a);		
					}
				} 
			},
			Minor: ()=>{
				if (this.stimulusMode==0) {	
					activity.note = Math.floor((this.stimuli.length*0.5)*Math.random())+1;
					processor.signal(this.stimuli[(this.note-1)*2+1])
				} else if (this.stimulusMode==1){
					this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
					this.minor = [this.stimuli[(this.note-this.range[0])],this.stimuli[(this.note-this.range[0]+2)],this.stimuli[(this.note-this.range[0]+3)]];//,this.stimuli[(this.note-this.range[0]+5)],this.stimuli[(this.note-this.range[0]+7)],this.stimuli[(this.note-this.range[0]+8)],this.stimuli[(this.note-this.range[0]+11)],this.stimuli[(this.note-this.range[0]+12)]];
					for (let a = 0; a < this.minor.length; a++){
						setTimeout(()=>{ processor.signal(this.minor[a],undefined,undefined,false)}, 750*a);		
					}
				} else if (this.stimulusMode==2){
					this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
					this.minor = [this.stimuli[(this.note-this.range[0])],this.stimuli[(this.note-this.range[0]+3)],this.stimuli[(this.note-this.range[0]+7)]];
					for (let a = 0; a < this.minor.length; a++){
						setTimeout(()=>{ processor.signal(this.minor[a],undefined,undefined,false)}, 750*a);		
					}
				} 
			},
			Okay: function () {
				jQuery(this).dialog('destroy').remove();
				activity.disabled = false;
			}
		}
	);
}
MajorMinor.prototype.menu = function(){
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
MajorMinor.prototype.next = function(){
	let that = this;//extended scope

	// increment trial
	this.trial++;
	//score.innerHTML = 'Trials remaining: '+String(this.trials-this.trial-1);
	
	// end run
	if (this.trial == this.trials) { this.save(); return; }
	
	// enable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('enable'); }
	this.disabled = false;
	
	// roving
	if (this.stimulusMode==0){
		this.note = Math.floor((this.stimuli.length*0.5)*Math.random())+1;
	} else {
		this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
	}
	this.roots.push(this.note);

	//randomize major vs minor
	this.call = Math.floor(Math.random()*2);
	
	// clear timeouts for early responses
	for (let a = 0; a < timeouts.length; a++) {
		clearTimeout(timeouts[a]);
	}
	timeouts = [];

	// stimulus
	setTimeout(()=>{this.sequence()},1e3);

	console.log('note 1 = ',this.words[this.call],", ",this.note);
	console.log('note 2 = ',this.words[Math.abs(1-this.call)],", ",this.note);
}
MajorMinor.prototype.preload = function(){
	let that = this;//extended scope
	
	// preloading dialog
	layout.message(
		'Preloading Materials',
		'Please wait while materials are loaded.', 
		{
			Okay: function () { 
				jQuery(this).dialog('destroy').remove();
			}
		}
	);
	
	// disable start
	jQuery(".ui-dialog-buttonpane button:contains('Okay')").button('disable');
	
	// load audio
	let index = 0;
	if (this.stimulusMode == 0) {
		for (let a = 0; a < 20; a++) { 
			for (let b = 0; b < 2; b++) { 
				loadAudio(a,b); 
				index++;
			} 
		};
	} else {
		for (var a = 0; a < 61; a++) {
			loadAudio(a); 
			index++;
		} 
	}

	
	// load audio function
	let counter = 0;
	function loadAudio(a,b) {
		if (that.stimulusMode == 0){
			var url = that.path[0]+that.words[b]+(a+1)+'.wav';
		} else {
			var url = that.path[1]+"Piano_"+(a+33)+'.wav';
		}
		
		var request = new XMLHttpRequest();
		request.index = index;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function (a) {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				if (counter == 40) {
					jQuery(".ui-dialog-buttonpane button:contains('Okay')").button('enable');
				}
			});
		};
		request.send();
	}
	
	
}
MajorMinor.prototype.response = function(button){
	if(this.disabled){return}
	
	// disable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('disable'); }
	this.disabled = true;
			
	// log call and response
	this.calls.push(this.call);
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
	this.next();
}
MajorMinor.prototype.results = function(){
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
		url: 'version/'+version+'/php/majorMinor.php'
	});
};
MajorMinor.prototype.save = function(data){
	// save to database
	jQuery.ajax({
		data: {
			calls: this.calls.join(','),
			ear: this.ear,
			gain: MASTERGAIN,
			mode: this.mode,
			notes: this.notes,
			practice: this.practice,
			responses: this.responses.join(','),
			roots: this.roots.join(','),
			score: percentCorrect(this.calls,this.responses).toFixed(0),
			stimulusMode: this.stimulusMode,
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
		url: 'version/'+version+'/php/majorMinor.php'
	});
}
MajorMinor.prototype.sequence = function(){
	let that = this;

	switch (this.stimulusMode){
		case 0:
			// play audio files
			this.major = this.stimuli[(this.note-1)*2];
			this.minor = this.stimuli[(this.note-1)*2+1];
			this.duration = (this.major.length/this.major.sampleRate)*1000 + 500;
			this.duration2 = (this.minor.length/this.minor.sampleRate)*1000;
			break;
		case 1: 
			this.major = [this.stimuli[(this.note-this.range[0])],this.stimuli[(this.note-this.range[0]+2)],this.stimuli[(this.note-this.range[0]+4)]];//,this.stimuli[(this.note-this.range[0]+5)],this.stimuli[(this.note-this.range[0]+7)],this.stimuli[(this.note-this.range[0]+9)],this.stimuli[(this.note-this.range[0]+11)],this.stimuli[(this.note-this.range[0]+12)]];
			this.minor = [this.stimuli[(this.note-this.range[0])],this.stimuli[(this.note-this.range[0]+2)],this.stimuli[(this.note-this.range[0]+3)]];//,this.stimuli[(this.note-this.range[0]+5)],this.stimuli[(this.note-this.range[0]+7)],this.stimuli[(this.note-this.range[0]+8)],this.stimuli[(this.note-this.range[0]+11)],this.stimuli[(this.note-this.range[0]+12)]];
			this.duration = 3500;
			this.duration2 = 3500;
			break;
		case 2:
			this.major = [this.stimuli[(this.note-this.range[0])],this.stimuli[(this.note-this.range[0]+4)],this.stimuli[(this.note-this.range[0]+7)]];
			this.minor = [this.stimuli[(this.note-this.range[0])],this.stimuli[(this.note-this.range[0]+3)],this.stimuli[(this.note-this.range[0]+7)]];
			this.duration = 3500;
			this.duration2 = 3500;
	}

	that.stimulus();
}
MajorMinor.prototype.settings = function(){
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

	// Stimulus Mode
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Stimulus mode:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var stimulusModeOptions = ['Song Clips','Scales','Arpeggios'];
	var select = layout.select(['Song Clips','Scales','Arpeggios']);
	select.onchange = function () { 
		that.stimulusMode = stimulusModeOptions.indexOf(this.value); 
		console.log(that.stimulusMode);
	};
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
}
MajorMinor.prototype.stimulus = function(){	
	let that = this;

	// clear timeouts for early responses
	for (let a = 0; a < timeouts.length; a++) {
		clearTimeout(timeouts[a]);
	}
	timeouts = [];

	//button color
	jQuery('#afc0').css('color',buttonColor)
	jQuery('#afc1').css('color',buttonColor)

	switch (this.stimulusMode){
		case 0:
			if (this.major == undefined){
				processor.signal('data/musescore/3secpiano/Piano_45.mp4')
			} else {
				if (this.call==0){
					processor.signal(this.major);
					timeouts.push(setTimeout(()=>{ processor.signal(this.minor)}, this.duration));		
				} else{
					processor.signal(this.minor);
					timeouts.push(setTimeout(()=>{ processor.signal(this.major)}, this.duration));	
				}
			}
			break;
		case 1:
			if (this.major == undefined){
				processor.signal('data/musescore/3secpiano/Piano_45.mp4')
			} else {
				if (this.call==0){
					for (let a = 0; a < this.major.length; a++){
						timeouts.push(setTimeout(()=>{ processor.signal(this.major[a],undefined,undefined,false)}, 750*a));		
					}
					for (let a = 0; a < this.minor.length; a++){
						timeouts.push(setTimeout(()=>{ processor.signal(this.minor[a],undefined,undefined,false)}, 750*a+this.duration));		
					}
				} else{
					for (let a = 0; a < this.minor.length; a++){
						timeouts.push(setTimeout(()=>{ processor.signal(this.minor[a],undefined,undefined,false)}, 750*a));		
					}
					for (let a = 0; a < this.major.length; a++){
						timeouts.push(setTimeout(()=>{ processor.signal(this.major[a],undefined,undefined,false)}, 750*a+this.duration));		
					}
				}
			}
			break;
		case 2:
			if (this.major == undefined){
				processor.signal('data/musescore/3secpiano/Piano_45.mp4')
			} else {
				if (this.call==0){
					for (let a = 0; a < this.major.length; a++){
						timeouts.push(setTimeout(()=>{processor.signal(this.major[a],undefined,undefined,false)},750*a));		
					}
					for (let a = 0; a < this.minor.length; a++){
						timeouts.push(setTimeout(()=>{processor.signal(this.minor[a],undefined,undefined,false)}, 750*a+this.duration));	
					}
					
				} else{
					for (let a = 0; a < this.minor.length; a++){
						timeouts.push(setTimeout(()=>{processor.signal(this.minor[a],undefined,undefined,false)},750*a));		
					}
					for (let a = 0; a < this.major.length; a++){
						timeouts.push(setTimeout(()=>{processor.signal(this.major[a],undefined,undefined,false)}, 750*a+this.duration));		
					}
				}
			}
	}
	 
	
	//change button colors
	jQuery('#afc0').css('color','yellow');
	timeouts.push(setTimeout(()=>{jQuery('#afc0').css('color',buttonColor)},this.duration-500));
	timeouts.push(setTimeout(()=>{jQuery('#afc1').css('color','yellow')},this.duration));
	timeouts.push(setTimeout(()=>{jQuery('#afc1').css('color',buttonColor)},this.duration+this.duration2-500));

};
MajorMinor.prototype.test = function(){
	let that = this;//extended scope
		
	// reset
	this.call = undefined;
	this.calls = [];
	this.major = undefined;
	this.minor = undefined;
	this.responses = [];
	this.stimuli = [];
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
	var cells = this.words2.length;
	for (let a = 0; a < this.words2.length; a++) {				
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
		button.innerHTML = this.words2[a];
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
	message.innerHTML = 'Which rendition is major (more pleasant)?';
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
		document.getElementById('message').innerHTML = 'Which rendition is major (more pleasant)?';
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

	// start message
	layout.message('Major or Minor','Indicate which rendition is major (more pleasant).',{
		Start: function () {
			jQuery(this).dialog('destroy').remove();
			that.next();
		}
	});
	
	// check
	activity.check();

	// volume
	if (this.volume) {
		gui.gain();
	}

	// preload
	activity.preload();


}