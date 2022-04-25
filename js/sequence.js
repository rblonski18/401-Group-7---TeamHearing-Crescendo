function sequence(settings) {
	activity = new Sequence(settings);
	
	// overrides
	for (let key in settings){ activity[key] = settings[key]; }
	
	// initialize
	activity.init();
}

/**
 * Sequence is a constructor for a Sequence which inherits from Protocol
 * and functions as the main logic for the activity
 * @param {*} settings - Map of settings to override for the protocol
 */
function Sequence(settings) {
	this.chance = undefined;
	this.chances = 4;
	this.init = () => { this.test(); };

	this.playSequence = [];
	this.trial = 0;
	this.trials = 0;

	this.mode = 0;
	this.samples = [];
	this.levels = {};
    this.level = 0;
    this.gameRollAndController = undefined;
    this.pianoRoll = undefined;
    this.wavesurfer = undefined;
    this.score = 0;
	
	// overrides
	for (let key in settings) { this[key]=settings[key]; }

    /**
     * Depending on mode, different levels are stored statically as well as different instruments
     * Levels can be made to be loaded from a database for randomness or
     * larger selection, but are currently loaded statically with protocol.
     * @param {Number} mode - 0 = percussive; 1 = melodic
     */
    switch(this.mode){
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
    this.reps = this.levels.length;
	
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
};

/**
 * Method is called upon success or failure of current level to begin next level or
 * increment the number of chances taken on failure.
 * @param {Boolean} success - Whether the level was completed correctly or not.
 */
Sequence.prototype.next = function(success) {
	let that = this;
	
    if(success){
        console.log("success");
        this.level++;
        this.score++;
        this.trials++;
        if(this.level == this.levels.length){
            /* 
            Note: this.save() can be uncommented for use upon table creation 
            - Uncomment method call and remove message creation and call.
            */
            //** this.save();
            let message = 'You got '+this.level+' out of '+this.levels.length+'.';
            layout.message('Sequence Recreation', message, ()=>{protocol.callback()});
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
            this.level++;
            this.trials++
            if(this.level == this.levels.length){
                /* 
                Note: this.save() can be uncommented for use upon table creation 
                - Uncomment method call and remove message creation and call.
                */
                //** this.save();
                let message = 'You recreated '+this.score+' out of '+this.levels.length+' sequences.';
                layout.message('Sequence Recreation', message, ()=>{protocol.callback()});
                return;
            }
            this.test();
        }
    }

}

/**
 * Stores activity data in Sequence table in the database with ajax call. Is not
 * currently called until table has been created. *  
 * @listens - Method is called when all levels have been completed (success or fail) or when activity is closed
 * @callback protocol.callback - Is a call to menu(). Directs user back to menu
 */
Sequence.prototype.save = function(){
    // Data to store
    let data = {
        mode: this.mode,
        score: this.score,
        subuser: subuser.ID,
        user: user.ID,
        level: this.level,
    };
    
    // Save to databse
    let message = 'You got '+this.level+' out of '+this.levels.length+'.';
    jQuery.ajax({
        data: data,
        error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
        success: function(data, status) {
            if (protocol.active) {
                layout.message('Sequence Recreation', message, ()=>{protocol.callback()});
            } else {
                layout.message('Sequence Recreation', message, ()=>{that.test()});
            }
        },
        type: 'POST',
        url: 'version/'+version+'/php/sequence.php'
    });
    return;
}

/**
 * Resets piano roll play progress and begins to play the waveform/level sound
 * @listens - Waits for level loading as well as a button press to repeat level sound
 */
Sequence.prototype.sound = function() {
        this.pianoRoll.resetPlayProgress();
        this.pianoRoll.play(this.playGame.currentLevel.bpm, false);
}

/**
 * Page layout code. Sets up activity layout and creates game using PianoRoll
 * @requires - Requires the pianoRoll library that is loaded via script in main.js
 */
Sequence.prototype.test = function(){
    // Reset
	let that = this;
	this.chance = 0;
	
	// exit button
	let exit = document.getElementById('logout');
	exit.onclick = function () {
		if (protocol && protocol.active) { 
			protocol.active = false; 
			if ('callback' in protocol) { 
				protocol.callback(); 
                // this.save();
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
	var container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '5%';
	container.style.height = '70%';
	container.style.width = '90%';
	container.style.left = '5%';
	main.appendChild(container);

    // Main piano roll container to hold piano roll and waveform
	var pianoRollContainer = document.createElement('div');
	pianoRollContainer.style.width = '100%';
	pianoRollContainer.style.margin = 'auto';
	container.appendChild(pianoRollContainer);
	
    // Game Creation *************************
	const audioCtx = new AudioContext();

	var smpler = new InstrumentJS.sampler(this.samples.slice(0,this.levels[this.level].beat.numNotes), audioCtx);

	this.gameRollAndController = BeatGame.createGamePianoRoll(pianoRollContainer,smpler,this.levels[this.level].beat.getLength(),audioCtx);
    this.game = this.gameRollAndController.game;
    this.wavesurfer = this.gameRollAndController.wavesurfer;
    this.pianoRoll = this.game.pianoRoll;
	this.game.onlevelcomplete = () => this.next(true);
    this.game.onlevelfail = () => this.next(false);
	smpler.onloadsamples = () => this.game.startLevel(this.levels[this.level]);

    // End Game Creation *********************
	
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
	message.innerHTML = 'Match the sequence of notes.'
	+' Click the instrument name for a sample.';
	message.style.display = 'inline-block';
	message.style.fontSize = '100%';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	message.style.paddingLeft = '5%';
	message.style.width = '50%';
	controls.appendChild(message);	
	
    // Submit button
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

	// Repeat button
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

    
    // ***** Below here is footer layout (chances, score, etc)

	// footer
	var footer = layout.footer();
	
	// chances indicator
	if (this.chances != Infinity) {
		var chances = document.createElement('span');
		chances.id = 'chances';
		var help = layout.help('Chances',
			'\"Chances\" are the number of mistakes allowed.'
			+'<br>Chances are counted per level and used up for missing a beat, '
			+'<br>or for adding an extra beat.'
            +'<br>Click the instrument name to hear a sample of it.'
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
	var score = document.createElement('span');
	score.id = 'score';
	score.insertAdjacentHTML('beforeend',' Score: ');
	if (this.trials != Infinity) {
        if(this.level == 0){
            score.innerHTML = 'Score: 0%';
        }
        else{
		    score.innerHTML = 'Score: '+ Math.round((this.score/this.level)*100) + '%';
        }
	}
	score.style.paddingLeft = '16px';
	score.style.verticalAlign = 'bottom';
	footer.appendChild(score);
	
	// break
	var br = document.createElement('br');
	footer.appendChild(br);

	// start dialog
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
