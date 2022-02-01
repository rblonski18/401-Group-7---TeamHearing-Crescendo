function mrt(settings) {
	activity = new AFC({
		alternatives: 6,
		behavior: 'Constant',
		chances: Infinity,
		material: new MRT(),
		options: {percept: false, speech: true},
		snr: Infinity,
		trials: 10
	});
	for (var key in settings) { activity[key] = settings[key]; }
	activity.init();
}
function MRT() {
	this.ID = 'mrt';
	this.audio = 'On';
	this.gender = [];
	this.genders = ['M','W'];
	this.index = 0;
	this.path = 'data/mrt/';
	this.talker = undefined;
	this.talkers = ['f1'];//['f1','f2','m1','m2'];
	this.title = 'Modified Rhymes';
	this.titleShort = 'MRT';
	this.video = 'On';
	this.words = [];
	this.wordsAll = this.wordsList();
	this.words = this.wordsAll[0];
}
MRT.prototype.random = function () {
	var that = this;
	
	// next set of words
	this.words = this.wordsAll[this.index++];
	setTimeout(function () {
		that.shuffle();
	}, 1000);
	
	// random talker
	this.talker = this.talkers[Math.floor(Math.random()*this.talkers.length)];
	
	// index of next item
	return Math.floor(this.words.length*Math.random());
};
MRT.prototype.save = function (data) {
	data.audio = this.audio; 
	data.video = this.video;
	return data;
}
MRT.prototype.settings = function (table,rowIndex) {
	var that = this;
	
	// audio on|off
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Audio:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select(['Off','On']);
	select.onchange = function () { that.audio = this.value; };
	select.value = this.audio;
	cell.appendChild(select);
	if (widgetUI) { $(select).selectmenu({change:select.onchange}); }
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
	var select = layout.select(['Off','On']);
	select.onchange = function () { that.video = this.value; };
	select.value = this.video;
	cell.appendChild(select);
	if (widgetUI) { $(select).selectmenu({change:select.onchange}); }
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	return rowIndex;
};
MRT.prototype.shuffle = function () {
	// next set of words
	this.words = this.wordsAll[this.index++];
	
	//
	for (var a = 0; a < this.words.length; a++) {
		document.getElementById('afc'+a).innerHTML = this.words[a];
	}
};
MRT.prototype.stimulus = function (call,init) {
	if (init) {
		this.gender = this.genders[Math.floor(this.genders.length*Math.random())];
		this.talker = this.talkers[Math.floor(this.talkers.length*Math.random())];
	}
	
	// media source
	var media = document.getElementById('mediaElement');
	media.src = this.path+this.talker+'/'+this.words[call]+'_1.mp4';
	
	// media controls
	if (this.audio == 'Off') {
		media.controls = false;
		media.muted = true;
	} else {
		media.controls = true;
	}
	
	// send media to processor
	processor.signal(media);
}
MRT.prototype.wordsList = function () {
	var index = 0, words = [];
	words[index++] = ['went','sent','bent','dent','tent','rent'];
	words[index++] = ['hold','cold','told','fold','sold','gold'];
	words[index++] = ['pat','pad','pan','path','pack','pass'];
	words[index++] = ['lane','lay','late','lake','lace','lame'];
	words[index++] = ['kit','bit','fit','hit','wit','sit'];
	words[index++] = ['must','bust','gust','rust','dust','just'];
	words[index++] = ['teak','team','teal','teach','tear','tease'];
	words[index++] = ['din','dill','dim','dig','dip','did'];
	words[index++] = ['bed','led','fed','red','wed','shed'];
	words[index++] = ['pin','sin','tin','fin','din','win'];
	words[index++] = ['dug','dung','duck','dud','dub','dun'];
	words[index++] = ['sum','sun','sung','sup','sub','sud'];
	words[index++] = ['seep','seen','seethe','seek','seem','seed'];
	words[index++] = ['not','tot','got','pot','hot','lot'];
	words[index++] = ['vest','test','rest','best','west','nest'];
	words[index++] = ['pig','pill','pin','pip','pit','pick'];
	words[index++] = ['back','bath','bad','bass','bat','ban'];
	words[index++] = ['way','may','say','pay','day','gay'];
	words[index++] = ['pig','big','dig','wig','rig','fig'];
	words[index++] = ['pale','pace','page','pane','pay','pave'];
	words[index++] = ['cane','case','cape','cake','came','cave'];
	words[index++] = ['shop','mop','cop','top','hop','pop'];
	words[index++] = ['coil','oil','soil','toil','boil','foil'];
	words[index++] = ['tan','tang','tap','tack','tam','tab'];
	words[index++] = ['fit','fib','fizz','fill','fig','fin'];
	words[index++] = ['same','name','game','tame','came','fame'];
	words[index++] = ['peel','reel','feel','eel','keel','heel'];
	words[index++] = ['hark','dark','mark','bark','park','lark'];
	words[index++] = ['heave','hear','heat','heal','heap','heath'];
	words[index++] = ['cup','cut','cud','cuff','cuss','cull'];
	words[index++] = ['thaw','law','raw','paw','jaw','saw'];
	words[index++] = ['pen','hen','men','then','den','ten'];
	words[index++] = ['puff','puck','pub','pus','pup','pun'];
	words[index++] = ['bean','beach','beat','beak','bead','beam'];
	words[index++] = ['heat','neat','feat','seat','meat','beat'];
	words[index++] = ['dip','sip','hip','tip','lip','rip'];
	words[index++] = ['kill','kin','kit','kick','king','kid'];
	words[index++] = ['hang','sang','bang','rang','fang','gang'];
	words[index++] = ['took','cook','look','hook','shook','book'];
	words[index++] = ['mass','math','map','mat','man','mad'];
	words[index++] = ['ray','raze','rate','rave','rake','race'];
	words[index++] = ['save','same','sale','sane','sake','safe'];
	words[index++] = ['fill','kill','will','hill','till','bill'];
	words[index++] = ['sill','sick','sip','sing','sit','sin'];
	words[index++] = ['bale','gale','sale','tale','pale','male'];
	words[index++] = ['wick','sick','kick','lick','pick','tick'];
	words[index++] = ['peace','peas','peak','peach','peat','peal'];
	words[index++] = ['bun','bus','but','bug','buck','buff'];
	words[index++] = ['sag','sat','sass','sack','sad','sap'];
	words[index++] = ['fun','sun','bun','gun','run','nun'];
	
	// alphabetize
	function sortWithIndices(toSort) {
		for (var i = 0; i < toSort.length; i++) {
			toSort[i] = [toSort[i], i];
		}
		toSort.sort(function(left, right) {
			return left[0] < right[0] ? -1 : 1;
		});
		toSort.sortIndices = [];
		for (var j = 0; j < toSort.length; j++) {
			toSort.sortIndices.push(toSort[j][1]);
			toSort[j] = toSort[j][0];
		}
		return toSort;
	}
	for (a=0; a<50; a++) {
		sortWithIndices(words[a]);
	}
	
	return words;
};
MRT.prototype.wordTable = function () {
	var that = this;
	
	// table
	var table = document.getElementById('afc_table');
	table.innerHTML = '';
	
	// words
	var words = this.words[this.trial];
	if (this.video == 'On') {
		var columns = 2;
		var rows = 3;
	} else {
		var columns = 3;
		var rows = 2;
	}
	var height = 100/rows; 
	var width = 100/columns;
	
	//
	for (var index = 0, len = words.length; index < len; index++) {
		word = words[index];
		
		// build cells
		if (index%columns == 0) {
			var row = table.insertRow(index/columns);
			row.style.width = '100%';
		} else {
			var row = table.rows[Math.floor(index/columns)];
		}
		var cell = row.insertCell(index%columns);
		cell.style.height = height+'%';
		cell.style.width = width+'%';
			
		// response buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.index = index;
		button.innerHTML = word+'<br>';
		button.onclick = function() {
			switch (that.mode) {
			case 'practice':
				media.style.display = 'none';
				media = document.getElementById('practice_'+this.index);
				media.style.display = '';
				try { media.currentTime = 0; } catch ( error ) {};
				media.play();
				return;
			case 'test':
				that.correct = ( this.index == that.call[that.trial] );
				if ( that.correct ) {
				
					// correct
					that.score[that.trial] = 1;
					if (activity.behavior != 'Adaptive') {
						document.getElementById('score'+that.trial).src = '/images/score-yay.png';
					}
				} else {
				
					// incorrect
					that.score[that.trial] = 0;
					if (activity.behavior != 'Adaptive') {
						document.getElementById('score'+that.trial).src = '/images/score-nay.png';
					}
					
					// practice
					if (that.practice == 'On') {
						document.getElementById('message').innerHTML = 
							'The correct answer was "'+'<span style=\'color:blue\'>'+words[that.call[that.trial]]+'</span>'+'".<br>'
							+'Click on any item to practice.';
						document.getElementById('repeat').style.visibility = 'hidden';
						document.getElementById('next').style.display = '';
						
						// preload practice media
						for (item = 0; item < 6; item++) {
							if (that.practiced) {
							
								// no need to preload if already practiced
								hiddenMedia = document.getElementById('practice_'+item);
								hiddenMedia.src = '/data/mrt/' + that.directory + '/' + that.words[that.trial][item] + '_1' + that.filetype;
											
							} else {
							
								// preload
								if (that.video == 'On') {
									var hiddenMedia = document.createElement('video');
									if (that.audio == 'Off') { hiddenMedia.muted = true; }
									hiddenMedia.style.display = 'none';
									hiddenMedia.style.height = '96%';
									hiddenMedia.style.left = '2%';
									hiddenMedia.style.position = 'absolute';
									hiddenMedia.style.top = '2%';
									hiddenMedia.style.width = '96%';
								} else {
									hiddenMedia = document.createElement('audio');
								}
								hiddenMedia.id = 'practice_'+item;
								hiddenMedia.preload = 'auto';
								hiddenMedia.src = '/data/mrt/'+that.directory+'/'+that.words[that.trial][item]+'_1'+that.filetype;
								document.getElementById('container').appendChild(hiddenMedia);
							}
						}
						that.mode = 'practice';
						that.practiced = true;
						return;
					}
				}
				that.next();
			}
		};
		button.style.height = '100%';
		button.style.padding = '0';
		button.style.width = '100%';
		button.word = word;
		jQuery(button).button();
		cell.appendChild(button);
	}
};