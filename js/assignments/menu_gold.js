function assignment(mode) {
	mode = mode ? mode : 'menu';

	// init
	let callback = () => { assignment( () => { loadassignment('menu_gold'); })};
	let callbacks = [], options = [];

	// Binaural Benchmark
	options.push('Binaural Benchmark');
	callbacks.push(()=>{loadassignment('bel_binaural',callback)});

	// Music and Emotion (Danny)
	options.push('Music and Emotion');
	callbacks.push(()=>{loadassignment('bel_emotion',callback)});

	// Pitch Benchmark
	options.push('Pitch Benchmark');
	callbacks.push(()=>{loadassignment('bel_pitch_benchmark',callback)});

	// Pitch with Timbre
	options.push('Pitch with Timbre');
	callbacks.push(()=>{loadassignment('bel_timbre',callback)});

	// Speech Benchmark
	options.push('Speech Benchmark');
	callbacks.push(()=>{loadassignment('bel_speech',callback)});

	// extra
	let extra = {};//{'Assign':function(){homework.assignment()}};

	// layout assignment
	layout.assignment('Studies',options,callbacks,extra,mode);
}
