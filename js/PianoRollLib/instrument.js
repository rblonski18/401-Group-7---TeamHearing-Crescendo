const InstrumentJS = (function () {

function sample(name, audio){
    this.name = name;
    this.audio = audio;
}

function sampler(samples, audioContext){
    this.notes = samples.map(sample => sample.name);
    this.audioContext = audioContext;
    this.envelope = new envelope(0, 10, 0);

    this.playNote = function(noteIndex, time, audioCtx){
        const gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.0;

        const sampleSource = audioCtx.createBufferSource();
        sampleSource.buffer = this.audio[noteIndex];
        sampleSource.connect(gainNode);

        gainNode.gain.linearRampToValueAtTime(1.0, time + this.envelope.attack);
        gainNode.gain.setTargetAtTime(0, time  + this.envelope.hold, this.envelope.release);

        sampleSource.start(time);
    }

    this.setEnvelope = function(attack, hold, release){
        this.envelope = new envelope(attack, hold, release);
    }   

    this._loadSamples = async function(){
        // For each sample...
        const requests = samples.map(
            // fetch the data from the url
            async sample => await fetch(sample.audio)
            
            // decode the response into an array buffer
            .then(res => res.arrayBuffer())
        
            // decode the array buffer into an audio data
            .then(ArrayBuffer => this.audioContext.decodeAudioData(ArrayBuffer))
        );
        
        this.audio = await Promise.all(requests);

        this.onloadsamples?.();
    }

    this._loadSamples();
}

function envelope(attack, hold, release){
    this.attack = attack;
    this.hold = hold;
    this.release = release;
}

return {
    sample: sample,
    sampler: sampler,
    envelope: envelope
};

})();