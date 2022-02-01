function chat(settings) {
	// main
	var main = layout.main('Chat Room', function () { layout.init(); });
	
	// chat dialog
	var textarea = document.createElement('div');
	textarea.id = 'chatroom';
	textarea.scrollLeft = 0;
	textarea.style.height = '70%';
	textarea.style.resize = 'none';
	textarea.style.overflow = 'scroll';
	textarea.style.overflowX = 'hidden';
	textarea.style.width = '100%';
	main.appendChild(textarea);
	
	// chat input
	var textarea = document.createElement('textarea');
	textarea.id = 'chat';
	textarea.onkeyup = function(e) {
		if (e.keyCode == 13) {
			console.dir(this.value.length);
			if(this.value.length==1){this.value='';return;};
			jQuery.ajax({
				data: {
					message: document.getElementById('chat').value,
					user: user.ID
				},
				success: function(data, status) {},
				type: 'POST',
				url: 'version/'+version+'/php/chat.php'
			});
			this.value = '';
		}
	};
	textarea.rows = 1;
	textarea.style.fontSize = 'larger';
	textarea.style.resize = 'none';
	textarea.style.overflow = 'hidden';
	textarea.style.width = '100%';
	main.appendChild(textarea);
	
	//
	var lastID = 0;
	var intervalID = setInterval(function () {
		jQuery.ajax({
			data: {
				lastID: lastID
			},
			success: function(data, status) {
				try {
					data = jQuery.parseJSON(data);
					if (data.length > 0) {
						for (var a = 0; a < data.length; a++) {
							document.getElementById('chatroom').innerHTML += data[a].message;
							document.getElementById('chatroom').appendChild(document.createElement('br'));
						}
						lastID = data[data.length-1].ID;
					}
					var element = document.getElementById('chatroom');
					element.scrollTop = element.scrollHeight;
				} catch (error) {
					clearInterval(intervalID);
				}
			},
			type: 'GET',
			url: 'version/'+version+'/php/chat.php'
		});
	}, 1e3);
}