function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// init
	const mode = 'bel_modulation';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,4e3);
	}.bind(null,mode+'.'+a++));
	
	// Detection Thresholds (125 to 8k)
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
				volume: {message: 'Set the volume to be soft but audible.'}
			})
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Modulation Detection
	options.push('Modulation Detection (55, 110, 220, 440 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const f0 = [55,110,220,440], modes = [0];
		for (let a = 0; a < f0.length; a++) {
			for (let b = 0; b < modes.length; b++) {
				protocol.settings.push({
					activity: 4,
					alternatives: 3,
					attack: .02,
					f0: f0[a],
					f0_rove: 1/8,
					f1: 4000,
					f1_rove: 1/8,
					filter: {bandwidth:1/8, frequency:4000, type:'bandpass'},
					method: modes[b],
					release: .02,
					volume: true
				});
			}
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Modulation Frequency Discrimination (familiarization) 
	options.push('Modulation Frequency Discrimination (familiarization)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const f0 = [110,220,440];
		for (let a = 0; a < f0.length; a++) {
			protocol.settings.push({
				activity: 2,
				attack: .02,
				depth: 100,
				f0: f0[a],
				f0_rove: 1/8,
				f1: 4000,
				f1_rove: 1/8,
				filter: {bandwidth:1/8, frequency:4000, type:'bandpass'},
				method: 0,
				release: .02,
				volume: true
			});
		}
		protocol.start(2);
	}.bind(null,mode+'.'+a++));
	
	// Modulation Frequency Discrimination (110 Hz) 
	options.push('Modulation Frequency Discrimination (110 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const depth = [25,50,100,200], mode = [0];
		for (let a = 0; a < depth.length; a++) {
			for (let b = 0; b < mode.length; b++) {
				protocol.settings.push({
					activity: 2,
					attack: .02,
					depth: depth[a],
					f0: 110,
					f0_rove: 1/8,
					f1: 4000,
					f1_rove: 1/8,
					filter: {bandwidth:1/8, frequency:4000, type:'bandpass'},
					method: mode[b],
					release: .02,
					volume: true
				});
			}
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Modulation Frequency Discrimination (220 Hz) 
	options.push('Modulation Frequency Discrimination (220 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const depth = [25,50,100,200], mode = [0];
		for (let a = 0; a < depth.length; a++) {
			for (let b = 0; b < mode.length; b++) {
				protocol.settings.push({
					activity: 2,
					attack: .02,
					depth: depth[a],
					f0: 220,
					f0_rove: 1/8,
					f1: 4000,
					f1_rove: 1/8,
					filter: {bandwidth:1/8, frequency:4000, type:'bandpass'},
					method: mode[b],
					release: .02,
					volume: true
				});
			}
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Modulation Frequency Discrimination (440 Hz) 
	options.push('Modulation Frequency Discrimination (440 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const depth = [25,50,100,200], mode = [0];
		for (let a = 0; a < depth.length; a++) {
			for (let b = 0; b < mode.length; b++) {
				protocol.settings.push({
					activity: 2,
					attack: .02,
					depth: depth[a],
					f0: 440,
					f0_rove: 1/8,
					f1: 4000,
					f1_rove: 1/8,
					filter: {bandwidth:1/8, frequency:4000, type:'bandpass'},
					mode: mode[b],
					release: .02,
					volume: true
				});
			}
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// layout assignment
	layout.assignment('Modulation Study',options,callbacks,{},mode,back);
}