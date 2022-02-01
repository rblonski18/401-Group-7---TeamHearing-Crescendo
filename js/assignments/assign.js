function assignment(back) {
	back = back ? back : ()=>{layout.dashboard()};
	
	// main
	let main = layout.main(
		'Assignment',
		() => { back(); },
		{
			Assign: () => {
				assign();
			}
		}
	);
	
	// settings table
	let table = document.createElement('table');
	table.className = 'ui-widget-content';
	table.style.fontSize = '80%';
	table.style.width = '100%';
	main.appendChild(table); 
	let rowIndex = -1;
	
	// assignments	
	let select = layout.select([
		'bel_binaural',
		'bel_emotion',
		'bel_intervals',
		'bel_modulation',
		'bel_pitch',
		'bel_pleasantness',
		'bel_training'
	]);
	select.id = 'assignment';
	layoutTableRow(table, ++rowIndex, 'Assignment:', select, '');
	
	// assign to database
	function assign(assignment) {
		assignment = assignment ? assignment : document.getElementById('assignment').value;
		jQuery.ajax({
			data: {
				assignment: assignment,
				subuser: subuser.ID,
				user: user.ID
			},
			success: function (data, status) { alert(assignment); },
			type: 'POST',
			url: 'version/'+version+'/php/homework.php'
		});
	}
}