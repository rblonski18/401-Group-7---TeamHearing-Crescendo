var numRollSquares = 0;
const LOOK_AHEAD = .1;

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

            square.onclick = () => roll.toggleSquare(instrument.notes.length - 1 - i, j);

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
}

function pianoRoll(instrument, length, dom, audioCtx){
    this.instrument = instrument;
    this.audioCtx = audioCtx;

    this._dom = dom;
    this._beatStates = new Array(dom.squares.length).fill(false);
    this._isPlaying = false;
    this._playHeadAnimator = new playHeadAnimator(dom, length, (i, time) => this.playBeat(i, time), audioCtx);
    this._bpm = 70;

    this._beatListeners = []

    this.toggleSquare = function(noteIndex, beatIndex){
        let isToggled = this._beatStates[beatIndex + noteIndex * length];

        if(isToggled){
            this._dom.squares[beatIndex + noteIndex * length].classList.remove("pianoRollSquareHighlighted");
        }
        else {
            this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
        }

        this._beatStates[beatIndex + noteIndex * length] = !isToggled;
    };

    this.isBeatToggled = function(noteIndex, beatIndex){
        return this._beatStates[beatIndex + noteIndex * length];
    };

    this.play = function(bpm, loop){
        if(this.audioCtx.state === 'suspended'){
            this.audioCtx.resume().then(()=>this.play(bpm, loop));
            return;
        }

        this._playHeadAnimator.play(bpm, loop);

        this._isPlaying = true;
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
        for(let i = 0; i < this._beatStates.length; i++){
            this._beatStates[i] = false;
            this._dom.squares[i].classList.remove("pianoRollSquareHighlighted");
        }

        this._playHeadAnimator.reset();
    };

    this.playBeat = function(beatIndex, time){
        for(let i = 0; i < this.instrument.notes.length; i++){
            if(this._beatStates[beatIndex + i * length]){
                this.instrument.playNote(this.instrument.notes.length - 1 - i, time);
            }
        }

        for(const listener of this._beatListeners){
            listener.onPlayBeat(beatIndex, time)
        }
    }

    this.addBeatListener = function(listener){
        this._beatListeners.push(listener);
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

    this.play = function(bpm, loop){
        if(this._isPlaying){
            this.reset();
        }

        this._bpm = bpm;
        this._isLooping = loop;

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
            this._pos = this._pos % this._getGridLength();
        }


        const currentTimeDebug = this._audioCtx.currentTime;

        while(this._nextNoteTime < this._audioCtx.currentTime + LOOK_AHEAD){
            beatCallback(this._nextUnplayedNote, this._nextNoteTime);
            this._nextNoteTime += (60 / this._bpm) / 4;
            this._nextUnplayedNote = (this._nextUnplayedNote + 1) % this._numBeats;
        }

        const x = this._pos;

        this._setPlayHeadPosition(x);

        this._animationId = window.requestAnimationFrame((t) => this._update(t));

        if(this._pos >= this._getGridLength() && !this._isLooping){
            this.stop();
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
}