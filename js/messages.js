var messages;

// Create
function messagesCreateUI(r){
	recipient = r;
	if (recipient === undefined) {messagesChangeRecipient();} else {messagesNewMessage();}
}
function messagesCreate(){
	jQuery.ajax({
		data: {
			message: jQuery("#p1").val(),
			recipient: recipient,
			sender: user.ID
		},
		success: function(data, status) { console.log(data); messagesRead(); },
		type: 'POST',
		url: 'version/'+version+'/php/messages.php'
		
	});
	jQuery('#dialog').dialog('destroy').remove();
}

// Read
function messagesRead(){
	jQuery.ajax({
		data: {
			user: user.ID
		},
		success: function(data, status) {			
			messages = jQuery.parseJSON(data).sort(compare);
			messagesReadUI();
		},
		type: 'GET',
		url: 'version/'+version+'/php/messages.php'
	});
}
function messagesReadUI(){
	// recipients
	var recipients = [], result = {};
	for(var i = 0; i < messages.length; ++i) {
		var value = messages[i].recipient;
		result[(typeof value) + ' ' + value] = value;
	}
	for(ID in result) {if(result.hasOwnProperty(ID)) {recipients.push(result[ID]);}}
	recipients.sort();
	
	// senders
	var senders = [], result = {};
	for(var i = 0; i < messages.length; ++i) {
		var value = messages[i].sender;
		result[(typeof value) + ' ' + value] = value;
	}
	for(ID in result) {if(result.hasOwnProperty(ID)) {senders.push(result[ID]);}}
	senders.sort();
	
	// correspondents
	correspondents = arrayUnique(senders.concat(recipients));
	correspondents = removeWord(correspondents,user.ID);
	
	// sort messages by correspondents
	var conversations = [];
	jQuery.each(correspondents,function(index,correspondent){conversations[index]=[];});
	jQuery.each(messages, function(index, message) {
		if (correspondents.indexOf(message.sender) == -1) {
			conversations[correspondents.indexOf(message.recipient)].push(message);
		} else {
			conversations[correspondents.indexOf(message.sender)].push(message);
		}
	});
	
	// main
	var main = layout.main('Messages',
		function () { layout.dashboard(); },
		{ Message: function() { messagesCreateUI(); } },
		['images/icon-mail.png']
	);
	
	// accordion: messages
	var accordion = document.createElement('div');
	jQuery.each(conversations, function (index, conversation) {
		var heading = document.createElement('h3');
		heading.innerHTML = (conversation[0].sender === user.ID) 
			? conversation[0].recipientname
			: conversation[0].sendername;
		var r = (conversation[0].sender === user.ID) 
			? conversation[0].recipient
			: conversation[0].sender;
		jQuery(accordion).append(heading);
		var content = document.createElement('div');
		jQuery(accordion).append(content);
		var messages = document.createElement('ul');
		jQuery(content).append(messages);
		jQuery.each(conversation, function (index2, message) {
			var item = document.createElement('li');
			item.innerHTML = message.message;
			if (message.sender === user.ID) {
				recipient = message.recipient;
				item.style.color = 'blue';
				item.style.listStyleType = 'none';
				item.style.textAlign = 'right';
			} else {
				recipient = message.sender;
				item.style.listStyleType = 'none';
				item.style.textAlign = 'left';
			}
			jQuery(messages).append(item);
		});
		
		// reply button
		var button = document.createElement('button');
		button.innerHTML = 'reply';
		button.onclick = function () { messagesCreateUI(r); };
		jQuery(button).button();
		jQuery(content).append(button);
	});
	main.appendChild(accordion);
	jQuery(accordion).accordion({
		active: false,
		collapsible: true,
		heightStyle: 'content'
    });
}

// Update
function messagesUpdateUI(index){
	html = "<div id='dialog' title='Change Message'>"
		+"<input id='p1' type='text' value='"+messages[index].sendername+"'> (sender)<br>"
		+"<input id='p2' type='text' value='"+messages[index].recipientname+"'> (recipient)<br>"
		+"<input id='p3' type='text' value='"+messages[index].message+"'> (message)<br>"
		+"<button onclick='messagesCancel()'>Cancel</button>"
		+"<button onclick='messagesUpdate("+index+")'>Update</button>"
		+"</div>";
	createDialog(html);
}
function messagesUpdate(index){
	var proceed = true;//confirm("Update: "+messages[index].ID+"?");
	if (proceed) {
		jQuery.ajax({
			data: {
				caller: user.id,
				id: messages[index].id,
				sender: jQuery("#p1").val(),
				recipient: jQuery("#p2").val(),
				message: jQuery("#p3").val()
			},
			success: function(data, status) { messagesReadUI(); },
			type: 'PUT',
			url: 'version/'+version+'/php/messages.php'
		});
	}	
	$("#dialog").dialog('destroy').remove();
}

// Delete
function messagesDelete(index){
	var proceed = true;//confirm("Delete: "+messages[index].id+"?");
	if (proceed) {
		jQuery.ajax({
			data: {
				caller: user.id,
				id: messages[index].id
			},
			success: function(data, status) {},
			type: 'DELETE',
			url: 'version/'+version+'/php/messages.php'
		});
	}
	messagesReadUI();
}

// Utilities
function messagesCancel(){
	jQuery("#dialog").dialog('destroy').remove();
}
function messagesChangeRecipient(){
	// dialog (Select Recipient)
	var dialog = document.createElement('div');
	dialog.id = 'dialog';
	dialog.title = 'Select Recipient';
	document.body.appendChild(dialog);
	
	// select recipient
	var select = document.createElement('select');
	select.id = 'recipient';
	var option = document.createElement('option');
	option.innerHTML = 'loading...';
	select.appendChild(option);
	dialog.appendChild(select);

	// dialog
	jQuery(dialog).dialog({
		buttons: {
			Cancel: function() { jQuery(this).dialog('destroy').remove(); },
			Okay: function() { jQuery(this).dialog('destroy').remove(); messagesNewMessage(); }
		},
		modal: true,
		width: 'auto'
	});
	
	// team user names
	jQuery.ajax({
		data: {
			method: 'notClients',
			password: undefined,
			subuser: subuser.username,
			user: user.username
		},
		success: function (data, status) {
			console.log(data);
			var data = jQuery.parseJSON(data).sort(compareF);
			var select = document.getElementById('recipient');
			select.options[0] = null;
			for (var a = 0; a < data.length; a++) {
				var option = document.createElement('option');
				option.index = a;
				option.innerHTML = data[a].firstname + ' ' + data[a].lastname;
				option.value = data[a];
				select.appendChild(option);
			}
			if (user.ID == 1) {
				var option = document.createElement('option');
				option.index = a;
				option.innerHTML = 'Everybody';
				option.value = 'Everybody';
				select.appendChild(option);
			}
			recipient = data[0].ID;
			select.onchange = function() {
				if (this.selectedIndex < data.length) {
					recipient = data[this.selectedIndex].ID;
				} else {
					recipient = 0;
				}
			};
		},
		type: 'GET',
		url: 'version/'+version+'/php/profiles.php'
	});
}
function messagesNewMessage(){
	// dialog (New Message)
	var dialog = document.createElement('div');
	dialog.title = 'New Message';
	
	// text area
	var textarea = document.createElement('textarea');
	textarea.id = 'p1';
	textarea.rows = 4;
	textarea.style.width = '100%';
	dialog.appendChild(textarea);

	// dialog
	jQuery(dialog).dialog({
		buttons: {
			Cancel: function () { jQuery(this).dialog('destroy').remove(); },
			Send: function () {
				messagesCreate();
				jQuery(this).dialog('destroy').remove();
			}
		},
		modal: true,
		width: 0.8*jQuery(window).width()
	});
}

function arrayUnique(array){
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--,1);
        }
    }
    return a;
}
function removeWord(array,word){
	for (var i=array.length-1; i>=0; i--) {
		if (array[i] === word) {
			array.splice(i, 1);
			break;// comment out if multiple instances of search word
		}
	}
	return array;
}