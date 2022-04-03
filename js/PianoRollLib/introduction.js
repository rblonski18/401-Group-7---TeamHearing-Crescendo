import {createRoll, createRollWithController, beatFromEncodedState} from "./pianoRoll.js";
import {sample, sampler} from "./instrument.js";
import { createGamePianoRoll, level } from "./beatGame.js";

const kick = new sample("Kick", "./sounds/kick.wav");
const snare = new sample("Snare", "./sounds/snare.wav");
const clap = new sample("Clap", "./sounds/clap.wav");
const hiHat = new sample("Hi Hat", "./sounds/hihat.wav");
const crash = new sample("Crash", "./sounds/crash.wav")

const levels = [
    new level(beatFromEncodedState(1, 8, "jg"), 70),
    new level(beatFromEncodedState(2, 8, "Iow"), 60),
    new level(beatFromEncodedState(3, 16, "qqoICIGg"), 70),
    new level(beatFromEncodedState(4, 16, "qqoIAiAUhUA"), 70),
    new level(beatFromEncodedState(3, 16, "//8iIpyM"), 80),
    new level(beatFromEncodedState(3, 16, "7u4QEKKG"), 70),
    new level(beatFromEncodedState(5, 8, "CBQiQYA"), 60),
    new level(beatFromEncodedState(5, 16, "AKgABAICBAGoAA"), 70)
]


var samples = [
    new sample("Kick", "./sounds/kick.wav"),
    new sample("Snare", "./sounds/snare.wav"),
    new sample("Hi Hat", "./sounds/hihat.wav"),
]


var melodicSamples = [
    new sample("C", "./sounds/Piano.pp.C3.wav"),
    new sample("D", "./sounds/Piano.pp.D3.wav"),
    new sample("E", "./sounds/Piano.pp.E3.wav"),
    new sample("F", "./sounds/Piano.pp.F3.wav"),
    new sample("G", "./sounds/Piano.pp.G3.wav")
]

const audioCtx = new AudioContext();

//const levelEditorSampler = new sampler(melodicSamples, audioCtx)
//levelEditorSampler.setEnvelope(0, .5, .1);

//const levelEditor = createRollWithController(document.getElementById("level-editor-roll"), levelEditorSampler, 16, audioCtx);

var smpler = new sampler(samples, audioCtx);

const rollAndController = createRollWithController(document.getElementById("roll1"), smpler, 16, audioCtx);

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
    const s = new sampler(samples, audioCtx);
    s.setEnvelope(0, .5, .1);

    const game = createGamePianoRoll(document.getElementById(containerId), s, level.beat.length(), audioCtx);
    s.onloadsamples = () => game.game.startLevel(level);

    return game;
}