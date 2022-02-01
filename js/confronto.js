function confronto(settings) {
	activity = new AFC({
		behavior: 'Constant',
		chances: Infinity,
		material: new Confronto(settings),
		message: 'Are the melodies the same or different?',
		mode: 'identification',
		startmessage:'Compare the two melodies that you hear.',
		trials: 24
	});

	// overrides
	for (let key in settings) { if (key in activity) { activity[key] = settings[key]; } }

	// initialize
	activity.init();
}
function Confronto(settings) {
	this.ID = 'confronto';//points to database
	this.available = [];
	this.correct = 0;
	this.file = 0;
	this.files = [];//file log
	this.gain = -24;//dB rms re sound card max
	this.mode = 0;//0:melody, 1:rhythm
	this.practice = true;
	this.stimuli = [];
	this.title = 'Melody Comparisons';
	this.words = ['Same','Different'];

	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }
}
Confronto.prototype.next = function () {
	let that = this;

	//
	if (this.practice) {
		// escape button
		if (!document.getElementById('skip')) {
			var footer = document.getElementById('footer');
			var image = document.createElement('img');
			image.id = 'skip';
			image.onclick = () => {
				activity.correct = true;
				this.correct = 5;
				this.practice = false;
				activity.test();
			};
			image.src = 'images/skip.png';
			image.style.height = '90%';
			image.style.maxWidth = '15vw';
			image.style.position = 'absolute';
			image.style.right = '2%';
			image.style.top = '5%';
			image.title = 'skip';
			footer.appendChild(image);
		}

		//
		if (activity.correct) {
			this.correct++
		} else {
			this.correct = 0;
		}

		//
		if (this.correct >= 4) {
			this.practice = false;
			this.calls = [];
			activity.calls = [];
			activity.chance = 0;
			activity.correct = undefined;
			activity.practice = false;
			activity.responses = [];
			activity.score = [];
			activity.trial = 0;
			document.getElementById('score').innerHTML = 'Testing...';
			document.getElementById('adaptive').innerHTML = '';
		} else {
			document.getElementById('score').innerHTML = 'Practice mode: answer 4 correct in a row to start the test.';
			document.getElementById('adaptive').innerHTML = 'Correct: '+this.correct;
		}
	}
}
Confronto.prototype.preload = function () {
	let that = this;

	//
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
	const files = ['1','2','3','4','5','6'];
	const method = ['MELODY','RHYTHM'];
	const mode = ['DIFF','SAME'];
	let i = 0, total = 24, url;
	for (let a = 0; a < method.length; a++) {
		for (let b = 0; b < mode.length; b++) {
			for (let c = 0; c < files.length; c++) {
				url = 'data/confronto/'+method[a]+' '+mode[b]+' '+files[c]+'.wav';
				loadAudio(i++,url,total);
			}
		}
	}
};
Confronto.prototype.save = function (data) {
	data.files = this.files.join(',');
	data.mode = this.mode;
	return data;
}
Confronto.prototype.select = function () {
	if (this.available.length == 0) {
		this.available.sequence(24);
		this.available.shuffle();
	}
	this.file = this.available.pop();
	this.files[this.files.length] = this.file;
	return this.file % 12 < 6 ? 1 : 0;
}
Confronto.prototype.settings = function (table, rowIndex) {
	let that = this;

	// mode
	var select = layout.select(['Melody','Rhythm']);
	select.onchange = function () {
		that.mode = this.selectedIndex;
		activity.settings();
	};
	select.selectedIndex = this.mode;
	layoutTableRow(table,++rowIndex,'Confronto:',select,'');
};
Confronto.prototype.stimulus = function (call) {
	if ('preload' in this) {
		console.log(this.file);
		processor.signal(this.stimuli[this.file]);
	} else {
		const mode = this.file < 12 ? 'MELODY' : 'RHYTHM';
		const index = this.practice ? 'PRACTICE' : (this.file % 6) + 1;
		const type = call ? 'DIFF' : 'SAME';
		const file = 'data/confronto/'+mode+' '+type+' '+index+'.wav';
		processor.signal(file);
		console.log(file);
	}
};
