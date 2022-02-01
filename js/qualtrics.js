function qualtrics(settings){
	activity = new Qualtrics(settings);
	
	// overrides
	for (let key in settings) { activity[key] = settings[key]; }

	// initialize
	activity.init();
}
function Qualtrics(settings){
	this.ID = 'qualtrics';
	this.call = undefined;
	this.calls = [];
	this.disabled = false;
	this.ear = undefined;
	//this.excludedFiles = ['a06','a08','a09','a14','g06','g07','g08','g09','p01','p06','p08','p13','t02','t04','t07','t10'];
	this.feedback = true;
	this.init = () => { this.test(); };
	this.mode = 1; //0 = original vieillard clips, 1 = modified clips
	this.note = 1;
	this.path = 'data/emotion/vieillard/';
	this.practice = 1;
	this.ready = 0;
	this.response = [];
	this.responses = [];
	this.roots = [];
	this.stimuli = [];
	this.title = 'Qualtrics';
	this.trial = -1;
	this.trials = 40;
	this.words = ['Completely Negative','Negative','Somewhat Negative','Neither Negative nor Positive','Somewhat Positive','Positive','Completely Positive'];
	
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
Qualtrics.prototype.instructions = function() {
	let that = this;

	//General instructions for music situation enjoyment
	message = '<b>Rate the valence, arousal, and emotion of the melody.</b>' +
	'<br><u>Valence</u> refers to the mood of the melody, which can be negative (unpleasant/bad) or positive (pleasant/good).' + 
	'<br><u>Arousal</u> refers to how exciting the melody is, which can be low (calming/relaxing) or high (exciting/stimulating)<br>' + 
	'<br>Different emotions are characterized by different levels of valence and arousal.' + 
	'<br>  - <b>Happy</b> emotions have a <u>positive valence</u> and <u>high arousal</u>.' + 
	'<br>  - <b>Sad</b> emotions have a <u>negative valence</u> and <u>low arousal</u>.' + 
	'<br>  - <b>Peaceful</b> emotions have a <u>positive valence</u> and <u>low arousal</u>.' + 
	'<br>  - <b>Scary</b> emotions have a <u>negative valence</u> and <u>high arousal</u>.<br><br>';

	// message
	layout.message('Qualtrics',message,{
		Back: function () {
			jQuery(this).dialog('destroy').remove();
		}
	});
}
Qualtrics.prototype.load = function() {
	let that = this;//extended scope

	var main = layout.main();
	currQuestionNumber = 0;
	//var surveyTable = [];

	//Create survey division
	var surveyDiv = document.createElement('div');
	surveyDiv.style.marginTop = '25px';
	surveyDiv.style.marginBottom = '25px';
	surveyDiv.className = 'ui-widget-content';
	main.appendChild(surveyDiv);
	
	//General instructions for music situation enjoyment
	surveyDiv.innerHTML = '<b>Please rate the valence, arousal, and emotion of the melody.</b><br><br>';

	// Generation of questions and answers
	possibleVals = ['Completely Negative', 'Negative', 'Somewhat Negative', 'Neither Negative nor Positive', 'Somewhat Positive', 'Positive','Completely Positive'];
	possibleVals2 = ['Very Relaxing','Relaxing','Somewhat Relaxing','Neither Relaxing nor Stimulating','Somewhat Stimulating','Stimulating','Very Stimulating'];
	possibleVals3 = ['Sad', 'Scary/Fearful', 'Peaceful', 'Happy/Joyful'];
	if (this.mode==1){
		possibleVals3 = ['Sad', 'Peaceful'];
	}

	function loadTable(tableNumber,tableName,possibleVals,surveyTable) {	
		let that = this;
		
		//Create survey table
		surveyTable.style.width = '100%';
		surveyTable.style.border = 'thin solid black';
		surveyTable.style.borderStyle = 'separate';
		surveyTable.style.borderSpacing = '0px';
		surveyTable.style.paddingTop = '10px';
		surveyTable.style.paddingBottom = '10px';
		surveyTable.style.rules = 'all';
		surveyTable.style.border
		surveyDiv.appendChild(surveyTable);
		var rowIndex = -1;
	
		//Generation of table subheading
		var row = surveyTable.insertRow(++rowIndex);
		row.style.width = '100%';
	
		//row.style.border = 'thin solid black';
	
		var cell = row.insertCell(0);
		//cell.innerHTML = '<b>Source</b>';
		cell.style.textAlign = 'center';
		cell.style.width = '20%';
		//cell.style.border = 'thick solid black';
	
		cellInd = 0;
		cellWidth = (100-40) / possibleVals.length;
	
		for(valProp of possibleVals) {
	
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			//cell.style.border = 'thick solid black';
			cell.style.textAlign = 'center';
	
			cell.innerHTML = '<b>' + valProp + '</b>';
		}
	
		//Rate the valence, arousal, or emotion
		var row = surveyTable.insertRow(++rowIndex);
		row.style.width = '100%';
	
		row.style.border = 'thin solid black';
	
		currQuestionNumber++;
	
		var cell = row.insertCell(0);
		cell.innerHTML = tableName;
		cell.style.textAlign = 'left';
		cell.style.width = '20%';
		//cell.style.border = 'thin solid black';
	
		cellInd = 0;
		cellWidth = (100-20) / possibleVals.length;
	
		//
		for(val=0; val<possibleVals.length; val++) {
	
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			cell.style.border = 'thin solid black';
			cell.style.textAlign = 'center';
	
			var radiotest = document.createElement('input');
			radiotest.name=currQuestionNumber-1;
			radiotest.type='radio';
			radiotest.style.display = 'inline-block';
			radiotest.value=val;
	
			radiotest.onchange = function () {
				activity.response[this.name] = Number(this.value);
				console.log(activity.response);
				if ((activity.response[0]!==undefined)&&(activity.response[1]!==undefined)&&(activity.response[2]!==undefined)){
					jQuery(nextButton).button('option','disabled',false);
				}
			};
	
			cell.appendChild(radiotest);
		}
	}
	
	var surveyTable1 = document.createElement('table');
	var surveyTable2 = document.createElement('table');
	var surveyTable3 = document.createElement('table');


	loadTable(0,'Valence',possibleVals,surveyTable1);
	loadTable(1,'Arousal',possibleVals2,surveyTable2);
	loadTable(2,'Emotion',possibleVals3,surveyTable3);


	// repeat button
	var button = document.createElement('button');
	button.id = 'repeat';
	button.innerHTML = 'repeat';
	button.onclick = ()=>{
		if(typeof source!=='undefined'){source.stop()}
		that.stimulus()
	};
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.height = '15%';
	button.style.marginLeft = '8px';
	button.style.width = '20%';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	main.appendChild(button);

	// instructions button
	var button = document.createElement('button');
	button.id = 'instructions';
	button.innerHTML = 'instructions';
	button.onclick = ()=>{that.instructions()};
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.height = '15%';
	button.style.marginLeft = '8px';
	button.style.width = '20%';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	main.appendChild(button);

	//next button
	var nextButton = document.createElement('button');
	nextButton.id = 'next';
	nextButton.innerHTML = 'next';
	nextButton.onclick = ()=>{
		surveyTable1.style.display = 'none';
		that.load();
		that.next();
	};
	nextButton.style.cssFloat = 'right';
	nextButton.style.display = 'inline';
	nextButton.style.height = '15%';
	nextButton.style.marginLeft = '8px';
	nextButton.style.width = '20%';
	jQuery(nextButton).button();
	if(iOS){FastClick(nextButton)}
	main.appendChild(nextButton);
	jQuery(nextButton).button('option','disabled',true);


}

Qualtrics.prototype.menu = function () {	
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
Qualtrics.prototype.next = function(){
	let that = this;//extended scope

	// increment trial
	this.trial++;
	//score.innerHTML = 'Trials remaining: '+String(this.trials-this.trial-1);
	
	// end run
	if (this.trial == this.trials) { 
		this.responses.push(this.response);
		this.save(); 
		return; 
	}
	
	/*
	// enable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('enable'); }
	this.disabled = false;
	*/

	// roving
	this.note = Math.floor(this.stimuli.length*Math.random());
	while (this.roots.includes(this.note)) {
		this.note = Math.floor(this.stimuli.length*Math.random());
	}
	this.roots.push(this.note);
	if (this.response.length!==0) {
		this.responses.push(this.response);
		console.log('responses: ',this.responses);
		this.response = [];
	}

	// stimulus
	if(typeof source!=='undefined'){source.stop()}
	setTimeout(()=>{this.stimulus()},1e3);

	let noteEmotion = '';
	if (this.mode==1){
		if (this.note<10) {
			noteEmotion = 'peaceful-modified';
		} else if (this.note<20) {
			noteEmotion = 'peaceful';
		} else if (this.note <30) {
			noteEmotion = 'sad-modified';
		} else {
			noteEmotion = 'sad';
		}
	} else if (this.mode==0){
		if (this.note<10) {
			noteEmotion = 'peaceful';
		} else if (this.note<20) {
			noteEmotion = 'happy';
		} else if (this.note <30) {
			noteEmotion = 'scary';
		} else {
			noteEmotion = 'sad';
		}
	}
	
	
	console.log('note = ',this.note, 'emotion = ', noteEmotion);
	console.log('list of notes = ',this.roots);
	score.innerHTML = 'Remaining trials: '+String(this.trials-this.trial-1);
}
Qualtrics.prototype.preload = function () {
	var that = this;
	
	// set to 1
	activity.ready++;
	
	// disable start
	jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
	jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');
		
	// load audio function
	var adjust = ['_adjusted.wav','.wav'];
	var counter = 0;
	var emotion = ['a','g','p','t'];
	var emotion2 = ['Peaceful','Sad'];
	var excludedFiles = ['a06','a08','a09','a14','g06','g07','g08','g09','p01','p06','p08','p13','t02','t04','t07','t10'];
	var excludedFiles2 = ['Peaceful01_adjusted.wav','Peaceful01.wav','Peaceful03_adjusted.wav','Peaceful03.wav','Peaceful06_adjusted.wav','Peaceful06.wav','Peaceful14_adjusted.wav','Peaceful14.wav','Sad01_adjusted.wav','Sad01.wav','Sad04_adjusted.wav','Sad04.wav','Sad07_adjusted.wav','Sad07.wav','Sad11_adjusted.wav','Sad11.wav'];
	var filenumber = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14'];
	var index = 0;
	function loadAudio(a,b,c) {
		var request = new XMLHttpRequest();
		if (that.mode==0){
			var url = that.path+emotion[a]+filenumber[b]+'.mp3';
		} else if (that.mode==1) {
			var url = that.path+emotion2[a]+filenumber[c]+adjust[b];
			console.log(url)
		}
		request.index = index;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function () {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				if (counter == 40) {
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
	if (that.mode==0) {
		for (var a = 0; a < emotion.length; a++) { 
			for (var b = 0; b<filenumber.length; b++) {
				if (!excludedFiles.includes(emotion[a]+filenumber[b])) {
					loadAudio(a,b);
					index++;
				}
			} 
		}
	} else if (that.mode == 1) {
		for (var a = 0; a < emotion2.length; a++) { 
			for (var b = 0; b<adjust.length; b++) {
				for (var c = 0; c<filenumber.length; c++) {
					if (!excludedFiles2.includes(emotion2[a]+filenumber[c]+adjust[b])) {
						loadAudio(a,b,c);
						index++;
					}
				}
			} 
		} 
	}


};
Qualtrics.prototype.response = function(button){
	if(this.disabled){return}
}
Qualtrics.prototype.results = function(){
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
		url: 'version/'+version+'/php/qualtrics.php'
	});
};
Qualtrics.prototype.save = function(data){
	// save to database
	jQuery.ajax({
		data: {
			calls: this.calls.join(','),
			ear: this.ear,
			gain: MASTERGAIN,
			mode: this.mode,
			notes: this.notes,
			practice: this.practice,
			responses: this.responses.join(';'),
			roots: this.roots.join(','),
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
		url: 'version/'+version+'/php/qualtrics.php'
	});
}
Qualtrics.prototype.settings = function(){
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
	var select = layout.select(['Original Clips','Modified Clips']);
	select.onchange = function () { 
		that.mode = this.value == 'Modified Clips'; 
	};
	select.value = this.mode ? 'Modified Clips' : 'Original Clips';
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
		console.log(this.value);
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
Qualtrics.prototype.stimulus = function(){	
	let that = this;

	// play interval
	console.log(this.note);
	processor.signal(this.stimuli[this.note]);
};
Qualtrics.prototype.test = function(){
	let that = this;//extended scope
		
	// reset
	this.call = undefined;
	this.calls = [];
	this.interval = undefined;
	this.response = [];
	this.responses = [];
	this.roots = [];
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
			score.innerHTML = 'Remaining trials: '+String(this.trials-this.trial-1);
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
	const message = '<b>Rate the valence, arousal, and emotion of the melody.</b>' +
	'<br><u>Valence</u> refers to the mood of the melody, which can be negative (unpleasant/bad) or positive (pleasant/good).' + 
	'<br><u>Arousal</u> refers to how exciting the melody is, which can be low (calming/relaxing) or high (exciting/stimulating)<br>' + 
	'<br>Different emotions are characterized by different levels of valence and arousal.' + 
	'<br>  - <b>Happy</b> emotions have a <u>positive valence</u> and <u>high arousal</u>.' + 
	'<br>  - <b>Sad</b> emotions have a <u>negative valence</u> and <u>low arousal</u>.' + 
	'<br>  - <b>Peaceful</b> emotions have a <u>positive valence</u> and <u>low arousal</u>.' + 
	'<br>  - <b>Scary</b> emotions have a <u>negative valence</u> and <u>high arousal</u>.<br><br>';
	layout.message('Qualtrics',message,{
		Start: function () {
			jQuery(this).dialog('destroy').remove();
			that.next();
		}
	});

	// volume
	if (this.volume) {
		gui.gain();
	}
	
	//preload
	activity.preload();

	//load 
	activity.load();
}