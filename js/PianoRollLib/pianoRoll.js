const PianoRoll = (function () {

var numRollSquares = 0;
const LOOK_AHEAD = .1;

/**
 * Create a piano roll with a linked set of control buttons
 * @param {HTMLElement} domParent - The desired parent of the piano roll and controls
 * @param {Instrument} instrument - The instrument to be sequenced with the piano roll
 * @param {Number} length - The length of the piano roll in 16th notes
 * @param {AudioContext} audioCtx - The AudioContext to be used for piano roll playback
 * @returns References to both the piano roll and controller
 */
function createRollWithController(domParent, instrument, length, audioCtx){
    const controls = createRollController(domParent);
    const pianoRoll = createRoll(domParent, instrument, length, audioCtx);

    controls.bindToPianoRoll(pianoRoll);

    return {
        controller: controls,
        roll: pianoRoll
    }
}

/**
 * Create a piano roll
 * @param {HTMLElement} domParent - The desired parent of the piano roll and controls
 * @param {Instrument} instrument - The instrument to be sequenced with the piano roll
 * @param {Number} length - The length of the piano roll in 16th notes
 * @param {AudioContext} audioCtx - The AudioContext to be used for piano roll playback
 * @returns The created piano roll object
 */
function createRoll(domParent, instrument, length, audioCtx){
    var rollSquares = [];

    var dom = {};
    dom.squares = rollSquares;

    var roll = new PianoRoll(instrument, length, dom, audioCtx);

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
        rowLabel.onclick = () => instrument.playNote(i, audioCtx.currentTime, audioCtx);

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

/**
 * Create a piano roll controller to be later linked to a piano roll
 * @param {HTMLElement} domParent - The desired parent of the controls
 * @returns The created piano roll controls
 */
function createRollController(domParent){
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

    return new PianoRollController(dom);
} 

/**
 * Class routing user interactions with the piano roll controller dom elements to the piano roll
 */
class PianoRollController {
    /**
     * 
     * @param dom References to the piano roll controller's dom elements (created by createRollController)
     */
    constructor(dom) {
        this.pianoRoll;
        this._dom = dom;

        dom.playButton.onclick = () => this.onClickPlayButtom();
        dom.resetButton.onclick = () => this.onClickReset();
        dom.exportButton.onclick = () => this.onClickExport();
        dom.saveButton.onclick = () => this.onClickSave();
        dom.loadButton.onclick = () => this.onClickLoad();
    }

    /**
     * Bind the controller to a piano roll instance
     * @param {PianoRoll} pianoRoll - The piano roll to route input to
     */
    bindToPianoRoll(pianoRoll) {
        this.pianoRoll = pianoRoll;
    }

    onClickPlayButtom() {
        if (this.pianoRoll === undefined) {
            return;
        }

        if (this.pianoRoll.isPlaying()) {
            this.pianoRoll.stop();
            this._dom.playButton.innerText = "Play";
        }
        else {
            this.pianoRoll.play(70, true);
            this._dom.playButton.innerText = "Stop";
        }
    }

    onClickReset() {
        if (this.pianoRoll === undefined) {
            return;
        }

        if (this.pianoRoll.isPlaying()) {
            this.pianoRoll.stop();
        }

        this.pianoRoll.reset();
        this._dom.playButton.innerText = "Play";
    }

    onClickExport() {
        const notes = this.pianoRoll.instrument.notes.length;
        const length = this.pianoRoll.length;
        const state = boolArrayToBase64(this.pianoRoll.getBeatStates().getState());

        console.log(`beatFromEncodedState(${notes}, ${length}, \"${state}\")`);
    }

    onClickSave() {
        const beatState = this.pianoRoll.getBeatStates().getState();
        const encoded = boolArrayToBase64(beatState);
        navigator.clipboard.writeText(encoded);
    }

    onClickLoad() {
        const beatState = navigator.clipboard.readText().then(
            text => {
                const decoded = base64ToBoolArray(text);

                const stateCopy = this.pianoRoll.getBeatStates();
                stateCopy.setState(decoded);

                this.pianoRoll.loadBeatStates(stateCopy);
            });
    }
}

/**
 * An object representing a sequenced beat
 */
class Beat {
    /**
     * 
     * @param {Number} numNotes - The number of distinct notes or elements usable in the beat
     * @param {Number} length - The length of the beat in 16th notes
     */
    constructor(numNotes, length) {
        this.numNotes = numNotes;
        this.length = length;

        this._state = new Array(numNotes * length).fill(false);
    }

    /**
     *
     * @param {Number} beatIndex - The index of the 16th note
     * @param {Number} noteIndex - The index of the note or element
     * @returns {Boolean} Whether the note on the specified beat is toggled
     */
    isBeatToggled(beatIndex, noteIndex) {
        return this._state[beatIndex + noteIndex * this.length];
    }

    /**
     * Set the value of a specified beat
     * @param {Number} beatIndex - The index of the 16th note
     * @param {Number} noteIndex - The index of the note or element
     * @param {Boolean} value - The desired value of the specified beat
     */
    setBeat(beatIndex, noteIndex, value) {
        this._state[beatIndex + noteIndex * this.length] = value;
    }

    /**
     * Create a copy of the beat, used to avoid exposing internal state by reference
     * @returns {Beat} - A new beat object containing the same values
     */
    getCopy() {
        let copy = new Beat(this.numNotes, this.length);
        copy._state = Array.from(this._state);

        return copy;
    }

    /**
     * Return the length of the beat
     * @returns {Number} The length of the beat in 16th notes
     */
    getLength() {
        return this.length;
    }

    /**
     * Set the value of all beat states, often used to clear the current state
     * @param {Boolean} value - The desired value of all beats
     */
    setAll(value) {
        this._state.fill(value);
    }

    /**
     * Get a copy of the internal beat state, useful for serialization
     * @returns {Array<Boolean>} - The internal state of the beat
     */
    getState() {
        return Array.from(this._state);
    }

    /**
     * Set the internal beat state, useful when deserializing
     * @param {Array<Boolean>} state - The desired internal state of the beat
     */
    setState(state) {
        this._state = Array.from(state);
    }
}


/**
 * Create a beat object from a base64 encoded state
 * @param {Number} numNotes - The number of notes used by the instrument
 * @param {Number} length - The number of 16th notes in the beat
 * @param {String} state - The encoded state of the beat
 * @returns - A beat object from the provided state
 */
function beatFromEncodedState(numNotes, length, state){
    const newBeat = new Beat(numNotes, length);
    const decoded = base64ToBoolArray(state);

    newBeat.setState(decoded);

    return newBeat;
}

// Base64 encoding and decoding from https://stackoverflow.com/a/67039932/10184960

/**
 * Convert an array of booleans to a base64 string
 * @param {Array<Boolean>} arr - An array of booleans
 * @returns {String} - The boolean array encoded to base64
 */
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


/**
 * Convert a base64 string to an array of booleans
 * @param {String} string 
 * @returns {Array<Boolean>} - The decoded boolean array
 */
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
 * Render a beat and instrument to an audio buffer
 * @param {Beat} beat - The beat to render
 * @param {Instrument} instrument - The instrument to be played by the beat
 * @param {Number} bpm - The desired bpm of the rendered beat
 * @returns {Promise<AudioBuffer>} - a promise of an audio buffer containing the rendered beat
 */
function renderBeat(beat, instrument, bpm){
    const beatLength = 60 / bpm / 4;
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(1, beat.getLength() * beatLength * sampleRate, sampleRate);

    for(let beatIndex = 0; beatIndex < beat.getLength(); beatIndex++){
        for(let i = 0; i < instrument.notes.length; i++){
            if(beat.isBeatToggled(beatIndex, i)){
                instrument.playNote(instrument.notes.length - 1 - i, beatIndex * beatLength, offlineCtx);
            }
        }
    }

    return new Promise(resolve => { 
        offlineCtx.oncomplete = function(e) {
            resolve(e.renderedBuffer);
        }
    
        offlineCtx.startRendering();
    });
}

/**
 * Handles input and playback with html piano roll
 */
class PianoRoll {
    /**
     * 
     * @param {Instrument} instrument - The instrument to be played via the piano roll
     * @param {Number} length - The length of the piano roll in 16th notes
     * @param {*} dom - The dom elements of the piano roll
     * @param {AudioContext} audioCtx 
     */
    constructor(instrument, length, dom, audioCtx) {
        this.instrument = instrument;
        this.audioCtx = audioCtx;
        this.length = length;
        this.isInteractionEnabled = true;

        this._dom = dom;
        this._beatStates = new Beat(instrument.notes.length, length);
        this._isPlaying = false;
        this._playHeadAnimator = new PlayHeadAnimator(dom, length, (i, time) => this.playBeat(i, time), audioCtx);
        this._playHeadAnimator.onFinishPlaying = () => this.resetPlayProgress();
        this._bpm = 70;

        this._beatListeners = [];
    }

    /**
     * Responds to the user clicking on a specific beat
     * @param {Number} noteIndex - The index of the note clicked
     * @param {Number} beatIndex - The index of the beat clicked
     */
    clickSquare(noteIndex, beatIndex) {
        if (this.isInteractionEnabled) {
            this.clearSquareStyles(beatIndex, noteIndex);
            this.toggleSquare(noteIndex, beatIndex);
        }
    }

    /**
     * Toggle the value of a specified beat
     * @param {Number} noteIndex - The index of the note
     * @param {Number} beatIndex - The index of the beat
     */
    toggleSquare(noteIndex, beatIndex) {
        let isToggled = this._beatStates.isBeatToggled(beatIndex, noteIndex);

        if (isToggled) {
            this._dom.squares[beatIndex + noteIndex * this.length].classList.remove("pianoRollSquareHighlighted");
        }
        else {
            this._dom.squares[beatIndex + noteIndex * this.length].classList.add("pianoRollSquareHighlighted");
        }

        this._beatStates.setBeat(beatIndex, noteIndex, !isToggled);
    }

    /**
     * Get the value of a specified beat
     * @param {Number} noteIndex - The index of the note
     * @param {Number} beatIndex - The index of the beat
     * @returns {Boolean} - The value of the beat
     */
    isBeatToggled(beatIndex, noteIndex) {
        return this._beatStates.isBeatToggled(beatIndex, noteIndex);
    }

    /**
     * Play the current input in the piano roll
     * @param {Number} bpm - The desired playback bpm
     * @param {Boolean} loop - Whether the playback should loop after playthrough
     * @param {Number} startBeat - The index of the beat to begin playback on (defaults to 0)
     * @param {Number} endBeat - The index of the beat to end playback on (defaults to the beat's length)
     */
    play(bpm, loop, startBeat, endBeat) {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().then(() => this.play(bpm, loop, startBeat, endBeat));
            return;
        }

        if (startBeat === undefined) {
            startBeat = 0;
        }

        if (endBeat === undefined) {
            endBeat = this.length;
        }

        this._playHeadAnimator.play(bpm, loop, startBeat, endBeat);

        this._isPlaying = true;
    }

    /**
     * Stop playback and reset the playhead to the beginning of the beat
     */
    resetPlayProgress() {
        this.stop();
        this._playHeadAnimator.reset();
    }

    /**
     * Stop playback
     */
    stop() {
        this._playHeadAnimator.stop();

        this._isPlaying = false;
    }

    /**
     * Toggle playback
     */
    togglePlay() {
        if (this._isPlaying) {
            this.stop();
        }
        else {
            this.play(this._bpm, true);
        }
    }

    /**
     * Get the current playback state
     * @returns {Boolean} - Whether the beat is currently playing
     */
    isPlaying() {
        return this._isPlaying;
    }

    /**
     * Untoggle all beats
     */
    reset() {
        for (let i = 0; i < this._dom.squares.length; i++) {
            this._dom.squares[i].classList.remove("pianoRollSquareHighlighted");
        }

        this._beatStates.setAll(false);

        this._playHeadAnimator.reset();
    }

    /**
     * Schedule the playing of a specific beat at an AudioContext time
     * @param {Number} beatIndex - The index of the beat to play
     * @param {Number} time - The AudioContext time to play the beat at
     */
    playBeat(beatIndex, time) {
        if (time === undefined) {
            time = this.audioCtx.currentTime;
        }

        for (let i = 0; i < this.instrument.notes.length; i++) {
            if (this._beatStates.isBeatToggled(beatIndex, i)) {
                this.instrument.playNote(this.instrument.notes.length - 1 - i, time, this.audioCtx);
            }
        }

        for (const listener of this._beatListeners) {
            listener(beatIndex, time);
        }
    }

    /**
     * Add a listener to be notified when a beat is played
     * @param {Function} listener - A callback in the form of f(beatIndex, scheduledTime)
     */
    addBeatListener(listener) {
        this._beatListeners.push(listener);
    }

    /**
     * Add a css class to a specific beat on the piano roll
     * @param {Number} beatIndex - The index of the beat
     * @param {Number} noteIndex - The index of the note
     * @param {String} styleClass - The class to be applied
     */
    addSquareStyle(beatIndex, noteIndex, styleClass) {
        this._dom.squares[beatIndex + noteIndex * this.length].classList.add(styleClass);
    }

    /**
     * Remove a css class from a specific beat on the piano roll
     * @param {Number} beatIndex - The index of the beat
     * @param {Number} noteIndex - The index of the note
     * @param {String} styleClass - The class to be removed
     */
    removeSquareStyle(beatIndex, noteIndex, styleClass) {
        this._dom.squares[beatIndex + noteIndex * this.length].classList.remove(styleClass);
    }

    /**
     * Remove all added css classes from a specific beat on the piano roll
     * @param {Number} beatIndex - The index of the beat
     * @param {Number} noteIndex - The index of the note
     */
    clearSquareStyles(beatIndex, noteIndex) {
        this._dom.squares[beatIndex + noteIndex * this.length].className = "";

        this._dom.squares[beatIndex + noteIndex * this.length].classList.add("pianoRollSquare");

        if (this._beatStates.isBeatToggled(beatIndex, noteIndex)) {
            this._dom.squares[beatIndex + noteIndex * this. length].classList.add("pianoRollSquareHighlighted");
        }
    }

    /**
     * Remove all added css classes from all beats on the piano roll
     */
    clearAllSquareStyles() {
        for (let beatIndex = 0; beatIndex < this.length; beatIndex++) {
            for (let noteIndex = 0; noteIndex < this.instrument.notes.length; noteIndex++) {
                this.clearSquareStyles(beatIndex, noteIndex);
            }
        }
    }

    /**
     * Get a copy of the internal beat state
     * @returns {Beat} - The state of the piano roll beat
     */
    getBeatStates() {
        return this._beatStates.getCopy();
    }

    /**
     * Load a beat into the piano roll
     * @param {Beat} beatStates - The desired beat state
     */
    loadBeatStates(beatStates) {
        this._beatStates = beatStates;

        for (let beatIndex = 0; beatIndex < this.length; beatIndex++) {
            for (let noteIndex = 0; noteIndex < this.instrument.notes.length; noteIndex++) {
                let isToggled = this._beatStates.isBeatToggled(beatIndex, noteIndex);

                if (isToggled) {
                    this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
                }
                else {
                    this._dom.squares[beatIndex + noteIndex * length].classList.remove("pianoRollSquareHighlighted");
                }
            }
        }
    }
}


/**
    The playHeadAnimator serves two purposes:
    1. Animating the UI playhead to show the user where in the beat is being played
    2. Trigger the beat play callback to play beats in time (using a lookahead)
*/
class PlayHeadAnimator {
    /**
     * 
     * @param {HTMLElement} dom - The playhead dom element
     * @param {Number} numBeats - The number of 16th notes in the beat
     * @param {Function} beatCallback - A callback to schedule the playback of a specific beat
     * @param {AudioContext} audioCtx - The AudioContext used for beat playback
     */
    constructor(dom, numBeats, beatCallback, audioCtx) {
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
    }

    /**
     * Start beat playback
     * @param {Number} bpm - The desired bpm of playback
     * @param {Boolean} loop - Whether playback should loop upon completion
     * @param {Number} startBeat - The index of the beat to start playback on (defaults to 0)
     * @param {Number} endBeat - The index of the beat to end playback on (defaults to beat length)
     */
    play(bpm, loop, startBeat, endBeat) {
        if (this._isPlaying) {
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
        this._nextNoteTime = this._audioCtx.currentTime + (extraPx == 0 ? 0 : remainingPx * this._getSecondsPerPx());

        this._startPos = this._pos;
        this._startTime = performance.now();

        this._setPlayHeadPosition(this._pos);

        this._animationId = window.requestAnimationFrame((t) => this._update(t));
        this._isPlaying = true;
    };

    /**
     * Stop playback
     */
    stop() {
        window.cancelAnimationFrame(this._animationId);
        this._isPlaying = false;
    };

    /**
     * Stop playback and reset progress
     */
    reset() {
        window.cancelAnimationFrame(this._animationId);

        this._setPlayHeadPosition(0);

        this._isPlaying = false;
    };

    _update(timestamp) {

        if (!this._isPlaying) {
            return;
        }

        if (this._startTime > performance.now()) {
            return;
        }

        const elapsedTime = performance.now() - this._startTime;

        this._pos = (this._startPos + elapsedTime / 1000 * this._getPxPerSecond());
        if (this._isLooping) {
            const playingGridLengthDebug = this._getPlayingGridLength();
            this._pos = this._pos % this._getPlayingGridLength();
        }

        while (this._nextNoteTime < this._audioCtx.currentTime + LOOK_AHEAD) {
            this._beatCallback(this._nextUnplayedNote, this._nextNoteTime);
            this._nextNoteTime += (60 / this._bpm) / 4;

            if (this._nextUnplayedNote + 1 >= this._getNumBeatsPlaying() && !this._isLooping) {
                break;
            }

            this._nextUnplayedNote = (this._nextUnplayedNote + 1) % this._getNumBeatsPlaying();
        }

        const x = this._pos;

        this._setPlayHeadPosition(x);

        this._animationId = window.requestAnimationFrame((t) => this._update(t));

        if (this._pos >= this._getPlayingGridLength() && !this._isLooping) {
            this.stop();
            this.onFinishPlaying?.();
        }

        this._lastFrameTime = this._audioCtx.currentTime;
    };

    _setPlayHeadPosition(pos) {
        this._dom.playHead.style.left = "" + pos + "px";
        this._pos = pos;
    };

    _getGridLength() {
        return this._dom.playHeadHolder.clientWidth;
    };

    _getPlayingGridLength() {
        return this._getGridLength() * (this._getNumBeatsPlaying() / this._numBeats);
    };

    _getBeatWidth() {
        return this._getGridLength() / this._numBeats;
    };

    _getPxPerSecond() {
        const bps = this._bpm / 60;
        return bps * this._getBeatWidth() * 4;
    };

    _getSecondsPerPx() {
        return 1 / this._getPxPerSecond();
    };

    _getCurrentBeat() {
        return Math.floor(Math.round(this._pos) / this._getBeatWidth());
    };

    _getNumBeatsPlaying() {
        return this._endBeat - this._startBeat;
    };
}


return{
    createRollWithController: createRollWithController,
    createRoll: createRoll,
    createRollController: createRollController,
    beatFromEncodedState: beatFromEncodedState,
    renderBeat: renderBeat,
    Beat: Beat,
    PlayHeadAnimator: PlayHeadAnimator,
    base64ToBoolArray: base64ToBoolArray,
    boolArrayToBase64: boolArrayToBase64
}
})();