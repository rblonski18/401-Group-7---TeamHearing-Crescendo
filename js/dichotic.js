function dichotic() {
	activity = new Dichotic();
	activity.layout();
}
function Dichotic() {
	this.gain = 65;//SPL if calibrated
	this.list = 0;
	this.sentence = 0;
}
Dichotic.prototype.layout = function() {
	let that = this;
	
	// reset
	processor.volume(this.gain);
	
	// main
	var main = layout.main(
		'Dichotic Listening',
		() => { layout.menu(); }
	);
	
	// layout
	var div = document.createElement('div');
	div.className = 'ui-widget-content';
	main.appendChild(div);
	
	// table
	var table = document.createElement('table');
	table.style.width = '100%';
	div.appendChild(table);
	
	// rows
	var rowIndex = -1;
	
	// level
	var input = document.createElement('input');
	input.onblur = function () {
		that.gain = Math.min(Number(this.value),75);
		processor.volume(that.gain);
		that.stimulus();
	};
	input.value = this.gain;
	layoutTableRow(table,++rowIndex,'Level:',input,'dB SPL');
	
	// list
	var select = layout.select(['A','B']);
	select.onchange = function () {
		that.list = this.selectedIndex;
	};
	select.selectedIndex = this.list;
	help = layout.help(
		'Program me',
		'Program me'
	);
	layoutTableRow(table,++rowIndex,'List:',select,'');
	
	// sentence
	let myArray = [];
	for (let a = 0; a < 30; a++) { myArray[a] = a+1; }
	var select = layout.select(myArray);
	select.id = 'sentence';
	select.onchange = function () {
		console.dir(this);
		that.sentence = this.selectedIndex;
	};
	select.selectedIndex = this.sentence;
	help = layout.help(
		'Program me',
		'Program me'
	);
	layoutTableRow(table,++rowIndex,'Sentence:',select,'');
	
	// new row
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	var cell = row.insertCell(1);
	
	// next button
	var button = document.createElement('button');
	button.id = 'next';
	button.innerHTML = 'Next';
	button.onclick = function() {
		that.sentence = Math.min(++that.sentence,29);
		that.layout();
		that.stimulus();
	};
	cell.appendChild(button);
	jQuery(button).button();
	
	// play button
	var button = document.createElement('button');
	button.id = 'play';
	button.innerHTML = 'Play';
	button.onclick = function() { that.stimulus(); };
	cell.appendChild(button);
	jQuery(button).button();

	//
	layout.footer();
}
Dichotic.prototype.stimulus = function () {
	let that = this;
	
	//
	 file = 'data/dichotic/calibrated/Track0'+String(this.list+3)+'_Stim'+String(this.sentence+1)+'.wav';
	setTimeout(()=>{processor.signal(file)},Math.random()*activity.jitter);
}