function chart(settings) {
	jQuery.ajax({
		data: {
			activity: 5,
			method: 'all'
		},
		success: function(data, status) {
			// parse results
			data = jQuery.parseJSON(data);
			console.dir(data);
			
			//
			ch = new Chart;
			ch.scatter(data);
		},
		type: 'GET',
		url: 'version/'+version+'/php/harmonics.php'
	});
}
function Chart(settings) {
	this.ID = 'chart';
	
	// overrides
	for (var key in settings) { this[key] = settings[key]; }
}
Chart.prototype.accordion = function (data) {
	layout.main();
	
	// accordion (init)	
	var accordion = document.createElement('div');
	accordion.id = 'results';
	main.appendChild(accordion);
	
	// accordion (content)
	for (var a = 0; a < data.length; a++) {
		// heading
		var heading = document.createElement('h3');
		heading.innerHTML = data[a]['subuser']+': '+data[a]['adaptive'];
		accordion.appendChild(heading);
		
		// container
		var container = document.createElement('div');
		accordion.appendChild(container);
		
		// information
		for (var key in data[a]) {
			container.insertAdjacentHTML('beforeend',key+': '+data[a][key]+'<br>');
		}
		container.setAttribute('unselectable','off');
		
		// chart into container
		var chart_div = document.createElement('div');
		chart_div.style.width = '80%';
		container.appendChild(chart_div);
	}

	// accordion (activate)
	jQuery(accordion).accordion({
		active: false,
		collapsible: true,
		heightStyle: 'content'
   });
}
Chart.prototype.scatter = function (data,options) {
	var div = layout.main();
	
	// default options
	if (options === undefined) {
		var options = {
			chartArea: {width:'50%'},
			hAxis: {scaleType:'log',title:'Trial'},
			legend: {position:'none'},
			title: 'Adaptive Series',
			vAxis: {scaleType:'linear',title:'Adaptive Variable'}
		}
	}

	// convert data
	var ch_data = [];
	ch_data[0] = ['x','y'];
	for (var a = 0; a < data.length; a++) {
		if(Number(data[a].adaptive)>10){continue}
		ch_data.push([Number(data[a].f0),Number(data[a].adaptive)]); 
	}

	//
	var chart = new google.visualization.Histogram(div);
	var data = google.visualization.arrayToDataTable(ch_data);
	chart.draw(data,options);
}