function lateralization(settings) {
	activity = new AFC({
		chances: 4,
		material: new Lateralization(settings),
		message: 'Did the sound move to the left or to the right?',
		options: { speech: false },
		practice: false,
		trials: Infinity
	});

	// overrides
	for (let key in settings) { if (key in activity) { activity[key] = settings[key]; } }

	// initialize
	activity.init();
}
function Lateralization (settings) {
	this.ID = 'lateralization';
	this.difference = new Adaptive({
		rule: 'linear',
		step0: 1,
		stepMin: 1,
		value0: 7,
		valueMax: 7,
		valueMin: 0
	});
	this.difference.reset();
	this.files = ['n1','1','2','3','4','5','6','7'];
	this.mode = 'combined';//combined|level|time, only 'combined' working
	this.path = '/data/lateralization/';
	this.sound = 0;
	this.sounds = ['addingmachine','airplane','auto','auto2','bicycle','birdwings','boat','bongo','bongoslide','cart','chisel','clave','cricket','dog','fly','heartbeat','helicopter','knifesharpen','manhumming','mosquito','motorcycle','oxcart','radio','tap','train'];
	this.startmessage = 'Listen for which way the sound moves.';
	this.stimuli = [];
	this.title = 'Sound Movement';
	this.words = ['Left','Right'];

	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }
}
Lateralization.prototype.next = function () {
	this.difference.logic(activity.correct);
	this.sound = Math.floor(this.sounds.length*Math.random());
	document.getElementById('adaptive').innerHTML = 'File: ' + this.files[this.difference.value];
};
Lateralization.prototype.preload = function() {
	let that = this;

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

	// I forget what this does
	activity.ready++;

	//
	let counter = 0;
	const direction = ['L','R'];

	// load audio function
	function loadAudio(a,b,c,i) {
		let request = new XMLHttpRequest();
		let url = that.path + that.sounds[a] + '/' + that.sounds[a] + '_' + direction[b] + '_' + that.files[c] + '.wav';
		request.index = i;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function (a) {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				if (counter == that.words.length) {
					activity.ready--;
					if (activity.ready == 0) {
						jQuery(".ui-dialog-buttonpane button:contains('Okay')").button('enable');
					}
				}
			});
		};
		request.send();
	}

	// load audio
	let i = 0;
	for (let a = 0; a < this.sounds.length; a++) {
		for (let b = 0; b < this.words.length; b++) {
			for (let c = 0; c < this.files.length; c++) {
				loadAudio(a,b,c,i++);
			}
		}
	}
};
Lateralization.prototype.reset = function () {
	this.difference.reset();
};
Lateralization.prototype.results = function () {
	let that = this;

	// main
	let main = layout.main();

	// main heading
	let heading = document.createElement('h1');
	heading.style.display = 'inline-block';
	heading.style.height = '10%';
	heading.style.width = '100%';
	main.appendChild(heading);

	// back button
	let back = layout.backbutton(function(){activity.menu()});
	heading.appendChild(back);

	// title
	var span = document.createElement('span');
	span.innerHTML = 'Results';
	heading.appendChild(span);

	// horizontal rule
	main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');

	// footer
	layout.footer();

	// loading...
	var span = document.createElement('span');
	span.id = 'loading';
	span.innerHTML = 'Loading...';
	main.appendChild(span);

	// display results
	setTimeout(function () {
		document.getElementById('main').removeChild(document.getElementById('loading'));

		// database GET
		jQuery.ajax({
			async: false,
			data: {
				password: user.password,
				subuser: subuser.ID,
				user: user.ID
			},
			error: function (jqXHR, textStatus, errorThrown) {
				var dialog = document.createElement('div');
				dialog.id = 'dialog';
				dialog.innerHTML = errorThrown;
				dialog.style.fontSize = 'larger';
				dialog.style.textAlign = 'center';
				dialog.title = 'Error';
				document.body.appendChild(dialog);
				$(dialog).dialog({
					buttons: {
						Okay: function () {
							$(this).dialog('destroy').remove();
						},
					},
					modal: true,
					resizable: false,
					width: 0.4 * $(window).width()
				});
			},
			success: function(data, status) {
				results = jQuery.parseJSON(data);
				results.sort(compare);
			},
			type: 'GET',
			url: '/version/'+version+'/php/lateralization.php'
		});

		// no results
		if (results.length == 0) {
			main.insertAdjacentHTML('beforeend', 'No results.');
			return;
		}

		// progress chart
		var progress = []; progress[0] = ['Scores','All Tests'];
		var progressChart = document.createElement('div');
		progressChart.style.height = '50%';
		main.appendChild(progressChart);

		// summary chart
		var summary = [];
		summary[0] = ['Scores','Frequency'];
		var summaryChart = document.createElement('div');
		summaryChart.style.height = '50%';
		main.appendChild(summaryChart);

		// for progress and summary charts, analyze in chonilogical order
		for (var a = 0; a < results.length; a++) {
			var result = results[a];

			// sort results for progress chart
			progress.push([progress.length, Number(result.score)]);

			// sort results for summary plot
			summary.push([1, Number(result.score)]);
		}

		// details
		main.insertAdjacentHTML('beforeend','<h3>Details</h3>');

		// horizontal rule
		main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');

		// accordion
		var accordion = document.createElement('div');
		accordion.id = 'results';
		main.appendChild(accordion);

		// reverse chronilogical order for accordions
		results.reverse();

		// content
		for (var a = 0; a < results.length; a++) {
			var result = results[a];

			// heading
			var heading = document.createElement('h3');
			heading.innerHTML = result.entry+' &rarr; '+Number(result.score).toFixed(0)+' file index';
			accordion.appendChild(heading);

			// container
			var container = document.createElement('div');
			accordion.appendChild(container);

			// information
			for (var key in result) {
				container.insertAdjacentHTML('beforeend',key+': '+result[key]+'<br>');
			}
			container.setAttribute('unselectable','off');

			// adaptive track
			var chart_div = document.createElement('div');
			chart_div.style.width = '80%';
			container.appendChild(chart_div);

			// data
			var data = [];
			data[0] = ['Trial','Difference'];
			var series = result.series.split(',');
			for (var trial = 1; trial <= series.length; trial++) {
				data[trial] = [trial, Number(series[trial-1])];
			}

			// adaptive track
			var chart = new google.visualization.LineChart(chart_div);
			var data = google.visualization.arrayToDataTable(data);
			var options = {
				chartArea: {height: '50%', width: '70%'},
				hAxis: {title: 'Trial'},
				title: 'Adaptive Track',
				vAxis: {maxValue: 10, minValue: 1, title: 'Discrimination Threshold'}
			};
			chart.draw(data, options);
		}

		// accordion
		$(accordion).accordion({
			active: false,
			collapsible: true,
			heightStyle: 'content'
	   });

		// progress chart
		var data = google.visualization.arrayToDataTable(progress);
		var options = {
			chartArea: {width: '70%'},
			hAxis: {title: 'Run'},
			title: 'Progress over time',
			vAxis: {maxValue: 10, minValue: 1, title: 'Discrimination Threshold'}
		};
		var chart = new google.visualization.LineChart(progressChart);
		chart.draw(data, options);

		// summary chart
		var data = google.visualization.arrayToDataTable(summary);
		var options = {
			chartArea: {width: '70%'},
			hAxis: {maxValue: 1.5, minValue: 0.5, ticks: [1], title: 'All Tests'},
			title: 'Lateralization Discrimination',
			vAxis: {maxValue: 10, minValue: 1, title: 'Discrimination Threshold'}
		};
		var chart = new google.visualization.ScatterChart(summaryChart);
		chart.draw(data, options);
	}, 50);
};
Lateralization.prototype.save = function (data) {
	data.adaptive = this.difference.value;
	data.series = this.difference.history.join(',');
	return data
}
Lateralization.prototype.stimulus = function (call) {
	call = call ? call : 0;

	// started coding mode switch for controlling ILD and ITD separately, haven't finished
	switch (this.mode) {
		case 'combined':
			// side of sound movement
			let index = (this.files.length*this.words.length*this.sound)+(this.files.length*call)+this.difference.value;
			while ((this.sound==17 && call==0 && this.difference.value==7) || (this.sound==19 && call==0 && this.difference.value==2) || (this.sound==22 && call==1 && this.difference.value==2)){
				this.sound = Math.floor(this.sounds.length*Math.random());
				let index = (this.files.length*this.words.length*this.sound)+(this.files.length*call)+this.difference.value;
			};
			var source = this.stimuli[index];

			//var source = this.path + this.sound + '/' + this.sound + '_'  + ['L','R'][call] + '_' + this.files[this.difference.value] + '.wav';
			break;
		default:
			this.path = '/data/lateralization/monaural/';
			this.sound = 'airplane';
			var source = this.path + this.sound + '.wav';
	}

	//
	processor.signal(source);
};
