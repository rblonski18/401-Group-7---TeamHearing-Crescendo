function environmental(settings) {
	activity = new AFC({
		alternatives: 3,
		back: function () { layout.menu(); },
		behavior: 'Constant',
		chances: Infinity,
		material: new Environmental(),
		snr: Infinity,
		trials: mode == 'alpha' ? 10 : 10
	});
	for (var key in settings) { activity[key] = settings[key]; }
	activity.init();
}
function Environmental() {
	this.ID = 'environmental';
	this.active = [];
	this.activity = 1;//'What am I?';
	this.alternatives = 3;//1:'What am I?',2:'What am I doing?',3:'Where am I?';
	this.available = [];
	this.filetype = '.mp3';
	this.path = 'data/environmental/calibrated/';
	this.title = 'Environmental Sounds';
	this.titleShort = 'Environmental';
	this.whatamI = ['Airplane','Applause','Buzzer','Camera','Car Horn','Clock','Crackling Fire',
		'Drumset','Footsteps','Forest Fire','Glass Breaking','Gunfire','Helicopter','Ice in Glass',
		'Key in Door','Machine Gun','Match Striking','Police Siren','Robin','Scissors','Stapler',
		'Thunder','Typewriter','Water Bubble','Windshield Wipers','Zipper'];
	this.whatamIdoing = ['Brushing Teeth','Cooking','Gargling','Giggling','Laughing',
		'Opening a Bottle','Opening a Bottle','Opening and Closing Door','Pouring Soda',
		'Shoveling Snow','Sighing','Sneezing','Opening Wine Bottle','Yawning'];
	this.whereamI = ['Barnyard','Bathroom','Beach','Bowling','Busy Street','Construction Site',
		'Forest','Grocery Store','Howling Wind','Office','Playground','Race Track','Restaurant',
		'SuperMarket','Tennis Court','Train Station','Video Arcade'];
	this.words = this.whatamI;
}
Environmental.prototype.save = function (data) {
	data.activity = this.activity;
	return data;
}
Environmental.prototype.settings = function(table,rowIndex) {
	var that = this;

	// activity
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Activity:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = document.createElement('select');
	select.disabled = false;
	select.onchange = function() {
		that.activity = this.selectedIndex;
		switch ( that.activity ) {
			case 0: that.words = that.whatamI; break;
			case 1: that.words = that.whatamIdoing; break;
			case 2: that.words = that.whereamI;
		}
		that.trials = that.words.length;
		that.call = [];
		for (var a=0; a<that.words.length; a++){that.call[a] = a;}
		that.call.shuffle();
	}
	select.style.fontSize = '100%';
	select.style.width = '100%';
	options = ['What am I?','What am I doing?','Where am I?'];
	for (var index = 0, length = options.length; index < length; index++) {
		var option = document.createElement('option');
		option.innerHTML = options[index];
		option.value = options[index];
		select.appendChild(option);
	}
	cell.appendChild(select);
	if (widgetUI) { jQuery(select).selectmenu({change:select.onchange}); }
	var cell = row.insertCell(2);
	cell.style.width = '20%';

	return rowIndex;
};
Environmental.prototype.shuffle = function(call) {
	var all = [], call = call ? call : 0;
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
	foils = foils.slice(0,this.alternatives-1);

	// define afc buttons
	for (var a = 0; a < this.alternatives; a++) {
		this.active[a] = (a == call) ? target : foils.pop();
		document.getElementById('afc'+a).innerHTML = this.words[this.active[a]];
	}
};//target and foils
Environmental.prototype.stimulus = function (call,init) {console.log(init);
	var call = call ? call : 0, init = (init !== undefined) ? init : true;
	if (init) { this.shuffle(); }
	processor.signal(this.path + this.words[this.active[call]] + this.filetype);
}
