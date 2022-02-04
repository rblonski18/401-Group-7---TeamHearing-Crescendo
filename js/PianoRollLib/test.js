import {createRoll, createRollWithController} from "./pianoRoll.js";
import {sample, sampler} from "./instrument.js";

var samples = [
    new sample("Kick", "./sounds/kick.wav"),
    new sample("Snare", "./sounds/snare.wav"),
    new sample("Hi Hat", "./sounds/hihat.wav")
]

const audioCtx = new AudioContext();

var smpler = new sampler(samples, audioCtx);

createRollWithController(document.getElementById("roll1"), smpler, 16, audioCtx);