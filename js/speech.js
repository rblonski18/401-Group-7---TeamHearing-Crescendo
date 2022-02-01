function speech(settings) {
	activity = new Speech();
	activity.init();
}
function Speech() {
	this.behavior;
	this.calls;
	this.ear;
	this.level;
	this.material;
	this.noise;
	this.notes;
	this.practice;
	this.responses;
	this.score;
}
Speech.prototype.init = function () {
	var that = this;
	
	// main
	var main = layout.main(
		'Speech Scores',
		function () { layout.speech(); },
		{	add: function () {

				// dialog: Add Speech Score
				var dialog = document.createElement('div');
				dialog.id = 'dialog';
				dialog.title = 'Add Speech Score';
					
				// table structure
				var table = document.createElement('table');
				table.style.width = '100%';
				dialog.appendChild(table);
				var rowIndex = 0;
				
				// ear tested
				var select = layout.select([
					'Not Specified',
					'Both',
					'Left',
					'Right'
				]);
				select.id = 'ear';
				layoutTableRow2(table,rowIndex++,select,'(ear)');
				
				// mode
				var select = layout.select([
					'Aided',
					'Unaided'
				]);
				select.id = 'mode';
				layoutTableRow2(table,rowIndex++,select,'(mode)');
				
				// notes
				var input = document.createElement('input');
				input.id = 'notes';
				layoutTableRow2(table,rowIndex++,input,'(notes)');
			
				// material type
				var select = layout.select([
					'Sentences',
					'Words'
				]);
				select.id = 'materialType';
				select.onchange = function () {
					switch (this.selectedIndex) {
						case 0:
							var options = [
								'AZ Bio Sentences',
								'AZ Bio Sentences (pediatric)',
								'Hearing in noise test (HINT)'
							]; break;
						case 1:
							var options = [
								'Word Identification Picture Identification (WIPI)',
								'Phonetically Balanced Kindergarten (PBK)',
								'Lexical Neighborhood test (LNT)',
								'Consonant Nucleus Consonant (CNC)',
								'Northwestern University 6 (NU-6)',
								'CID-W22',
								'Spanish Audiostar Word List'
							];
					}
					
					// change options
					document.getElementById('material').options.length = 0;
					for (var a = 0; a < options.length; a++) {
						document.getElementById('material').options[a] 
							= new Option(options[a]);
					}
					document.getElementById('material').value = options[0];
				};
				layoutTableRow2(table,rowIndex++,select,'(material type)');
				
				// material
				var select = layout.select([
					'AZ Bio Sentences',
					'AZ Bio Sentences (pediatric)',
					'Hearing in noise test (HINT)'
				]);
				select.id = 'material';
				layoutTableRow2(table,rowIndex++,select,'(material)');
			
				// level
				var input = document.createElement('input');
				input.id = 'level';
				layoutTableRow2(table,rowIndex++,input,'(presentation level)');
			
				// snr
				var input = document.createElement('input');
				input.id = 'snr';
				layoutTableRow2(table,rowIndex++,input,'(SNR)');
			
				// score
				var input = document.createElement('input');
				input.id = 'score';
				layoutTableRow2(table,rowIndex++,input,'(percent correct)');
	
				// jQuery dialog
				jQuery(dialog).dialog({
					buttons: {
						Cancel: function () { jQuery(this).dialog('destroy').remove(); },
						Add: function () {
							jQuery.ajax({
								data: {
									ear: 0,
									level: document.getElementById('level').value,
									material: document.getElementById('material').selectedIndex,
									materialType: document.getElementById('materialType').selectedIndex,
									score: document.getElementById('score').value,
									snr: document.getElementById('snr').value,
									subuser: subuser.ID,
									user: user.ID
								},
								success: function (data, status) {
									that.init();
								},
								type: 'POST',
								url: 'version/'+version+'/php/speech.php'
							});
							jQuery(this).dialog('destroy').remove();
						}
					},
					modal: true,
					width: 0.8*jQuery(window).width()
				});
			}
		}
	);
	
	// footer
	layout.footer();
	
	// loading...
	var span = document.createElement('span');
	span.id = 'loading';
	span.innerHTML = 'Loading...';
	main.appendChild(span);
	
	// display results
	setTimeout(function () {
		document.getElementById('main').removeChild(document.getElementById('loading'));
		
		// database GET
		jQuery.ajax({
			async: false,
			data: {
				password: user.password,
				subuser: (subuser) ? subuser.ID : 72,
				user: (user) ? user.ID : 72
			},
			success: function(data, status) {
				results = jQuery.parseJSON(data);
				results.sort(compare);
				//results.reverse();
			},
			type: 'GET',
			url: 'version/'+version+'/php/speech.php'
		});
	
		// no results
		if (results.length == 0) {
			main.insertAdjacentHTML('beforeend','No results.');
			return;
		}
	
		// summary chart (initialize)
		var resultsSorted = [];
		var summary = document.createElement('div');
		summary.style.height = '50%';
		main.appendChild(summary);
	
		// details
		main.insertAdjacentHTML('beforeend','<h3>Details</h3>');
	
		// horizontal rule
		main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');
	
		// accordion (initialize)	
		var accordion = document.createElement('div');
		accordion.id = 'results';
		main.appendChild(accordion);
		
		// scaleType
		var scaleType = ('adaptive' in that && 'rule' in that.adaptive)
			? that.adaptive.rule
			: 'linear';
	
		// accordion (content)
		for (var item = 0, items = results.length; item < items; item++) {
			var result = results[item],
				score = result.score;

			/* // calculate adaptive variable and score
			var series = result.series.split(',');
			var adaptive = Number(series[series.length - 1]);
			result.adaptive = adaptive; */
			/* 
			var score;
			try {
				score = percentCorrect(result.calls.split(','),result.responses.split(','));
				score.toFixed(2);
			} catch (err) {
				try {
					score = result.score;
				} catch (err) {
					score = undefined;
				}
			} */
				
			
			// heading
			var heading = document.createElement('h3');
			heading.innerHTML = result.entry + ' &rarr; ' + score + '%';
			accordion.appendChild(heading);
		
			// container
			var container = document.createElement('div');
			accordion.appendChild(container);

			// information
			for (var key in result) {
				container.insertAdjacentHTML('beforeend', key + ': ' + result[key] + '<br>');
			}
			container.setAttribute('unselectable','off');
		
			// chart for adaptive variable
			if (false) {
		
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
				resultsSorted.push([snr, score]);
				//resultsSorted.push([Math.min(Number(series[series.length-1]),30), score]);
			} else {
				// sort results for summary plot
				resultsSorted.push([Number(result.snr), Number(result.score)]);
			}
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
			data[0] = ['SNR','material'];
			for (var a = 0; a < resultsSorted.length; a++) {
				data.push(resultsSorted[a]);
			}
			var data = google.visualization.arrayToDataTable(data);
			var options = {
				chartArea: {width: '70%'},
				//hAxis: {maxV ticks: [-48, -42, -36, -30, -24, -18, -12, -6, 0, 6, 12, 18, 24, {v:30, f:"Quiet"}], title: 'Speech Level'},
				hAxis: {scaleType: scaleType},
				title: 'Speech Comprehension Scores',
				vAxis: {maxValue: 100, minValue: 0, title: 'Percent Correct'}
			};
			var chart = new google.visualization.ScatterChart(summary);
			chart.draw(data, options);
		}
	}, 50);
};