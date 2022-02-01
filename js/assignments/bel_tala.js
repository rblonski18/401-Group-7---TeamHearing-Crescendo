function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// initialize
	const mode = 'bel_tala';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));
	
	// Detection Thresholds (100 to 3200 Hz)
	options.push('Pure Tone Detection Thresholds (100 to 3200 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [100,200,400,800,1600,3200];
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
	
	// Frequency Discrimination (100 to 3200 Hz)
	options.push('Pure Tone Frequency Discrimination (100 to 3200 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [100,200,400,800,1600,3200];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings[a] = {
				activity: 1, 
				f0: 0,
				f1: f1[a],
				method: 0,
				volume: true
			};
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// F0 Discrimination (100, 200, 400)
	options.push('Fundamental Frequency Discrimination (100, 200, 400)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const f0 = [100,200,400,800,1600], f1 = [1000], types = ['lowpass'];
		for (let a = 0; a < f0.length; a++) {
			for (let b = 0; b < types.length; b++) {
				protocol.settings.push({
					activity: 2,
					attack: .1,
					chances: 8,
					f0: f0[a],
					f1: f1[b],
					filter: {bandwidth:3,frequency:f1[b],type:types[b]},
					method: 1,
					release: .1,
					volume: true
				});
			}
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// F0 Discrimination (100, 200, 400)
	options.push('Fundamental Frequency Discrimination (100, 200, 400)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const f0 = [100,200,400], f1 = [4000], types = ['highpass'];
		for (let a = 0; a < f0.length; a++) {
			for (let b = 0; b < types.length; b++) {
				protocol.settings.push({
					activity: 2,
					attack: .1,
					chances: 8,
					f0: f0[a],
					f1: f1[b],
					filter: {bandwidth:3,frequency:f1[b],type:types[b]},
					method: 1,
					release: .1,
					volume: true
				});
			}
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));	
	// layout assignment
	layout.assignment('Tala Study',options,callbacks,{},mode,back);
}