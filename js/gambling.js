function gambling(settings){
	activity = new Gambling(settings);
	
	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }

	// initialize
	activity.init();
}
function Gambling(settings){
	this.ID = 'gambling';
	this.disabled = false;
	this.ear = undefined;
	this.gainAB = 100;
	this.gainCD = 50;
	this.init = () => { 
		this.test(); 
		this.test2();
	};
	this.instrument = 'Piano';
	this.interval = undefined;
	this.intervalpair = 0;
	this.intervals = [[0,1],[6,7],[11,12]];
	this.intervalsList = [];
	this.lossAB = 250;
	this.lossCD = 50;
	this.lossProbAC = .5;
	this.lossProbBD = .1;
	this.message = 'Click on a button to collect and/or pay a fee'
	this.mode = 0;
	this.money = 2000;
	this.moneyList = [];
	this.music = undefined; //0 = happy, 1 = sad, 2 = fearful, 3 = peaceful
	this.musicGenre = ['Happy','Sad','Fearful','Peaceful'];
	this.note = undefined;
	this.path = 'data/emotion/music/';
	this.penalty = 0;
	this.penalties = [];
	this.range = [33,72];
	this.ready = 0;
	this.response1 = [];
	this.response2 = [];
	this.response2After = [];
	this.responses = [];
	this.responseTime = [];
	this.root = (this.range[1]+this.range[0])/2;
	this.roots = [];
	this.stimuli = [];
	this.time = 0;
	this.title = 'Gambling';
	this.trial = -1;
	this.trials = 100;
	this.volume = true;
	this.words = ['A','B','C','D'];
	
	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }
	
	// keypress
	document.onkeypress = function (e) {
		e = e || window.event;
		if (e.keyCode == 32 || e.key == 0) { jQuery('#repeat').click(); }
		for (let a = 1; a < 10; a++) {
			if (e.key == a) {
				jQuery('#afc'+String(a-1)).click();
			}
		}
		if (e.key == '?') { activity.settings(); }
	};
}
Gambling.prototype.check = function(){
	let that = this;
	jQuery.ajax({
		data: {
			method: 'incrementMusic',
			subuser: subuser.ID,
			user: user.ID
		},
		error: function (jqXHR, textStatus, errorThrown) { 
			console.log(errorThrown);
			that.music = 0;
			that.test();
		},
		success: function (data, status) {		
			data = jQuery.parseJSON(data);
			whatever = data;
			that.music =  (data[0].music + 1) % 4; 
			console.log(that.music);
			that.test();
		},
		type: 'GET',
		url: 'version/'+version+'/php/gambling.php'
	});
}
Gambling.prototype.instructions = function() {
	let that = this;

	//General instructions for music situation enjoyment
	message = '<b>Rate the valence, arousal, and emotion of the music.</b>' +
	'<br><u>Valence</u> refers to the mood of the melody, which can be negative (unpleasant/bad) or positive (pleasant/good).' + 
	'<br><u>Arousal</u> refers to how exciting the melody is, which can be low (calming/relaxing) or high (exciting/stimulating)<br>' + 
	'<br>Different emotions are characterized by different levels of valence and arousal.' + 
	'<br>  - <b>Happy</b> emotions have a <u>positive valence</u> and <u>high arousal</u>.' + 
	'<br>  - <b>Sad</b> emotions have a <u>negative valence</u> and <u>low arousal</u>.' + 
	'<br>  - <b>Peaceful</b> emotions have a <u>positive valence</u> and <u>low arousal</u>.' + 
	'<br>  - <b>Scary</b> emotions have a <u>negative valence</u> and <u>high arousal</u>.<br><br>';

	// message
	layout.message('Gambling',message,{
		Back: function () {
			jQuery(this).dialog('destroy').remove();
		}
	});
}
Gambling.prototype.instructionsPage2 = function() {
	let that = this;

	var main = layout.main();

	//Create survey division
	var surveyDiv = document.createElement('div');
	surveyDiv.style.marginTop = '25px';
	surveyDiv.style.marginBottom = '25px';
	surveyDiv.className = 'ui-widget-content';
	main.appendChild(surveyDiv);
	
	//General instructions for music situation enjoyment
	surveyDiv.innerHTML = '<b>Instructions:</b>' +
	'<br><b>1.</b> In front of you on the screen, there are 4 decks of cards: A, B, C, and D.' + 
	'<br><b>2.</b> When you begin the game, select one card at a time by clicking on a card from any deck you choose.' + 
	'<br><b>3.</b> Each time you select a card, the computer will tell you that you won some money. You will find out how much money you win as you go along. Every time you win, the total money count will go up.' + 
	'<br><b>4.</b> Every so often, when you click on a card, the computer will tell you that you won some money as usual, but then it will say that you lost some money as well. You will find out when you lose money and how much as you go along. Every time you lose, the total money count will go down.' + 
	'<br><b>5.</b> You are absolutely free to switch from one deck to the other at any time, and as often as you wish.' + 
	'<br><b>6.</b> The goal of the game is to win as much money as possible and avoid losing as much money as possible.' + 
	'<br><b>7.</b> You will not know when the game will end. Simply keep on playing until the computer stops.' +
	'<br><b>8.</b> You will start off the game with $2000 of credit.' +
	'<br><b>9.</b> The only hint that will be provided is this: Out of these four decks of cards, there are some that are worse than others, and to win you should try to stay away from bad decks. No matter how much you find yourself losing, you can still win the game if you avoid the worst decks.' + 
	'<br><b>10.</b> Also note that the computer does not change the order of the cards once the game begins. It does not make you lose at random, or make you lose money based on the last card you picked.' +
	'<br><b>11.</b> Press the “Next” button to start. Good luck! <br>';

	//next button
	var nextButton = document.createElement('button');
	nextButton.id = 'next';
	nextButton.innerHTML = 'next';
	nextButton.onclick = ()=>{
		//surveyTable1.style.display = 'none';
		activity.test2();
		that.next();
	};
	nextButton.style.cssFloat = 'right';
	nextButton.style.display = 'inline';
	nextButton.style.height = '15%';
	nextButton.style.marginLeft = '8px';
	nextButton.style.width = '20%';
	jQuery(nextButton).button();
	if(iOS){FastClick(nextButton)}
	main.appendChild(nextButton);
}
Gambling.prototype.intro = function() {
	var that = this;

	var main = layout.main();

	//Create survey division
	var surveyDiv = document.createElement('div');
	surveyDiv.style.marginTop = '25px';
	surveyDiv.style.marginBottom = '25px';
	surveyDiv.className = 'ui-widget-content';
	main.appendChild(surveyDiv);
	
	//General instructions for music situation enjoyment
	surveyDiv.innerHTML = '<b>Instructions:</b>' +
	'<br>Please listen to the background music without performing any other tasks. After 8 minutes, press the begin button.';

	//begin button
	var beginButton = document.createElement('beginbutton');
	beginButton.id = 'Begin';
	beginButton.innerHTML = 'Begin';
	beginButton.onclick = ()=>{
		//surveyTable1.style.display = 'none';
		that.load();
		//activity.next();
		activity.disabled = false;
	};
	beginButton.style.cssFloat = 'right';
	beginButton.style.display = 'inline';
	beginButton.style.height = '15%';
	beginButton.style.marginLeft = '8px';
	beginButton.style.width = '20%';
	jQuery(beginButton).button();
	if(iOS){FastClick(beginButton)}
	main.appendChild(beginButton);
	jQuery(beginButton).button('option','disabled',true);
	setTimeout(()=>{jQuery(beginButton).button('option','disabled',false)},(1000*60*8)); //*60*8

	// volume
	if (this.volume) {
		gui.gain();
	}

}
Gambling.prototype.load = function() {
	let that = this;//extended scope

	var main = layout.main();
	currQuestionNumber = 0;
	//var surveyTable = [];

	//Create survey division
	var surveyDiv = document.createElement('div');
	surveyDiv.style.marginTop = '25px';
	surveyDiv.style.marginBottom = '25px';
	surveyDiv.className = 'ui-widget-content';
	main.appendChild(surveyDiv);
	
	//General instructions for music situation enjoyment
	surveyDiv.innerHTML = '<b>Please rate the valence, arousal, and emotion of the music.</b><br><br>';

	// Generation of questions and answers
	possibleVals = ['Completely Negative', 'Negative', 'Somewhat Negative', 'Neither Negative nor Positive', 'Somewhat Positive', 'Positive','Completely Positive'];
	possibleVals2 = ['Very Relaxing','Relaxing','Somewhat Relaxing','Neither Relaxing nor Stimulating','Somewhat Stimulating','Stimulating','Very Stimulating'];
	possibleVals3 = ['Sad', 'Scary/Fearful', 'Peaceful', 'Happy/Joyful'];

	function loadTable(tableNumber,tableName,possibleVals,surveyTable) {	
		let that = this;
		
		//Create survey table
		surveyTable.style.width = '100%';
		surveyTable.style.border = 'thin solid black';
		surveyTable.style.borderStyle = 'separate';
		surveyTable.style.borderSpacing = '0px';
		surveyTable.style.paddingTop = '10px';
		surveyTable.style.paddingBottom = '10px';
		surveyTable.style.rules = 'all';
		surveyTable.style.border
		surveyDiv.appendChild(surveyTable);
		var rowIndex = -1;
	
		//Generation of table subheading
		var row = surveyTable.insertRow(++rowIndex);
		row.style.width = '100%';
	
		//row.style.border = 'thin solid black';
	
		var cell = row.insertCell(0);
		//cell.innerHTML = '<b>Source</b>';
		cell.style.textAlign = 'center';
		cell.style.width = '20%';
		//cell.style.border = 'thick solid black';
	
		cellInd = 0;
		cellWidth = (100-40) / possibleVals.length;
	
		for(valProp of possibleVals) {
	
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			//cell.style.border = 'thick solid black';
			cell.style.textAlign = 'center';
	
			cell.innerHTML = '<b>' + valProp + '</b>';
		}
	
		//Rate the valence, arousal, or emotion
		var row = surveyTable.insertRow(++rowIndex);
		row.style.width = '100%';
	
		row.style.border = 'thin solid black';
	
		currQuestionNumber++;
	
		var cell = row.insertCell(0);
		cell.innerHTML = tableName;
		cell.style.textAlign = 'left';
		cell.style.width = '20%';
		//cell.style.border = 'thin solid black';
	
		cellInd = 0;
		cellWidth = (100-20) / possibleVals.length;
	
		//
		for(val=0; val<possibleVals.length; val++) {
	
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			cell.style.border = 'thin solid black';
			cell.style.textAlign = 'center';
	
			var radiotest = document.createElement('input');
			radiotest.name=currQuestionNumber-1;
			radiotest.type='radio';
			radiotest.style.display = 'inline-block';
			radiotest.value=val;
	
			radiotest.onchange = function () {
				activity.response1[this.name] = Number(this.value);
				console.log(activity.response1);
				if ((activity.response1[0]!==undefined)&&(activity.response1[1]!==undefined)&&(activity.response1[2]!==undefined)){
					jQuery(nextButton).button('option','disabled',false);
				}
			};
	
			cell.appendChild(radiotest);
		}
	}
	
	var surveyTable1 = document.createElement('table');
	var surveyTable2 = document.createElement('table');
	var surveyTable3 = document.createElement('table');


	loadTable(0,'Valence',possibleVals,surveyTable1);
	loadTable(1,'Arousal',possibleVals2,surveyTable2);
	loadTable(2,'Emotion',possibleVals3,surveyTable3);

	// instructions button
	var button = document.createElement('button');
	button.id = 'instructions';
	button.innerHTML = 'instructions';
	button.onclick = ()=>{that.instructions()};
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.height = '15%';
	button.style.marginLeft = '8px';
	button.style.width = '20%';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	main.appendChild(button);

	//next button
	var nextButton = document.createElement('button');
	nextButton.id = 'next';
	nextButton.innerHTML = 'next';
	nextButton.onclick = ()=>{
		surveyTable1.style.display = 'none';
		that.load2();
	};
	nextButton.style.cssFloat = 'right';
	nextButton.style.display = 'inline';
	nextButton.style.height = '15%';
	nextButton.style.marginLeft = '8px';
	nextButton.style.width = '20%';
	jQuery(nextButton).button();
	if(iOS){FastClick(nextButton)}
	main.appendChild(nextButton);
	jQuery(nextButton).button('option','disabled',true);
}
Gambling.prototype.load2 = function() {
	let that = this;//extended scope

	var main = layout.main();
	currQuestionNumber = 0;
	//var surveyTable = [];

	//Create survey division
	var surveyDiv = document.createElement('div');
	surveyDiv.style.marginTop = '25px';
	surveyDiv.style.marginBottom = '25px';
	surveyDiv.className = 'ui-widget-content';
	main.appendChild(surveyDiv);
	
	//General instructions for music situation enjoyment
	surveyDiv.innerHTML = '<b>Please rate how happy, fearful, positive, and aroused you feel.</b><br>';

	// Generation of questions and answers
	possibleVals = ['1 (Completely Unhappy)', '2', '3', '4','5 (Neither Happy nor Unhappy)', '6', '7', '8','9','10 (Completely Happy)'];
	possibleVals2 = ['1 (Completely Fearless)', '2', '3', '4','5 (Neither Fearful nor Fearless)', '6', '7', '8','9','10 (Completely Fearful)'];
	possibleVals3 = ['1 (Completely Negative)', '2', '3', '4','5 (Neither Positive nor Negative)', '6', '7', '8','9','10 (Completely Positive)'];
	possibleVals4 = ['1 (Completely Calm)', '2', '3', '4','5 (Neither Aroused nor Calm)', '6', '7', '8','9','10 (Completely Aroused)'];

	function loadTable(tableNumber,tableName,possibleVals,surveyTable) {	
		let that = this;
		
		//Create survey table
		surveyTable.style.width = '100%';
		surveyTable.style.border = 'thin solid black';
		surveyTable.style.borderStyle = 'separate';
		surveyTable.style.borderSpacing = '0px';
		//surveyTable.style.paddingTop = '10px';
		//surveyTable.style.paddingBottom = '10px';
		surveyTable.style.rules = 'all';
		surveyTable.style.border
		surveyDiv.appendChild(surveyTable);
		var rowIndex = -1;
	
		//Generation of table subheading
		var row = surveyTable.insertRow(++rowIndex);
		row.style.width = '100%';
	
		//row.style.border = 'thin solid black';
	
		var cell = row.insertCell(0);
		//cell.innerHTML = '<b>Source</b>';
		cell.style.textAlign = 'center';
		cell.style.width = '20%';
		//cell.style.border = 'thick solid black';
	
		cellInd = 0;
		cellWidth = (100-40) / possibleVals.length;
	
		for(valProp of possibleVals) {
	
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			//cell.style.border = 'thick solid black';
			cell.style.textAlign = 'center';
			cell.style.fontSize = 'medium';

	
			cell.innerHTML = '<b>' + valProp + '</b>';
		}
	
		//Rate how happy, fearful, positive, or aroused you feel
		var row = surveyTable.insertRow(++rowIndex);
		row.style.width = '100%';
	
		row.style.border = 'thin solid black';
	
		currQuestionNumber++;
	
		var cell = row.insertCell(0);
		cell.innerHTML = tableName;
		cell.style.textAlign = 'left';
		cell.style.width = '20%';
		//cell.style.fontSize = 'medium';
		//cell.style.border = 'thin solid black';
	
		cellInd = 0;
		cellWidth = (100-20) / possibleVals.length;
	
		//
		for(val=0; val<possibleVals.length; val++) {
	
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			cell.style.border = 'thin solid black';
			cell.style.textAlign = 'center';
	
			var radiotest = document.createElement('input');
			radiotest.name=currQuestionNumber-1;
			radiotest.type='radio';
			radiotest.style.display = 'inline-block';
			radiotest.value=val;
	
			radiotest.onchange = function () {
				if (activity.trial >= activity.trials) {
					activity.response2After[this.name] = Number(this.value);
					console.log(activity.response2After);
					if ((activity.response2After[0]!==undefined)&&(activity.response2After[1]!==undefined)&&(activity.response2After[2]!==undefined)&&(activity.response2After[3]!==undefined)){
						jQuery(nextButton).button('option','disabled',false);
					}					
				} else {
					activity.response2[this.name] = Number(this.value);
					console.log(activity.response2);
					if ((activity.response2[0]!==undefined)&&(activity.response2[1]!==undefined)&&(activity.response2[2]!==undefined)&&(activity.response2[3]!==undefined)){
						jQuery(nextButton).button('option','disabled',false);
					}
				}
			};
	
			cell.appendChild(radiotest);
		}
	}
	
	var surveyTable1 = document.createElement('table');
	var surveyTable2 = document.createElement('table');
	var surveyTable3 = document.createElement('table');
	var surveyTable4 = document.createElement('table');


	loadTable(0,'To what extent do you feel happy right now?',possibleVals,surveyTable1);
	loadTable(1,'To what extent do you feel fearful right now?',possibleVals2,surveyTable2);
	loadTable(2,'To what extent do you feel positive right now?',possibleVals3,surveyTable3);
	loadTable(3,'To what extent do you feel aroused right now?',possibleVals4,surveyTable4);
	
	//next button
	var nextButton = document.createElement('button');
	nextButton.id = 'next';
	nextButton.innerHTML = 'next';
	nextButton.onclick = ()=>{
		surveyTable1.style.display = 'none';
		if (this.trial >= this.trials) { 
			this.save(); 
			source.stop();
		} else {that.instructionsPage2();}		
	};
	nextButton.style.cssFloat = 'right';
	nextButton.style.display = 'inline';
	nextButton.style.height = '15%';
	nextButton.style.marginLeft = '8px';
	nextButton.style.width = '20%';
	jQuery(nextButton).button();
	if(iOS){FastClick(nextButton)}
	main.appendChild(nextButton);
	jQuery(nextButton).button('option','disabled',true);
}
Gambling.prototype.menu = function () {	
	// main
	let main = layout.main(
		this.title, 
		() => { this.back ? this.back() : layout.menu() },
		{ Settings: () => { this.settings() } }
	);
	
	// test button
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Test';
	button.onclick = () => { this.test(); };
	button.style.fontSize = '150%';
	button.style.height = '40%';
	button.style.left = '8%';
	button.style.position = 'absolute';
	button.style.top = '30%';
	button.style.width = '38%';
	var img = document.createElement('img');
	img.src = 'images/speech.png';
	img.style.height = '60%';
	jQuery(button).button();
	button.appendChild(img);
	main.appendChild(button);
	if(iOS){FastClick(button)}
	
	// results button
	var button = document.createElement('button');
	button.className = 'response';
	button.innerHTML = 'Results';
	button.onclick = () => { this.results(); };
	button.style.fontSize = '150%';
	button.style.height = '40%';
	button.style.right = '8%';
	button.style.position = 'absolute';
	button.style.top = '30%';
	button.style.width = '38%';
	var img = document.createElement('img');
	img.src = 'images/results.png';
	img.style.height = '60%';
	jQuery(button).button();
	button.appendChild(img);
	main.appendChild(button);
	if(iOS){FastClick(button)}
	
	// footer
	layout.footer();
};
Gambling.prototype.next = function(){
	let that = this;//extended scope

	if (document.getElementById('message') !== null) {document.getElementById('message').innerHTML = this.message;}

	// increment trial
	this.trial++;
	//score.innerHTML = 'Trials remaining: '+String(this.trials-this.trial-1);
	
	// end run
	if (this.trial == this.trials) { 
		that.load2();
		//this.save(); 
		//source.stop();
		jQuery('#next').button('disable');
		return; 
	}
	
	// enable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('enable'); }
	this.disabled = false;
	
	// roving
	//this.note = this.range[0]+Math.round((this.range[1]-this.range[0])*Math.random());
	//this.roots.push(this.note);
	
	// stimulus
	//this.stimulus();

	jQuery('#next').button('disable');

	this.time = Date.now();
}
Gambling.prototype.preload = function () {
	var that = this;

	// set to 1
	activity.ready++;
	
	// disable start
	jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
	jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');
		
	// load audio function
	var counter = 0;
	function loadAudio(a) {
		var request = new XMLHttpRequest();
		var url = that.path+that.musicGenre[a]+'.wav';
		console.log(url);
		request.index = a;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function (a) {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				if (counter == 1) {
					activity.ready--;
					if (activity.ready == 0) {
						jQuery('.ui-dialog-buttonpane #message').html('Ready.&nbsp;');
						jQuery(".ui-dialog-buttonpane button:contains('Start')").button('enable');
					}
				}
			});
		};
		request.send();
	}
	
	// load audio
	//for (var a = 0; a < that.musicGenre.length; a++) { loadAudio(a); } 
	loadAudio(that.music);

};
Gambling.prototype.response = function(button){
	if(this.disabled){return}
	
	let elapsedTime = Date.now() - this.time;
	this.responseTime.push(elapsedTime);

	// disable buttons
	for (let a = 0; a < this.words.length; a++) { jQuery('#afc'+a).button('disable'); }
	jQuery('#next').button('enable');
	this.disabled = true;
	let fadeTime = 1500;

	if ((button.index==0) || (button.index==2)){
		if (Math.random()<this.lossProbAC){
			this.penalty = 1;
		} else {
			this.penalty = 0;
		}
	}

	if ((button.index==1) || (button.index==3)){
		if (Math.random()<this.lossProbBD){
			this.penalty = 1;
		} else {
			this.penalty = 0;
		}
	}

	if ((button.index==0)||(button.index==1)){
		if (this.penalty==0){
			var img = document.createElement('img');
			img.src = 'images/cash.png';
			img.style.bottom = '60%';
			img.style.height = '30%';
			img.style.position = 'absolute';
			img.style.right = '18%';
			img.style.zIndex = '10';
			button.appendChild(img);
			jQuery(img).fadeOut(fadeTime);

			document.getElementById('message').innerHTML = 'You win $100. Press next to continue.'
			this.money = this.money + this.gainAB;
			score.innerHTML = 'Your money: $'+this.money;
		} else {
			var img = document.createElement('img');
			img.src = 'images/cash.png';
			img.style.bottom = '60%';
			img.style.height = '30%';
			img.style.position = 'absolute';
			img.style.right = '18%';
			img.style.zIndex = '10';
			button.appendChild(img);
			jQuery(img).fadeOut(fadeTime);

			var imgWhammy = document.createElement('img');
			imgWhammy.src = 'images/whammy.png';
			imgWhammy.style.bottom = '10%';
			imgWhammy.style.height = '35%';
			imgWhammy.style.position = 'absolute';
			imgWhammy.style.right = '-10%';
			imgWhammy.style.zIndex = '10';
			button.appendChild(imgWhammy);
			jQuery(imgWhammy).fadeOut(fadeTime);

			document.getElementById('message').innerHTML = 'You win $100. Fee of $250 applies now! Press next to continue.'
			this.money = this.money + this.gainAB - this.lossAB;
			score.innerHTML = 'Your money: $'+this.money;
		}
	} else{
		if (this.penalty==0){
			var img = document.createElement('img');
			img.src = 'images/cash.png';
			img.style.bottom = '60%';
			img.style.height = '30%';
			img.style.position = 'absolute';
			img.style.right = '18%';
			img.style.zIndex = '10';
			button.appendChild(img);
			jQuery(img).fadeOut(fadeTime);

			document.getElementById('message').innerHTML = 'You win $50. Press next to continue.'
			this.money = this.money+this.gainCD;
			score.innerHTML = 'Your money: $'+this.money;
		} else {
			var img = document.createElement('img');
			img.src = 'images/cash.png';
			img.style.bottom = '60%';
			img.style.height = '30%';
			img.style.position = 'absolute';
			img.style.right = '18%';
			img.style.zIndex = '10';
			button.appendChild(img);
			jQuery(img).fadeOut(fadeTime);

			var imgWhammy = document.createElement('img');
			imgWhammy.src = 'images/whammy.png';
			imgWhammy.style.bottom = '10%';
			imgWhammy.style.height = '35%';
			imgWhammy.style.position = 'absolute';
			imgWhammy.style.right = '-10%';
			imgWhammy.style.zIndex = '10';
			button.appendChild(imgWhammy);
			jQuery(imgWhammy).fadeOut(fadeTime);

			document.getElementById('message').innerHTML = 'You win $50. Fee of $50 applies now! Press next to continue.'
			score.innerHTML = 'Your money: $'+this.money;
		}
	}

	// log call and response
	//if ((this.interval==0)||(this.interval==7)||(this.interval==12)) {this.call=0;}
	//if ((this.interval==1)||(this.interval==6)||(this.interval==11)) {this.call=1;}
	//this.calls.push(this.call);
	//this.intervalsList.push(this.interval);
	this.responses.push(button.index);
	this.penalties.push(this.penalty);
	this.moneyList.push(this.money);
	console.log('response: ',this.responses,'penalties: ',this.penalties,'moneylist: ',this.moneyList,'responseTime: ',this.responseTime);
}
Gambling.prototype.results = function(){
	let that = this;
	
	// main
	let main = layout.main('Results', ()=>{ this.menu(); });
	
	// footer
	layout.footer();
	
	// loading...
	var span = document.createElement('span');
	span.id = 'loading';
	span.innerHTML = 'Loading...';
	main.appendChild(span);
		
	// database GET
	jQuery.ajax({
		data: {
			password: user.password,
			subuser: subuser ? subuser.ID : 72,
			user: user ? user.ID : 72
		},
		success: function(data, status) {
			// remove the loading child
			document.getElementById('main').removeChild(document.getElementById('loading'));

			console.log(data);
			
			// parse results
			results = jQuery.parseJSON(data);
			results.sort(compare);
			//results.reverse();
			
			// no results
			if (results.length == 0) {
				main.insertAdjacentHTML('beforeend','No results.');
				return;
			}
			
			// summary chart (init)
			var resultsSorted = [];
			var summary = document.createElement('div');
			summary.style.height = '50%';
			main.appendChild(summary);
	
			// details
			main.insertAdjacentHTML('beforeend','<h3>History</h3>');
		
			// horizontal rule
			main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');
	
			// accordion (init)	
			var accordion = document.createElement('div');
			accordion.id = 'results';
			main.appendChild(accordion);
		
			// accordion (content)
			for (let item = 0, items = results.length; item < items; item++) {
				var result = results[item];
				
				// score
				var score;
				try {
					score = percentCorrect(result.calls.split(','),result.responses.split(','));
					score = Number(score.toFixed(1));
				} catch (err) {
					try {
						score = result.score;
					} catch (err) {
						score = undefined;
					}
				}
					
				// heading
				var heading = document.createElement('h3');
				heading.innerHTML = result.entry+' &rarr; '+score+'%';
				accordion.appendChild(heading);
				
				// container
				var container = document.createElement('div');
				accordion.appendChild(container);
				
				// information
				for (var key in result) {
					container.insertAdjacentHTML('beforeend',key+': '+result[key]+'<br>');
				}
				container.setAttribute('unselectable','off');
				
				// chart into container
				var chart_div = document.createElement('div');
				chart_div.style.width = '80%';
				container.appendChild(chart_div);
				
				// sort results for summary plot
				resultsSorted.push([1, score]);
			}
	
			// accordion (activate)
			jQuery(accordion).accordion({
				active: false,
				collapsible: true,
				heightStyle: 'content'
		   });
		
			// summary chart
			if ('material' in that && 'summaryChart' in that.material) {
				that.material.summaryChart(resultsSorted,summary);
			} else {
				var data = [];
				data[0] = ['something','my-title'];
				for (var a = 0; a < resultsSorted.length; a++) {
					data.push(resultsSorted[a]);
				}
				var data = google.visualization.arrayToDataTable(data);
				var options = {
					chartArea: {width: '70%'},
					hAxis: {scaleType: 'linear'},
					title: 'title',
					vAxis: {maxValue: 100, minValue: 0, title: 'Percent Correct'}
				};
				var chart = new google.visualization.ScatterChart(summary);
				chart.draw(data, options);
			}
		},
		error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
		type: 'GET',
		url: 'version/'+version+'/php/gambling.php'
	});
};
Gambling.prototype.save = function(data){
	// save to database
	jQuery.ajax({
		data: {
			ear: this.ear,
			gain: MASTERGAIN,
			gainAB: this.gainAB,
			gainCD: this.gainCD,
			lossAB: this.lossAB,
			lossCD: this.lossCD,
			lossProbAC: this.lossProbAC,
			lossProbBD: this.lossProbBD,
			moneyList: this.moneyList.join(','),
			music: this.music,
			notes: this.notes,
			penalties: this.penalties.join(','),
			response1: this.response1.join(','),
			response2: this.response2.join(','),
			response2After: this.response2After.join(','),
			responses: this.responses.join(','),
			responseTime: this.responseTime.join(','),
			subuser: subuser.ID,
			user: user.ID
		},
		error: function(jqXHR,textStatus,errorThrown){alert(errorThrown)},
		success: function(data, status){
			if (protocol.active) {
				protocol.IDs.push(data);
				protocol.next();
			} else {
				activity.menu();
			}
		},
		type: 'POST',
		url: 'version/'+version+'/php/gambling.php'
	});
	console.log(data);
}
Gambling.prototype.settings = function(){
	let that = this;
	
	// main
	let main = layout.main(
		'Settings',
		() => { this.menu(); },
		{ Test: () => { this.test(); } }
	);
	
	// settings table
	var table = document.createElement('table');
	table.className = 'ui-widget-content';
	table.style.fontSize = '80%';
	table.style.width = '100%';
	main.appendChild(table); 
	var rowIndex = -1;

	// Music
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Stimulus mode:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var musiceOptions = ['Happy','Sad','Fearful','Peaceful'];
	var select = layout.select(['Happy','Sad','Fearful','Peaceful']);
	select.onchange = function () { 
		that.music = musiceOptions.indexOf(this.value); 
		console.log(that.music);
	};
	cell.appendChild(select);
	if (widgetUI) { jQuery(select).selectmenu({change:select.onchange}); }
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	// notes
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Notes:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var input = document.createElement('input');
	input.onblur = function () { that.notes = this.value; };
	input.style.width = '100%';
	if (widgetUI) {
		input.style.textAlign = 'left';
		jQuery(input).button();
	}
	cell.appendChild(input);
	var cell = row.insertCell(2);
	cell.style.width = '20%';

	// footer
	layout.footer();
}
Gambling.prototype.stimulus = function(){	
	let that = this;

	// play interval
	console.log(this.stimuli);
	console.log('music: ',this.music);
	processor.signal(this.stimuli[this.music],0,0,1,1);
};
Gambling.prototype.test = function(){
	let that = this;//extended scope

	console.log('test')

	// check database for level
	if (typeof this.music === 'undefined') {
		this.check(); return;
	}

	// reset
	this.interval = undefined;
	this.money = 2000;
	this.moneyList = [];
	this.penalties = [];
	this.response1 = [];
	this.response2 = [];
	this.response2After = [];
	this.responses = [];
	this.responseTime = [];
	this.trial = -1;

	// exit button
	let exit = document.getElementById('logout');
	exit.onclick = function () {
		if(typeof source!=='undefined'){source.stop()}
		if (protocol && protocol.active) { 
			protocol.active = false; 
			if ('callback' in protocol) { 
				protocol.callback(); 
			}
		} else { 
			that.menu();
		}
		this.style.visibility = 'hidden';
	};
	exit.src = 'images/exit.png';
	exit.style.visibility = 'visible';
	exit.title = 'exit test';

	// message
	layout.message('Gambling','In this exercise, you will listen to music for 8 minutes, then perform a task.',{
		Start: function () {
			jQuery(this).dialog('destroy').remove();
			that.intro();
			that.stimulus();
			jQuery(".ui-dialog-buttonpane button:contains('Begin')").button('disable');
		}
	});

	activity.preload();

}
Gambling.prototype.test2 = function(){
	let that = this;//extended scope
		
	// exit button
	let exit = document.getElementById('logout');
	exit.onclick = function () {
		if(typeof source!=='undefined'){source.stop()}
		if (protocol && protocol.active) { 
			protocol.active = false; 
			if ('callback' in protocol) { 
				protocol.callback(); 
			}
		} else { 
			that.menu();
		}
		this.style.visibility = 'hidden';
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
	main.appendChild(container);
	
	// button table
	var table = document.createElement('table');
	table.id = 'response_table';
	table.style.height = '100%';
	table.style.width = '100%';
	container.appendChild(table);

	// response buttons
	var cells = this.words.length;
	for (let a = 0; a < this.words.length; a++) {				
		// insert cell into table
		if (a%cells == 0) {
			var row = table.insertRow(a/cells);
			row.style.height = '100%';
			row.style.width = '100%';
		}
		var cell = row.insertCell(a%cells);
		cell.style.width = '25%';

		// response buttons
		var button = document.createElement('button');
		button.className = 'response';
		button.id = 'afc'+a;
		button.index = a;
		button.innerHTML = this.words[a];
		button.onclick = function(){ that.response(this); };
		button.style.fontSize = '200%';
		button.style.height = '100%';
		button.style.padding = '0%';
		button.style.width = '100%';
		button.value = 0;
		jQuery(button).button();

		// button in cell
		cell.appendChild(button);
		if(iOS){FastClick(button)}
	}
		
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
	message.id = 'message';
	message.innerHTML = this.message;
	message.style.display = 'inline-block';
	message.style.fontWeight = 'bold';
	message.style.height = '100%';
	message.style.width = '50%';
	controls.appendChild(message);
	
	// next button
	var button = document.createElement('button');
	button.id = 'next';
	button.innerHTML = 'next';
	button.onclick = ()=>{this.next()};
	button.style.cssFloat = 'right';
	button.style.display = 'inline';
	button.style.height = '100%';
	button.style.marginLeft = '8px';
	jQuery(button).button();
	if(iOS){FastClick(button)}
	controls.appendChild(button);
	
	// footer
	var footer = layout.footer();
	
	// score indicator
	var score = document.createElement('span');
	score.id = 'score';
	score.insertAdjacentHTML('beforeend',' Your money: $'+this.money);
	score.style.paddingLeft = '16px';
	score.style.verticalAlign = 'bottom';
	footer.appendChild(score);
	
	// break
	var br = document.createElement("br");
	footer.appendChild(br);
	
	// adaptive variable
	if(this.behavior=='Adaptive'){
		var label = document.createElement('span');
		label.id = 'adaptive';
		label.innerHTML = 'Adaptive variable: '+String(this.adaptive.value);
		label.style.paddingLeft = '16px';
		label.style.verticalAlign = 'bottom';
		footer.appendChild(label);
	}

}