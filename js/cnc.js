function cnc() {
	activity = new AFC({
		alternatives: 3,
		chances: Infinity,
		controls: ['all','next'],
		material: new CNC(),
		mode: 'keywords',
		trials: 10
	});
	activity.test();
}
function CNC() {
	this.ID = 'cnc';
	this.list = Math.floor(10*Math.random());
	this.keywords = undefined;
	this.path = 'data/cnc/calibrated/';
	this.phrases = undefined;
	this.startmessage = 'Record phoneme errors in CNC word list.';
	this.title = 'CNC Word List';
	this.titleShort = 'CNC';
	
	// material information
	this.information();
}
CNC.prototype.information = function () {
	
	// prepare word lists
	var words;
	switch (Number(this.list)) {
		case 1:
			words = [
				'G/oo/se',
				'N/a/me',
				'Sh/o/re',
				'B/ea/n',
				'M/er/ge',
				'D/i/tch',
				'S/u/n',
				'T/ou/gh',
				'S/ei/ze',
				'L/ea/se',
				'H/o/me',
				'J/a/r',
				'P/a/d',
				'F/a/ll',
				'V/a/n',
				'J/u/g',
				'Y/ea/rn',
				'M/a/ke',
				'G/a/le',
				'T/oo/th',
				'P/a/tch',
				'B/oi/l',
				'H/a/te',
				'P/i/ck',
				'Kn/i/fe',
				'Wr/e/ck',
				'R/ou/t',
				'B/oa/t',
				'R/i/pe',
				'Wh/ee/l',
				'D/ea/d',
				'S/o/b',
				'M/e/ss',
				'W/i/sh',
				'Ch/o/re',
				'W/oo/d',
				'K/i/ng',
				'T/oa/d',
				'Ch/e/ck',
				'L/oo/p',
				'L/a/g',
				'S/a/lve',
				'D/i/me',
				'H/u/ll',
				'Th/i/n',
				'Sh/i/rt',
				'R/o/se',
				'F/i/t',
				'K/i/t',
				'C/a/pe'
			];
			break;
		case 2:
			words = [
				'G/ai/n',
				'H/i/ll',
				'F/er/n',
				'B/e/g',
				'L/a/te',
				'D/i/re',
				'D/o/dge',
				'L/o/ve',
				'C/oa/t',
				'Ch/oo/se',
				'G/er/m',
				'N/ur/se',
				'J/e/t',
				'L/ea/d',
				'R/i/ng',
				'R/oo/t',
				'W/a/g',
				'N/o/se',
				'B/ea/m',
				'P/a/ve',
				'R/e/d',
				'V/i/ne',
				'H/i/de',
				'C/a/r',
				'P/u/ff',
				'S/a/p',
				'M/u/ch',
				'Wh/i/ch',
				'G/oa/l',
				'T/a/lk',
				'H/a/sh',
				'Ch/oi/ce',
				'C/o/b',
				'Th/i/s',
				'R/ai/l',
				'W/ee/p',
				'S/ou/l',
				'B/ough/t',
				'D/a/m',
				'L/ea/k',
				'M/e/t',
				'S/ou/th',
				'Sh/i/p',
				'P/a/n',
				'T/i/re',
				'T/a/ll',
				'Sh/ou/ld',
				'F/a/ke',
				'M/oo/n',
				'S/u/ck'
			];
			break;
		case 3:
			words = [
				'H/ea/d',
				'N/u/mb',
				'B/a/r',
				'M/o/re',
				'F/ai/th',
				'S/oo/n',
				'T/o/ss',
				'L/i/fe',
				'H/u/t',
				'J/o/ke',
				'F/ou/r',
				'V/o/te',
				'K/ee/n',
				'Y/a/m',
				'M/a/te',
				'G/u/ll',
				'T/o/ne',
				'B/u/sh',
				'H/ou/se',
				'L/a/ke',
				'W/or/k',
				'B/e/ll',
				'P/er/ch',
				'P/ie/ce',
				'W/e/ll',
				'P/o/d',
				'D/i/p',
				'P/ur/ge',
				'N/oi/se',
				'R/a/t',
				'R/i/g',
				'Wh/a/t',
				'R/oo/m',
				'D/i/ke',
				'W/i/th',
				'R/ou/ge',
				'K/e/g',
				'Sh/ee/p',
				'Sh/i/ne',
				'T/o/ll',
				'D/a/b',
				'S/i/ze',
				'M/a/n',
				'L/ea/ve',
				'F/a/de',
				'J/ai/l',
				'S/u/ng',
				'G/a/p',
				'K/i/d',
				'Ch/i/n'
			];
			break;
		case 4:
			words = [
				'H/i/m',
				'L/a/p',
				'G/i/ve',
				'B/o/ne',
				'L/o/ng',
				'D/o/se',
				'F/oo/t',
				'Ch/u/m',
				'H/i/re',
				'P/au/se',
				'L/oa/n',
				'L/ou/d',
				'S/ai/d',
				'S/er/ve',
				'W/i/g',
				'P/a/ck',
				'B/ir/ch',
				'P/oo/l',
				'R/i/ce',
				'Wh/e/n',
				'K/ee/p',
				'C/a/n',
				'R/a/ge',
				'Sh/a/ke',
				'N/i/ce',
				'Y/ou/th',
				'H/oo/f',
				'V/oi/d',
				'J/o/b',
				'C/a/sh',
				'D/a/te',
				'W/ai/l',
				'R/ea/d',
				'T/a/ke',
				'B/u/g',
				'M/ir/th',
				'D/ea/l',
				'Ch/ie/f',
				'M/i/ll',
				'M/o/p',
				'Th/u/mb',
				'Sh/u/t',
				'Ph/o/ne',
				'W/a/r',
				'T/ow/er',
				'S/o/ck',
				'G/a/s',
				'N/e/t',
				'T/i/ll',
				'Wr/i/te'
			];
			break;
		case 5:
			words = [
				'L/u/ck',
				'C/a/re',
				'M/a/tch',
				'B/ea/ch',
				'B/oo/t',
				'H/a/lf',
				'N/u/dge',
				'Sh/o/p',
				'L/ea/n',
				'T/ow/n',
				'N/a/g',
				'P/ur/se',
				'C/oa/l',
				'H/u/sh',
				'S/o/re',
				'R/o/be',
				'Z/ea/l',
				'Y/o/ke',
				'L/i/ght',
				'R/ou/gh',
				'D/aw/n',
				'C/a/b',
				'D/o/ck',
				'T/ea/se',
				'W/or/m',
				'H/o/t',
				'B/a/ck',
				'F/oo/d',
				'T/e/ll',
				'M/y/th',
				'F/i/ve',
				'B/a/the',
				'M/ea/n',
				'Th/ou/ght',
				'D/i/m',
				'V/ei/l',
				'S/ai/l',
				'R/ai/d',
				'C/u/p',
				'W/i/re',
				'Th/e/n',
				'J/ui/ce',
				'G/a/ze',
				'P/e/g',
				'P/u/ll',
				'L/i/mb',
				'G/oo/d',
				'Kn/i/t',
				'S/i/ng',
				'Ch/a/lk'
			];
			break;
		case 6:
			words = [
				'D/u/ll',
				'M/o/de',
				'S/ear/ch',
				'B/a/d',
				'L/oo/k',
				'Ch/ee/se',
				'Sh/o/ne',
				'R/u/g',
				'Kn/o/ck',
				'F/i/re',
				'G/o/ne',
				'M/o/ve',
				'C/oo/l',
				'H/i/ke',
				'L/i/ve',
				'D/oo/r',
				'N/ie/ce',
				'B/ir/th',
				'M/a/p',
				'F/a/n',
				'N/i/ght',
				'J/a/m',
				'P/o/pe',
				'B/e/d',
				'P/a/ce',
				'C/a/t',
				'Sh/o/ck',
				'C/a/lf',
				'H/i/ss',
				'C/a/ge',
				'L/aw/n',
				'S/i/t',
				'J/o/t',
				'R/ai/se',
				'S/ou/r',
				'Ch/ai/n',
				'T/ea/m',
				'G/e/t',
				'T/u/be',
				'T/ur/n',
				'R/u/sh',
				'V/ea/l',
				'P/o/le',
				'W/e/b',
				'D/i/g',
				'Wh/i/p',
				'H/ow/l',
				'W/i/fe',
				'B/u/d',
				'W/i/ng'
			];
			break;
		case 7:
			words = [
				'G/ee/se',
				'H/o/le',
				'F/i/sh',
				'B/i/g',
				'L/au/gh',
				'D/u/mb',
				'F/a/ce',
				'C/o/ke',
				'G/e/m',
				'N/e/ck',
				'J/oi/n',
				'L/e/d',
				'R/i/b',
				'R/i/dge',
				'W/a/s',
				'N/a/p',
				'B/e/t',
				'P/a/ss',
				'R/ea/ch',
				'V/a/gue',
				'H/ea/t',
				'C/a/ll',
				'P/ear/l',
				'S/a/ck',
				'M/ou/th',
				'Y/ou/ng',
				'G/u/n',
				'T/a/r',
				'H/a/ve',
				'C/au/ght',
				'D/i/d',
				'Th/ir/d',
				'P/i/ne',
				'W/i/t',
				'S/i/de',
				'B/u/n',
				'L/o/se',
				'D/oo/m',
				'Ch/ee/k',
				'L/oo/t',
				'M/i/ne',
				'S/u/ch',
				'S/a/ve',
				'N/o/te',
				'T/o/p',
				'T/a/pe',
				'Sh/a/ll',
				'F/a/r',
				'M/o/le',
				'S/u/re'
			];
			break;
		case 8:
			words = [
				'M/o/ss',
				'C/ou/gh',
				'M/u/ff',
				'B/i/te',
				'C/a/lm',
				'H/ai/l',
				'P/oo/r',
				'Sh/aw/l',
				'L/ear/n',
				'T/ou/ch',
				'P/a/ge',
				'R/ea/l',
				'D/a/ze',
				'H/ur/l',
				'S/o/me',
				'R/o/t',
				'Wh/ea/t',
				'W/e/t',
				'L/oa/the',
				'S/a/d',
				'D/i/ve',
				'Ch/ea/p',
				'N/ea/r',
				'F/u/ss',
				'Th/e/re',
				'W/ee/k',
				'H/oo/p',
				'B/a/g',
				'G/ea/r',
				'Th/i/ng',
				'G/a/g',
				'N/oo/se',
				'B/a/th',
				'T/i/p',
				'F/oa/m',
				'V/ow/el',
				'S/ee/k',
				'R/oa/d',
				'D/e/n',
				'W/a/ke',
				'T/i/n',
				'J/er/k',
				'G/i/n',
				'P/o/se',
				'R/ai/n',
				'L/o/ck',
				'G/ui/de',
				'L/a/sh',
				'Sh/oo/t',
				'C/u/b'
			];
			break;
		case 9:
			words = [
				'F/ee/t',
				'N/ai/l',
				'Sh/ou/t',
				'B/a/ll',
				'M/o/b',
				'C/u/t',
				'S/oa/p',
				'T/oo/l',
				'S/a/ne',
				'L/i/p',
				'G/ir/l',
				'H/a/m',
				'N/ee/d',
				'D/e/ck',
				'V/oi/ce',
				'H/a/ze',
				'Y/e/s',
				'M/i/re',
				'D/o/g',
				'T/i/ck',
				'P/i/ll',
				'B/oo/k',
				'F/u/dge',
				'P/ow/er',
				'L/a/ck',
				'Wr/o/ng',
				'R/ea/p',
				'B/ea/t',
				'P/u/n',
				'W/a/tch',
				'Ch/ee/r',
				'S/i/n',
				'M/u/d',
				'Wh/i/te',
				'Ch/ai/r',
				'W/or/d',
				'H/e/n',
				'T/i/me',
				'C/a/tch',
				'L/oa/f',
				'L/a/the',
				'R/oo/f',
				'C/ur/ve',
				'G/o/t',
				'Th/i/ne',
				'Sh/a/de',
				'R/a/g',
				'D/i/sh',
				'J/a/zz',
				'B/o/th'
			];
			break;
		case 10:
			words = [
				'L/u/ng',
				'Ch/a/t',
				'M/ee/k',
				'B/ur/n',
				'C/au/se',
				'H/ai/r',
				'N/i/ck',
				'R/u/n',
				'L/oa/d',
				'Th/a/tch',
				'N/ea/t',
				'P/ea/k',
				'C/oi/n',
				'H/ur/t',
				'S/a/g',
				'R/i/de',
				'Y/ou/r',
				'W/i/tch',
				'L/oo/se',
				'R/o/b',
				'D/ea/th',
				'C/a/ve',
				'M/oo/d',
				'D/i/n',
				'S/e/ll',
				'Wh/i/le',
				'H/i/t',
				'B/a/ke',
				'F/oo/l',
				'Sh/a/ck',
				'F/i/ne',
				'M/ou/se',
				'B/i/t',
				'T/er/m',
				'D/ee/p',
				'T/ow/el',
				'R/o/pe',
				'P/i/le',
				'C/o/ne',
				'W/a/sh',
				'S/u/b',
				'J/a/de',
				'G/o/re',
				'P/a/lm',
				'P/a/th',
				'L/o/t',
				'G/ue/ss',
				'J/u/dge',
				'S/a/fe',
				'Ch/i/ll'
			];
	}

	// prepare as phoneme list
	var phonemes = [];
	for (a = 0; a < words.length; a++) {
		phonemes[a] = words[a].split('/');
		words[a] = words[a].replace(/\//g,'');
	}
	
	// prep into this
	this.phrases = words;
	this.keywords = phonemes;
};
CNC.prototype.protocols = function () {};
CNC.prototype.save = function (data) {
	//
	var correctItems = 0,
		correctParts = 0, 
		totalItems = activity.score.length, 
		totalParts = 0;
	for (var a = 0; a < activity.score.length; a++) {
		if (activity.score[a].sum() == activity.score[a].length) {
			correctItems++;
		}
		correctParts += activity.score[a].sum();
		totalParts += activity.score[a].length;
	}
	
	// percent correct for items and parts
	var pc1 = 100*correctItems/totalItems;
	var pc2 = 100*correctParts/totalParts;
	
	// score (message)
	var pc1 = 100*correctItems/totalItems;
	var pc2 = 100*correctParts/totalParts;
	message = 'Words: '+correctItems+' out of '+totalItems+' correct ('+pc1.toFixed(1)+' %). </br>'
		+'Phonemes: '+correctParts+' out of '+totalParts+' correct ('+pc2.toFixed(1)+' %).' ;
	layout.message('Score',message);
	
	// phonemes missed (message)
	var missed = new Array;
	for (var a = 0; a < activity.score.length; a++) {
		for (var b = 0; b < activity.score[a].length; b++) {
			if (activity.score[a][b] == 0) {
				missed.push(activity.material.keywords[a][b]);
			}
		}
	}
	var title = 'Phonemes Missed';
	var message = missed.join(', ');
	layout.message(title, message);
	
	// save score into data
	data.score = activity.score.join(';');
	return data;
}
CNC.prototype.select = function (index) {
	// buttons and message
	for (var a = 0; a < 3; a++) {
		var button = document.getElementById('afc'+a); 
		button.innerHTML = this.keywords[index][a]; 
		try { button.removeChild(button.childNodes[1]); } catch(error) {}
	}
	document.getElementById('all').index = 0;
	document.getElementById('message').innerHTML = this.phrases[index];
};
CNC.prototype.settings = function (table, rowIndex) {
	var that = this;

	// list
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'List:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var options = [];
	for (var a = 0; a < 10; a++) { options[a] = String(a+1); }
	var select = layout.select(options);
	select.onchange = function () {
		that.list = this.value;
		that.information();
	};
	select.value = this.list;
	$(cell).append(select);
	if (true) { jQuery(select).selectmenu({change:select.onchange}); }
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	return rowIndex;
};
CNC.prototype.special = function () {
	var missed = new Array;
	for (var a = 0; a < activity.score.length; a++) {
		for (var b = 0; b < activity.score[a].length; b++) {
			if (activity.score[a][b] == 0) {
				missed.push(activity.material.keywords[a][b]);
			}
		}
	}
	var title = 'Phonemes Missed';
	var message = missed.join(', ');
	layout.message(title, message);
};