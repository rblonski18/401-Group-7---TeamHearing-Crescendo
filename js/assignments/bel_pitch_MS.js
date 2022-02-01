function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// initialize
	const mode = 'bel_pitch_MS';
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
				volume: {message: 'Set the volume to be soft but audible.'}
			})
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Frequency Discrimination (125 to 8k)
	options.push('Pure Tone Frequency Discrimination (125 to 8k)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [125,250,500,1e3,2e3,4e3,8e3];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings[a] = {
				activity: 1, 
				f0: 0,
				f1: f1[a],
				mode: 0,
				volume: true
			};
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
				mode: 1,
				release: .02,
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// new pitch stuff
	options.push('Pitch Discrimination (110, 220, 440 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'pitch';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const range = [[39,51],[51,63],[63,75]];
		for (let a = 0; a < range.length; a++) {
			protocol.settings.push({
				range: range[a],
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// layout assignment
	layout.assignment('Pitch Study',options,callbacks,{},mode,back);
}