function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// init
	const mode = 'bel_enhance';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));
	
	// Detection Thresholds
	options.push('Pure Tone Detection Thresholds');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [500,1e3,2e3,4e3];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings.push({
				activity: 0,
				alternatives: 3,
				attack: .02,
				chances: 3,
				duration: .4,
				f0: 0,
				f1: f1[a],
				f1_rove: 0,
				gain: 40,
				gain_rove: 0,
				method: 0,
				release: .02
			})
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Consonants in Quiet
	options.push('Consonants in Quiet');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		const enhanced = [0,1];
		for (let a = 0; a < enhanced.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				enhanced: enhanced[a],
				genders:['W'],
				lastchance: false,
				snr: Infinity,
				trials: 20
			})
		}
		protocol.start(2);
	}.bind(null,mode+'.'+a++));
	
	// Vowels in Quiet
	options.push('Vowels in Quiet');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		const enhanced = [0,1];
		for (let a = 0; a < enhanced.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				enhanced:enhanced[a],
				lastchance: false,
				snr: Infinity,
				trials: 24
			})
		}
		protocol.start(2);
	}.bind(null,mode+'.'+a++));
	
	// Consonants in Noise: 12 dB SNR
	options.push('Consonants in Noise: 12 dB SNR');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		const enhanced = [0,1];
		for (let a = 0; a < enhanced.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				enhanced:enhanced[a],
				genders:['W'],
				lastchance: false,
				noise: 'Speech-Shaped Noise',
				snr: 12,
				trials: 20
			})
		}
		protocol.start(2);
	}.bind(null,mode+'.'+a++));
	
	// Vowels in Noise: 12 dB SNR
	options.push('Vowels in Noise: 12 dB SNR');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		const enhanced = [0,1];
		for (let a = 0; a < enhanced.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				enhanced:enhanced[a],
				lastchance: false,
				noise: 'Speech-Shaped Noise',
				snr: 12,
				trials: 24
			})
		}
		protocol.start(2);
	}.bind(null,mode+'.'+a++));
	
	// Consonants in Noise: 6 dB SNR
	options.push('Consonants in Noise: 6 dB SNR');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		const enhanced = [0,1];
		for (let a = 0; a < enhanced.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				enhanced:enhanced[a],
				genders:['W'],
				lastchance: false,
				noise: 'Speech-Shaped Noise',
				snr: 6,
				trials: 24
			})
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Vowels in Noise: 6 dB SNR
	options.push('Vowels in Noise: 6 dB SNR');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		const enhanced = [0,1];
		for (let a = 0; a < enhanced.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				enhanced:enhanced[a],
				lastchance: false,
				noise: 'Speech-Shaped Noise',
				snr: 6,
				trials: 24
			})
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Consonants in Noise: 0 dB SNR
	options.push('Consonants in Noise: 0 dB SNR');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		const enhanced = [0,1];
		for (let a = 0; a < enhanced.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				enhanced:enhanced[a],
				genders:['W'],
				lastchance: false,
				noise: 'Speech-Shaped Noise',
				snr: 0,
				trials: 20
			})
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Vowels in Noise: 0 dB SNR
	options.push('Vowels in Noise: 0 dB SNR');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		const enhanced = [0,1];
		for (let a = 0; a < enhanced.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				enhanced:enhanced[a],
				lastchance: false,
				material: new Vowels({enhanced:enhanced[a]}),
				noise: 'Speech-Shaped Noise',
				snr: 0,
				trials: 24
			})
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Consonants in Noise: -6 dB SNR
	options.push('Consonants in Noise: -6 dB SNR');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		const enhanced = [0,1];
		for (let a = 0; a < enhanced.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				enhanced:enhanced[a],
				genders:['W'],
				lastchance: false,
				noise: 'Speech-Shaped Noise',
				snr: -6,
				trials: 20
			})
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Vowels in Noise: -6 dB SNR
	options.push('Vowels in Noise: -6 dB SNR');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{homework.menu()};
		protocol.ID = id;
		const enhanced = [0,1];
		for (let a = 0; a < enhanced.length; a++) {
			protocol.settings.push({
				behavior: 'Constant',
				chances: Infinity,
				enhanced:enhanced[a],
				lastchance: false,
				noise: 'Speech-Shaped Noise',
				snr: -6,
				trials: 24
			})
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// Transient Emphasis Study
	layout.assignment('Transient Emphasis Study',options,callbacks,{},mode,back);
}