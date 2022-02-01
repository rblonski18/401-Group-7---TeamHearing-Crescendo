function reaction(settings) {
	activity = new Reaction({
		trials: 10
	});
	for(var key in settings){activity[key]=settings[key]}//overrides
	activity.test();
}
function Reaction(settings) {
	this.ID = 'reaction';
	this.delay = undefined;
	this.delays = [];
	this.image = [];
	this.reaction = undefined;
	this.reactions = [];
	this.start = undefined;
	this.title = 'Reaction Time';
	this.trial = -1;
	this.trials = 10;
	this.words = [
		'AIRPLANE','BARNYARD','BASEBALL','BATHTUB','BEDROOM',
		'BIRDNEST','BIRTHDAY','BLUEJAY','COWBOY','CUPCAKE',
		'DOLLHOUSE','EYEBROW','FOOTBALL','HAIRBRUSH','HIGHCHAIR',
		'HOTDOG','ICECREAM','NECKTIE','PLAYGROUND','RAILROAD',
		'RAINBOW','SCARECROW','SHOELACE','SIDEWALK','TOOTHBRUSH'
	];
	for(var key in settings){this[key]=settings[key]}//overrides
	
	// load images
	for (var a = 0; a < this.words.length; a++) {
		this.image[a] = document.createElement('img');
		this.image[a].src = 'data/crisp/images/'+this.words[a]+'.png';
	}
	
	// keypress
	document.onkeypress = function (e) {
		e = e || window.event;
		console.log(e.keyCode);
		if (e.keyCode == 13) { jQuery('#next').click(); }
		if (e.keyCode == 32) { jQuery('#afc0').click(); }
	};
}
Reaction.prototype.next = function () {
	var that = this;//extended scope
	
	//
	this.delay = Math.random()*1e3;
	this.start = undefined;
	
	//
	document.getElementById('afc0').innerHTML = 'Get Ready';
	setTimeout(function(){
		document.getElementById('afc0').innerHTML = '';
		document.getElementById('afc0').appendChild(that.image[that.trial]);
		that.start = Date.now()
	},1e3+this.delay);
			
	// enable button
	jQuery('#afc0').button('enable'); this.disabled = false;
	
	//
	this.trial++;
	
	// end run
	if (this.trial == this.trials) {
		layout.message(this.title, 'Yo, you done!', function(){that.test()});
		return;
	}
	
	//
	this.stimulus();
}
Reaction.prototype.response = function (button) {
	this.reaction = Date.now() - this.start;
	
	// css disabling of button does not prevent keyboard response,
	// so this code disables function programmatically
	if(this.disabled){return}
	
	//
	this.delays.push(this.delay);
	this.reactions.push(this.reaction);
	
	// buttons
	jQuery(button).button('disable');this.disabled=true;
	jQuery('#next').button('enable');
	
	// feedback
	if(Number.isNaN(this.reaction)){
		document.getElementById('message').innerHTML = 'Wait for it!';
		var img = document.createElement('img');
		img.src = 'images/X.png';
		img.style.bottom = '10%';
		img.style.height = '40%';
		img.style.position = 'absolute';
		img.style.right = '10%';
		img.style.zIndex = '10';
		button.appendChild(img);
		jQuery(img).fadeOut(1e3);
		document.getElementById('score'+this.trial).src = 'images/score-nay.png';
	} else {
		document.getElementById('message').innerHTML = this.reaction + ' ms';
		document.getElementById('score'+this.trial).src = 'images/score-yay.png';
	}
}
Reaction.prototype.stimulus = function () {
};
Reaction.prototype.test = function () {
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
	
	// response button
	var row = table.insertRow(0);
	row.style.height = '100%';
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.style.width = '25%';
	
	// response buttons
	var button = document.createElement('button');
	button.className = 'response';
	button.id = 'afc0';
	button.index = 0;
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
	message.innerHTML = '';
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
		document.getElementById('afc0').innerHTML = '';
		document.getElementById('message').innerHTML = '';
		jQuery(this).button('disable');
		setTimeout(function(){that.next()},1e3);
	};
	button.style.color = 'green';
	button.style.cssFloat = 'right';
	button.style.display = 'inline-block';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	jQuery(button).button('disable');
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
	layout.message(this.title,'Press the button when you see the picture.',{
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