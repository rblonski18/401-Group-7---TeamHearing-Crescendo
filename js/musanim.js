function musanim(settings) {
	activity = new AFC({
		alternatives: 9,
		behavior: 'Constant',
		chances: Infinity,
		material: new Musanim(settings),
		message: 'Which pattern did you hear?',
		trials: 18
	});

	// overrides
	for (let key in settings) { if (key in activity) { activity[key] = settings[key]; } }

	// initialize
	activity.init();
}
function Musanim(settings) {
	this.ID = 'musanim';
	this.available = [];
	this.back = () => {};
	this.directory = 'video clips';
	this.duration = 500;
	this.filetype = '.mp4';
	this.frequency = 220;
	this.instrument = 'piano';
	this.path = 'data/musanim/';
	this.random = false;
	this.spacing = 4;
	this.startmessage = 'Good luck!';
	this.title = 'Melodic Contour';
	this.titleShort = 'MCI';
	this.values = [];
	this.words = [
		'Rising','Rising-Flat','Rising-Falling',
		'Flat-Rising','Flat','Flat-Falling',
		'Falling-Rising','Falling-Flat','Falling'
	];

	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }

	// preload MCI images
	preload([
		'musanim/MCI Piano/spacing 1 pattern 1.png',
		'musanim/MCI Piano/spacing 1 pattern 2.png',
		'musanim/MCI Piano/spacing 1 pattern 3.png',
		'musanim/MCI Piano/spacing 1 pattern 4.png',
		'musanim/MCI Piano/spacing 1 pattern 5.png',
		'musanim/MCI Piano/spacing 1 pattern 6.png',
		'musanim/MCI Piano/spacing 1 pattern 7.png',
		'musanim/MCI Piano/spacing 1 pattern 8.png',
		'musanim/MCI Piano/spacing 1 pattern 9.png',
		'musanim/MCI Piano/spacing 2 pattern 1.png',
		'musanim/MCI Piano/spacing 2 pattern 2.png',
		'musanim/MCI Piano/spacing 2 pattern 3.png',
		'musanim/MCI Piano/spacing 2 pattern 4.png',
		'musanim/MCI Piano/spacing 2 pattern 5.png',
		'musanim/MCI Piano/spacing 2 pattern 6.png',
		'musanim/MCI Piano/spacing 2 pattern 7.png',
		'musanim/MCI Piano/spacing 2 pattern 8.png',
		'musanim/MCI Piano/spacing 2 pattern 9.png',
		'musanim/MCI Piano/spacing 4 pattern 1.png',
		'musanim/MCI Piano/spacing 4 pattern 2.png',
		'musanim/MCI Piano/spacing 4 pattern 3.png',
		'musanim/MCI Piano/spacing 4 pattern 4.png',
		'musanim/MCI Piano/spacing 4 pattern 5.png',
		'musanim/MCI Piano/spacing 4 pattern 6.png',
		'musanim/MCI Piano/spacing 4 pattern 7.png',
		'musanim/MCI Piano/spacing 4 pattern 8.png',
		'musanim/MCI Piano/spacing 4 pattern 9.png'
	], 'data');
}
Musanim.prototype.adaptive = function () {
	if (typeof this.spacing == 'object') {
		this.spacing.logic(activity.correct);

		// message depends on activity
		document.getElementById('adaptive').innerHTML = this.spacing == 1
			? 'Spacing: '+this.spacing+' semitone'
			: 'Spacing: '+this.spacing+' semitones';
	}
}
Musanim.prototype.images = function () {
	const spacing = typeof this.spacing == 'object' ? 4 : this.spacing;
	let img = document.createElement('img');
	img.style.height = 0.6 * document.getElementById('afc0').clientHeight + 'px';
	for (let a = 0, length = this.words.length; a < length; a++) {
		img = img.cloneNode();
		img.src = 'data/musanim/MCI Piano/spacing ' + spacing + ' pattern ' + String(a+1) + '.png';
		document.getElementById('afc'+a).style.fontSize = '80%';
		document.getElementById('afc'+a).appendChild(img);
	}
};
Musanim.prototype.layout = function () {
	if (!this.spacing) { this.random = true; this.spacing = [4].shuffle().pop(); }

	// header
	layout.header();

	// main
	let main = layout.main();

	// container
	let container = document.createElement('div');
	container.className = 'ui-widget-content';
	container.style.position = 'absolute';
	container.style.top = '5%';
	container.style.height = '70%';
	container.style.width = '90%';
	container.style.left = '5%';
	main.appendChild(container);

	// video
	const spacing = this.spacing ? this.spacing : 4;
	let video = document.createElement('video');
	video.controls = true;
	video.id = 'video0';
	video.src = 'data/musanim/MCI Piano/spacing '+this.spacing+' all.mp4';
	video.style.position = 'absolute';
	video.style.height = '96%';
	video.style.width = '96%';
	video.style.left = '2%';
	video.style.top = '2%';
	video.style.display = 'none';
	container.appendChild(video);

	// controls
	let controls = document.createElement('div');
	controls.className = 'ui-widget-content';
	controls.style.position = 'absolute';
	controls.style.bottom = '5%';
	controls.style.height = '15%';
	controls.style.width = '90%';
	controls.style.left = '5%';
	controls.style.padding = '8px';
	main.appendChild(controls);

	// message
	let message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Press the \"Test\" button when ready.';
	message.style.display = 'inline-block';
	message.style.fontSize = '120%';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	controls.appendChild(message);

	// test
	let test = document.createElement('button');
	test.innerHTML = 'Test';
	test.onclick = () => { activity.test(); };
	test.style.fontSize = '150%';
	test.style.height = '100%';
	jQuery(test).css('float','right');
	jQuery(test).button();
	controls.appendChild(test);

	// footer
	let footer = layout.footer();

	// exit button
	let exit = document.createElement('img');
	exit.onclick = function(){layout.trainingPitch();};
	exit.src = 'images/exit.png';
	exit.style.height = '100%';
	exit.style.position = 'absolute';
	exit.style.right = '1%';
	exit.style.top = '1%';
	footer.appendChild(exit);

	// start dialog
	let dialog = document.createElement('div');
	dialog.id = 'dialog';
	dialog.innerHTML = 'Practice listening to the note patterns.<br><br>'
		+'Press the "\Test\" button when you are ready.<br>';
	dialog.style.fontSize = 'larger';
	dialog.style.textAlign = 'center';
	dialog.style.zscore = 100;
	dialog.title = 'Melodic Contour';
	document.body.appendChild(dialog);
	jQuery(dialog).dialog({
		buttons: {
			Start: function(){
				jQuery(this).dialog('destroy').remove();
				video = document.getElementById('video0');
				video.style.display = '';
				video.play();
			},
		},
		modal: true,
		resizable: false,
		width: 0.6*jQuery(window).width()
	});
};
Musanim.prototype.message = function (result) {
	let entry = result ? result.entry : '',
		frequency = result ? result.frequency ? result.frequency : this.frequency : this.frequency,
		score = result ? result.score : percentCorrect(activity.calls,activity.responses).toPrecision(4),
		spacing = result ? result.spacing : this.spacing,
		unit = this.spacing == 1 ? 'semitone' : 'semitones';
	return entry+' Melodic Contour ('+frequency+' Hz, '+spacing+' '+unit+'): '+score+'%';
};
Musanim.prototype.next = function () {
	this.values.push(this.spacing);
	if (this.random) {
		this.spacing = [1,2,4].shuffle().pop();
		document.getElementById('adaptive').innerHTML = this.spacing == 1
			? 'Spacing: ' + this.spacing + ' semitone'
			: 'Spacing: ' + this.spacing + ' semitones';
		}
}
Musanim.prototype.protocols = function (options,callbacks,messages) {
	// menu options
	options.push(
		'MCI at 4, 2, and 1 semitone spacing'
	);
	callbacks.push(
		function () {
			var spacings = [4,2,1];
			protocol.activity = 'musanim';
			protocol.random = false;
			protocol.settings = [];
			for (var a = 0; a < spacings.length; a++) {
				protocol.settings[a] = {
					material: new Musanim({spacing:spacings[a]}),
				};
			}
			protocol.start();
		}
	);
	messages.push('');
	return [options,callbacks,messages];
};
Musanim.prototype.reset = function () {
	this.values = [];
}
Musanim.prototype.results = function (data) {
	console.dir(data);
	// main
	var main = document.getElementById('main'),
		span = document.getElementById('loading'),

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
	main.insertAdjacentHTML('beforeend','<h3>Details</h3>');

	// horizontal rule
	main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');

	// accordion (init)
	var accordion = document.createElement('div');
	accordion.id = 'results';
	main.appendChild(accordion);

	// accordion (content)
	for (var b = 0; b < results.length; b++) {
		var result = results[b];

		// score
		var score;
		try {
			score = percentCorrect(result.calls.split(','),result.responses.split(','));
			score = Number(score.toFixed(1));
		} catch (err) {
			console.dir(err);
		}

		// heading
		var heading = document.createElement('h3');
		heading.innerHTML = this.message(result);
		accordion.appendChild(heading);

		// container
		var container = document.createElement('div');
		accordion.appendChild(container);

		// information
		for (var key in result) {
			container.insertAdjacentHTML('beforeend',key+': '+result[key]+'<br>');
		}
		container.setAttribute('unselectable','off');

		// sort results for summary plot
		resultsSorted.push([result.spacing, score]);
	}

	// accordion (activate)
	jQuery(accordion).accordion({
		active: false,
		collapsible: true,
		heightStyle: 'content'
   });

   //
   resultsSorted.reverse();
   this.summaryChart(resultsSorted,summary);
}
Musanim.prototype.save = function (data) {
	data.frequency = this.frequency;
	data.spacing = this.spacing;
	console.log(this.values)
	data.spacings = this.values.join(',');
	return data;
}
Musanim.prototype.select = function (index) {
	if (this.available.length == 0) {
		this.available.sequence(this.words.length);
		this.available.shuffle();
	}
	return this.available.pop();
};
Musanim.prototype.settings = function (table, rowIndex) {
	let that = this;

	// musical instrument
	if(false){
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Musical instrument:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = document.createElement('select');
	select.style.fontSize = '100%';
	select.onchange = function(){that.instrument = this.value;};
	select.style.width = '100%';
	options = ['piano'];
	for (var a = 0, items = options.length; a < items; a++) {
		var option = document.createElement('option');
		option.innerHTML = options[a];
		option.value = options[a];
		select.appendChild(option);
	}
	select.value = this.instrument;
	cell.appendChild(select);
	var cell = row.insertCell(2);
	cell.style.width = '20%';}

	// note duration
	if(false){
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Note duration:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = document.createElement('select');
	select.style.fontSize = '100%';
	select.onchange = function(){that.duration = this.value;};
	select.style.width = '100%';
	options = [250,500];
	for (var a = 0, items = options.length; a < items; a++) {
		var option = document.createElement('option');
		option.innerHTML = options[a];
		option.value = options[a];
		select.appendChild(option);
	}
	select.value = this.duration;
	cell.appendChild(select);
	var cell = row.insertCell(2);
	cell.innerHTML = 'ms';
	cell.style.width = '20%';}

	// note frequency
	if(false){
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Note frequency:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = document.createElement('select');
	select.style.fontSize = '100%';
	select.onchange = function(){that.frequency = Number(this.value);};
	select.style.width = '100%';
	options = [220];
	for (var a = 0, items = options.length; a < items; a++) {
		var option = document.createElement('option');
		option.innerHTML = options[a];
		option.value = options[a];
		select.appendChild(option);
	}
	select.value = this.frequency;
	cell.appendChild(select);
	var cell = row.insertCell(2);
	cell.innerHTML = 'Hz';
	cell.style.width = '20%';}

	// note spacing
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Note spacing:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select([1,2,4,'Variable']);
	select.onchange = function () {
		that.spacing = Number(this.value);
		if (that.spacing) { that.random = false; } else { that.random = true; }
		console.log(that.spacing,that.random)
	};
	select.value = that.random ? 'Variable' : that.spacing;
	cell.appendChild(select);
	if (widgetUI) { jQuery(select).selectmenu({ change: select.onchange }); }
	var cell = row.insertCell(2);
	cell.innerHTML = 'semitones';
	cell.style.width = '20%';

	return rowIndex;
};
Musanim.prototype.stimulus = function (call, init) {
	var call = call ? call : 0;

	// send audio file to processor
	with(this){
		const file = path+directory+'/'+instrument+'_'+duration+'_'+frequency+'_'+spacing+'_'+String(call+1)+'.mp4';
		processor.signal(file);
	}
}
Musanim.prototype.summaryChart = function (resultsSorted,summary) {
	console.dir(resultsSorted);
	var data = [];
	data[0] = ['SNR',this.title];
	for (var a = 0; a < resultsSorted.length; a++) {
		data.push(resultsSorted[a]);
	}
	var data = google.visualization.arrayToDataTable(data);
	var options = {
		chartArea: {width: '70%'},
		title: this.title,
		vAxis: {maxValue: 100, minValue: 0, title: 'Percent Correct'}
	};
	var chart = new google.visualization.ScatterChart(summary);
	chart.draw(data, options);
}
Musanim.prototype.variable = function () {
	return this.spacing == 1 ? 'Spacing: '+this.spacing+' semitone' : 'Spacing: '+this.spacing+' semitones';

};
