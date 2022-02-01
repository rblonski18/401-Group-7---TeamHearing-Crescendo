subuser = user;
loadscript('numeric.min',function(){loadscript('gab')});
		
// a few globals
var iOS = (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)),
	role,
	status = 'init',
	widgetUI = true;
	
// Dewey Finn
if (debug) {
	jQuery.ajax({
		complete: function () { modules(); },
		data: {
			method: 'login',
			password: CryptoJS.MD5('yo').toString(),
			username: 'Dewey'
		},
		error: function () {		
			//
			user = {
				codename: 'ABC-123',
				dob: '1974-9-25',
				email: 'rgoldswo@usc.edu',
				firstname: 'Dewey',
				gender: 'Male',
				lastname: 'Finn',
				password: 'yo',
				phone: '(213)-222-3384',
				role: 'Administrator',
				status: 'Active',
				username: 'Dewey'
			};
			subuser = user;
		},
		success: function (data, status) {
			data = jQuery.parseJSON(data);
			user = data[0];
			subuser = user;
		},
		type: 'GET',
		url: 'version/'+version+'/php/profiles.php'
	});
} else {
	//
	user = {
		codename: 'ABC-123',
		dob: '1974-9-25',
		email: 'rgoldswo@usc.edu',
		firstname: 'Dewey',
		gender: 'Male',
		lastname: 'Finn',
		password: 'yo',
		phone: '(213)-222-3384',
		role: 'Administrator',
		status: 'Active',
		username: 'Dewey'
	};
	subuser = user;
}

// modules
function modules() {
	loadscript('main',function(){
		activity = new Modules();
		activity.selector();
	})
}
function Modules() {
	this.module = 'intervals';
	this.modules = ['audiogram','audiologic','bel','bmld','calibration','chart','clinic',
	'cnc','confronto','consonants','crisp','crm','dichotic','environmental','fundamental','gabor',
	'harmonics','intervals','ild','itd','lateralization','l1l2','matrix','mdt','mrt','musanim',
	'reaction','speech','spin','surveys','tonal','voice','vowels'];
}
Modules.prototype.selector = function () {
	that = this;
	
	//
	document.body.innerHTML = '';
	
	// header
	header = layout.header();
	
	// main
	main = layout.main('Module Test Site', false, {
		Test: function () { loadrunner(that.module, function () { modules(); }); }
	});
	
	// selector division
	var selector = document.createElement('div');
	selector.className = 'ui-widget-content';
	jQuery(main).append(selector);
	
	// selector table
	var table = document.createElement('table');
	table.style.width = '100%';
	jQuery(selector).append(table);
	var rowIndex = -1;

	// Run as:
	var select = layout.select(['Client','Clinician']);
	select.onchange = function () {
		user.role = this.value;
	};
	select.value = user.role;
	layoutTableRow(table,++rowIndex,'Run as:',select,'');
	
	// Select module:	
	var select = document.createElement('select');
	select.style.fontSize = '100%';
	select.onchange = function () {
		that.module = this.value;
	};
	select.style.width = '100%';
	jQuery.each(this.modules, function(index, value) {
		var option = document.createElement('option');
		option.innerHTML = value;
		option.value = value;
		jQuery(select).append(option);
	});
	select.value = that.module;
	layoutTableRow(table,++rowIndex,'Select module:',select,'');
	
	// footer
	layout.footer(true);
};