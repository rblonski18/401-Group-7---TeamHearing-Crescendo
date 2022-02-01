/*jQuery.ajax({
	data: {
		password: CryptoJS.MD5('yo').toString(),
		subuser: 3,
		user: 2
	},
	success: function(data,status){console.log(data);},
	type: 'PUT',
	url: 'version/'+version+'/php/profiles.php'
});*/
function audiologic(){
	// main
	var main = layout.main('Audiological Information', ()=>{layout.menu()});

	// tabs
	jQuery(main).append("<div id='client'></div>");
	html = 
		"<ul>"
			+"<li style='font-size:100%' onclick='devices()'><a href='#Devices'>Devices</a></li>"
			+"<li style='font-size:100%' onclick='files()'><a href='#Files'>Files</a></li>"
			+"<li style='font-size:100%' onclick='notes()'><a href='#Notes'>Notes</a></li>"
			+"<li style='font-size:100%' onclick='permissions()'><a href='#Permissions'>Permissions</a></li>"
			+"<li style='font-size:100%' onclick='profile()'><a href='#Profile'>Profile</a></li>"
		+"</ul>"
		+"<div id='Devices'></div>"
		+"<div id='Files'></div>"
		+"<div id='Notes'></div>"
		+"<div id='Permissions'></div>"
		+"<div id='Profile'></div>"
	jQuery('#client').append(html);
	jQuery('#client').tabs({active:4});
	
	//
	profile();
}	
function devices(){
	// initialize division
	var div = document.getElementById('Devices');
	div.innerHTML = '';
	
	// heading
	var heading = document.createElement('h2');
	heading.innerHTML = 'Devices';
	heading.style.display = 'inline-block';
	div.appendChild(heading);
	
	// dialog used to create and update
	var Dialog = function (data) {
		
		// initialize dialog
		var dialog = document.createElement('div');
		
		// settings table
		var table = document.createElement('table');
		table.style.width = '100%';
		dialog.appendChild(table);
		var index = 0;
		
		// ear
		var row = table.insertRow(index++);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'Ear:';
		cell.style.textAlign = 'right';
		cell.style.width = '30%';
		var cell = row.insertCell(1);
		cell.style.width = '50%';
		var select = layout.select(['Left','Right']);
		select.id = 'ear';
		select.value = (typeof data !== 'undefined' && 'ear' in data)
			? data.ear
			: 'Left';
		cell.appendChild(select);
		var cell = row.insertCell(2);
		cell.style.width = '20%';
		
		// device
		var row = table.insertRow(index++);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'Device type:';
		cell.style.textAlign = 'right';
		cell.style.width = '30%';
		var cell = row.insertCell(1);
		cell.style.width = '50%';
		var select = layout.select(['Cochlear Implant','Hearing Aid','Other']);
		select.id = 'device';
		select.onchange = function () {
			// CI & HA options
			var options = (this.value == 'Cochlear Implant')
				?	['Advanced Bionics','Cochlear','MED-EL','Other']
				:	['Beltone','Phonak','Siemens','Starkey','Other'];
			
			// update options
			document.getElementById('manufacturer').options.length = 0;
			for (var a = 0; a < options.length; a++) {
				document.getElementById('manufacturer').options[a] = new Option(options[a]);
			}
			document.getElementById('manufacturer').value = options[0];
		};
		select.value = (typeof data !== 'undefined' && 'device' in data)
			? data.device
			: 'Cochlear Implant';
		cell.appendChild(select);
		var cell = row.insertCell(2);
		cell.style.width = '20%';
		
		// manufacturer
		var row = table.insertRow(index++);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'Manufacturer:';
		cell.style.textAlign = 'right';
		cell.style.width = '30%';
		var cell = row.insertCell(1);
		cell.style.width = '50%';
		var options = (typeof data == 'undefined' || data.device == 'Cochlear Implant')
				?	['Advanced Bionics','Cochlear','MED-EL','Other']
				:	['Beltone','Phonak','Siemens','Starkey','Other'];
		var select = layout.select(options);
		select.id = 'manufacturer';
		select.value = (typeof data !== 'undefined' && 'manufacturer' in data)
			? data.manufacturer
			: 'Advanced Bionics';
		cell.appendChild(select);
		var cell = row.insertCell(2);
		cell.style.width = '20%';
		
		/* model
		var row = table.insertRow(index++);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'Model:';
		cell.style.textAlign = 'right';
		cell.style.width = '30%';
		var cell = row.insertCell(1);
		cell.style.width = '50%';
		var options;
		var manufacturer = (typeof data !== 'undefined' && 'manufacturer' in data)
			? data.manufacturer
			: 'unknown';
		switch (manufacturer) {
			case 'Advanced Bionics':
				options = ['1','2','3']; break;
			case 'Cochlear':
				options = ['4','5','6']; break;
			default: options = ['?'];console.log(manufacturer);
		}
		var select = layout.select(options);
		select.id = 'model';
		select.value = (typeof data !== 'undefined' && 'model' in data)
			? data.model
			: '?';
		cell.appendChild(select);
		var cell = row.insertCell(2);
		cell.style.width = '20%';*/
		
		// activation date
		var row = table.insertRow(index++);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'Activation date:';
		cell.style.textAlign = 'right';
		cell.style.width = '30%';
		var cell = row.insertCell(1);
		cell.style.width = '50%';
		var input = layout.input();
		input.id = 'activation';
		input.value = (typeof data !== 'undefined' && 'activation' in data)
			? data.activation
			: null;
		cell.appendChild(input);
		var cell = row.insertCell(2);
		cell.style.width = '20%';
		
		// notes
		var row = table.insertRow(index++);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'Notes:';
		cell.style.textAlign = 'right';
		cell.style.width = '30%';
		var cell = row.insertCell(1);
		cell.style.width = '50%';
		var input = layout.input();
		input.id = 'notes';
		input.value = (typeof data !== 'undefined' && 'notes' in data)
			? data.notes
			: null;
		cell.appendChild(input);
		var cell = row.insertCell(2);
		cell.style.width = '20%';
		
		return dialog;
	}
	
	// device icon
	var image = document.createElement('img');
	image.onclick = function () {	
		// initialize dialog
		var dialog = Dialog();
		dialog.title = 'Add Device';
		
		// jQueryUI
		jQuery(dialog).dialog({
			buttons: {
				Cancel: function () { jQuery(this).dialog('destroy').remove(); },
				Add: function () {
					jQuery.ajax({
						data: {
							activation: jQuery('#activation').val(),
							device: jQuery('#device').val(),
							ear: jQuery('#ear').val(),
							manufacturer: jQuery('#manufacturer').val(),
							model: undefined,
							notes: jQuery('#notes').val(),
							status: 'Active',
							subuser: subuser.ID,
							user: user.ID
						},
						success: function (data, status) { devices(); },
						type: 'POST',
						url: 'version/'+version+'/php/devices.php'
					});
					jQuery(this).dialog('destroy').remove();
				}
			},
			modal: true,
			width: windowwidth < 4 ? jQuery(window).width() : .8*jQuery(window).width()
		});
		
		// jQueryUI
		if (widgetUI) {
			jQuery('#ear').selectmenu({change: jQuery('#ear').onchange});
			jQuery('#device').selectmenu({change: jQuery('#device').onchange});
			jQuery('#manufacturer').selectmenu({change: jQuery('#manufacturer').onchange});
			jQuery('#activation').datepicker('setDate', new Date());
		}
		jQuery('#activation').datepicker({
			changeYear: true,
			dateFormat: 'yy-mm-dd', 
			yearRange: '-40:+0'
		});
	};
	image.src = 'images/hearingaid.gif';
	image.style.float = 'right';
	image.style.height = jQuery(heading).outerHeight(true)+'px';
	image.style.padding = '2px';
	image.title = 'add device';
	jQuery(image).button();
	div.appendChild(image);
	
	// horizontal rule
	div.insertAdjacentHTML('beforeend','<br><hr class=\'ui-widget-header\'>');
	
	// data division
	var accordion = document.createElement('div');
	accordion.id = 'accordion';
	div.appendChild(accordion);
	
	// query database
	jQuery.ajax({
		data: {
			subuser: subuser.ID,
			user: user.ID
		},
		success: function(data, status) {
			var data = jQuery.parseJSON(data);
			for (var a = 0; a < data.length; a++) {
				// heading
				var heading = document.createElement('h3');
				heading.innerHTML = data[a].device;
				accordion.appendChild(heading);
				
				// container
				var container = document.createElement('div');
				container.innerHTML = '<b>details</b><br>';
				accordion.appendChild(container);
				
				// database information
				for (var key in data[a]) {
					container.insertAdjacentHTML('beforeend',key+': '+data[a][key]+'<br>');
				}
							
				// update button
				var button = document.createElement('button');
				button.index = a;
				button.innerHTML = 'update';
				button.onclick = function () {
					var index = this.index;
					var dialog = Dialog(data[index]);
					dialog.title = 'Update Device';
					
					// jQueryUI
					jQuery(dialog).dialog({
						buttons: {
							Cancel: function () {
								jQuery(this).dialog('destroy').remove();
							},
							Update: function () {
								mydata = {
									ID: data[index].ID,
									activation: jQuery('#activation').val(),
									device: jQuery('#device').val(),
									ear: jQuery('#ear').val(),
									manufacturer: jQuery('#manufacturer').val(),
									model: '',
									notes: '',
									status: 'Active',
									subuser: subuser.ID,
									user: user.ID
								};
								console.log(mydata);
								jQuery.ajax({
									data: {
										ID: data[index].ID,
										activation: jQuery('#activation').val(),
										device: jQuery('#device').val(),
										ear: jQuery('#ear').val(),
										manufacturer: jQuery('#manufacturer').val(),
										model: '',
										notes: '',
										status: 'Active',
										subuser: subuser.ID,
										user: user.ID
									},
									success: function(data, status) { devices(); },
									type: 'PUT',
									url: 'version/'+version+'/php/devices.php'
								});
								jQuery(this).dialog('destroy').remove();
							}
						},
						modal: true,
						width: windowwidth < 4 ? jQuery(window).width() : .8*jQuery(window).width()
					});
					
					// jQueryUI
					if (widgetUI) {
						jQuery('#ear').selectmenu({change: jQuery('#ear').onchange});
						jQuery('#device').selectmenu({change: jQuery('#device').onchange});
						jQuery('#manufacturer').selectmenu({change: jQuery('#manufacturer').onchange});
						jQuery('#activation').datepicker({
							changeYear: true,
							dateFormat: 'yy-mm-dd', 
							yearRange: '-40:+0'
						});
						jQuery('#activation').datepicker('setDate', new Date());
					}
				};
				jQuery(button).button();
				container.appendChild(button);
				
				// delete button
				var button = document.createElement('button');
				button.index = a;
				button.innerHTML = 'delete';
				button.onclick = function () {
					var confirm = document.createElement('div');
					confirm.index = this.index;
					confirm.title = 'Delete Device Information?';
					confirm.innerHTML = 
						"<p><span class='ui-icon ui-icon-alert' style='float:left; margin:0 7px 20px 0;'>"
						+"</span>This item will be deleted and cannot be recovered. Are you sure?</p>";
					jQuery(confirm).dialog({
						buttons:{
							Cancel:function(){jQuery(this).dialog('destroy').remove();},
							Delete:function(){
								jQuery.ajax({
									data:{
										ID:data[this.index].ID,
										user:user.ID
									},
									success:function(data,status){devices();},
									type:'DELETE',
									url:'version/'+version+'/php/devices.php'
								});
								jQuery(this).dialog('destroy').remove();
							}
						},
						modal: true,
						width: 0.6*jQuery(window).width()
					});
				};
				jQuery(button).button();	
				container.appendChild(button);
			}
			jQuery(accordion).accordion({active: false, collapsible: true});
		},
		type: 'GET',
		url: 'version/'+version+'/php/devices.php'
	});
}
function files(){
	// initialize division
	var div = document.getElementById('Files');
	div.innerHTML = '';
	
	// heading
	heading = document.createElement('h2');
	heading.innerHTML = 'Files';
	jQuery(div).append(heading);
	
	// horizontal rule
	jQuery(div).append('<hr class=\'ui-widget-header\'>');

	// loading
	loading = document.createElement('div');
	loading.innerHTML = 'Loading files...';
	jQuery(div).append(loading);
	
	// loaded
	jQuery(loading).load('/jQuery-File-Upload-8.8.5/files.html', function () {
		var buttons = document.querySelectorAll('input[type = button]');
		for (var a = 0; a < buttons.length; a++) {
			var button = buttons[a];
			console.dir(button);
		}
		var button = jQuery('#addFiles');
		if (iOS) { FastClick(button); }
	});
}
function filesCreate(uploadedfilename){
	console.log(uploadedfilename,subuser.ID,user.ID);
	jQuery.ajax({
		data: {
			filename: uploadedfilename,
			subuser: subuser.ID,
			user: user.ID
		},
		success: function(data, status) {},
		type: 'POST',
		url: 'version/'+version+'/php/files.php'
	});
	$("#dialog").dialog('destroy').remove();
}
function filesDelete(filename){
	jQuery.ajax({
		data: {
			filename: filename,
			subuser: subuser.ID,
			user: user.ID
		},
		success: function(data, status) {},
		type: 'DELETE',
		url: 'version/'+version+'/php/files.php'
	});
}
function filesRead(){
	deleteCookie('redirect');
	jQuery.ajax({
		async: false,
		data: {
			subuser: subuser.ID,
			user: user.ID
		},
		success: function(data, status) {
			filesArray = jQuery.parseJSON(data);
		},
		type: 'GET',
		url: 'version/'+version+'/php/files.php'
	});	
}
function notes(){
	// initialize division
	var div = document.getElementById('Notes');
	div.innerHTML = '';
	
	// heading
	var heading = document.createElement('h2');
	heading.innerHTML = 'Notes';
	heading.style.display = 'inline-block';
	div.appendChild(heading);
	
	// dialog used to create and update
	var Dialog = function (data) {
		// initialize dialog
		var dialog = document.createElement('div');
		
		// settings table
		var table = document.createElement('table');
		table.style.width = '100%';
		dialog.appendChild(table);
		var index = 0;
		
		// title
		var row = table.insertRow(index++);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'Title:';
		cell.style.textAlign = 'right';
		cell.style.width = '30%';
		var cell = row.insertCell(1);
		cell.style.width = '50%';
		var input = layout.input();
		input.id = 'atitle';
		input.value = (typeof data !== 'undefined' && 'title' in data) ? data.title : null;
		cell.appendChild(input);
		var cell = row.insertCell(2);
		cell.style.width = '20%';
		
		// note
		var row = table.insertRow(index++);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'Note:';
		cell.style.textAlign = 'right';
		cell.style.width = '30%';
		var cell = row.insertCell(1);
		cell.style.width = '50%';
		var input = layout.input();
		input.id = 'note';
		input.value = (typeof data !== 'undefined' && 'note' in data) ? data.note : null;
		cell.appendChild(input);
		var cell = row.insertCell(2);
		cell.style.width = '20%';
		
		return dialog;
	}
	
	// icon
	var image = document.createElement('img');
	image.onclick = function () {	
		// initialize dialog
		var dialog = Dialog();
		dialog.title = 'Add Note';
		
		// jQueryUI
		jQuery(dialog).dialog({
			buttons: {
				Cancel: function () {
					$(this).dialog('destroy').remove();
				},
				Add: function () {
					jQuery.ajax({
						data: {
							note: jQuery('#note').val(),
							title: jQuery('#atitle').val(),
							subuser: subuser.ID,
							user: user.ID
						},
						error: function (jqXHR,textStatus,errorThrown) {
							console.log(errorThrown);
						},
						success: function (data,status) { notes(); },
						type: 'POST',
						url: 'version/'+version+'/php/notes.php'
					});
					jQuery(this).dialog('destroy').remove();
				}
			},
			modal: true,
			width: windowwidth < 4 ? jQuery(window).width() : .8*jQuery(window).width()
		});
	};
	image.src = 'images/notes.png';
	image.style.float = 'right';
	image.style.height = $(heading).outerHeight(true)+'px';
	image.style.padding = '2px';
	image.title = 'add note';
	jQuery(image).button();
	div.appendChild(image);
	
	// horizontal rule
	div.insertAdjacentHTML('beforeend','<br><hr class=\'ui-widget-header\'>');
	
	// data division
	var accordion = document.createElement('div');
	accordion.id = 'accordion';
	div.appendChild(accordion);
	
	// query database (read)
	jQuery.ajax({
		data: {
			subuser: subuser.ID,
			user: user.ID
		},
		success: function(data, status) {
			var data = jQuery.parseJSON(data);
			for (var a = 0; a < data.length; a++) {
				// heading
				var heading = document.createElement('h3');
				heading.innerHTML = data[a].entry+': '+data[a].title;
				accordion.appendChild(heading);
				
				// container
				var container = document.createElement('div');
				container.insertAdjacentHTML('beforeend',data[a].note+'<br>');
				container.insertAdjacentHTML('beforeend','&rarr;'+data[a].user+'<br>');
				container.insertAdjacentHTML('beforeend','<br><b>details</b><br>');
				accordion.appendChild(container);
				
				// database information
				for (var key in data[a]) {
					container.insertAdjacentHTML('beforeend',key+': '+data[a][key]+'<br>');
				}
							
				// update button
				var button = document.createElement('button');
				button.index = a;
				button.innerHTML = 'update';
				button.onclick = function () {
					var index = this.index;
					var dialog = Dialog(data[index]);
					dialog.title = 'Update Device';
					
					// jQueryUI
					jQuery(dialog).dialog({
						buttons: {
							Cancel: function () { jQuery(this).dialog('destroy').remove(); },
							Update: function () {
								jQuery.ajax({
									data: {
										ID: data[index].ID,
										note: jQuery('#note').val(),
										title: jQuery('#atitle').val(),
										subuser: subuser.ID,
										user: user.ID
									},
									error: function (jqXHR, textStatus, errorThrown) {
										console.log(jqXHR, textStatus, errorThrown);
									},
									success: function(data, status) { notes(); },
									type: 'PUT',
									url: 'version/'+version+'/php/notes.php'
								});
								jQuery(this).dialog('destroy').remove();
							}
						},
						modal: true,
						width: 0.8*$(window).width()
					});
					
					// jQueryUI
					if (!iOS) {
						$('#ear').selectmenu({change: $('#ear').onchange});
						$('#device').selectmenu({change: $('#device').onchange});
						$('#manufacturer').selectmenu({change: $('#manufacturer').onchange});
						$('#activation').datepicker({
							changeYear: true,
							dateFormat: 'yy-mm-dd', 
							yearRange: '-40:+0'
						});
						$('#activation').datepicker('setDate', new Date());
					}
				};
				$(button).button();
				container.appendChild(button);
				
				// delete button
				var button = document.createElement('button');
				button.index = a;
				button.innerHTML = 'delete';
				button.onclick = function () {
					var confirm = document.createElement('div');
					confirm.index = this.index;
					confirm.title = 'Delete Device Information?';
					confirm.innerHTML = "<p><span class='ui-icon ui-icon-alert' style='float:left; margin:0 7px 20px 0;'>"
						+"</span>This item will be deleted and cannot be recovered. Are you sure?</p>";
					$(confirm).dialog({
						buttons: {
							Cancel: function () {
								$(this).dialog('destroy').remove();
							},
							Delete: function () {
								jQuery.ajax({
									data: {
										ID: data[this.index].ID,
										user: user.ID
									},
									error: function (jqXHR, textStatus, errorThrown) {
										console.log(jqXHR, textStatus, errorThrown);
									},
									success: function(data, status) {
										notes();
									},
									type: 'DELETE',
									url: '/version/'+version+'/php/notes.php'
								});
								$(this).dialog('destroy').remove();
							}
						},
						modal: true,
						width: 0.6*$(window).width()
					});
				};
				$(button).button();	
				container.appendChild(button);
			}
			$(accordion).accordion({active: false, collapsible: true});
		},
		type: 'GET',
		url: 'version/'+version+'/php/notes.php'
	});
}
function permissions(){
	// initialize division
	var div = document.getElementById('Permissions');
	div.innerHTML = '';
	
	// heading
	var heading = document.createElement('h2');
	heading.innerHTML = 'Permissions';
	heading.style.display = 'inline-block';
	div.appendChild(heading);
	
	// icon
	var image = document.createElement('img');
	image.onclick = function () {	
		// initialize dialog
		var dialog = document.createElement('div');
		dialog.title = 'Add Permission';
		
		// settings table
		var table = document.createElement('table');
		table.style.width = '100%';
		dialog.appendChild(table);
		var index = 0;
		
		// users (not clients)
		var row = table.insertRow(index++);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'User:';
		cell.style.textAlign = 'right';
		cell.style.width = '30%';
		var cell = row.insertCell(1);
		cell.style.width = '50%';
		var options = [];
		for (let a = 0; a < notClients.length; a++) {
			options[a] = notClients[a].firstname+' '+notClients[a].lastname;
		}
		var select = layout.select(options);
		select.id = 'user';
		select.onchange = function(){};
		cell.appendChild(select);
		var cell = row.insertCell(2);
		cell.style.width = '20%';
		
		// permission
		var row = table.insertRow(index++);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = 'Permission:';
		cell.style.textAlign = 'right';
		cell.style.width = '40%';
		var cell = row.insertCell(1);
		cell.style.width = '40%';
		var select = layout.select(['Administrative','Standard']);
		select.id = 'permission';
		select.onchange = function(){};
		select.value = 'Standard';
		cell.appendChild(select);
		var cell = row.insertCell(2);
		cell.style.width = '20%';
		
		// jQueryUI dialog
		jQuery(dialog).dialog({
			buttons: {
				Cancel: function () {
					jQuery(this).dialog('destroy').remove();
				},
				Add: function () {
					jQuery.ajax({
						data: {
							permission: document.getElementById('permission').value,
							subuser: subuser.ID,
							superuser: user.ID,
							user: notClients[document.getElementById('user').selectedIndex].ID
						},
						error: function (jqXHR,textStatus,errorThrown) {
							console.log(errorThrown);
						},
						success: function (data,status) { permissions(); },
						type: 'POST',
						url: 'version/'+version+'/php/permissions.php'
					});
					jQuery(this).dialog('destroy').remove();
				}
			},
			modal: true,
			width: windowwidth < 4 ? jQuery(window).width() : .8*jQuery(window).width()
		});
		
		//
		if (widgetUI) {
			jQuery('#user').css('overflow-y','scroll').selectmenu({change:jQuery('#user').onchange});
			jQuery('#permission').selectmenu({change:jQuery('#permission').onchange});
		}
	};
	image.src = 'images/permissions.png';
	image.style.float = 'right';
	image.style.height = jQuery(heading).outerHeight(true)+'px';
	image.style.padding = '2px';
	jQuery(image).button();
	if (subuser.permission == 1 || user.role == 'Administrator' || subuser == user) {
		image.title = 'add permission';
		jQuery(image).button('option','disabled',false);
	} else {
		image.onclick = function () {console.log('click');};
		image.title = 'access denied';
		jQuery(image).button('option','disabled',true);
	}
	div.appendChild(image);

	// horizontal rule
	div.insertAdjacentHTML('beforeend','<br><hr class=\'ui-widget-header\'>');
	
	// data division
	var accordion = document.createElement('div');
	accordion.id = 'accordion';
	div.appendChild(accordion);
	
	// query database (read)
	jQuery.ajax({
		data: {
			subuser: subuser.ID,
			user: user.ID
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
		},
		success: function(data, status) {
			var data = jQuery.parseJSON(data);
			for (var a = 0; a < data.length; a++) {
				// heading
				var heading = document.createElement('h3');
				heading.innerHTML = 
					data[a].user
					+' &rarr; '+data[a].permission
					+' &rarr; '+data[a].subuser;
				$(accordion).append(heading);
				
				// container
				var container = document.createElement('div');
				accordion.appendChild(container);
				
				// database information
				for (var key in data[a]) {
					container.insertAdjacentHTML('beforeend',key+': '+data[a][key]+'<br>');
				}
				
				// delete button
				var button = document.createElement('button');
				button.index = a;
				button.innerHTML = 'delete';
				button.onclick = function () {
					jQuery.ajax({
						data: {
							ID: Number(data[this.index].ID),
							user: user.ID
						},
						error: function (jqXHR, textStatus, errorThrown) {
							console.log(jqXHR, textStatus, errorThrown);
						},
						success: function(data, status) {
							permissions();
						},
						type: 'DELETE',
						url: 'version/'+version+'/php/permissions.php'
					});
					
				};
				jQuery(button).button();	
				container.appendChild(button);
			}
			jQuery(accordion).accordion({active: false, collapsible: true});
		},
		type: 'GET',
		url: 'version/'+version+'/php/permissions.php'
	});
}
function profile(){//note, there is a profile function in profiles.js, one needs to go
	var that = this;
	
	// clear division
	var div = document.getElementById('Profile');
	div.innerHTML = '';
	
	// heading
	var heading = document.createElement('h2');
	heading.innerHTML = 'Profile';
	heading.style.display = 'inline-block';
	div.appendChild(heading);
	
	// edit profile (icon)
	var image = document.createElement('img');
	if (subuser == user || subuser.permission == 1 || user.role == 'Administrator') {
		image.onclick = function () {
			// edit profile (dialog)_
			var dialog = document.createElement('div');
			dialog.id = 'dialog';
			dialog.title = 'Edit Profile';
			
			// different options for different user roles
			switch (user.role) {
				case 'Administrator': var roles = ['Client','Clinician','Director','Guru']; break;
				case 'Guru': var roles = ['Client','Clinician','Director']; break;
				case 'Director': var roles = ['Client','Clinician']; break;
				default: var roles = ['Client'];
			}
			
			// table
			var table = document.createElement('table');
			table.style.width = '100%';
			dialog.appendChild(table);
			var rowIndex = 0;
			var input = document.createElement('input');
			input.id = 'username';
			input.value = subuser.username;
			layoutTableRow2(table,rowIndex++,input,'(username)');
			var input = document.createElement('input');
			input.id = 'firstname';
			input.value = subuser.firstname;
			layoutTableRow2(table,rowIndex++,input,'(first name)');
			var input = document.createElement('input');
			input.id = 'lastname';
			input.value = subuser.lastname;
			layoutTableRow2(table,rowIndex++,input,'(last name)');
			var input = document.createElement('input');
			input.id = 'email';
			input.value = subuser.email;
			layoutTableRow2(table,rowIndex++,input,'(email)');
			var input = document.createElement('input');
			input.id = 'phone';
			input.value = subuser.phone;
			layoutTableRow2(table,rowIndex++,input,'(phone number)');
			var input = document.createElement('input');
			input.id = 'dob';
			input.value = subuser.dob;
			layoutTableRow2(table,rowIndex++,input,'(date of birth)');
			var select = layout.select(['Not Specified','Male','Female']);
			select.id = 'gender';
			select.value = subuser.gender;
			layoutTableRow2(table,rowIndex++,select,'(gender)');
			var select = layout.select(roles);
			select.id = 'role';
			select.value = subuser.role;
			layoutTableRow2(table,rowIndex++,select,'(role)');
			var select = layout.select(['Active','Archived']);
			select.id = 'status';
			select.value = subuser.status;
			layoutTableRow2(table,rowIndex++,select,'(status)');
			
			// jQuery dialog (update profile)
			jQuery(dialog).dialog({
				buttons: {
					Cancel: function () { jQuery(this).dialog('destroy').remove(); },
					Delete: function () {
						jQuery(this).dialog('destroy').remove();
						
						// dialog: delete account
						var dialog = document.createElement('div');
						dialog.title = 'Delete account?';
						
						// content
						var content = document.createElement('p');
						var span = document.createElement('span');
						span.className = 'ui-icon ui-icon-alert';
						content.appendChild(span);
						content.insertAdjacentHTML('beforeend',
							'The account: "'+subuser.firstname+' '+subuser.lastname+'" will be deleted.');
						dialog.appendChild(content);
						
						// jQuery dialog (delete confirmation)
						jQuery(dialog).dialog({
							buttons: {
								Delete: function() {
									jQuery.ajax({
										data: {
											password: user.password,
											subuser: subuser.ID,
											user: user.ID
										},
										success: function(data,status){console.log(data);layout.init()},
										type: 'DELETE',
										url: 'version/'+version+'/php/profiles.php'
									});
									jQuery(this).dialog('destroy').remove();
								},
								Cancel: function() { jQuery(this).dialog('destroy').remove(); }
							},
							modal: true,
							width: windowwidth < 4 ? jQuery(window).width() : .8*jQuery(window).width()
						});
					},
					Update: function () {
						jQuery.ajax({
							data: {
								dob: document.getElementById('dob').value,
								email: document.getElementById('email').value,
								firstname: document.getElementById('firstname').value,
								gender: document.getElementById('gender').value,
								lastname: document.getElementById('lastname').value,
								phone: document.getElementById('phone').value,
								role: document.getElementById('role').value,
								status: document.getElementById('status').value,
								subuser: subuser.ID,
								user: user.ID,
								password: user.password
							},
							success: function (data, status) {
								data = JSON.parse(data);
								subuser = data[0];
								console.log(subuser);
								if (subuser == user) {
									user = subuser;
								} else {
									for (var a = 0; a < team.length; a++) {
										if (subuser.ID == team[a].ID) {
											team[a] = subuser;
										}
									}
								}
								profile();
							},
							type: 'PUT',
							url: 'version/'+version+'/php/profiles.php'
						});
						
						// remove dialog
						jQuery(this).dialog('destroy').remove();
					}
				},
				modal: true,
				width: 'auto'
			});
			
			// jQuery elements
			jQuery('#gender').val(subuser.gender).attr('selected',true);
			if (subuser == user) {
				jQuery('#role').empty().append('<option>'+user.role+'</option>').attr('disabled',true);
			} else {
				jQuery('#role').val(subuser.role).attr('selected',true);
			}
			jQuery('#status').val(subuser.status).attr('selected',true);
			jQuery('#dob').datepicker({dateFormat:'yy-mm-dd',changeYear:true,yearRange:'-100:+0'});

		};
		image.title = 'edit profile';
	} else {
		image.disabled = true;
		image.title = 'Permission is required to edit this profile.';
	}
	image.src = 'images/profile.png';
	image.style.cssFloat = 'right';
	image.style.height = '1.5em';
	jQuery(image).button();
	div.appendChild(image);
	
	// horizontal rule
	div.insertAdjacentHTML('beforeend','<br><hr class=\'ui-widget-header\'>');
	
	// information
	div.insertAdjacentHTML('beforeend',subuser.firstname+' '+subuser.lastname+'<br>');
	div.insertAdjacentHTML('beforeend','ID: '+subuser.ID+'<br>');
	div.insertAdjacentHTML('beforeend','codename: '+subuser.codename+'<br>');
	div.insertAdjacentHTML('beforeend','email: '+subuser.email+'<br>');
	div.insertAdjacentHTML('beforeend','phone: '+subuser.phone+'<br>');
	
	// details
	if (user.role == 'Administrator' || user.role == 'Guru' || user.username == 'Ray') {
		//
		var details = document.createElement('div');
		div.appendChild(details);
		
		//
		var heading = document.createElement('h3');
		heading.innerHTML = 'details';
		details.appendChild(heading);
		
		// reset password
		var reset = document.createElement('img');
		reset.src = 'images/key.png';
		reset.style.cssFloat = 'right';
		reset.style.height = '1.5em';
		reset.onclick = function () {
			// dialog
			var dialog = document.createElement('div');
			dialog.title = 'Reset Password';
			
			// content
			var content = document.createElement('p');
			
			// new password
			var input = document.createElement('input');
			input.id = 'password';
			input.onkeyup = function (event) {if (event.keyCode == 13) {}};
			input.type = 'text';
			input.value = Math.random().toString(36).slice(-5);
			console.log(input.value);
			content.appendChild(input);
			content.innerHTML += ' (Password)<br>';
			dialog.appendChild(content);
			
			// verification code
			var input = document.createElement('input');
			input.id = 'verification';
			input.onkeyup = function (event) {if (event.keyCode == 13) {}};
			input.type = 'password';
			content.appendChild(input);
			content.innerHTML += ' (Verification)<br>';
			dialog.appendChild(content);
			
			// jQuery dialog (password reset)
			jQuery(dialog).dialog({
				buttons: {
					Cancel: function () { $(this).dialog('destroy').remove(); },
					Okay: function () {
						console.log(subuser.username);
						console.log(document.getElementById('verification').value);
						jQuery.ajax({
							data: {
								method: 'passwordreset',
								password: CryptoJS.MD5(document.getElementById('password').value).toString(),
								username: subuser.username,
								verification: document.getElementById('verification').value
							},
							error: function(jqXHR, textStatus, errorThrown) {console.log(jqXHR, textStatus, errorThrown);},
							success: function(data, status) {
								if(jQuery.parseJSON(data)){layout.message('Success','Password has been changed.')}
								else{layout.message('Error','Invalid verification code.')}
							},
							type: 'PUT',
							url: '/version/'+version+'/php/profiles.php'
						});
						$(this).dialog('destroy').remove();
					}
				},
				modal: true,
				width: 'auto'//0.6*$(window).width()
			});
		};
		
		// reset button in heading
		heading.appendChild(reset);
		
		// details
		var container = document.createElement('div');
		details.appendChild(container);
		for (var key in subuser) {
			container.insertAdjacentHTML('beforeend',key+': '+subuser[key]+'<br>');
		}
		jQuery(details).accordion({active: false, collapsible: true});
	}	
}