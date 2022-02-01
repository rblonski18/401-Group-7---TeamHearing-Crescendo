function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// init
	const mode = 'bel_gambling';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));

	// Modulation Detection Thresholds (10 and 110 Hz)
	options.push('Modulation Detection Thresholds (10 and 110 Hz)');
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
				f0: f0[a],
				f1: 1000,
				method: 0,
				release: .02,
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Harmony (110, 220, 440 Hz) 
	options.push('Consonant/Dissonant Practice (110, 220, 440 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmony';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const range = [[39,51],[51,63],[63,75]];
		const root = [45,57,69];
		for (let a = 0; a < range.length; a++) {
			protocol.settings.push({
				range: range[a],
				root: root[a],
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Musescore with Shifted F0s (110, 220, 440 Hz)
	options.push('Pitch Discrimination with Shifted F0s (110, 220, 440 Hz)');
	callbacks.push(function(id){
			protocol = new Protocol();
			protocol.activity = 'musescorePitchShifted';
			protocol.callback = ()=>{assignment()};
			protocol.ID = id;
			const range = [[39,51],[51,63],[63,75]], f0 = [110,220,440];
			const instruments = ['piano'];
			const path = ['data/musescore/pitchshiftedpiano/'];
			for (i=0;i<range.length;i++) {
				protocol.settings.push({
					instruments: instruments,
					path: path,
					range: range[i],
					timbreMode: 0,
					volume: true,
					f0: f0[i]
				});
			}
			protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Major/Minor Arpeggios
	options.push('Major vs Minor Arpeggios');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'majorMinor';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.settings.push({
			practice: false,
			stimulusMode: 2,
			volume: true
		});
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
		
	// Tonal & Rhythm Comparisons
	options.push('Tonal & Rhythm Comparisons');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'confronto';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		for (let a = 0; a < 3; a++) {
			protocol.settings.push({practice:false});
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Gambling
	options.push('Gambling Task');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'gambling';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.settings.push({
			volume: true
		});
		protocol.start();
	}.bind(null,mode+'.'+a++));

	
	// assignment
	layout.assignment('Gambling',options,callbacks,{},mode,back);

}