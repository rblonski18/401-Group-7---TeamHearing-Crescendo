// return a shuffled copy of the array
function shuffle(arr) {
	const temp = arr.slice();
	// fisher yates shuffle algorithm 
	// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	for (let i = arr.length - 1; i > 0; --i) {
		// 0 <= j <= i
		let j = randInt(0, i+1);
		// do a swap
		[temp[i], temp[j]] = [temp[j], temp[i]];
	}
	return temp;
}

// just copy/pasted this one from stack overflow
// https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
// min is inclusive, max is inclusive
function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// select k random values of the array
function randSelect(arr, k) {
	if (arr.length < k) 
		return shuffle(arr);
	return shuffle(arr).slice(0, k);
}