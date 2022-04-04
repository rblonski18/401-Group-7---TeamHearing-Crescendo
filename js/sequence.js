function sequence(settings) {
	activity = new Sequence(settings);
	
	// overrides
	for (let key in settings){ activity[key] = settings[key]; }
	
	// initialize
	activity.init();
}
function Sequence(settings) {
	// most of these will be removed, but still need to distinguish what can be used
	this.A = [];
	this.A_frequency = 1000;
	this.A_fm = 0;
	this.A_gain = 0;
	this.B = [];
	this.B_frequency = 2000;
	this.B_fm = 0;
	this.B_gain = 0;
	this.calls = [];
	this.chance = undefined;
	this.chances = 4;
	this.correct = undefined;
	this.cycle = 7;
	this.cycles = 8;
	this.delay = new Adaptive({rule:'exponential',value0:0.1,valueMax:0.1});
	this.disabled = true;
	this.duration = .1;
	this.extra = true;
	this.feedback = true;
	this.init = () => { this.test(); };
	this.jitter = .1;
	this.method = 'SAM Tone';//Complex Tone||SAM Tone
	this.period = .4;
	this.responses = [];
	this.stream = [];

	this.playSequence = [];
	this.trial = 0;
	this.trials = Infinity;
	this.mode = 0;

	this.numRollSquares = 0;
	this.LOOK_AHEAD = .1;
	this.samples = [];
	this._numWaveforms = 0;
	this.levels = [];
	this.melodicLevels = [];
    this.gameRollAndController = undefined;
    this.pianoRoll = undefined;
    this.wavesurfer = undefined;
	
	// overrides
	for (let key in settings) { this[key]=settings[key]; }
	
	// Unnecessary?
	switch(this.method){
		case 'Complex Tone':
			this.A = dsp.ramp(dsp.complex(this.duration,this.A_fm));
			this.B = dsp.ramp(dsp.complex(this.duration,this.B_fm));
			break;
		case 'SAM Tone':
			this.A = dsp.ramp(dsp.modulation(dsp.tone(this.duration, this.A_frequency),this.A_fm));
			this.B = dsp.ramp(dsp.modulation(dsp.tone(this.duration, this.B_frequency),this.B_fm));
	}
	
	// keypress
	// Unnecessary?
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
};

// Method for playing the next round
// Need to replace to increase difficulty using piano roll library
Sequence.prototype.next = function() {
	let that = this;
	
	//
	this.trial++;
		
	// last chance
	if (this.chance == this.chances) {
		// data
		let data = {
			behavior: undefined,
			calls: this.calls.join(','),
			ear: undefined,
			gain: MASTERGAIN,
			noise: undefined,
			practice: undefined,
			responses: this.responses.join(','),
			score: undefined,
			series: this.delay.history.join(','),
			setting: this.setting,
			settings: 'f1:'+this.f1+',f2:'+this.f2+'fm1:'+this.fm1+',fm2:'+this.fm2,
			snr: undefined,
			subuser: subuser.ID,
			user: user.ID
		};
		
		// save to database
		// currently off
		// let message = 'Delay detection: '+String(1e3*this.delay.value.toFixed(3))+' ms';
		// jQuery.ajax({
		// 	data: data,
		// 	error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
		// 	success: function(data, status) {
		// 		if (protocol.active) {
		// 			protocol.IDs.push(data);
		// 			layout.message('Stream Segregation', message, ()=>{protocol.next()});
		// 		} else {
		// 			layout.message('Stream Segregation', message, ()=>{that.test()});
		// 		}
		// 	},
		// 	type: 'POST',
		// 	url: 'version/'+version+'/php/stream.php'
		// });
		// return;
	}
	
	// enable buttons
	this.disabled = false;
	for (let a = 0; a < 2; a++) {
		jQuery('#afc'+a).button('option','disabled',false);
	}
	
	// adaptive logic
	if (this.correct) {
		if (this.A_gain == 0) {
			this.delay.logic(this.correct);
		} else if (this.A_gain == -Infinity){
			this.delay.logic(this.correct);
		} else {
			this.A_gain = Math.min(this.A_gain+12,0);
		}
	} else {
		if (this.delay.value == this.delay.valueMax) {
			this.A_gain -= 12;
		} else {
			this.delay.logic(this.correct);
		}
	}
	
	//
	try {
		document.getElementById('adaptive').innerHTML = 'Delay: '+String(1e3*this.delay.value.toFixed(3))+' ms';
	} catch (error) {
		console.error(error);
	}
	
	// update call and log
	this.call = Math.round(Math.random());
	this.calls.push(this.call);
	
	// stimulus
	this.sound();
}

// Method used to play the tone that user needs to recreate
// Method will have cases depending on mode (percussion vs melodic)
Sequence.prototype.sound = function() {
        this.pianoRoll.resetPlayProgress();
        this.pianoRoll.play(this.playGame.currentLevel.bpm, false);
	//
	// const A = dsp.gain([...this.A],this.A_gain);
	// const B = dsp.gain([...this.B],this.B_gain);
	// const delayAdaptive = this.call ? this.delay.value : -this.delay.value;
	// let bias, delay = 0, delayA, delayB, stream = [];
	// for (let a = 0; a < this.cycles; a++) {
	// 	bias = delayAdaptive*((a+1)/this.cycles)/2;
	// 	delayA = delay+(this.jitter-Math.abs(bias))*(2*Math.random()-1)+bias;
	// 	delayB = delay+this.period/2;
		
	// 	//
	// 	if (a == this.cycle) {
	// 		delayB = delay+this.period/2+delayAdaptive;
	// 	}

	// 	//
	// 	stream = dsp.add(A,stream,delayA);
	// 	stream = dsp.add(B,stream,delayB);
	// 	delay += this.period;
	// }
	
	// //
	// if (this.extra) {
	// 	stream = dsp.add(A,stream,delay+(this.jitter-Math.abs(bias))*(2*Math.random()-1)+bias);
	// }
	
	// //
	// processor.play(stream);
	// return stream;
	

}

// Page layout code
Sequence.prototype.test = function(){
	let that = this;
	
	// reset
	this.call = Math.round(Math.random());
	this.calls = [this.call];
	this.chance = 0;
	this.delay.reset();
	this.delay.logic(undefined);
	this.responses = [];

	this.createClasses();
	
	// exit button
    // leave in to exit activity
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
	let main = layout.main();

	
	// afc container
    // Unsure yet
	var container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '5%';
	container.style.height = '70%';
	container.style.width = '90%';
	container.style.left = '5%';
	main.appendChild(container);
	
	// button table
    // Remove (table for main buttons, replace with piano roll)
	// var table = document.createElement('table');
	// table.id = 'response_table';
	// table.style.height = '100%';
	// table.style.width = '100%';
	// container.appendChild(table);

	//TODO: Will include piano roll setup

	var pianoRollContainer = document.createElement('div');
	pianoRollContainer.style.width = '100%';
	pianoRollContainer.style.margin = 'auto';
	container.appendChild(pianoRollContainer);
	
    // Need to change directories on add
	this.samples = [
		new sample("Kick", "./version/crescendo/js/PianoRollLib/sounds/kick.wav"),
		new sample("Snare", "./version/crescendo/js/PianoRollLib/sounds/snare.wav"),
		new sample("Hi Hat", "./version/crescendo/js/PianoRollLib/sounds/hihat.wav")
	];
	this.levels = [
		new level(beatFromEncodedState(3, 16, "qqoICIGC"), 70),
		new level(beatFromEncodedState(3, 16, "/j8ICINC"), 70)
	];

	this.melodicLevels = [
		new level(beatFromEncodedState(5, 16, "CIAAACAgAACACA"), 70)
	];
	

	const audioCtx = new AudioContext();

	var smpler = new sampler(this.samples, audioCtx);

	//const rollAndController = this.createRollWithController(pianoRoll, smpler, 16, audioCtx);
	this.gameRollAndController = this.createGamePianoRoll(pianoRollContainer,smpler,16,audioCtx);
	const game = this.gameRollAndController.game;
	game.onlevelcomplete = () => game.startLevel(this.levels[1]);
	smpler.onloadsamples = () => game.startLevel(this.levels[0]);
	console.log(this.levels[0]);

	// TODO: Add logic for checking if sequence is correct


	// may add method

	// response buttons
    // Remove, actually creates the buttons(to be replaced)
	// const words = ['Early','Late'];
	// var cells = words.length;
	// for (let a = 0; a < words.length; a++) {				
	// 	// insert cell into table
	// 	if (a%cells == 0) {
	// 		var row = table.insertRow(a/cells);
	// 		row.style.height = '100%';
	// 		row.style.width = '100%';
	// 	}
	// 	var cell = row.insertCell(a%cells);
	// 	cell.style.width = '25%';

	// 	// response buttons
	// 	var button = document.createElement('button');
	// 	button.className = 'response';
	// 	button.id = 'afc'+a;
	// 	button.index = a;
	// 	button.innerHTML = words[a];
	// 	button.onclick = () => {
	// 		// disable buttons
	// 		if (this.disabled) { return; } 
	// 		else { 
	// 			this.disabled = true;
	// 			for (let a = 0; a < 2; a++) {
	// 				jQuery('#afc'+a).button('option','disabled',true);
	// 			}
	// 		}
			
	// 		// check if correct
	// 		this.correct = (a == this.call);
			
	// 		// response log
	// 		this.responses.push(a);
			
	// 		// feedback
	// 		if (this.feedback) {
	// 			if (this.correct) {
	// 				// feedback
	// 				var img = document.createElement('img');
	// 				img.src = 'images/check.png';
	// 				img.style.bottom = '10%';
	// 				img.style.height = '40%';
	// 				img.style.position = 'absolute';
	// 				img.style.right = '10%';
	// 				img.style.zIndex = '10';
	// 				document.getElementById('afc'+a).appendChild(img);
	// 				jQuery(img).fadeOut();
					
	// 				// score indicator
	// 				if (this.trials == Infinity) {
	// 					score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
	// 				} else if (that.trials < 20 && windowwidth > 4) {
	// 					document.getElementById('score'+this.trial).src = 'images/score-yay.png';
	// 				} else {
	// 					score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%'+', remaining: '+String(this.trials-this.trial-1);
	// 				}
	// 			} else {
	// 				// chance indicator
	// 				if (this.chances != Infinity) {
	// 					document.getElementById('chance'+this.chance).src = 'images/score-nay.png';
	// 				}
					
	// 				// score indicator
	// 				if (this.trials == Infinity) {
	// 					score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
	// 				} else if (this.trials < 20 && windowwidth > 4) {
	// 					document.getElementById('score'+this.trial).src = 'images/score-nay.png';
	// 				} else if (this.trials != Infinity) {
	// 					score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(1)+'%'+', remaining:'+String(this.trials-this.trial-1);
	// 				}						
				
	// 				// feedback
	// 				var img = document.createElement('img');
	// 				img.src = 'images/X.png';
	// 				img.style.bottom = '10%';
	// 				img.style.height = '40%';
	// 				img.style.position = 'absolute';
	// 				img.style.right = '10%';
	// 				img.style.zIndex = '10';
	// 				document.getElementById('afc'+a).appendChild(img);
	// 				jQuery(img).fadeOut();
				
	// 				// practice
	// 				if (this.practice) {
	// 					// message
	// 					var item = that.material.words
	// 							? that.material.active
	// 								? that.material.words[that.material.active[that.call]]
	// 								: that.material.words[that.call]
	// 							: that.call+1,
	// 						message = that.mode == 'oddball'
	// 							? 'Repeat for practice.'
	// 							: 'Click on any item to practice.';
	// 					document.getElementById('message').innerHTML 
	// 					= 'The correct answer was "'
	// 					+'<span style=\'color:blue\'>'+item+'</span>'+'".<br>'
	// 					+message;
	// 					//document.getElementById('repeat').style.visibility = 'hidden';
	// 					document.getElementById('next').style.display = '';
	// 					that.modeHold = that.mode;
	// 					that.mode = 'practice';
						
	// 					// enable buttons
	// 					that.disabled = false;
	// 					for (let a = 0; a < that.alternatives; a++) {
	// 						jQuery('#afc'+a).button('option','disabled',false);
	// 					}
	// 					return;
	// 				}
	// 			}
	// 		}
			
	// 		// lost chance
	// 		if (!this.correct) { this.chance++; }
			
	// 		// next
	// 		setTimeout(()=>{this.next()},1e3);
	// 	};
	// 	button.style.fontSize = '400%';
	// 	button.style.height = '100%';
	// 	button.style.marginLeft = '5%';
	// 	button.style.width = '90%';
	// 	button.value = 0;
	// 	jQuery(button).button();

	// 	// button in cell
	// 	cell.appendChild(button);
	// 	if(iOS){FastClick(button)}
	// }
	
    // bottom rectangle div, unsure yet
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
    // actual message inside above div, can be changed or removed
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Match the sequence of notes.';
	message.style.display = 'inline-block';
	message.style.fontSize = '100%';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	message.style.paddingLeft = '5%';
	message.style.width = '50%';
	controls.appendChild(message);

	// next button
    // (doesnt actually show up? can be removed maybe?)
	var button = document.createElement('button');
	button.id = 'next';
	button.innerHTML = 'next';
	button.onclick = () => {
		document.getElementById('next').style.display = 'none';
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
    // probably unneeded will be replaced
	var button = document.createElement('button');
	button.id = 'repeat';
	button.innerHTML = 'repeat';
	button.onclick = () => { if(this.disabled){return} this.wavesurfer.play(0); };
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);
	
	// controls: plot
    // also unneeded, will likely have waveform instead
	// if (debug) {
	// 	var button = document.createElement('button');
	// 	button.id = 'plot';
	// 	button.innerHTML = 'plot';
	// 	button.onclick = function () {
	// 		x = that.sound();
	// 		dsp.plot(x);
	// 	};
	// 	button.style.cssFloat = 'right';
	// 	button.style.height = '100%';
	// 	button.style.visibility = 'visible';
	// 	jQuery(button).button();
	// 	controls.appendChild(button);
	// 	if (iOS) { FastClick(button); }
	// }
	
    // ***** Below here is footer stuff (chances, delay, score, etc)
	// footer
	var footer = layout.footer();
	
	// chances indicator
	// Will likely have a certain amount of chances
	if (this.chances != Infinity) {
		var chances = document.createElement('span');
		chances.id = 'chances';
		var help = layout.help('Chances',
			'\"Chances\" are the number of mistakes allowed.'
			+'<br>Chances are not lost for mistakes made at the beginning of the test, '
			+'<br>or for mistakes made in a row.'
		);
		help.style.height = '1em';
		chances.appendChild(help);
		chances.insertAdjacentHTML('beforeend',' Chances: ');
		for (let a = 0; a < this.chances; a++) {
			var img = document.createElement('img');
			img.id = 'chance'+a;
			img.src = 'images/score-nan.png';
			jQuery(img).addClass('score');
			chances.appendChild(img);
		}
		chances.style.verticalAlign = 'bottom';
		footer.appendChild(chances);
	}
	
	// score indicator
	// May need to update scoring metric
	var score = document.createElement('span');
	score.id = 'score';
	score.insertAdjacentHTML('beforeend',' Score: ');
	if (this.trials != Infinity) {
		if (this.trials < 20) {
			for (let a = 0; a < this.trials; a++) {
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
	var br = document.createElement('br');
	footer.appendChild(br);
	
	// adaptive variable
	// Unnecessary, might replace with other metric
	// var label = document.createElement('span');
	// label.id = 'adaptive';
	// label.innerHTML = 'Delay: '+String(1e3*this.delay.value.toFixed(3))+' ms';
	// label.style.paddingLeft = '16px';
	// label.style.verticalAlign = 'bottom';
	// footer.appendChild(label);

	// start dialog
    // initial start dialogue, kept, but changed
	layout.message(
		'Sequence Recreation',
		'Listen to the notes played and recreate the sequence.',
		{	Start: function () {
				jQuery(this).dialog('destroy').remove();
				setTimeout(()=>{ that.disabled = false; that.wavesurfer.play(0); }, 1e3);
		}}
	);

	// add message next to start button
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Ready.&nbsp;';
	message.style.float = 'right';
	jQuery('.ui-dialog-buttonpane').append(message);
	
	// master volume
	if (this.volume) { gui.gain(this.volume); }
}



Sequence.prototype.createRollWithController = function(domParent, instrument, length, audioCtx){
    const controls = this.createRollController(domParent);
    const pianoRoll = this.createRoll(domParent, instrument, length, audioCtx);

    controls.bindToPianoRoll(pianoRoll);

    return {
        controller: controls,
        roll: pianoRoll
    }
}

Sequence.prototype.createRoll = function(domParent, instrument, length, audioCtx){
    var rollSquares = [];

    var dom = {};
    dom.squares = rollSquares;

    var roll = new pianoRoll(instrument, length, dom, audioCtx,this);

    // rollHolder allows for absolute positioning of the playhead over the pianoroll
    var rollHolder = document.createElement("div");
   	rollHolder.classList.add("pianoRollHolder"); 
    dom.root = rollHolder;
    
    // rollDom is the parent of the entire piano roll
    var rollDom = document.createElement("div");
    rollDom.classList.add("pianoRoll");
    rollHolder.appendChild(rollDom);

    // Create playhead
    var playHeadHolder = document.createElement("div");
    playHeadHolder.classList.add("pianoRollPlayHeadHolder");
    rollHolder.appendChild(playHeadHolder);
    dom.playHeadHolder = playHeadHolder;

    var playHead = document.createElement("div");
    playHead.classList.add("pianoRollPlayHead");
    playHeadHolder.appendChild(playHead);
    dom.playHead = playHead;

    // For each note on the instrument, create a row
    // rows are created in reverse order since notes should read from bottom to top
    for(let i = instrument.notes.length - 1; i >= 0; i--){
        var row = document.createElement("div");
        row.classList.add("pianoRollRow");

        var rowLabel = document.createElement("div");
        rowLabel.classList.add("pianoRollRowLabel");
		rowLabel.lineHeight = '50px';
		rowLabel.fontSize = '120%';
        rowLabel.innerText = instrument.notes[i];

        row.appendChild(rowLabel);

        for(let j = 0; j < length; j++){
            var square = document.createElement("div");
            square.classList.add("pianoRollSquare");

            square.id = "pianoRollSquare_" + this.numRollSquares;
            this.numRollSquares += 1;

            square.onclick = () => roll.clickSquare(instrument.notes.length - 1 - i, j);

            rollSquares.push(square);

            row.appendChild(square);
        }

        rollDom.appendChild(row);
    }

    domParent.appendChild(rollHolder);

    return roll;
}

Sequence.prototype.createRollController = function(domParent){
    var dom = {};

    // Create controls row
    var controls = document.createElement("div");
    controls.classList.add("pianoRollRow");
    controls.classList.add("pianoRollControls");
    domParent.appendChild(controls);

    // Create reset button
    var resetButton = document.createElement("button");
    resetButton.classList.add("pianoRollButton");
    resetButton.classList.add("pianoRollResetButton");
    resetButton.innerText = "Reset"
    controls.appendChild(resetButton);
    dom.resetButton = resetButton;

    // Create play button
    var playButton = document.createElement("button");
    playButton.classList.add("pianoRollButton");
    playButton.classList.add("pianoRollPlayButton");
    playButton.innerText = "Play"
    controls.appendChild(playButton);
    dom.playButton = playButton;

    var saveButton = document.createElement("button");
    saveButton.classList.add("pianoRollButton");
    saveButton.innerText = "Save"
    controls.appendChild(saveButton);
    dom.saveButton = saveButton;

    var loadButton = document.createElement("button");
    loadButton.classList.add("pianoRollButton");
    loadButton.innerText = "Load"
    controls.appendChild(loadButton);
    dom.loadButton = loadButton;
    
    var exportButton = document.createElement("button");
    exportButton.classList.add("pianoRollButton");
    exportButton.innerText = "Export"
    controls.appendChild(exportButton);
    dom.exportButton = exportButton;

    // Create bpm button
    /*
    var bpmSlider = document.createElement("input");
    bpmSlider.setAttribute("type", "range");
    controls.appendChild(bpmSlider);
    dom.bpmSlider = bpmSlider;
    */

    return new pianoRollController(dom);
} 

function pianoRollController(dom){
    this.pianoRoll;
    this._dom = dom;

    dom.playButton.onclick = () => this.onClickPlayButtom();
    dom.resetButton.onclick = () => this.onClickReset();
    dom.exportButton.onclick = () => this.onClickExport();
    dom.saveButton.onclick = () => this.onClickSave();
    dom.loadButton.onclick = () => this.onClickLoad();

    this.bindToPianoRoll = function(pianoRoll){
        this.pianoRoll = pianoRoll;
    }

    this.onClickPlayButtom = function(){
        if(this.pianoRoll === undefined){
            return;
        }

        if(this.pianoRoll.isPlaying()){
            this.pianoRoll.stop();
            this._dom.playButton.innerText = "Play";
        }
        else{
            this.pianoRoll.play(70, true);
            this._dom.playButton.innerText = "Stop";
        }
    }

    this.onClickReset = function(){
        if(this.pianoRoll === undefined){
            return;
        }

        if(this.pianoRoll.isPlaying()){
            this.pianoRoll.stop();
        }

        this.pianoRoll.reset();
        this._dom.playButton.innerText = "Play";
    }

    this.onClickExport = function(){
        const notes = this.pianoRoll.instrument.notes.length;
        const length = this.pianoRoll.length;
        const state = boolArrayToBase64(this.pianoRoll.getBeatStates().getState());
        
        console.log(`beatFromEncodedState(${notes}, ${length}, \"${state}\")`);
    }

    this.onClickSave = function(){
        const beatState = this.pianoRoll.getBeatStates().getState();
        const encoded = boolArrayToBase64(beatState);
        navigator.clipboard.writeText(encoded);
    }

    this.onClickLoad = function(){
        const beatState = navigator.clipboard.readText().then(
            text => {
                const decoded = base64ToBoolArray(text);

                const stateCopy = this.pianoRoll.getBeatStates();
                stateCopy.setState(decoded);

                this.pianoRoll.loadBeatStates(stateCopy);
        });
    }
}

function beat(numNotes, length){
    this._state = new Array(numNotes * length).fill(false);

    this.isBeatToggled = function(beatIndex, noteIndex){
        return this._state[beatIndex + noteIndex * length];
    }

    this.setBeat = function(beatIndex, noteIndex, value){
        this._state[beatIndex + noteIndex * length] = value;
    }

    this.getCopy = function(){
        let copy = new beat(numNotes, length);
        copy._state = Array.from(this._state);

        return copy;
    }

    this.length = function(){
        return length;
    }

    this.setAll = function(value){
        this._state.fill(value);
    }

    this.getState = function(){
        return Array.from(this._state);
    }

    this.setState = function(state){
        this._state = Array.from(state);
    }
}

let beatFromEncodedState = function(numNotes, length, state){
    const newBeat = new beat(numNotes, length);
    const decoded = this.base64ToBoolArray(state);

    newBeat.setState(decoded);

    return newBeat;
}

// From https://stackoverflow.com/a/67039932/10184960
let boolArrayToBase64 = function(arr){
    // Base64 character set
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    // How many bits does one character represent
    const bitsInChar = 6; // = Math.floor( Math.log2(characters.length) );

    // The output string
    let string = "";

    // Loop through the bool array (six bools at a time)
    for (let charIndex = 0; charIndex < arr.length / bitsInChar; charIndex++) {
        let number = 0;

        // Convert these six bools to a number (think of them as bits of the number) 
        for (let bit = 0; bit < bitsInChar; bit++)
            number = number * 2 + (arr[charIndex*bitsInChar + bit] ? 1 : 0);

        // Convert the number to a Base64 character and add it to output
        string += characters.charAt(number);
    }

    return string;
}

// From https://stackoverflow.com/a/67039932/10184960
let = base64ToBoolArray = function(string) {
    // Base64 character set
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    // How many bits does one character represent
    const bitsInChar = 6; // = Math.floor( Math.log2(characters.length) );

    // The output array
    const array = [];

    // Loop through the input string one character at a time
    for (let charIndex = 0; charIndex < string.length; charIndex++) {
        
        // Convert the Base64 char to a number 
        let number = characters.indexOf(string.charAt(charIndex));

        // Convert the number to six bools (think of them as bits of the number) 
        // And assign them to the right places in the array
        for (let bit = bitsInChar - 1; bit >= 0; bit--) {
            array[charIndex*bitsInChar + bit] = !!(number % 2)
            number = Math.floor(number / 2);
        }
    }

    return array;
}

/*
    Returns a promise of an audio buffer containing the rendered beat.
*/
let renderBeat = function(beat, instrument, bpm){
    const beatLength = 60 / bpm / 4;
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(1, beat.length() * beatLength * sampleRate, sampleRate);

    for(let beatIndex = 0; beatIndex < beat.length(); beatIndex++){
        for(let i = 0; i < instrument.notes.length; i++){
            if(beat.isBeatToggled(beatIndex, i)){
                instrument.playNote(instrument.notes.length - 1 - i, beatIndex * beatLength, offlineCtx);
            }
        }
    }

    return new Promise(resolve => {
        offlineCtx.oncomplete = function(e) {
            resolve(e.renderedBuffer);
        }
    
        offlineCtx.startRendering();
    });
}


function pianoRoll(instrument, length, dom, audioCtx,proto){
    this.instrument = instrument;
    this.audioCtx = audioCtx;
    this.length = length;
    this.isInteractionEnabled = true;

    this._dom = dom;
    this._beatStates = new beat(instrument.notes.length, length);
    this._isPlaying = false;
    this._playHeadAnimator = new playHeadAnimator(dom, length, (i, time) => this.playBeat(i, time), audioCtx,proto);
    this._playHeadAnimator.onFinishPlaying = () => this.resetPlayProgress();
    this._bpm = 70;
    this._beatListeners = []

    this.clickSquare = function(noteIndex, beatIndex){
        if(this.isInteractionEnabled){
            this.clearSquareStyles(beatIndex, noteIndex);
            this.toggleSquare(noteIndex, beatIndex);
        }
    }

    this.toggleSquare = function(noteIndex, beatIndex){
        let isToggled = this._beatStates.isBeatToggled(beatIndex, noteIndex);

        if(isToggled){
            this._dom.squares[beatIndex + noteIndex * length].classList.remove("pianoRollSquareHighlighted");
		}
        else {
            this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
		}

        this._beatStates.setBeat(beatIndex, noteIndex, !isToggled)
    };

    this.isBeatToggled = function(beatIndex, noteIndex){
        return this._beatStates.isBeatToggled(beatIndex, noteIndex);
    };

    this.play = function(bpm, loop, startBeat, endBeat){
        if(this.audioCtx.state === 'suspended'){
            this.audioCtx.resume().then(()=>this.play(bpm, loop, startBeat, endBeat));
            return;
        }

        if(startBeat === undefined){
            startBeat = 0;
        }

        if(endBeat === undefined){
            endBeat = length;
        }

        this._playHeadAnimator.play(bpm, loop, startBeat, endBeat);

        this._isPlaying = true;
    }

    this.resetPlayProgress = function(){
        this.stop();
        this._playHeadAnimator.reset();
    }

    this.stop = function(){
        this._playHeadAnimator.stop();

        this._isPlaying = false;
    }

    this.togglePlay = function(){
        if(this._isPlaying){
            this.stop();
        }
        else{
            this.play(this._bpm, true);
        }
    }

    this.isPlaying = function(){
        return this._isPlaying;
    }

    this.reset = function(){
        for(let i = 0; i < this._dom.squares.length; i++){
            this._dom.squares[i].classList.remove("pianoRollSquareHighlighted");
        }

        this._beatStates.setAll(false);

        this._playHeadAnimator.reset();
    };

    this.playBeat = function(beatIndex, time){
        if(time === undefined){
            time = this.audioCtx.currentTime;
        }

        for(let i = 0; i < this.instrument.notes.length; i++){
            if(this._beatStates.isBeatToggled(beatIndex, i)){
                this.instrument.playNote(this.instrument.notes.length - 1 - i, time, this.audioCtx);
            }
        }

        for(const listener of this._beatListeners){
            listener(beatIndex, time);
        }
    }

    this.addBeatListener = function(listener){
        this._beatListeners.push(listener);
    }

    this.addSquareStyle = function(beatIndex, noteIndex, styleClass){
        this._dom.squares[beatIndex + noteIndex * length].classList.add(styleClass);
	}

    this.removeSquareStyle = function(beatIndex, noteIndex, styleClass){
        this._dom.squares[beatIndex + noteIndex * length].classList.remove(styleClass);
    }

    this.clearSquareStyles = function(beatIndex, noteIndex){
        this._dom.squares[beatIndex + noteIndex * length].className = "";

        this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquare");

        if(this._beatStates.isBeatToggled(beatIndex, noteIndex)){
            this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
        }
    }

    this.clearAllSquareStyles = function(){
        for(let beatIndex = 0; beatIndex < this.length; beatIndex++){
            for(let noteIndex = 0; noteIndex < this.instrument.notes.length; noteIndex++){
                this.clearSquareStyles(beatIndex, noteIndex);
            }
        }
    }

    this.getBeatStates = function(){
        return this._beatStates.getCopy();
    }

    this.loadBeatStates = function(beatStates){
        this._beatStates = beatStates;

        for(let beatIndex = 0; beatIndex < this.length; beatIndex++){
            for(let noteIndex = 0; noteIndex < this.instrument.notes.length; noteIndex++){
                let isToggled = this._beatStates.isBeatToggled(beatIndex, noteIndex);

                if(isToggled){
                    this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
                }
                else {
                    this._dom.squares[beatIndex + noteIndex * length].classList.remove("pianoRollSquareHighlighted");
                }
            }
        }
    }
}


/*
    The playHeadAnimator serves two purposes:
    1. Animating the UI playhead to show the user where in the beat is being played
    2. Trigger the beat play callback to play beats in time (using a lookahead) 
*/
function playHeadAnimator(dom, numBeats, beatCallback, audioCtx,proto){
    this._dom = dom;
    this._numBeats = numBeats;
    this._audioCtx = audioCtx;
    this._pos = 0;
    this._animationId;

    this._isPlaying = false;
    this._bpm = 0;
    this._isLooping = false;
    this._beatCallback = beatCallback;

    this._nextNoteTime = 0;
    this._nextUnplayedNote = 0;

    this._startPos;
    this._startTime;

    this._startBeat;
    this._endBeat;

    this._proto = proto;

    this.play = function(bpm, loop, startBeat, endBeat){
        if(this._isPlaying){
            this.reset();
        }

        this._bpm = bpm;
        this._isLooping = loop;
        this._startBeat = startBeat;
        this._endBeat = endBeat;

        // Calculate non rounded beat position
        const currentBeat = this._getCurrentBeat();
        const extraPx = this._pos - currentBeat * this._getBeatWidth();
        const remainingPx = this._getBeatWidth() - extraPx;

        // Calculate time of next note
        this._nextUnplayedNote = (extraPx == 0 ? currentBeat : currentBeat + 1) % this._numBeats;
        this._nextNoteTime = audioCtx.currentTime + (extraPx == 0 ? 0 : remainingPx * this._getSecondsPerPx());

        this._startPos = this._pos;
        this._startTime = performance.now();

        this._setPlayHeadPosition(this._pos);

        this._animationId = window.requestAnimationFrame((t) => this._update(t));
        this._isPlaying = true;
    }

    this.stop = function(){
        window.cancelAnimationFrame(this._animationId);
        this._isPlaying = false;
    }

    this.reset = function(){
        window.cancelAnimationFrame(this._animationId);

        this._setPlayHeadPosition(0);

        this._isPlaying = false;
    }

    this._update = function(timestamp){
        if(this._startTime > performance.now()){
            return;
        }

        const elapsedTime = performance.now() - this._startTime;
        
        this._pos = (this._startPos + elapsedTime / 1000 * this._getPxPerSecond());
        if(this._isLooping){
            const playingGridLengthDebug = this._getPlayingGridLength();
            this._pos = this._pos % this._getPlayingGridLength();
        }

        while(this._nextNoteTime < this._audioCtx.currentTime + this._proto.LOOK_AHEAD){
            beatCallback(this._nextUnplayedNote, this._nextNoteTime);
            this._nextNoteTime += (60 / this._bpm) / 4;

            if(this._nextUnplayedNote + 1 >= this._getNumBeatsPlaying() && !this._isLooping){
                break;
            }

            this._nextUnplayedNote = (this._nextUnplayedNote + 1) % this._getNumBeatsPlaying();            
        }

        const x = this._pos;

        this._setPlayHeadPosition(x);

        this._animationId = window.requestAnimationFrame((t) => this._update(t));

        if(this._pos >= this._getPlayingGridLength() && !this._isLooping){
            this.stop();
            this.onFinishPlaying?.();
        }

        this._lastFrameTime = this._audioCtx.currentTime;
    }

    this._setPlayHeadPosition = function(pos){
        this._dom.playHead.style.left = "" + pos + "px";
        this._pos = pos;
    }

    this._getGridLength = function(){
        return this._dom.playHeadHolder.clientWidth;
    }

    this._getPlayingGridLength = function(){
        return this._getGridLength() * (this._getNumBeatsPlaying() / this._numBeats);
    }

    this._getBeatWidth = function(){
        return this._getGridLength() / this._numBeats;
    }

    this._getPxPerSecond = function(){
        const bps = this._bpm / 60;
        return bps * this._getBeatWidth() * 4;
    }

    this._getSecondsPerPx = function(){
        return 1 / this._getPxPerSecond();
    }

    this._getCurrentBeat = function(){
        return Math.floor(Math.round(this._pos) / this._getBeatWidth());
    }

    this._getNumBeatsPlaying = function(){
        return this._endBeat - this._startBeat;
    }
}

// Beat Game Code (Drew)

// Beatchecker class
function beatChecker(pianoRoll){
    pianoRoll.addBeatListener((i, t) => this._onBeatPlay(i, t));

    this._isCurrentlyChecking = false;
    this._expectedBeat = undefined;

    this.setCurrentlyChecking = function(value){
        this._isCurrentlyChecking = value;
    }

    this.setExpectedBeat = function(expectedBeat){
        this._expectedBeat = expectedBeat;
    }

    this._onBeatPlay = function(beatIndex, time){
        if(!this._isCurrentlyChecking){
            return;
        }

        // The beat is played at an arbitrary point in the future, we must delay 
        // calling the callbacks until approx that time
        const delay = Math.floor((time - pianoRoll.audioCtx.currentTime) * 1000);

        var isCorrect = true;

        for(let i = 0; i < pianoRoll.instrument.notes.length; i++){
            if(this._expectedBeat.isBeatToggled(beatIndex, i) != pianoRoll.isBeatToggled(beatIndex, i)){
                isCorrect = false;

                this._callDelayed(() => this.onIncorrectNote?.(beatIndex, i), delay);
            }
            else{

                this._callDelayed(() => this.onCorrectNote?.(beatIndex, i), delay);
            }
        }

        // If correct but the beat is not finished
        if(isCorrect && beatIndex < pianoRoll.length - 1)
            return;

        if(isCorrect){
            this._callDelayed(() => this._onBeatSucceed(), delay);
        }
        else{
            this._callDelayed(() => this._onBeatFailed(), delay);
        }
    }

    this._callDelayed = function(f, delay){
        if(delay < 10){
            f();
        }
        else{
            setTimeout(f, delay);
        }
    }

    this._onBeatFailed = function(){
        pianoRoll.stop();
        this.onFail?.();
    }

    this._onBeatSucceed = function(){
        this.onSuccess?.();
    }
}

// creates piano roll for game
Sequence.prototype.createGamePianoRoll = function(domParent, instrument, length, audioCtx){
    // TODO: create a custom piano roll controller to control the piano roll.
    // This controller should allow for testing a runthrough of the level or 
    // submitting a sequence. Input should be disabled when the piano roll is
    // running in submit mode
    // A gamestate object should also be created 

    const stackContainer = document.createElement("div");
    stackContainer.classList.add("gameSpace");
    domParent.appendChild(stackContainer);

    const wavesurferContainer = document.createElement("div");
    wavesurferContainer.classList.add("wavesurfContainer");
    wavesurferContainer.id = "waveform_" + this._numWaveforms;
    wavesurferContainer.style.width = "800px"
    stackContainer.appendChild(wavesurferContainer);
    
    this.wavesurfer = WaveSurfer.create({
        container: "#" + wavesurferContainer.id,
        waveColor: 'black',
        progressColor: 'orange',
        height: 100,
        interact: false,
        normalize: true
    });

    this.wavesurfer.on('finish', () => this.wavesurfer.seekTo(0));

    this._numWaveforms += 1;

    const pianoRollContainer = document.createElement("div");
    pianoRollContainer.classList.add("pianoRollContainer");
    stackContainer.appendChild(pianoRollContainer);

    this.pianoRoll = this.createRoll(pianoRollContainer, instrument, length, audioCtx);
    
    this.playGame = new game(this.pianoRoll, this.wavesurfer);

    const controls = document.createElement("div");
    controls.classList.add("pianoRollRow");
    controls.classList.add("pianoRollControls");
    pianoRollContainer.appendChild(controls);

    const listenBtn = this.createControllerButton("Listen", () => {
        this.wavesurfer.play(0);
    });

    controls.appendChild(listenBtn);

    const playBtn = this.createControllerButton("Play", () => {
        this.sound();
    });

    controls.appendChild(playBtn);

    const submitBtn = this.createControllerButton("Submit", () => this.playGame.submitSolution());

    controls.appendChild(submitBtn);

    return {
        game: this.playGame
    }
}

Sequence.prototype.createControllerButton = function(text, onClick){
    const btn = document.createElement("button");
    btn.classList.add("pianoRollButton");
    btn.innerText = text;
    btn.onclick = onClick;

    return btn;
}

// Game class
function game(pianoRoll, wavesurfer){
    this._beatChecker = new beatChecker(pianoRoll);

    this._beatChecker.onCorrectNote = (i, j) => this._onCorrectNote(i, j);
    this._beatChecker.onIncorrectNote = (i, j) => this._onIncorrectNote(i, j);
    this._beatChecker.onFail = () => this._onFail();
    this._beatChecker.onSuccess = () => this._onSuccess();

    this.currentLevel = undefined;

    this.startLevel = function(level){
        this.currentLevel = level;
        this._beatChecker.setExpectedBeat(level.beat);
		console.log("bpm "+ level.bpm);
        renderBeat(level.beat, pianoRoll.instrument, level.bpm)
        .then(audioBuffer => {
            wavesurfer.loadDecodedBuffer(audioBuffer);
        });
    }

    this.submitSolution = function(){
        this._beatChecker.setCurrentlyChecking(true);
        pianoRoll.isInteractionEnabled = false;
        
        pianoRoll.resetPlayProgress();
        pianoRoll.play(this.currentLevel.bpm, false);
    }

    this._onCorrectNote = function(beatIndex, noteIndex){
        if(this.currentLevel.beat.isBeatToggled(beatIndex, noteIndex)){
            pianoRoll.addSquareStyle(beatIndex, noteIndex, "pianoRollSquareSucceeded");
        }
    };

    this._onIncorrectNote = function(beatIndex, noteIndex){
        if(!this.currentLevel.beat.isBeatToggled(beatIndex, noteIndex)){
            pianoRoll.addSquareStyle(beatIndex, noteIndex, "pianoRollSquareFailed");
        }
    }

    this._onFail = function(){
        this._beatChecker.setCurrentlyChecking(false);
        pianoRoll.isInteractionEnabled = true;
    }

    this._onSuccess = function(){
        this._beatChecker.setCurrentlyChecking(false);
        pianoRoll.isInteractionEnabled = true;

        this.onlevelcomplete?.();
    }
}

function level(beat, bpm){
    this.beat = beat;
    this.bpm = bpm;
}



// Instrument methods (Drew)
function sample(name, audio){
    this.name = name;
    this.audio = audio;
}

function sampler(samples, audioContext){
    this.notes = samples.map(sample => sample.name);
    this.audioContext = audioContext;
    this.envelope = new envelope(0, 10, 0);

    this.playNote = function(noteIndex, time, audioCtx){
        const gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.0;

        const sampleSource = audioCtx.createBufferSource();
        sampleSource.buffer = this.audio[noteIndex];
        sampleSource.connect(gainNode);

        gainNode.gain.linearRampToValueAtTime(1.0, time + this.envelope.attack);
        gainNode.gain.setTargetAtTime(0, time  + this.envelope.hold, this.envelope.release);

        sampleSource.start(time);
    }

    this.setEnvelope = function(attack, hold, release){
        this.envelope = new envelope(attack, hold, release);
    }   

    this._loadSamples = async function(){
        // For each sample...
        const requests = samples.map(
            // fetch the data from the url
            async sample => await fetch(sample.audio)
            
            // decode the response into an array buffer
            .then(res => res.arrayBuffer())
        
            // decode the array buffer into an audio data
            .then(ArrayBuffer => this.audioContext.decodeAudioData(ArrayBuffer))
        );
        
        this.audio = await Promise.all(requests);

        this.onloadsamples?.();
    }

    this._loadSamples();
}

function envelope(attack, hold, release){
    this.attack = attack;
    this.hold = hold;
    this.release = release;
}

// This method sets up CSS classes for piano roll
Sequence.prototype.createClasses = function(){
	var style = document.createElement('style');
	style.stype = 'text/css';
	style.innerHTML += ".pianoRollHolder {"+
		"width: 100%;"+
		"position: relative;"+
	"}";
	style.innerHTML += ".pianoRollPlayHeadHolder {"+
		"position: absolute;"+
		"top: 0px;"+
		"bottom: 0px;"+
		"left: 100px;"+
		"right: 0px;"+
		"pointer-events: none;"+
	"}";
	style.innerHTML += ".pianoRoll {:"+
		"width: 100%;"+
		"display: flex;"+
		"flex-direction: column;"+
		"align-items: stretch;"+
	"}";
	style.innerHTML += ".pianoRollRow {"+
		"display: flex;"+
		"justify-content: flex-end;"+
		"height: 50px;"+
	"}";
	style.innerHTML += ".pianoRollControls {"+
		"background-color: gray;"+
	"}";
	style.innerHTML += ".pianoRollRowLabel {"+
		"width: 100px;"+
		"background-color: darkgray;"+
		"border-style: solid;"+
		"border-color: gray;"+
		"border-width: 1px;"+
		"color: white;"+
		"text-align: center;"+
		"line-height: 50px;"+
		"font-size: 120%;"+
	"}";
	style.innerHTML += ".pianoRollSquare {"+
		"flex-grow: 1;"+
		"background-color: darkgray;"+
		"border-style: solid;"+
		"border-color: gray;"+
		"border-width: 1px;"+
	"}";
	style.innerHTML += ".pianoRollSquareHighlighted {"+
		"background-color: #ebeb08;"+
	"}";
	style.innerHTML += ".pianoRollSquareFailed {"+
		"background-color: #eb0808;"+
	"}";
	style.innerHTML += ".pianoRollSquareSucceeded {"+
		"background-color: #22eb08;"+
	"}";
	style.innerHTML += ".pianoRollButton{"+
		"height: 50px;"+
		"width: 50px;"+
		"background-color: #2c2c2c;"+
		"color: white;"+
		"border-style: none;"+
	"}";
	style.innerHTML += ".pianoRollPlayHead{"+
		"position: absolute;"+
		"left: 0px;"+
		"bottom: 0px;"+
		"width: 2px;"+
		"height: 100%;"+
		"background-color: white;"+
	"}";
    style.innerHTML += ".gameSpace{"+
        "display: flex;"+
        "flex-direction: column;"+
    "}";
    style.innerHTML += ".wavesurfContainer{"+
        "width: 800px;"+
       "height: 100px;"+
        "margin: 10px 0px 10px 100px;"+
   "}";
    style.innerHTML += ".pianoRollContainer{"+
        "width: 100%;"+
    "}";

	document.getElementsByTagName('head')[0].appendChild(style);
}