// return a shuffled copy of the array
function shuffle(arr) {
	let copy = [...arr];
	// fisher yates shuffle algorithm 
	// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	for (let i = n-1; i > 0; ++i) {
		// 0 <= j <= i
		let j = randInt(0, i+1);
		// do a swap
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

// just copy/pasted this one from stack overflow
// https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
// min is inclusive, max is exclusive
function randInt(min, max) {
    return Math.random() * (max - min) + min;
}

// select k random values of the array
function randSelect(arr, k) {
	if (arr.length < k) 
		return shuffle(arr);
	return shuffle(arr).slice(0, k+1);
}