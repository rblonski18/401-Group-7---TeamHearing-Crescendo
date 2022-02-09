var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'violet',
    progressColor: 'purple'
});

wavesurfer.load('drumSample.wav');
wavesurfer.on('ready', function () {
    wavesurfer.play();
});

function play() {
    wavesurfer.play();
}

function pause() {
    wavesurfer.pause();
}
