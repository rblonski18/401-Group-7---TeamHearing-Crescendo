var numRollSquares = 0;
const LOOK_AHEAD = .1;

const wavesurfer = WaveSurfer.create({
    container: '#wavesurf',
    waveColor: 'black',
    progressColor: 'orange',
    height: 100,
    interact: false
});

wavesurfer.on('finish', () => wavesurfer.seekTo(0));

export function createRollWithController(domParent, instrument, length, audioCtx){
    const controls = createRollController(domParent);
    const pianoRoll = createRoll(domParent, instrument, length, audioCtx);

    controls.bindToPianoRoll(pianoRoll);

    return {
        controller: controls,
        roll: pianoRoll
    }
}

export function createRoll(domParent, instrument, length, audioCtx){
    var rollSquares = [];

    var dom = {};
    dom.squares = rollSquares;

    var roll = new pianoRoll(instrument, length, dom, audioCtx);

    // rollHolder allows for absolute positioning of the playhead over the pianoroll
    var rollHolder = document.createElement("div");
    rollHolder.classList.add("pianoRollHolder");
    dom.root = rollHolder;
    
    // rollDom is the parent of the entire piano roll
    var rollDom = document.createElement("div");
    rollDom.classList.add("pianoRoll");
    rollHolder.appendChild(rollDom);

    // Create playhead
    var playHeadHolder = document.createElement("div");
    playHeadHolder.classList.add("pianoRollPlayHeadHolder");
    rollHolder.appendChild(playHeadHolder);
    dom.playHeadHolder = playHeadHolder;

    var playHead = document.createElement("div");
    playHead.classList.add("pianoRollPlayHead");
    playHeadHolder.appendChild(playHead);
    dom.playHead = playHead;

    // For each note on the instrument, create a row
    // rows are created in reverse order since notes should read from bottom to top
    for(let i = instrument.notes.length - 1; i >= 0; i--){
        var row = document.createElement("div");
        row.classList.add("pianoRollRow");

        var rowLabel = document.createElement("div");
        rowLabel.classList.add("pianoRollRowLabel");
        rowLabel.innerText = instrument.notes[i];

        row.appendChild(rowLabel);

        for(let j = 0; j < length; j++){
            var square = document.createElement("div");
            square.classList.add("pianoRollSquare");

            square.id = "pianoRollSquare_" + numRollSquares;
            numRollSquares += 1;

            square.onclick = () => roll.clickSquare(instrument.notes.length - 1 - i, j);

            rollSquares.push(square);

            row.appendChild(square);
        }

        rollDom.appendChild(row);
    }

    domParent.appendChild(rollHolder);

    return roll;
}

export function createRollController(domParent){
    var dom = {};

    // Create controls row
    var controls = document.createElement("div");
    controls.classList.add("pianoRollRow");
    controls.classList.add("pianoRollControls");
    domParent.appendChild(controls);

    // Create reset button
    var resetButton = document.createElement("button");
    resetButton.classList.add("pianoRollButton");
    resetButton.classList.add("pianoRollResetButton");
    resetButton.innerText = "Reset"
    controls.appendChild(resetButton);
    dom.resetButton = resetButton;

    // Create play button
    var playButton = document.createElement("button");
    playButton.classList.add("pianoRollButton");
    playButton.classList.add("pianoRollPlayButton");
    playButton.innerText = "Play"
    controls.appendChild(playButton);
    dom.playButton = playButton;

    var saveButton = document.createElement("button");
    saveButton.classList.add("pianoRollButton");
    saveButton.innerText = "Save"
    controls.appendChild(saveButton);
    dom.saveButton = saveButton;

    var loadButton = document.createElement("button");
    loadButton.classList.add("pianoRollButton");
    loadButton.innerText = "Load"
    controls.appendChild(loadButton);
    dom.loadButton = loadButton;
    
    var exportButton = document.createElement("button");
    exportButton.classList.add("pianoRollButton");
    exportButton.innerText = "Export"
    controls.appendChild(exportButton);
    dom.exportButton = exportButton;

    // Create bpm button
    /*
    var bpmSlider = document.createElement("input");
    bpmSlider.setAttribute("type", "range");
    controls.appendChild(bpmSlider);
    dom.bpmSlider = bpmSlider;
    */

    return new pianoRollController(dom);
} 

function pianoRollController(dom){
    this.pianoRoll;
    this._dom = dom;

    dom.playButton.onclick = () => this.onClickPlayButtom();
    dom.resetButton.onclick = () => this.onClickReset();
    dom.exportButton.onclick = () => this.onClickExport();
    dom.saveButton.onclick = () => this.onClickSave();
    dom.loadButton.onclick = () => this.onClickLoad();

    this.bindToPianoRoll = function(pianoRoll){
        this.pianoRoll = pianoRoll;
    }

    this.onClickPlayButtom = function(){
        if(this.pianoRoll === undefined){
            return;
        }

        if(this.pianoRoll.isPlaying()){
            this.pianoRoll.stop();
            this._dom.playButton.innerText = "Play";
        }
        else{
            this.pianoRoll.play(70, true);
            this._dom.playButton.innerText = "Stop";
        }
    }

    this.onClickReset = function(){
        if(this.pianoRoll === undefined){
            return;
        }

        if(this.pianoRoll.isPlaying()){
            this.pianoRoll.stop();
        }

        this.pianoRoll.reset();
        this._dom.playButton.innerText = "Play";
    }

    this.onClickExport = function(){
        const notes = this.pianoRoll.instrument.notes.length;
        const length = this.pianoRoll.length;
        const state = boolArrayToBase64(this.pianoRoll.getBeatStates().getState());
        
        console.log(`beatFromEncodedState(${notes}, ${length}, \"${state}\")`);
    }

    this.onClickSave = function(){
        const beatState = this.pianoRoll.getBeatStates().getState();
        const encoded = boolArrayToBase64(beatState);
        navigator.clipboard.writeText(encoded);
    }

    this.onClickLoad = function(){
        const beatState = navigator.clipboard.readText().then(
            text => {
                const decoded = base64ToBoolArray(text);

                const stateCopy = this.pianoRoll.getBeatStates();
                stateCopy.setState(decoded);

                this.pianoRoll.loadBeatStates(stateCopy);
                this.pianoRoll.drawWaveform(stateCopy);
        });
    }
}

function beat(numNotes, length){
    this._state = new Array(numNotes * length).fill(false);

    this.isBeatToggled = function(beatIndex, noteIndex){
        return this._state[beatIndex + noteIndex * length];
    }

    this.setBeat = function(beatIndex, noteIndex, value){
        this._state[beatIndex + noteIndex * length] = value;
    }

    this.getCopy = function(){
        let copy = new beat(numNotes, length);
        copy._state = Array.from(this._state);

        return copy;
    }

    this.setAll = function(value){
        this._state.fill(value);
    }

    this.getState = function(){
        return Array.from(this._state);
    }

    this.setState = function(state){
        this._state = Array.from(state);
    }
}

export function beatFromEncodedState(numNotes, length, state){
    const newBeat = new beat(numNotes, length);
    const decoded = base64ToBoolArray(state);

    newBeat.setState(decoded);

    return newBeat;
}

// From https://stackoverflow.com/a/67039932/10184960
function boolArrayToBase64(arr){
    // Base64 character set
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    // How many bits does one character represent
    const bitsInChar = 6; // = Math.floor( Math.log2(characters.length) );

    // The output string
    let string = "";

    // Loop through the bool array (six bools at a time)
    for (let charIndex = 0; charIndex < arr.length / bitsInChar; charIndex++) {
        let number = 0;

        // Convert these six bools to a number (think of them as bits of the number) 
        for (let bit = 0; bit < bitsInChar; bit++)
            number = number * 2 + (arr[charIndex*bitsInChar + bit] ? 1 : 0);

        // Convert the number to a Base64 character and add it to output
        string += characters.charAt(number);
    }

    return string;
}

// From https://stackoverflow.com/a/67039932/10184960
function base64ToBoolArray(string) {
    // Base64 character set
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    // How many bits does one character represent
    const bitsInChar = 6; // = Math.floor( Math.log2(characters.length) );

    // The output array
    const array = [];

    // Loop through the input string one character at a time
    for (let charIndex = 0; charIndex < string.length; charIndex++) {
        
        // Convert the Base64 char to a number 
        let number = characters.indexOf(string.charAt(charIndex));

        // Convert the number to six bools (think of them as bits of the number) 
        // And assign them to the right places in the array
        for (let bit = bitsInChar - 1; bit >= 0; bit--) {
            array[charIndex*bitsInChar + bit] = !!(number % 2)
            number = Math.floor(number / 2);
        }
    }

    return array;
}

/**
* Appends two ArrayBuffers into a new one.
* 
* @param {ArrayBuffer} buffer1 The first buffer.
* @param {ArrayBuffer} buffer2 The second buffer.
*/
function appendBuffer(buffer1, buffer2, audioCtx) {
    var numberOfChannels = Math.min( buffer1.numberOfChannels, buffer2.numberOfChannels );
    var tmp = audioCtx.createBuffer( numberOfChannels, parseFloat(buffer1.length + buffer2.length), parseFloat(buffer1.sampleRate) );
    for (var i=0; i<numberOfChannels; i++) {
    var channel = tmp.getChannelData(i);
    channel.set( buffer1.getChannelData(i), 0);
    channel.set( buffer2.getChannelData(i), buffer1.length);
    }
    return tmp;
}

function mix(buffers, audioContext) {

    var nbBuffer = buffers.length;// Get the number of buffer contained in the array buffers
    var maxChannels = 0;// Get the maximum number of channels accros all buffers
    var maxDuration = 0;// Get the maximum length

    for (var i = 0; i < nbBuffer; i++) {
        if (buffers[i].numberOfChannels > maxChannels) {
            maxChannels = buffers[i].numberOfChannels;
        }
        if (buffers[i].duration > maxDuration) {
            maxDuration = buffers[i].duration;
        }
    }

    // Get the output buffer (which is an array of datas) with the right number of channels and size/duration
    var mixed = audioContext.createBuffer(maxChannels, audioContext.sampleRate * maxDuration, audioContext.sampleRate);        

    for (var j=0; j<nbBuffer; j++){

        // For each channel contained in a buffer...
        for (var srcChannel = 0; srcChannel < buffers[j].numberOfChannels; srcChannel++) {

            var _out = mixed.getChannelData(srcChannel);// Get the channel we will mix into
            var _in = buffers[j].getChannelData(srcChannel);// Get the channel we want to mix in

            for (var i = 0; i < _in.length; i++) {
                _out[i] += _in[i];// Calculate the new value for each index of the buffer array
            }
        }
    }

    return mixed;
}

function pianoRoll(instrument, length, dom, audioCtx){
    this.instrument = instrument;
    this.audioCtx = audioCtx;
    this.length = length;
    this.isInteractionEnabled = true;

    this._dom = dom;
    this._beatStates = new beat(instrument.notes.length, length);
    this._isPlaying = false;
    this._playHeadAnimator = new playHeadAnimator(dom, length, (i, time) => this.playBeat(i, time), audioCtx);
    this._playHeadAnimator.onFinishPlaying = () => this.resetPlayProgress();
    this._bpm = 70;

    this._beatListeners = []

    this.clickSquare = function(noteIndex, beatIndex){
        if(this.isInteractionEnabled){
            this.clearSquareStyles(beatIndex, noteIndex);
            this.toggleSquare(noteIndex, beatIndex);
        }
    }

    this.toggleSquare = function(noteIndex, beatIndex){
        let isToggled = this._beatStates.isBeatToggled(beatIndex, noteIndex);

        if(isToggled){
            this._dom.squares[beatIndex + noteIndex * length].classList.remove("pianoRollSquareHighlighted");
        }
        else {
            this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
        }

        this._beatStates.setBeat(beatIndex, noteIndex, !isToggled)
    };

    this.isBeatToggled = function(beatIndex, noteIndex){
        return this._beatStates.isBeatToggled(beatIndex, noteIndex);
    };

    this.play = function(bpm, loop, startBeat, endBeat){
        if(this.audioCtx.state === 'suspended'){
            this.audioCtx.resume().then(()=>this.play(bpm, loop, startBeat, endBeat));
            return;
        }

        if(startBeat === undefined){
            startBeat = 0;
        }

        if(endBeat === undefined){
            endBeat = length;
        }

        this._playHeadAnimator.play(bpm, loop, startBeat, endBeat);

        this._isPlaying = true;
    }

    this.resetPlayProgress = function(){
        this.stop();
        this._playHeadAnimator.reset();
    }

    this.stop = function(){
        this._playHeadAnimator.stop();

        this._isPlaying = false;
    }

    this.togglePlay = function(){
        if(this._isPlaying){
            this.stop();
        }
        else{
            this.play(this._bpm, true);
        }
    }

    this.isPlaying = function(){
        return this._isPlaying;
    }

    this.reset = function(){
        for(let i = 0; i < this._dom.squares.length; i++){
            this._dom.squares[i].classList.remove("pianoRollSquareHighlighted");
        }

        this._beatStates.setAll(false);

        this._playHeadAnimator.reset();
    };

    this.playBeat = function(beatIndex, time){
        if(time === undefined){
            time = this.audioCtx.currentTime;
        }

        for(let i = 0; i < this.instrument.notes.length; i++){
            if(this._beatStates.isBeatToggled(beatIndex, i)){
                this.instrument.playNote(this.instrument.notes.length - 1 - i, time);
            }
        }

        for(const listener of this._beatListeners){
            listener(beatIndex, time);
        }
    }

    this.addBeatListener = function(listener){
        this._beatListeners.push(listener);
    }

    this.addSquareStyle = function(beatIndex, noteIndex, styleClass){
        this._dom.squares[beatIndex + noteIndex * length].classList.add(styleClass);
    }

    this.removeSquareStyle = function(beatIndex, noteIndex, styleClass){
        this._dom.squares[beatIndex + noteIndex * length].classList.remove(styleClass);
    }

    this.clearSquareStyles = function(beatIndex, noteIndex){
        this._dom.squares[beatIndex + noteIndex * length].className = "";

        this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquare");

        if(this._beatStates.isBeatToggled(beatIndex, noteIndex)){
            this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
        }
    }

    this.clearAllSquareStyles = function(){
        for(let beatIndex = 0; beatIndex < this.length; beatIndex++){
            for(let noteIndex = 0; noteIndex < this.instrument.notes.length; noteIndex++){
                this.clearSquareStyles(beatIndex, noteIndex);
            }
        }
    }

    this.getBeatStates = function(){
        return this._beatStates.getCopy();
    }

    this.loadBeatStates = function(beatStates){
        this._beatStates = beatStates;

        for(let beatIndex = 0; beatIndex < this.length; beatIndex++){
            for(let noteIndex = 0; noteIndex < this.instrument.notes.length; noteIndex++){
                let isToggled = this._beatStates.isBeatToggled(beatIndex, noteIndex);

                if(isToggled){
                    this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
                }
                else {
                    this._dom.squares[beatIndex + noteIndex * length].classList.remove("pianoRollSquareHighlighted");
                }
            }
        }
    }

    this.drawWaveform = function(beatStates) {
        this._beatStates = beatStates;
        var emptyBuffer = this.audioCtx.createBuffer(2, 10500, 48000);
        var finalBuffer;

        for(let beatIndex = 0; beatIndex < this.length; beatIndex++){
            var audioBuffers = [];
            var bufferIndex = 0;
            for(let noteIndex = 0; noteIndex < this.instrument.notes.length; noteIndex++){
                let isToggled = this._beatStates.isBeatToggled(beatIndex, noteIndex);

                if(isToggled){
                    audioBuffers[bufferIndex++] = this.instrument.audio[noteIndex];
                }
                else {
                    audioBuffers[bufferIndex++] = emptyBuffer;
                }
            }
            var mixedBuffer = mix(audioBuffers, this.audioCtx);
            if(beatIndex == 0) {
                finalBuffer = mixedBuffer;
            }
            else {
                finalBuffer = appendBuffer(finalBuffer, mixedBuffer, this.audioCtx);
            }
        }
        wavesurfer.loadDecodedBuffer(finalBuffer);
    }
}


/*
    The playHeadAnimator serves two purposes:
    1. Animating the UI playhead to show the user where in the beat is being played
    2. Trigger the beat play callback to play beats in time (using a lookahead) 
*/
function playHeadAnimator(dom, numBeats, beatCallback, audioCtx){
    this._dom = dom;
    this._numBeats = numBeats;
    this._audioCtx = audioCtx;
    this._pos = 0;
    this._animationId;

    this._isPlaying = false;
    this._bpm = 0;
    this._isLooping = false;
    this._beatCallback = beatCallback;

    this._nextNoteTime = 0;
    this._nextUnplayedNote = 0;

    this._startPos;
    this._startTime;

    this._startBeat;
    this._endBeat;

    this.play = function(bpm, loop, startBeat, endBeat){
        if(this._isPlaying){
            this.reset();
        }

        this._bpm = bpm;
        this._isLooping = loop;
        this._startBeat = startBeat;
        this._endBeat = endBeat;

        // Calculate non rounded beat position
        const currentBeat = this._getCurrentBeat();
        const extraPx = this._pos - currentBeat * this._getBeatWidth();
        const remainingPx = this._getBeatWidth() - extraPx;

        // Calculate time of next note
        this._nextUnplayedNote = (extraPx == 0 ? currentBeat : currentBeat + 1) % this._numBeats;
        this._nextNoteTime = audioCtx.currentTime + (extraPx == 0 ? 0 : remainingPx * this._getSecondsPerPx());

        this._startPos = this._pos;
        this._startTime = performance.now();

        this._setPlayHeadPosition(this._pos);

        this._animationId = window.requestAnimationFrame((t) => this._update(t));
        this._isPlaying = true;
    }

    this.stop = function(){
        window.cancelAnimationFrame(this._animationId);
        this._isPlaying = false;
    }

    this.reset = function(){
        window.cancelAnimationFrame(this._animationId);

        this._setPlayHeadPosition(0);

        this._isPlaying = false;
    }

    this._update = function(timestamp){

        if(this._startTime > performance.now()){
            return;
        }

        const elapsedTime = performance.now() - this._startTime;
        
        this._pos = (this._startPos + elapsedTime / 1000 * this._getPxPerSecond());
        if(this._isLooping){
            const playingGridLengthDebug = this._getPlayingGridLength();
            this._pos = this._pos % this._getPlayingGridLength();
        }

        while(this._nextNoteTime < this._audioCtx.currentTime + LOOK_AHEAD){
            beatCallback(this._nextUnplayedNote, this._nextNoteTime);
            this._nextNoteTime += (60 / this._bpm) / 4;

            if(this._nextUnplayedNote + 1 >= this._getNumBeatsPlaying() && !this._isLooping){
                break;
            }

            this._nextUnplayedNote = (this._nextUnplayedNote + 1) % this._getNumBeatsPlaying();            
        }

        const x = this._pos;

        this._setPlayHeadPosition(x);

        this._animationId = window.requestAnimationFrame((t) => this._update(t));

        if(this._pos >= this._getPlayingGridLength() && !this._isLooping){
            this.stop();
            this.onFinishPlaying?.();
        }

        this._lastFrameTime = this._audioCtx.currentTime;
    }

    this._setPlayHeadPosition = function(pos){
        this._dom.playHead.style.left = "" + pos + "px";
        this._pos = pos;
    }

    this._getGridLength = function(){
        return this._dom.playHeadHolder.clientWidth;
    }

    this._getPlayingGridLength = function(){
        return this._getGridLength() * (this._getNumBeatsPlaying() / this._numBeats);
    }

    this._getBeatWidth = function(){
        return this._getGridLength() / this._numBeats;
    }

    this._getPxPerSecond = function(){
        const bps = this._bpm / 60;
        return bps * this._getBeatWidth() * 4;
    }

    this._getSecondsPerPx = function(){
        return 1 / this._getPxPerSecond();
    }

    this._getCurrentBeat = function(){
        return Math.floor(Math.round(this._pos) / this._getBeatWidth());
    }

    this._getNumBeatsPlaying = function(){
        return this._endBeat - this._startBeat;
    }
}