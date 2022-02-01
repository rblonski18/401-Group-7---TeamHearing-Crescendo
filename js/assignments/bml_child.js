//Assal Music and Education Study
function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// init
	const mode = 'bml_child';
	let a = 0, callbacks = [], options = [];
	
	// Go-NoGo
	options.push('Go-NoGo');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'gonogo';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		protocol.settings.push({
			back: ()=>{assignment()}
		});
		protocol.start();
	}.bind(null,mode+'.'+a++));
	
	// Matrix Reasoning
	options.push('Matrix Reasoning');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'wasi';
		protocol.callback = ()=>{assignment()};
		protocol.ID = id;
		loadscript('wasi',()=>{wasi({
			back: ()=>{assignment()}
		})});
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
		protocol.settings.push({trials:24});
		protocol.start(3);
	}.bind(null,mode+'.'+a++));
	
	// layout assignment
	layout.assignment('Music Education and Child Development',options,callbacks,{},mode,back);
}