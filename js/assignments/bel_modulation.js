function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};

	// init
	const mode = 'bel_modenhanced';
	let a = 0, callbacks = [], options = [];

	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));

	// Consonant Identification
	options.push('Consonant Identification');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'consonants';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.settings.push({
			behavior: 'Constant',
			chances: Infinity,
			lastchance: false,
			repeat: false,
			snr: Infinity,
			trials: 60,
			volume: true
		})
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// Vowel Identification
	options.push('Vowel Identification');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'vowels';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.settings.push({
			behavior: 'Constant',
			chances: Infinity,
			lastchance: false,
			repeat: false,
			snr: Infinity,
			trials: 60,
			volume: true
		})
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// Pitch Ranking of Piano Notes (110, 220, 440 Hz)
	options.push('Pitch Ranking of Guitar Notes (110, 220, 440 Hz)');
	callbacks.push(function(id){
			protocol = new Protocol();
			protocol.activity = 'musescorePitchShifted';
			protocol.callback = ()=>{assignment()};
			protocol.ID = id;
			const range = [[39,51],[51,63],[63,75]], f0 = [110,220,440];
			const instruments = ['guitar'];
			const path = ['data/musescore/pitchshiftedguitar/'];
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

	// ModEnhanced Benchmark
	layout.assignment('Modulation Processing',options,callbacks,{},mode,back);
}
