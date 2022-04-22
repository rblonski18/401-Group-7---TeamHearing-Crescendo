function include(file){
    var script = document.createElement('script');
    script.src = file;
    script.type = 'text/javascript';
    script.async = false;

    document.getElementsByTagName('head').item(0).appendChild(script);
}

var wave = document.createElement('script');
wave.src = 'https://unpkg.com/wavesurfer.js';
document.getElementsByTagName('head').item(0).appendChild(wave);

include("./version/crescendo/js/PianoRollLib/pianoRoll.js");
include("./version/crescendo/js/PianoRollLib/instrument.js");
include("./version/crescendo/js/PianoRollLib/beatGame.js");
