function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// init
	const mode = 'bel_pleasantness';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));
	
	// Pure Tone Detection Thresholds (125 to 8k)
	options.push('Pure Tone Detection Thresholds (125 to 8k)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [125,250,500,1e3,2e3,4e3,8e3];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings.push({
				activity: 0,
				alternatives: 3,
				attack: .02,
				chances: 3,
				duration: .4,
				f0: 0,
				f1: f1[a],
				method: 0,
				release: .02,
				volume: {message:'Set the volume to be soft but audible.'}
			})
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Modulation Detection Thresholds (10 and 110 Hz)
	options.push('Modulation Detection Thresholds (10 and 110 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const f0 = [10,110];
		for (let a = 0; a < f0.length; a++) {
			protocol.settings.push({
				activity: 4,
				alternatives: 3,
				attack: .02,
				f0: f0[a],
				f1: 1000,
				method: 0,
				release: .02,
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// F0 Discrimination Thresholds (110, 220, 440 Hz)
	options.push('F0 Discrimination Thresholds (110, 220, 440 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const f0 = [110,220,440];
		for (let a = 0; a < f0.length; a++) {
			protocol.settings.push({
				activity: 2,
				alternatives: 2,
				attack: .02,
				f0: f0[a],
				filter: {bandwidth:1, frequency:1000, type:'lowpass'},
				method: 1,
				release: .02,
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Harmony (110, 220, 440 Hz) 
	options.push('Consonant/Dissonant Practice (110, 220, 440 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmony';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const range = [[39,51],[51,63],[63,75]];
		const root = [45,57,69];
		for (let a = 0; a < range.length; a++) {
			protocol.settings.push({
				range: range[a],
				root: root[a],
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Pleasantness Ratings (110, 220, 440 Hz) 
	options.push('Pleasantness Ratings (110, 220, 440 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'pleasantness';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const range = [[45,45],[57,57],[69,69]];
		for (let a = 0; a < range.length; a++) {
			protocol.settings.push({
				range: range[a],
				root: range[a][0],
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Speech in Noise Test
	options.push('Speech in Noise Test');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'spin';
		protocol.ID = id;
		protocol.callback = ()=>{assignment()};
		protocol.open = function (callback) {
			layout.message('Protocol Message',
			'This protocol includes 3 speech in noise tests.</br>Each test is presented with ongoing spoken speech as background noise.',
			callback
		)};
		protocol.settings.push({
			adaptive: 'snr',
			behavior: 'Adaptive',
			chances: 4,
			noise: 'Two Talker Masker (English)',
			repeat: false,
			rule: 'linear',
			step0: 2,
			stepMin: 2,
			trials: Infinity,
			value0 : 24,
			valueMax: 24,
			volume: true
		});
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// assignment
	layout.assignment('Pleasantness Ratings',options,callbacks,{},mode,back);
}