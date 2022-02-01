function assignment(back) {
	console.log('test');
	back = back ? back : ()=>{layout.dashboard()};
	let chances = version == 'alpha' ? 1 : 4;
	let reps = version == 'alpha' ? 1 : 3;
	
	// init
	const mode = 'bel_musescore';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));
	
	// Pure Tone Detection Thresholds (125 to 2k Hz)
	options.push('Pure Tone Detection Thresholds (125 to 2k Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [125,250,500,1e3,2e3];
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
				volume: {message:'Set the volume to be soft but audible.'}
			})
		}
		console.log(protocol);
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Modulation Detection
	options.push('Modulation Detection (10, 110 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const f0 = [10,110];
		for (let a = 0; a < f0.length; a++) {
			protocol.settings.push({
				activity: 4,
				alternatives: 3,
				attack: .02,
				chances: chances,
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
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));
	
	// Instrument Identification 
	options.push('Instrument Identification');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'musescore';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const range = [[39,51],[51,63],[63,75]], f0 = [110,220,440], instruments = ['Piano','tenor sax'], path = ['data/musescore/3secpiano/','data/musescore/3sectenorsax/'];
		for (let a = 0; a < range.length; a++) {
			protocol.settings.push({
				chances: 100,
				f0: f0[a],
				instruments: instruments,
				mode: 1,
				path: path,
				range: range[a],
				trials: version == 'alpha' ? 1 : 20,
				vocoder: false,
				volume: true
			});
		}
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));

	// Pitch Discrimination for Piano and Saxophone
	options.push('Pitch Discrimination for Piano and Saxophone');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'musescorePitchShifted';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const instruments = ['piano','tenor sax'];
		const range = [[39,51],[51,63],[63,75],[75,87]];
		//const path = ['data/musescore/pitchshiftedpiano/','data/musescore/pitchshiftedtenorsax/'];
		for (let a = 0; a < range.length; a++) {
			for (let b = 0; b < instruments.length; b++) {	
				protocol.settings.push({
					chances: chances,
					instrument: b,
					instrument2: b,
					//instruments: instruments,
					mode: 0,
					//path: path,
					range: range[a],
					timbreMode: 0,
					vocoder: false,
					volume: true
				});
			}
		}
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));

	// Pitch Discrimination with Mixed Instruments
	options.push('Pitch Discrimination with Mixed Instruments');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'musescorePitchShifted';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const instruments = ['piano','tenor sax'];
		const range = [[39,51],[51,63],[63,75],[75,87]];
		const path = ['data/musescore/pitchshiftedpiano/','data/musescore/pitchshiftedtenorsax/'];
		for (let a = 0; a < range.length; a++) {
			protocol.settings.push({
				chances: chances,
				instruments: instruments,
				mode: 0,
				//path: path,
				range: range[a],
				timbreMode: 2,
				vocoder: false,
				volume: true
			});
		}
		protocol.start(reps);
	}.bind(null,mode+'.'+a++));

	// assignment
	layout.assignment('Pitch with Timbre',options,callbacks,{},mode,back);
}