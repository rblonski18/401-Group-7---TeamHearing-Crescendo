function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// init
	const mode = 'bel_bimodal';
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
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const ear = ['Left','Right'], f1 = [250,500,1e3,2e3,4e3];
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
					f1: f1[b],
					method: 0,
					release: .02,
					volume: {message:'Set the volume to be soft but audible.'}
				})
			}
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Sentences (CRM SRT)
	options.push('Sentence Completion in Background Noise');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'crm';
		protocol.ID = id;
		protocol.callback = ()=>{assignment()};
		const ear = ['Left','Right','Both'];
		for (let a = 0; a < ear.length; a++) {
			protocol.settings.push({
				adaptive: 'snr',
				behavior: 'Adaptive',
				chances: 4,
				ear: ear[a],
				noise: 'Speech-Shaped Noise',
				repeat: false,
				rule: 'linear',
				step0: 2,
				stepMin: 2,
				value0 : 24,
				valueMax: 24,
				trials: Infinity,
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Vowels - Quiet
	options.push('Vowels in Quiet');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const ear = ['Left','Right','Both'];			
		for (let a = 0; a < ear.length; a++) {
			protocol.settings.push({
				ear: ear[a],
				behavior: 'Constant',
				chances: Infinity,
				repeat: true,
				snr: Infinity,
				trials: 12,
				volume: true
			});
		}
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// Consonants - Quiet
	options.push('Consonants in Quiet');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const ear = ['Left','Right','Both'];		
		for (let a = 0; a < ear.length; a++) {
			protocol.settings.push({
				ear: ear[a],
				behavior: 'Constant',
				chances: Infinity,
				repeat: true,
				snr: Infinity,
				trials: 20,
				volume: true
			});
		}
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// Vowels - Noise: 6dB
	options.push('Vowels in Noise: 6dB');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const ear = ['Left','Right','Both'];		
		for (let a = 0; a < ear.length; a++) {
			protocol.settings.push({
				ear: ear[a],
				behavior: 'Constant',
				chances: Infinity,
				noise: 'Speech-Shaped Noise',
				repeat: true,
				snr: 6,
				trials: 12,
				volume: true
			});
		}
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// Consonants - Noise: 6dB
	options.push('Consonants in Noise: 6dB');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const ear = ['Left','Right','Both'];
		for (let a = 0; a < ear.length; a++) {
			protocol.settings.push({
				ear: ear[a],
				behavior: 'Constant',
				chances: Infinity,
				noise: 'Speech-Shaped Noise',
				repeat: true,
				snr: 6,
				trials: 20,
				volume: true
			});
		}
		protocol.start(1);
	}.bind(null,mode+'.'+a++));
	
	// Vowels - Noise: 0dB
	options.push('Vowels in Noise: 0dB');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const ear = ['Left','Right','Both'];	
		for (let a = 0; a < ear.length; a++) {
			protocol.settings.push({
				ear: ear[a],
				behavior: 'Constant',
				chances: Infinity,
				noise: 'Speech-Shaped Noise',
				repeat: true,
				snr: 0,
				trials: 12,
				volume: true
			});
		}
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// Consonants - Noise: 0dB
	options.push('Consonants in Noise: 0dB');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const ear = ['Left','Right','Both'];	
		for (let a = 0; a < ear.length; a++) {
			protocol.settings.push({
				ear: ear[a],
				behavior: 'Constant',
				chances: Infinity,
				noise: 'Speech-Shaped Noise',
				repeat: true,
				snr: 0,
				trials: 20,
				volume: true
			});
		}
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// Vowels - Noise: -6dB
	options.push('Vowels in Noise: -6dB');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const ear = ['Left','Right','Both'];
		for (let a = 0; a < ear.length; a++) {
			protocol.settings.push({
				ear: ear[a],
				behavior: 'Constant',
				chances: Infinity,
				noise: 'Speech-Shaped Noise',
				repeat: true,
				snr: -6,
				trials: 12,
				volume: true
			});
		}
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// Consonants - Noise: -6dB
	options.push('Consonants in Noise: -6dB');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const ear = ['Left','Right','Both'];
		for (let a = 0; a < ear.length; a++) {
			protocol.settings.push({
				ear: ear[a],
				behavior: 'Constant',
				chances: Infinity,
				noise: 'Speech-Shaped Noise',
				repeat: true,
				snr: -6,
				trials: 20,
				volume: true
			});
		}
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// Binaural Study
	layout.assignment('Bimodal Study',options,callbacks,{},mode,back);
}