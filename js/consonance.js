function consonance(settings) {
	activity = new Consonance();
	for(var key in settings){activity[key]=settings[key]}//overrides
	activity.test();
}
function Consonance(settings) {
	this.ID = 'consonance';
	this.call = undefined;
	this.calls = [];
	this.correct = undefined;
	this.feedback = true;
	this.instrument = 'piano';
	this.message = 'Consonance Message';
	this.note = 36;
	this.path = 'data/intervals/';
	this.responses = [];
	this.spacing = undefined;
	this.spacings = [4,7,12];
	this.title = 'Consonance';
	this.titleShort = 'Consonance';
	this.trial = -1;
	this.trials = 10;
	this.words = ['Major 3rd','Perfect 5th','Octave'];
	for(var key in settings){this[key]=settings[key]}//overrides
	
	//
	if(typeof audio==='undefined'){
		audio = new AudioContext();
		processor = new Processor();
	}
}
Consonance.prototype.next = function () {
	var that = this;//extended scope
	
	// enable buttons
	for (var a = 0; a < this.alternatives; a++) { jQuery('#afc'+a).button('enable'); }
	
	//
	this.trial++;
	
	// end run
	if (this.trial == this.trials) {
		layout.message(this.title, 'Yo, you done!', function(){that.test()});
		return;
	}
	
	//
	this.call = Math.floor(Math.random()*this.spacings.length);
	this.spacing = this.spacings[this.call];
	this.stimulus();
}
Consonance.prototype.response = function (button) {
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
	
}
Consonance.prototype.stimulus = function () {
	var that = this;//extended scope
	var secondnote = this.note+this.spacing;
	var notes = [this.path+this.note+'_'+this.instrument+'.mp3',this.path+secondnote+'_'+this.instrument+'.mp3'];

	//
	processor.buffer(notes);
};
Consonance.prototype.test = function () {
	var that = this;//extended scope
		
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
	let cells = 3;
	for (let a = 0; a < this.words.length; a++) {
		
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
		button.innerHTML = this.words[a];
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
		that.stimulus();
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
	layout.message('Consonance','Start Message',{
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