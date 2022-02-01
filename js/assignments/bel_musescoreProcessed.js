function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// init
	const mode = 'bel_musescoreProcessed';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));
	
	// Noise Full & Reduced Modulation 
	options.push('Noise Full & Reduced Modulation');
	callbacks.push(function(id){
			protocol = new Protocol();
			protocol.activity = 'musescore';
			protocol.callback = ()=>{assignment()};
			protocol.ID = id;
			for (i=0;i<2;i++) {
				protocol.settings.push({
					mode: 0,
					range: [39,51],
					timbreMode: 0,
					vocoder: 1,
					vocoderTone: i,
					volume: true
				});
			}
			protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// Sine Full & Reduced Modulation 
	options.push('Sine Full & Reduced Modulation');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'musescore';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		for (i=2;i<4;i++) {
			protocol.settings.push({
				mode: 0,
				range: [39,51],
				timbreMode: 0,
				vocoder: 1,
				vocoderTone: i,
				volume: true
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));

	// assignment
	layout.assignment('Musescore',options,callbacks,{},mode,back);
}