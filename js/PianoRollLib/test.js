import {createRoll, createRollWithController} from "./pianoRoll.js";
import {sample, sampler} from "./instrument.js";
import { levels, createGamePianoRoll, melodicLevels } from "./beatGame.js";
var samples = [
    new sample("Kick", "./sounds/kick.wav"),
    new sample("Snare", "./sounds/snare.wav"),
    new sample("Hi Hat", "./sounds/hihat.wav")
]

const audioCtx = new AudioContext();

var smpler = new sampler(samples, audioCtx);

const rollAndController = createRollWithController(document.getElementById("roll1"), smpler, 16, audioCtx);


const gameRollAndController = createGamePianoRoll(document.getElementById("roll2"), smpler, 16, audioCtx);
const game = gameRollAndController.game;

var levelIndex = 0;

game.onlevelcomplete = () => game.startLevel(levels[++levelIndex]);

smpler.onloadsamples = () => game.startLevel(levels[levelIndex]);


var melodicSamples = [
    new sample("C", "./sounds/Piano.pp.C3.wav"),
    new sample("D", "./sounds/Piano.pp.D3.wav"),
    new sample("E", "./sounds/Piano.pp.E3.wav"),
    new sample("F", "./sounds/Piano.pp.F3.wav"),
    new sample("G", "./sounds/Piano.pp.G3.wav")
]

var melodicSampler = new sampler(melodicSamples, audioCtx);
melodicSampler.setEnvelope(0, .5, .1);

const melodicGameRollAndController = createGamePianoRoll(document.getElementById("roll3"), melodicSampler, 16, audioCtx);

melodicSampler.onloadsamples = () => melodicGameRollAndController.game.startLevel(melodicLevels[0]);

//createRollWithController(document.getElementById("roll3"), melodicSampler, 16, audioCtx);
