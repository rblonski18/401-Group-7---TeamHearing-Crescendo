var samples = [
    new InstrumentJS.sample("C", "./sounds/Piano.pp.C3.wav"),
    new InstrumentJS.sample("D", "./sounds/Piano.pp.D3.wav"),
    new InstrumentJS.sample("E", "./sounds/Piano.pp.E3.wav"),
    new InstrumentJS.sample("F", "./sounds/Piano.pp.F3.wav"),
    new InstrumentJS.sample("G", "./sounds/Piano.pp.G3.wav"),
    new InstrumentJS.sample("A", "./sounds/Piano.pp.A3.wav"),
    new InstrumentJS.sample("B", "./sounds/Piano.pp.B3.wav"),
]

const audioCtx = new AudioContext();

var smpler = new InstrumentJS.sampler(samples, audioCtx);

const sample = new ContourPianoRoll.createContourSampleRoll(document.getElementById("roll1"), smpler, 5, audioCtx);

const game = new ContourPianoRoll.createContourGameRoll(document.getElementById("roll2"), smpler, 5, audioCtx);
