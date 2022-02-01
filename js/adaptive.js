function Adaptive(settings) {
	// set defaults based on rule
	let rule = settings && 'rule' in settings ? settings.rule : 'linear',
		step0 = rule == 'linear' ? 6 : Math.pow(2,1/3),
		stepAdjustment = rule == 'linear' ? 2 : Math.pow(2,-1/3),
		stepMin = rule == 'linear' ? 2 : Math.pow(2,1/3),
		value0 = rule == 'linear' ? 60 : 16,
		valueMax = rule == 'linear' ? 75 : 128;
	
	// defaults
	this.cease = Infinity;
	this.happy = undefined;
	this.history = [];
	this.multiplier = 3;
	this.rule = rule;
	this.step = undefined;
	this.step0 = step0;
	this.stepAdjustment = stepAdjustment;
	this.stepMin = stepMin;
	this.value = undefined;
	this.valueMax = valueMax;
	this.valueMin = -Infinity;
	this.value0 = value0;
	
	// overrides
	for(let key in settings){if(key in this){this[key]=settings[key]}}
	
	// reset
	this.reset();
}
Adaptive.prototype.logic = function (correct) {
	with(this){
		// cease is older way of combining adaptive and constant behaviors
		// may become obsolete in future versions
		if (history.length >= cease) { 
			history.push(value.toPrecision(4));
			return;
		}
		
		// correct response
		if (correct === true) {
			// not happy? adjust step
			if (happy === false) {
				step = (rule == 'linear')
					? Math.max(step - stepAdjustment, stepMin)
					: Math.max(step * stepAdjustment, stepMin);
			}
			
			// happy
			happy = true;
			
			// adapt
			switch (rule) {
				case 'linear': value -= step; break;
				case 'exponential': value /= step;
			}
			
		// incorrect response
		} else if (correct === false) {
			
			// not happy
			happy = false;
			
			// adapt
			switch (rule) {
				case 'linear': value += multiplier*step; break;
				case 'exponential': value *= Math.pow(step,multiplier);
			}
		}
		
		// ceiling and floor
		value = Math.max(Math.min(value, valueMax), valueMin);
		
		// history
		history.push(Number(value.toPrecision(4)));
	}
};
Adaptive.prototype.reset = function(callback) {
	this.happy = undefined;
	this.history = [];
	this.step = this.step0;
	this.value = this.value0;
	if(callback){callback()}
};