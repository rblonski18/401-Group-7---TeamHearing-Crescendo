function assignment(back) {
	back = back ? back : () => { layout.dashboard(); };

	// initialize
	const mode = 'bel_pitch';
	let a = 0, callbacks = [], options = [];

	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,880);
	}.bind(null,mode+'.'+a++));

	// Detection Thresholds (110 to 7040 Hz)
	options.push('Pure Tone Detection Thresholds (110 to 7040 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [110,220,440,880,1760,3520,7040];
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
				volume: {message: 'Set the volume to be soft but audible.'}
			})
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));

	// Frequency Discrimination (110 to 3520)
	options.push('Pure Tone Frequency Discrimination (110 to 3520 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		const f1 = [110,220,440,880,1760,3520];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings.push({
				activity: 1,
				f0: 0,
				f1: f1[a],
				method: 0,
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// F0 Discrimination (110, 220, 440)
	options.push('Fundamental Frequency Discrimination (110, 220, 440 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		const f0 = [110,220,440], f1 = [1000,4000], types = ['lowpass','highpass'];
		for (let a = 0; a < f0.length; a++) {
			for (let b = 0; b < types.length; b++) {
				protocol.settings.push({
					activity: 2,
					attack: .1,
					f0: f0[a],
					f1: f1[b],
					filter: { bandwidth:1, frequency:f1[b], type:types[b] },
					method: 1,
					release: .1,
					volume: true
				});
			}
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Modulation Frequency Discrimination (110, 220, 440 Hz)
	options.push('Modulation Frequency Discrimination (110, 220, 440 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		const activity = [2,5], f0 = [110,220,440];
		for (let a = 0; a < activity.length; a++) {
			for (let b = 0; b < f0.length; b++) {
				protocol.settings.push({
					activity: activity[a],
					attack: .02,
					depth: 100,
					f0: f0[b],
					f0_rove: 1/4,
					f1: 4*f0[b],
					f1_rove: 0,
					method: 0,
					release: .02,
					volume: true
				});
			}
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// layout assignment
	layout.assignment('Pitch Benchmark',options,callbacks,{},mode,back);
}
