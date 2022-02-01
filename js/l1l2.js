function l1l2(settings) {
	// defaults
	settings.speech = true;
	if (!('alternatives' in settings)) { settings.alternatives = 4; }
	if (!('trials' in settings)) { settings.trials = 1; }
	
	// initialize activity
	activity = new AFC(settings);
	
	// inialize material
	activity.material = new L1L2(settings);
	
	// initialize
	activity.init();
}
function L1L2(settings) {
	this.ID = 'l1l2';
	this.active = [];
	this.alternatives = 4;
	this.available = [];
	this.english = ['baby','balloon','button','candy','chicken','children',
		'doctor','dolphin','dragon','elbow','feather','flower','garden','hanger','lemon',
		'lion','monkey','monster','necklace','oven','paper','pencil','ruler','sweater',
		'table','tiger','turkey','water','woman','zebra'];
	this.image = [];
	this.language = 'English';
	this.path = '/data/l1l2/original/';
	this.spanish = ['bebe','globo','boton','dulce','pollo','ninos',
		'doctor','delfin','dragon','codo','pluma','flores','jardin','gancho','limon',
		'leon','mono','monstro','collar','horno','papel','lapiz','regla','sueter',
		'mesa','tigre','pavo','agua','mujer','cebra'];
	this.title = 'English/Spanish Word Test';
	this.titleShort = 'E/S Words';
	this.trials = 2;
	this.word = [];
	for (var key in settings) {
		this[key] = settings[key];
	}
}
L1L2.prototype.protocols = function () {
	// English/Spanish protocol 
	var button = document.createElement('button');
	button.innerHTML = 'English/Spanish';
	button.onclick = function () {
		var material = new L1L2({'language':'English'});
		protocol.settings = [];
		protocol.settings[0] = {'material':material,'noise':'Two Talker Masker (English)'};
		protocol.settings[1] = {'material':material,'noise':'Two Talker Masker (Spanish)'};
		var material = new L1L2({'language':'Spanish'});
		protocol.settings[2] = {'material':material,'noise':'Two Talker Masker (English)'};
		protocol.settings[3] = {'material':material,'noise':'Two Talker Masker (Spanish)'};
		protocol.start();
	};
	button.style.color = 'green';
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.fontWeight = 'bold';
	button.style.height = '64px';
	button.style.margin = '16px';
	$(button).button();
	main.appendChild(button);
	if (iOS) {FastClick(button);}
}
L1L2.prototype.reset = function () {
	// words
	switch (this.language) {
		case 'English': this.words = this.english; break;
		case 'Spanish': this.words = this.spanish;
	}	
	
	// images
	for (var a = 0; a < this.words.length; a++) {
		this.image[a] = document.createElement('img');
		this.image[a].src = '/data/l1l2/images/'+this.language+'/'+this.words[a]+'.jpg';
		this.image[a].style.maxWidth = '80%'; 
	}
}
L1L2.prototype.save = function (data) {
	data.language = this.language;
	return data;
}
L1L2.prototype.settings = function (table, rowIndex) {
	var that = this;

	// language
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Language:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select(['English','Spanish']);
	select.onchange = function () {
		that.language = this.value;
		switch (that.language){
			case 'English': that.words = that.english; break;
			case 'Spanish': that.words = that.spanish;
		}
	};
	select.value = this.language;
	jQuery(cell).append(select);
	if (widgetUI) { jQuery(select).selectmenu({change:select.onchange}); }
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	return rowIndex;
};
L1L2.prototype.shuffle = function (call) {
	// target and foils
	var all = [];
	all.sequence(this.words.length);
	
	// check available words
	if (this.available.length == 0) {
		this.available.sequence(this.words.length);
		this.available.shuffle();
	}
	
	// select target
	var target = this.available.pop();
	
	// select foils
	var foils = all.slice();
	foils.remove(target);
	foils.shuffle();
	foils = foils.slice(0, this.alternatives-1);
	
	// define afc buttons
	for (var a = 0; a < this.alternatives; a++) {
		this.active[a] = (a == call)
			? target
			: foils.pop();
		document.getElementById('afc'+a).innerHTML = this.words[this.active[a]] + '<br>';
		document.getElementById('afc'+a).appendChild(this.image[this.active[a]]);
	}
};//target and foils
L1L2.prototype.stimulus = function (call, init) {
	var call = (typeof call !== 'undefined') ? call : 0, 
		init = (typeof init !== 'undefined') ? init : true,
		that = this;
	if(init){this.shuffle(call)}
	with(this){processor.signal(path+language+'/'+words[active[call]]+'.wav')}
}