function consonants(settings) {
	// defaults
	settings.speech = true;
	if (!('trials' in settings)) { settings.trials = 1; }

	// initialize activity
	activity = new AFC(settings);

	// inialize material
	activity.material = new Consonants(settings);

	// initialize
	activity.init();
}
function Consonants(settings) {
	this.ID = 'consonants';
	this.available = [];
	this.enhanced = 0;
	this.file = undefined;
	this.gender = 0;
	this.genders = ['M','W'];
	this.genderTrack = [];
	this.material = 0;
	this.path = 'data/consonants/calibrated/';
	this.stimuli = [];
	this.talker = 0;
	this.talkers = ['1','2','3','4','5'];
	this.talkerTrack = [];
	this.title = 'Consonants';
	this.titleShort = 'Consonants';
	this.word = [];
	this.words = [];

	// overrides
	for (var key in settings) { this[key] = settings[key]; }

	// material sets
	this.set();
}
Consonants.prototype.lastchance = function () {
	// init
	activity.behavior = 'Constant';
	activity.chances = Infinity;
	activity.lastchance = false;
	activity.trial = -1;
	activity.trials = 4 * this.words.length;

	// shuffle deck
	this.available.sequence(this.words.length);
	this.available.shuffle();

	// chances indicator
	document.getElementById('chances').innerHTML = 'warmup over';

	// score indicator
	var score = document.getElementById('score');
	if (activity.trials < 20) {
		score.innerHTML = ' Score: ';
		for (var a = 0; a < activity.trials; a++) {
			var img = document.createElement('img');
			img.id = 'score'+a;
			img.src = 'images/score-nan.png';
			jQuery(img).addClass('score');
			score.appendChild(img);
		}
	} else {
		score.innerHTML = 'Score: '+0+', remaining: '+String(activity.trials-activity.trial-1);
	}

	// next
	activity.next();
}
Consonants.prototype.next = function () {
	this.gender = Math.floor(this.genders.length*Math.random());
	//this.gender = this.genders[gender];
	this.genderTrack.push(this.gender);
	this.talker = Math.floor(this.talkers.length*Math.random());
	//this.talker = this.talkers[talker];
	this.talkerTrack.push(this.talkers[this.talker]);
}
Consonants.prototype.preload = function () {
	var that = this;

	// set to 1
	activity.ready++;

	// disable start
	jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
	jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');

	// load audio function
	var counter = 0;
	var index = 0;
	function loadAudio(gender,talker,word) {
		var request = new XMLHttpRequest();
		var url = that.path+that.genders[gender]+that.talkers[talker]+that.words[word]+'7M.wav';
		request.index = index;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function (a) {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				if (counter == (that.genders.length*that.talkers.length*that.words.length)-1) {
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
	for (var gender = 0; gender<that.genders.length; gender++) {
		for (var talker = 0; talker < that.talkers.length; talker++) {
			for (var word = 0; word<that.words.length; word++) {
				loadAudio(gender,talker,word);
				index++;
			}
		}
	}

};
Consonants.prototype.reset = function () {
	switch (this.enhanced) {
		case 0: this.path = 'data/consonants/calibrated/'; break;
		case 1: this.path = 'data/consonants/enhanced/';
	}

	activity.alternatives = this.words.length;
	if (activity.behavior == 'Constant' && activity.trials == Infinity) {
		var reps = debug ? 1 : 4;
		activity.trials = reps * this.words.length;
	}
}
Consonants.prototype.save = function (data) {
	data.enhanced = this.enhanced;
	data.gender = this.genderTrack.join(',');
	data.material = this.material;
	data.talker = this.talkerTrack.join(',');
	return data;
}
Consonants.prototype.select = function () {
	if (this.available.length == 0) {
		this.available.sequence(this.words.length);
		this.available.shuffle();
	}
	return this.available.pop();
}
Consonants.prototype.set = function () {
	switch (this.material) {
		case 0:
			this.labels = ['ABA','ACHA','ADA','AFA','AGA','AJA','AKA','ALA','AMA','ANA','APA','ARA','ASA','ASHA','ATA','ADHA','AVA','AWA','AYA','AZA'];
			this.words = ['ABA','ACHA','ADA','AFA','AGA','AJA','AKA','ALA','AMA','ANA','APA','ARA','ASA','ASHA','ATA','ATHA','AVA','AWA','AYA','AZA'];
			break;
		case 1:
			this.labels = ['ACHA','AFA','AJA','ASA','ASHA','ADHA','AVA','AZA'];
			this.words = ['ACHA','AFA','AJA','ASA','ASHA','ATHA','AVA','AZA'];
			break;
		case 2:
			this.labels = ['ALA','AMA','ANA','ARA','AWA','AYA'];
			this.words = ['ALA','AMA','ANA','ARA','AWA','AYA'];
			break;
		case 3:
			this.labels = ['ABA','ADA','AGA','APA','ATA','AKA'];
			this.words = ['ABA','ADA','AGA','APA','ATA','AKA'];
	}

}
Consonants.prototype.settings = function (table, rowIndex) {
	var that = this;

	// material group
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Material group:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select([
		'Full Set',
		'Fricatives',
		'Sonorants',
		'Stop Consonants'
	]);
	select.onchange = function () {
		that.material = this.selectedIndex;
		that.set();
	};
	select.selectedIndex = this.material;
	cell.appendChild(select);
	if (widgetUI) { jQuery(select).selectmenu({change:select.onchange}); }
	var cell = row.insertCell(2);
	cell.style.width = '20%';

	return rowIndex;
}
Consonants.prototype.stimulus = function (call, init) {
	// inputs
	call = call ? call : 0,
	init = init ? init : false;

	//
	if (init || this.file == undefined) {
		//
		this.gender = Math.floor(this.genders.length*Math.random());
		this.talker = Math.floor(this.talkers.length*Math.random());

		//
		this.file = this.gender*(this.words.length*this.talkers.length) + (this.talker*(this.words.length)) + call;
	}

	if (debug) {
		console.log('gender ',this.genders[this.gender],'talker ',this.talkers[this.talker],'call ',call,'file ',this.file);
	}


	// send file to processor
	processor.signal(this.stimuli[this.file]);
}
