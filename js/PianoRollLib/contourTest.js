import {createRoll, createRollWithContourController, contourGameRoll} from "./pianoRoll.js";
import {sample, sampler} from "./instrument.js";

var samples = [
    new sample("C", "./sounds/Piano.pp.C3.wav"),
    new sample("D", "./sounds/Piano.pp.D3.wav"),
    new sample("E", "./sounds/Piano.pp.E3.wav"),
    new sample("F", "./sounds/Piano.pp.F3.wav"),
    new sample("G", "./sounds/Piano.pp.G3.wav"),
    new sample("A", "./sounds/Piano.pp.A3.wav"),
    new sample("B", "./sounds/Piano.pp.B3.wav"),
]

const audioCtx = new AudioContext();

var smpler = new sampler(samples, audioCtx);

createRollWithContourController(document.getElementById("roll1"), smpler, 5, audioCtx);

contourGameRoll(document.getElementById("roll2"), smpler, 5, audioCtx);
