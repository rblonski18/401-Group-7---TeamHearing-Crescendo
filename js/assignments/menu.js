function assignment(mode) {
	mode = mode ? mode : 'menu';

	// init
	let callback = () => { assignment(() => { loadassignment('menu'); }); };
	let callbacks = [], options = [];

	// Bimodal Study (Helena)
	options.push('Binaural Integration');
	callbacks.push(()=>{loadassignment('bel_bimodal',callback)});

	// Binaural Study (Helena)
	options.push('Binaural Benchmark');
	callbacks.push(()=>{loadassignment('bel_binaural',callback)});

	// Environmental Lateralization Study (Ray)
	options.push('Environmental Sound Movement');
	callbacks.push(()=>{loadassignment('bel_lateralization',callback)});
	
	// Gambling Study (Shivani)
	options.push('Gambling on Music');
	callbacks.push(()=>{loadassignment('bel_gambling',callback)});

	// Interval Training (Gigi)
	options.push('Interval Training');
	callbacks.push(()=>{loadassignment('bel_intervals',callback)});

	// Modulation Study (Ravi)
	options.push('Modulation Processing');
	callbacks.push(()=>{loadassignment('bel_modulation',callback)});

	// Music and Emotion (Danny)
	options.push('Music and Emotion');
	callbacks.push(()=>{loadassignment('bel_emotion',callback)});

	// Pitch Benchmark (Julianne)
	options.push('Pitch Benchmark');
	callbacks.push(()=>{loadassignment('bel_pitch_benchmark',callback)});

	// Pitch & Timbre (Sam)
	options.push('Pitch & Timbre');
	callbacks.push(()=>{loadassignment('bel_timbre',callback)});

	// Speech Benchmark (Julianne)
	options.push('Speech Benchmark');
	callbacks.push(()=>{loadassignment('bel_speech',callback)});

	// Stream Segregation (Stanford)
	options.push('Stream Segregation');
	callbacks.push(()=>{loadassignment('bel_stream',callback)});

	// Sequence Recreation
	options.push('Sequence Recreation');
	callbacks.push(()=>{loadassignment('bel_sequence',callback)});

	// extra
	let extra = {};//{'Assign':function(){homework.assignment()}};

	// layout assignment
	layout.assignment('Studies',options,callbacks,extra,mode);
}
