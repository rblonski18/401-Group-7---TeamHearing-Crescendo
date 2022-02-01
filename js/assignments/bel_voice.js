function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// initialize
	const mode = 'bel_voice';
	let a = 0, callbacks = [], options = [];
	
	// Survey
	options.push('Survey');
	callbacks.push(function(id){window.open('https://usc.qualtrics.com/jfe/form/SV_4SCwt8YGj51cpQF','Survey')}.bind(null,mode+'.'+a++));
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));
	
	// Detection Thresholds (125 to 8k)
	options.push('Pure Tone Detection Thresholds');
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
	
	// Intensity Discrimination (500, 1000, 2000)
	options.push('Pure Tone Intensity Discrimination');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [500,1e3,2e3];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings.push({
				activity: 3,
				attack: .02,
				chances: 4,
				f0: 0,
				f1: f1[a],
				method: 0,
				release: .02,
				rule:'exponential',
				value0:12,
				volume: true
			})
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Frequency Discrimination (500, 1000, 2000)
	options.push('Pure Tone Frequency Discrimination');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [500,1e3,2e3];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings.push({
				activity: 1, 
				attack: .02,
				chances: 4,
				f0: 0,
				f1: f1[a],
				method: 0,
				release: .02,
				volume: true
			})
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// F0 Discrimination (110, 220, 440)
	options.push('Fundamental Frequency Discrimination');
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
				f0: f0[a],
				f1: 1000,
				filter: {bandwidth:1, frequency:1000, type:'lowpass'},
				method: 1,
				release: .02,
				volume: true
			})
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Sung Vowel Identification
	options.push('Sung Vowel Identification');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const material = [4,5];
		for (let a = 0; a < material.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				lastchance: false,
				material: material[a],
				snr: Infinity,
				trials: 20,
				volume: true
			})
		}
		protocol.start(2);
	}.bind(null,mode+'.'+a++));
	
	// layout assignment
	layout.assignment('Voice Production Study',options,callbacks,{},mode,back);
}