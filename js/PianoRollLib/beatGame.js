import { beatFromEncodedState } from "./pianoRoll.js";

export function beatChecker(expectedBeat, pianoRoll){
    pianoRoll.addBeatListener((i, t) => this._onBeatPlay(i, t));

    this._onBeatPlay = function(beatIndex, time){
        // The beat is played at an arbitrary point in the future, we must delay 
        // calling the callbacks until approx that time
        const delay = Math.floor((time - pianoRoll.audioCtx.currentTime) * 1000);

        var isCorrect = true;

        for(let i = 0; i < pianoRoll.instrument.notes.length; i++){
            if(expectedBeat.isBeatToggled(beatIndex, i) != pianoRoll.isBeatToggled(beatIndex, i)){
                isCorrect = false;

                this._callDelayed(() => this.onIncorrectNote?.(beatIndex, i), delay);
            }
            else{

                this._callDelayed(() => this.onCorrectNote?.(beatIndex, i), delay);
            }
        }

        // If correct but the beat is not finished
        if(isCorrect && beatIndex < pianoRoll.length - 1)
            return;

        if(isCorrect){
            this._callDelayed(() => this._onBeatSucceed(), delay);
        }
        else{
            this._callDelayed(() => this._onBeatFailed(), delay);
        }
    }

    this._callDelayed = function(f, delay){
        if(delay < 10){
            f();
        }
        else{
            setTimeout(f, delay);
        }
    }

    this._onBeatFailed = function(){
        pianoRoll.stop();
        this.onFail?.();
    }

    this._onBeatSucceed = function(){
        pianoRoll.stop();
        this.onSuccess?.();
    }
}

export function createGamePianoRoll(domParent){
    // TODO: create a custom piano roll controller to control the piano roll.
    // This controller should allow for testing a runthrough of the level or 
    // submitting a sequence. Input should be disabled when the piano roll is
    // running in submit mode
    // A gamestate object should also be created 
}

export function startLevel(expectedBeat, pianoRoll){
    const checker = new beatChecker(expectedBeat, pianoRoll);
    checker.onCorrectNote = (beatIndex, noteIndex) => {
        if(expectedBeat.isBeatToggled(beatIndex, noteIndex)){
            pianoRoll.addSquareStyle(beatIndex, noteIndex, "pianoRollSquareSucceeded");
        }
    };

    checker.onIncorrectNote = (beatIndex, noteIndex) => {
        if(!expectedBeat.isBeatToggled(beatIndex, noteIndex)){
            pianoRoll.addSquareStyle(beatIndex, noteIndex, "pianoRollSquareFailed");
        }
    }
}

export const levels = [
    beatFromEncodedState(3, 16, "qqoICIGA")
]