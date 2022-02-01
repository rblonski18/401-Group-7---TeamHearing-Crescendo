function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// initialize
	const mode = 'bel_training';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
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
				volume: {message:'Set the volume to be soft but audible.'}
			})
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// F0 Discrimination (110, 220, 440)
	options.push('Fundamental Frequency Discrimination (110, 220, 440)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const f0 = [110,220,440], f1 = [1000,2000,4000], types = ['lowpass','highpass'];
		for (let a = 0; a < f0.length; a++) {
			for (let b = 0; b < types.length; b++) {
				protocol.settings.push({
					activity: 2,
					attack: .1,
					chances: 8,
					gain_rove: 6,
					f0: f0[a],
					f0_rove: 1/4,
					f1: f1[b],
					f1_rove: 1/4,
					filter: {bandwidth:1,frequency:f1[b],type:types[b]},
					method: 1,
					release: .1,
					volume: true
				});
			}
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Melodic Contour Identification
	options.push('Melodic Contour Identification');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'musanim';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const spacings = [4,2,1];
		for (let a = 0; a < spacings.length; a++) {
			protocol.settings.push({
				spacing:spacings[a],
				volume: true
			});
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Synthetic Vowels
	options.push('Synthetic Vowels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'synth';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const f0 = [110,220,440], method = [0,1], mode = [0,1];
		for (let a = 0; a < f0.length; a++) {
			for (let b = 0; b < method.length; b++) {
				for (let c = 0; c < mode.length; c++) {
					protocol.settings.push({
						adaptive: 'gain',
						f0: f0[a],
						method: method[b],
						mode: mode[c],
						rule:'exponential',
						volume: true
					});
				}
			}
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// layout assignment
	layout.assignment('Pitch Training Study',options,callbacks,{},mode,back);
}