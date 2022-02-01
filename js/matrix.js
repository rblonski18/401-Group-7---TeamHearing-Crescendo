function matrix(settings) {
	activity = new Keywords({
		alternatives: 5,
		controls: ['all','next'],
		material: new Matrix()
	});
	
	// overrides
	for (let key in settings) { activity[key] = settings[key]; }
	
	// initialize
	activity.init();
}
function Matrix(settings) {
	this.ID = 'matrix';
	this.available = [];
	this.filetype = '.wav';
	this.index = 0;
	this.keywords = undefined;
	this.material = 'original';
	this.path = 'data/matrix/';
	this.phrases = undefined;
	this.talker = [];
	this.title = 'Matrix Sentence Test';
	this.titleShort = 'Matrix';
	
	// overrides
	for (let key in settings) { this[key] = settings[key]; }
	
	// sentence information
	this.information();
}
Matrix.prototype.information = function () {
	// keywords
	const keywords = [
		'YUVAL','KIBEL','TISHA','KISAOT','GDOLIM',
		'GEFEN','SIDER','MEA','SFARIM','XADASHIM',
		'GILAD','LAKAX','SHLOSHA','SULAMOT','ZOLIM',
		'EREZ','HEVIE','ARABA','MEILIM','SHXORIM',
		'ROEI','HEXZIK','KAMA','EFRONOT','GDOLIM',
		'TOMER','KANA','TISHA','MATBEOT','YESHANIM',
		'GEFEN','HEVIE','SHISHA','MEILIM','KTANIM',
		'GEFEN','NATAN','SHIVA','EFRONOT','YAFIM',
		'ODED','SIDER','KAMA','NEROT','YESHANIM',
		'TOMER','RATZA','SHMONA','PRAXIM','YERUKIM',
		'ODED','MATZA','XAMISHA','PRAXIM','KTANIM',
		'EYAL','LAKAX','MEA','SFARIM','YERUKIM',
		'OPHIR','NATAN','SHMONA','SANDALIM','MAVRIKIM',
		'EREZ','MATZA','XAMISHA','KISAOT','ZOLIM',
		'EDEN','RATZA','ASARA','KISOT','YERUKIM',
		'GILAD','LAKAX','SHLOSHA','SULAMOT','SHXORIM',
		'EDEN','TZIYER','TISHA','EFRONOT','SHXORIM',
		'EDEN','HEXZIK','XAMISHA','NEROT','MAVRIKIM',
		'ROEI','NATAN','SHIVA','SULAMOT','XADASHIM',
		'EREZ','SIDER','MEA','SAKINIM','KTANIM',
		'YUVAL','TZIYER','SHISHA','NEROT','TZEHUBIM',
		'ROEI','TZIYER','ARABA','SANDALIM','TZEHUBIM',
		'OPHIR','KIBEL','ASARA','SAKINIM','TZEHUBIM',
		'ODED','KANA','SHISHA','MEILIM','ZOLIM',
		'EYAL','KIBEL','SHIVA','SAKINIM','YAFIM',
		'TOMER','HEXZIK','SHMONA','MATBEOT','GDOLIM',
		'YUVAL','KANA','ARABA','SANDALIM','MAVRIKIM',
		'OPHIR','HEVIE','ASARA','SFARIM','XADASHIM',
		'GILAD','RATZA','SHLOSHA','PRAXIM','YAFIM',
		'EYAL','MATZA','KAMA','MATBEOT','YESHANIM',
		'GILAD','SIDER','ASARA','SAKINIM','ZOLIM',
		'TOMER','RATZA','SHMONA','PRAXIM','YERUKIM',
		'EREZ','RATZA','SHMONA','PRAXIM','GDOLIM',
		'GILAD','LAKAX','SHLOSHA','SULAMOT','SHXORIM',
		'EREZ','LAKAX','SHISHA','PRAXIM','SHXORIM',
		'OPHIR','LAKAX','XAMISHA','KISOT','YAFIM',
		'EDEN','HEXZIK','XAMISHA','NEROT','MAVRIKIM',
		'TOMER','TZIYER','TISHA','EFRONOT','YESHANIM',
		'GEFEN','NATAN','SHIVA','EFRONOT','YAFIM',
		'EDEN','KANA','TISHA','SANDALIM','MAVRIKIM',
		'EYAL','MATZA','KAMA','MATBEOT','YESHANIM',
		'EYAL','HEXZIK','SHIVA','SULAMOT','YERUKIM',
		'YUVAL','MATZA','ARABA','SFARIM','TZEHUBIM',
		'EREZ','SIDER','MEA','SAKINIM','KTANIM',
		'GEFEN','HEVIE','SHIVA','MATBEOT','YERUKIM',
		'ROEI','HEVIE','SHISHA','MEILIM','MAVRIKIM',
		'ODED','KANA','SHISHA','MEILIM','ZOLIM',
		'ODED','KIBEL','SHLOSHA','SANDALIM','XADASHIM',
		'OPHIR','RATZA','SHLOSHA','MEILIM','YAFIM',
		'GEFEN','KANA','MEA','MATBEOT','SHXORIM',
		'YUVAL','SIDER','ASARA','SULAMOT','YESHAIM',
		'YUVAL','KIBEL','TISHA','KISAOT','GDOLIM',
		'ROEI','KIBEL','SHMONA','EFRONOT','KTANIM',
		'GILAD','NATAN','XAMISHA','KISAOT','XADASHIM',
		'ODED','MATZA','ARABA','SFARIM','ZOLIM',
		'EDEN','NATAN','KAMA','NEROT','KTANIM',
		'OPHIR','HEVIE','ASARA','SFARIM','XADASHIM',
		'EYAL','HEXZIK','MEA','NEROT','TZEHUBIM',
		'EREZ','HEXZIK','ASARA','MATBEOT','SHXORIM',
		'GEFEN','SIDER','MEA','SFARIM','XADASHIM'  
	];
	let items = 5, orderedKeywords = [];
	for (let a = 0; a < 60; a++) {
		orderedKeywords[a] = [];
		for (let item = 0; item < items; item++) {
			orderedKeywords[a][item] = keywords[a*items+item];
		}
	}
	this.keywords = orderedKeywords;
	
	// carrier phrases
	const phrases = [
		'YUVAL KIBEL TISHA KISAOT GDOLIM.',
		'GEFEN SIDER MEA SFARIM XADASHIM.',
		'GILAD LAKAX SHLOSHA SULAMOT ZOLIM.',
		'EREZ HEVIE ARABA MEILIM SHXORIM.',
		'ROEI HEXZIK KAMA EFRONOT GDOLIM.',
		'TOMER KANA TISHA MATBEOT YESHANIM.',
		'GEFEN HEVIE SHISHA MEILIM KTANIM.',
		'GEFEN NATAN SHIVA EFRONOT YAFIM.',
		'ODED SIDER KAMA NEROT YESHANIM.',
		'TOMER RATZA SHMONA PRAXIM YERUKIM.',
		'ODED MATZA XAMISHA PRAXIM KTANIM.',
		'EYAL LAKAX MEA SFARIM YERUKIM.',
		'OPHIR NATAN SHMONA SANDALIM MAVRIKIM.',
		'EREZ MATZA XAMISHA KISAOT ZOLIM.',
		'EDEN RATZA ASARA KISAOT YERUKIM.',
		'GILAD LAKAX SHLOSHA SULAMOT SHXORIM.',
		'EDEN TZIYER TISHA EFRONOT SHXORIM.',
		'EDEN HEXZIK XAMISHA NEROT MAVRIKIM.',
		'ROEI NATAN SHIVA SULAMOT XADASHIM.',
		'EREZ SIDER MEA SAKINIM KTANIM.',
		'YUVAL TZIYER SHISHA NEROT TZEHUBIM.',
		'ROEI TZIYER ARABA SANDALIM TZEHUBIM.',
		'OPHIR KIBEL ASARA SAKINIM TZEHUBIM.',
		'ODED KANA SHISHA MEILIM ZOLIM.',
		'EYAL KIBEL SHIVA SAKINIM YAFIM.',
		'TOMER HEXZIK SHMONA MATBEOT GDOLIM.',
		'YUVAL KANA ARABA SANDALIM MAVRIKIM.',
		'OPHIR HEVIE ASARA SFARIM XADASHIM.',
		'GILAD RATZA SHLOSHA PRAXIM YAFIM.',
		'EYAL MATZA KAMA MATBEOT YESHANIM.',
		'GILAD SIDER ASARA SAKINIM ZOLIM.',
		'TOMER RATZA SHMONA PRAXIM YERUKIM.',
		'EREZ RATZA SHMONA PRAXIM GDOLIM.',
		'GILAD LAKAX SHLOSHA SULAMOT SHXORIM.',
		'EREZ LAKAX SHISHA PRAXIM SHXORIM.',
		'OPHIR LAKAX XAMISHA KISAOT YAFIM.',
		'EDEN HEXZIK XAMISHA NEROT MAVRIKIM.',
		'TOMER TZIYER TISHA EFRONOT YESHANIM.',
		'GEFEN NATAN SHIVA EFRONOT YAFIM.',
		'EDEN KANA TISHA SANDALIM MAVRIKIM.',
		'EYAL MATZA KAMA MATBEOT YESHANIM.',
		'EYAL HEXZIK SHIVA SULAMOT YERUKIM.',
		'YUVAL MATZA ARABA SFARIM TZEHUBIM.',
		'EREZ SIDER MEA SAKINIM KTANIM.',
		'GEFEN HEVIE SHIVA MATBEOT YERUKIM.',
		'ROEI HEVIE SHISHA MEILIM MAVRIKIM.',
		'ODED KANA SHISHA MEILIM ZOLIM.',
		'ODED KIBEL SHLOSHA SANDALIM XADASHIM.',
		'OPHIR RATZA SHLOSHA MEILIM YAFIM.',
		'GEFEN KANA MEA MATBEOT SHXORIM.',
		'YUVAL SIDER ASARA SULAMOT YESHAIM.',
		'YUVAL KIBEL TISHA KISAOT GDOLIM.',
		'ROEI KIBEL SHMONA EFRONOT KTANIM.',
		'GILAD NATAN XAMISHA KISAOT XADASHIM.',
		'ODED MATZA ARABA SFARIM ZOLIM.',
		'EDEN NATAN KAMA NEROT KTANIM.',
		'OPHIR HEVIE ASARA SFARIM XADASHIM.',
		'EYAL HEXZIK MEA NEROT TZEHUBIM.',
		'EREZ HEXZIK ASARA MATBEOT SHXORIM.',
		'GEFEN SIDER MEA SFARIM XADASHIM.'
	];
	this.phrases = phrases;
};
Matrix.prototype.select = function () {
	// shuffle deck
	if (this.available.length == 0) {	
		this.available.sequence(this.keywords.length);
		this.available.shuffle();
	}
	
	// deal
	this.index = this.available.pop();
	
	// buttons and message
	for (let a = 0; a < 5; a++) {
		var button = document.getElementById('keyword'+a); 
		button.innerHTML = this.keywords[this.index][a]; 
		//try { button.removeChild(button.childNodes[1]); } catch (error) { console.dir(error); }
	}
	document.getElementById('all').index = 0;
	document.getElementById('message').innerHTML = this.phrases[this.index];
	
	// define source and send to processor
	switch (this.material) {
		case 'original':
			this.filename = this.path+this.material+'/s'+String(this.index+1)+this.filetype; break;
		case 'vocoded':
			this.filename = this.path+this.material+'/s'+String(this.index+1)+'_processed'+this.filetype;
	}
	
	// tell her about it
	return this.filename;
};
Matrix.prototype.stimulus = function (call, init) {
	// send file to processor
	activity.processor.signal(this.filename);
}