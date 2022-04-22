function sequence(settings) {
	activity = new Sequence(settings);
	
	// overrides
	for (let key in settings){ activity[key] = settings[key]; }
	
	// initialize
	activity.init();
}
function Sequence(settings) {
	// most of these will be removed, but still need to distinguish what can be used
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
	this.trials = 0;

	this.mode = 0;
	//this.numRollSquares = 0;
	//this.LOOK_AHEAD = .1;
	this.samples = [];
	//this._numWaveforms = 0;
	this.levels = {};
    this.level = 0;
    this.gameRollAndController = undefined;
    this.pianoRoll = undefined;
    this.wavesurfer = undefined;
    this.score = 0;
	
	// overrides
	for (let key in settings) { this[key]=settings[key]; }

    switch(this.mode){
        // mode = 0 percussive, mode = 1 melodic
        case 0:
            this.levels = [
                new BeatGame.level(PianoRoll.beatFromEncodedState(1, 8, "jg"), 70),
                new BeatGame.level(PianoRoll.beatFromEncodedState(2, 8, "Iow"), 60),
                new BeatGame.level(PianoRoll.beatFromEncodedState(3, 16, "qqoICIGg"), 70),
                new BeatGame.level(PianoRoll.beatFromEncodedState(4, 16, "qqoIAiAUhUA"), 70),
                new BeatGame.level(PianoRoll.beatFromEncodedState(3, 16, "//8iIpyM"), 80),
                new BeatGame.level(PianoRoll.beatFromEncodedState(3, 16, "7u4QEKKG"), 70)
                
            ];
            this.samples = [
                new InstrumentJS.sample("Kick", "./version/crescendo/js/PianoRollLib/sounds/kick.wav"),
                new InstrumentJS.sample("Snare", "./version/crescendo/js/PianoRollLib/sounds/snare.wav"),
                new InstrumentJS.sample("Hi Hat", "./version/crescendo/js/PianoRollLib/sounds/hihat.wav"),
                new InstrumentJS.sample("Clap", "./version/crescendo/js/PianoRollLib/sounds/clap.wav"),
                new InstrumentJS.sample("Crash","./version/crescendo/js/PianoRollLib/sounds/crash.wav")
            ];
            break;
        case 1:
            this.levels = [
                new BeatGame.level(PianoRoll.beatFromEncodedState(5, 16, "CIAAACAgAACACA"), 70),
                new BeatGame.level(PianoRoll.beatFromEncodedState(5, 8, "CBQiQYA"), 60),
                new BeatGame.level(PianoRoll.beatFromEncodedState(5, 16, "AKgABAICBAGoAA"), 70)];
            this.samples = [
                new InstrumentJS.sample("C", "./version/crescendo/js/PianoRollLib/sounds/Piano.pp.C3.wav"),
                new InstrumentJS.sample("D", "./version/crescendo/js/PianoRollLib/sounds/Piano.pp.D3.wav"),
                new InstrumentJS.sample("E", "./version/crescendo/js/PianoRollLib/sounds/Piano.pp.E3.wav"),
                new InstrumentJS.sample("F", "./version/crescendo/js/PianoRollLib/sounds/Piano.pp.F3.wav"),
                new InstrumentJS.sample("G", "./version/crescendo/js/PianoRollLib/sounds/Piano.pp.G3.wav")
            ];
            break;

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
Sequence.prototype.next = function(success) {
	let that = this;
	
    if(success){
        console.log("success");
       // this.gameRollAndController.game.startLevel(this.levels[++this.level]);
        this.level++;
        this.score++;
        this.trials++;
        if(this.level == this.levels.length){
            // need to do something here for max level count
            return;
        }
        this.test();
    }
    else{
        console.log("failure");
        if (this.chances != Infinity) {
            document.getElementById('chance'+this.chance).src = 'images/score-nay.png';
            this.chance++;
        }
        if(this.chance == this.chances){
            //this.gameRollAndController.game.startLevel(this.levels[++this.level]);
            this.level++;
            this.trials++
            if(this.level == this.levels.length){
                // need to do something here for max level count
                return;
            }
            this.test();
        }
    }
	//
	// this.trial++;
		
	// // last chance
	if (this.chance == this.chances) {
		// data
		let data = {
			mode: this.mode,
			score: this.score,
			subuser: subuser.ID,
			user: user.ID,
            level: this.level,
		};
		
		// save to database
		// currently off
		//let message = 'Delay detection: '+String(1e3*this.delay.value.toFixed(3))+' ms';
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
		// 	url: 'version/'+version+'/php/sequence.php'
		// });
		return;
	}
	
	// // enable buttons
	// this.disabled = false;
	// for (let a = 0; a < 2; a++) {
	// 	jQuery('#afc'+a).button('option','disabled',false);
	// }
	
	// // adaptive logic
	// if (this.correct) {
	// 	if (this.A_gain == 0) {
	// 		this.delay.logic(this.correct);
	// 	} else if (this.A_gain == -Infinity){
	// 		this.delay.logic(this.correct);
	// 	} else {
	// 		this.A_gain = Math.min(this.A_gain+12,0);
	// 	}
	// } else {
	// 	if (this.delay.value == this.delay.valueMax) {
	// 		this.A_gain -= 12;
	// 	} else {
	// 		this.delay.logic(this.correct);
	// 	}
	// }
	
	// //
	// try {
	// 	document.getElementById('adaptive').innerHTML = 'Delay: '+String(1e3*this.delay.value.toFixed(3))+' ms';
	// } catch (error) {
	// 	console.error(error);
	// }
	
	// // update call and log
	// this.call = Math.round(Math.random());
	// this.calls.push(this.call);
	
	// stimulus
}

// Method used to play the tone that user needs to recreate
// Method will have cases depending on mode (percussion vs melodic)
Sequence.prototype.sound = function() {
        this.pianoRoll.resetPlayProgress();
        this.pianoRoll.play(this.playGame.currentLevel.bpm, false);
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


	//TODO: Will include piano roll setup

	var pianoRollContainer = document.createElement('div');
	pianoRollContainer.style.width = '100%';
	pianoRollContainer.style.margin = 'auto';
	container.appendChild(pianoRollContainer);
	
	

    // Game Creation *************************
	const audioCtx = new AudioContext();

	var smpler = new InstrumentJS.sampler(this.samples.slice(0,this.levels[this.level].beat.numNotes), audioCtx);

	//const rollAndController = this.createRollWithController(pianoRoll, smpler, 16, audioCtx);
	this.gameRollAndController = BeatGame.createGamePianoRoll(pianoRollContainer,smpler,this.levels[this.level].beat.getLength(),audioCtx);
    this.game = this.gameRollAndController.game;
    this.wavesurfer = this.gameRollAndController.wavesurfer;
    this.pianoRoll = this.game.pianoRoll;
	this.game.onlevelcomplete = () => this.next(true);
    this.game.onlevelfail = () => this.next(false);
	smpler.onloadsamples = () => this.game.startLevel(this.levels[this.level]);

    // End Game Creation *********************

	// TODO: Add logic for checking if sequence is correct
	
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
	button.innerHTML = 'Repeat';
	button.onclick = () => { if(this.disabled){return} this.wavesurfer.play(0); };
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);

    var submitB = document.createElement('button');
	submitB.id = 'submit';
	submitB.innerHTML = 'Submit';
	submitB.onclick = () => { if(this.disabled){return} this.game.submitSolution(); };
	submitB.style.cssFloat = 'right';
	submitB.style.display = 'inline';
	submitB.style.height = '100%';
	submitB.style.marginLeft = '8px';
	jQuery(submitB).button();
	if(iOS){FastClick(submitB)}
	controls.appendChild(submitB);
		
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
		score.innerHTML = 'Score: '+this.score+'/'+this.trials + ' out of '+this.levels.length +' levels';
	}
	score.style.paddingLeft = '16px';
	score.style.verticalAlign = 'bottom';
	footer.appendChild(score);
	
	// break
	var br = document.createElement('br');
	footer.appendChild(br);

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



// Sequence.prototype.createRollWithController = function(domParent, instrument, length, audioCtx){
//     const controls = this.createRollController(domParent);
//     const pianoRoll = this.createRoll(domParent, instrument, length, audioCtx);

//     controls.bindToPianoRoll(pianoRoll);

//     return {
//         controller: controls,
//         roll: pianoRoll
//     }
// }

// Sequence.prototype.createRoll = function(domParent, instrument, length, audioCtx){
//     var rollSquares = [];

//     var dom = {};
//     dom.squares = rollSquares;

//     var roll = new pianoRoll(instrument, length, dom, audioCtx,this);

//     // rollHolder allows for absolute positioning of the playhead over the pianoroll
//     var rollHolder = document.createElement("div");
//    	rollHolder.classList.add("pianoRollHolder"); 
//     dom.root = rollHolder;
    
//     // rollDom is the parent of the entire piano roll
//     var rollDom = document.createElement("div");
//     rollDom.classList.add("pianoRoll");
//     rollHolder.appendChild(rollDom);

//     // Create playhead
//     var playHeadHolder = document.createElement("div");
//     playHeadHolder.classList.add("pianoRollPlayHeadHolder");
//     rollHolder.appendChild(playHeadHolder);
//     dom.playHeadHolder = playHeadHolder;

//     var playHead = document.createElement("div");
//     playHead.classList.add("pianoRollPlayHead");
//     playHeadHolder.appendChild(playHead);
//     dom.playHead = playHead;

//     // For each note on the instrument, create a row
//     // rows are created in reverse order since notes should read from bottom to top
//     for(let i = instrument.notes.length - 1; i >= 0; i--){
//         var row = document.createElement("div");
//         row.classList.add("pianoRollRow");

//         var rowLabel = document.createElement("div");
//         rowLabel.classList.add("pianoRollRowLabel");
// 		rowLabel.lineHeight = '50px';
// 		rowLabel.fontSize = '120%';
//         rowLabel.innerText = instrument.notes[i];

//         row.appendChild(rowLabel);

//         for(let j = 0; j < length; j++){
//             var square = document.createElement("div");
//             square.classList.add("pianoRollSquare");

//             square.id = "pianoRollSquare_" + this.numRollSquares;
//             this.numRollSquares += 1;

//             square.onclick = () => roll.clickSquare(instrument.notes.length - 1 - i, j);

//             rollSquares.push(square);

//             row.appendChild(square);
//         }

//         rollDom.appendChild(row);
//     }

//     domParent.appendChild(rollHolder);

//     return roll;
// }

// Sequence.prototype.createRollController = function(domParent){
//     var dom = {};

//     // Create controls row
//     var controls = document.createElement("div");
//     controls.classList.add("pianoRollRow");
//     controls.classList.add("pianoRollControls");
//     domParent.appendChild(controls);

//     // Create reset button
//     var resetButton = document.createElement("button");
//     resetButton.classList.add("pianoRollButton");
//     resetButton.classList.add("pianoRollResetButton");
//     resetButton.innerText = "Reset"
//     controls.appendChild(resetButton);
//     dom.resetButton = resetButton;

//     // Create play button
//     var playButton = document.createElement("button");
//     playButton.classList.add("pianoRollButton");
//     playButton.classList.add("pianoRollPlayButton");
//     playButton.innerText = "Play"
//     controls.appendChild(playButton);
//     dom.playButton = playButton;

//     var saveButton = document.createElement("button");
//     saveButton.classList.add("pianoRollButton");
//     saveButton.innerText = "Save"
//     controls.appendChild(saveButton);
//     dom.saveButton = saveButton;

//     var loadButton = document.createElement("button");
//     loadButton.classList.add("pianoRollButton");
//     loadButton.innerText = "Load"
//     controls.appendChild(loadButton);
//     dom.loadButton = loadButton;
    
//     var exportButton = document.createElement("button");
//     exportButton.classList.add("pianoRollButton");
//     exportButton.innerText = "Export"
//     controls.appendChild(exportButton);
//     dom.exportButton = exportButton;

//     // Create bpm button
//     /*
//     var bpmSlider = document.createElement("input");
//     bpmSlider.setAttribute("type", "range");
//     controls.appendChild(bpmSlider);
//     dom.bpmSlider = bpmSlider;
//     */

//     return new pianoRollController(dom);
// } 

// function pianoRollController(dom){
//     this.pianoRoll;
//     this._dom = dom;

//     dom.playButton.onclick = () => this.onClickPlayButtom();
//     dom.resetButton.onclick = () => this.onClickReset();
//     dom.exportButton.onclick = () => this.onClickExport();
//     dom.saveButton.onclick = () => this.onClickSave();
//     dom.loadButton.onclick = () => this.onClickLoad();

//     this.bindToPianoRoll = function(pianoRoll){
//         this.pianoRoll = pianoRoll;
//     }

//     this.onClickPlayButtom = function(){
//         if(this.pianoRoll === undefined){
//             return;
//         }

//         if(this.pianoRoll.isPlaying()){
//             this.pianoRoll.stop();
//             this._dom.playButton.innerText = "Play";
//         }
//         else{
//             this.pianoRoll.play(70, true);
//             this._dom.playButton.innerText = "Stop";
//         }
//     }

//     this.onClickReset = function(){
//         if(this.pianoRoll === undefined){
//             return;
//         }

//         if(this.pianoRoll.isPlaying()){
//             this.pianoRoll.stop();
//         }

//         this.pianoRoll.reset();
//         this._dom.playButton.innerText = "Play";
//     }

//     this.onClickExport = function(){
//         const notes = this.pianoRoll.instrument.notes.length;
//         const length = this.pianoRoll.length;
//         const state = boolArrayToBase64(this.pianoRoll.getBeatStates().getState());
        
//         console.log(`beatFromEncodedState(${notes}, ${length}, \"${state}\")`);
//     }

//     this.onClickSave = function(){
//         const beatState = this.pianoRoll.getBeatStates().getState();
//         const encoded = boolArrayToBase64(beatState);
//         navigator.clipboard.writeText(encoded);
//     }

//     this.onClickLoad = function(){
//         const beatState = navigator.clipboard.readText().then(
//             text => {
//                 const decoded = base64ToBoolArray(text);

//                 const stateCopy = this.pianoRoll.getBeatStates();
//                 stateCopy.setState(decoded);

//                 this.pianoRoll.loadBeatStates(stateCopy);
//         });
//     }
// }

// function beat(numNotes, length){
//     this._state = new Array(numNotes * length).fill(false);

//     this.isBeatToggled = function(beatIndex, noteIndex){
//         return this._state[beatIndex + noteIndex * length];
//     }

//     this.setBeat = function(beatIndex, noteIndex, value){
//         this._state[beatIndex + noteIndex * length] = value;
//     }

//     this.getCopy = function(){
//         let copy = new beat(numNotes, length);
//         copy._state = Array.from(this._state);

//         return copy;
//     }

//     this.length = function(){
//         return length;
//     }

//     this.setAll = function(value){
//         this._state.fill(value);
//     }

//     this.getState = function(){
//         return Array.from(this._state);
//     }

//     this.setState = function(state){
//         this._state = Array.from(state);
//     }
//     this.notes = function(){
//         return numNotes;
//     }
// }

// let beatFromEncodedState = function(numNotes, length, state){
//     const newBeat = new beat(numNotes, length);
//     const decoded = this.base64ToBoolArray(state);

//     newBeat.setState(decoded);

//     return newBeat;
// }

// // From https://stackoverflow.com/a/67039932/10184960
// let boolArrayToBase64 = function(arr){
//     // Base64 character set
//     const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

//     // How many bits does one character represent
//     const bitsInChar = 6; // = Math.floor( Math.log2(characters.length) );

//     // The output string
//     let string = "";

//     // Loop through the bool array (six bools at a time)
//     for (let charIndex = 0; charIndex < arr.length / bitsInChar; charIndex++) {
//         let number = 0;

//         // Convert these six bools to a number (think of them as bits of the number) 
//         for (let bit = 0; bit < bitsInChar; bit++)
//             number = number * 2 + (arr[charIndex*bitsInChar + bit] ? 1 : 0);

//         // Convert the number to a Base64 character and add it to output
//         string += characters.charAt(number);
//     }

//     return string;
// }

// // From https://stackoverflow.com/a/67039932/10184960
// let = base64ToBoolArray = function(string) {
//     // Base64 character set
//     const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

//     // How many bits does one character represent
//     const bitsInChar = 6; // = Math.floor( Math.log2(characters.length) );

//     // The output array
//     const array = [];

//     // Loop through the input string one character at a time
//     for (let charIndex = 0; charIndex < string.length; charIndex++) {
        
//         // Convert the Base64 char to a number 
//         let number = characters.indexOf(string.charAt(charIndex));

//         // Convert the number to six bools (think of them as bits of the number) 
//         // And assign them to the right places in the array
//         for (let bit = bitsInChar - 1; bit >= 0; bit--) {
//             array[charIndex*bitsInChar + bit] = !!(number % 2)
//             number = Math.floor(number / 2);
//         }
//     }

//     return array;
// }

// /*
//     Returns a promise of an audio buffer containing the rendered beat.
// */
// let renderBeat = function(beat, instrument, bpm){
//     const beatLength = 60 / bpm / 4;
//     const sampleRate = 44100;
//     const offlineCtx = new OfflineAudioContext(1, beat.length() * beatLength * sampleRate, sampleRate);

//     for(let beatIndex = 0; beatIndex < beat.length(); beatIndex++){
//         for(let i = 0; i < instrument.notes.length; i++){
//             if(beat.isBeatToggled(beatIndex, i)){
//                 instrument.playNote(instrument.notes.length - 1 - i, beatIndex * beatLength, offlineCtx);
//             }
//         }
//     }

//     return new Promise(resolve => {
//         offlineCtx.oncomplete = function(e) {
//             resolve(e.renderedBuffer);
//         }
    
//         offlineCtx.startRendering();
//     });
// }


// function pianoRoll(instrument, length, dom, audioCtx,proto){
//     this.instrument = instrument;
//     this.audioCtx = audioCtx;
//     this.length = length;
//     this.isInteractionEnabled = true;

//     this._dom = dom;
//     this._beatStates = new beat(instrument.notes.length, length);
//     this._isPlaying = false;
//     this._playHeadAnimator = new playHeadAnimator(dom, length, (i, time) => this.playBeat(i, time), audioCtx,proto);
//     this._playHeadAnimator.onFinishPlaying = () => this.resetPlayProgress();
//     this._bpm = 70;
//     this._beatListeners = []

//     this.clickSquare = function(noteIndex, beatIndex){
//         if(this.isInteractionEnabled){
//             this.clearSquareStyles(beatIndex, noteIndex);
//             this.toggleSquare(noteIndex, beatIndex);
//         }
//     }

//     this.toggleSquare = function(noteIndex, beatIndex){
//         let isToggled = this._beatStates.isBeatToggled(beatIndex, noteIndex);

//         if(isToggled){
//             this._dom.squares[beatIndex + noteIndex * length].classList.remove("pianoRollSquareHighlighted");
// 		}
//         else {
//             this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
// 		}

//         this._beatStates.setBeat(beatIndex, noteIndex, !isToggled)
//     };

//     this.isBeatToggled = function(beatIndex, noteIndex){
//         return this._beatStates.isBeatToggled(beatIndex, noteIndex);
//     };

//     this.play = function(bpm, loop, startBeat, endBeat){
//         if(this.audioCtx.state === 'suspended'){
//             this.audioCtx.resume().then(()=>this.play(bpm, loop, startBeat, endBeat));
//             return;
//         }

//         if(startBeat === undefined){
//             startBeat = 0;
//         }

//         if(endBeat === undefined){
//             endBeat = length;
//         }

//         this._playHeadAnimator.play(bpm, loop, startBeat, endBeat);

//         this._isPlaying = true;
//     }

//     this.resetPlayProgress = function(){
//         this.stop();
//         this._playHeadAnimator.reset();
//     }

//     this.stop = function(){
//         this._playHeadAnimator.stop();

//         this._isPlaying = false;
//     }

//     this.togglePlay = function(){
//         if(this._isPlaying){
//             this.stop();
//         }
//         else{
//             this.play(this._bpm, true);
//         }
//     }

//     this.isPlaying = function(){
//         return this._isPlaying;
//     }

//     this.reset = function(){
//         for(let i = 0; i < this._dom.squares.length; i++){
//             this._dom.squares[i].classList.remove("pianoRollSquareHighlighted");
//         }

//         this._beatStates.setAll(false);

//         this._playHeadAnimator.reset();
//     };

//     this.playBeat = function(beatIndex, time){
//         if(time === undefined){
//             time = this.audioCtx.currentTime;
//         }

//         for(let i = 0; i < this.instrument.notes.length; i++){
//             if(this._beatStates.isBeatToggled(beatIndex, i)){
//                 this.instrument.playNote(this.instrument.notes.length - 1 - i, time, this.audioCtx);
//             }
//         }

//         for(const listener of this._beatListeners){
//             listener(beatIndex, time);
//         }
//     }

//     this.addBeatListener = function(listener){
//         this._beatListeners.push(listener);
//     }

//     this.addSquareStyle = function(beatIndex, noteIndex, styleClass){
//         this._dom.squares[beatIndex + noteIndex * length].classList.add(styleClass);
// 	}

//     this.removeSquareStyle = function(beatIndex, noteIndex, styleClass){
//         this._dom.squares[beatIndex + noteIndex * length].classList.remove(styleClass);
//     }

//     this.clearSquareStyles = function(beatIndex, noteIndex){
//         this._dom.squares[beatIndex + noteIndex * length].className = "";

//         this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquare");

//         if(this._beatStates.isBeatToggled(beatIndex, noteIndex)){
//             this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
//         }
//     }

//     this.clearAllSquareStyles = function(){
//         for(let beatIndex = 0; beatIndex < this.length; beatIndex++){
//             for(let noteIndex = 0; noteIndex < this.instrument.notes.length; noteIndex++){
//                 this.clearSquareStyles(beatIndex, noteIndex);
//             }
//         }
//     }

//     this.getBeatStates = function(){
//         return this._beatStates.getCopy();
//     }

//     this.loadBeatStates = function(beatStates){
//         this._beatStates = beatStates;

//         for(let beatIndex = 0; beatIndex < this.length; beatIndex++){
//             for(let noteIndex = 0; noteIndex < this.instrument.notes.length; noteIndex++){
//                 let isToggled = this._beatStates.isBeatToggled(beatIndex, noteIndex);

//                 if(isToggled){
//                     this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
//                 }
//                 else {
//                     this._dom.squares[beatIndex + noteIndex * length].classList.remove("pianoRollSquareHighlighted");
//                 }
//             }
//         }
//     }
// }


// /*
//     The playHeadAnimator serves two purposes:
//     1. Animating the UI playhead to show the user where in the beat is being played
//     2. Trigger the beat play callback to play beats in time (using a lookahead) 
// */
// function playHeadAnimator(dom, numBeats, beatCallback, audioCtx,proto){
//     this._dom = dom;
//     this._numBeats = numBeats;
//     this._audioCtx = audioCtx;
//     this._pos = 0;
//     this._animationId;

//     this._isPlaying = false;
//     this._bpm = 0;
//     this._isLooping = false;
//     this._beatCallback = beatCallback;

//     this._nextNoteTime = 0;
//     this._nextUnplayedNote = 0;

//     this._startPos;
//     this._startTime;

//     this._startBeat;
//     this._endBeat;

//     this._proto = proto;

//     this.play = function(bpm, loop, startBeat, endBeat){
//         if(this._isPlaying){
//             this.reset();
//         }

//         this._bpm = bpm;
//         this._isLooping = loop;
//         this._startBeat = startBeat;
//         this._endBeat = endBeat;

//         // Calculate non rounded beat position
//         const currentBeat = this._getCurrentBeat();
//         const extraPx = this._pos - currentBeat * this._getBeatWidth();
//         const remainingPx = this._getBeatWidth() - extraPx;

//         // Calculate time of next note
//         this._nextUnplayedNote = (extraPx == 0 ? currentBeat : currentBeat + 1) % this._numBeats;
//         this._nextNoteTime = audioCtx.currentTime + (extraPx == 0 ? 0 : remainingPx * this._getSecondsPerPx());

//         this._startPos = this._pos;
//         this._startTime = performance.now();

//         this._setPlayHeadPosition(this._pos);

//         this._animationId = window.requestAnimationFrame((t) => this._update(t));
//         this._isPlaying = true;
//     }

//     this.stop = function(){
//         window.cancelAnimationFrame(this._animationId);
//         this._isPlaying = false;
//     }

//     this.reset = function(){
//         window.cancelAnimationFrame(this._animationId);

//         this._setPlayHeadPosition(0);

//         this._isPlaying = false;
//     }

//     this._update = function(timestamp){
//         if(this._startTime > performance.now()){
//             return;
//         }

//         const elapsedTime = performance.now() - this._startTime;
        
//         this._pos = (this._startPos + elapsedTime / 1000 * this._getPxPerSecond());
//         if(this._isLooping){
//             const playingGridLengthDebug = this._getPlayingGridLength();
//             this._pos = this._pos % this._getPlayingGridLength();
//         }

//         while(this._nextNoteTime < this._audioCtx.currentTime + this._proto.LOOK_AHEAD){
//             beatCallback(this._nextUnplayedNote, this._nextNoteTime);
//             this._nextNoteTime += (60 / this._bpm) / 4;

//             if(this._nextUnplayedNote + 1 >= this._getNumBeatsPlaying() && !this._isLooping){
//                 break;
//             }

//             this._nextUnplayedNote = (this._nextUnplayedNote + 1) % this._getNumBeatsPlaying();            
//         }

//         const x = this._pos;

//         this._setPlayHeadPosition(x);

//         this._animationId = window.requestAnimationFrame((t) => this._update(t));

//         if(this._pos >= this._getPlayingGridLength() && !this._isLooping){
//             this.stop();
//             this.onFinishPlaying?.();
//         }

//         this._lastFrameTime = this._audioCtx.currentTime;
//     }

//     this._setPlayHeadPosition = function(pos){
//         this._dom.playHead.style.left = "" + pos + "px";
//         this._pos = pos;
//     }

//     this._getGridLength = function(){
//         return this._dom.playHeadHolder.clientWidth;
//     }

//     this._getPlayingGridLength = function(){
//         return this._getGridLength() * (this._getNumBeatsPlaying() / this._numBeats);
//     }

//     this._getBeatWidth = function(){
//         return this._getGridLength() / this._numBeats;
//     }

//     this._getPxPerSecond = function(){
//         const bps = this._bpm / 60;
//         return bps * this._getBeatWidth() * 4;
//     }

//     this._getSecondsPerPx = function(){
//         return 1 / this._getPxPerSecond();
//     }

//     this._getCurrentBeat = function(){
//         return Math.floor(Math.round(this._pos) / this._getBeatWidth());
//     }

//     this._getNumBeatsPlaying = function(){
//         return this._endBeat - this._startBeat;
//     }
// }

// // Beat Game Code (Drew)

// // Beatchecker class
// function beatChecker(pianoRoll){
//     pianoRoll.addBeatListener((i, t) => this._onBeatPlay(i, t));

//     this._isCurrentlyChecking = false;
//     this._expectedBeat = undefined;

//     this.setCurrentlyChecking = function(value){
//         this._isCurrentlyChecking = value;
//     }

//     this.setExpectedBeat = function(expectedBeat){
//         this._expectedBeat = expectedBeat;
//     }

//     this._onBeatPlay = function(beatIndex, time){
//         if(!this._isCurrentlyChecking){
//             return;
//         }

//         // The beat is played at an arbitrary point in the future, we must delay 
//         // calling the callbacks until approx that time
//         const delay = Math.floor((time - pianoRoll.audioCtx.currentTime) * 1000);

//         var isCorrect = true;

//         for(let i = 0; i < pianoRoll.instrument.notes.length; i++){
//             if(this._expectedBeat.isBeatToggled(beatIndex, i) != pianoRoll.isBeatToggled(beatIndex, i)){
//                 isCorrect = false;

//                 this._callDelayed(() => this.onIncorrectNote?.(beatIndex, i), delay);
//             }
//             else{

//                 this._callDelayed(() => this.onCorrectNote?.(beatIndex, i), delay);
//             }
//         }

//         // If correct but the beat is not finished
//         if(isCorrect && beatIndex < pianoRoll.length - 1)
//             return;

//         if(isCorrect){
//             this._callDelayed(() => this._onBeatSucceed(), delay);
//         }
//         else{
//             this._callDelayed(() => this._onBeatFailed(), delay);
//         }
//     }

//     this._callDelayed = function(f, delay){
//         if(delay < 10){
//             f();
//         }
//         else{
//             setTimeout(f, delay);
//         }
//     }

//     this._onBeatFailed = function(){
//         pianoRoll.stop();
//         this.onFail?.();
//     }

//     this._onBeatSucceed = function(){
//         this.onSuccess?.();
//     }
// }

// // creates piano roll for game
// Sequence.prototype.createGamePianoRoll = function(domParent, instrument, length, audioCtx){
//     // TODO: create a custom piano roll controller to control the piano roll.
//     // This controller should allow for testing a runthrough of the level or 
//     // submitting a sequence. Input should be disabled when the piano roll is
//     // running in submit mode
//     // A gamestate object should also be created 

//     const stackContainer = document.createElement("div");
//     stackContainer.classList.add("gameSpace");
//     domParent.appendChild(stackContainer);

//     const wavesurferContainer = document.createElement("div");
//     wavesurferContainer.classList.add("wavesurfContainer");
//     wavesurferContainer.id = "waveform_" + this._numWaveforms;
//     wavesurferContainer.style.width = "800px"
//     stackContainer.appendChild(wavesurferContainer);
    
//     this.wavesurfer = WaveSurfer.create({
//         container: "#" + wavesurferContainer.id,
//         waveColor: 'black',
//         progressColor: 'orange',
//         height: 100,
//         interact: false,
//         normalize: true
//     });

//     this.wavesurfer.on('finish', () => this.wavesurfer.seekTo(0));

//     this._numWaveforms += 1;

//     const pianoRollContainer = document.createElement("div");
//     pianoRollContainer.classList.add("pianoRollContainer");
//     stackContainer.appendChild(pianoRollContainer);

//     this.pianoRoll = this.createRoll(pianoRollContainer, instrument, length, audioCtx);
    
//     this.playGame = new game(this.pianoRoll, this.wavesurfer);

//     const controls = document.createElement("div");
//     controls.classList.add("pianoRollRow");
//     controls.classList.add("pianoRollControls");
//     pianoRollContainer.appendChild(controls);

//     const listenBtn = this.createControllerButton("Listen", () => {
//         this.wavesurfer.play(0);
//     });

//     controls.appendChild(listenBtn);

//     const playBtn = this.createControllerButton("Play", () => {
//         this.sound();
//     });

//     controls.appendChild(playBtn);

//     const submitBtn = this.createControllerButton("Submit", () => this.playGame.submitSolution());

//     controls.appendChild(submitBtn);

//     return {
//         game: this.playGame
//     }
// }

// Sequence.prototype.createControllerButton = function(text, onClick){
//     const btn = document.createElement("button");
//     btn.classList.add("pianoRollButton");
//     btn.innerText = text;
//     btn.onclick = onClick;

//     return btn;
// }

// // Game class
// function game(pianoRoll, wavesurfer){
//     this._beatChecker = new beatChecker(pianoRoll);

//     this._beatChecker.onCorrectNote = (i, j) => this._onCorrectNote(i, j);
//     this._beatChecker.onIncorrectNote = (i, j) => this._onIncorrectNote(i, j);
//     this._beatChecker.onFail = () => this._onFail();
//     this._beatChecker.onSuccess = () => this._onSuccess();

//     this.currentLevel = undefined;

//     this.startLevel = function(level){
//         this.currentLevel = level;
//         this._beatChecker.setExpectedBeat(level.beat);
// 		console.log("bpm "+ level.bpm);
//         renderBeat(level.beat, pianoRoll.instrument, level.bpm)
//         .then(audioBuffer => {
//             wavesurfer.loadDecodedBuffer(audioBuffer);
//         });
//     }

//     this.submitSolution = function(){
//         this._beatChecker.setCurrentlyChecking(true);
//         pianoRoll.isInteractionEnabled = false;
        
//         pianoRoll.resetPlayProgress();
//         pianoRoll.play(this.currentLevel.bpm, false);
//     }

//     this._onCorrectNote = function(beatIndex, noteIndex){
//         if(this.currentLevel.beat.isBeatToggled(beatIndex, noteIndex)){
//             pianoRoll.addSquareStyle(beatIndex, noteIndex, "pianoRollSquareSucceeded");
//         }
//     };

//     this._onIncorrectNote = function(beatIndex, noteIndex){
//         if(!this.currentLevel.beat.isBeatToggled(beatIndex, noteIndex)){
//             pianoRoll.addSquareStyle(beatIndex, noteIndex, "pianoRollSquareFailed");
//         }
//     }

//     this._onFail = function(){
//         this._beatChecker.setCurrentlyChecking(false);
//         pianoRoll.isInteractionEnabled = true;

//         this.onlevelfail?.();
//     }

//     this._onSuccess = function(){
//         this._beatChecker.setCurrentlyChecking(false);
//         pianoRoll.isInteractionEnabled = true;

//         this.onlevelcomplete?.();
//     }
// }

// function level(beat, bpm){
//     this.beat = beat;
//     this.bpm = bpm;
// }



// // Instrument methods (Drew)
// function sample(name, audio){
//     this.name = name;
//     this.audio = audio;
// }

// function sampler(samples, audioContext){
//     this.notes = samples.map(sample => sample.name);
//     this.audioContext = audioContext;
//     this.envelope = new envelope(0, 10, 0);

//     this.playNote = function(noteIndex, time, audioCtx){
//         const gainNode = audioCtx.createGain();
//         gainNode.connect(audioCtx.destination);
//         gainNode.gain.value = 0.0;

//         const sampleSource = audioCtx.createBufferSource();
//         sampleSource.buffer = this.audio[noteIndex];
//         sampleSource.connect(gainNode);

//         gainNode.gain.linearRampToValueAtTime(1.0, time + this.envelope.attack);
//         gainNode.gain.setTargetAtTime(0, time  + this.envelope.hold, this.envelope.release);

//         sampleSource.start(time);
//     }

//     this.setEnvelope = function(attack, hold, release){
//         this.envelope = new envelope(attack, hold, release);
//     }   

//     this._loadSamples = async function(){
//         // For each sample...
//         const requests = samples.map(
//             // fetch the data from the url
//             async sample => await fetch(sample.audio)
            
//             // decode the response into an array buffer
//             .then(res => res.arrayBuffer())
        
//             // decode the array buffer into an audio data
//             .then(ArrayBuffer => this.audioContext.decodeAudioData(ArrayBuffer))
//         );
        
//         this.audio = await Promise.all(requests);

//         this.onloadsamples?.();
//     }

//     this._loadSamples();
// }

// function envelope(attack, hold, release){
//     this.attack = attack;
//     this.hold = hold;
//     this.release = release;
// }

// function createSingleLevelGame(containerId, samples, level){
//     const s = new sampler(samples, audioCtx);
//     s.setEnvelope(0, .5, .1);

//     const game = createGamePianoRoll(document.getElementById(containerId), s, level.beat.length(), audioCtx);
//     s.onloadsamples = () => game.game.startLevel(level);

//     return game;
// }

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
        "align-items: center"+
    "}";
    style.innerHTML += ".wavesurfContainer{"+
        "width: 800px;"+
       "height: 100px;"+
        "margin: 10px 0px 10px 100px;"+
   "}";
    style.innerHTML += ".pianoRollContainer{"+
        "width: 900px;"+
    "}";

	document.getElementsByTagName('head')[0].appendChild(style);
}