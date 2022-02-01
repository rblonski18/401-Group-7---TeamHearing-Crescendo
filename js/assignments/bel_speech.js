function assignment(back) {
	back = back ? back : () => { layout.dashboard(); };
	let trials = debug ? 20 : 60;

	// init
	const mode = 'bel_speech';
	let a = 0, callbacks = [], options = [];

	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));

	// Detection Thresholds
	options.push('Pure Tone Detection Thresholds');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		protocol.random = false;
		const f1 = [500,1e3,2e3,4e3];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings.push({
				activity: 0,
				alternatives: 3,
				attack: .02,
				chances: 3,
				f0: 0,
				f1: f1[a],
				f1_rove: 0,
				gain: 40,
				gain_rove: 0,
				release: .02,
				volume: { message: 'Set the volume to be soft but audible.' }
			})
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));

	// Consonant Identification
	options.push('Consonant Identification');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		protocol.settings.push({
			level: 0,
			noise: 'Speech-Shaped Noise',
			trials: version == 'alpha' && subuser.ID == 3 ? 1 : 20,
			volume: true
		})
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Vowel Identification
	options.push('Vowel Identification');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		protocol.settings.push({
			level: 0,
			noise: 'Speech-Shaped Noise',
			trials: version == 'alpha' && subuser.ID == 3 ? 1 : 24,
			volume: true
		})
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Sentence Completion (SPIN SRT)
	options.push('Sentence Completion in Background Noise');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'spin';
		protocol.ID = id;
		protocol.callback = () => { assignment(); };
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
			step0: 2,
			trials: Infinity,
			value0 : 12,
			valueMax: 24,
			volume: true
		});
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Speech Benchmark
	layout.assignment('Speech Benchmark',options,callbacks,{},mode,back);
}
