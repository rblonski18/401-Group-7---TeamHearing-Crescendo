function assignment(back) {
	back = back ? back : () => { layout.dashboard(); };

	// init
	const mode = 'bel_binaural';
	let a = 0, callbacks = [], options = [];

	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));

	// Pure Tone Detection Thresholds (250 to 4000 Hz)
	options.push('Pure Tone Detection Thresholds (250 to 4000 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		protocol.random = false;
		const ear = ['left','right'], f1 = [250,500,1e3,2e3,4e3];
		for (let a = 0; a < ear.length; a++) {
			for (let b = 0; b < f1.length; b++) {
				protocol.settings.push({
					activity: 0,
					alternatives: 3,
					attack: .02,
					chances: 3,
					duration: .4,
					ear: ear[a],
					f0: 0,
					f1: f1[a],
					method: 0,
					release: .02,
					volume: {message:'Set the volume to be soft but audible.'}
				})
			}
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));

	// ILD Discrimination (250 to 4k)
	options.push('ILD Discrimination (250 to 4000 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'ild';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		protocol.random = false;
		const f1 = [250,500,1e3,2e3,4e3];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings.push({
				depth: 200,
				f0: 110,
				f1: f1[a]
			})
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// ITD Discrimination (250 to 4k)
	options.push('ITD Discrimination (250 to 4000 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'itd';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		protocol.random = false;
		const f1 = [250,500,1e3,2e3,4e3];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings[a] = {
				f0: 20,
				f1: f1[a]
			};
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Sound Movement
	options.push('Sound Movement');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'lateralization';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		protocol.random = false;
		protocol.settings.push({
			chances: 4,
			volume: true
		});
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Binaural Benefit
	options.push('Binaural Benefit');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'crisp';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		const noise = ['virtualcrisp_babble_sparse_2','virtualcrisp_babble_sparse_1','virtualcrisp_babble_sparse_3'];
		for (let a = 0; a < noise.length; a++) {
			protocol.settings.push({
				adaptive: 'snr',
				alternatives: 25,
				behavior: 'Adaptive',
				chances: 4,
				jitter: 1000,
				noise: noise[a],
				repeat: false,
				trials: Infinity,
				value0:12,
				valueMax:24,
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Binaural Study
	layout.assignment('Binaural Study',options,callbacks,{},mode,back);
}
