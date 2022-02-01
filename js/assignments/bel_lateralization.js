function assignment(back) {
	back = back ? back : () => { layout.dashboard(); };

	// init
	const mode = 'bel_lateralization';
	let a = 0, callbacks = [], options = [];

	// Sound Movement
	options.push('Sound Movement');
	callbacks.push(function(id){
		protocol = new Protocol();
		protocol.activity = 'lateralization';
		protocol.callback = () => { assignment(); };
		protocol.ID = id;
		protocol.random = false;
		const sounds = ['addingmachine','airplane','auto','birdwings','bongo','dog','fly','helicopter'];
		for (let a = 0; a < sounds.length; a++) {
			protocol.settings.push({
				chances: 4,
				sounds: sounds[a],
				volume: true
			});
		}
		protocol.start(1);
	}.bind(null,mode+'.'+a++));

	// Binaural Study
	layout.assignment('Environmental Sound Movement',options,callbacks,{},mode,back);
}
