var bugs;

// Create
function bugsCreate(){
	jQuery.ajax({
		url: '/version/'+version+'/php/bugs.php',
		type: 'POST',
		data: {
			browser: navigator.userAgent,
			bug: jQuery("#p2").val(),
			user: user.ID
		},
		async: false,
		success: function(data, status) {},
		error: function(jqXHR, textStatus, errorThrown) {}
	});
}
function bugsCreateUI(){
	// dialog: add bug
	var dialog = document.createElement('div');
	dialog.title = 'Bug Report ('+version+')';
	
	// content
	var content = document.createElement('p');
	html = "<textarea id='p2' rows='4' cols='50'></textarea> (bug)";
	$(content).html(html);
	$(dialog).html(content);
	
	// dialog
	$( dialog ).dialog({
		buttons: {
			Cancel: function() {
				$(this).dialog('destroy').remove();
			},
			Add: function() {
				bugsCreate();
				$(this).dialog('destroy').remove();
			},
			Show: function(){
				bugsReadUI();
				$(this).dialog('destroy').remove();
			}
		},
		modal: true,
		width: 'auto'//0.6*$(window).width()
	});
}

// Read
function bugsRead(){
	jQuery.ajax({
		url: '/version/'+version+'/php/bugs.php',
		type: 'GET',
		data: {
			user: user.ID
		},
		async: false,
		success: function(data, status) {			
			bugs = jQuery.parseJSON(data);
			bugs.sort(
				function (a, b) {
				  if ( a.entry < b.entry )
					 return -1;
				  if ( a.entry > b.entry )
					return 1;
				  return 0;
				}
			).reverse();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert("error in bugsRead: " + textStatus + " errorThrown: " + errorThrown);
		}
	});	
}
function bugsReadUI(){
	bugsRead();

	// main
	main = layout.main();
	
	// back button
	layout.backbutton(function () {
		layout.dashboard();
	});
	
	// heading
	var heading = document.createElement('h1');
	heading.id = 'title';
	heading.innerHTML = 'Bugs';
	heading.style.display = 'inline-block';
	$(main).append(heading);

	// icon
	var image = document.createElement('img');
	image.onclick = function() { bugsCreateUI(); };
	image.src = '/images/bug.png';
	image.style.float = 'right';
	$(image).css('float','right');
	image.style.height = $(heading).outerHeight(true)+'px';
	image.title = 'report bug';
	$(image).button();
	$(main).append(image);
	
	// horizontal rule
	$(main).append('<hr class=\'ui-widget-header\'>');
	
	// bugs
	var bugsAccordion = document.createElement('div');
	bugsAccordion.id = 'bugsAccordion';
	$(main).append(bugsAccordion);

	// bugs
	$.each( bugs, function(index, value) {
		
		// heading
		var heading = document.createElement('h3');
		heading.innerHTML = value.entry + ': ' + value.bug + '&rarr;' + value.user;
		$(bugsAccordion).append(heading);
		
		// container
		var container = document.createElement('div');
		$(bugsAccordion).append(container);
		$(container).append('<b>details</b><br>')
		for(var key in value) {
			$(container).append(key+': '+value[key]+'<br>');
		}
		
		// delete button
		if (user.role == 'Administrator' || user.username == 'Ray') {
			var button = document.createElement('button');
			button.innerHTML = 'delete';
			button.onclick = function() { bugsDelete(index); bugsReadUI(); };
			button.style.marginTop = '16px';
			button.style.color = 'red';
			button.style.backgroundColor = 'white';
			$(button).button();
			$(heading).append(button);
		}
	});
	
	//
	$(bugsAccordion).accordion({
		active: false,
		collapsible: true
    });
}

// Update
function bugsUpdateUI(index){
	// dialog: add note
	var dialog = document.createElement('div');
	dialog.title = 'Update Note';
	
	// content
	var content = document.createElement('p');
	html = "<input id='p1' type='text' value='"+bugs[index].title+"'><br>"
		+"<textarea id='p2' rows='4' cols='50'>"+bugs[index].note+"</textarea>";
	$(content).html(html);
	$(dialog).html(content);
	
	// dialog
	$( dialog ).dialog({
		buttons: {
			Cancel: function() {
				$(this).dialog('destroy').remove();
			},
			Update: function() {
				$(this).dialog('destroy').remove();
				bugsUpdate();
			}
		},
		modal: true,
		width: 'auto'//0.6*$(window).width()
	});
}
function bugsUpdate(index){
	var proceed = true;//confirm("Update: "+bugs[index].id+"?");
	if (proceed) {
		jQuery.ajax({
			url: '/version/'+version+'/php/bugs.php',
			type: 'PUT',
			data: {
				ID: bugs[index].ID,
				bug: jQuery("#p1").val(),
				user: user.ID
			},
			async: false,
			success: function(data, status) {bugsReadUI();},
			error: function(jqXHR, textStatus, errorThrown) {}
		});
	}	
	$("#dialog").dialog('destroy').remove();
}

// Delete
function bugsDelete(index){
	jQuery.ajax({
		url: '/version/'+version+'/php/bugs.php',
		type: 'DELETE',
		data: {
			ID: bugs[index].ID,
			user: user.ID
		},
		async: false,
		success: function(data, status) {bugsReadUI();},
		error: function(jqXHR, textStatus, errorThrown) {}
	});
}
function bugsDeleteConfirmation(index){

	// dialog: delete account
	var dialog = document.createElement('div');
	dialog.title = 'Delete Bug?';
	
	// content
	var content = document.createElement('p');
	var span = document.createElement('span');
	span.className = 'ui-icon ui-icon-alert';
	$(content).append(span);
	$(content).append('This bug will be deleted and cannot be recovered.');
	$(dialog).append(content);
	
	// dialog
	$( dialog ).dialog({
		buttons: {
			Cancel: function() {
				$( this ).dialog('destroy').remove();
			},
			Delete: function() {
				bugsDelete(index);
				$( this ).dialog('destroy').remove();
			}
		},
		modal: true,
		width: 0.6*$(window).width()
	});
}

// Utilities
function bugsCancel(){
	$("#dialog").dialog('destroy').remove();
}
function bugsDisplayUI(){
	div = "#middle";
	html = "<div id='dialog' title='Display Mode'>"
		+"<select id='selectNotesDisplay'>"
		+"<option>Show All</option>"
		+"<option>Show Subuser</option>"
		+"</select>"
		+"<br>"
		+"<button onclick='bugsCancel()'>Cancel</button>"
		+"<button onclick='bugsDisplay()'>Okay</button>"
		+"</div>";
	$(div).append(html);
	$(function() {
		$("#dialog").dialog({
			resizable: false,
			width: 'auto'
		});
	});
}
function bugsDisplay(){
	bugsDisplayMode = $('#selectNotesDisplay').val();
	bugsCancel();
	bugsReadUI();
}