// Basic setup boilerplate for using VexFlow with the SVG rendering context:
VF = Vex.Flow;
var toggleVisibility = true;

// Create an SVG renderer and attach it to the DIV element named "boo".
var div = document.getElementById("boo")
var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

// Configure the rendering context.
renderer.resize(500, 500);
var context = renderer.getContext();

// A tickContext is required to draw anything that would be placed
// in relation to time/rhythm, including StaveNote which we use here.
// In real music, this allows VexFlow to align notes from multiple
// voices with different rhythms horizontally. Here, it doesn't do much
// for us, since we'll be animating the horizontal placement of notes, 
// but we still need to add our notes to a tickContext so that they get
// an x value and can be rendered.
//
// If we create a voice, it will automatically apply a tickContext to our
// notes, and space them relative to each other based on their duration &
// the space available. We definitely do not want that here! So, instead
// of creating a voice, we handle that part of the drawing manually.
var tickContext = new VF.TickContext();
tickContext.preFormat().setX(400);
// Create a stave of width 10000 at position 10, 40 on the canvas.
var stave = new VF.Stave(10, 10, 10000)
.addClef('treble')
.addTimeSignature("4/4");

// Connect it to the rendering context and draw!
stave.setContext(context).draw();

var durations = ['8', '4', '2', '1'];

var notes = [
	['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['b', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['d', '', '4', '2'],
].map(([letter, acc, octave, length]) => {
	const note = new VF.StaveNote({
    clef: 'treble',
    keys: [`${letter}${acc}/${octave}`],
    duration: length,
  })
  .setContext(context)
  .setStave(stave);
  // If a StaveNote has an accidental, we must render it manually.
  // This is so that you get full control over whether to render
  // an accidental depending on the musical context. Here, if we
  // have one, we want to render it. (Theoretically, we might
  // add logic to render a natural sign if we had the same letter
  // name previously with an accidental. Or, perhaps every twelfth
  // note or so we might render a natural sign randomly, just to be
  // sure our user who's learning to read accidentals learns
  // what the natural symbol means.)
  if(acc) note.addAccidental(0, new VF.Accidental(acc));
	tickContext.addTickable(note)
	return note;
}); 


// The tickContext.preFormat() call assigns x-values (and other
// formatting values) to notes. It must be called after we've 
// created the notes and added them to the tickContext. Or, it
// can be called each time a note is added, if the number of 
// notes needed is not known at the time of bootstrapping.
//
// To see what happens if you put it in the wrong place, try moving
// this line up to where the TickContext is initialized, and check
// out the error message you get.
//
// tickContext.setX() establishes the left-most x position for all
// of the 'tickables' (notes, etc...) in a context.


// This will contain any notes that are currently visible on the staff,
// before they've either been answered correctly, or plumetted off
// the staff when a user fails to answer them correctly in time.
// TODO: Add sound effects.
const visibleNoteGroups = [];

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

/*
async function writeNote() {
    note = notes.shift();
    if(!note) return;
    const group = context.openGroup();
    visibleNoteGroups.push(group);
    note.draw();
    context.closeGroup();
    group.classList.add('scroll');
    // Force a dom-refresh by asking for the group's bounding box. Why? Most
// modern browsers are smart enough to realize that adding .scroll class
// hasn't changed anything about the rendering, so they wait to apply it
// at the next dom refresh, when they can apply any other changes at the
// same time for optimization. However, if we allow that to happen,
// then sometimes the note will immediately jump to its fully transformed
// position -- because the transform will be applied before the class with
// its transition rule. 
    const box = group.getBoundingClientRect();
    group.classList.add('scrolling');
    // If a user doesn't answer in time make the note fall below the staff
    window.setTimeout(() => {
        const index = visibleNoteGroups.indexOf(group);
        if(index === -1) return;
        group.classList.add('too-slow');
    visibleNoteGroups.shift();
    }, 5000);
} */
 
var notesTwo = [
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['b', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['d', '', '4', '2'],
    ['c', '', '4', '8'],
    ['e', '', '4', '8'],
    ['a', '', '4', '8'],
    ['b', '', '4', '2'],
    ['e', '', '4', '8'],
    ['g', '', '4', '8'],
    ['b', '', '4', '8'],
    ['c', '', '5', '2'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['b', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['d', '', '4', '2'],
    ['c', '', '4', '8'],
    ['e', '', '4', '8'],
    ['a', '', '4', '8'],
    ['b', '', '4', '2'],
    ['e', '', '4', '8'],
    ['c', '', '5', '8'],
    ['b', '', '4', '8'],
    ['a', '', '4', '2'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['b', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['d', '', '4', '2'],
    ['c', '', '4', '8'],
    ['e', '', '4', '8'],
    ['a', '', '4', '8'],
    ['b', '', '4', '2'],
    ['e', '', '4', '8'],
    ['g', '', '4', '8'],
    ['b', '', '4', '8'],
    ['c', '', '5', '2'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['b', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['d', '', '4', '2'],
    ['c', '', '4', '8'],
    ['e', '', '4', '8'],
    ['a', '', '4', '8'],
    ['b', '', '4', '2'],
    ['e', '', '4', '8'],
    ['c', '', '5', '8'],
    ['b', '', '4', '8'],
    ['a', '', '4', '2'],
    ['b', '', '4', '8'],
    ['c', '', '5', '8'],
    ['d', '', '5', '8'],
    ['e', '', '5', '2'],
    ['g', '', '4', '8'],
    ['f', '', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '', '5', '2'],
    ['f', '', '4', '8'],
    ['e', '', '5', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '2'],
    ['e', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['b', '', '4', '2'],
    ['e', '', '4', '8'],
    ['e', '', '5', '8'],
    ['e', '', '4', '8'],
    ['e', '', '5', '8'],
    ['e', '', '5', '8'],
    ['e', '', '5', '8'],
    ['g', '', '6', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['b', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['a', '', '4', '2'],
    ['c', '', '4', '8'],
    ['e', '', '4', '8'],
    ['a', '', '4', '8'],
    ['b', '', '4', '2'],
    ['e', '', '4', '8'],
    ['g', '', '4', '8'],
    ['b', '', '4', '8'],
    ['c', '', '5', '2'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['b', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['d', '', '4', '2'],
    ['c', '', '4', '8'],
    ['e', '', '4', '8'],
    ['a', '', '4', '8'],
    ['b', '', '4', '2'],
    ['e', '', '4', '8'],
    ['c', '', '5', '8'],
    ['b', '', '4', '8'],
    ['a', '', '4', '2'],
    ['b', '', '4', '8'],
    ['c', '', '5', '8'],
    ['d', '', '5', '8'],
    ['e', '', '5', '2'],
    ['g', '', '4', '8'],
    ['f', '', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '', '5', '2'],
    ['f', '', '4', '8'],
    ['e', '', '5', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '2'],
    ['e', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['b', '', '4', '2'],
    ['e', '', '4', '8'],
    ['e', '', '5', '8'],
    ['e', '', '4', '8'],
    ['e', '', '5', '8'],
    ['e', '', '5', '8'],
    ['e', '', '5', '8'],
    ['g', '', '6', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['b', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['a', '', '4', '2'],
    ['c', '', '4', '8'],
    ['e', '', '4', '8'],
    ['a', '', '4', '8'],
    ['b', '', '4', '2'],
    ['e', '', '4', '8'],
    ['g', '', '4', '8'],
    ['b', '', '4', '8'],
    ['c', '', '5', '2'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['d', '#', '5', '8'],
    ['e', '', '5', '8'],
    ['b', '', '4', '8'],
    ['d', '', '5', '8'],
    ['c', '', '5', '8'],
    ['d', '', '4', '2'],
    ['c', '', '4', '8'],
    ['e', '', '4', '8'],
    ['a', '', '4', '8'],
    ['b', '', '4', '2'],
    ['e', '', '4', '8'],
    ['c', '', '5', '8'],
    ['b', '', '4', '8'],
    ['a', '', '4', '2'],
] 
 

function loadNotes() {

    notes = notesTwo.map(([letter, acc, octave, length]) => {
        const note = new VF.StaveNote({
        clef: 'treble',
        keys: [`${letter}${acc}/${octave}`],
        duration: length,
      })
      .setContext(context)
      .setStave(stave);
    
      // If a StaveNote has an accidental, we must render it manually.
      // This is so that you get full control over whether to render
      // an accidental depending on the musical context. Here, if we
      // have one, we want to render it. (Theoretically, we might
      // add logic to render a natural sign if we had the same letter
      // name previously with an accidental. Or, perhaps every twelfth
      // note or so we might render a natural sign randomly, just to be
      // sure our user who's learning to read accidentals learns
      // what the natural symbol means.)
      // if(acc) note.addAccidental(0, new VF.Accidental(acc));
        tickContext.addTickable(note)
        return note;
    });

}

loadNotes();

async function writeNotes() {
    let track_name = document.querySelector(".track-name").innerHTML;

    if(playpause_btn.innerHTML === '<i class="fa fa-stop-circle fa-5x"></i>') {
        toggleVisibility = true;
        let len = notes.length
        for(let i = 0; i < len; i++) {
            note = notes[i];
            if(!note) return;
            const group = context.openGroup();
            
            visibleNoteGroups.push(group);
            
            if(!toggleVisibility) break; 
            note.draw();
            context.closeGroup();
            group.classList.add('scroll');
            // Force a dom-refresh by asking for the group's bounding box. Why? Most
            // modern browsers are smart enough to realize that adding .scroll class
            // hasn't changed anything about the rendering, so they wait to apply it
            // at the next dom refresh, when they can apply any other changes at the
            // same time for optimization. However, if we allow that to happen,
            // then sometimes the note will immediately jump to its fully transformed
            // position -- because the transform will be applied before the class with
            // its transition rule. 
            const box = group.getBoundingClientRect();
            group.classList.add('scrolling');

            // If a user doesn't answer in time make the note fall below the staff
            window.setTimeout(() => {
                const index = visibleNoteGroups.indexOf(group);
                if(index === -1) return;
                group.classList.add('too-slow');
                visibleNoteGroups.shift();
            }, 5000);

            if(track_name == "Twinkle Twinkle Little Star") {
                if(note.duration == '2') {
                    await delay(1240);
                } else if(note.duration == '8') {
                    await delay(310)
                } else if(note.duration == '4') {
                    await delay(620);
                }
            } else if(track_name == "Happy Birthday") {
                if(note.duration == '4') {
                    await delay(500);
                } else if(note.duration == '2') {
                    await delay(1130);
                } else if(note.duration == '8') {
                    await delay(280);
                }
            } else if(track_name == "Fur Elise") {
                if(note.duration == '4') {
                    await delay(500);
                } else if(note.duration == '2') {
                    await delay(570);
                } else if(note.duration == '8') {
                    await delay(237);
                }
            } 
            
        }
        // loadNotes();
        // tickContext = new VF.TickContext();
        // tickContext.preFormat().setX(400);
        
    } else {

        for(let i = 0; i < visibleNoteGroups.length; i++) {
            visibleNoteGroups[i].classList.add("deleted")
        }

        // tickContext = new VF.TickContext();
        // tickContext.preFormat().setX(400);
        // Create a stave of width 10000 at position 10, 40 on the canvas.
        //stave = new VF.Stave(10, 10, 10000)
        //.addClef('treble')
        //.addTimeSignature("4/4");
        // Connect it to the rendering context and draw!
        //stave.setContext(context).draw();

        toggleVisibility = false;

        tickContext.tickables = [];

    }
}

// Add a note to the staff from the notes array (if there are any left).
document.getElementById('play-pause-button').addEventListener('click', writeNotes);