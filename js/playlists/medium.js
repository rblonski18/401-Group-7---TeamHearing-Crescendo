let mediumPlaylist = [
  {
    mode: 'music',
    option: 'Melodic Contour',
    activity: 'musanim',
    settings: {
      spacing: 2, 
      trials: 15
    },
    repetitions: 3,
  },
  {
    mode: 'music',
    option: 'Pefect 5th vs Major 3rd',
    activity: 'intervals',
    settings: {
      intervals: [7, 4],
      words: ['Perfect 5th', 'Major 3rd'],
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
    option: 'Major 2nd vs Perfect 5th vs Octave',
    activity: 'intervals',
    settings: {
      intervals: [2, 7, 12],
      words: ['Major 2nd', 'Perfect 5th', 'Octave'],
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
    option: 'Minor 2nd vs Perfect 4th',
    activity: 'intervals',
    settings: {
      intervals: [1, 5],
      words: ['Minor 2nd', 'Perfect 4th'],
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
    option: 'Pitch Discrimination for Piano',
    activity: 'musescorePitchShifted',
    settings: {
      chances: -1,
      instrument: 0,
      instrument2: 0,
      mode: 0,
      range: [39, 51],
      timbreMode: 0,
      vocoder: false,
      volume: true,
      trials: 10,
    },
    repetitions: 3,
  },
  {
    mode: 'music',
    option: 'Pitch Discrimination for Saxophone',
    activity: 'musescorePitchShifted',
    settings: {
      chances: -1,
      instrument: 1,
      instrument2: 1,
      mode: 0,
      range: [39, 51],
      timbreMode: 0,
      vocoder: false,
      volume: true,
      trials: 10,
    },
    repetitions: 3,
  },  
  {
    mode: 'speech',
    option: 'Consonant Identification',
    activity: 'consonants',
    settings: {
      level: 3,
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
      level: 3,
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
			value0 : 0,
			valueMax: 0,
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
			value0 : 15,
			valueMax: 15,
			volume: true
		},
		repetitions: 3,
	},
];
