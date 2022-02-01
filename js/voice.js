function voice(settings) {
	activity = new Voice;
	for (var key in settings) { activity[key] = settings[key]; }
	activity.test();
}
function Voice(settings) {
	this.ID = 'voice';
	this.adaptive = new Adaptive({
		rule: 'linear',
		step0: 2,
		stepAlpha: 0,
		stepMin: 1,
		valueMax: 12,
		valueMin: 0,
		value0: 12
	});
	this.alternatives = 2;
	this.available = [];
	this.call = undefined;
	this.calls = [];
	this.intervals = 2;
	this.labels = [
		'0.03125','0.039373','0.049606','0.0625','0.078745','0.099213',
		'0.125','0.15749','0.19843','0.25','0.31498','0.39685',
		'0.5','0.62996','0.7937','1','1.2599','1.5874',
		'2','2.5198','3.1748','4','5.0397','6.3496',
		'8','10.0794','12.6992','16','20.1587','25.3984','32'
	];
	this.material = 'English Words';
	this.message = 'Which sound is higher in pitch?';
	this.mode = 'F0';
	this.path = undefined;//set by reset
	this.responses = [];
	this.standard = undefined;
	this.target = undefined;
	this.title = 'Voice Pitch';
	this.word = 'AIRPLANE';
	this.words = [
		'AIRPLANE','BARNYARD','BASEBALL','BATHTUB','BEDROOM',
		'BIRDNEST','BIRTHDAY','BLUEJAY','COWBOY','CUPCAKE',
		'DOLLHOUSE','EYEBROW','FOOTBALL','HAIRBRUSH','HIGHCHAIR',
		'HOTDOG','ICECREAM','NECKTIE','PLAYGROUND','RAILROAD',
		'RAINBOW','SCARECROW','SHOELACE','SIDEWALK','TOOTHBRUSH'
	];
	
	// overrides
	for (var key in settings) { this[key] = settings[key]; }
}
Voice.prototype.response = function (button) {
	var that = this;//extended scope
	
	// disable buttons
	for (var a = 0; a < this.alternatives; a++) { jQuery('#afc'+a).button('disable'); }
			
	// log call and response
	this.calls[this.calls.length] = this.call;
	this.responses[this.responses.length] = button.index;

	// check if correct
	this.correct = (this.call == button.index);
			
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
			button.appendChild(img);
			jQuery(img).fadeOut(1000);
			
			// score indicator
			if (this.trials == Infinity) {
				score.innerHTML 
				= 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
			} else if (this.trials < 20) {
				document.getElementById('score'+this.trial).src
				= 'images/score-yay.png';
			} else {
				score.innerHTML 
				= 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%'
				+', remaining: '+String(this.trials-this.trial-1);
			}
		} else {
			// score indicator
			if (this.trials == Infinity) {
				score.innerHTML = 'Score: '+percentCorrect(this.calls,this.responses).toFixed(0)+'%';
			} else if (this.trials < 20 && windowwidth > 4) {
				document.getElementById('score'+this.trial).src = 'images/score-nay.png';
			} else if (this.trials != Infinity) {
				score.innerHTML 
				= 'Score: '+percentCorrect(this.calls,this.responses).toFixed(1)+'%'
				+', remaining:'+String(this.trials-this.trial-1);
			}						
		
			// feedback
			var img = document.createElement('img');
			img.src = 'images/X.png';
			img.style.bottom = '10%';
			img.style.height = '40%';
			img.style.position = 'absolute';
			img.style.right = '10%';
			img.style.zIndex = '10';
			button.appendChild(img);
			jQuery(img).fadeOut(1000);
		
			// practice
			if (this.practice) {
				// message
				var item = this.material.words
						? this.material.active
							? this.material.words[this.material.active[this.call]]
							: this.material.words[this.call]
						: this.call+1,
					message = this.mode == 'oddball'
						? 'Repeat for practice.'
						: 'Click on any item to practice.';
				document.getElementById('message').innerHTML 
				= 'The correct answer was "'
				+'<span style=\'color:blue\'>'+item+'</span>'+'".<br>'
				+message;
				//document.getElementById('repeat').style.visibility = 'hidden';
				document.getElementById('next').style.display = '';
				this.modeHold = this.mode;
				this.mode = 'practice';
				
				// enable buttons
				this.disabled = false;
				for (var a = 0; a < this.alternatives; a++) {
					jQuery('#afc'+a).button('option','disabled',false);
				}
				return;
			}
		}
	}
	setTimeout(function(){that.next()},1e3);
};
Voice.prototype.save = function (data) {
	switch (this.mode) {
		case 'F0': data.activity = 'Fundamental Frequency Discrimination'; break;
		case 'FF': data.activity = 'Formant Frequency Discrimination'; break;
		case 'F0_FF': data.activity = 'Combined Frequency Discrimination';
	}
	data.adaptive = Number(activity.adaptive.value);
	return data;
}
Voice.prototype.settings = function (table, rowIndex) {
	var that = this;

	// stimulus mode
	var options = ['F0','formants','F0+formants'],
		select = layout.select(options);
	select.onchange = function () {
		that.mode = ['F0','FF','F0_FF'][this.selectedIndex];
	};
	switch (this.mode) {
		case options[0]: select.selectedIndex = 0; break;
		case options[1]: select.selectedIndex = 1; break;
		case options[2]: select.selectedIndex = 2;
	}
	select.selectedIndex = this.mode;
	layoutTableRow(table,++rowIndex,'Stimulus mode:',select,'');
};
Voice.prototype.next = function () {
	this.call = Math.round(Math.random());
	
	// available words
	if (this.available.length == 0) {
		this.available.sequence(this.words.length);
		this.available.shuffle();
	}

	// select word
	this.word = this.words[this.available.pop()];
	
	//
	this.standard = this.path+'No Change/'+this.word+'_0.wav';
	this.target = this.path+this.mode+'/'+this.word+'_'+this.mode+'/'+this.word+'_'+this.mode+'_'+this.labels[this.adaptive.value]+'.wav';
	
	//
	this.playSequence();
};
Voice.prototype.play1 = function (a,call) {
	var call = call ? call : 0;
	var file = call ? this.target : this.standard;
	jQuery('#afc'+a).css('color','red');
	processor.signal(file);
	setTimeout(function(){jQuery('#afc'+a).css('color',buttonColor);},1e3);
};
Voice.prototype.playSequence = function () {
	var that = this;
	var delay = 0;
	for (var a = 0; a < this.intervals; a++) {		 
		setTimeout((function (a) {
			return function () {
				that.play1(a,a==that.call);
			}
		})(a), delay);
		
		// interstimulus pause
		delay += 2e3;
	}
};
Voice.prototype.test = function () {
	var that = this;//extended scope
	
	// reset
	switch (this.material) {
		case 'English Words':
			this.path = 'data/voice/'+this.material+'/'; break;
		case 'Hebrew Phrases':
			this.path = 'data/voice/'+this.material+'/s1/'+this.mode+'/'; 
	}
		
	// exit button
	var exit = document.getElementById('logout');
	exit.onclick = function () {
		layout.dashboard();
		if(protocol){protocol.active=false}
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
	
	// button table
	var table = document.createElement('table');
	table.id = 'response_table';
	table.style.height = '100%';
	table.style.width = '100%';
	container.appendChild(table);
	
	// response buttons
	for (var a = 0; a < this.alternatives; a++) {
		
		// insert cell into table
		if (a%this.alternatives == 0) {
			var row = table.insertRow(a/this.alternatives);
			row.style.height = '100%';
			row.style.width = '100%';
		}
		var cell = row.insertCell(a%this.alternatives);
		cell.style.width = '25%';
	
		// response buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.id = 'afc'+a;
		button.index = a;
		button.innerHTML = a;
		button.onclick = function(){that.response(this)};
		button.style.fontSize = '100%';
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
	var button = document.createElement('button');
	button.id = 'repeat';
	button.innerHTML = 'repeat';
	button.onclick = function () {
		that.playSequence();
	};
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);
	
	// footer
	var footer = layout.footer();
	
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
		label.innerHTML = 'Adaptive variable: '+String(this.adaptive.value);
		label.style.paddingLeft = '16px';
		label.style.verticalAlign = 'bottom';
		footer.appendChild(label);
	}
	
	// message
	layout.message('Intervals','Start Message',{
		Start: function () {
			jQuery(this).dialog('destroy').remove();
			that.next();
		}
	});

	// add message next to start button
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = 'Ready.&nbsp;';
	message.style.float = 'right';
	jQuery('.ui-dialog-buttonpane').append(message);
}