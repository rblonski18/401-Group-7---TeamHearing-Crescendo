// Basic boilerplate for using VexFlow with the SVG rendering context:
const { Renderer, TickContext, Stave, StaveNote, Accidental } = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
const div = document.getElementById("output");
const renderer = new Renderer(div, Renderer.Backends.SVG);

// Configure the rendering context.
renderer.resize(500, 300);
const context = renderer.getContext();

const tickContext = new TickContext();

// Create a stave of width 10000 at position 10, 40 on the canvas.
const stave = new Stave(10, 10, 10000).addClef("treble");

// Connect it to the rendering context and draw!
stave.setContext(context).draw();

const durations = ["8", "4", "2", "1"];

const notes = [
    ["c", "#", "4"],
    ["e", "b", "5"],
    ["g", "", "5"],
    ["d", "b", "4"],
    ["b", "bb", "3"],
    ["a", "b", "4"],
    ["f", "b", "5"],
].map(([letter, accidental, octave]) => {
    const note = new StaveNote({
        clef: "treble",
        keys: [`${letter}${accidental}/${octave}`],
        duration: durations[Math.floor(Math.random() * durations.length)],
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

const visibleNoteGroups = [];

// Add a note to the staff from the notes array (if there are any left).
document.getElementById("add-note").addEventListener("click", (e) => {
    note = notes.shift();
    if (!note) {
        console.log("DONE!");
        return;
    }
    const group = context.openGroup();
    visibleNoteGroups.push(group);
    note.draw();
    context.closeGroup();
    group.classList.add("scroll");

    // Force a DOM-refresh by asking for the group's bounding box. Why? Most
    // modern browsers are smart enough to realize that adding .scroll class
    // hasn't changed anything about the rendering, so they wait to apply it
    // at the next dom refresh, when they can apply any other changes at the
    // same time for optimization. However, if we allow that to happen,
    // then sometimes the note will immediately jump to its fully transformed
    // position -- because the transform will be applied before the class with
    // its transition rule.
    const box = group.getBoundingClientRect();
    group.classList.add("scrolling");

    // If a user doesn't answer in time, make the note fall below the staff.
    window.setTimeout(() => {
        const index = visibleNoteGroups.indexOf(group);
        if (index === -1) return;
        group.classList.add("too-slow");
        visibleNoteGroups.shift();
    }, 5000);
});

// If a user plays/identifies the note in time, send it up to note heaven.
document.getElementById("right-answer").addEventListener("click", (e) => {
    if (visibleNoteGroups.length === 0) return;
    group = visibleNoteGroups.shift();
    group.classList.add("correct");

    // Coding challenge! Try adding a sound effect here (see: Tone.js).

    // The note will be somewhere in the middle of its move to the left -- by
    // getting its computed style we find its x-position, freeze it there, and
    // then send it straight up to note heaven with no horizontal motion.
    const transformMatrix = window.getComputedStyle(group).transform;
    // transformMatrix will be something like 'matrix(1, 0, 0, 1, -118, 0)'
    // where, since we're only translating in x, the 4th property will be
    // the current x-translation. You can dive into the gory details of
    // CSS3 transform matrices (along with matrix multiplication) if you want
    // at http://www.useragentman.com/blog/2011/01/07/css3-matrix-transform-for-the-mathematically-challenged/
    const x = transformMatrix.split(",")[4].trim();
    // And, finally, we set the note's style.transform property to send it skyward.
    group.style.transform = `translate(${x}px, -800px)`;
});


