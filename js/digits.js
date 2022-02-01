function digits(){
	activity = new AFC();
	activity.material = new Digits();
	activity.trials = 10;//activity.material.wordsAll.length;
	activity.menu();
}
function Digits(){
	this.ID = 'digits';
	this.audio = 'On';
	this.available = [];
	this.filetype = '.ogv';
	this.index = 0;
	this.method = 'Memory';
	this.path = '/data/digits/F1 Digits/';
	//this.path = '/data/stevie/Talker F1/Numbers_0_99_no_carrier/';
	this.talker = undefined;
	this.talkers = ['f1'];//['f1','f2','m1','m2'];
	this.title = 'Digits';
	this.titleShort = 'digits';
	this.video = 'On';
	this.words = ['0','1','2','3','4','5','6','7','8','9'];
	
	// test video for play type
	var testVideo = document.createElement( "video" ), mp4, ogg;
	if (testVideo.canPlayType){
		// Check for MPEG-4 support
		mp4 = "" !== testVideo.canPlayType( 'video/mp4; codecs="mp4v.20.8"' );

		// Check for Ogg support
		ogv = "" !== testVideo.canPlayType( 'video/ogg; codecs="theora"' );
	}
	if (ogv){
		this.filetype = '.ogv';
	} else {
		this.filetype = '.mp4';
	}
	console.log(this);
	
}
Digits.prototype.random = function () {
	if (this.available.length == 0) {	
		this.available.sequence(this.words.length);
		this.available.shuffle();
	}
	return this.available.pop();
};//random selection without replacement
Digits.prototype.save = function (data) {
	data.audio = this.audio;
	data.video = this.video;
	return data;
}
Digits.prototype.select = function (index) {

	var media = document.getElementById('mediaElement');
	media.src = this.path+this.words[index]+'_1'+this.filetype;
	
	if (this.audio == 'Off') { media.controls = false; media.muted = true; }
	else {media.controls = false;}
	
	return media;
};
Digits.prototype.settings = function (table,rowIndex) {
	var that = this;
	
	// test method
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Testing procedure:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = document.createElement('select');
	select.onchange = function(){that.method = this.value;};
	select.style.fontSize = '100%';
	select.style.width = '100%';
	options = ['Identification','Memory'];
	for (var i = 0, len = options.length; i < len; i++) {
		var option = document.createElement('option');
		option.innerHTML = options[i];
		option.value = options[i];
		select.appendChild(option);
	}
	select.value = this.method;
	cell.appendChild(select);
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	// audio on|off
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Audio:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = document.createElement('select');
	select.onchange = function(){that.audio = this.value;};
	select.style.fontSize = '100%';
	select.style.width = '100%';
	options = ['Off','On'];
	for (var i = 0, len = options.length; i < len; i++) {
		var option = document.createElement('option');
		option.innerHTML = options[i];
		option.value = options[i];
		select.appendChild(option);
	}
	select.value = this.audio;
	cell.appendChild(select);
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	// video on|off
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Video:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = document.createElement('select');
	select.onchange = function(){that.video = this.value;};
	select.style.fontSize = '100%';
	select.style.width = '100%';
	options = ['Off','On'];
	for (var i = 0, len = options.length; i < len; i++) {
		var option = document.createElement('option');
		option.innerHTML = options[i];
		option.value = options[i];
		select.appendChild(option);
	}
	select.value = this.video;
	cell.appendChild(select);
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	return rowIndex;
};