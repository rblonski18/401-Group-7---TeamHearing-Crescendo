function assignment(back) {
	back = back ? back : () => { layout.dashboard(); };

	// initialize
	const mode = 'bel_sequence';
	let a = 0, callbacks = [], options = [];
	let chanceCount = version == 'alpha' && subuser.ID == 3 ? 1 : 4;
	let reps = version == 'alpha' && subuser.ID == 3 ? 1 : 1;


	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));

	// Sequencing (Percussion)
	options.push('Sequence Recreation (Percussion)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'sequence';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.settings.push({
			mode: 0,
			chances: chanceCount
		});
		protocol.start(reps);
		
	}.bind(null,mode+"."+a++));

	options.push('Sequence Recreation (Melodic)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'sequence';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.settings.push({
			mode: 1,
			chances: chanceCount
		});
		protocol.start(reps);
	}.bind(null,mode+"."+a++));

	// layout assignment
	layout.assignment('Sequence Recreation',options,callbacks,{},mode,back);
}
