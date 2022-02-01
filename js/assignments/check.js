function assignment() {
	jQuery.ajax({
		data: {
			subuser: subuser.ID,
			user: user.ID
		},
		success: function (data, status) {
			data = jQuery.parseJSON(data);
			const assignment = data.length == 0 || subuser.ID != user.ID ? 'menu' : data[0].assignment;
			console.log(assignment);
			loadassignment(assignment);
		},
		type: 'GET',
		url: 'version/'+version+'/php/homework.php'
	});	
}