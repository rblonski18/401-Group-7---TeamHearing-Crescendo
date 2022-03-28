let hardPlaylist = [
  {
    mode: 'music',
    option: 'Melodic Contour',
    activity: 'musanim',
    settings: {
      spacing: 1, //material: new Musanim({spacing:spacings[a]})
      trials: 15
    },
    repetitions: 3
  },
  // interval training
  {
    mode: 'music',
    option: 'Minor 2nd vs Major 3rd',
    activity: 'intervals',
    settings: {
      intervals: [1, 4],
      words: ['Minor 2nd', 'Major 3rd'],
      level: 127,
      practice: false,
      range: [39, 51],
      trials: 15,
      volume: true
    },
  },
  {
    mode: 'music',
    option: 'Major 2nd vs Perfect 4th vs Major 6th',
    activity: 'intervals',
    settings: {
      intervals: [2, 5, 9],
      words: ['Major 2nd', 'Perfect 4th', 'Major 6th'],
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
    option: 'Major 6th vs Octave',
    activity: 'intervals',
    settings: {
      intervals: [9, 12],
      words: ['Major 6th', 'Octave'],
      level: 127,
      practice: false,
      range: [39, 51],
      trials: 15,
      volume: true
    },
    repetitions: 3
  },
  {
    mode: 'music',
    option: 'Pitch Discrimination with Mixed Instruments',
    activity: 'musescorePitchShifted',
    settings: {
      chances: -1,
      instruments: ['piano','tenor sax'],
      mode: 0,
      range: [39, 51],
      timbreMode: 2,
      vocoder: false,
      volume: true,
      trials: 10
    }, 
    repetitions: 3,
  },
  {
    mode: 'speech',
    option: 'Consonant Identification',
    activity: 'consonants',
    settings: {
      level: 5,
      noise: 'Speech-Shaped Noise',
      trials: version == 'alpha' && subuser.ID == 3 ? 1 : 20,
      volume: true
    },
    repetitions: 3,
  },
  {
    mode: 'music',
    option: 'Vowel Identification',
    activity: 'vowels',
    settings: {
      level: 5,
      noise: 'Speech-Shaped Noise',
      trials: version == 'alpha' && subuser.ID == 3 ? 1 : 24,
      volume: true
    },
    repetitions: 3,
  },

];
