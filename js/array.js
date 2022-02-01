Array.prototype.abs = function () {
	let x = [];
	for (let a = 0; a < this.length; a++) {
		x[a] = Math.abs(this[a]);
	}
	return x;
};
Array.prototype.last = function () {
	return this[this.length-1];
}
Array.prototype.max = function () {
	let max = -Infinity;
	for (let a = 0; a < this.length; a++) {
		max = Math.max(max, this[a]);
	}
	return max;
};
Array.prototype.mean = function () {
	let mean = 0;
	for (let a = 0; a < this.length; a++) { mean += this[a]; }
	return mean / this.length;
};
Array.prototype.meanLog = function () {
	let mean = 0;
	for (let a = 0; a < this.length; a++) {
		mean += Math.log(this[a]);
	}
	return Math.exp(mean/this.length);
};
Array.prototype.min = function () {
	let min = Infinity;
	for (let a = 0; a < this.length; a++) {
		min = Math.min(min, this[a]);
	}
	return min;
};
Array.prototype.number = function () {
	for (let a = 0; a < this.length; a++) {
		this[a] = Number(this[a]);
	}
	return this;
}
Array.prototype.pc2 = function () {
	let i = 0, sum = 0;
	for (let a = 0; a < this.length; a++) {
		for (let b = 0; b < this[a].length; b++) {
			i++;
			sum += this[a][b];
		}
	}
	return 100*sum/i;
};
Array.prototype.remove = function () {
    let what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {this.splice(ax, 1);}
    }
    return this;
};
Array.prototype.reversals = function () {
	let last = 4, reversals = [];
    if (this[0] <= this[1]) { reversals.push(0); }
    for (let a = 1; a < this.length-1; a++) {
    	if (this[a] < Math.min(this[a-1],this[a+1])) { reversals.push(a); }
    	if (this[a] > Math.max(this[a-1],this[a+1])) { reversals.push(a); }
    }
    reversals.push(this.length-1);
    return this.select(reversals.slice(Math.max(reversals.length-last-1,0))).mean();
};
Array.prototype.rms = function () {
	let rms = 0;
	for (let a = 0; a < this.length; a++) {
		rms += this[a]*this[a];
	}
	return Math.sqrt(rms/this.length);
};
Array.prototype.select = function (index) {
	let selected = [];
    for (let a = 0; a <= index.length-1; a++) {
    	selected.push(this[index[a]]);
    }
    return selected;
};
Array.prototype.sequence = function (items) {
	for (let a = 0; a < items; a++) {
		this[a] = a;
	}
};
Array.prototype.shuffle = function () {
    let tmp, current, top = this.length;
    if(top) while(--top) {
    	current = Math.floor(Math.random()*(top+1));
    	tmp = this[current];
    	this[current] = this[top];
    	this[top] = tmp;
    }
	return this;
};
Array.prototype.stereo = function () {//seems like a dsp function not an array prototype
    let x = [[],[]];
	for (let a = 0; a < this.length; a++) {
		x[0][a] = this[a];
		x[1][a] = 0;
	}
	return x;
};
Array.prototype.sum = function () {
	let sum = 0;
	for (let a = 0; a < this.length; a++) {
		sum += this[a];
	}
	return sum;
};

// Math
function db(x) {
  return 20*Math.log(x)/Math.LN10;
}
function dbi(x) {
  return Math.pow(10,x/20);
}
function percentCorrect(A,B) {
	let score = [];
	for (let a = 0; a < A.length; a++) {
		score[a] = (A[a] == B[a]) ? 1 : 0;
	}
	return 100*score.sum()/score.length;
}
function totalCorrect(A,B) {
	let score = [];
	for (let a = 0; a < A.length; a++) {
		score[a] = (A[a] == B[a]) ? 1 : 0;
	}
	return score.sum();
}