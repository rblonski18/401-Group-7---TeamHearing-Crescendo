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

// This will contain any notes that are currently visible on the staff,
// before they've either been answered correctly, or plumetted off
// the staff when a user fails to answer them correctly in time.
const visibleNoteGroups = [];

/**
 * This is a function that just delays for a certain amount of time. Think 
 * of it as a sleep function. 
 * @param {string} time - The time in milliseconds you want program to wait. 
 */
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


/**
 * These are the notes to the song 'Happy Birthday' in the following format: 
 * [{note}, {accidental}, {octave}, {duration}]
 * It's a sort of 'holder' that I can use in loadNotes() to refresh the note list. 
 */
var notesTwo = [
    ['c', '', '4', '4'],
    ['c', '', '4', '8'],
    ['d', '', '4', '4'], 
    ['c', '', '4', '4'],
    ['f', '', '4', '4'],
    ['e', '', '4', '2'],
    ['c', '', '4', '4'],
    ['c', '', '4', '8'],
    ['d', '', '4', '4'],
    ['c', '', '4', '4'],
    ['g', '', '4', '4'],
    ['f', '', '4', '2'],
    ['c', '', '4', '4'],
    ['c', '', '4', '8'],
    ['c', '', '5', '4'],
    ['a', '', '4', '4'],
    ['f', '', '4', '4'],
    ['e', '', '4', '4'],
    ['d', '', '4', '4'],
    ['b', '', '4', '4'],
    ['b', '', '4', '8'],
    ['a', '', '4', '4'],
    ['f', '', '4', '4'], 
    ['g', '', '4', '4'],
    ['f', '', '4', '2'],
] 
 
/**
 * Used to load the notes back into the list when restarting the song or
 * playing it for the first time. 
 * Converts list of notes above to VF.StaveNote objects. 
 */
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
      if(acc) note.addAccidental(0, new VF.Accidental(acc));
        tickContext.addTickable(note)
        return note;
    });

}

loadNotes();

/**
 * Main function that writes notes to the page. Loops over the notes list
 * and opens context group, draws the notes, and closes. Adds to visibleNoteGroups list, 
 * and adds "scroll" and "scrolling" classes to group. These move the note to the left 
 * across the stave on the screen. 
 * I then call the delay function depending on the note duration to see how long
 * I should wait before sending out the next note. If you're having difficulty 
 * getting the notes to sync up with the song, you'll want to adjust these values.
 * If the use presses stop, the class "deleted" is added to all visible notes, and
 * they fade away. 
 */
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

            if(note.duration == '4') {
                await delay(500);
            } else if(note.duration == '2') {
                await delay(1130);
            } else if(note.duration == '8') {
                await delay(280);
            }
            
        }
        
    } else {

        for(let i = 0; i < visibleNoteGroups.length; i++) {
            visibleNoteGroups[i].classList.add("deleted")
        }

        toggleVisibility = false;

        tickContext.tickables = [];

    }
}

// Add a note to the staff from the notes array (if there are any left).
document.getElementById('play-pause-button').addEventListener('click', writeNotes);