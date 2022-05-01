/** Represents a Contour Piano Roll */
const ContourPianoRoll = (function () {

var numRollSquares = 0;
const LOOK_AHEAD = .1;

// An array of all the possible melodic contours
var contours = [
    ["AAACKi", ['u', 'u', 'd', 'd']], 
    ["AAHyKC", ['s', 's', 's', 's']],
    ["AERGaC", ['u', 'u', 'u', 'u']],
    ["AA6KKC", ['u', 'u', 's', 's']],
]

// The random number generated for this game
var contourNum = Math.floor(Math.random() * contours.length);

/**
    Creates PianoRoll Object with a Contour Controller Object binded to it
    @param      { HTMLElement }         domParent           Where in HTML the roll will be created  
    @param      { sampler }             instrument          A sampler with the desired sounds
    @param      { int }                 length              Number of beats in roll
    @param      { AudioContext }        audioCtx            Audio Processing Graph
    @return     { pianoContourController } controller
    @return     { pianoRoll }           roll
*/
function createContourSampleRoll(domParent, instrument, length, audioCtx){
    const controls = createContourController(domParent);
    const pianoRoll = PianoRoll.createRoll(domParent, instrument, length, audioCtx);
    
    controls.bindToPianoRoll(pianoRoll);
    
    return {
        controller: controls,
        roll: pianoRoll
    }
}

/**
    Creates PianoRoll Object with a Contour Controller Object binded to it
    @param      { HTMLElement }             domParent           Where in HTML the roll will be created  
    @param      { sampler }                 instrument          A sampler with the desired sounds
    @param      { int }                     length              Number of beats in roll
    @param      { AudioContext }            audioCtx            Audio Processing Graph
    @return     { pianoContourController }  controller
    @return     { pianoContourGameRoll }    roll
*/
function createContourGameRoll(domParent, instrument, length, audioCtx) {
    const controls = createContourController(domParent);
    const pianoRoll = createContourGameRoll(domParent, instrument, length, audioCtx);

    controls.bindToPianoRoll(pianoRoll);

    return {
        controller: controls,
        roll: pianoRoll
    }
}

/**
    Creates the HTML of the controls, including binding event handlers for the buttons
    @param      { HTMLElement }                 domParent           Where in HTML the roll will be created  
    @return     { pianoContourController }      controlls
*/
function createContourController(domParent){
    var dom = {};

    const controls = document.createElement("div");
    controls.classList.add("pianoRollRow");
    controls.classList.add("pianoRollControls");
    domParent.appendChild(controls);

    var controller = new pianoContourController(dom);

    const listenBtn = createControllerButton("Listen", () => {
        controller.onClickListen();
    });

    controls.appendChild(listenBtn);

    const playBtn = createControllerButton("Play", () => {
        console.log("play")
        controller.onClickPlayButton();
    });

    controls.appendChild(playBtn);

    const submitBtn = createControllerButton("Submit", () => console.log("submit"));

    controls.appendChild(submitBtn);
    
    var bpmSlider = document.createElement("div");
    var slider = document.createElement("input");
    var text = document.createElement("div");
    
    slider.setAttribute("type", "range");

    var bpmBtn = createControllerButton("BPM", () =>{
        console.log("bpm");
        controller.onClickBPM();
    });

    text.innerText = slider.value;
    text.style.display = "inline";

    slider.onchange = function(){
        text.innerText = slider.value;
    }
    
    bpmSlider.appendChild(bpmBtn);
    bpmSlider.appendChild(slider);
    bpmSlider.appendChild(text);
    controls.appendChild(bpmSlider);
    
    dom.listenBtn = listenBtn;
    dom.playBtn = playBtn;
    dom.submitBtn = submitBtn;
    dom.bpmBtn = bpmBtn;
    dom.slider = slider;

    return controller;
} 

/**
    Piano Contour Controller Object
    @param      { any[] }       dom             array of HTML Elements  
    @return     { pianoContourController }      controls
*/
function pianoContourController(dom){
    this.pianoRoll;
    this._dom = dom;
    this.listens = 0;

    this.bindToPianoRoll = function(pianoRoll){
        this.pianoRoll = pianoRoll;
    }

    // Plays toggled beats
    this.onClickPlayButton = function(){
        if(this.pianoRoll === undefined){
            return;
        }

        if(this.pianoRoll.isPlaying()){
            this.pianoRoll.stop();
            this._dom.playBtn.innerText = "Play";
        }
        else{
            this.pianoRoll.play(70, true);
            this._dom.playBtn.innerText = "Stop";
        }
        this.onClickExport()
    }

    // Resets toggled beats
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

    // Adjusts BPM of playback
    this.onClickBPM = function(){
        var display = this._dom.slider.style.display
        if (display == "none") {
            this._dom.slider.style.display = "inline"
        } else {
            this._dom.slider.style.display = "none"
        }

    }

    // Logs current beat state to console as a Base64 string
    this.onClickExport = function(){
        const notes = this.pianoRoll.instrument.notes.length;
        const length = this.pianoRoll.length;
        const state = PianoRoll.boolArrayToBase64(this.pianoRoll.getBeatStates().getState());
        
        console.log(`beatFromEncodedState(${notes}, ${length}, \"${state}\")`);
    }

    // Saves current beat state to clipboard as a Base64 String
    this.onClickSave = function(){
        const beatState = this.pianoRoll.getBeatStates().getState();
        const encoded = boolArrayToBase64(beatState);
        navigator.clipboard.writeText(encoded);
    }

    // Loads beat state from clipboard
    this.onClickLoad = function(){
        const beatState = navigator.clipboard.readText().then(
            text => {
                const decoded = PianoRoll.base64ToBoolArray(text);

                const stateCopy = this.pianoRoll.getBeatStates();
                stateCopy.setState(decoded);

                this.pianoRoll.loadBeatStates(stateCopy);
        });
    }

    // Loads desired beat state and plays it
    this.onClickListen = function(){
        var text = contours[contourNum][0];
        const decoded = PianoRoll.base64ToBoolArray(text);

        console.log(decoded);

        const stateCopy = this.pianoRoll.getBeatStates();
        stateCopy.setState(decoded);

        // this.pianoRoll.loadBeatStates(stateCopy);

        this.pianoRoll.play(this._dom.slider.value, false);
    }
}

/**
    Helper function that returns a button for the piano roll controller
    @param      { string }              text        name of button
    @param      { any }                 onClick     event handler for button click
    @return     { HTMLButtonElement }   btn         button element
*/
function createControllerButton(text, onClick){
    const btn = document.createElement("button");
    btn.classList.add("pianoRollButton");
    btn.innerText = text;
    btn.onclick = onClick;

    return btn;
}

/**
    Creates the HTML of the piano roll, including the playhead
    @param      { HTMLElement }                 domParent           Where in HTML the roll will be created  
    @param      { sampler }                     instrument          A sampler with the desired sounds
    @param      { int }                         length              Number of beats in roll
    @param      { AudioContext }                audioCtx            Audio Processing Graph
    @return     { pianoCountourGameRoll }       roll
*/
function createContourGameRoll(domParent, instrument, length, audioCtx){
    var rollSquares = [];

    var dom = {};
    dom.squares = rollSquares;

    var roll = new pianoContourGameRoll(instrument, length, dom, audioCtx);

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

    // Create rows of piano roll, with a selected one at the center
    for (let i = 0; i < (roll.length*2 + 1) ; i++) {
        if (i == length) {
            var row = createPianoRollRow(roll, instrument, rollSquares, i);
        } else {
            var row = createBlankPianoRollRow(roll, instrument, rollSquares, i);
        }
        rollDom.appendChild(row);
    }

    var startIndex = roll.length*(roll.length*2 - 1);
    nextNotes(startIndex, roll);

    domParent.appendChild(rollHolder);

    return roll;
}

/**
    Creates center row of piano roll, with the first selected square
    @param      { pianoCountourGameRoll }       roll                Current piano roll  
    @param      { sampler }                     instrument          A sampler with the desired sounds
    @param      { Array }                       rollSquares         Array of squares HTML elements in roll
    @param      { int }                         row                 Row ID number
    @return     { HTMLElement }                 row
*/
function createPianoRollRow(roll, instrument, rollSquares, row) {
    var row = document.createElement("div");
    row.classList.add("contourRow");

    row.id = row;

    for(let j = 0; j < (roll.length*2 -1); j++){
        var square = document.createElement("div");
        if (j == 0) {
            square.classList.add("contourSelectedSquare");
        } else {
            square.classList.add("contourBlankSquare");
        }

        square.id = "pianoRollSquare_" + numRollSquares;
        square.value = numRollSquares;
        numRollSquares += 1;

        const s = new Square(roll, square, roll.numSquares);
        
        square.onclick = () => s.clickSquare();

        rollSquares.push(square);
        roll.squares.push(s);
        roll.numSquares += 1;

        row.appendChild(square);
    }

    return row;
}

/**
    Creates row of blank squares
    @param      { pianoCountourGameRoll }       roll                Current piano roll  
    @param      { sampler }                     instrument          A sampler with the desired sounds
    @param      { Array }                       rollSquares         Array of squares HTML elements in roll
    @param      { int }                         id                  Row ID number
    @return     { HTMLElement }                 row
*/
function createBlankPianoRollRow(roll, instrument, rollSquares, id) {
    var row = document.createElement("div");
    row.classList.add("pianoRollRow");
    row.id = id;

    for(let j = 0; j < (roll.length*2 -1); j++){
        var square = document.createElement("div");
        square.classList.add("contourBlankSquare");
        
        square.id = "pianoRollSquare_" + numRollSquares;
        square.value = numRollSquares;
        numRollSquares += 1;

        const s = new Square(roll, square, roll.numSquares);

        // square.onmouseenter = () => roll.hoverSquare(instrument.notes.length - 1 - id, j);
        square.onclick = () => s.clickSquare();
        
        rollSquares.push(square);
        roll.squares.push(s);
        roll.numSquares += 1;

        row.appendChild(square);
    }

    return row;
}

/**
    Handles input and game choices with html piano roll
    @param      { HTMLElement }                 domParent           Where in HTML the roll will be created  
    @param      { sampler }                     instrument          A sampler with the desired sounds
    @param      { int }                         length              Number of beats in roll
    @param      { AudioContext }                audioCtx            Audio Processing Graph
    @return     { pianoCountourGameRoll }       roll
*/
function pianoContourGameRoll(instrument, length, dom, audioCtx){
    this.instrument = instrument;
    this.audioCtx = audioCtx;
    this.length = length;
    this.isInteractionEnabled = true;

    this.squares = []
    this.numSquares = 0;
    this.choices = 0;

    this._dom = dom;
    this._beatStates = new PianoRoll.Beat(instrument.notes.length, length);
    this._isPlaying = false;
    this._playHeadAnimator = new PianoRoll.PlayHeadAnimator(dom, length, (i, time) => this.playBeat(i, time), audioCtx);
    this._playHeadAnimator.onFinishPlaying = () => this.resetPlayProgress();
    this._bpm = 70;

    this._beatListeners = []

    this.hoverSquare = function(noteIndex, beatIndex){
        var square = this._dom.squares[beatIndex + noteIndex * length];
        if(square.classList.contains("contourChoiceSquare")){
            console.log("yeehaw");
            // this.playBeat(beatIndex, 5);
            // this.clearSquareStyles(beatIndex, noteIndex);
            // this.toggleSquare(noteIndex, beatIndex);
        }
    }

    /**
     * Toggle the value of a specified beat
     * @param {Number} noteIndex - The index of the note
     * @param {Number} beatIndex - The index of the beat
     */
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

    /**
     * Get the value of a specified beat
     * @param {Number} noteIndex - The index of the note
     * @param {Number} beatIndex - The index of the beat
     * @returns {Boolean} - The value of the beat
     */
    this.isBeatToggled = function(beatIndex, noteIndex){
        return this._beatStates.isBeatToggled(beatIndex, noteIndex);
    };

    /**
     * Play the current input in the piano roll
     * @param {Number} bpm - The desired playback bpm
     * @param {Boolean} loop - Whether the playback should loop after playthrough
     * @param {Number} startBeat - The index of the beat to begin playback on (defaults to 0)
     * @param {Number} endBeat - The index of the beat to end playback on (defaults to the beat's length)
     */
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

    /**
     * Stop playback and reset the playhead to the beginning of the beat
     */
    this.resetPlayProgress = function(){
        this.stop();
        this._playHeadAnimator.reset();
    }

    /**
     * Stop playback
     */
    this.stop = function(){
        this._playHeadAnimator.stop();

        this._isPlaying = false;
    }

    /**
     * Toggle playback
     */
    this.togglePlay = function(){
        if(this._isPlaying){
            this.stop();
        }
        else{
            this.play(this._bpm, true);
        }
    }

    /**
     * Get the current playback state
     * @returns {Boolean} - Whether the beat is currently playing
     */
    this.isPlaying = function(){
        return this._isPlaying;
    }

    /**
     * Untoggle all beats
     */
    this.reset = function(){
        for(let i = 0; i < this._dom.squares.length; i++){
            this._dom.squares[i].classList.remove("pianoRollSquareHighlighted");
        }

        this._beatStates.setAll(false);

        this._playHeadAnimator.reset();
    };

    /**
     * Schedule the playing of a specific beat at an AudioContext time
     * @param {Number} beatIndex - The index of the beat to play
     * @param {Number} time - The AudioContext time to play the beat at
     */
    this.playBeat = function(beatIndex, time){
        if(time === undefined){
            time = this.audioCtx.currentTime;
        }

        for(let i = 0; i < this.instrument.notes.length; i++){
            if(this._beatStates.isBeatToggled(beatIndex, i)){
                this.instrument.playNote(this.instrument.notes.length - 1 - i, time, this.audioCtx);
            }
        }

        for(const listener of this._beatListeners){
            listener(beatIndex, time);
        }
    }

    /**
     * Add a listener to be notified when a beat is played
     * @param {Function} listener - A callback in the form of f(beatIndex, scheduledTime)
     */
    this.addBeatListener = function(listener){
        this._beatListeners.push(listener);
    }

    /**
     * Add a css class to a specific beat on the piano roll
     * @param {Number} beatIndex - The index of the beat
     * @param {Number} noteIndex - The index of the note
     * @param {String} styleClass - The class to be applied
     */
    this.addSquareStyle = function(beatIndex, noteIndex, styleClass){
        this._dom.squares[beatIndex + noteIndex * length].classList.add(styleClass);
    }

    /**
     * Remove a css class from a specific beat on the piano roll
     * @param {Number} beatIndex - The index of the beat
     * @param {Number} noteIndex - The index of the note
     * @param {String} styleClass - The class to be removed
     */
    this.removeSquareStyle = function(beatIndex, noteIndex, styleClass){
        this._dom.squares[beatIndex + noteIndex * length].classList.remove(styleClass);
    }

    /**
     * Remove all added css classes from a specific beat on the piano roll
     * @param {Number} beatIndex - The index of the beat
     * @param {Number} noteIndex - The index of the note
     */
    this.clearSquareStyles = function(beatIndex, noteIndex){
        this._dom.squares[beatIndex + noteIndex * length].className = "";

        this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquare");

        if(this._beatStates.isBeatToggled(beatIndex, noteIndex)){
            this._dom.squares[beatIndex + noteIndex * length].classList.add("pianoRollSquareHighlighted");
        }
    }

    /**
     * Remove all added css classes from all beats on the piano roll
     */
    this.clearAllSquareStyles = function(){
        for(let beatIndex = 0; beatIndex < this.length; beatIndex++){
            for(let noteIndex = 0; noteIndex < this.instrument.notes.length; noteIndex++){
                this.clearSquareStyles(beatIndex, noteIndex);
            }
        }
    }

    /**
     * Get a copy of the internal beat state
     * @returns {Beat} - The state of the piano roll beat
     */
    this.getBeatStates = function(){
        return this._beatStates.getCopy();
    }

    /**
     * Load a beat into the piano roll
     * @param {Beat} beatStates - The desired beat state
     */
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
}

/**
    Displays three choice nodes in the directions "up", "down", and "stay"
    @param      { int }                         startIndex          index of square you want to find neighnobors 
    @param      { pianoCountourGameRoll }       roll                The piano game roll with the given square
*/
function nextNotes(startIndex, roll) {
    var nextNotes = [
        startIndex - (roll.length*2-1) + 2, 
        startIndex+2, 
        startIndex + (roll.length*2-1) + 2
    ];
    for (let i = 0; i < nextNotes.length; i++) {
        const something2 = (element) => element.getAttribute('id') == ("pianoRollSquare_" + nextNotes[i]);
        roll.squares[nextNotes[i]].parent = startIndex;
        var x = roll._dom.squares.find(something2);
        x.classList.remove("contourBlankSquare");
        x.classList.add("contourChoiceSquare");
    }
}

/**
    The Square class serves to:
    1. Evaluate if the user choices are correct
    2. Generate the next choice nodes after a selection
*/
class Square {
    /**
     * 
     * @param {HTMLElement} dom - The square dom element
     * @param {pianoCountourGameRoll} roll - The piano roll which the square resides in
     * @param {int} id - Id of the square
     */
    constructor(roll, dom, id) {
        this.id = id;
        this.dom = dom;
        this.roll = roll;
        this.parent = 0;

        this.nextNotes = [
            id - (this.roll.length*2-1) + 2, 
            id+2, 
            id + (this.roll.length*2-1) + 2
        ];
        this.column = [
            id + (-2*(this.roll.length*2-1)), 
            id + (-1*(this.roll.length*2-1)), 
            id + (1*(this.roll.length*2-1)), 
            id + (2*(this.roll.length*2-1))
        ];
    }

    /**
     * Responds to the user clicking on a specific square
     */
    clickSquare = function(){
        var squareId = this.dom.id;
        console.log(squareId);
        const something = (element) => element.getAttribute('id') == (squareId);
        var square = this.roll._dom.squares.find(something);
        if(square.classList.contains("contourChoiceSquare")){
            // First check if this is the correct square
            var correctSquareNumber = this.parent;
            console.log(this.parent);
            console.log(contours[contourNum][1][this.roll.choices]);
            switch (contours[contourNum][1][this.roll.choices]){
                case 'u':
                    correctSquareNumber -= (this.roll.length*2 - 3);
                    break;
                case 'd':
                    correctSquareNumber += (this.roll.length*2 + 1);
                    break;
                default:
                    correctSquareNumber += 2;
                    break;
            }
            console.log(correctSquareNumber);
            if (correctSquareNumber == this.id) {
                this.roll.choices += 1;
                if (this.roll.choices >= 4) {
                    window.alert("you won!");
                } else {
                    for (let i = 0; i < this.nextNotes.length; i++) {
                        const something2 = (element) => element.getAttribute('id') == ("pianoRollSquare_" + this.nextNotes[i]);
                        this.roll.squares[this.nextNotes[i]].parent = this.id;
                        var x = this.roll._dom.squares.find(something2);
                        x.classList.remove("contourBlankSquare");
                        x.classList.add("contourChoiceSquare");
                    }
                }
                for (let i = 0; i < this.column.length; i++) {
                    const something2 = (element) => element.getAttribute('id') == ("pianoRollSquare_" + this.column[i]);
                    var x = this.roll._dom.squares.find(something2);
                    x.classList.remove("contourChoiceSquare");
                    x.classList.remove("contourWrongSquare");
                    x.classList.add("contourBlankSquare");
                } 
                square.classList.add("contourSelectedSquare");
            } else {
                square.classList.add("contourWrongSquare");
                square.classList.remove("contourChoiceSquare");
            } 
        }
    }
}

return{
    createContourSampleRoll: createContourSampleRoll,
    createContourGameRoll: createContourGameRoll,
}
})();