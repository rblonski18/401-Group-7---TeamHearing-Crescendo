//Assal Music and Education Study
function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// initialize
	const mode = 'bml_mind';
	let a = 0, callbacks = [], options = [];
	
	// Survey
	options.push('Survey: Click me first');
	callbacks.push(function(id){
		window.open("https://usc.qualtrics.com/jfe/form/SV_4Vf0qeVaFVWZDLv",'Survey');
	}.bind(null,mode+'.'+a++));
	
	// Loudness Levels
	options.push('Loudness Levels');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.ID = id;
		gui.loudness(false,1e3);
	}.bind(null,mode+'.'+a++));
	
	// Pure Tone Detection Thresholds
	options.push('Pure Tone Detection Thresholds');
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
				release: .02
			})
		}
		protocol.start();
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
	
	// Melodic Contour Identification
	options.push('Melodic Contour Identification');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'musanim';
		protocol.ID = id;
		const spacings = [4,2,1];
		for (let a = 0; a < spacings.length; a++) {
			protocol.settings.push({
				spacing:spacings[a]
			});
		}
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// SPIN
	options.push('SPIN');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'spin';
		protocol.ID = id;
		protocol.callback = ()=>{assignment()};
		protocol.random = false;
		protocol.settings[0] = {noise:'Off', repeat:false, trials:20};
		protocol.settings[1] = {noise:'Two Talker Masker (English)', repeat:false, snr:0, trials:20};
		protocol.settings[2] = {noise:'Two Talker Masker (English)', repeat:false, snr:-5, trials:20};
		protocol.settings[3] = {noise:'Two Talker Masker (English)', repeat:false, snr:-8, trials:20};
		protocol.settings[4] = {noise:'Two Talker Masker (English)', repeat:false, snr:-10, trials:20};
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// layout assignment
	layout.assignment('Music and Mindfulness Study',options,callbacks,{},mode,back);
}