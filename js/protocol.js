protocol = new Protocol();
function Protocol(settings) {
	this.active = false;
	this.activity = undefined;
	this.callback = () => { activity.results(); };
	this.elapsedTime = 0;
	this.IDs = [];
	this.ind = 0;
	this.isComplete = 0;
	this.random = true;
	this.settings = [];
	this.special = false;
	this.startTime = 0;
	this.testOrder = [];
	this.webVersion = version;

	// overrides
	for (let key in settings) { this[key] = settings[key]; }
}
Protocol.prototype.next = function () {
	if (this.active) {
		this.elapsedTime += Date.now() - this.startTime;
		this.startTime = Date.now();

		// increment index and check if complete
		if (++this.ind >= this.testOrder.length) {
			this.isComplete = 1;
			this.active = false;
			let callback = this.callback;//is this used?
			layout.message('Message','Protocol complete. Awesomesauce.',() => { protocol.callback(); });}
		else {
			this.isComplete = 0;
			layout.message(
				'Protocol Message',
				'Completed ' + String(this.ind) + ' of ' + String(this.testOrder.length) + '.',
				() => { window[protocol.activity](this.settings[this.testOrder[this.ind]]); }
			);
		}

		// save to database
		if (this.ind == 1) {
			// initial post
			jQuery.ajax({
				data: {
					activity: protocol.activity,
					ear: ear,
					elapsedTime: protocol.elapsedTime,
					IDs: protocol.IDs.join(','),
					ind: protocol.ind,
					isComplete: protocol.isComplete,
					protocol: protocol.ID,
					settings: JSON.stringify(protocol.settings),
					subuser: subuser.ID,
					testOrder: protocol.testOrder.join(','),
					user: user.ID,
					webVersion: protocol.webVersion
				},
				error: function(jqXHR,textStatus,errorThrown){callback()},
				success: function(data,status){
					data = jQuery.parseJSON(data);
					protocol.ID = Number(data);
				},
				type: 'POST',
				url: 'version/'+version+'/php/protocol.php'
			});
		} else {
			// updates
			jQuery.ajax({
				data: {
					ear: ear,
					elapsedTime: protocol.elapsedTime,
					ID: protocol.ID,
					IDs: protocol.IDs.join(','),
					ind: protocol.ind,
					isComplete: protocol.isComplete,
					webVersion: version

				},
				error: function(jqXHR,textStatus,errorThrown){callback()},
				success: function(data,status){},
				type: 'PUT',
				url: 'version/'+version+'/php/protocol.php'
			});
		}
	} else { activity.results(); }
}
Protocol.prototype.open = function (callback) {
	layout.message('Protocol Message',['This protocol includes '+this.testOrder.length+' listening exercises.'],callback);
}
Protocol.prototype.start = function (reps) {
	reps = reps ? reps : 1;

	// resets
	this.active = true;
	this.elapsedTime = 0;
	this.IDs = [];
	this.ind = 0;
	this.startTime = Date.now();
	this.testOrder = [];
	for (let a = 0; a < reps; a++) {
		let sequence = []; sequence.sequence(this.settings.length);
		if (this.random) { sequence.shuffle(); }
		this.testOrder.push(...sequence);
	}

	// initialize activity
	let set = Object.assign({}, this.settings[0]);
	set.init = () => {};
	loadscript(this.activity, () => { window[this.activity](set); });

	// define callback
	let callback, settings = this.settings[this.testOrder[this.ind]];//shorthand
	callback = () => { window[this.activity](settings); };

	// opening function
	if (this.open) { this.open(callback); }
	else { callback(); }
}
