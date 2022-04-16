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
let isTrackPlaying = false;
const visibleNoteGroups = [];
let playedNotes = [];

function addNote() {
    let noteIndex = Math.floor(Math.random() * 7); // number 0 - 6
    note = notes[noteIndex];
    console.log(note.keys[0][0]);

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

let playing = false;

function playGame() {
    if(!playing) {
        addNote();
        playing = true;
        document.getElementById("add-note").innerHTML = "Reset";
    } else {
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

// Add a note to the staff from the notes array (if there are any left).
document.getElementById("add-note").addEventListener("click", (e) => {
    playGame();
});

function answerQuestion(button, octave) {
    if (visibleNoteGroups.length === 0) return;
    group = visibleNoteGroups.shift();
    note = playedNotes.shift();
    if(note.keys[0] == `${button}/${octave}`) {
        group.classList.add("correct");
        const transformMatrix = window.getComputedStyle(group).transform;
        const x = transformMatrix.split(",")[4].trim();
        group.style.transform = `translate(${x}px, -800px)`;
        document.getElementById("answer").classList.remove("answerHeader");
        document.getElementById("answer").innerHTML = `${button.toUpperCase()} is correct!`
    } else {
        group.classList.add("too-slow");
        document.getElementById("answer").classList.remove("answerHeader");
        document.getElementById("answer").innerHTML = `Almost!`
    }
    if(isTrackPlaying) curr_track.pause();
    addNote();
}

// If a user plays/identifies the note in time, send it up to note heaven.
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









