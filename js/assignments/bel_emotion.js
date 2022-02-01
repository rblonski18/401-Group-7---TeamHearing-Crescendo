function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// init
	const mode = 'bel_emotion';
	let a = 0, callbacks = [], options = [];
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));
	
	// Major/Minor Melodies
	options.push('Major vs Minor Melodies');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'majorMinor';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.settings.push({
			practice: false,
			stimulusMode: 0,
			volume: true
		});
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
	
	// Musical Valence and Arousal Original Clips (Survey)
	options.push('Musical Valence and Arousal 1');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'qualtrics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.open = function (callback) {
			layout.message('Protocol Message',
			'This protocol includes 1 survey with 40 questions.',
			callback
		)};
		protocol.settings.push({
			mode: 0,
			volume: true
		});
		protocol.start();
	}.bind(null,mode+'.'+a++));

	// Musical Valence and Arousal Modified Clips (Survey)
	options.push('Musical Valence and Arousal 2');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'qualtrics';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.open = function (callback) {
			layout.message('Protocol Message',
			'This protocol includes 1 survey with 40 questions.',
			callback
		)};
		protocol.settings.push({
			mode: 1,
			volume: true
		});
		protocol.start();
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
				spacing: spacings[a]
			});
		}
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// layout assignment
	layout.assignment('Music and Emotion Study',options,callbacks,{},mode,back);
}