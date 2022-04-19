// Basic boilerplate for using VexFlow with the SVG rendering context:
const { Renderer, TickContext, Stave, StaveNote, Accidental } = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
const div = document.getElementById("output");
const renderer = new Renderer(div, Renderer.Backends.SVG);

let curr_track = document.createElement('audio');

// Configure the rendering context.
renderer.resize(500, 300);
const context = renderer.getContext();

const tickContext = new TickContext();

// Create a stave of width 10000 at position 10, 40 on the canvas.
const stave = new Stave(10, 10, 10000).addClef("treble");

// Connect it to the rendering context and draw!
stave.setContext(context).draw();

/*
 * Variables holding the number of notes guessed right, and number of total guesses. 
 */
let right = 0;
let total = 0;

/*
 * I add the possible note guesses to a list that I can randomly pull from. They are in the format:
 * [{note}, {accidental}, {octave}]. All are quarter notes. To change, change duration value. 
 * They are then added to the tickContext. 
 */
const notes = [
    ["a", "", "4"],
    ["b", "", "4"],
    ["c", "", "5"],
    ["d", "", "5"],
    ["e", "", "4"],
    ["f", "", "4"],
    ["g", "", "4"],
].map(([letter, accidental, octave]) => {
    const note = new StaveNote({
        clef: "treble",
        keys: [`${letter}${accidental}/${octave}`],
        duration: 4,
    });
    note.setContext(context).setStave(stave);

    // If a StaveNote has an accidental, we must render it manually.
    // This is so that you get full control over whether to render
    // an accidental depending on the musical context. Here, if we
    // have one, we want to render it. (Theoretically, we might
    // add logic to render a natural sign if we had the same letter
    // name previously with an accidental. Or, perhaps every twelfth
    // note or so we might render a natural sign randomly, just to be
    // sure our user who's learning to read accidentals learns
    // what the natural symbol means.)
    if (accidental) {
        note.addModifier(new Accidental(accidental));
    }
    tickContext.addTickable(note);
    return note;
});

tickContext.preFormat().setX(400)
/* 
 * Variable to hold whether track is playing. 
 */
let isTrackPlaying = false;
/* 
 * Variable to holding played notes (as svg objects)
 */
const visibleNoteGroups = [];
/* 
 * Variable to holding played notes (as VF.StaveNote objects)
 */
let playedNotes = [];

/* 
 * This function selects a note at random and displays it to screen, 
 * also playing the associated audio file. 
 * Adds scroll and scrolling classes to make note move to the left across the screen. 
 */
function addNote() {
    total += 1;
    let noteIndex = Math.floor(Math.random() * 7); // number 0 - 6
    note = notes[noteIndex];

    if(isTrackPlaying) curr_track.pause();

    if(note.keys[0][0] == 'a') {
        curr_track.src = 'A.mp3';
    } else if(note.keys[0][0] == 'b') {
        curr_track.src = 'B.mp3';
    }  else if(note.keys[0][0] == 'c') {
        curr_track.src = 'C.mp3';
    } else if(note.keys[0][0] == 'd') {
        curr_track.src = 'D.mp3';
    } else if(note.keys[0][0] == 'e') {
        curr_track.src = 'E.mp3';
    } else if(note.keys[0][0] == 'f') {
        curr_track.src = 'F.mp3';
    } else if(note.keys[0][0] == 'g') {
        curr_track.src = 'G.mp3';
    }
    curr_track.load();
    const group = context.openGroup();
    visibleNoteGroups.push(group);
    note.draw();
    curr_track.play();
    isTrackPlaying = true;
    playedNotes.push(note);
    context.closeGroup();
    group.classList.add("scroll");
    const box = group.getBoundingClientRect();
    group.classList.add("scrolling");
}

/* 
 * Variable to determine whether the user is playing the game or it is stopped. 
 * I add the "answerHeader" class when resetting because it clears the label above
 * the stave that displays assessment measures and tells you if you got it right. 
 */
let playing = false;

function playGame() {
    if(!playing) {
        addNote();
        playing = true;
        document.getElementById("add-note").innerHTML = "Reset";
    } else {
        total = 0;
        right = 0;
        document.getElementById("answer").classList.add("answerHeader");
        isTrackPlaying = false;
        curr_track.pause();
        if (visibleNoteGroups.length === 0) return;
        group = visibleNoteGroups.shift();
        group.classList.add("too-slow");
        playing = false;
        document.getElementById("add-note").innerHTML = "Play"
        playedNotes = [];
    }
}

// Play game. 
document.getElementById("add-note").addEventListener("click", (e) => {
    playGame();
});

/* 
 * Function determins whether user answered question correctly or not. 
 * If correct, display that their answer was correct and assessment measures. 
 * If not, just say 'Almost' and still display assessment measures. 
 * @param {string} button - The note on the button that the user pressed. 
 * @param {string} octave - The octave that the note would be in. 
 */
function answerQuestion(button, octave) {
    if (visibleNoteGroups.length === 0) return;
    group = visibleNoteGroups.shift();
    note = playedNotes.shift();
    if(note.keys[0] == `${button}/${octave}`) {
        right += 1
        group.classList.add("correct");
        const transformMatrix = window.getComputedStyle(group).transform;
        const x = transformMatrix.split(",")[4].trim();
        group.style.transform = `translate(${x}px, -800px)`;
        document.getElementById("answer").classList.remove("answerHeader");
        let percent = Math.round((right / total) * 100);
        document.getElementById("answer").innerHTML = `${button.toUpperCase()} is correct! - ${right}/${total} - ${percent}%`
    } else {
        group.classList.add("too-slow");
        document.getElementById("answer").classList.remove("answerHeader");
        let percent = 0;
        if(right != 0) percent = Math.round((right / total) * 100);
        document.getElementById("answer").innerHTML = `Almost! - ${right}/${total} - ${percent}%`
    }
    if(isTrackPlaying) curr_track.pause();
    addNote();
}

/*
 * Event listeners for buttons. 
 */
document.getElementById("a-button").addEventListener("click", (e) => {
    answerQuestion("a", "4")
});
document.getElementById("b-button").addEventListener("click", (e) => {
    answerQuestion("b", "4")
});
document.getElementById("c-button").addEventListener("click", (e) => {
    answerQuestion("c", "5")
});
document.getElementById("d-button").addEventListener("click", (e) => {
    answerQuestion("d", "5")
});
document.getElementById("e-button").addEventListener("click", (e) => {
    answerQuestion("e", '4')
});
document.getElementById("f-button").addEventListener("click", (e) => {
    answerQuestion("f", "4")
});
document.getElementById("g-button").addEventListener("click", (e) => {
    answerQuestion("g", "4")
});









