var profiles, subuser, user;//?
function profile9() {
	var that = this;
	
	// clear division
	var div = document.getElementById('Profile');
	div.innerHTML = '';
	
	// heading
	var heading = document.createElement('h2');
	heading.innerHTML = 'Profile';
	heading.style.display = 'inline-block';
	div.appendChild(heading);
	
	// icon: edit profile
	var image = document.createElement('img');
	if (subuser == user || subuser.permission == 1 || user.role == 'Administrator') {
		image.onclick = function () {
			// dialog: update account
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
				buttons:{
					Cancel: function(){jQuery(this).dialog('destroy').remove();},
					Delete: function(){
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
							buttons:{
								Delete:function(){
									console.dir(subuser);
									console.log(subuser);
									jQuery.ajax({
										data:subuser,
										error:function(jqXHR,textStatus,errorThrown){
											console.log(jqXHR,textStatus,errorThrown);
										},
										success:function(data,status){console.log(data);layout.init()},
										type:'DELETE',
										url:'version/'+version+'/php/profiles.php'
									});
									jQuery(this).dialog('destroy').remove();
								},
								Cancel:function(){jQuery(this).dialog('destroy').remove();}
							},
							modal:true,
							width:0.8*jQuery(window).width()
						});
					},
					Update: function () {
						console.log(this);
						jQuery.ajax({
							data:subuser,
							error:function(jqXHR,textStatus,errorThrown){
								console.log(jqXHR,textStatus,errorThrown);
							},
							success:function(data,status){
								data = JSON.parse(data);
								if (subuser == user) {
									profiles = this.read('login');
									subuser = profiles[0];
									user = subuser;
								} else {
									user.method = 'team';
									team = user.read();
									for (var a = 0; a < team.length; a++) {
										if (subuser.ID == team[a].ID) {
											subuser = team[a];
										}
									}
								}
								this.readUI();
							},
							type:'PUT',
							url:'version/'+version+'/php/profiles.php'
						});
						
						// remove dialog
						jQuery(this).dialog('destroy').remove();
					}
				},
				modal: true,
				width: 'auto'
			});
			
			// jQuery elements
			jQuery("#gender").val(subuser.gender).attr('selected',true);
			if (subuser == user) {
				jQuery("#role").empty().append('<option>'+user.role+'</option>').attr('disabled',true);
			} else {
				jQuery("#role").val(subuser.role).attr('selected',true);
			}
			jQuery("#status").val(subuser.status).attr('selected',true);
			jQuery("#dob").datepicker({dateFormat: 'yy-mm-dd', changeYear: true, yearRange: '-100:+0'});

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
	div.insertAdjacentHTML('beforeend','codename: '+subuser.codename+'<br>');
	div.insertAdjacentHTML('beforeend','email: '+subuser.email+'<br>');
	div.insertAdjacentHTML('beforeend','phone: '+subuser.phone+'<br>');
	
	// details
	if (user.role == 'Administrator' || user.role == 'Guru') {
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
			input.onkeyup = function(event){if(event.keyCode==13){}};
			input.type = 'text';
			input.value = Math.random().toString(36).slice(-5);
			console.log(input.value);
			content.appendChild(input);
			content.innerHTML += ' (Password)<br>';
			dialog.appendChild(content);
			
			// verification code
			var input = document.createElement('input');
			input.id = 'verification';
			input.onkeyup = function(event){if(event.keyCode == 13){}};
			input.type = 'password';
			content.appendChild(input);
			content.innerHTML += ' (Verification)<br>';
			dialog.appendChild(content);
			
			// jQuery dialog (password reset)
			jQuery(dialog).dialog({
				buttons: {
					Cancel: function () { jQuery(this).dialog('destroy').remove(); },
					Okay: function () {
						jQuery.ajax({
							data: {
								method: 'passwordreset',
								password: CryptoJS.MD5(document.getElementById('password').value).toString(),
								user: subuser.ID,
								username: user.username,
								verification: document.getElementById('verification').value
							},
							error: function(jqXHR, textStatus, errorThrown) {console.log(jqXHR, textStatus, errorThrown);},
							success: function(data, status) {
								if(data=='success'){layout.message('Success','Password has been changed.');}
								else{layout.message('Error','Invalid verification code.');}
							},
							type: 'PUT',
							url: 'version/'+version+'/php/profiles.php'
						});
						jQuery(this).dialog('destroy').remove();
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
function Profile(settings) {
	this.codename = undefined;
	this.dob = undefined;
	this.email = undefined;
	this.firstname = undefined;
	this.gender = undefined;
	this.lastname = undefined;
	this.method = undefined;
	this.password = undefined;
	this.phone = undefined;
	this.role = 'Client';
	this.status = 'Active';
	this.username = undefined;
	for (var key in settings) {
		this[key] = settings[key];
	}
}

// Create
Profile.prototype.create = function () {
	jQuery.ajax({
		data: this,
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown)
		},
		success: function(data, status) {
			var data = jQuery.parseJSON(data);
			if (data == "exists") {
				alert(data);
			} else {
				user.method = 'team';
				team = user.read(layout.dashboard);
			}
			return data;
		},
		type: 'POST',
		url: '/version/'+version+'/php/profiles.php'
	});
}
Profile.prototype.createUI = function () {
	var that = this;
	
	// dialog: create account
	var dialog = document.createElement('div');
	dialog.title = 'Create '+role+' Account';
	
	// table
	var table = document.createElement('table');
	table.style.width = '100%';
	dialog.appendChild(table);
	var rowIndex = 0;
	var input = document.createElement('input');
	input.id = 'username';
	layoutTableRow2(table,rowIndex++,input,'(username)');
	var input = document.createElement('input');
	input.id = 'firstname';
	layoutTableRow2(table,rowIndex++,input,'(first name)');
	var input = document.createElement('input');
	input.id = 'lastname';
	layoutTableRow2(table,rowIndex++,input,'(last name)');
	var input = document.createElement('input');
	input.id = 'email';
	layoutTableRow2(table,rowIndex++,input,'(email)');
	var input = document.createElement('input');
	input.id = 'phone';
	layoutTableRow2(table,rowIndex++,input,'(phone number)');
	var input = document.createElement('input');
	input.id = 'dob';
	layoutTableRow2(table,rowIndex++,input,'(date of birth)');
	var select = layout.select(['Not Specified','Male','Female']);
	select.id = 'gender';
	select.value = 'Not Specified';
	layoutTableRow2(table,rowIndex++,select,'(gender)');
	var input = document.createElement('input');
	input.id = 'password';
	layoutTableRow2(table,rowIndex++,input,'(password)');
	
	// jQuery dialog
	jQuery(dialog).dialog({
		buttons: {
			Cancel: function () { $(this).dialog('destroy').remove(); },
			Create: function () {
				// verify first, last, and email are specified
				if (document.getElementById('username').value == '') {
					alert('Username must be specified.');
					return;
				};
				if (document.getElementById('firstname').value == '') {
					alert('First name must be specified.');
					return;
				};
				if (document.getElementById('lastname').value == '') {
					alert('Last name must be specified.');
					return;
				};
				
				// update that
				that.dob = document.getElementById('dob').value;
				that.email = document.getElementById('email').value;
				that.firstname = document.getElementById('firstname').value;
				that.gender = document.getElementById('gender').value;
				that.lastname = document.getElementById('lastname').value;
				that.method = 'default',
				that.password = CryptoJS.MD5(user.password).toString();
				that.phone = document.getElementById('phone').value;
				that.role = document.getElementById('role').value;
				that.status = document.getElementById('status').value;
				that.subuser = subuser.ID;
				
				// close dialog
				jQuery(this).dialog('destroy').remove();
				
				// database
				that.create();
			}
		},
		modal: true,
		width: 'auto'//0.6*$(window).width()
	});
	
	// jQuery datepicker
	jQuery("#dob").datepicker({
		dateFormat: 'yy-mm-dd',
		changeYear: true,
		yearRange: '-100:+0'
	});
}

// Read
Profile.prototype.read = function (callback) {
	console.log(this);
	jQuery.ajax({
		data: this,
		error: function (jqXHR, textStatus, errorThrown) {
			console.error(jqXHR, textStatus, errorThrown);
		},
		success: function (data, status) {
			console.log(data);
			var data = jQuery.parseJSON(data);
			switch (this.method) {
				case 'login':
				case 'password':
				case 'resetpassword':
				case 'user': 
					if (data.length == 0) {
						return false;
					} else {
						for (var key in data) {
							this[key] = data[key];
						}
						return this;
					}
				case 'all':
					if (profiles.length == 0) {
						profiles = false;
					} else {
						profiles.sort(this.sort);
					} 
					all = profiles;
					console.log(all);
					break;
				case 'allUsernames':
				case 'notClients':
					if (profiles.length == 0) {
						profiles = false;
					} else {
						profiles.sort(this.sort);
					} 
					notClients = profiles;
					break;
				case 'team':
				case 'teamusernames':
					if (profiles.length == 0) {
						profiles = false;
					} else {
						profiles.sort(this.sort);
					} 
					team = profiles;
					break;
			}
			if (callback && typeof callback == "function") { console.log(callback); callback(); }
		},
		type: 'GET',
		url: 'version/'+version+'/php/profiles.php'
	});
	return profiles;
}
Profile.prototype.readUI = function () {
	var that = this;
	
	//
	var div = document.getElementById('Profile');
	div.innerHTML = '';
	
	// heading
	var heading = document.createElement('h2');
	heading.innerHTML = 'Profile';
	heading.style.display = 'inline-block';
	div.appendChild(heading);
	
	// icon: edit account
	var image = document.createElement('img');
	if (subuser.permission == 1 || user.role == 'Administrator') {
		image.onclick = function() { that.updateUI(); };
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
	div.insertAdjacentHTML('beforeend',this.firstname+' '+this.lastname+'<br>');
	div.insertAdjacentHTML('beforeend','codename: '+this.codename+'<br>');
	div.insertAdjacentHTML('beforeend','email: '+this.email+'<br>');
	div.insertAdjacentHTML('beforeend','phone: '+this.phone+'<br>');
	
	// details
	if (user.role == 'Administrator' || user.role == 'Guru') {
		var details = document.createElement('div');
		div.appendChild(details);
		var heading = document.createElement('h3');
		heading.innerHTML = 'details';
		details.appendChild(heading);
		var reset = document.createElement('img');
		reset.src = 'images/key.png';
		reset.style.cssFloat = 'right';
		reset.style.height = '1.5em';
		reset.onclick = function() {
			//
			var dialog = document.createElement('div');
			dialog.title = 'Reset Password';
			
			//
			var content = document.createElement('p');
			
			//
			var input = document.createElement('input');
			input.id = 'password';
			input.onkeyup = function (event) {if (event.keyCode == 13) {}};
			input.type = 'text';
			input.value = Math.random().toString(36).slice(-5);
			console.log(input.value);
			content.appendChild(input);
			content.innerHTML += ' (Password)<br>';
			dialog.appendChild(content);
			
			//
			var input = document.createElement('input');
			input.id = 'verification';
			input.onkeyup = function (event) {if (event.keyCode == 13) {}};
			input.type = 'password';
			content.appendChild(input);
			content.innerHTML += ' (Verification)<br>';
			dialog.appendChild(content);
			
			//
			jQuery(dialog).dialog({
				buttons: {
					Cancel: function(){jQuery(this).dialog('destroy').remove();},
					Okay: function(){
						jQuery.ajax({
							data: {
								method: 'passwordreset',
								password: CryptoJS.MD5(document.getElementById('password').value).toString(),
								user: subuser.ID,
								verification: document.getElementById('verification').value
							},
							error: function(jqXHR,textStatus,errorThrown){
								console.error(jqXHR,textStatus,errorThrown);
							},
							success: function(data, status) {
								if(data=='success'){layout.message('Success','Password has been changed.');}
								else{layout.message('Error','Invalid verification code.');}
							},
							type:'PUT',
							url:'version/'+version+'/php/profiles.php'
						});
						jQuery(this).dialog('destroy').remove();
					}
				},
				modal: true,
				width: 'auto'//0.6*$(window).width()
			});
		};
		heading.appendChild(reset);
		var container = document.createElement('div');
		details.appendChild(container);
		for (var key in this) {
			if (typeof this[key] != 'function') {
				container.insertAdjacentHTML('beforeend',key+': '+this[key]+'<br>');
			}
		}
		$(details).accordion({active: false, collapsible: true});
	}
}

// Update
Profile.prototype.update = function () {
	console.log(data);
	jQuery.ajax({
		data: data,
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
		},
		success: function (data, status) {
			console.log(data);
			if (subuser == user) {
				profiles = this.read('login');
				subuser = profiles[0];
				user = subuser;
			} else {
				user.method = 'team';
				team = user.read();
				for (var a = 0; a < team.length; a++) {
					if (subuser.ID == team[a].ID) {
						subuser = team[a];
					}
				}
			}
			this.readUI();
		},
		type: 'PUT',
		url: 'version/'+version+'/php/profiles.php'
	});
}
Profile.prototype.updateUI = function () {
	// dialog: update account
	var dialog = document.createElement('div');
	dialog.id = 'dialog';
	dialog.title = 'Update Account Information';
	
	// different options for different user roles
	switch (user.role) {
		case 'Administrator': var roles = ['Client','Clinician','Director','Guru']; break;
		case 'Guru': var roles = ['Client','Clinician','Director']; break;
		case 'Director': var roles = ['Client','Clinician']; break;
		case 'Clinician': var roles = ['Client'];
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
	
	// jQuery dialog
	console.log(this);
	jQuery(dialog).dialog({
		buttons: {
			Cancel: function () { jQuery(this).dialog('destroy').remove(); },
			Delete: function () {
				jQuery(this).dialog('destroy').remove();
				this.deleteConfirmation();
			},   
			Update: function () {
				// update that
				that.dob = document.getElementById('dob').value;
				that.email = document.getElementById('email').value;
				that.firstname = document.getElementById('firstname').value;
				that.gender = document.getElementById('gender').value;
				that.lastname = document.getElementById('lastname').value;
				that.method = 'default',
				that.password = CryptoJS.MD5(user.password).toString();
				that.phone = document.getElementById('phone').value;
				that.role = document.getElementById('role').value;
				that.status = document.getElementById('status').value;
				that.subuser = subuser.ID;
				console.log(that);
				
				//
				jQuery(this).dialog('destroy').remove();
				
				//
				console.log(this);
				this.update();
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
}
Profile.prototype.updatePassword = function (verification, password) {
	jQuery.ajax({
		data: {
			method: 'passwordreset',
			password: CryptoJS.MD5(password).toString(),
			user: user.ID,
			verification: verification
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
		},
		success: function( data, status) {
			if (data=='success'){
				layout.message('Success','Your password has been changed.');
			} else {
				layout.message('Error','Invalid verification code.');
			}
		},
		type: 'PUT',
		url: 'version/'+version+'/php/profiles.php'
	});
}

// Delete
Profile.prototype.delete = function (){
	console.log(this);
	jQuery.ajax({
		data: this,
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
		},
		success: function (data, status) {
			console.log(data);
			user.method = 'team';
			layout.init();
		},
		type: 'DELETE',
		url: 'version/'+version+'/php/profiles.php'
	});
}
Profile.prototype.deleteConfirmation = function () {
	that = this;
	
	// dialog: delete account
	var dialog = document.createElement('div');
	dialog.title = 'Delete Device Information?';
	
	// content
	var content = document.createElement('p');
	var span = document.createElement('span');
	span.className = 'ui-icon ui-icon-alert';
	content.appendChild(span);
	content.insertAdjacentHTML('beforeend',
		'The account: "'+this.firstname+' '+this.lastname+'" will be deleted.');
	dialog.appendChild(content);
	
	// jQuery dialog
	jQuery(dialog).dialog({
		buttons: {
			Delete: function() {
				that.delete();
				$(this).dialog('destroy').remove();
			},
			Cancel: function() { $(this).dialog('destroy').remove(); }
		},
		modal: true,
		width: 0.6 * $(window).width()
	});
}

// Utilities
Profile.prototype.sort = function (a,b) {
  if (a.firstname < b.firstname)
     return -1;
  if (a.firstname > b.firstname)
    return 1;
  return 0;
}