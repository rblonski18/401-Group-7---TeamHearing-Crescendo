function assignment(back) {
	back = back ? back : () => { layout.dashboard(); };

	// initialize
	const mode = 'bel_stream';
	let a = 0, callbacks = [], options = [];
	let chances = version == 'alpha' && subuser.ID == 3 ? 1 : 4;
	let reps = version == 'alpha' && subuser.ID == 3 ? 1 : 3;

	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));

	// Detection Thresholds (500, 1000, 2000 Hz)
	options.push('Pure Tone Detection Thresholds (500, 1000, 2000 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [500,1000,2000];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings.push({
				activity: 0,
				alternatives: 3,
				attack: .02,
				chances: chances,
				duration: .4,
				f0: 0,
				f1: f1[a],
				method: 0,
				release: .02,
				volume: {message: 'Set the volume to be soft but audible.'}
			})
		}
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));

	// Frequency Discrimination (1 kHz)
	options.push('Pure Tone Frequency Discrimination (1 kHz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=> { assignment(); };
		protocol.ID = id;
		protocol.open = (callback) => { gui.gain({callback:callback}); };
		protocol.settings.push({
			activity: 1,
			attack: .02,
			chances: chances,
			f0: 0,
			f1: 1e3,
			f1_rove: 1/4,
			method: 0,
			release: .02,
			volume: false
		});
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));

	// Fundamental Frequency Discrimination (110 Hz)
	options.push('Fundamental Frequency Discrimination (110 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.open = (callback) => { gui.gain({callback:callback}); };
		protocol.settings.push({
			activity: 2,
			attack: .02,
			chances: chances,
			depth: 100,
			f0: 110,
			f0_rove: 1/4,
			f1: 1e3,
			f1_rove: 0,
			method: 1,
			release: .02,
			volume: false
		});
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));

	// Stream Segregation (Pure Tones)
	options.push('Stream Segregation (Pure Tones)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'stream';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.open = (callback) => { gui.gain({callback:callback}); };
		protocol.random = false;
		protocol.settings.push({
			back: ()=>{assignment()},
			A_gain: -Infinity,
			B_frequency: 1000,
			B_gain: 0,
			chances: chances,
			method: 'SAM Tone',
			setting: a,
			volume: false
		});
		const B_frequency = 1e3, A_frequency = [B_frequency*Math.pow(2,12/12),B_frequency*Math.pow(2,6/12),B_frequency*Math.pow(2,3/12),B_frequency];
		for (let a = 0; a < A_frequency.length; a++) {
			protocol.settings.push({
				back: ()=>{assignment()},
				A_frequency: A_frequency[a],
				A_gain: -60,
				B_frequency: B_frequency,
				B_gain: 0,
				chances: chances,
				method: 'SAM Tone',
				setting: a,
				volume: false
			});
		}
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));

	// Stream Segregation (Complex Tones)
	options.push('Stream Segregation (Complex Tones)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'stream';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.open = (callback) => { gui.gain({callback:callback}); };
		protocol.random = false;
		protocol.settings.push({
			back: ()=>{assignment()},
			A_fm: 110,
			A_gain: -Infinity,
			B_fm: 110,
			B_gain: 0,
			chances: chances,
			method: 'Complex Tone',
			setting: a,
			volume: false
		});
		const B_fm = 110, A_fm = [B_fm*Math.pow(2,12/12),B_fm*Math.pow(2,6/12),B_fm*Math.pow(2,3/12),B_fm];
		for (let a = 0; a < A_fm.length; a++) {
			protocol.settings.push({
				back: ()=>{assignment()},
				A_fm: A_fm[a],
				A_gain: -60,
				B_fm: B_fm,
				B_gain: 0,
				chances: chances,
				method: 'Complex Tone',
				setting: a,
				volume: false
			});
		}
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));

	// Pitch Benefit (sparse noise)
	options.push('Pitch Benefit (sparse noise)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'crisp';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.open = (callback) => {
			gui.gain({
				callback: callback,
				file: 'data/crisp/calibrated/AIRPLANE.mp4'
			});
		};
		protocol.settings.push({
			adaptive: 'gain',
			alternatives: 25,
			behavior: 'Adaptive',
			chances: chances,
			jitter: 1000,
			repeat: false,
			setting: 0,
			value0: MASTERGAIN-12,
			valueMax: MASTERGAIN
		});
		const noise = ['crisp_babble_sparse_pitchshift_0','crisp_babble_sparse_pitchshift_3','crisp_babble_sparse_pitchshift_6','crisp_babble_sparse_pitchshift_12'];
		for (let a = 0; a < noise.length; a++) {
			protocol.settings.push({
				adaptive: 'snr',
				alternatives: 25,
				behavior: 'Adaptive',
				chances: chances,
				jitter: 1000,
				noise: noise[a],
				repeat: false,
				setting: a+1,
				step0: 1,
				stepMin: 1,
				value0: 12,
				valueMax: 24
			});
		}
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));

	// Pitch Benefit (dense noise)
	options.push('Pitch Benefit (dense noise)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'crisp';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.open = (callback) => {
			gui.gain({
				callback: callback,
				file: 'data/crisp/calibrated/AIRPLANE.mp4'
			});
		};
		protocol.settings.push({
			adaptive: 'gain',
			alternatives: 25,
			behavior: 'Adaptive',
			chances: chances,
			jitter: 1000,
			repeat: false,
			setting: 0,
			value0: MASTERGAIN-12,
			valueMax: MASTERGAIN
		});
		const noise = ['crisp_babble','crisp_babble_pitchshift_3','crisp_babble_pitchshift_6','crisp_babble_pitchshift_12'];
		for (let a = 0; a < noise.length; a++) {
			protocol.settings.push({
				adaptive: 'snr',
				alternatives: 25,
				behavior: 'Adaptive',
				chances: chances,
				jitter: 1000,
				noise: noise[a],
				repeat: false,
				setting: a+1,
				step0: 1,
				stepMin: 1,
				value0: 12,
				valueMax: 24
			});
		}
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));

	// layout assignment
	layout.assignment('Stream Segregation',options,callbacks,{},mode,back);
}
