loadscript('intervals');
function assignment(back) {
	let callbacks = [], options = [];

	// Assessment
	options.push('Assessment');
	callbacks.push(() => { assessment(back); });

	// Training
	options.push('Training');
	callbacks.push(() => { training(back); });

	//
	layout.assignment('Interval Training Study',options,callbacks,{},'',back);

	// assessment
	function assessment(back) {
		back = back ? back : () => { layout.dashboard(); };

		// init
		const mode = 'bel_intervals';
		let a = 0, callbacks = [], options = [];

		// Survey
		options.push('Survey: Click me first');
		callbacks.push(function (id) {
			window.open("https://usc.qualtrics.com/jfe/form/SV_bvVCAxrtJ0ULNqt",'Survey');
		}.bind(null,mode+'.'+a++));

		// Loudness Levels
		options.push('Loudness Levels');
		callbacks.push(function(id){
			protocol = new Protocol();
			protocol.ID = id;
			gui.loudness(() => { assessment(); },1e3);
		}.bind(null,mode+'.'+a++));

		// Detection Thresholds (250, 1000, 4000 Hz)
		options.push('Pure Tone Detection Thresholds (250, 1000, 4000 Hz)');
		callbacks.push(function(id){
			protocol = new Protocol();
			protocol.activity = 'harmonics';
			protocol.callback = () => { assessment(); };
			protocol.ID = id;
			protocol.random = false;
			const f1 = [250,1e3,4e3];
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
					volume: { message: 'Set the volume to be soft but audible.' }
				})
			}
			protocol.start();
		}.bind(null,mode+'.'+a++));

		// Pure Tone Frequency Discrimination (250, 1000, 4000 Hz)
		options.push('Pure Tone Frequency Discrimination (250, 1000, 4000 Hz)');
		callbacks.push(function(id){
			protocol = new Protocol();
			protocol.activity = 'harmonics';
			protocol.callback = () => { assessment(); };
			protocol.ID = id;
			protocol.random = false;
			const f1 = [250,1e3,4e3];
			for (let a = 0; a < f1.length; a++) {
				protocol.settings[a] = {
					activity: 1,
					attack: .02,
					duration: .4,
					f0: 0,
					f1: f1[a],
					method: 0,
					release: .02,
					volume: true
				};
			}
			protocol.start(3);
		}.bind(null,mode+'.'+a++));

		// F0 Discrimination (110, 220, 440 Hz)
		options.push('Fundamental Frequency Discrimination (110, 220, 440 Hz)');
		callbacks.push(function(id){
			protocol = new Protocol();
			protocol.activity = 'harmonics';
			protocol.callback = () => { assessment(); };
			protocol.ID = id;
			const f0 = [110,220,440];
			for (let a = 0; a < f0.length; a++) {
				protocol.settings.push({
					activity: 2,
					attack: .02,
					duration: .4,
					f0: f0[a],
					f1: 1000,
					filter: {bandwidth:1, frequency:1000, type:'lowpass'},
					method: 1,
					release: .02,
					volume: true
				});
			}
			protocol.start(3);
		}.bind(null,mode+'.'+a++));

		// Tonal & Rhythm Comparisons
		options.push('Tonal & Rhythm Comparisons');
		callbacks.push(function(id){
			protocol = new Protocol();
			protocol.activity = 'confronto';
			protocol.callback = () => { assignment(); };
			protocol.ID = id;
			protocol.settings.push({
				practice: false,
				volume: true
			});
			protocol.start(3);
		}.bind(null,mode+'.'+a++));

		// Interval Identification
		options.push('Interval Identification');
		callbacks.push(function(id){
			protocol = new Protocol();
			protocol.activity = 'intervals';
			protocol.callback = () => { assessment(); };
			protocol.ID = id;
			const level = [127,126,125], range = [[39,51],[51,63],[63,75]];//centered on MIDI 45 (A2, 110 Hz), 57 (A3, 220 Hz), 69 (A4, 440 Hz)
			for (let a = 0; a < range.length; a++) {
				protocol.settings.push({
					intervals: [4,7,12],
					level: level[a],
					practice: false,
					range: range[a],
					trials: 20,
					volume: true
				});
			}
			protocol.start(3);
		}.bind(null,mode+'.'+a++));

		// Interval Training
		layout.assignment('Assessment',options,callbacks,{},mode,back);
	}

	// training
	function training(back) {
		back = back ? back : () => { layout.dashboard(); };

		// init
		const mode = 'bel_intervals_training';
		let a = 0, callbacks = [], options = [];

		// interval training
		options.push('Interval Training');
		callbacks.push(function(id){
			protocol = new Protocol();
			protocol.activity = 'intervals';
			protocol.callback = () => { assignment(); };
			protocol.ID = id;
			protocol.settings.push({
				trials: 20,
				volume: true
			});
			protocol.start(6);
		}.bind(null,mode+'.'+a++));

		// Interval Training
		layout.assignment('Training',options,callbacks,{},mode,back);
	}
}
