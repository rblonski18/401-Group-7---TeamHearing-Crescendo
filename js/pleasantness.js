function pleasantness(settings) {
	activity = new Pleasantness();
	
	// overrides
	for (let key in settings) { activity[key] = settings[key]; }
	
	// preload
	activity.preload();
	
	// initialize
	activity.init();
}
function Pleasantness(settings) {
	this.alternatives = 7;
	this.call = 0;
	this.calls = [];
	this.correct = undefined;
	this.ear = 'Not Specified';
	this.feedback = false;
	this.init = ()=>{this.test()}
	this.interval = 0;
	this.instrument = 'Piano';
	this.intervals = [];
	this.note = 45;
	this.path = 'data/musescore/3secpiano/';
	this.practice = false;
	this.range = [45,45];
	this.ready = 0;
	this.responses = [];
	this.roots = [];
	this.snr = Infinity;
	this.spacing = undefined;
	this.spacings = [];
	this.stimuli = [];
	this.title = 'Pleasantness';
	this.titleShort = 'Pleasantness';
	this.trial = -1;
	this.trials = 26;
	
	// overrides
	for (let key in settings) { this[key] = settings[key]; }
}
Pleasantness.prototype.menu = function () {	
	// main
	var main = layout.main(
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
Pleasantness.prototype.next = function () {
	let that = this;//extended scope
	
	// enable buttons
	for (let a = 0; a < this.alternatives; a++) { jQuery('#afc'+a).button('enable'); }
	
	//
	this.trial++;
	score.innerHTML = 'Trials remaining: '+String(this.trials-this.trial-1);
	
	// end run
	if (this.trial >= this.trials) {
		this.save();
		return;
	}
	
	// shuffle
	if (this.intervals.length == 0) {
		this.intervals = [0,1,2,3,4,5,6,7,8,9,10,11,12];
		this.intervals = this.intervals.shuffle();
	} 
	
	//
	this.interval = this.intervals.pop();
	this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
	this.roots.push(this.note);
	this.spacings.push(this.interval);
	
	// stimulus
	this.stimulus();
}
Pleasantness.prototype.preload = function () {
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
	
	// load audio
	let i = 0, total = 24, url;
	for (let a = 33; a <= 93; a++) {
		url = this.path+this.instrument+'_'+a+'.wav';
		loadAudio(i++,url,total);
	}
};
Pleasantness.prototype.response = function (button) {
	let that = this;//extended scope
	
	// disable buttons
	for (let a = 0; a < this.alternatives; a++) { jQuery('#afc'+a).button('disable'); }
			
	// log call and response
	this.calls[this.calls.length] = this.call;
	this.responses[this.responses.length] = button.index;
			
	// feedback
	var img = document.createElement('img');
	img.src = 'images/check.png';
	img.style.bottom = '10%';
	img.style.height = '20%';
	img.style.position = 'absolute';
	img.style.right = '10%';
	img.style.zIndex = '10';
	button.appendChild(img);
	jQuery(img).fadeOut(1e3);
		
	//
	setTimeout(()=>{this.next()},1e3);
}
Pleasantness.prototype.results = function () {
	let that = this;
	
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
			console.log(data);
			results = jQuery.parseJSON(data);
			results.sort(compare);
			//results.reverse();

			// no results
			if (results.length == 0) {
				main.insertAdjacentHTML('beforeend','No results.');
				return;
			}
			
			// summary chart (init)
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
			const scaleType = 'linear';
				
			// accordion (content)
			console.log(results);
			for (let item = 0, items = results.length; item < items; item++) {
				result = results[item];
				console.log(result);
				
				//
				responses = result.responses.split(',');
				spacings = result.intervals.split(',');
				scale = [];
				
				//
				for (let a = 0; a < spacings.length; a++) {
					responses[a] = Number(responses[a]);
					spacings[a] = Number(spacings[a]);
				}
				console.log(responses);
				console.log(spacings);
				
				//
				for (let a = 0; a < 13; a++) {
					scale[a] = 0;
				}
				
				//
				for (let a = 0; a < spacings.length; a++) {
					scale[spacings[a]] += responses[a];
				}
				console.log(scale);
				
				//
				for (let a = 0; a < scale.length; a++) {
					scale[a] = scale[a]/(spacings.length/13);
				}
				console.log(scale);
					
				// heading
				var heading = document.createElement('h3');
				heading.innerHTML = result.entry;
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
				data[0] = ['Musical Interval','Pleasantness Rating'];
				for (var a = 0; a < scale.length; a++) {
					data.push([a,scale[a]]);
				}
				console.log(data);
				var chart = new google.visualization.ColumnChart(chart_div);
				var data = google.visualization.arrayToDataTable(data);
				var options = {
					chartArea: {width: '70%'},
					hAxis: {
						scaleType: scaleType,
						ticks: [
							{v:0, f:'unison'},
							{v:1, f:'m2'},
							{v:2, f:'M2'},
							{v:3, f:'m3'},
							{v:4, f:'M3'},
							{v:5, f:'P4'},
							{v:6, f:'tritone'},
							{v:7, f:'P5'},
							{v:8, f:'m6'},
							{v:9, f:'M6'},
							{v:10, f:'m7'},
							{v:11, f:'M7'},
							{v:12, f:'octave'}
						],
						title: 'Musical Interval'
					},
					title: 'Pleasantness Rating',
					vAxis: {maxValue: 7, minValue: 1, title: 'Pleasantness Rating'}
				};
				chart.draw(data, options);				
			}
	
			// accordion (activate)
			jQuery(accordion).accordion({
				active: false,
				collapsible: true,
				heightStyle: 'content'
		   });
		
			// summary chart
			var data = [];
			data[0] = ['Musical Interval','Pleasantness Rating'];
			for (var a = 0; a < scale.length; a++) {
				data.push([a,scale[a]]);
			}
			console.log(data);
			var data = google.visualization.arrayToDataTable(data);
			var options = {
				chartArea: {width: '70%'},
				hAxis: {
					scaleType: scaleType,
					ticks: [
						{v:0, f:'unison'},
						{v:1, f:'m2'},
						{v:2, f:'M2'},
						{v:3, f:'m3'},
						{v:4, f:'M3'},
						{v:5, f:'P4'},
						{v:6, f:'tritone'},
						{v:7, f:'P5'},
						{v:8, f:'m6'},
						{v:9, f:'M6'},
						{v:10, f:'m7'},
						{v:11, f:'M7'},
						{v:12, f:'octave'}
					],
					title: 'Musical Interval'
				},
				title: 'Pleasantness Rating',
				vAxis: {maxValue: 7, minValue: 1, title: 'Pleasantness Rating'}
			};
			var chart = new google.visualization.ColumnChart(summary);
			chart.draw(data, options);
		},
		error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
		type: 'GET',
		url: 'version/'+version+'/php/pleasantness.php'
	});
};
Pleasantness.prototype.save = function (data) {
	let that = this;//extended scope

	// save to database
	jQuery.ajax({
		data: {
			calls : this.calls.join(','),
			ear : this.ear,
			gain : MASTERGAIN,
			intervals : this.spacings.join(','),
			notes : this.notes,
			practice: this.practice,
			responses : this.responses.join(','),
			roots : this.roots.join(','),
			spacings : this.spacings.join(','),
			subuser : subuser.ID,
			user : user.ID
		},
		error: function (jqXHR,textStatus,errorThrown) { alert(errorThrown); },
		success: function (data, status) {
			if (protocol.active) {
				protocol.IDs.push(data);
				layout.message('Pleasantness Ratings', 'Exercise complete.', ()=>{protocol.next()});
			} else {
				layout.message('Pleasantness Ratings', 'Exercise complete.', ()=>{that.results()});
			}
		},
		type: 'POST',
		url: 'version/'+version+'/php/pleasantness.php'
	});
}
Pleasantness.prototype.stimulus = function () {
	let that = this;//extended scope
	
	if ('preload' in this) {
		processor.signal(this.stimuli[this.note-33]);
		processor.signal(this.stimuli[this.note+this.interval-33]);
		
	} else {
	
		// musical note paths
		const pathstring1 = this.path+this.instrument+'_'+this.note+'.wav';
		const pathstring2 = this.path+this.instrument+'_'+String(this.note+this.interval)+'.wav';
		if(debug){console.log('\n',pathstring1,'\n',pathstring2)}
		
		// play interval
		processor.signal([pathstring1,pathstring2],0);
	}
};
Pleasantness.prototype.test = function () {
	let that = this;//extended scope
		
	// exit button
	var exit = document.getElementById('logout');
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
	const cells = this.alternatives;
	for (let a = 0; a < cells; a++) {
		
		// insert row into table
		if (a%cells == 0) {
			var row = table.insertRow(a/cells);
			row.style.height = '100%';
			row.style.width = '100%';
		}
		
		// insert cell into row
		var cell = row.insertCell(a%cells);
	
		// response buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.id = 'afc'+String(a);
		button.index = a;
		button.innerHTML = a;
		button.onclick = function(){that.response(this)};
		button.style.fontSize = '100%';
		button.style.height = '80%';
		button.style.margin = '0%';
		button.style.overflow = 'hidden';
		button.style.padding = '0%';
		button.style.width = '100%';
		button.value = 0;
		jQuery(button).button();
	
		// button in cell
		cell.appendChild(button);
		if(iOS){FastClick(button)}
	}
	
	// text container (left)
	var container = document.createElement('div');
	container.innerHTML = 'Unpleasant<br/>(Dissonant)';
	container.style.fontSize = 'larger';
	container.style.fontWeight = 'bold';
	container.style.height = '10%';
	container.style.left = '5%';
	container.style.position = 'absolute';
	container.style.top = '65%';
	container.style.width = '30%';
	main.appendChild(container);
	
	// text container (center)
	var container = container.cloneNode(true);
	container.innerHTML = 'Neutral';
	container.style.left = '35%';
	container.style.textAlign = 'center';
	main.appendChild(container);
	
	// text container (right)
	var container = container.cloneNode(true);
	container.innerHTML = 'Pleasant<br/>(Consonant)';
	container.style.left = null;
	container.style.right = '5%';
	container.style.textAlign = 'right';
	main.appendChild(container);
	
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
	message.innerHTML = 'Rate the consonance of the sound.';
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
		that.stimulus();
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
	layout.message('Pleasantness','Listen to and rate the pleasantness of each musical dyad.',{
		Start: function () {
			jQuery(this).dialog('destroy').remove();
			that.next();
		}
	});

	// preload
	this.preload();
	
	//
	if (this.volume) { gui.gain(this.volume); }
}