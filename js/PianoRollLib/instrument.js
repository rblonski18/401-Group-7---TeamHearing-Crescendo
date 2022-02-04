export function sample(name, audio){
    this.name = name;
    this.audio = audio;
}

export function sampler(samples, audioContext){
    this.notes = samples.map(sample => sample.name);
    this.audioContext = audioContext;

    this.playNote = function(noteIndex, time){
        const sampleSource = this.audioContext.createBufferSource();
        sampleSource.buffer = this.audio[noteIndex];
        sampleSource.connect(this.audioContext.destination);
        sampleSource.start(time);
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
    }

    this._loadSamples();
}
