const kick = new InstrumentJS.sample("Kick", "./sounds/kick.wav");
const snare = new InstrumentJS.sample("Snare", "./sounds/snare.wav");
const clap = new InstrumentJS.sample("Clap", "./sounds/clap.wav");
const hiHat = new InstrumentJS.sample("Hi Hat", "./sounds/hihat.wav");
const crash = new InstrumentJS.sample("Crash", "./sounds/crash.wav")

const levels = [
    new BeatGame.level(PianoRoll.beatFromEncodedState(1, 8, "jg"), 70),
    new BeatGame.level(PianoRoll.beatFromEncodedState(2, 8, "Iow"), 60),
    new BeatGame.level(PianoRoll.beatFromEncodedState(3, 16, "qqoICIGg"), 70),
    new BeatGame.level(PianoRoll.beatFromEncodedState(4, 16, "qqoIAiAUhUA"), 70),
    new BeatGame.level(PianoRoll.beatFromEncodedState(3, 16, "//8iIpyM"), 80),
    new BeatGame.level(PianoRoll.beatFromEncodedState(3, 16, "7u4QEKKG"), 70),
    new BeatGame.level(PianoRoll.beatFromEncodedState(5, 8, "CBQiQYA"), 60),
    new BeatGame.level(PianoRoll.beatFromEncodedState(5, 16, "AKgABAICBAGoAA"), 70)
]


var samples = [
    new InstrumentJS.sample("Kick", "./sounds/kick.wav"),
    new InstrumentJS.sample("Snare", "./sounds/snare.wav"),
    new InstrumentJS.sample("Hi Hat", "./sounds/hihat.wav"),
]


var melodicSamples = [
    new InstrumentJS.sample("C", "./sounds/Piano.pp.C3.wav"),
    new InstrumentJS.sample("D", "./sounds/Piano.pp.D3.wav"),
    new InstrumentJS.sample("E", "./sounds/Piano.pp.E3.wav"),
    new InstrumentJS.sample("F", "./sounds/Piano.pp.F3.wav"),
    new InstrumentJS.sample("G", "./sounds/Piano.pp.G3.wav")
]

const audioCtx = new AudioContext();

//const levelEditorSampler = new sampler(melodicSamples, audioCtx)
//levelEditorSampler.setEnvelope(0, .5, .1);

//const levelEditor = createRollWithController(document.getElementById("level-editor-roll"), levelEditorSampler, 16, audioCtx);

var smpler = new InstrumentJS.sampler(samples, audioCtx);

const rollAndController = PianoRoll.createRollWithController(document.getElementById("roll1"), smpler, 16, audioCtx);

createSingleLevelGame("roll2", [clap], levels[0]);

createSingleLevelGame("roll3", [kick, clap], levels[1]);

createSingleLevelGame("roll4", [kick, clap, hiHat], levels[2]);

createSingleLevelGame("roll5", [kick, clap, crash, hiHat], levels[3]);

createSingleLevelGame("roll6", [kick, snare, hiHat], levels[4]);

const game6 = createSingleLevelGame("roll7", [kick, snare, hiHat], levels[5]);
game6.wavesurfer.setWaveColor('white');
game6.wavesurfer.setProgressColor('white');

createSingleLevelGame("roll8", melodicSamples, levels[6]);

createSingleLevelGame("roll9", melodicSamples, levels[7]);


function createSingleLevelGame(containerId, samples, level){
    const s = new InstrumentJS.sampler(samples, audioCtx);
    s.setEnvelope(0, .5, .1);

    const game = BeatGame.createGamePianoRoll(document.getElementById(containerId), s, level.beat.getLength(), audioCtx);
    s.onloadsamples = () => game.game.startLevel(level);

    return game;
}