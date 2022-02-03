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
		'Sasoun changed this from github',
		false//{ 	Results: function () { that.results(); }}
	);
	
	// audiometric thresholds
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Pure Tone Thresholds';
	button.onclick = () => {
		protocol.activity = 'detection';
		protocol.random = false;
		protocol.settings = [];
		const ear = ['Both'], frequency = [250,500,750,1e3,1500,2e3,3e3,4e3,6e3];
		let	i = 0;
		for (let a = 0; a < ear.length; a++) {
			for (let b = 0; b < frequency.length; b++) {
				protocol.settings.push({
					ear: ear[a],
					frequency: frequency[b],
				});
			}
		}
		protocol.start();
	};
	button.style.fontSize = '150%';
	button.style.height = '50%';
	button.style.left = '7%';
	button.style.position = 'absolute';
	button.style.top = '30%';
	button.style.width = '24%';
	var img = document.createElement('img');
	img.src = 'images/equalizer.png';
	img.style.height = '60%';
	jQuery(button).button();
	button.appendChild(img);
	main.appendChild(button);
	if(iOS){FastClick(button)}
	
	// Speech Test
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Speech Reception';
	button.onclick = function () { 
		protocol.activity = 'crisp';
		protocol.random = false;
		protocol.settings = [];
		const ear = ['Left','Right'], noise = ['Off','Speech-Shaped Noise'];
		for (let a = 0; a < ear.length; a++) {
			for (let b = 0; b < noise.length; b++) {
				var adaptive = (a == 0) ? new Adaptive({value0:0}) : new Adaptive({value0:12});
				var	processor = new Processor;
				processor.masterGain.gain.value = dbi(-dsp.calibrate(500,-65-7));
				protocol.settings.push({
					adaptive: adaptive,
					back: () => { that.menu(); },
					behavior: 'Adaptive',
					chances: 3,
					ear: ear[a],
					lastchance: false,
					noise: noise[b],
					processor: processor,
					trials: Infinity
				});
			}
		}
		protocol.start();
	};
	button.style.fontSize = '150%';
	button.style.height = '50%';
	button.style.left = '38%';
	button.style.position = 'absolute';
	button.style.top = '30%';
	button.style.width = '24%';
	var img = document.createElement('img');
	img.src = 'images/speech.png';
	img.style.height = '60%';
	jQuery(button).button();
	button.appendChild(img);
	main.appendChild(button);
	if(iOS){FastClick(button);}
	
	// Pitch Test
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Pitch Resolution';
	button.onclick = function () { 
		protocol.activity = 'harmonics';
		protocol.random = false;
		protocol.settings = [];
		const ear = ['Left','Right'];
		for (let a = 0; a < ear.length; a++) {
			protocol.settings.push({
				back: () => { that.menu(); },
				chances: 3,
				ear: ear[a],
				material: new Harmonics({
					activity: 1,
					duration: .4,
					f0: 0,
					f1: 1000,
					gain: -dsp.calibrate(1000,-50),
					mode: 0,
					title: 'Frequency Discrimination'
				})
			});
		}
		protocol.start();
	};
	button.style.fontSize = '150%';
	button.style.height = '50%';
	button.style.right = '7%';
	button.style.position = 'absolute';
	button.style.top = '30%';
	button.style.width = '24%';
	var img = document.createElement('img');
	img.src = 'images/musanim.png';
	img.style.height = '60%';
	jQuery(button).button();
	button.appendChild(img);
	main.appendChild(button);
	if(iOS){FastClick(button)}
	
	// footer
	layout.footer(user.role!='Client');
};
Clinic.prototype.results = function () {
	var that = this;
	
	// main
	var main = layout.main('Results',()=>{that.menu()});
	
	// footer
	layout.footer();
	
	// loading...
	var span = document.createElement('span');
	span.id = 'loading';
	span.innerHTML = 'Loading...';
	main.appendChild(span);

	// database GET
	jQuery.ajax({
		data: {
			password: user.password,
			subuser: subuser ? subuser.ID : 72,
			user: user ? user.ID : 72
		},
		success: function(data, status) {
			// remove the loading child
			document.getElementById('main').removeChild(document.getElementById('loading'));
			
			// parse results
			results = jQuery.parseJSON(data);
			results.sort(compare);
			//results.reverse();
			
			// no results
			if (results.length == 0) {
				main.insertAdjacentHTML('beforeend','No results.');
				return;
			}
			
			// summary chart (init)
			var resultsSorted = [];
			var summary = document.createElement('div');
			summary.style.height = '50%';
			main.appendChild(summary);
	
			// details
			main.insertAdjacentHTML('beforeend','<h3>History</h3>');
		
			// horizontal rule
			main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');
	
			// accordion (init)	
			var accordion = document.createElement('div');
			accordion.id = 'results';
			main.appendChild(accordion);
		
			// scaleType
			var scaleType = 'log';
				
			// accordion (content)
			for (var item = 0, items = results.length; item < items; item++) {
				var result = results[item];
				
				// calculate adaptive variable and score
				var series = result.series.split(',');
				var adaptive = Number(series[series.length-1]);//last value
				result.adaptive = adaptive;
				
				// score
				var score;
				try {
					score = percentCorrect(result.calls.split(','),result.responses.split(','));
					score = Number(score.toFixed(1));
				} catch (err) {
					try {
						score = result.score;
					} catch (err) {
						score = undefined;
					}
				}
					
				// heading
				var heading = document.createElement('h3');
				heading.innerHTML = result.entry+' &rarr; '+score+'% at '+adaptive;
				accordion.appendChild(heading);
				
				// container
				var container = document.createElement('div');
				accordion.appendChild(container);
				
				// information
				for (var key in result) {
					container.insertAdjacentHTML('beforeend',key+': '+result[key]+'<br>');
				}
				container.setAttribute('unselectable','off');
				
				// chart into container
				var chart_div = document.createElement('div');
				chart_div.style.width = '80%';
				container.appendChild(chart_div);
			
				// data
				var data = [];
				data[0] = ['Trial','Adaptive Variable'];
				var series = result.series.split(',');
				for (var a = 1; a <= series.length; a++) {
					data[a] = [a, Number(series[a-1])];
				}
			
				// adaptive variable versus trial
				var chart = new google.visualization.LineChart(chart_div),
					data = google.visualization.arrayToDataTable(data),
					options = {
						chartArea: {height: '50%', width: '70%'},
						hAxis: {title: 'Trial'},
						title: 'Adaptive Series',
						vAxis: {scaleType: scaleType, title: 'Adaptive Variable'}
				};
				chart.draw(data, options);
			
				// sort results for summary plot
				resultsSorted.push([Number(adaptive), score]);
				//resultsSorted.push([result.spacing, score]);
				//resultsSorted.push([Math.min(Number(series[series.length-1]),30), score]);
			}
	
			// accordion (activate)
			jQuery(accordion).accordion({
				active: false,
				collapsible: true,
				heightStyle: 'content'
		   });
		
			// summary chart
			if ('material' in that && 'summaryChart' in that.material) {
				that.material.summaryChart(resultsSorted,summary);
			} else {
				var data = [];
				data[0] = ['something','my-title'];
				for (var a = 0; a < resultsSorted.length; a++) {
					data.push(resultsSorted[a]);
				}
				var data = google.visualization.arrayToDataTable(data);
				var options = {
					chartArea: {width: '70%'},
					//hAxis: {maxV ticks: [-48, -42, -36, -30, -24, -18, -12, -6, 0, 6, 12, 18, 24, {v:30, f:"Quiet"}], title: 'Speech Level'},
					hAxis: {scaleType: scaleType},
					title: 'title',
					vAxis: {maxValue: 100, minValue: 0, title: 'Percent Correct'}
				};
				var chart = new google.visualization.ScatterChart(summary);
				chart.draw(data, options);
			}
		},
		type: 'GET',
		url: 'version/'+version+'/php/gabor.php'
	});
};
