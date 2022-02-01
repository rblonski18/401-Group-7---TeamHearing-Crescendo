homework = {
	assign: function (assignment) {
		jQuery.ajax({
			data: {
				assignment: assignment,
				subuser: subuser.ID,
				user: user.ID
			},
			success: function (data, status) { homework.check(); },
			type: 'POST',
			url: 'version/'+version+'/php/homework.php'
		});
	},
	assignment: function () {
		var callbacks = [], options = [];
		options.push('Pitch Benchmark');
		callbacks.push(function(id){homework.assign(3)});
		options.push('Cochlear Implant Pitch with Depth');
		callbacks.push(function(id){homework.assign(9)});
		options.push('Pitch with Modulation Detection');
		callbacks.push(function(id){homework.assign(16)});
		options.push('Normal Hearing Pitch with Depth');
		callbacks.push(function(id){homework.assign(15)});
		options.push('Pitch of Synthetic Vowels');
		callbacks.push(function(id){homework.assign(7)});
		options.push('Binaural Experiment');
		callbacks.push(function(id){homework.assign(8)});
		options.push('Modulation Detection');
		callbacks.push(function(id){homework.assign(11)});
		options.push('Modulation Frequency Discrimination');
		callbacks.push(function(id){homework.assign(12)});
		options.push('Tonal & Pitch Comparisons');
		callbacks.push(function(id){homework.assign(13)});
		options.push('Music and Mindfulness Study');
		callbacks.push(function(id){homework.assign(17)});
		menu('Homework Assignment',options,callbacks,{});
		function menu(title, options, callbacks, extra) {
			// main (sets up the title bar and back button)
			main = layout.main(title, function(){layout.dashboard()}, extra);
			
			// menu division
			var menu = document.createElement('div');
			
			// build menu (note this part is generic, perhaps move to layout)
			for (var a = 0; a < options.length; a++) {		
				// init menu item
				var item = document.createElement('li');
				item.id = a;
				item.onclick = function () {
					document.getElementById('home').title = 'Return home.';
					callbacks[this.id]();
				};
				
				// icon
				var img = document.createElement('img');
				img.src = 'images/runningman.png';
				img.style.height = '1.5em';
				img.style.paddingRight = '8px';
				
				// title
				var span = document.createElement('span');
				span.innerHTML = options[a];
				span.style.display = 'inline-block';
				
				// anchor
				var anchor = document.createElement('a');
				anchor.id = homework.mode+'.'+String(a+1);
				anchor.appendChild(img);
				anchor.appendChild(span);
				menu.appendChild(item);
				item.appendChild(anchor);
				if(iOS){FastClick(item)}
			}
			jQuery(menu).menu();
			main.appendChild(menu);
			layout.footer();
		}
	},
	check: function () {
		jQuery.ajax({
			data: {
				subuser: subuser.ID,
				user: user.ID
			},
			success: function (data, status) {
				var data = jQuery.parseJSON(data);
				console.log(data);
				var assignment = data.length == 0 || subuser.ID != user.ID ? 0 : Number(data[0].assignment);
				console.log(assignment);
				homework.menu(assignment);
			},
			type: 'GET',
			url: 'version/'+version+'/php/homework.php'
		});	
	},
	menu: function (mode) {
		var mode = (typeof mode !== 'undefined') 
			? mode 
			: ('mode' in this) 
				? this.mode 
				: 0; 
		homework.mode = mode;
		var a = 1, callbacks = [], options = [];
		switch (mode) {
			case 0:
				options.push('Pitch Benchmark');
				callbacks.push(function(id){homework.menu(3)});
				options.push('Cochlear Implant Pitch with Depth');
				callbacks.push(function(id){homework.menu(9)});
				options.push('Pitch with Modulation Detection');
				callbacks.push(function(id){homework.menu(16)});
				options.push('Normal Hearing Pitch with Depth');
				callbacks.push(function(id){homework.menu(15)});
				options.push('Pitch of Synthetic Vowels');
				callbacks.push(function(id){homework.menu(7)});
				options.push('Binaural Experiment');
				callbacks.push(function(id){homework.menu(8)});
				options.push('Modulation Detection');
				callbacks.push(function(id){homework.menu(11)});
				options.push('Modulation Frequency Discrimination');
				callbacks.push(function(id){homework.menu(12)});
				options.push('Tonal & Pitch Comparisons');
				callbacks.push(function(id){homework.menu(13)});
				options.push('Music and Mindfulness Study');
				callbacks.push(function(id){homework.menu(17)});
				options.push('Dichotic Protocol');
				callbacks.push(function(id){homework.menu(18)});
				var extra = {'Assign':function(){homework.assignment()}};
				menu('Homework',options,callbacks,extra); break;
			case 1:
				protocol.activity = 'harmonics';
				protocol.random = false;
				protocol.settings = [];
				var f0 = [0], f1 = [250,500,1000,2000,4000,8000], i = 0;
				for (var a = 0; a < f0.length; a++) {
					for (var b = 0; b < f1.length; b++) {
						protocol.settings[i++] = {
							material: new Harmonics({
								activity: 1, 
								f0: f0[a],
								f1: f1[b],
								mode: 0
							}),
						};
					}
				}
				protocol.start(); break;
			case 2:
				protocol.activity = 'gabor';
				protocol.random = false;
				protocol.settings = [];
				var frequency = [2,4,8,16,32,64];
				for (var a = 0; a < frequency.length; a++) {
					protocol.settings[a] = {
						frequency: frequency[a],
						mode: 1
					};
				}
				protocol.start(); break;
			case 3://Pitch Benchmark
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){}});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [250,500,1e3,2e3,4e3,6e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							})
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Frequency Discrimination');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [250,500,1e3,2e3,4e3,6e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings[a] = {
							adaptive: new Adaptive({rule:'exponential',step0:Math.pow(2,1/3),value0:64,valueMax:200}),
							material: new Harmonics({
								activity: 1, 
								f0: 0,
								f1: f1[a],
								mode: 0
							}),
							volume: true
						};
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Fundamental Frequency Discrimination');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.settings = [];
					protocol.special = 0;
					var f0 = [110,220,440], f1 = 2000;
					for (var a = 0; a < f0.length; a++) {
						protocol.settings[a] = {
							adaptive: new Adaptive({rule:'exponential',step0:Math.pow(2,1/3),value0:64,valueMax:200}),
							material: new Harmonics({
								activity: 2,
								f0: f0[a],
								f1: f1,
								filter: {bandwidth:1/4,frequency:f1,type:'lowpass'},
								mode: 1
							})
						};
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Melodic Contour Identification');
				callbacks.push(function(id){
					var spacings = [4,2,1];
					protocol.activity = 'musanim';
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					for (var a = 0; a < spacings.length; a++) {
						protocol.settings[a] = {
							material: new Musanim({spacing:spacings[a]})
						};
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				menu('Pitch Benchmark',options,callbacks);
				break;
			case 4://Enhancement Experiment
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){}});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [500,1e3,2e3,4e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							gain: 40,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							})
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Consonants in Quiet');
				callbacks.push(function(id){
					var ind = 0, enhanced = [0,1];
					protocol.activity = 'consonants';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < enhanced.length; a++) {
						protocol.settings[ind++] = {
							behavior: 'Constant',
							chances: Infinity,
							lastchance: false,
							material: new Consonants({enhanced:enhanced[a],genders:['W']}),
							snr: Infinity,
							trials: 20
						};
					}
					protocol.start(2);
				}.bind(null,mode+'.'+a++));
				options.push('Vowels in Quiet');
				callbacks.push(function(id){
					var ind = 0, enhanced = [0,1];
					protocol.activity = 'vowels';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < enhanced.length; a++) {
						protocol.settings[ind++] = {
							behavior: 'Constant',
							chances: Infinity,
							lastchance: false,
							material: new Vowels({enhanced:enhanced[a]}),
							snr: Infinity,
							trials: 20
						};
					}
					protocol.start(2);
				}.bind(null,mode+'.'+a++));
				options.push('Consonants in Noise: 12 dB SNR');
				callbacks.push(function(id){
					var ind = 0, enhanced = [0,1];
					protocol.activity = 'consonants';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < enhanced.length; a++) {
						protocol.settings[ind++] = {
							behavior: 'Constant',
							chances: Infinity,
							lastchance: false,
							material: new Consonants({enhanced:enhanced[a],genders:['W']}),
							noise: 'Speech-Shaped Noise',
							snr: 12,
							trials: 20
						};
					}
					protocol.start(2);
				}.bind(null,mode+'.'+a++));
				options.push('Vowels in Noise: 12 dB SNR');
				callbacks.push(function(id){
					var ind = 0, enhanced = [0,1];
					protocol.activity = 'vowels';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < enhanced.length; a++) {
						protocol.settings[ind++] = {
							behavior: 'Constant',
							chances: Infinity,
							lastchance: false,
							material: new Vowels({enhanced:enhanced[a]}),
							noise: 'Speech-Shaped Noise',
							snr: 12,
							trials: 20
						};
					}
					protocol.start(2);
				}.bind(null,mode+'.'+a++));
				options.push('Consonants in Noise: 6 dB SNR');
				callbacks.push(function(id){
					var ind = 0, enhanced = [0,1];
					protocol.activity = 'consonants';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < enhanced.length; a++) {
						protocol.settings[ind++] = {
							behavior: 'Constant',
							chances: Infinity,
							lastchance: false,
							material: new Consonants({enhanced:enhanced[a],genders:['W']}),
							noise: 'Speech-Shaped Noise',
							snr: 6,
							trials: 20
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Vowels in Noise: 6 dB SNR');
				callbacks.push(function(id){
					var ind = 0, enhanced = [0,1];
					protocol.activity = 'vowels';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < enhanced.length; a++) {
						protocol.settings[ind++] = {
							behavior: 'Constant',
							chances: Infinity,
							lastchance: false,
							material: new Vowels({enhanced:enhanced[a]}),
							noise: 'Speech-Shaped Noise',
							snr: 6,
							trials: 20
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Consonants in Noise: 0 dB SNR');
				callbacks.push(function(id){
					var ind = 0, enhanced = [0,1];
					protocol.activity = 'consonants';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < enhanced.length; a++) {
						protocol.settings[ind++] = {
							behavior: 'Constant',
							chances: Infinity,
							lastchance: false,
							material: new Consonants({enhanced:enhanced[a],genders:['W']}),
							noise: 'Speech-Shaped Noise',
							snr: 0,
							trials: 20
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Vowels in Noise: 0 dB SNR');
				callbacks.push(function(id){
					var ind = 0, enhanced = [0,1];
					protocol.activity = 'vowels';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < enhanced.length; a++) {
						protocol.settings[ind++] = {
							behavior: 'Constant',
							chances: Infinity,
							lastchance: false,
							material: new Vowels({enhanced:enhanced[a]}),
							noise: 'Speech-Shaped Noise',
							snr: 0,
							trials: 20
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Consonants in Noise: -6 dB SNR');
				callbacks.push(function(id){
					var ind = 0, enhanced = [0,1];
					protocol.activity = 'consonants';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < enhanced.length; a++) {
						protocol.settings[ind++] = {
							behavior: 'Constant',
							chances: Infinity,
							lastchance: false,
							material: new Consonants({enhanced:enhanced[a],genders:['W']}),
							noise: 'Speech-Shaped Noise',
							snr: -6,
							trials: 20
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Vowels in Noise: -6 dB SNR');
				callbacks.push(function(id){
					var ind = 0, enhanced = [0,1];
					protocol.activity = 'vowels';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < enhanced.length; a++) {
						protocol.settings[ind++] = {
							behavior: 'Constant',
							chances: Infinity,
							lastchance: false,
							material: new Vowels({enhanced:enhanced[a]}),
							noise: 'Speech-Shaped Noise',
							snr: -6,
							trials: 20
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				menu('Enhancement Experiment',options,callbacks);
				break;
			case 5://voice masking release
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = 5.1;
					harmonics({init:function(){}});
					gui.loudness();
				});
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [500,1e3,2e3,4e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							gain: 40,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							})
						})
					}
					protocol.start();
				});
				options.push('Coordinate Response Measure');
				callbacks.push(function(id){
					var ind = 0, noise = ['Female_Mix','Male_Mix'], talkers = ['0','4'];
					protocol.activity = 'crm';
					protocol.callback = function(){homework.menu()};
					protocol.ID = 5.2;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					for (var a = 0; a < noise.length; a++) {
						for (var b = 0; b < talkers.length; b++) {
							protocol.settings[ind++] = {
								adaptive: new Adaptive({value0:12,valueMax:Infinity}),
								behavior: 'Adaptive',
								chances: 3,
								//controls: [],
								lastchance: false,
								material: new CRM({talkers:talkers[a]}),
								noise: noise[b],
								trials: Infinity
							};
						}
					}
					protocol.start(3);
				});
				menu('Colors and Numbers in Challenging Background',options,callbacks);
				break;
			case 6://Pitch with Timbre
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){}});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [125,250,500,1e3,2e3,4e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							}),
							//volume: {message:'Set the volume to be soft but audible.'}
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Frequency Discrimination');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [125,250,500,1e3,2e3,4e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings[a] = {
							adaptive: new Adaptive({rule:'exponential'}),
							material: new Harmonics({
								activity: 1, 
								f0: 0,
								f1: f1[a],
								mode: 0
							}),
							volume: true
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Fundamental Frequency Discrimination');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.special = 0;
					var f0 = [110,220,440], f1 = 2000,
						types = ['lowpass','bandpass','highpass'];
					var ind = 0;
					for (var a = 0; a < f0.length; a++) {
						for (var b = 0; b < types.length; b++) {
							var bw = b == 1 ? 1 : 1/4;
							protocol.settings[ind++] = {
								adaptive: new Adaptive({rule:'exponential'}),
								material: new Harmonics({
									activity: 2, 
									f0: f0[a],
									f1: f1,
									filter: {bandwidth:bw,frequency:f1,type:types[b]},
									mode: 1
								}),
							};
						}
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				menu('Pitch Regions',options,callbacks);
				break;
			case 7://Pitch of Synthetic Vowels
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){}});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [125,250,500,1e3,2e3,4e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							}),
							//volume: {message:'Set the volume to be soft but audible.'}
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Frequency Discrimination');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [125,250,500,1e3,2e3,4e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings[a] = {
							adaptive: new Adaptive({rule:'exponential'}),
							material: new Harmonics({
								activity: 1, 
								f0: 0,
								f1: f1[a],
								mode: 0
							}),
							volume: true
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Synthetic Vowels');
				callbacks.push(function(id){
					protocol.activity = 'synth';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = !debug;
					protocol.settings = [];
					protocol.special = 0;
					var ind = 0, f0 = [110,220,440], method = [0,1], mode = [0,1];
					for (var a = 0; a < f0.length; a++) {
						for (var b = 0; b < method.length; b++) {
							for (var c = 0; c < mode.length; c++) {
								protocol.settings[ind++] = {
									adaptive: new Adaptive({rule:'exponential'}),
									material: new Synth({
										f0: f0[a],
										method: method[b],
										mode: mode[c]
									}),
								};
							}
						}
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				menu('Pitch of Synthetic Vowels',options,callbacks);
				break;
			case 8://Binaural Experiment
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){}});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [125,250,500,1e3,2e3,4e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							})
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('ILD Discrimination');
				callbacks.push(function(id){
					protocol.activity = 'ild';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [250,500,1e3,2e3,4e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings[a] = {
							material: new ILD({
								depth: 200,
								f0: 110,
								f1: f1[a]
							})
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('ITD Discrimination');
				callbacks.push(function(id){
					protocol.activity = 'itd';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [250,500,1e3,2e3,4e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings[a] = {
							material: new ITD({
								f0: 20,
								f1: f1[a]
							})
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Sound Movement');
				callbacks.push(function(id){
					protocol.activity = 'lateralization';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings[0] = {
						material: new Lateralization(),
						volume: true
					}
					protocol.special = 0;
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Binaural Benefit');
				callbacks.push(function(id){
					protocol.activity = 'crisp';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = true;
					protocol.settings = [];
					protocol.settings[0] = {noise: 'crisp_0', repeat: false};
					protocol.settings[1] = {noise: 'crisp_L', repeat: false};
					protocol.settings[2] = {noise: 'crisp_R', repeat: false};
					protocol.special = 0;
					protocol.start(3);
				}.bind(null,mode+'.'+a++));						
				menu('Binaural Experiment',options,callbacks);
				break;
			case 9://CI Pitch with Depth
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){},f1:6e3});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [125,250,500,1e3,2e3,4e3,6e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							}),
							//volume: {message:'Set the volume to be soft but audible.'}
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Modulation Frequency Discrimination');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = !debug;
					protocol.settings = [];
					protocol.special = 0;
					var ind = 0, 
						depth = [25,50,100,200,400], 
						f0 = [110,220,440],
						f1 = 6000;
					for (var a = 0; a < f0.length; a++) {
						for (var b = 0; b < depth.length; b++) {
							protocol.settings[ind++] = {
								adaptive: new Adaptive({rule:'exponential',value0:128,valueMax:128}),
								chances: 4,
								material: new Harmonics({
									activity: 2,
									depth: depth[b],
									f0: f0[a],
									f1: f1,
									filter: {bandwidth:1/4,frequency:f1,type:'lowpass'},
									mode: 0
								})
							};
						}
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				menu('Cochlear Implant Pitch with Depth',options,callbacks);
				break;
			case 10://Pure Tone Pitch Training
				MASTERHOLD = 60;
				processor.volume(MASTERHOLD);
				options.push('Pure Tone Pitch Training');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = '10.1';
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [250,500,1000,2000,4000,6000];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings[a] = {
							adaptive: new Adaptive({rule:'exponential',value0:64,valueMax:128}),
							material: new Harmonics({
								activity: 1,
								f0: 0,
								f1: f1[a],
								mode: 0
							}),
							volume: true
						};
					}
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				menu('Pitch Training',options,callbacks);
				break;
			case 11://Modulation Detection
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){}});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [500,1e3,2e3,4e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							}),
							//volume: {message:'Set the volume to be soft but audible.'}
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Modulation Detection');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = !debug;
					protocol.settings = [];
					protocol.special = 0;
					var ind = 0,
						f0 = [20,40,100,200], 
						f1 = [500,1000,2000,4000];
					for (var a = 0; a < f0.length; a++) {
						for (var b = 0; b < f1.length; b++) {
							protocol.settings[ind++] = {
								adaptive: new Adaptive({rule:'exponential',step0:Math.pow(2,1/3),value0:100,valueMax:200}),
								alternatives: 3,
								chances: 3,
								material: new Harmonics({
									activity: 4,
									attack: .02,
									f0: f0[a],
									f1: f1[b],
									mode: 0,
									release: .02
								})
							};
						}
					}
					protocol.start(debug?1:3);
				}.bind(null,mode+'.'+a++));
				menu('Modulation Detection',options,callbacks); 
				break;	
			case 12://Modulation Discrimination
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){}});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [500,1e3,2e3,4e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							}),
							//volume: {message:'Set the volume to be soft but audible.'}
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Modulation Frequency Discrimination');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = !debug;
					protocol.settings = [];
					protocol.special = 0;
					var ind = 0, 
						f0 = [20,40,100,200], 
						f1 = [500,1000,2000,4000];
					for (var a = 0; a < f0.length; a++) {
						for (var b = 0; b < f1.length; b++) {
							protocol.settings[ind++] = {
								adaptive: new Adaptive({rule:'exponential',step0:Math.pow(2,1/3),value0:100,valueMax:200}),
								chances: 3,
								material: new Harmonics({
									activity: 2,
									attack: .02,
									depth: 100,
									f0: f0[a],
									f1: f1[b],
									mode: 0,
									release: .02
								})
							};
						}
					}
					protocol.start(debug?1:3);
				}.bind(null,mode+'.'+a++));
				menu('Modulation Frequency Discrimination',options,callbacks);
				break;
			case 13://Tonal & Rhythm Comparisons
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){}});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [125,250,500,1e3,2e3,4e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							}),
							//volume: {message:'Set the volume to be soft but audible.'}
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Tonal & Rhythm Comparisons');
				callbacks.push(function(id){
					protocol.activity = 'confronto';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.settings[0] = {trials:1};
					protocol.special = 0;
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Reaction Time');
				callbacks.push(function(id){
					protocol.activity = 'reaction';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.settings[0] = {trials:1};
					protocol.special = 0;
					protocol.start(1);
				}.bind(null,mode+'.'+a++));
				menu('Tonal & Rhythm Comparisons',options,callbacks);
				break;
			case 14://Complex Tone Pitch Training
				MASTERHOLD = 60;
				processor.volume(MASTERHOLD);
				options.push('Complex Tone Pitch Training');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = '14.1';
					protocol.random = !debug;
					protocol.settings = [];
					protocol.special = 0;
					var ind = 0, f0 = [110,220,440], f1 = 2000;
					for (var a = 0; a < f0.length; a++) {
						protocol.settings[a] = {
							adaptive: new Adaptive({rule:'exponential',value0:64,valueMax:128}),
							alternatives: 3,
							chances: 4,
							material: new Harmonics({
								activity: 2,
								f0: f0[a],
								f1: f1,
								filter: {bandwidth:1/4,frequency:f1,type:'highpass'},
								mode: 0
							}),
							volume: true
						};
					}
					protocol.start(4);
				}.bind(null,mode+'.'+a++));
				menu('Pitch Training',options,callbacks);
				break;	
			case 15://NH Pitch with Depth
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){},f1:6e3});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [125,250,500,1e3,2e3,4e3,6e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							}),
							//volume: {message:'Set the volume to be soft but audible.'}
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Modulation Frequency Discrimination');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = !debug;
					protocol.settings = [];
					protocol.special = 0;
					var ind = 0, 
						depth = [25,50,100,200,400], 
						f0 = [110,220,440],
						f1 = 9000;
					for (var a = 0; a < f0.length; a++) {
						for (var b = 0; b < depth.length; b++) {
							protocol.settings[ind++] = {
								adaptive: new Adaptive({rule:'exponential',value0:128,valueMax:128}),
								chances: 4,
								material: new Harmonics({
									activity: 2,
									depth: depth[b],
									f0: f0[a],
									f1: f1,
									filter: {bandwidth:1/4,frequency:f1,type:'lowpass'},
									mode: 0
								})
							};
						}
					}
					protocol.start(debug ? 1:3);
				}.bind(null,mode+'.'+a++));
				menu('Normal Hearing Pitch with Depth',options,callbacks);
				break;
			case 16://Andres Modulation Detection
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){},f1:6e3});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [125,250,500,1e3,2e3,4e3,6e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							}),
							//volume: {message:'Set the volume to be soft but audible.'}
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Modulation Detection');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = !debug;
					protocol.settings = [];
					protocol.special = 0;
					var ind = 0,
						f0 = [10,110,220,440], 
						f1 = [6000];
					for (var a = 0; a < f0.length; a++) {
						protocol.settings[ind++] = {
							adaptive: new Adaptive({rule:'exponential',step0:Math.pow(2,1/3),value0:100,valueMax:200}),
							alternatives: 3,
							chances: 3,
							material: new Harmonics({
								activity: 4,
								attack: .02,
								f0: f0[a],
								f1: f1,
								mode: 0,
								release: .02
							})
						};
					}
					protocol.start(debug?1:3);
				}.bind(null,mode+'.'+a++));
				menu('Modulation Detection',options,callbacks); 
				break;
			case 17:
				options.push('Survey: Click me first');
				callbacks.push(function(id){
					window.open("https://usc.qualtrics.com/jfe/form/SV_4Vf0qeVaFVWZDLv", 'Survey');
				}.bind(null,mode+'.'+a++));
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){}});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var f1 = [125,250,500,1e3,2e3,4e3,8e3];
					for (var a = 0; a < f1.length; a++) {
						protocol.settings.push({
							adaptive: new Adaptive({rule:'linear'}),
							alternatives: 3,
							chances: debug?1:3,
							material: new Harmonics({
								activity: 0,
								attack: .02,
								duration: .4,
								f0: 0,
								f1: f1[a],
								mode: 0,
								release: .02,
								roveFreq: 0,
								roveGain: 0
							}),
							//volume: {message:'Set the volume to be soft but audible.'}
						})
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Tonal & Rhythm Comparisons');
				callbacks.push(function(id){
					protocol.activity = 'confronto';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.settings[0] = {};
					protocol.special = 0;
					protocol.start(3);
				}.bind(null,mode+'.'+a++));
				options.push('Melodic Contour Identification');
				callbacks.push(function(id){
					var spacings = [4,2,1];
					protocol.activity = 'musanim';
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					for (var a = 0; a < spacings.length; a++) {
						protocol.settings[a] = {
							material: new Musanim({spacing:spacings[a]})
						};
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('SPIN');
				callbacks.push(function(id){
					protocol.activity = 'spin';
					protocol.ID = id;
					protocol.callback = function(){homework.menu()};
					protocol.random = false;
					protocol.settings = [];
					protocol.settings[0] = {noise:'Off', repeat:false};
					protocol.settings[1] = {noise:'Two Talker Masker (English)', repeat:false, snr:0};
					protocol.settings[2] = {noise:'Two Talker Masker (English)', repeat:false, snr:-5};
					protocol.settings[3] = {noise:'Two Talker Masker (English)', repeat:false, snr:-7.5};
					protocol.settings[4] = {noise:'Two Talker Masker (English)', repeat:false, snr:-10};
					protocol.start();
				}.bind(null,mode+'.'+a++));
				menu('Music and Mindfulness Study',options,callbacks);
				break;
			case 18:
				options.push('Loudness Levels');
				callbacks.push(function(id){
					protocol.ID = id;
					harmonics({init:function(){}});
					gui.loudness();
				}.bind(null,mode+'.'+a++));
				options.push('Pure Tone Detection Thresholds');
				callbacks.push(function(id){
					protocol.activity = 'harmonics';
					protocol.callback = function(){homework.menu()};
					protocol.ID = id;
					protocol.random = false;
					protocol.settings = [];
					protocol.special = 0;
					var ear = ['left','right'], f1 = [250,500,1e3,2e3,3e3,4e3,6e3,8e3];
					for (var a = 0; a < ear.length; a++) {
						for (var b = 0; b < f1.length; b++) {
							protocol.settings.push({
								adaptive: new Adaptive({rule:'linear'}),
								alternatives: 3,
								chances: 3,
								ear: ear[a],
								material: new Harmonics({
									activity: 0,
									attack: .02,
									duration: .4,
									f0: 0,
									f1: f1[a],
									mode: 0,
									release: .02,
									roveFreq: 0,
									roveGain: 0
								}),
								//volume: {message:'Set the volume to be soft but audible.'}
							})
						}
					}
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('SPIN');
				callbacks.push(function(id){
					protocol.activity = 'spin';
					protocol.ID = id;
					protocol.callback = function(){homework.menu()};
					protocol.random = false;
					protocol.settings = [];
					protocol.settings[0] = {noise:'Off', repeat:false};
					protocol.settings[1] = {noise:'Two Talker Masker (English)', repeat:false, snr:10};
					protocol.settings[2] = {noise:'Two Talker Masker (English)', repeat:false, snr:0};
					protocol.settings[3] = {noise:'Two Talker Masker (English)', repeat:false, snr:-5};
					protocol.start();
				}.bind(null,mode+'.'+a++));
				options.push('Dichotic Test');
				callbacks.push(function(id){
					protocol.activity = 'dichotic';
					protocol.ID = id;
					protocol.callback = function(){homework.menu()};
					protocol.random = false;
					protocol.settings = [];
					protocol.start();
				}.bind(null,mode+'.'+a++));
				menu('Dichotic Protocol',options,callbacks);
				break;
			default:
				console.log(mode);
				loadassignment(mode,function(){assignment()});
		}
		function menu(title, options, callbacks, extra) {
			// main (sets up the title bar and back button)
			main = layout.main(title,
				homework.mode!=0 
					? function(){homework.check()} 
					: function(){layout.dashboard()},
				extra
			);
			
			// menu division
			var menu = document.createElement('div');
			
			// build menu (note this part is generic, perhaps move to layout)
			for (var a = 0; a < options.length; a++) {		
				// init menu item
				var item = document.createElement('li');
				item.id = a;
				item.onclick = function () {
					document.getElementById('home').title = 'Return home.';
					callbacks[this.id]();
				};
				
				// icon
				var img = document.createElement('img');
				img.src = 'images/runningman.png';
				img.style.height = '1.5em';
				img.style.paddingRight = '8px';
				
				// title
				var span = document.createElement('span');
				span.innerHTML = options[a];
				span.style.display = 'inline-block';
				
				// anchor
				var anchor = document.createElement('a');
				anchor.id = homework.mode+'.'+String(a+1);
				anchor.appendChild(img);
				anchor.appendChild(span);
				menu.appendChild(item);
				item.appendChild(anchor);
				if(iOS){FastClick(item)}
			}
			jQuery(menu).menu();
			main.appendChild(menu);
			
			// check
			var done = 0;
			for (var a = 0; a < options.length; a++) {
				var id = homework.mode+'.'+String(a+1);
				jQuery.ajax({
					data: {
						protocol: id,
						subuser: subuser.ID
					},
					success: function(data, status) {
						var data = jQuery.parseJSON(data);
						if(data.length!=0){
							var check = document.createElement('img');
							check.src = 'images/check.png';				
							check.style.cssFloat = 'right';
							check.style.height = '1.5em';
							check.style.zindex = 10;
							check.title = options[a];
							document.getElementById(data[0].protocol).appendChild(check);
							done++;
							if(done==options.length){console.log('all done')}
						}
					},
					type: 'GET',
					url: 'version/'+version+'/php/protocol.php'
				});
			}
			layout.footer();
		}
	}
};