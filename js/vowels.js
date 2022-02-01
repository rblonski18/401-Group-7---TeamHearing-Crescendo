function vowels(settings) {
	// defaults
	settings.speech = true;
	if (!('trials' in settings)) { settings.trials = 1; }

	// initialize activity
	activity = new AFC(settings);

	// inialize material
	activity.material = new Vowels(settings);

	// initialize
	activity.init();
}
function Vowels(settings) {
	this.ID = 'vowels';
	this.available = [];
	this.enhanced = 0;
	this.file = 0;
	this.labels = ['AE','AW','EI','EH','ER','IY','IH','OA','AH','OO','UH','UW'];
	this.material = 0;
	this.note = [];
	this.notes = ['0','1'];//notes = gender
	this.path = 'data/vowels/calibrated/';
	this.stimuli = [];
	this.title = 'Vowels';
	this.voice = [];
	this.voices = ['1','2','3','4','5'];
	this.word = [];
	this.words = [];

	// overrides
	for (let key in settings) { this[key] = settings[key]; }

	// set labels and words based on material
	this.set();
}
Vowels.prototype.lastchance = function () {
	// init
	activity.behavior = 'Constant';
	activity.chances = Infinity;
	activity.lastchance = false;
	activity.trial = -1;
	activity.trials = 5 * this.words.length;

	// chances indicator
	document.getElementById('chances').innerHTML = 'warmup over';

	// score indicator
	let score = document.getElementById('score');
	if (activity.trials < 20) {
		score.innerHTML = ' Score: ';
		for (let a = 0; a < activity.trials; a++) {
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
Vowels.prototype.preload = function () {
	var that = this;

	// set to 1
	activity.ready++;

	//const note = Math.floor(Math.random()*notes.length);

	// disable start
	jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
	jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');

	// load audio function
	var counter = 0;
	var index = 0;
	function loadAudio(gender,talker,word) {
		var request = new XMLHttpRequest();
		var url = that.path+ 'A' + that.notes[gender] + that.voices[talker] + that.labels[word] + '.wav';
		request.index = index;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function (a) {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				if (counter == (that.notes.length*that.voices.length*that.labels.length)-1) {
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
	for (var gender = 0; gender<that.notes.length; gender++) {
		for (var talker = 0; talker < that.voices.length; talker++) {
			for (var word = 0; word<that.labels.length; word++) {
				loadAudio(gender,talker,word);
				index++;
			}
		}
	}

};
Vowels.prototype.reset = function () {
	// Study with Jayaganesh Swaminathan
	switch (this.enhanced) {
		case 0: this.path = 'data/vowels/calibrated/'; break;
		case 1: this.path = 'data/vowels/enhanced/';
	}

	// Study with Einav Silverstein
	switch (this.material) {
		case 4: this.path = 'data/vocal/No Vibrato/'; break;
		case 5: this.path = 'data/vocal/Vibrato/'; break;
		default: this.path = 'data/vowels/calibrated/';
	}
	if (this.material == 4 || this.material == 5) {
		activity.message = 'Click the word that contains the vowel sound that you heard.';
		activity.startmessage = 'You will hear a vowel sound being sung. '
			+'Click the word that contains the vowel sound that you heard.';
	}

	// words = alternatives
	activity.alternatives = this.words.length;

	// use 4 repetitions of each word
	if (activity.behavior == 'Constant' && activity.trials == Infinity) {
		activity.trials = 4 * this.words.length;
	}
}
Vowels.prototype.save = function (data) {
	data.enhanced = this.enhanced;
	data.material = this.material;
	data.note = this.note.join(',');
	data.voice = this.voice.join(',');
	return data;
}
Vowels.prototype.select = function () {
	if (this.available.length == 0) {
		this.available.sequence(this.words.length);
		this.available.shuffle();
	}
	return this.available.pop();
}
Vowels.prototype.set = function () {
	switch (this.material) {
		case 0:
			this.labels = ['AE','AW','EI','EH','ER','IY','IH','OA','AH','OO','UH','UW'];
			this.words = ['had','hawd','hayd','head','heard','heed','hid','hoed','hod','hood','hud','who\'d'];
			break;
		case 1:
			this.labels = ['AW','AH','OA','UW'];
			this.words = ['hawd','hod','hoed','who\'d'];
			break;
		case 2:
			this.labels = ['AE','EH','IY','IH'];
			this.words = ['had','head','heed','hid'];
			break;
		case 3:
			this.labels = ['AW','AH','OA','UW','AE','EH','IY','IH'];
			this.words = ['hawd','hod','hoed','who\'d','had','head','heed','hid'];
			break;
		case 4: //sung vowels no vibrato
			this.labels = ['heed','head','hoed','whod','hod'];
			this.voices = ['alt','bas','sop','ten'];
			this.words = ['beet','bet','boat','boot','bot'];
			break;
		case 5: //sung vowels w/ vibrato
			this.labels = ['heed','head','hoed','whod','hod'];
			this.voices = ['alt','bas','sop','ten'];
			this.words = ['beet','bet','boat','boot','bot'];
	}
}
Vowels.prototype.settings = function (table, rowIndex){
	let that = this;

	// material set
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Material set:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select([
		'Full Set',
		'Back Vowels',
		'Front Vowels',
		'Back & Front Vowels',
		'Sung Vowels No Vibrato',
		'Sung Vowels With Vibrato'
	]);
	select.onchange = function(){
		that.material = this.selectedIndex;
		that.set();
	};
	select.selectedIndex = this.material;
	cell.appendChild(select);
	if(widgetUI){jQuery(select).selectmenu({change:select.onchange})}
	var cell = row.insertCell(2);
	cell.style.width = '20%';

	return rowIndex;
}
Vowels.prototype.stimulus = function (call, init){
	// inputs
	call = call ? call : 0,
	init = init ? init : false;

	//
	if (init || this.file == undefined) {
		const voice = Math.floor(Math.random()*this.voices.length);
		this.voice.push(voice);

		//
		let notes;
		if (this.material < 4) {
			const note = Math.floor(Math.random()*this.notes.length);
			this.note.push(note);
			this.file = note*(this.labels.length*this.voices.length) + (voice*(this.labels.length)) + call;
			console.log('note ',this.notes[note],'voice ',this.voices[voice],'call ',call,'file ',this.file);
		} else {
			switch(this.voices[voice]){
				case 'alt': notes = ['C4','C5','F4']; break;
				case 'bas': notes = ['C3','C4','F3']; break;
				case 'sop': notes = ['Dsharp4','Dsharp5','Gsharp4']; break;
				case 'ten': notes = ['Dsharp3','Dsharp4','Gsharp3'];
			}
			const note = Math.floor(Math.random()*notes.length);
			this.note.push(note);
			this.file = this.material == 4
				? this.path + this.voices[voice] + '_' + this.labels[call] + '_NV_' + notes[note] + '.wav'
				: this.path + this.voices[voice] + '_' + this.labels[call] + '_V_' + notes[note] + '.wav';
		}
	}

	// send file to processor
	processor.signal(this.stimuli[this.file]);
}
