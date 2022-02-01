function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// initialize
	const mode = 'bel_pitch';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,880);
	}.bind(null,mode+'.'+a++));
	
	// Detection Thresholds (110 to 7040 Hz)
	options.push('Pure Tone Detection (110 to 3520 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const f1 = [110,220,440,880,1760,3520];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings.push({
				activity: 0,
				alternatives: 3,
				attack: .04,
				chances: 3,
				duration: .4,
				f0: 0,
				f1: f1[a],
				method: 0,
				release: .36,
				volume: true //{message: 'Set the volume to be soft but audible.'}
			})
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Pitch Ranking (110 to 3520)
	options.push('Pure Tone Pitch Ranking (110 to 3520 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		const f1 = [110,220,440,880,1760,3520];
		for (let a = 0; a < f1.length; a++) {
			protocol.settings.push({
				activity: 1,
				attack: .04,
				duration: .4,
				f0: 0,
				f1: f1[a],
				method: 0,
				release: .36,
				volume: true
			});
		}
		protocol.start(2);
	}.bind(null,mode+'.'+a++));
	
	// Pitch Ranking of Piano Notes (110, 220, 440 Hz)
	options.push('Pitch Ranking of Piano Notes (110, 220, 440 Hz)');
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
			protocol.start(2);
	}.bind(null,mode+'.'+a++));
	
	// Melodic Contour
	options.push('Melodic Contour Identification');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'musanim';
		protocol.ID = id;
		const spacings = [4,2,1];
		for (let a = 0; a < spacings.length; a++) {
			protocol.settings.push({
				spacing:spacings[a] //material: new Musanim({spacing:spacings[a]})
			});
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// layout assignment
	layout.assignment('Pitch Benchmark',options,callbacks,{},mode,back);
}