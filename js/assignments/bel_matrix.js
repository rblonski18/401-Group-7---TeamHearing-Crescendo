function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// init
	const mode = 'bel_matrix';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,4e3);
	}.bind(null,mode+'.'+a++));
	
	// Detection Thresholds (125 to 8k)
	options.push('Pure Tone Detection Thresholds (125 to 8k)');
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
				volume: {message: 'Set the volume to be soft but audible.'}
			})
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Speech in Noise Test
	options.push('Speech Reception Threshold (Matrix)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'matrix';
		protocol.ID = id;
		protocol.callback = ()=>{assignment()};
		/*protocol.open = ()=>{layout.message('Protocol Message',
			'This protocol includes 3 speech in noise tests.</br>Each test is presented with ongoing spoken speech as background noise.'
		)};*/
		protocol.settings.push({
			behavior: 'Adaptive',
			chances: 4,
			material: original,
			noise: 'babble_noise_extended',
			repeat: false,
			snr: new Adaptive({
				multiplier: 1,
				rule: 'linear',
				step0: 4,
				stepAdjustment: 2,
				stepMin: 1,
				value0 : 12,
				valueMax: 24
			}),
			trials: Infinity,
			volume: true
		});
		protocol.start(2);
	}.bind(null,mode+'.'+a++));
	
	// Speech in Noise Test
	options.push('Speech Reception Threshold (Matrix Vocoded)');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'matrix';
		protocol.ID = id;
		protocol.callback = ()=>{assignment()};
		/*protocol.open = ()=>{layout.message('Protocol Message',
			'This protocol includes 3 speech in noise tests.</br>Each test is presented with ongoing spoken speech as background noise.'
		)};*/
		protocol.settings.push({
			behavior: 'Adaptive',
			chances: 4,
			material: vocoded,
			noise: 'babble_vocoded_extended',
			repeat: false,
			snr: new Adaptive({
				multiplier: 1,
				rule: 'linear',
				step0: 4,
				stepAdjustment: 2,
				stepMin: 1,
				value0 : 12,
				valueMax: 24
			}),
			trials: Infinity,
			volume: true
		});
		protocol.start(2);
	}.bind(null,mode+'.'+a++));
	
	// layout assignment
	layout.assignment('Speech Reception with Vocoding',options,callbacks,{},mode,back);
}