function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// init
	const mode = 'custom';
	let a = 0, callbacks = [], options = [];
	
	// Modulation Frequency Discrimination (110 Hz) 
	options.push('Modulation Frequency Discrimination (440 Hz)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'harmonics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.random = false;
		const depth = [50,100], mode = [0,3];
		for (let a = 0; a < depth.length; a++) {
			for (let b = 0; b < mode.length; b++) {
				protocol.settings.push({
					material: new Harmonics({
						activity: 2,
						attack: .02,
						depth: depth[a],
						f0: 440,
						f1: 4000,
						filter: {bandwidth:1/8, frequency:4000, type:'bandpass'},
						mode: mode[b],
						release: .02
					}),
					volume: true
				});
			}
		}
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// layout assignment
	layout.assignment('Modulation Study',options,callbacks,{},mode,back);
}