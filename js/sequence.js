function sequence(settings) {
	activity = new Sequence(settings);
	
	// overrides
	for (let key in settings){ activity[key] = settings[key]; }
	
	// initialize
	activity.init();
}
function Sequence(settings) {
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
	this.trial = 0;
	this.trials = Infinity;
	this.mode = 0;
	
	// overrides
	for (let key in settings) { this[key]=settings[key]; }
	
	//
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
		let message = 'Delay detection: '+String(1e3*this.delay.value.toFixed(3))+' ms';
		jQuery.ajax({
			data: data,
			error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
			success: function(data, status) {
				if (protocol.active) {
					protocol.IDs.push(data);
					layout.message('Stream Segregation', message, ()=>{protocol.next()});
				} else {
					layout.message('Stream Segregation', message, ()=>{that.test()});
				}
			},
			type: 'POST',
			url: 'version/'+version+'/php/stream.php'
		});
		return;
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
	this.stimulus();
}
Sequence.prototype.stimulus = function() {
	//
	const A = dsp.gain([...this.A],this.A_gain);
	const B = dsp.gain([...this.B],this.B_gain);
	const delayAdaptive = this.call ? this.delay.value : -this.delay.value;
	let bias, delay = 0, delayA, delayB, stream = [];
	for (let a = 0; a < this.cycles; a++) {
		bias = delayAdaptive*((a+1)/this.cycles)/2;
		delayA = delay+(this.jitter-Math.abs(bias))*(2*Math.random()-1)+bias;
		delayB = delay+this.period/2;
		
		//
		if (a == this.cycle) {
			delayB = delay+this.period/2+delayAdaptive;
		}

		//
		stream = dsp.add(A,stream,delayA);
		stream = dsp.add(B,stream,delayB);
		delay += this.period;
	}
	
	//
	if (this.extra) {
		stream = dsp.add(A,stream,delay+(this.jitter-Math.abs(bias))*(2*Math.random()-1)+bias);
	}
	
	//
	processor.play(stream);
	return stream;
}
Sequence.prototype.test = function(){
	let that = this;
	
	// reset
	this.call = Math.round(Math.random());
	this.calls = [this.call];
	this.chance = 0;
	this.delay.reset();
	this.delay.logic(undefined);
	this.responses = [];
	
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
	var table = document.createElement('table');
	table.id = 'response_table';
	table.style.height = '100%';
	table.style.width = '100%';
	container.appendChild(table);

	// response buttons
    // Remove, actually creates the buttons(to be replaced)
	const words = ['Early','Late'];
	var cells = words.length;
	for (let a = 0; a < words.length; a++) {				
		// insert cell into table
		if (a%cells == 0) {
			var row = table.insertRow(a/cells);
			row.style.height = '100%';
			row.style.width = '100%';
		}
		var cell = row.insertCell(a%cells);
		cell.style.width = '25%';

		// response buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.id = 'afc'+a;
		button.index = a;
		button.innerHTML = words[a];
		button.onclick = () => {
			// disable buttons
			if (this.disabled) { return; } 
			else { 
				this.disabled = true;
				for (let a = 0; a < 2; a++) {
					jQuery('#afc'+a).button('option','disabled',true);
				}
			}
			
			// check if correct
			this.correct = (a == this.call);
			
			// response log
			this.responses.push(a);
			
			// feedback
			if (this.feedback) {
				if (this.correct) {
					// feedback
					var img = document.createElement('img');
					img.src = 'images/check.png';
					img.style.bottom = '10%';
					img.style.height = '40%';
					img.style.position = 'absolute';
					img.style.right = '10%';
					img.style.zIndex = '10';
					document.getElementById('afc'+a).appendChild(img);
					jQuery(img).fadeOut();
					
					// score indicator
					if (this.trials == Infinity) {
						score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
					} else if (that.trials < 20 && windowwidth > 4) {
						document.getElementById('score'+this.trial).src = 'images/score-yay.png';
					} else {
						score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%'+', remaining: '+String(this.trials-this.trial-1);
					}
				} else {
					// chance indicator
					if (this.chances != Infinity) {
						document.getElementById('chance'+this.chance).src = 'images/score-nay.png';
					}
					
					// score indicator
					if (this.trials == Infinity) {
						score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
					} else if (this.trials < 20 && windowwidth > 4) {
						document.getElementById('score'+this.trial).src = 'images/score-nay.png';
					} else if (this.trials != Infinity) {
						score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(1)+'%'+', remaining:'+String(this.trials-this.trial-1);
					}						
				
					// feedback
					var img = document.createElement('img');
					img.src = 'images/X.png';
					img.style.bottom = '10%';
					img.style.height = '40%';
					img.style.position = 'absolute';
					img.style.right = '10%';
					img.style.zIndex = '10';
					document.getElementById('afc'+a).appendChild(img);
					jQuery(img).fadeOut();
				
					// practice
					if (this.practice) {
						// message
						var item = that.material.words
								? that.material.active
									? that.material.words[that.material.active[that.call]]
									: that.material.words[that.call]
								: that.call+1,
							message = that.mode == 'oddball'
								? 'Repeat for practice.'
								: 'Click on any item to practice.';
						document.getElementById('message').innerHTML 
						= 'The correct answer was "'
						+'<span style=\'color:blue\'>'+item+'</span>'+'".<br>'
						+message;
						//document.getElementById('repeat').style.visibility = 'hidden';
						document.getElementById('next').style.display = '';
						that.modeHold = that.mode;
						that.mode = 'practice';
						
						// enable buttons
						that.disabled = false;
						for (let a = 0; a < that.alternatives; a++) {
							jQuery('#afc'+a).button('option','disabled',false);
						}
						return;
					}
				}
			}
			
			// lost chance
			if (!this.correct) { this.chance++; }
			
			// next
			setTimeout(()=>{this.next()},1e3);
		};
		button.style.fontSize = '400%';
		button.style.height = '100%';
		button.style.marginLeft = '5%';
		button.style.width = '90%';
		button.value = 0;
		jQuery(button).button();

		// button in cell
		cell.appendChild(button);
		if(iOS){FastClick(button)}
	}
	
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
	message.innerHTML = 'Was the last note in the pattern early or late?';
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
	button.onclick = () => { if(this.disabled){return} this.stimulus(); };
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);
	
	// controls: plot
    // also unneeded, will likely have waveform instead
	if (debug) {
		var button = document.createElement('button');
		button.id = 'plot';
		button.innerHTML = 'plot';
		button.onclick = function () {
			x = that.stimulus();
			dsp.plot(x);
		};
		button.style.cssFloat = 'right';
		button.style.height = '100%';
		button.style.visibility = 'visible';
		jQuery(button).button();
		controls.appendChild(button);
		if (iOS) { FastClick(button); }
	}
	
    // ***** Below here is footer stuff (chanced, delay, score, etc)
	// footer
	var footer = layout.footer();
	
	// chances indicator
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
	var label = document.createElement('span');
	label.id = 'adaptive';
	label.innerHTML = 'Delay: '+String(1e3*this.delay.value.toFixed(3))+' ms';
	label.style.paddingLeft = '16px';
	label.style.verticalAlign = 'bottom';
	footer.appendChild(label);

	// start dialog
    // initialy start dialogue, kept, but changed
	layout.message(
		'Stream Segregation',
		'Listen to the pattern and determine if the last note comes early or late.',
		{	Start: function () {
				jQuery(this).dialog('destroy').remove();
				setTimeout(()=>{ that.disabled = false; that.stimulus(); }, 1e3);
		}}
	);

	// add message next to start button
    // for some reason, this is 
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Ready.&nbsp;';
	message.style.float = 'right';
	jQuery('.ui-dialog-buttonpane').append(message);
	
	// master volume
	if (this.volume) { gui.gain(this.volume); }
}