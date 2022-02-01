loadscript('md5');

// globals
var ear = 1,
	errorCount = 0,
	iOS = (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)),
	materials = {},
	role,
	status = 'init',
	user = {},
	widgetUI = true;

/* below is causing issues on older iPads
// We listen to the resize event
window.addEventListener('resize', () => {
  document.body.style.height = window.innerHeight+'px';
  document.body.style.width = window.innerWidth+'px';
});*/

//
function login() {
	// automatic login
	if(getCookie('success')){
		user = {
			password: getCookie('password'),
			username: getCookie('username')
		};
		loginVerify();
		return;
	}

	// clear body
	var body = document.body;
	body.innerHTML = '';
	body.style.height = window.innerHeight+'px';
	body.style.position = 'fixed';
	body.style.overflow = 'hidden';
	body.style.width = window.innerWidth+'px';

	// main division
	var main = document.createElement('div');
	main.className = 'ui-widget-header';
	main.style.height = '100vh';
	main.style.left = '0%';
	main.style.position = 'absolute';
	main.style.top = '0%';
	main.style.width = '100vw';
	body.appendChild(main);

	// title
	var title = document.createElement('h1');
	title.innerHTML = 'TeamHearing';
	title.style.fontFamily = 'Oleo Script';
	title.style.marginTop = '2%';
	title.style.paddingLeft = '40px';
	main.appendChild(title);

	// subtitle
	var subtitle = document.createElement('h2');
	subtitle.innerHTML = 'Resources for Hearing Health Care';
	subtitle.style.paddingLeft = '40px';
	subtitle.style.paddingRight = '40px';
	main.appendChild(subtitle);

	// login division
	var login = document.createElement('div');
	login.style.fontSize = 'larger';
	login.style.marginLeft = '10%';
	login.style.width = '80%';
	main.appendChild(login);

	// heading: Username
	var heading = document.createElement('h3');
	heading.innerHTML = 'Username';
	heading.style.marginBottom = '0px';
	login.appendChild(heading);

	// username
	var username = document.createElement('input');
	username.id = 'username';
	username.onchange = function(){user.username=this.value;};
	username.style.width = '100%';
	login.appendChild(username);

	// heading: Password
	var heading = document.createElement('h3');
	heading.innerHTML = 'Password';
	heading.style.marginBottom = '0px';
	login.appendChild(heading);

	// password
	var password = document.createElement('input');
	password.id = 'password';
	password.onchange = function(){user.password=this.value;};
	password.onkeyup = function(event){if(event.keyCode==13){signin.onclick()}};
	password.style.fontSize = 'larger';
	password.style.width = '100%';
	password.type = 'password';
	login.appendChild(password);
	login.insertAdjacentHTML('beforeend','<br><br>');

	// sign in
	var signin = document.createElement('button');
	signin.innerHTML = 'Sign In';
	signin.onclick = function () {
		user = {
			password : document.getElementById('password').value,
			username : document.getElementById('username').value
		}
		document.getElementById('message').innerHTML = 'Validating...';
		loginVerify();
	};
	signin.style.cssFloat = 'right';
	jQuery(signin).button();
	login.appendChild(signin);

	// sign in
	var test = document.createElement('button');
	test.innerHTML = 'Test';
	test.onclick = function () {
		//alert('this is a test');
		//loadscript('clinic',function(){clinic();});
		loadscript('playlist',function(){something();});
	};
	test.style.cssFloat = 'right';
	jQuery(test).button();
	login.appendChild(test);


	// new account
	var button = document.createElement('button');
	button.innerHTML = 'New';
	button.onclick = function () {
		// dialog: Create Profile
		var dialog = document.createElement('div');
		dialog.id = 'dialog';
		dialog.title = 'New Account';

		// table
		var table = document.createElement('table');
		table.style.width = '100%';
		dialog.appendChild(table);
		var rowIndex = 0;
		var input = document.createElement('input');
		input.id = 'username2';
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
		input.id = 'password0';
		input.type = 'password';
		layoutTableRow2(table,rowIndex++,input,'(password)');

		// new account (dialog)
		jQuery(dialog).dialog({
			buttons: {
				Cancel: function () { errorCount = 0; jQuery(this).dialog('destroy').remove(); },
				Create: function () {
					if (!checkPassword(document.getElementById('password0').value)) {
						errorMessage = document.createElement('p');
						errorMessage.id = 'errorMsg';
						errorMessage.style.color = "red";
						errorMessage.style.fontSize = "70%";
						errorMessage.style.marginTop = "2%";
						if (errorCount === 0) {
							errorMessage.innerHTML = "Password must be atleast 6 characters with 1 lowercase, 1 uppercase and 1 number";
							errorCount++;
							layoutTableRow2(table,rowIndex++,errorMessage,'');
						}
				        return false;
      				} else {
						user = {
							password: document.getElementById('password0').value,
							username: document.getElementById('username2').value
						};
						jQuery.ajax({
							data: {
								email:document.getElementById('email').value,
								firstname:document.getElementById('firstname').value,
								lastname:document.getElementById('lastname').value,
								password:CryptoJS.MD5(user.password).toString(),
								user:1,
								username:user.username
							},
							success:function(data,status){
								var data = JSON.parse(data);
								if(data=='exists'){
									alert(
		'That username is already in use. Please pick a different username.'
									);
									return;
								} else {
									loginVerify();
								}
							},
							type: 'POST',
							url: 'version/'+version+'/php/profiles.php'
						});
					}
				}
			},
			modal: true,
			width: 'auto'
		});

		// jQuery elements
		jQuery('#dob').datepicker({
			changeYear: true,
			dateFormat: 'yy-mm-dd',
			yearRange: '-140:+0'
		});
	};
	button.style.marginBottom = '0px';
	jQuery(button).button();
	login.appendChild(button);

	// password validation
	function checkPassword(str){
	    // at least one number, one lowercase and one uppercase letter
	    // at least six characters that are letters, numbers or the underscore
	    // with optional special characters
	    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w~@#$%^&*+=`|{}:;!.?\"()\[\]-]{6,}$/;
	    return re.test(str);
  	}

	// reset password
	var reset = document.createElement('button');
	reset.innerHTML = 'Reset';
	reset.onclick = function () {
		// username (dialog)
		var dialog = document.createElement('div');
		dialog.title = 'Get Verification Code';

		// content
		var content = document.createElement('p');
		content.innerHTML = '<p>What is your username?<p>'+content.innerHTML;
		dialog.appendChild(content);
		var input = document.createElement('input');
		input.id = 'username2';
		input.onchange = function(){user.username=this.value;};
		input.type = 'text';
		input.value = document.getElementById('username').value;
		dialog.appendChild(input);

		// verification code (dialog)
		jQuery(dialog).dialog({
			buttons: {
				Cancel: function () { jQuery(this).dialog('destroy').remove(); },
				Okay: function () {
					user = {
						password: undefined,
						username: document.getElementById('username2').value
					};
					jQuery.ajax({
						data: {
							method: 'resetpassword',
							username: user.username
						},
						success: function (data, status) {
							console.log(data);

							// reset password (dialog)
							var dialog = document.createElement('div');
							dialog.title = 'Reset Password';

							// content
							var content = document.createElement('p');

							// password 1
							var input = document.createElement('input');
							input.id = 'password1';
							input.type = 'password';
							content.appendChild(input);
							content.insertAdjacentHTML('beforeend',' (enter new password)<br>');

							// password 2
							var input = document.createElement('input');
							input.id = 'password2';
							input.type = 'password';
							content.appendChild(input);
							content.insertAdjacentHTML('beforeend',' (enter it again)<br>');

							// verification
							content.insertAdjacentHTML('beforeend','<br>Check your email for a verification code.<br>');
							var input = document.createElement('input');
							input.id = 'verification';
							input.onkeyup = function (event) { if (event.keyCode == 13) {}; };
							input.type = 'password';
							content.appendChild(input);
							content.insertAdjacentHTML('beforeend',' (verification code)<br>');
							dialog.appendChild(content);

							// reset password (dialog)
							jQuery(dialog).dialog({
								buttons: {
									Cancel: function () { jQuery(this).dialog('destroy').remove(); },
									Okay: function () {
										var password1 = document.getElementById('password1').value,
										password2 = document.getElementById('password2').value,
										verification = document.getElementById('verification').value;
										if (password1 == password2) {
											user.password = password1;
											jQuery.ajax({
												data: {
													method: 'passwordreset',
													password: CryptoJS.MD5(user.password).toString(),
													username: user.username,
													verification: verification
												},
												success: function (data, status) {
													loginVerify();
												},
												type: 'PUT',
												url: 'version/'+version+'/php/profiles.php'
											});
										}
										else {
											alert('Passwords did not match.');
											return;
										}
										jQuery(this).dialog('destroy').remove();
									}
								},
								modal: true,
								width: 'auto'//0.6*$(window).width()
							});
						},
						type: 'GET',
						url: 'version/'+version+'/php/profiles.php'
					});

					//
					jQuery(this).dialog('destroy').remove();
				}
			},
			modal: true,
			width: 'auto'
		});
	};
	reset.style.marginBottom = '0px';
	jQuery(reset).button();
	login.appendChild(reset);

	// horizontal rule
	login.insertAdjacentHTML('beforeend','<br><hr class=\'ui-widget-header\'>');

	// message
	var message = document.createElement('h3');
	message.id = 'message';
	message.style.marginTop = '0px';
	message.style.clear = 'both';
	message.style.cssFloat = 'right';
	login.appendChild(message);

	// footer
	var footer = document.createElement('span');
	footer.innerHTML = 'USC Keck School of Medicine ('+version+')';
	footer.style.bottom = '0%';
	footer.style.position = 'fixed';
	footer.style.textAlign = 'center';
	footer.style.width = '100%';
	body.appendChild(footer);
}
function loginVerify(){// move to server
	loadscript('md5',function(){
		jQuery.ajax({
			data: {
				method: 'login',
				password: CryptoJS.MD5(user.password).toString(),
				username: user.username
			},
			error: function (err) {console.log(err);
				if (user.username == 'Dewey') {
					// load main and layout dashboard
					if (typeof mode !== 'undefined') {
						switch (mode) {
							case 'clinic':loadscript('clinic',function(){clinic()});break;
							case 'modules':loadscript('modules',function(){modules()});break;
							case 'UTD':loadscript('clinic',function(){clinic()});break;
						}
					} else {
						loadscript('main',function(){layout.init()});
					}
				}
			},
			success: function (data, status) {
				data = JSON.parse(data);

				// check user name
				if(data===0){
					if(getCookie('success')){Logout();}
					document.getElementById('message').innerHTML = 'Invalid user name.';
					return;
				}

				// check password
				if(!data||data===false){
					try{
						if(getCookie('success')){Logout();}
						document.getElementById('message').innerHTML = 'Invalid password.';
						return;
					}catch(err){return;}
				}

				// empty error (can occur while debugging)
				//if(data.length==0){Logout();return;}

				// bake cookie
				document.cookie = 'password = ' + user.password;
				document.cookie = 'username = ' + user.username;
				document.cookie = 'success = true';

				// define user
				user = data[0];
				subuser = user;

				// load main and layout dashboard
				if (typeof mode !== 'undefined') {
					switch (mode) {
						case 'alpha':loadscript('main',function(){layout.init()});break;
						case 'clinic':loadscript('clinic',function(){clinic()});break;
						case 'modules':loadscript('modules',function(){modules()});
					}
				} else {
					loadscript('main',function(){layout.init();});
				}
			},
			type: 'GET',
			url: 'version/'+version+'/php/profiles.php'
		});
	});
}
function Logout(){deleteCookies();window.location.reload();}

// Utilities
function deleteCookies(callback) {
	deleteCookie('ID');
	deleteCookie('name');
	deleteCookie('password');
	deleteCookie('success');
	if (typeof(callback)!=='undefined'){callback();}
}
function deleteCookie(c_name) {
    document.cookie = c_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
function getCookie(c_name) {
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1){c_start = c_value.indexOf(c_name + "=");}
	if (c_start == -1){c_value = null;}
	else
	{
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1){c_end = c_value.length;}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}

//
function loadassignment(src,callback) {
	if(typeof window[src] === 'undefined'){
		var script = document.createElement('script');
		script.onload = callback ? callback : ()=>{window['assignment']()};
		script.src = 'version/'+version+'/js/assignments/'+src+'.js?'+new Date().getTime();
		script.type = 'text/javascript';
		document.head.appendChild(script);
	}else{if(callback){callback()}}
}
function loadrunner(src,callback) {
	if (typeof window[src] == 'function') {
		window[src]({back: callback});
	} else {
		loadscript(src,()=>{window[src]({back: callback})});
	}
}
function loadscript(src,callback,v) {
	v = v ? v : version;
	if(typeof window[src] === 'undefined'){
		var script = document.createElement('script');
		script.onload = callback;
		script.src = 'version/'+v+'/js/'+src+'.js?'+new Date().getTime();
		script.type = 'text/javascript';
		document.head.appendChild(script);
	}else{if(callback){callback()}}
}
function loadscripts(scripts,callback) {
	let progress = 0;
	for (let a = 0; a < scripts.length; a++) { loadscript(scripts[a],
		function () {
			if (++progress == scripts.length) { if(callback){callback()} }
		});
	}
}
function layoutTableRow2(table,rowIndex,element,units) {
	var row = table.insertRow(rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.style.width = '60%';
	cell.appendChild(element);
	var cell = row.insertCell(1);
	cell.innerHTML = units;
	cell.style.width = '40%';
}
