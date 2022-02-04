subuser = user;
function something(settings) {
	activity = new Clinic();	
	//
	loadscript('main',() => {
		activity.menu();
	});
}
function Clinic(settings) {
	this.ID = 'clinic';
	
	// overrides
	for (let key in settings) { this[key] = settings[key]; }
}
Clinic.prototype.menu = function () {
	let that = this;
	
	//
	document.body.innerHTML = '';
	
	//
	layout.header(function(){that.menu();});
	
	// main
	var main = layout.main(
		'Random Playlist',
		false//{ 	Results: function () { that.results(); }}
	);
	
	// // audiometric thresholds
	// var button = document.createElement('button');
	// button.className = 'response';
	// button.innerHTML = 'Pure Tone Thresholds';
	// button.onclick = () => {
	// 	protocol.activity = 'detection';
	// 	protocol.random = false;
	// 	protocol.settings = [];
	// 	const ear = ['Both'], frequency = [250,500,750,1e3,1500,2e3,3e3,4e3,6e3];
	// 	let	i = 0;
	// 	for (let a = 0; a < ear.length; a++) {
	// 		for (let b = 0; b < frequency.length; b++) {
	// 			protocol.settings.push({
	// 				ear: ear[a],
	// 				frequency: frequency[b],
	// 			});
	// 		}
	// 	}
	// 	protocol.start();
	// };
	// button.style.fontSize = '150%';
	// button.style.height = '50%';
	// button.style.left = '7%';
	// button.style.position = 'absolute';
	// button.style.top = '30%';
	// button.style.width = '24%';
	// var img = document.createElement('img');
	// img.src = 'images/equalizer.png';
	// img.style.height = '60%';
	// jQuery(button).button();
	// button.appendChild(img);
	// main.appendChild(button);
	// if(iOS){FastClick(button)}
	
	// // Speech Test
	// var button = document.createElement('button');
	// button.className = 'response';
	// button.innerHTML = 'Speech Reception';
	// button.onclick = function () { 
	// 	protocol.activity = 'crisp';
	// 	protocol.random = false;
	// 	protocol.settings = [];
	// 	const ear = ['Left','Right'], noise = ['Off','Speech-Shaped Noise'];
	// 	for (let a = 0; a < ear.length; a++) {
	// 		for (let b = 0; b < noise.length; b++) {
	// 			var adaptive = (a == 0) ? new Adaptive({value0:0}) : new Adaptive({value0:12});
	// 			var	processor = new Processor;
	// 			processor.masterGain.gain.value = dbi(-dsp.calibrate(500,-65-7));
	// 			protocol.settings.push({
	// 				adaptive: adaptive,
	// 				back: () => { that.menu(); },
	// 				behavior: 'Adaptive',
	// 				chances: 3,
	// 				ear: ear[a],
	// 				lastchance: false,
	// 				noise: noise[b],
	// 				processor: processor,
	// 				trials: Infinity
	// 			});
	// 		}
	// 	}
	// 	protocol.start();
	// };
	// button.style.fontSize = '150%';
	// button.style.height = '50%';
	// button.style.left = '38%';
	// button.style.position = 'absolute';
	// button.style.top = '30%';
	// button.style.width = '24%';
	// var img = document.createElement('img');
	// img.src = 'images/speech.png';
	// img.style.height = '60%';
	// jQuery(button).button();
	// button.appendChild(img);
	// main.appendChild(button);
	// if(iOS){FastClick(button);}
	
	// // Pitch Test
	// var button = document.createElement('button');
	// button.className = 'response';
	// button.innerHTML = 'Pitch Resolution';
	// button.onclick = function () { 
	// 	protocol.activity = 'harmonics';
	// 	protocol.random = false;
	// 	protocol.settings = [];
	// 	const ear = ['Left','Right'];
	// 	for (let a = 0; a < ear.length; a++) {
	// 		protocol.settings.push({
	// 			back: () => { that.menu(); },
	// 			chances: 3,
	// 			ear: ear[a],
	// 			material: new Harmonics({
	// 				activity: 1,
	// 				duration: .4,
	// 				f0: 0,
	// 				f1: 1000,
	// 				gain: -dsp.calibrate(1000,-50),
	// 				mode: 0,
	// 				title: 'Frequency Discrimination'
	// 			})
	// 		});
	// 	}
	// 	protocol.start();
	// };
	// button.style.fontSize = '150%';
	// button.style.height = '50%';
	// button.style.right = '7%';
	// button.style.position = 'absolute';
	// button.style.top = '30%';
	// button.style.width = '24%';
	// var img = document.createElement('img');
	// img.src = 'images/musanim.png';
	// img.style.height = '60%';
	// jQuery(button).button();
	// button.appendChild(img);
	// main.appendChild(button);
	// if(iOS){FastClick(button)}
	
	// footer
	layout.footer(user.role!='Client');
};

