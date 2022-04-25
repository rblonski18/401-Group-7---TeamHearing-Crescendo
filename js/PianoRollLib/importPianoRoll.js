/**
 * Takes in a filepath and creates a script tag to 
 * include the javascript methods
 * @param {*} file - Is a file path string
 */
function include(file){
    var script = document.createElement('script');
    script.src = file;
    script.type = 'text/javascript';
    script.async = false;

    document.getElementsByTagName('head').item(0).appendChild(script);
}

/**
 * Imports the wavesurfer javascript library for
 * waveform dislpay in the beat game.
 */
var wave = document.createElement('script');
wave.src = 'https://unpkg.com/wavesurfer.js';
document.getElementsByTagName('head').item(0).appendChild(wave);

/**
 * Imports CSS file using link tag for 
 * beat game/piano roll
 */
var prCSS = document.createElement('link');
prCSS.rel = 'stylesheet';
prCSS.href = './version/crescendo/css/pianoRoll.css';
prCSS.type = 'text/css';
document.getElementsByTagName('head').item(0).appendChild(prCSS);

include("./version/crescendo/js/PianoRollLib/pianoRoll.js");
include("./version/crescendo/js/PianoRollLib/instrument.js");
include("./version/crescendo/js/PianoRollLib/beatGame.js");
