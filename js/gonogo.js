// Modeled after Moreno et al, 2014
// Purple and white triangles and squares appear on the screen. Go condition is
// white triangles, purple squares; no go condition is white squares, purple triangles.
// For usernames that start with 2 (Brain and Music Lab 2nd grade cohort of School Study),
// the conditions are easier - the go conditions is white shapes, no go condition is
// purple shapes.

// Participants press the trigger button when the go condition shapes appear on the
// screen. There is 75% chance of getting go condition, 25% chance of getting nogo
// condition. There are 192 trials in total. Each shape appears on the screen for
// 500 ms. The interval between the start of one trial and the start of the next
// trial is 2 sec.

// Created by Priscilla Perez, Jady Chan, and Alison Wood from the USC Brain and Music Lab
// Oct 2020

function gonogo(settings) {
	activity = new Gonogo();
	for(var key in settings){activity[key]=settings[key];}//overrides
	activity.init();
}

// Get the 1st character of the user's username. For the Brain and Music Lab, participants
// from the 2nd grade cohort of the School Study are assigned the easy version of the
// task (username starts w/ 2)
jQuery.ajax({
	async: false,
	data: {
		subuser: subuser.ID,
		user: user.ID
	},
	success: function(data, status) {
		filesArray = jQuery.parseJSON(data); // data = the JSON string to parse
		USER_COHORT = filesArray[0].username.slice(0,1);
	},
	type: 'GET', // requests data from a specified source
	url: 'version/'+version+'/php/gonogo.php'
});

function Gonogo(settings) {
	this.ID = 'gonogo';
  this.imgsrc = ["version/bml/images/Gonogo/"];
  this.images = [`${this.imgsrc}purp_squ.png`, `${this.imgsrc}purp_tri.png`, `${this.imgsrc}white_squ.png`, `${this.imgsrc}white_tri.png`];
  this.shapes = ["purple square", "purple triangle", "white square", "white triangle"];
	this.message = '';
	if (USER_COHORT == '2') { //easy version for School Study 200 cohort
		this.go1 = 0; //0-purple square
		this.go1img = "Purple Squares"
		this.go2 = 1; //1-purple triangle
		this.go2img = "Purple Triangles"
		this.nogo1 = 2; // 2-white square
		this.nogo2 = 3; // 3-white triangle
	} else { //hard version for everyone else
		this.go1 = 0; //0-purple square
		this.go1img = "Purple Squares"
	  this.go2 = 3; //3-white triangle
		this.go2img = "White Triangles"
	  this.nogo1 = 1; //1-purple triangle
	  this.nogo2 = 2; //2-white square
	};
	this.go1imgsrc = this.images[this.go1]
	this.go2imgsrc = this.images[this.go2]
  this.condition = []; //which trial is a go/nogo task
  this.shapeshown = []; //what shapes are shown in each trial
  this.nums = []; //sequence of the indexes of shapes
  this.rt = []; //reaction rt of each trial
  this.accuracy = []; //0-incorrect, 1-correct for each trial
  this.reaction = 0; //time that the participant presses 'space'
  this.shape = 0; //time that the shape shows on the screen
  this.trialCounter = 0; //keeps track of how many trials there are
  this.experimentInterval; //keeps track of 2 second time for each trial
  this.init = function () {this.test();};
	this.x; //used to hold information about each image
	this.pressedX = false; //true when exit button on top right of screen is pressed
	this.tutorial = true; //true when tutorial is occurring

  for(var key in settings){this[key]=settings[key];}
};

Gonogo.prototype.resetvars =  function() {
	console.log("resetvars used")
	var that = this;
	that.condition = []; //which trial is a go/nogo task
  that.nums = []; //sequence of the indexes of shapes
  that.rt = []; //reaction time of each trial
  that.accuracy = []; //0-incorrect, 1-correct for each trial
  that.reaction = 0; //time that the participant presses 'space'
  that.shape = 0; //time that the shape shows on the screen
  that.trialCounter = 0; //keeps track of how many trials there are
  that.experimentInterval; //keeps track of 2 second time for each trial
	that.x;
	that.message = '';
}

function diologImg(message, imgsrc, buttons) {
		var dialog = document.createElement('div');
		dialog.innerHTML = message + '<br>';
		dialog.style.fontSize = 'larger';
		dialog.style.textAlign = 'center';
		dialog.title = 'Instructions';
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

Gonogo.prototype.menu = function () {
  	var that = this;
  	// main
  	var main = layout.main(
  		"Go-NoGo",
  		function () { that.back ? that.back() : layout.menu(); },
  	);
		document.getElementById('home').onclick = function() {
			clearInterval(that.experimentInterval);
			if (typeof activity !== 'undefined' && 'processor' in activity) { activity.processor.stop(); }
			if (protocol) { protocol.active = false; }
			subuser = user;
			layout.init();
		}
  	// Start button
  	var button = document.createElement('button');
  	button.className = 'response';
  	button.innerHTML = 'Start';
  	button.onclick = function () {activity.test();};
  	button.style.fontSize = '150%';
  	button.style.height = '40%';
  	button.style.left = '30%';
  	button.style.position = 'absolute';
  	button.style.top = '30%';
  	button.style.width = '38%';
  	main.appendChild(button);
  	if (iOS) { FastClick(button); }
  }; //close menu function

// sets up message at bottom of page
Gonogo.prototype.bottommessage = function(text){
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

	// message
	var message = document.createElement('span');
	message.innerHTML = text;
	message.style.display = 'inline-block';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	message.style.width = '50%';
	controls.appendChild(message);
}

Gonogo.prototype.layout = function(){
	var that = this;

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

  // main
  var main = layout.main();

  // afc container
  var container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '5%';
  container.style.height = '70%';
  container.style.width = '90%';
  container.style.left = '5%';
	container.style.backgroundColor = 'black';
  main.appendChild(container);

	// optional fixation cross
	// var fixationcross = document.createElement('img');
	// fixationcross.src = 'version/bml/images/Gonogo/fixcross.png';
	// fixationcross.style.top = '30%';
	// fixationcross.style.height = '40%';
	// fixationcross.style.position = 'absolute';
	// fixationcross.style.left = '39%'; //42
	// container.appendChild(fixationcross);

  //places the imgs on the screen
  for(var i = 0; i < that.images.length; i++) {
    //creates img
    var newImage = document.createElement("img");
    switch(i) {
      case 0:
        newImage.setAttribute("id", "purp_squ");
        break;
      case 1:
        newImage.setAttribute("id", "purp_tri");
        break;
      case 2:
         newImage.setAttribute("id", "white_squ");
        break;
      case 3:
        newImage.setAttribute("id", "white_tri");
        break;
    }
    newImage.src= that.images[i];
    newImage.style.top = '10%';
		newImage.style.height = '75%';
		newImage.style.position = 'absolute';
		newImage.style.left = '35%';
		newImage.style.zIndex = '10';
    newImage.style.visibility = 'hidden';
    container.appendChild(newImage);
  }

	activity.bottommessage('');

  // footer
  var footer = layout.footer();
  // break
  var br = document.createElement("br");
  footer.appendChild(br);
}

Gonogo.prototype.test = function(){
  var that = this;
	activity.layout()

	document.getElementById('home').onclick = function() {
		activity.resetvars(); //reset variables
		clearInterval(that.experimentInterval);
		if (typeof activity !== 'undefined' && 'processor' in activity) { activity.processor.stop(); }
		if (protocol) { protocol.active = false; }
		subuser = user;
		layout.init();
	}

	// Tutorial - introduces the task
	function instructions1(){
		layout.message('Instructions', "In this game, press the space bar as fast as you can when you see:",
		{Next: function () {jQuery(this).dialog('destroy').remove();
												instructions2();
												}}
											);}

	//Tutorial - shows go shapes
	function instructions2(){
			diologImg(`${that.go1img}`, `${that.go1imgsrc}`,
			{Next: function () {jQuery(this).dialog('destroy').remove();
					diologImg(`${that.go2img}`, `${that.go2imgsrc}`,
									{Next: function () {jQuery(this).dialog('destroy').remove();
									instructions3()}});
				}});
	};

	//Tutorial - use index finger
	function instructions3(){
		layout.message('Instructions', "Use your pointer finger with one hand to press the spacebar.",
		{Next: function () {jQuery(this).dialog('destroy').remove();
												startTutDiolog();
												}}
											);}
	//Tutorial - start
	function startTutDiolog(){
		layout.message("Instructions", `Click the start button to begin the practice round.`,
						{Start: function () {jQuery(this).dialog('destroy').remove();
						tutorial()}});
	}

	//Real game - start
	function startDiolog(){
		if (!that.pressedX) { //don't show this if you've used the exit button
			layout.message('Ready for the real game?', "Press the start button when you are ready for the real game. This game will take 7 minutes. Remember to try your best and go as fast as you can!",
			{Start: function () {jQuery(this).dialog('destroy').remove();
													test();
													}}
												);}
	};

	//Tutorial - instructions dialog
	layout.message('Instructions', "We are going to play some games today. Some might be easy, and some might be hard. Just try your best!",
	{Next: function () {jQuery(this).dialog('destroy').remove();
											instructions1();
											that.pressedX = false;
											activity.resetvars();
											}}
										);

	//TUTORIAL

	//Randomizes order of trials in tutorial
	for(var i = 0; i < 20; i++) { // # of tutorial trials, should be 20
		that.shapeshown[i] = Math.floor(Math.random()*4);
	}

	function trialTutorial() {

		//display shape
	  switch(that.shapeshown[that.trialCounter]) {
	    case 0:
	      that.x = document.getElementById('purp_squ');
	      showImg(that.x);
	      // console.log("showing purp square");
	      break;
	    case 1:
	      that.x = document.getElementById('purp_tri');
	      showImg(that.x);
	      //console.log("showing purp tri");
	      break;
	    case 2:
	      that.x = document.getElementById('white_squ');
	      showImg(that.x);
	      //console.log("showing white square");
	      break;
	    case 3:
	      that.x = document.getElementById('white_tri');
	      showImg(that.x);
	      //console.log("showing white tri");
	      break;
	  }

	  //waits for participant to press the space bar
	  document.addEventListener("keydown", keyDownTextField, false);

	  //get the reaction time when they press space bar and hides the shape
	  function keyDownTextField(e) {
	    var keyCode = e.keyCode;
	    if(keyCode==32) {
	      that.x.style.visibility = 'hidden';
	      var now = new Date().getTime();
	      that.reaction = now - that.shape;
	    }
	  }

	  that.rt.push(that.reaction);

		//calculate accuracy
		if (that.rt.length - 2 == that.accuracy.length) {
		    if(that.shapeshown[that.rt.length-2] == that.go1 || that.shapeshown[that.rt.length-2] == that.go2) {
		      if(that.rt[that.rt.length - 1] > 0) {
		        that.accuracy.push(1); //pressed spacebar for go shape - correct
		      } else {
		        that.accuracy.push(0); //didn't press spacebar for go shape - incorrect
		      }
		    } else {
		      if(that.rt[that.rt.length - 1] > 0) {
		        that.accuracy.push(0); //pressed spacebar for nogo shape - incorrect
		      } else {
		        that.accuracy.push(1); //didn't press spacebar for nogo shape - correct
		      }
		    }
		}

		//if the user gets 5 trials in a row correct, start the real test
		//(does not go to the real test if they avoided pressing the spacebar for 5 nogos in a row!)
		if (that.accuracy.length > 5){
			if (that.accuracy[that.accuracy.length-1] == 1 && that.accuracy[that.accuracy.length-2] == 1 && that.accuracy[that.accuracy.length-3] == 1 && that.accuracy[that.accuracy.length-4] == 1 && that.accuracy[that.accuracy.length-5] == 1){
				if (that.rt[that.rt.length-1] > 0 || that.rt[that.rt.length-2] > 0 || that.rt[that.rt.length-3] > 0 || that.rt[that.rt.length-4] > 0 || that.rt[that.rt.length-5] > 0) {
								activity.resetvars();
								that.shapeshown = [];
								startDiolog();
								clearInterval(that.experimentInterval);
							}
			// if the user does not get 5 trials in a row correct after 20 trials, repeat the instructions and tutorial
			} else if (that.accuracy.length == 20) {
					clearInterval(that.experimentInterval);
					activity.resetvars();
					//randomizes order of trials in tutorial
					for(var i = 0; i < 20; i++) { // # of tutorial trials, should be 20
						that.shapeshown[i] = Math.floor(Math.random()*4);
					}
					//repeat the tutorial instructions
					layout.message('Instructions', "Press the space bar as fast as you can when you see:",
					{Next: function () {jQuery(this).dialog('destroy').remove();
															instructions1();
															that.pressedX = false;
															}}
														);
				}
			}

	  //resets reaction time
	  that.reaction = 0;

		//keeps count of # of trials in tutorial
	  if(that.shapeshown.length >= that.trialCounter+1) {
	    that.trialCounter++;
	  }
	}

	function tutorial() {
	  //calls the trials for 2 seconds repeatedly until it runs out of shapes to show
		that.tutorial = true;
	  trialTutorial();
	  that.experimentInterval = setInterval(trialTutorial, 2000);
	}

	//displays shape for 500 ms
  function showImg(x){
    x.style.visibility = 'visible';
    that.shape = new Date().getTime();
    setTimeout(hide, 500);
    function hide() {
        x.style.visibility = 'hidden';
    }
  }

	//function for each trial (shows shape, captures reaction time)
  function trial(){

      switch(that.nums[that.trialCounter]) {
        case 0:
          that.x = document.getElementById('purp_squ');
          showImg(that.x);
  				//console.log("showing purp squ");
          break;
        case 1:
          that.x = document.getElementById('purp_tri');
          showImg(that.x);
          //console.log("showing purp tri");
          break;
        case 2:
          that.x = document.getElementById('white_squ');
          showImg(that.x);
          //console.log("showing white square");
          break;
        case 3:
          that.x = document.getElementById('white_tri');
          showImg(that.x);
          //console.log("showing white tri");
          break;
      }

      //waits for participant to press the space bar
      document.addEventListener("keydown", keyDownTextField, false);

      //get the reaction time when they press space bar and hides the shape
      function keyDownTextField(e) {
        var keyCode = e.keyCode;
        if(keyCode==32) {
          that.x.style.visibility = 'hidden';
          var now = new Date().getTime();
          that.reaction = now - that.shape;
        }
      }

			// console.log('that.accuracy:')
			// console.log(that.accuracy)
			// console.log('that.rt:')
			// console.log(that.rt)
			// console.log('that.nums:')
			// console.log(that.nums)
			// console.log('that.shapeshown')
			// console.log(that.shapeshown)

			that.rt.push(that.reaction);

      //resets reaction time
      that.reaction = 0;

			// if the user does not press the spacebar for 10 consecutive trials, prompt them
			var recent_rts = that.rt.slice(that.rt.length-10,that.rt.length);
	    var recent_rts_sum = recent_rts.reduce(function(a, b){
	        return a + b;
	    }, 0);

			if (recent_rts_sum == 0 && that.rt.length > 9) {
				activity.bottommessage('Remember: Use the spacebar to play the game!');
			}
			else if (recent_rts_sum > 0) {
				activity.bottommessage('');
			}

      //stops when there are no more shapes to show
      if(that.nums.length >= that.trialCounter+1){
        that.trialCounter++;
      } else {
        clearInterval(that.experimentInterval);
        that.rt.shift();
        score();
  			save();
				if (!that.pressedX){
					layout.message('All done!', "Great Job!",
	  		  {Exit: function () {jQuery(this).dialog('destroy').remove();
	  		                      activity.menu();
	  													activity.resetvars();}}
	  		                    );}
      }

  		//saves the data on the server
  		function save() {
  			jQuery.ajax({
  				async: false,
  				data: {
  					nums: that.nums.toString(),
  					rt: that.rt.toString(),
  					accuracy: that.accuracy.toString(),
  					condition_gonogo: that.condition.toString(),
  					shapeshown: that.shapeshown.toString(),
  					subuser: subuser.ID,
  					user: user.ID
  				},
  				// success: function(data, status) { that.history(); },
  				type: 'POST',
  				url: 'version/'+version+'/php/gonogo.php'
  			});
  		}
  }

	function score(){
		for(i = 0; i < that.nums.length; i++) {
			if(that.nums[i] == that.go1 || that.nums[i] == that.go2) {
				if(that.rt[i] > 0) {
					that.accuracy.push(1);
				} else {
					that.accuracy.push(0);
				}
			} else {
				if(that.rt[i] > 0) {
					that.accuracy.push(0);
				} else {
					that.accuracy.push(1);
				}
			}
		}

		console.log('accuracy');
		console.log(that.accuracy);
		console.log('shapeshown');
		console.log(that.shapeshown);
		console.log('nums');
		console.log(that.nums);
		console.log('condition');
		console.log(that.condition);
		console.log('rt');
		console.log(that.rt);
	}

	function shuffle(array) {
	  array.sort(() => Math.random() - 0.5);
	}

	function test() {
		that.tutorial = false;
		console.log('this is test!')

    //assigns random imgs in a sequence
    //go shapes
  	for(var i = 0; i < 72; i++) {
      that.nums[i] = that.go1;
    }

  	for(var i = 72; i < 144; i++) {
      that.nums[i] = that.go2;
    }

  	for(var i = 144; i < 168; i++) {
      that.nums[i] = that.nogo1;
    }

  	for(var i = 168; i < 192; i++) {
      that.nums[i] = that.nogo2;
    }

    for (let i = 0; i < 1100; i++) {
      shuffle(that.nums);
    }

    for(var i = 0; i < that.nums.length; i++) {
      if(that.nums[i] == that.go1 || that.nums[i] == that.go2) {
        that.condition.push("go");
      } else {
        that.condition.push("no go");
      }
      that.shapeshown.push(that.shapes[that.nums[i]]);
    }

    //calls the trials for 2 seconds repeatedly until it runs out of shapes to show
    trial();
    that.experimentInterval = setInterval(trial, 2000);
  };
}
