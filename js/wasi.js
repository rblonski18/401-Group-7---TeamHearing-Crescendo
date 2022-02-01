// Matrix Reasoning subtest from Wechsler's Abbreviated Scale of Intelligence, 2nd ed. (WASI-II)

function wasi(settings) {
	activity = new Wasi();
	for (var key in settings){activity[key] = settings[key];}
	activity.init();
}

// Takes birth date (mo/day/year), returns age in years
function calculateAge(DOB) {
		var today = new Date();
		var birthDate = new Date(DOB);
		var age = today.getFullYear() - birthDate.getFullYear();
		var m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
				age = age - 1;
		}
		return age;
}
// Gets birth date of user from the server, saves their age as a global variable
jQuery.ajax({
	async: false,
	data: {
		subuser: subuser.ID,
		user: user.ID
	},
	success: function(data, status) {
		filesArray = jQuery.parseJSON(data); // data = the JSON string to parse
		var year = filesArray[0].dob.slice(0,4);
		var month = filesArray[0].dob.slice(5,7);
		var day = filesArray[0].dob.slice(8,10);
		AGE = calculateAge(month + "/" + day + "/" + year);
	},
	type: 'GET', // requests data from a specified source
	url: 'version/'+version+'/php/wasi.php'
});

function Wasi(settings) {
	this.ID = 'wasi';
	this.response = [];
	this.score = [];
	this.item_numbers = ["matrix_sa","matrix_sb","matrix_1","matrix_2","matrix_3",
		"matrix_4","matrix_5","matrix_6","matrix_7","matrix_8","matrix_9","matrix_10",
		"matrix_11","matrix_12","matrix_13","matrix_14","matrix_15","matrix_16","matrix_17",
		"matrix_18","matrix_19","matrix_20","matrix_21","matrix_22","matrix_23","matrix_24",
		"matrix_25","matrix_26","matrix_27","matrix_28","matrix_29","matrix_30"];
	this.correct_responses = [2, 3, 2, 1, 3, 1, 5, 1, 3, 3, 4, 2, 3, 4, 1, 4, 2, 5, 4, 2, 4, 2, 3, 3, 1, 4, 4, 2, 5, 5, 1, 2];
	this.title = 'Matrix Reasoning';
	this.titleShort = 'Matrix Reasoning';
	this.init = function () {this.menu();};
	this.imgsource = 'version/bml/images/MatrixReasoning/'
	this.message = "Select the option that best completes the pattern."
	this.adaptive = new Adaptive({rule:'exponential'});
	this.messageA =[ 'goes here','So this one','to make these two the same as well','We need another banana here','Here is one banana','These two are apples'];
	this.messageB = ['goes here', 'So this one','to make these two the same as well','We need another triangle here','Here is one triangle','These two are the same'];
	this.age = AGE;
	this.startItem = 1;
	this.endItem = (Number(this.age) >= 9) ? 31:25; //last item to display
	this.reverseItem = 0; //keeps track of last item presented

	for (var key in settings) {this[key] = settings[key];}
}

// Displays image in dialog box when explaining answers to the sample items
function diologimg(message, imgsrc, buttons) {
		var dialog = document.createElement('div');
		dialog.innerHTML = message + '<br>';
		dialog.style.fontSize = 'larger';
		dialog.style.textAlign = 'center';
		dialog.title = 'Matrix Reasoning';
		dialog.height = '50%';
		dialog.width = '50%';
		var img = document.createElement('img');
		img.id = 'dialog_img';
		img.src = imgsrc;
		img.style.padding = '30px';
		img.style.display ='block';
		img.style.marginLeft = 'auto';
		img.style.marginRight = 'auto';
		img.style.width = '35%';
		dialog.appendChild(img);

		jQuery(dialog).dialog({
			buttons: buttons
				? (typeof buttons === "function")
					? 	{
							Okay: function () {
								buttons();
								jQuery(this).dialog('destroy').remove();
							}
						}
					: buttons
				: {
					Okay: function () {
						jQuery(this).dialog('destroy').remove();
					}
			},
			modal: true,
			resizable: false,
			width: 0.8*jQuery(window).width(),
			height: 0.7*jQuery(window).height()
		});
	}

Wasi.prototype.menu = function () {
	var that = this;
	// main
	var main = layout.main(
		this.title,
		function () { that.back ? that.back() : layout.menu(); },
	);
	// Start button
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Start';
	button.onclick = function () { that.test(); };
	button.style.fontSize = '150%';
	button.style.height = '40%';
	button.style.left = '30%';
	button.style.position = 'absolute';
	button.style.top = '30%';
	button.style.width = '38%';
	main.appendChild(button);
	if (iOS) { FastClick(button); }
}; //close menu function

// Explains the sample items if they are answered incorrectly
Wasi.prototype.sampleWrong = function (sampleItem, index, sample_message) {
	var that = this;
	//alert which is the correct one
	let i = 0;
	do {
		i += 1;
		diologimg(sample_message[(i-1)], `${that.imgsource}SampleItems/${sampleItem}/${sampleItem}${i}.png`,
		{Next: function () {jQuery(this).dialog('destroy').remove();
		}}
	);
	} while (i < 6);
};

Wasi.prototype.test = function () {
	var that = this;

	// main
	var main = layout.main();

	// container
	var container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '5%';
	container.style.height = '50%';
	container.style.width = '50%';
	container.style.left = '5%';
	main.appendChild(container);

	// Response buttons
	// button 1
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = '1';
	button.onclick = function () { button_click(1); };
	button.style.fontSize = '90%';
	button.style.height = '5%';
	button.style.left = '19%';
	button.style.position = 'absolute';
	button.style.top = '67%';
	button.style.width = '5%';
	main.appendChild(button);
	if (iOS) { FastClick(button); }

	// button 2
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = '2';
	button.onclick = function () { button_click(2); };
	button.style.fontSize = '90%';
	button.style.height = '5%';
	button.style.left = '28%';
	button.style.position = 'absolute';
	button.style.top = '67%';
	button.style.width = '5%';
	main.appendChild(button);
	if (iOS) { FastClick(button); }

	// button 3
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = '3';
	button.onclick = function () { button_click(3); };
	button.style.fontSize = '90%';
	button.style.height = '5%';
	button.style.left = '37%';
	button.style.position = 'absolute';
	button.style.top = '67%';
	button.style.width = '5%';
	main.appendChild(button);
	if (iOS) { FastClick(button); }

	// button 4
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = '4';
	button.onclick = function () { button_click(4); };
	button.style.fontSize = '90%';
	button.style.height = '5%';
	button.style.left = '46%';
	button.style.position = 'absolute';
	button.style.top = '67%';
	button.style.width = '5%';
	main.appendChild(button);
	if (iOS) { FastClick(button); }

	// button 5
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = '5';
	button.onclick = function () { button_click(5); };
	button.style.fontSize = '90%';
	button.style.height = '5%';
	button.style.left = '55%';
	button.style.position = 'absolute';
	button.style.top = '67%';
	button.style.width = '5%';
	main.appendChild(button);
	if (iOS) { FastClick(button); }

	// image
	var img = document.createElement('img');
	img.id = 'stimulus';
	img.src = `${that.imgsource}FullImages/A.jpeg`;
	img.style.position = 'absolute';
	img.style.top = '5%';
	img.style.height = '60%';
	img.style.width = '50%';
	img.style.left = '15%';
	main.appendChild(img);

	// controls
	var controls = document.createElement('div');
	controls.className = 'ui-widget-content';
	controls.style.position = 'absolute';
	controls.style.bottom = '5%';
	controls.style.height = '15%';
	controls.style.width = '90%';
	controls.style.left = '5%';
	controls.style.padding = '8px';
	main.appendChild(controls);

	// // message
	var message = document.createElement('span');
	message.id = 'message';
	message.innerHTML = this.message;
	message.style.display = 'inline-block';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	message.style.width = '50%';
	controls.appendChild(message);

	// footer
	var footer = layout.footer();

	// exit button
  var exit = document.getElementById('logout');
  exit.onclick = function () {
    that.menu();
		that.pressedX = true;
    if(protocol){protocol.active=false}
    this.style.visibility = 'hidden';
		clearInterval(that.experimentInterval);
  };
  exit.src = 'images/exit.png';
  exit.style.visibility = 'visible';
  exit.title = 'exit test';

	// start dialog
	layout.message(
		'Matrix Reasoning',
		this.message,
		{Start: function () {
				jQuery(this).dialog('destroy').remove();
		}}
	);

	function button_click(clicked_id){

		// for users who are 9+ and are in the process of going through items 1-3 in reverse order
		if (Number(that.age) >= 9 && (that.reverseItem == 3 || that.reverseItem == 2 || that.reverseItem == 1)) {
			button_click_reverse(clicked_id);
			return;
		}

		// store button clicks to response array
		that.response.push(Number(clicked_id));

	  // check if response is correct and store in score array
	  if (that.response[that.response.length-1] == that.correct_responses[that.response.length-1]) {//response is correct
			that.score.push(1);
		} else { //response is incorrect
	      that.score.push(0);}

		// if user is 9+ years old and gets items 4 or 5 incorrect, they must go through
		// preceding items in reverse order until they get 2 consecutive correct responses
		if (Number(that.age) >= 9) {
			if (that.response.length == 6 && that.score[5] == 0) { //on item 4 & got it wrong
				that.reverseItem = 4;
				button_click_reverse(clicked_id);
				return;
			}
			else if (that.response.length == 7 && that.score[6] == 0 && that.score[5] == 1) { //on item 5 & got it wrong
				that.reverseItem = 5;
				button_click_reverse(clicked_id);
				return;
			}
		}

		// Check if 3 wrong in a row or just answered the last question, and then quit
		if (that.response.length > 4) {
			if ((that.score[that.response.length-3] == 0 && that.score[that.response.length-2] == 0 && that.score[that.response.length-1] == 0) || that.score.length == that.endItem+1) {
				// don't allow it to end if 9+ year old user got items 4, 3, 5 incorrect
				// or 4, 5, 6 incorrect since they were not completed consecutively
				if (Number(that.age) < 9 || (that.score[5] == 1 && that.score[6] == 1) || (that.score[5] == 0 && that.score.length > 8) || (that.score[6] == 0 && that.score.length > 9)) {
					//send data to server
					save();
					//Display exit dialog box
					layout.message('Matrix Reasoning','All done, great job!',
					{Exit: function ()
						{jQuery(this).dialog('destroy').remove();
						that.menu();
						//reset variables
						that.score = [];
						that.response = [];
						that.reverseItem = 0;
						that.startItem = 1;
				}}
				);
				}}; //closes if 3 in a row wrong if statement
			}; //closes if response length >2

			// Sample Items
			if (that.response.length == 1){
				document.getElementById('stimulus').src=`${that.imgsource}FullImages/B.jpeg`;
				if (that.score[0] == 0){
					layout.message("Oops!",
						"That's not quite right.",
						{Next: function () {
								jQuery(this).dialog('destroy').remove();
								that.sampleWrong('A',0,that.messageA);
						} // closes Next button function
					} // closes Next button
					); // closes layout.message
				}; //ends if statment that checks if Item A is incorrect
			}; //checks when Item A has been done

			if (that.response.length == 2){
				if (that.score[1] == 0){
					layout.message("Oops!",
						"That's not quite right.",
						{Next: function () {
								jQuery(this).dialog('destroy').remove();
								that.sampleWrong('B',1,that.messageB);
						} // closes Next button function
					} // closes Next button
					); // closes layout.message
				}; //ends if statment that checks if Item B is incorrect
			}; //checks when Item B has been done

			// users that are age 9 or older start on item 4
			if (that.response.length == 2) {
				if (Number(that.age) >= 9) {
		      that.response.push(2);
		      that.score.push(1);
		      that.response.push(1);
		      that.score.push(1);
		      that.response.push(3);
		      that.score.push(1);
				};
			};

			// goes through the responses
			for (i = that.startItem; i < that.endItem; i++) {
				if (that.response.length == (i+1)){ //+1 since first 2 items are sample items
					document.getElementById('stimulus').src=`${that.imgsource}FullImages/item${i}.jpeg`;
				}; // ends if (that.response.length == i) statement that anchors for loop
			}; // ends for loop that changes stimulus
		}; //ends button_click function

		// For ages 9-90: if the user does not obtain a perfect score on either Item 4 or Item 5,
		// administer the preceding items in reverse order until two consecutive perfect scores are
		// obtained.
		function button_click_reverse(clicked_id){
			if (that.reverseItem == 4 || that.reverseItem == 5) { //if the one you just got wrong was 4 or 5
				// present item 3
				that.reverseItem = 3;
				document.getElementById('stimulus').src=`${that.imgsource}FullImages/item${that.reverseItem}.jpeg`;
			}
			else if (that.reverseItem == 3) { //if the one you just did was item 3
				// store button click to response array
				that.response[that.reverseItem+1] = Number(clicked_id);

				// check if response is correct and store in score array
				if (that.response[that.reverseItem+1] == that.correct_responses[that.reverseItem+1]) {//response is correct
					that.score[that.reverseItem+1] = 1;
				} else { //response is incorrect
					that.score[that.reverseItem+1] = 0;
				}
				// if items 3 and 4 were correct, skip to item 6 and resume normal test
				if (that.score[that.reverseItem+1] == 1 && that.score[that.reverseItem+2] == 1) {
					document.getElementById('stimulus').src=`${that.imgsource}FullImages/item${6}.jpeg`;
					that.startItem = 7;
					that.reverseItem = 0;
				} else {
					// if haven't gotten 2 correct yet, display item 2
					that.reverseItem = 2;
					document.getElementById('stimulus').src=`${that.imgsource}FullImages/item${that.reverseItem}.jpeg`;
				}
			}
			else if (that.reverseItem == 2) { //if the one you just did was item 2
				// store button click to response array
				that.response[that.reverseItem+1] = Number(clicked_id);

				// check if response is correct and store in score array
				if (that.response[that.reverseItem+1] == that.correct_responses[that.reverseItem+1]) {//response is correct
					that.score[that.reverseItem+1] = 1;
				} else { //response is incorrect
					that.score[that.reverseItem+1] = 0;
				}

				// if items 3 and 2 were correct, skip to item 5 or 6 and resume normal test
				if (that.score[that.reverseItem+1] == 1 && that.score[that.reverseItem+2] == 1) {
					if (that.score.length == 6) { //if you haven't done item 5 yet, do that
						document.getElementById('stimulus').src=`${that.imgsource}FullImages/item${5}.jpeg`;
						that.startItem = 6;
						that.reverseItem = 0; //reset
					} else if (that.score.length == 7) { //if you've already done item 5, do item 6
						document.getElementById('stimulus').src=`${that.imgsource}FullImages/item${6}.jpeg`;
						that.startItem = 7;
						that.reverseItem = 0; //reset
					}

				}
				// end task if the last 3 scores were incorrect (items 3, 2, and 4 or 5)
				else if (that.score[4] == 0 && that.score[3] == 0 && (that.score[6] == 0 || that.score[5] == 0)) {
					//send data to server
					save();
					//Display exit dialog box
					layout.message('Matrix Reasoning','All done, great job!',
					{Exit: function ()
						{jQuery(this).dialog('destroy').remove();
						that.menu();
						//reset variables
						that.score = [];
						that.response = [];
						that.startItem = 1;
						that.reverseItem = 0;
				}}
				);
				}
				 else {
					// display item 1
					that.reverseItem = 1;
					document.getElementById('stimulus').src=`${that.imgsource}FullImages/item${that.reverseItem}.jpeg`;
				}
			}
			else if (that.reverseItem == 1) { //if the one you just did was item 1
				// store button click to response array
				that.response[that.reverseItem+1] = Number(clicked_id);

				// check if response is correct and store in score array
				if (that.response[that.reverseItem+1] == that.correct_responses[that.reverseItem+1]) {//response is correct
					that.score[that.reverseItem+1] = 1;
				} else { //response is incorrect
					that.score[that.reverseItem+1] = 0;
				}

				// if items 2 and 1 were correct, skip to item 5 or 6 and resume normal test
				if (that.score[that.reverseItem+1] == 1 && that.score[that.reverseItem+2] == 1) {
					// skip ahead to the rest of the test (either item 5 or 6)
					if (that.score.length == 6) { //if you haven't done item 5 yet, do that
						document.getElementById('stimulus').src=`${that.imgsource}FullImages/item${5}.jpeg`;
						that.startItem = 6;
						that.reverseItem = 0; //reset
					} else if (that.score.length == 7) { //if you've already done item 5, do item 6
						document.getElementById('stimulus').src=`${that.imgsource}FullImages/item${6}.jpeg`;
						that.startItem = 7;
						that.reverseItem = 0; //reset
					}
				} else {
					//send data to server
					save();
					//Display exit dialog box
					layout.message('Matrix Reasoning','All done, great job!',
					{Exit: function ()
						{jQuery(this).dialog('destroy').remove();
						that.menu();
						//reset variables
						that.score = [];
						that.response = [];
						that.reverseItem = 0;
						that.startItem = 1;
				}}
				);
				}
			}
		};

		// Saves the data on the server
		function save() {
			jQuery.ajax({
				async: false,
				data: {
					matrix_item_numbers: that.item_numbers.toString(),
					matrix_responses: that.response.toString(),
					matrix_correct: that.score.toString(),
					matrix_answer_key: that.correct_responses.toString(),
					subuser: subuser.ID,
					user: user.ID
				},
				// success: function(data, status) { that.history(); },
				type: 'POST',
				url: 'version/'+version+'/php/wasi.php'
			});
		}
	};
