function crisp(settings) {
	settings = typeof settings == 'undefined' ? {} : settings;
	
	// defaults
	if (!('alternatives' in settings)) { settings.alternatives = 4; }
	if (!('speech' in settings)) { settings.speech = true; }
	if (!('trials' in settings)) { settings.trials = 1; }

	// initialize activity
	activity = new AFC(settings);

	// inialize material
	activity.material = new CRISP(settings);

	// initialize
	activity.init();
}
function CRISP(settings) {
	this.ID = 'crisp';
	this.active = [];
	this.alternatives = 4;
	this.available = [];
	this.image = [];
	this.noise = 'Off'
	this.path = 'data/crisp/calibrated/';
	this.stimuli = [];
	this.title = 'Spondee Words';
	this.titleShort = 'Spondee Words';
	this.words = [
		'AIRPLANE','BARNYARD','BASEBALL','BATHTUB','BEDROOM',
		'BIRDNEST','BIRTHDAY','BLUEJAY','COWBOY','CUPCAKE',
		'DOLLHOUSE','EYEBROW','FOOTBALL','HAIRBRUSH','HIGHCHAIR',
		'HOTDOG','ICECREAM','NECKTIE','PLAYGROUND','RAILROAD',
		'RAINBOW','SCARECROW','SHOELACE','SIDEWALK','TOOTHBRUSH'
	];

	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }

	// load images
	for (let a = 0; a < this.words.length; a++) {
		this.image[a] = document.createElement('img');
		this.image[a].src = 'data/crisp/images/' + this.words[a] + '.png';
		this.image[a].style.maxWidth = '80%';
	}
}
CRISP.prototype.lastchance = function () {
	// init
	activity.behavior = 'Constant';
	activity.chances = Infinity;
	activity.lastchance = false;
	activity.trial = -1;
	activity.trials = 1 * this.words.length;

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
		score.innerHTML = 'Score: ' + 0 + ', remaining: ' + String(activity.trials-activity.trial-1);
	}

	// next
	activity.next();
}
CRISP.prototype.preload0 = function () {
	console.log('preload')
	let that = this;

	//
	activity.ready++;

	// disable start
	jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
	jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');

	// load audio function
	let counter = 0;
	function loadAudio(a) {
		let request = new XMLHttpRequest();
		let url = that.path+that.words[a] + '.wav';
		request.index = a;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function (a) {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				if (counter == that.words.length) {
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
	for (let a = 0; a < this.words.length; a++) { loadAudio(a); }
}
CRISP.prototype.reset = function () {
	this.allImages = this.image;
	this.allWords = this.words;
}
CRISP.prototype.select = function () {
	if (this.alternatives == 25) {
		if (this.available.length == 0) {
			this.available.sequence(this.words.length);
			this.available.shuffle();
		}
		return this.available.pop();
	} else {
		return Math.floor(this.alternatives*Math.random());
	}
}
CRISP.prototype.shuffle = function (call) {
	let all = [];
	all.sequence(this.words.length);

	// available words
	if (this.available.length == 0) {
		this.available.sequence(this.words.length);
		this.available.shuffle();
	}

	//
	if (this.alternatives == 25) { this.active = all; return; }

	// select target
	let target = this.available.pop();

	// select foils
	var foils = all.slice();
	foils.remove(target);
	foils.shuffle();
	foils = foils.slice(0, this.alternatives-1);

	// afc buttons
	try {
		for (let a = 0; a < this.alternatives; a++) {
			this.active[a] = (a == call) ? target : foils.pop();
			document.getElementById('afc'+a).innerHTML = this.allWords[this.active[a]]+'<br>';
			document.getElementById('afc'+a).appendChild(this.allImages[this.active[a]]);
		}
	} catch(err){console.log(err);}}
CRISP.prototype.stimulus = function (call, init) {
	call = (typeof call !== 'undefined') ? call : 0;
	init = (typeof init !== 'undefined') ? init : true;
	if (init) { this.shuffle(call); }

	const jitter = Math.random() * activity.jitter;
	setTimeout(() => {
		processor.signal(this.path+this.words[this.active[call]]+'.mp4');
	}, jitter);
}
