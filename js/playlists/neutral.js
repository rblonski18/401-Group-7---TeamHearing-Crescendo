let neutralPlaylist = [
	{
		mode: 'speech',
		option: 'Sentence Completion',
		activity: 'spin',
		settings: {
			adaptive: 'snr',
			behavior: 'Adaptive',
			chances: 4,
			noise: 'Two Talker Masker (English)',
			step0: 2,
			trials: Infinity,
			value0 : 12,
			valueMax: 24,
			volume: true
		},
		repetitions: 3,
	},
	{
		mode: 'speech',
		option: 'Sound Movement',
		activity: 'lateralization',
		settings: {
			chances: 4,
			volume: true
		},
		repetitions: 3,
		//random: false
	}
];