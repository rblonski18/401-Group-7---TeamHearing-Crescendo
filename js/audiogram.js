window.AudioContext = window.AudioContext || window.webkitAudioContext;
function audiogram() {
	activity = new Audiogram();
	activity.layout();
	activity.tone();
}
function Audiogram() {
	this.aided = 0;
	this.audio = [];
	this.calibration = 100;
	this.calibration = [[70,80,85,95,95,110,100,45],[75,80,85,100,100,105,100,45]];
	this.ear = 0;
	this.frequency = 1000;
	this.gain = 0;
	this.index = 3;
	this.mode = 'Pulse';//Continuous|Pulse
	this.modulation = false;
	this.playing = false;
	this.threshold = new Array();
	const freqs = [125,250,500,1e3,2e3,4e3,8e3,16e3];
	for (let a = 0; a < 2; a++) {
		this.threshold[a] = [];
		for (let b = 0; b < freqs.length; b++) {
			this.threshold[a][b] = [freqs[b],0];
		}
	}
};
Audiogram.prototype.history = function() {
	jQuery.ajax({
		async: false,
		data: {
			subuser: subuser.ID,
			user: user.ID
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
		},
		success: function (data, status) {			
			audiograms = jQuery.parseJSON(data);
			audiograms.sort(compare);
		},
		type: 'GET',
		url: 'version/'+version+'/php/audiogram.php'
	});
};
Audiogram.prototype.layout = function() {
	var that = this;
	
	// main
	var main = layout.main('Audiogram', () => {
			this.audio.volume.disconnect();
			layout.menu();
		},
		{	
			save: () => {
				jQuery.ajax({
					async: false,
					data: {
						L125: that.threshold[0][0][1],
						L250: that.threshold[0][1][1],
						L500: that.threshold[0][2][1],
						L1000: that.threshold[0][3][1],
						L2000: that.threshold[0][4][1],
						L4000: that.threshold[0][5][1],
						L8000: that.threshold[0][6][1],
						L16000: that.threshold[0][7][1],
						R125: that.threshold[1][0][1],
						R250: that.threshold[1][1][1],
						R500: that.threshold[1][2][1],
						R1000: that.threshold[1][3][1],
						R2000: that.threshold[1][4][1],
						R4000: that.threshold[1][5][1],
						R8000: that.threshold[1][6][1],
						R16000: that.threshold[1][7][1],
						subuser: subuser.ID,
						user: user.ID
					},
					success: function(data, status) { console.log(data); that.history(); },
					type: 'POST',
					url: 'version/'+version+'/php/audiogram.php'
				});
			},
			load: () => {
				that.history();
				
				// dialog: add note
				var dialog = document.createElement('div');
				dialog.title = 'Load Audiogram';
				
				// record dates
				var dates = new Array(audiograms.length);
				for (let a = 0; a < audiograms.length; a++) {
					dates[a] = audiograms[a].entry;
				}

				// content
				var content = document.createElement('p');
				var select = layout.select(dates);
				select.id = 'dates';
				content.appendChild(select);
				dialog.appendChild(content);
			
				// dialog
				jQuery(dialog).dialog({
					buttons: {
						Cancel: function () { jQuery(this).dialog('destroy').remove(); },
						Load: function () {
							var currentAudiogram = audiograms[document.getElementById('dates').selectedIndex];
							that.threshold[0] = [
								[125,currentAudiogram.L125],
								[250,currentAudiogram.L250],
								[500,currentAudiogram.L500],
								[1000,currentAudiogram.L1000],
								[2000,currentAudiogram.L2000],
								[4000,currentAudiogram.L4000],
								[8000,currentAudiogram.L8000],
								[16000,currentAudiogram.L16000]
							];
							that.threshold[1] = [
								[125,currentAudiogram.R125],
								[250,currentAudiogram.R250],
								[500,currentAudiogram.R500],
								[1000,currentAudiogram.R1000],
								[2000,currentAudiogram.R2000],
								[4000,currentAudiogram.R4000],
								[8000,currentAudiogram.R8000],
								[16000,currentAudiogram.R16000]
							];
							for (let a = 0; a < that.threshold.length; a++) {
								for (let b = 0; b < that.threshold[a].length; b++) {
									if (that.threshold[a][b][1] != null) {
										that.threshold[a][b][1] = Number(that.threshold[a][b][1]);
									}
								}
							}
							that.layout();
							jQuery(this).dialog('destroy').remove();
						}
					},
					modal: true,
					width: 'auto'//0.6*$(window).width()
				});
			}
		}
	);
	
	// exit button
	var exit = document.getElementById('logout');
	exit.onclick = function () {
		that.audio.volume.disconnect();
		layout.menu();
		this.style.visibility = 'hidden';
	};
	exit.src = 'images/exit.png';
	exit.title = 'exit test';
	
	// audiogram table
	var table = document.createElement('table');
	table.className = 'ui-widget-content';
	table.style.fontSize = 'Smaller';
	table.style.height = '15%';
	table.style.left = '1%';
	table.style.marginBottom = '8px';
	table.style.position = 'absolute';
	table.style.width = '98%';
	main.appendChild(table);

	// input table
	var cells = 9,
		cellWidth = 100/cells+'%',
		ear = 0,
		index = 0,
		rows = 3,
		rowHeight = 100/rows+'%',
		rowIndex = 0,
		labels = ['Ear','125 Hz','250 Hz','500 Hz','1 kHz','2 kHz','4 kHz','8 kHz','16 kHz'];
		
	// rows
	for (let a = 0; a < cells*rows; a++) {
		// cells
		if (a%cells == 0) {
			var row = table.insertRow(rowIndex++);
			row.style.height = rowHeight;
			row.style.width = '100%';
		}
		var cell = row.insertCell(a%cells);
		
		//
		if (a < cells) {
			cell.innerHTML = labels[a];
			cell.style.textAlign = 'center';
		} else if (a == cells) {
			cell.innerHTML = 'Left';
			cell.style.color = 'blue';
			cell.style.textAlign = 'center';
			index = -1;
		} else if (a == 2*cells) {
			cell.innerHTML = 'Right';
			cell.style.color = 'red';
			cell.style.textAlign = 'center';
			ear = 1;
			index = -1;
		} else {
			// input
			var input = document.createElement('input');
			input.id = String(ear)+'.'+String(++index);
			input.ear = ear;
			input.index = index;
			input.onchange = function (event) {
				that.ear = this.ear;
				that.index = this.index;
				that.frequency = that.threshold[this.ear][this.index][0];
				that.gain = Math.min(Number(this.value),100);
				this.value = that.gain;

				//
				that.audio.source.frequency.value = that.frequency;
				
				//
				switch (that.ear) {
					case 0: 
						that.audio.gainLeft.gain.value 
						= dbi(that.gain-that.calibration[this.ear][this.index]);
						that.audio.gainRight.gain.value = 0;
						break;
					case 1: 
						that.audio.gainRight.gain.value 
						= dbi(that.gain-that.calibration[this.ear][this.index]);
						that.audio.gainLeft.gain.value = 0;
				}
				
				//
				that.threshold[this.ear][this.index][1] = that.gain;
				
				/*
				if (that.mode == 'Pulse') {
					document.getElementById('startstop').onmousedown();
					setTimeout(()=>{
						document.getElementById('startstop').onmouseup();
					},1e3);
				}*/
					
				that.layoutChart();
			};
			input.onkeypress = function (event) {
				if (event.keyCode == 13) { 
					if (that.mode == 'Pulse') {
						document.getElementById('startstop').onmousedown();
						setTimeout(()=>{
							document.getElementById('startstop').onmouseup();
						},1e3);
					}
				}
			};
			input.style.padding = '0px';
			input.value = that.threshold[ear][index][1];
			cell.appendChild(input);
			if(widgetUI){jQuery(input).button();}
		}
		cell.style.width = cellWidth;
	}
	
	// summary chart
	var summary = document.createElement('div');
	summary.id = 'summary';
	summary.style.height = '60%';
	summary.style.left = '1%';
	summary.style.position = 'absolute';
	summary.style.top = '24%';
	summary.style.width = '97%';
	summary.style.zIndex = -1;
	main.appendChild(summary);
	this.layoutChart();
	
	// control table
	var table = document.createElement('table');
	table.className = 'ui-widget-content';
	table.style.bottom = '0%';
	table.style.fontSize = 'Smaller';
	table.style.height = '10%';
	table.style.left = '1%';
	table.style.marginBottom = '8px';
	table.style.position = 'absolute';
	table.style.width = '98%';
	main.appendChild(table);

	// 
	var row = table.insertRow(0);
	row.style.height = '100%';
	
	// active
	var cell = row.insertCell(0);
	cell.innerHTML = 'Active:';
	cell.style.textAlign = 'right';
	cell.style.width = '10%';//10
	
	// ear
	var cell = row.insertCell(1);
	cell.style.width = '10%';//20
	var select = layout.select(['Left','Right']);
	select.id = 'ear';
	select.onchange = function () { that.ear = this.selectedIndex; };
	select.selectedIndex = that.ear;
	select.style.width = '30%';
	cell.appendChild(select);
	jQuery(select).selectmenu({change:select.onchange});
	
	// frequency
	var cell = row.insertCell(2);
	cell.style.width = '10%';//30
	var input = document.createElement('input');
	input.id = 'frequency';
	input.value = this.frequency;
	jQuery(input).button();
	cell.appendChild(input);
	
	// Hz
	var cell = row.insertCell(3);
	cell.innerHTML = 'Hz';
	cell.style.textAlign = 'left';
	cell.style.width = '5%';//35
	
	// gain
	var cell = row.insertCell(4);
	cell.style.width = '10%';//45
	var input = document.createElement('input');
	input.id = 'gain';
	input.value = this.gain;
	jQuery(input).button();
	cell.appendChild(input);
	
	// db and adjustment buttons
	var cell = row.insertCell(5);
	cell.innerHTML = 'dB';
	cell.style.textAlign = 'left';
	cell.style.width = '30%';//75
	var button = document.createElement('button');
	button.innerHTML = '-';
	button.onclick = function () { 
		that.gain -= 2;
		that.threshold[that.ear][that.index][1] = that.gain;
		that.layout();
	};
	button.style.marginLeft = '2%';
	button.style.width = '20%';
	jQuery(button).button();
	cell.appendChild(button);
	var button = document.createElement('button');
	button.innerHTML = '+';
	button.onclick = function () { 
		that.gain = Math.min(that.gain+2,100);
		that.threshold[that.ear][that.index][1] = that.gain;
		that.layout();
	};
	button.style.marginLeft = '2%';
	button.style.width = '20%';
	jQuery(button).button();
	cell.appendChild(button);
	
	// play
	var cell = row.insertCell(6);
	cell.style.width = '15%';//85
	
	// start || stop
	var button = document.createElement('button');
	button.id = 'startstop';
	button.innerHTML = (this.mode == 'Continuous') ? 'Start' : 'Pulse';
	toggle = function () {
		if (!this.playing) {
			var now = audio.currentTime;
    		that.audio.volume.gain.cancelScheduledValues(audio.currentTime);
    		that.audio.volume.gain.setValueAtTime(0,audio.currentTime);
			that.audio.volume.gain.linearRampToValueAtTime(1,audio.currentTime+0.02);
			if (that.mode=='Continuous'){jQuery(this).button({label:'Stop'});}
			else {jQuery(this).button({label:'Playing'});}
			this.playing = true;
		} else {
    		that.audio.volume.gain.cancelScheduledValues(audio.currentTime);
    		that.audio.volume.gain.setValueAtTime(that.audio.volume.gain.value,audio.currentTime);
			that.audio.volume.gain.linearRampToValueAtTime(0.001,audio.currentTime+0.02);
			if(that.mode=='Continuous'){jQuery(this).button({label:'Start'});}
			else{jQuery(this).button({label:'Pulse'});}
			this.playing = false;
		}
	};
	if (this.mode == 'Continuous') { button.onclick = toggle; }
	else { 
		button.onmousedown = toggle; 
		button.touchstart = function(){alert('start')}; 
		button.onmouseup = toggle; 
		button.touchend = function(){alert('end')};
	}
	button.style.height = '100%';
	button.style.width = '100%';
	button.style.zindex = 10;
	jQuery(button).button();
	if(iOS){FastClick(button);}
	cell.appendChild(button);
	
	// footer
	layout.footer();
	
	// settings
	var image = document.createElement('img');
	image.onclick = ()=>{that.settings()};
	image.src = 'images/settings.png';
	image.style.cssFloat = 'left';
	image.style.height = '100%';
	image.style.maxWidth = '20vw';
	if(iOS){FastClick(image)}
	footer.appendChild(image);
};
Audiogram.prototype.layoutChart = function() {
	var that = this;
  
	var data = new google.visualization.DataTable();
	data.addColumn('number','Frequency');
	data.addColumn('number','Left');
	data.addRows(this.threshold[0]);
	
	var newdata = new google.visualization.DataTable();
	newdata.addColumn('number','Frequency');
	newdata.addColumn('number','Right');
	newdata.addRows(this.threshold[1]);
	data = google.visualization.data.join(data, newdata, 'full', [[0, 0]], [1], [1]);

	//
	var chart = new google.visualization.ScatterChart(document.getElementById('summary'));
	
	// data selection callback
	function selectHandler() {
		var selectedItem = chart.getSelection()[0];
		if (selectedItem) {
			that.ear = selectedItem.column-1;
			document.getElementById('ear').selectedIndex = that.ear;
			that.index = selectedItem.row;
			document.getElementById('frequency').selectedIndex = that.index;
			document.getElementById('frequency').onchange();
			that.gain = data.getValue(selectedItem.row, selectedItem.column);
			document.getElementById('gain').value = that.gain;
			document.getElementById('gain').onchange();
		}
	}
	google.visualization.events.addListener(chart,'select',selectHandler);
		var options = {
		chartArea: {left:'13%', height:'70%', width:'82%'},
		hAxis: {
			logScale: true, 
			maxValue: 16000, 
			minValue: 100,
			textStyle : {
				fontSize: 24
			},
			ticks: [
				{v:125, f:'125'}, 
				{v:250, f:'250'}, 
				{v:500, f:'500'}, 
				{v:1000, f:'1000'}, 
				{v:2000, f:'2000'}, 
				{v:4000, f:'4000'}, 
				{v:8000, f:'8000'},
				{v:16000, f:'16000'}
			], 
			title: 'Frequency (Hz)',
			titleTextStyle : {
				fontSize: 24
			},
		},
		legend: {position: 'none'},
		series: {
            0: {lineWidth:2},
            1: {lineWidth:2}
        },
		vAxis: {
			direction: -1, 
			maxValue: 100, 
			minValue: -10,
			textStyle : {
				fontSize: 24
			},
			ticks: [
				{v:-10, f:''}, 
				{v:0, f:'0'}, 
				{v:10, f:''}, 
				{v:20, f:'20'}, 
				{v:30, f:''}, 
				{v:40, f:'40'}, 
				{v:50, f:''}, 
				{v:60, f:'60'}, 
				{v:70, f:''}, 
				{v:80, f:'80'}, 
				{v:90, f:''}, 
				{v:100, f:'100'}
			],
			title: 'Detection Threshold (dB)',
			titleTextStyle : {
				fontSize: 24
			},
		}
	};
	chart.draw(data, options);
};
Audiogram.prototype.settings = function() {
	var that = this;
	
	// main
	var main = layout.main('Settings', ()=>{that.layout()},
		{ okay : ()=>{that.layout()} }
	);
	
	// settings
	var settings = document.createElement('div');
	settings.className = 'ui-widget-content';
	main.appendChild(settings);
	
	// settings table
	var table = document.createElement('table');
	table.style.width = '100%';
	settings.appendChild(table);
	var rowIndex = -1;
	
	// playback mode continuous|pulse
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Playback mode:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = document.createElement('select');
	select.onchange = function () {
		that.audio.volume.disconnect();
		that.mode = this.value;
		that.tone();
	}
	select.style.fontSize = '100%';
	select.style.width = '100%';
	options = ['Continuous','Pulse'];
	for (let a = 0; a < options.length; a++) {
		var option = document.createElement('option');
		option.innerHTML = options[a];
		option.value = options[a];
		select.appendChild(option);
	}
	select.value = this.mode;
	cell.appendChild(select);
	if(widgetUI){jQuery(select).selectmenu({change:select.onchange})};
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	// modulation on|off
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Modulation:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = document.createElement('select');
	select.onchange = function () {
		that.modulation = this.value == 'Off' ? false : true;
		that.audio.modulationGain.gain.value = that.modulation ? 1 : 0;
	}
	select.style.fontSize = '100%';
	select.style.width = '100%';
	options = ['Off','On'];
	for (let a = 0; a < options.length; a++) {
		var option = document.createElement('option');
		option.innerHTML = options[a];
		option.value = options[a];
		select.appendChild(option);
	}
	select.value = this.modulation?'On':'Off';
	cell.appendChild(select);
	if(widgetUI){jQuery(select).selectmenu({change:select.onchange})};
	var cell = row.insertCell(2);
	cell.style.width = '20%';
};
Audiogram.prototype.tone = function() {
	if (typeof audio === 'undefined') {audio = new AudioContext();}
	
	// source
	this.audio.source = audio.createOscillator();
	this.audio.source.frequency.value = this.frequency;
	
	// gain
	this.audio.gain = audio.createGain();
	
	// modulation
	this.audio.modulation = audio.createOscillator();
	this.audio.modulation.frequency.value = 1;
	this.audio.modulationGain = audio.createGain();
	this.audio.modulationGain.gain.value = this.modulation ? 1 : 0;
		
	// left ear gain
	this.audio.gainLeft = audio.createGain();
 	this.audio.gainLeft.gain.value = 0;
 	
 	// right ear gain
 	this.audio.gainRight = audio.createGain();
 	this.audio.gainRight.gain.value = 0;
	
	// stereo merger
	this.audio.merger = audio.createChannelMerger(2);
	
	// volume
	this.audio.volume = audio.createGain();
	this.audio.volume.gain.value = 0;
	
	// connect
	this.audio.source.connect(this.audio.gain);
	this.audio.modulation.connect(this.audio.modulationGain);
	this.audio.modulationGain.connect(this.audio.gain.gain);
	this.audio.gain.connect(this.audio.gainLeft);
	this.audio.gain.connect(this.audio.gainRight);
	this.audio.gainLeft.connect(this.audio.merger,0,0);
	this.audio.gainRight.connect(this.audio.merger,0,1);
	this.audio.merger.connect(this.audio.volume);
	this.audio.volume.connect(audio.destination);
	
	// start
	this.audio.modulation.start(0);
	this.audio.source.start(0);
};