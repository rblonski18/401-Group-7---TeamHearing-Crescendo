

let easyPlaylist = [
	{
		mode: 'music',
		option: 'Melodic Contour',
		activity: 'musanim',
		settings: {
			spacing: 4, 
			trials: 15
		},
		repetitions: 3,
	},
	{
		mode: 'music',
		option: 'Melody & Rhythm Comparisons',
		activity: 'confronto',
		settings: {
			practice: false,
			volume: true,
			trials: 15
		},
		repetitions: 3,
	},
	// interval training
	{
		mode: 'music',
		option: 'Pefect 4th vs Octave',
		activity: 'intervals',
		settings: {
			intervals: [5, 12],
			words: ['Perfect 4th', 'Octave'],
			level: 127,
			practice: false,
			range: [39, 51],
			trials: 15,
			volume: true
		},
		repetitions: 3,
	},
	{
		mode: 'music',
		option: 'Major 2nd vs Minor 7th',
		activity: 'intervals',
		settings: {
			intervals: [2, 10],
			words: ['Major 2nd', 'Minor 7th'],
			level: 127,
			practice: false,
			range: [39, 51],
			trials: 15,
			volume: true
		},
		repetitions: 3,
	},
	{
		mode: 'music',
		option: 'Major 6th vs Minor 2nd',
		activity: 'intervals',
		settings: {
			intervals: [9, 1],
			words: ['Major 6th', 'Minor 2nd'],
			level: 127,
			practice: false,
			range: [39, 51],
			trials: 15,
			volume: true
		},
		repetitions: 3,
	},
	{
		mode: 'music',
		option: 'Instrument Identification',
		activity: 'musescore',
		settings: {
			chances: 100,
			f0: 110,
			instruments: ['piano','tenor sax'],
			mode: 1,
			path: ['data/musescore/3secpiano/','data/musescore/3sectenorsax/'],
			range: [39, 51],
			trials: 15,
			vocoder: false,
			volume: true,
			snr: 6,
		},
		repetitions: 3,
	},
	{
		mode: 'speech',
		option: 'Consonant Identification',
		activity: 'consonants',
		settings: {
			level: 1,
			noise: 'Speech-Shaped Noise',
			trials: version == 'alpha' && subuser.ID == 3 ? 1 : 20,
			volume: true
		},
		repetitions: 3,
	},
	{
		mode: 'speech',
		option: 'Vowel Identification',
		activity: 'vowels',
		settings: {
			level: 1,
			noise: 'Speech-Shaped Noise',
			trials: version == 'alpha' && subuser.ID == 3 ? 1 : 24,
			volume: true
		},
		repetitions: 3,
	},
	{
		mode: 'speech',
		option: 'Sentence Completion in Background Noise',
		activity: 'spin',
		settings: {
			adaptive: 'snr',
		//	behavior: 'Adaptive',
			chances: Infinity,
			noise: 'Two Talker Masker (English)',
			step0: 2,
			trials: 15,
			value0 : 20,
			valueMax: 20,
			volume: true
		},
		repetitions: 3,
	},
	{
		mode: 'speech',
		option: 'Sentence Completion',
		activity: 'spin',
		settings: {
			adaptive: 'snr',
			/*
			NOTE: adaptive sounds like a great idea, if there is a way to do trials + adaptive
			then that would be preferable.
			*/
			//behavior: 'Adaptive',
			chances: Infinity,
			noise: 'Two Talker Masker (English)',
			step0: 2,
			trials: 15,
			value0 : 25,
			valueMax: 25,
			volume: true
		},
		repetitions: 3,
	},
];

