function crm(settings) {
	// defaults
	settings.speech = true;
	if (!('alternatives' in settings)) { settings.alternatives = 12; }
	
	// initialize activity
	activity = new AFC(settings);
	
	// inialize material
	activity.material = new CRM(settings);
	
	// CRM controls test
	activity.test = activity.material.test;
	
	// initialize
	activity.init();
}
function CRM(settings) {
	this.ID = 'crm';
	this.callsign = 0;
	this.callsigns = ['0','1','2','3'];
	this.color = 0;
	this.colorResponse = 0;
	this.colors = ['0','1','2','3'];
	this.correct = 0;
	this.path = '/data/crm/original/';
	this.number = 0;
	this.numberResponse = 0;
	this.numbers = ['0','1','2','3','4','5','6','7'];
	this.responses = 0;
	this.talker = 0;
	this.talkers = ['0','1','2','3','4','5','6','7'];
	this.title = 'Coordinate Response';
	this.titleShort = 'CRM';
	this.word = [];
	
	// overrides
	for (var key in settings) { if (key in this) { this[key] = settings[key]; }}
}
CRM.prototype.next = function (init) {
	this.correct = 0;
	this.responses = 0;
	
	// call & response
	if (this.go) {
		activity.call = this.callsign*1e3+this.color*1e2+this.number*10+this.talker;
		activity.calls[activity.calls.length] = activity.call;
		activity.response = this.callsign*1e3+this.colorResponse*1e2+this.numberResponse*10+this.talker;
		activity.responses[activity.responses.length] = activity.response;
	} else {
		this.go = true;
	};
	
	// new stuff
	this.callsign = Math.floor(this.callsigns.length*Math.random());
	this.color = Math.floor(this.colors.length*Math.random());
	this.number = Math.floor(this.numbers.length*Math.random());
	this.talker = Math.floor(this.talkers.length*Math.random());
	
	// enable buttons
	for (let a = 0; a < 4; a++) { jQuery('#color'+a).button('enable'); }
	for (let a = 0; a < 8; a++) { jQuery('#number'+a).button('enable'); }
	
	// adaptive snr
	if (typeof this.snr == 'object') {
		this.snr.logic(this.correct);
		document.getElementById('adaptive').innerHTML = 'SNR: '+this.snr.value+' dB';
		processor.snr(this.snr.value);
	}
}
CRM.prototype.save = function (data) {
	data.talkers = typeof(this.talkers)=='string'?this.talkers:this.talkers.join(',');
	return data;
}
CRM.prototype.stimulus = function (call, init) {
	// send audio file to processor
	processor.signal(
		this.path
		+'Talker'+this.talkers[this.talker]+'/'
		+'0'+this.callsigns[this.callsign]
		+'0'+this.colors[this.color]
		+'0'+this.numbers[this.number]+'.wav'
	);
}
CRM.prototype.test = function () {
	var that = this;
	var material = this.material;
	
	// reset
	if (this.behavior == 'Adaptive') { this.snr.reset(); }
	this.calls = [];
	this.chance = 0;
	this.correct = undefined;
	this.go = false;
	this.responses = [];
	this.score = [];
	this.sound = true;
	this.trial = -1;
	
	// exit button
	var exit = document.getElementById('logout');
	exit.onclick = function () {
		processor.stop();
		that.menu();
		
		//
		if (protocol) { protocol.active = false; }
		
		//
		this.style.visibility = 'hidden';
	};
	exit.src = 'images/exit.png';
	exit.style.visibility = 'visible';
	exit.title = 'exit test';

	// main
	var main = layout.main();
	
	// afc container
	var container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '5%';
	container.style.height = '70%';
	container.style.width = '90%';
	container.style.left = '5%';
	main.appendChild(container);
	
	// color table
	var table = document.createElement('table');
	table.id = 'color_table';
	table.style.height = '33%';
	table.style.width = '100%';
	container.appendChild(table);
	
	// response buttons
	var cells = 4;
	var words = ['Blue','Red','White','Green'];
	for (var a = 0; a < words.length; a++) {
		
		// insert cell into table
		if (a%cells == 0) {
			var row = table.insertRow(a/cells);
			row.style.height = '33%';
			row.style.width = '100%';
		}
		var cell = row.insertCell(a%cells);
		cell.style.width = '25%';
	
		// response buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.id = 'color'+String(a);
		button.index = a;
		button.innerHTML = words[a];
		button.onclick = function () {
			material.responses++;
			
			// disable buttons
			for (var a = 0; a < that.alternatives; a++) {
				jQuery('#color'+a).button('disable');
			}
			
			// log call and response
			material.colorCall = material.color;
			material.colorResponse = this.index;
			
			// check if correct
			that.correct = (material.color == this.index);
			if (that.correct) {
				material.correct++;
				
				// feedback
				var img = document.createElement('img');
				img.src = 'images/check.png';
				img.style.bottom = '10%';
				img.style.height = '40%';
				img.style.position = 'absolute';
				img.style.right = '10%';
				img.style.zIndex = '10';
				this.appendChild(img);
				jQuery(img).fadeOut(1000);
								
			} else {						
			
				// feedback
				var img = document.createElement('img');
				img.src = 'images/X.png';
				img.style.bottom = '10%';
				img.style.height = '40%';
				img.style.position = 'absolute';
				img.style.right = '10%';
				img.style.zIndex = '10';
				this.appendChild(img);
				jQuery(img).fadeOut(1000);
			}
			
			// check if both answered
			if (material.responses == 2) {
				// check if both correct
				if (material.correct == 2) {
					that.correct = true;
					
					// score indicator
					if (that.trials == Infinity) {
						score.innerHTML 
							= 'Score: '+percentCorrect(that.calls,that.responses).toFixed(0)+'%';
					} else if (that.trials < 20) {
						document.getElementById('score'+that.trial).src
						= 'images/score-yay.png';
					} else {
						score.innerHTML 
						= 'Score: '+percentCorrect(that.calls,that.responses).toFixed(1)+'%'
						+', remaining: '+String(that.trials-that.trial-1);
					}
				} else {
					that.correct = false;
					
					// chance indicator
					if (that.chances != Infinity) {
						document.getElementById('chance'+that.chance++).src = 'images/score-nay.png';
					}
					
					// score indicator
						if (that.trials == Infinity) {
							score.innerHTML 
								= 'Score: '+percentCorrect(that.calls,that.responses).toFixed(0)+'%';
						} else if (that.trials < 20 && windowwidth > 4) {
							document.getElementById('score'+that.trial).src 
								= 'images/score-nay.png';
						} else if (that.trials != Infinity) {
							score.innerHTML 
							= 'Score: '+percentCorrect(that.calls,that.responses).toFixed(1)+'%'
							+', remaining:'+String(that.trials-that.trial-1);
						}	
				}
				
				// next
				setTimeout(function(){that.next()},1e3);
			}
		};
		button.style.fontSize = that.speech ? '100%' : '200%';
		button.style.height = '100%';
		button.style.padding = '0%';
		button.style.width = '100%';
		button.value = 0;
		jQuery(button).button();
	
		// button in cell
		cell.appendChild(button);
		if(iOS){FastClick(button);}
	}
	
	// horizontal rule
	container.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');
	
	// number table
	var table = document.createElement('table');
	table.id = 'number_table';
	table.style.height = '66%';
	table.style.width = '100%';
	container.appendChild(table);
	
	// response buttons
	var cells = 4;
	var words = ['1','2','3','4','5','6','7','8'];
	for (var a = 0; a < words.length; a++) {
		
		// insert cell into table
		if (a%cells == 0) {
			var row = table.insertRow(a/cells);
			row.style.height = '33%';
			row.style.width = '100%';
		}
		var cell = row.insertCell(a%cells);
		cell.style.width = '25%';
	
		// response buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.id = 'number'+String(a);
		button.index = a;
		button.innerHTML = words[a];
		button.onclick = function () {
			material.responses++;
			
			// disable buttons
			for (var a = 0; a < that.alternatives; a++) {
				jQuery('#number'+a).button('disable');
			}
			
			// log call and response
			material.numberResponse = this.index;
			
			// check if correct
			that.correct = (material.number == this.index);
			if (that.correct) {
				material.correct++;
				
				// feedback
				var img = document.createElement('img');
				img.src = 'images/check.png';
				img.style.bottom = '10%';
				img.style.height = '40%';
				img.style.position = 'absolute';
				img.style.right = '10%';
				img.style.zIndex = '10';
				this.appendChild(img);
				jQuery(img).fadeOut(1000);
				
			} else {

				// feedback
				var img = document.createElement('img');
				img.src = 'images/X.png';
				img.style.bottom = '10%';
				img.style.height = '40%';
				img.style.position = 'absolute';
				img.style.right = '10%';
				img.style.zIndex = '10';
				this.appendChild(img);
				jQuery(img).fadeOut(1000);
			}
			
			// check if both answered
			if (material.responses == 2) {
				// check if both correct
				if (material.correct == 2) {
					that.correct = true;
					
					// score indicator
					if (that.trials == Infinity) {
						var img = document.createElement('img');
						img.src = 'images/score-yay.png';
						jQuery(img).addClass('score');
						document.getElementById('score').appendChild(img);
					} else if (that.trials < 20) {
						document.getElementById('score'+that.trial).src
						= 'images/score-yay.png';
					} else {
						score.innerHTML 
						= 'Score: '+percentCorrect(that.calls,that.responses).toFixed(1)+'%'
						+', remaining: '+String(that.trials-that.trial-1);
					}
				} else {
					that.correct = false;
					
					// chance indicator
					if (that.chances != Infinity) {
						document.getElementById('chance'+that.chance++).src = 'images/score-nay.png';
					}
					
					// score indicator
					if (that.trials < 20) {
						document.getElementById('score'+that.trial).src 
							= 'images/score-nay.png';
					} else if (that.trials != Infinity) {
						score.innerHTML 
							= 'Score: '+percentCorrect(that.calls,that.responses).toFixed(1)+'%'
							+', remaining:'+String(that.trials-that.trial-1);
					}
				}
				
				// next
				setTimeout(function () { that.next(); }, 1e3);
			}
		};
		button.style.fontSize = that.speech ? '100%' : '200%';
		button.style.height = '100%';
		button.style.padding = '0%';
		button.style.width = '100%';
		button.value = 0;
		jQuery(button).button();
	
		// button in cell
		cell.appendChild(button);
		if(iOS){FastClick(button);}
	}
	
	// button color
	buttonColor = jQuery('#afc0').css('color');
	
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
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = this.message;
	message.style.display = 'inline-block';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	message.style.width = '50%';
	controls.appendChild(message);

	// next button
	var button = document.createElement('button');
	button.id = 'next';
	button.innerHTML = 'next';
	button.onclick = function () {
		this.style.display = 'none';
		document.getElementById('message').innerHTML = that.message;
		document.getElementById('repeat').style.visibility = 'visible';
		that.next();
	};
	button.style.color = 'green';
	button.style.cssFloat = 'right';
	button.style.display = this.controls.includes('next') ? 'inline-block' : 'none';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	controls.appendChild(button);
	
	// all button
	var button = document.createElement('button');
	button.id = 'all';
	button.index = 0;
	button.innerHTML = 'all';
	button.onclick = function () {
		for (var a = 0; a < that.material.keywords[that.trial].length; a++) {
			document.getElementById('afc'+a).onclick();
		}
	};
	button.style.cssFloat = 'right';
	button.style.display = this.controls.includes('all') ? 'inline-block' : 'none';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button);}
	controls.appendChild(button);
	
	// repeat button
	var button = document.createElement('button');
	button.id = 'repeat';
	button.innerHTML = 'repeat';
	button.onclick = function () {
		if (that.sound) {
			that.playSequence(false);
		}
	};
	button.style.cssFloat = 'right';
	button.style.display = activity.repeat ? 'inline' : 'none';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);
	
	// controls: plot
	if (debug) {
		var button = document.createElement('button');
		button.id = 'plot';
		button.innerHTML = 'plot';
		button.onclick = function () {
			x = that.material.stimulus(1);
			dsp.plot(x);
		};
		button.style.cssFloat = 'right';
		button.style.height = '100%';
		button.style.visibility = 'visible';
		jQuery(button).button();
		controls.appendChild(button);
		if(iOS){FastClick(button)}
	}
	
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
		for (var a = 0; a < this.chances; a++) {
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
			for (var a = 0; a < this.trials; a++) {
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
	var br = document.createElement("br");
	footer.appendChild(br);
	
	// adaptive variable
	if (this.behavior == 'Adaptive') {
		var label = document.createElement('span');
		label.id = 'adaptive';
		label.innerHTML = 'Adaptive variable: '+String(this.snr.value);
		label.style.paddingLeft = '16px';
		label.style.verticalAlign = 'bottom';
		footer.appendChild(label);
	}

	// start dialog
	var buttons = {
		Start: function () {
			jQuery(this).dialog('destroy').remove();
			that.next();
		}
	};
	layout.message('Coordinate Response','Click on the color and number that you hear.',buttons);

	// add message next to start button
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Ready.&nbsp;';
	message.style.float = 'right';
	jQuery('.ui-dialog-buttonpane').append(message);
	
	// please wait
	if (this.noise != 'Off') {
		this.ready++;
		
		// disable start
		jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
		jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');
	
		// start noise
		const snr = typeof this.snr == 'number' ? this.snr : this.snr.value;
		const gain = snr < 0 ? 0 : -snr;//dB
		processor.noise(this.noise, gain, function () {
			that.ready--;
		 	if (that.ready == 0) {
				jQuery('.ui-dialog-buttonpane #message').html('Ready.&nbsp;');
				jQuery(".ui-dialog-buttonpane button:contains('Start')").button('enable');
			}
		});
	}
}