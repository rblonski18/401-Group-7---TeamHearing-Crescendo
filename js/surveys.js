// load scripts
loadscripts();
loadscript('main');

// surveys
function surveys() {
	activity = new Surveys();
	activity.maindiv();
}
function Surveys() {
	this.survey = 'MLEQ';
	this.surveys = ['MLEQ', 'MTEQ', 'UCMLQ']
}
Surveys.prototype.maindiv = function () {
	that = this;
	
	// header
	header = layout.header();
	
	// main
	main = layout.main('Surveys', false, {
		Start: function () { loadsurvey(that.survey)}
	});
	
	// surveys division
	var surveyDiv = document.createElement('div');
	surveyDiv.className = 'ui-widget-content';
	jQuery(main).append(surveyDiv);
	
	// surveys table
	var table = document.createElement('table');
	table.style.width = '100%';
	jQuery(surveyDiv).append(table);
	var rowIndex = -1;

	
	// Select survey:	
	var select = document.createElement('select');
	select.style.fontSize = '100%';
	select.onchange = function () {
		that.survey = this.value;
	};
	select.style.width = '100%';
	jQuery.each(this.surveys, function(index, value) {
		var option = document.createElement('option');
		option.innerHTML = value;
		option.value = value;
		jQuery(select).append(option);
	});
	select.value = that.survey;
	layoutTableRow(table,++rowIndex,'Select survey:',select,'');
	
	// footer
	layout.footer(true);
};


function loadsurvey(surveyType) {
	console.log(surveyType)
	
	switch(surveyType) {
		case "MLEQ": loadMLEQ(); break;
		case "MTEQ": loadMTEQ(); break;
		case 'UCMLQ': loadUCMLQ(); break;
	}
}

function loadMLEQ() {
	//CHANGE EVERY TIME A FUNDAMENTAL CHANGE TO ORDER OF QUESTIONS OR INFORMATION IS MADE (makes pulling data easier)
	MLEQversion = '0.1.0';
	
	main = layout.main('MLEQ');
	console.log('a');
		
	currQuestionNumber = 0;
	var optionalQuestions = [];
	var respdata = {};
	var allQuestions = [];
	
	main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');
	
	//Create survey division
	var surveyDiv = document.createElement('div');
	surveyDiv.className = 'ui-widget-content';
	main.appendChild(surveyDiv);

	//Create survey table
	var surveyTable = document.createElement('table');
	surveyTable.style.width = '100%';
	surveyDiv.appendChild(surveyTable);
	var rowIndex = -1;
		
	//Speech perception opinion
	var row = surveyTable.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
		
	currQuestionNumber++;		
		
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') How well do you think you can perceive speech?';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
		
	var speechperc = layout.select(['Not at all', 'Poorly', 'Neutral', 'Well', 'Very well']);
	speechperc.value = '';
		
	speechperc.onchange = function () {
		respdata['1_response'] = this.value;
		console.log(respdata);
	};
	
	cell.appendChild(speechperc);
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	//Satisfaction question
	var row = surveyTable.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') How satisfied are you with your ability to hear (with CIs or HAs)?';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
		
	var aidsatisfaction = layout.select(['Unsatisfied', 'Indifferent', 'Neutral', 'Well', 'Very well']);
	aidsatisfaction.value = '';
		
	aidsatisfaction.onchange = function () {
		respdata['2_response'] = this.value;
		console.log(respdata);
	};
	
	cell.appendChild(aidsatisfaction);
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	//break line
	var row = surveyTable.insertRow(++rowIndex);
	row.style.width = '100%';
	
	currCell = -1;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = '<hr>';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	//Expectations question
	var row = surveyTable.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;

	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') Overall, has your current device (HAs or CIs) met your expectations?';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
		
	var aidexpectation = layout.select(['No', 'Yes', 'Unsure']);
	aidexpectation.value = '';
			
	aidexpectation.onchange = function () {
		respdata['3_response'] = this.value;
		console.log(respdata);
	};
	
	cell.appendChild(aidexpectation);
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	//Comment expectations
	var row = surveyTable.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') Feel free to comment on your answer to the above:';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
	
	var aidexpectationcomments = document.createElement('textarea');
	aidexpectationcomments.style.fontSize = '100%';
	aidexpectationcomments.style.width = '100%';
		
	aidexpectationcomments.onblur = function () {
		respdata['4_response'] = this.value;
		console.log(respdata);
	};
	
	//Noting as optional question
	optionalQuestions.push(currQuestionNumber);
	
	cell.appendChild(aidexpectationcomments);
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	//break line
	var row = surveyTable.insertRow(++rowIndex);
	row.style.width = '100%';
	
	currCell = -1;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = '<hr>';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';

	
	//Music oftenness question
	var row = surveyTable.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') How often do you choose to listen to music?';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
		
	var musicoften = layout.select(['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often']);
	musicoften.value = '';
	
	musicoften.onchange = function () {
		respdata['5_response'] = this.value;
		console.log(respdata);
	};
	
	cell.appendChild(musicoften);
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	//Hours listened to music per week question
	//In future, allow only numeric input using 
	//this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');" for oninput firing
	var row = surveyTable.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') Approximately how many hours per week do you listen to music?';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
	
	var musichours = document.createElement('input');
	musichours.style.fontSize = '100%';
	musichours.style.width = '100%';
	
	musichours.onblur = function () {
		respdata['6_response'] = this.value;
		console.log(respdata);
	};
	
	cell.appendChild(musichours);
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	
	
	//Create survey division 2
	var surveyDiv2 = document.createElement('div');
	surveyDiv2.style.marginTop = '25px';
	surveyDiv2.className = 'ui-widget-content';
	main.appendChild(surveyDiv2);
		
	
	//General instructions for music situation enjoyment
	surveyDiv2.innerHTML = '<b>On a scale of 1-5, how much do you enjoy listening to music from the following sources?' +
							'<br>(1 = do not at all enjoy and 5 = very much enjoy)<br>(NA = not applicable or no experience)</b><br><br>';

	
	//Create survey table 2
	var surveyTable2 = document.createElement('table');
	surveyTable2.style.width = '100%';
	surveyTable2.style.border = 'thin solid black';
	surveyTable2.style.borderStyle = 'separate';
	surveyTable2.style.borderSpacing = '0px';
	surveyTable2.style.rules = 'all';
	surveyTable2.style.border
	surveyDiv2.appendChild(surveyTable2);
	var rowIndex = -1;
	
	
	//Asking about their liking music in certain scenarios
	
	//Generation of questions and answers
	possibleVals = ['NA', '1', '2', '3', '4', '5'];
	typesOfMusic = ['Radio in the car', 'Radio at home or work', 'Radio via direct audio input', 
					'Tape/Record/CD in the car', 'Tape/Record/CD at home or work', 'Tape/Record/CD via direct audio input',
					'Choir in a place of worship', 'Organ or other instruments in a place of worship',
					'Classical music at a live concert', 'Jazz music at a live concert', 'Popular or rock music at a live concert', 'Other music at a live concert (please specify in the comments below)',
					'Music when you or a family member are playing an instrument', 'Singing when you or a family member are singing', 
					'Background music from the TV', 'Background music in a movie', 'Background music at a social event', 'Background music at a store, restaurant, or other from a PA system']
	
	var row = surveyTable2.insertRow(++rowIndex);
	row.style.width = '100%';
	
	row.style.border = 'thin solid black';
	
	var cell = row.insertCell(0);
	cell.innerHTML = '<b>Source</b>';
	cell.style.textAlign = 'center';
	cell.style.width = '40%';
	cell.style.border = 'thick solid black';
	
	cellInd = 0;
	cellWidth = (100-40) / possibleVals.length;
	
	for(valProp of possibleVals) {
			
		var cell = row.insertCell(++cellInd);
		cell.style.width = cellWidth.toString() + '%';
		cell.style.border = 'thick solid black';
		cell.style.textAlign = 'center';
		
		cell.innerHTML = '<b>' + valProp + '</b>';
	}
	
	for(musicType of typesOfMusic){
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		
		row.style.border = 'thin solid black';

		currQuestionNumber++;
		
		var cell = row.insertCell(0);
		cell.innerHTML = currQuestionNumber.toString() + ') ' + musicType;
		allQuestions.push(cell.innerHTML);
		cell.style.textAlign = 'left';
		cell.style.width = '40%';
		cell.style.border = 'thin solid black';
		
				
		/*
		var radiolabel = document.createElement('label')
		radiolabel.className = 'radio-inline';
		radiolabel.innerHTML = musicType;
		radiolabel.style.styleFloat = 'left';
		radiolabel.style.cssFloat = 'left';
		radiolabel.style.display = 'inline-block';
		radiolabel.style.textAlign = 'center';
		*/
		
		cellInd = 0;
		cellWidth = (100-40) / possibleVals.length;
		
		for(val of possibleVals) {
			
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			cell.style.border = 'thin solid black';
			cell.style.textAlign = 'center';
			
			var radiotest = document.createElement('input');
			radiotest.name=currQuestionNumber.toString() + '_response';
			radiotest.type='radio';
			radiotest.style.display = 'inline-block';
			radiotest.value=val;
			
			radiotest.onchange = function () {
				respdata[this.name] = this.value;
				console.log(respdata);
			};
			
			cell.appendChild(radiotest);
		}
		
		//break line
		/*
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = '<hr>';
		cell.style.width = '40%';
		*/
	
	}
	
	
	//Create survey table just for comments
	var surveyTableComm = document.createElement('table');
	surveyTableComm.style.width = '100%';
	surveyDiv2.appendChild(surveyTableComm);
	var rowIndex = -1;
	
	
	//Comment on favorite radio stations
	var row = surveyTableComm.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') What are your favorite radio stations, if you have any?';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
	
	var aidexpectationcomments = document.createElement('textarea');
	aidexpectationcomments.style.fontSize = '100%';
	aidexpectationcomments.style.width = '100%';
	
	var nameForRadioStations = currQuestionNumber.toString() + '_response';
	
	aidexpectationcomments.onblur = function () {
		respdata[nameForRadioStations] = this.value;
		console.log(respdata);
	};
	
	//Noting as optional question
	optionalQuestions.push(currQuestionNumber);
	
	cell.appendChild(aidexpectationcomments);
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	
	//Comment on favorite CD/Tape/Records
	var row = surveyTableComm.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') What are your favorite CDs, Tapes, or Records, if you have any?';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
	
	var aidexpectationcomments = document.createElement('textarea');
	aidexpectationcomments.style.fontSize = '100%';
	aidexpectationcomments.style.width = '100%';
	
	var nameForCDTapeRecord = currQuestionNumber.toString() + '_response';
	
	aidexpectationcomments.onblur = function () {
		respdata[nameForCDTapeRecord] = this.value;
		console.log(respdata);
	};
	
	//Noting as optional question
	optionalQuestions.push(currQuestionNumber);
	
	cell.appendChild(aidexpectationcomments);
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
		
	
	//Comment on situation
	var row = surveyTableComm.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') Feel free to comment on any of your answers to the above selections:';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
	
	var aidexpectationcomments = document.createElement('textarea');
	aidexpectationcomments.style.fontSize = '100%';
	aidexpectationcomments.style.width = '100%';
	
	var nameForSituationComments = currQuestionNumber.toString() + '_response';
	
	aidexpectationcomments.onblur = function () {
		respdata[nameForSituationComments] = this.value;
		console.log(respdata);
	};
	
	//Noting as optional question
	optionalQuestions.push(currQuestionNumber);
	
	cell.appendChild(aidexpectationcomments);
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	
	//Create survey division 3
	var surveyDiv3 = document.createElement('div');
	surveyDiv3.style.marginTop = '25px';
	surveyDiv3.className = 'ui-widget-content';
	main.appendChild(surveyDiv3);
		
	
	//General instructions for distinguishment
	surveyDiv3.innerHTML = '<b>Please answer yes or no to the question below for each of the cases.' +
							'<br>Do you think you would be able to distinguish between:</b><br><br>';

	
	//Create survey table 3
	var surveyTable3 = document.createElement('table');
	surveyTable3.style.width = '100%';
	surveyTable3.style.border = 'thin solid black';
	surveyTable3.style.borderStyle = 'separate';
	surveyTable3.style.borderSpacing = '0px';
	surveyTable3.style.rules = 'all';
	surveyTable3.style.border
	surveyDiv3.appendChild(surveyTable3);
	var rowIndex = -1;
	
	
	//Asking about their ability to distinguish
	
	//Generation of questions and answers
	possibleVals = ['Yes', 'No'];
	typesOfMusic = ['Male and female speaker', 'Male and female singer', 'Different music instruments', 
					'Different music ensembles (ex. a band from an orchestra)', 'Different speakers of the same gender', 'A singer of any gender from a speaker of any gender', 
					'a band/ensemble with a singer from a band/ensemble without a speaker']
	
	var row = surveyTable3.insertRow(++rowIndex);
	row.style.width = '100%';
	
	row.style.border = 'thin solid black';
	
	var cell = row.insertCell(0);
	cell.innerHTML = '<b>Situation</b>';
	cell.style.textAlign = 'center';
	cell.style.width = '40%';
	cell.style.border = 'thick solid black';
	
	cellInd = 0;
	cellWidth = (100-40) / possibleVals.length;
	
	for(valProp of possibleVals) {
			
		var cell = row.insertCell(++cellInd);
		cell.style.width = cellWidth.toString() + '%';
		cell.style.border = 'thick solid black';
		cell.style.textAlign = 'center';
		
		cell.innerHTML = '<b>' + valProp + '</b>';
	}
	
	for(musicType of typesOfMusic){
		var row = surveyTable3.insertRow(++rowIndex);
		row.style.width = '100%';
		
		row.style.border = 'thin solid black';
		
		currQuestionNumber++;
		
		var cell = row.insertCell(0);
		cell.innerHTML = currQuestionNumber.toString() + ') ' + musicType;
		allQuestions.push(cell.innerHTML);
		cell.style.textAlign = 'left';
		cell.style.width = '40%';
		cell.style.border = 'thin solid black';
		
				
		/*
		var radiolabel = document.createElement('label')
		radiolabel.className = 'radio-inline';
		radiolabel.innerHTML = musicType;
		radiolabel.style.styleFloat = 'left';
		radiolabel.style.cssFloat = 'left';
		radiolabel.style.display = 'inline-block';
		radiolabel.style.textAlign = 'center';
		*/
		
		cellInd = 0;
		cellWidth = (100-40) / possibleVals.length;
		
		for(val of possibleVals) {
			
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			cell.style.border = 'thin solid black';
			cell.style.textAlign = 'center';
			
			var radiotest = document.createElement('input');
			radiotest.name=currQuestionNumber.toString() + '_response';
			radiotest.type='radio';
			radiotest.style.display = 'inline-block';
			radiotest.value=val;
			
			radiotest.onchange = function () {
				respdata[this.name] = this.value;
				console.log(respdata);
			};
			
			cell.appendChild(radiotest);
		}
		
		//break line
		/*
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = '<hr>';
		cell.style.width = '40%';
		*/
	
	}
	
	//Create survey table 4
	var surveyTable4 = document.createElement('table');
	surveyTable4.style.width = '100%';
	surveyDiv3.appendChild(surveyTable4);
	var rowIndex = -1;
	
	
	//Comment on distinguishing
	var row = surveyTable4.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') Feel free to comment on any of your answers to the above:';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
	
	var aidexpectationcomments = document.createElement('textarea');
	aidexpectationcomments.style.fontSize = '100%';
	aidexpectationcomments.style.width = '100%';
	
	var nameForDistinguishing = currQuestionNumber.toString() + '_response';
	
	aidexpectationcomments.onblur = function () {
		respdata[nameForDistinguishing] = this.value;
		console.log(respdata);
	};
	
	//Noting as optional question
	optionalQuestions.push(currQuestionNumber);
	
	cell.appendChild(aidexpectationcomments);
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	//break line
	var row = surveyTable4.insertRow(++rowIndex);
	row.style.width = '100%';
	
	currCell = -1;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = '<hr>';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	
	//Male/female singer preference question
	var row = surveyTable4.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') Would you prefer to listen to a male or female singer?';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
		
	var musicoften = layout.select(['Male', 'Female', 'No preference']);
	musicoften.value = '';
		
	var nameForMFPref = currQuestionNumber.toString() + '_response';

	
	musicoften.onchange = function () {
		respdata[nameForMFPref] = this.value;
		console.log(respdata);
	};
	
	cell.appendChild(musicoften);
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	
	//Create survey division 4
	var surveyDiv4 = document.createElement('div');
	surveyDiv4.style.marginTop = '25px';
	surveyDiv4.className = 'ui-widget-content';
	main.appendChild(surveyDiv4);
		
	
	//General instructions for instrument recognition
	surveyDiv4.innerHTML = '<b>On a scale of 1-5, how easy would it be to recognize this instruments by sound only (no visual cues)?' +
							'<br>(1 = impossible to recognize by sound only - I would never recognize this instrument;<br>5 = very easy to recognize by sound only - I would always recognize this instrument)<br>(NA = do not know or not enough experience with instrument)</b><br><br>';

	
	//Create survey table 2
	var surveyTable2 = document.createElement('table');
	surveyTable2.style.width = '100%';
	surveyTable2.style.border = 'thin solid black';
	surveyTable2.style.borderStyle = 'separate';
	surveyTable2.style.borderSpacing = '0px';
	surveyTable2.style.rules = 'all';
	surveyTable2.style.border
	surveyDiv4.appendChild(surveyTable2);
	var rowIndex = -1;
	
	
	//Asking about their ability to recognize instruments
	
	//Generation of questions and answers
	possibleVals = ['NA', '1', '2', '3', '4', '5'];
	typesOfMusic = ['Bass Drum or Timpani', 'Cello', 'Clarinet', 'Drum Kit', 
					'Female Singer', 'Flute', 'Guitar', 'Male Singer', 'Organ', 
					'Piano', 'Tambourine', 'Trombone', 'Trumpet', 'Violin', 'Xylophone']
	
	var row = surveyTable2.insertRow(++rowIndex);
	row.style.width = '100%';
	
	row.style.border = 'thin solid black';
	
	var cell = row.insertCell(0);
	cell.innerHTML = '<b>Instrument</b>';
	cell.style.textAlign = 'center';
	cell.style.width = '40%';
	cell.style.border = 'thick solid black';
	
	cellInd = 0;
	cellWidth = (100-40) / possibleVals.length;
	
	for(valProp of possibleVals) {
			
		var cell = row.insertCell(++cellInd);
		cell.style.width = cellWidth.toString() + '%';
		cell.style.border = 'thick solid black';
		cell.style.textAlign = 'center';
		
		cell.innerHTML = '<b>' + valProp + '</b>';
	}
	
	for(musicType of typesOfMusic){
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		
		row.style.border = 'thin solid black';
		
		currQuestionNumber++;
		
		var cell = row.insertCell(0);
		cell.innerHTML = currQuestionNumber.toString() + ') ' + musicType;
		allQuestions.push(cell.innerHTML);
		cell.style.textAlign = 'left';
		cell.style.width = '40%';
		cell.style.border = 'thin solid black';
		
				
		/*
		var radiolabel = document.createElement('label')
		radiolabel.className = 'radio-inline';
		radiolabel.innerHTML = musicType;
		radiolabel.style.styleFloat = 'left';
		radiolabel.style.cssFloat = 'left';
		radiolabel.style.display = 'inline-block';
		radiolabel.style.textAlign = 'center';
		*/
		
		cellInd = 0;
		cellWidth = (100-40) / possibleVals.length;
		
		for(val of possibleVals) {
			
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			cell.style.border = 'thin solid black';
			cell.style.textAlign = 'center';
			
			var radiotest = document.createElement('input');
			radiotest.name=currQuestionNumber.toString() + '_response';
			radiotest.type='radio';
			radiotest.style.display = 'inline-block';
			radiotest.value=val;
			
			radiotest.onchange = function () {
				respdata[this.name] = this.value;
				console.log(respdata);
			};
			
			cell.appendChild(radiotest);
		}
		
		//break line
		/*
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = '<hr>';
		cell.style.width = '40%';
		*/
	
	}
	
	
	
	//Create survey division 5
	var surveyDiv5 = document.createElement('div');
	surveyDiv5.style.marginTop = '25px';
	surveyDiv5.className = 'ui-widget-content';
	main.appendChild(surveyDiv5);
		
	
	//General instructions for instrument rating
	surveyDiv5.innerHTML = '<b>On a scale of 1-5, please rate how pleasant you find these instruments?' +
							'<br>(1 = do not enjoy at all; 5 = very much enjoy)<br>(NA = do not know or not enough experience with instrument)</b><br><br>';

	
	//Create survey table 2
	var surveyTable2 = document.createElement('table');
	surveyTable2.style.width = '100%';
	surveyTable2.style.border = 'thin solid black';
	surveyTable2.style.borderStyle = 'separate';
	surveyTable2.style.borderSpacing = '0px';
	surveyTable2.style.rules = 'all';
	surveyTable2.style.border
	surveyDiv5.appendChild(surveyTable2);
	var rowIndex = -1;
	
	
	//Asking about their rating of instruments
	
	//Generation of questions and answers
	possibleVals = ['NA', '1', '2', '3', '4', '5'];
	typesOfMusic = ['Bass Drum or Timpani', 'Cello', 'Clarinet', 'Drum Kit', 
					'Female Singer', 'Flute', 'Guitar', 'Male Singer', 'Organ', 
					'Piano', 'Tambourine', 'Trombone', 'Trumpet', 'Violin', 'Xylophone']
	
	var row = surveyTable2.insertRow(++rowIndex);
	row.style.width = '100%';
	
	row.style.border = 'thin solid black';
	
	var cell = row.insertCell(0);
	cell.innerHTML = '<b>Instrument</b>';
	cell.style.textAlign = 'center';
	cell.style.width = '40%';
	cell.style.border = 'thick solid black';
	
	cellInd = 0;
	cellWidth = (100-40) / possibleVals.length;
	
	for(valProp of possibleVals) {
			
		var cell = row.insertCell(++cellInd);
		cell.style.width = cellWidth.toString() + '%';
		cell.style.border = 'thick solid black';
		cell.style.textAlign = 'center';
		
		cell.innerHTML = '<b>' + valProp + '</b>';
	}
	
	for(musicType of typesOfMusic){
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		
		row.style.border = 'thin solid black';
		
		currQuestionNumber++;
		
		var cell = row.insertCell(0);
		cell.innerHTML = currQuestionNumber.toString() + ') ' + musicType;
		allQuestions.push(cell.innerHTML);
		cell.style.textAlign = 'left';
		cell.style.width = '40%';
		cell.style.border = 'thin solid black';
		
				
		/*
		var radiolabel = document.createElement('label')
		radiolabel.className = 'radio-inline';
		radiolabel.innerHTML = musicType;
		radiolabel.style.styleFloat = 'left';
		radiolabel.style.cssFloat = 'left';
		radiolabel.style.display = 'inline-block';
		radiolabel.style.textAlign = 'center';
		*/
		
		cellInd = 0;
		cellWidth = (100-40) / possibleVals.length;
		
		for(val of possibleVals) {
			
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			cell.style.border = 'thin solid black';
			cell.style.textAlign = 'center';
			
			var radiotest = document.createElement('input');
			radiotest.name=currQuestionNumber.toString() + '_response';
			radiotest.type='radio';
			radiotest.style.display = 'inline-block';
			radiotest.value=val;
			
			radiotest.onchange = function () {
				respdata[this.name] = this.value;
				console.log(respdata);
			};
			
			cell.appendChild(radiotest);
		}
		
		//break line
		/*
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = '<hr>';
		cell.style.width = '40%';
		*/
	
	}
	
	
	

	//Create survey division 6
	var surveyDiv6 = document.createElement('div');
	surveyDiv6.style.marginTop = '25px';
	surveyDiv6.className = 'ui-widget-content';
	main.appendChild(surveyDiv6);
		
	
	//General instructions for music style recognition
	surveyDiv6.innerHTML = '<b>On a scale of 1-5, how easy would it be to recognize these music styles by sound only (no visual cues)?' +
							'<br>(1 = impossible to recognize by sound only - I would never recognize this style;<br>5 = very easy to recognize by sound only - I would always recognize this style)<br>(NA = do not know or not enough experience with style)</b><br><br>';

	
	//Create survey table 2
	var surveyTable2 = document.createElement('table');
	surveyTable2.style.width = '100%';
	surveyTable2.style.border = 'thin solid black';
	surveyTable2.style.borderStyle = 'separate';
	surveyTable2.style.borderSpacing = '0px';
	surveyTable2.style.rules = 'all';
	surveyTable2.style.border
	surveyDiv6.appendChild(surveyTable2);
	var rowIndex = -1;
	
	
	//Asking about their ability to recognize music styles
	
	//Generation of questions and answers
	possibleVals = ['NA', '1', '2', '3', '4', '5'];
	typesOfMusic = ['Recent Pop or Rock (eg. "top 40", 80s, 90s', 'Hard rock (eg. "heavy metal")', 
					'Rap', '60s-70s music', '"Old Time" songs (eg. 20s-50s, war songs, etc.)', 
					'Blues', 'Jazz', 'Country and Western', 'Musicals/Movie music', 'Classical',
					'Easy listening', 'Religious', 'World music (specify below)', 'Other (specify below)']
	
	var row = surveyTable2.insertRow(++rowIndex);
	row.style.width = '100%';
	
	row.style.border = 'thin solid black';
	
	var cell = row.insertCell(0);
	cell.innerHTML = '<b>Instrument</b>';
	cell.style.textAlign = 'center';
	cell.style.width = '40%';
	cell.style.border = 'thick solid black';
	
	cellInd = 0;
	cellWidth = (100-40) / possibleVals.length;
	
	for(valProp of possibleVals) {
			
		var cell = row.insertCell(++cellInd);
		cell.style.width = cellWidth.toString() + '%';
		cell.style.border = 'thick solid black';
		cell.style.textAlign = 'center';
		
		cell.innerHTML = '<b>' + valProp + '</b>';
	}
	
	for(musicType of typesOfMusic){
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		
		row.style.border = 'thin solid black';
		
		currQuestionNumber++;
		
		var cell = row.insertCell(0);
		cell.innerHTML = currQuestionNumber.toString() + ') ' + musicType;
		allQuestions.push(cell.innerHTML);
		cell.style.textAlign = 'left';
		cell.style.width = '40%';
		cell.style.border = 'thin solid black';
		
				
		/*
		var radiolabel = document.createElement('label')
		radiolabel.className = 'radio-inline';
		radiolabel.innerHTML = musicType;
		radiolabel.style.styleFloat = 'left';
		radiolabel.style.cssFloat = 'left';
		radiolabel.style.display = 'inline-block';
		radiolabel.style.textAlign = 'center';
		*/
		
		cellInd = 0;
		cellWidth = (100-40) / possibleVals.length;
		
		for(val of possibleVals) {
			
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			cell.style.border = 'thin solid black';
			cell.style.textAlign = 'center';
			
			var radiotest = document.createElement('input');
			radiotest.name=currQuestionNumber.toString() + '_response';
			radiotest.type='radio';
			radiotest.style.display = 'inline-block';
			radiotest.value=val;
			
			radiotest.onchange = function () {
				respdata[this.name] = this.value;
				console.log(respdata);
			};
			
			cell.appendChild(radiotest);
		}
		
		//break line
		/*
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = '<hr>';
		cell.style.width = '40%';
		*/
	
	}
	
	//Create survey table 4
	var surveyTable4 = document.createElement('table');
	surveyTable4.style.width = '100%';
	surveyDiv6.appendChild(surveyTable4);
	var rowIndex = -1;
	
	
	//Comment on distinguishing
	var row = surveyTable4.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') If you answered the last two, please specify:';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
	
	var aidexpectationcomments = document.createElement('textarea');
	aidexpectationcomments.style.fontSize = '100%';
	aidexpectationcomments.style.width = '100%';
		
	var nameForMusicRecognition = currQuestionNumber.toString() + '_response';
	
	aidexpectationcomments.onblur = function () {
		respdata[nameForMusicRecognition] = this.value;
		console.log(respdata);
	};
	
	cell.appendChild(aidexpectationcomments);
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
		
		
	//Create survey division 6
	var surveyDiv6 = document.createElement('div');
	surveyDiv6.style.marginTop = '25px';
	surveyDiv6.className = 'ui-widget-content';
	main.appendChild(surveyDiv6);
		
	
	//General instructions for music style liking
	surveyDiv6.innerHTML = '<b>On a scale of 1-5, how pleasant do these music styles sound to you?' +
							'<br>(1 = do not enjoy at all;<br>5 = very much enjoy)<br>(NA = do not know or not enough experience with style)</b><br><br>';

	
	//Create survey table 2
	var surveyTable2 = document.createElement('table');
	surveyTable2.style.width = '100%';
	surveyTable2.style.border = 'thin solid black';
	surveyTable2.style.borderStyle = 'separate';
	surveyTable2.style.borderSpacing = '0px';
	surveyTable2.style.rules = 'all';
	surveyTable2.style.border
	surveyDiv6.appendChild(surveyTable2);
	var rowIndex = -1;
	
	
	//Asking about their rating of music styles
	
	//Generation of questions and answers
	possibleVals = ['NA', '1', '2', '3', '4', '5'];
	typesOfMusic = ['Recent Pop or Rock (eg. "top 40", 80s, 90s', 'Hard rock (eg. "heavy metal")', 
					'Rap', '60s-70s music', '"Old Time" songs (eg. 20s-50s, war songs, etc.', 
					'Blues', 'Jazz', 'Country and Western', 'Musicals/Movie music', 'Classical',
					'Easy listening', 'Religious', 'World music (specify below)', 'Other (specify below)']
	
	var row = surveyTable2.insertRow(++rowIndex);
	row.style.width = '100%';
	
	row.style.border = 'thin solid black';
	
	var cell = row.insertCell(0);
	cell.innerHTML = '<b>Instrument</b>';
	cell.style.textAlign = 'center';
	cell.style.width = '40%';
	cell.style.border = 'thick solid black';
	
	cellInd = 0;
	cellWidth = (100-40) / possibleVals.length;
	
	for(valProp of possibleVals) {
			
		var cell = row.insertCell(++cellInd);
		cell.style.width = cellWidth.toString() + '%';
		cell.style.border = 'thick solid black';
		cell.style.textAlign = 'center';
		
		cell.innerHTML = '<b>' + valProp + '</b>';
	}
	
	for(musicType of typesOfMusic){
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		
		row.style.border = 'thin solid black';
		
		currQuestionNumber++;
		
		var cell = row.insertCell(0);
		cell.innerHTML = currQuestionNumber.toString() + ') ' + musicType;
		allQuestions.push(cell.innerHTML);
		cell.style.textAlign = 'left';
		cell.style.width = '40%';
		cell.style.border = 'thin solid black';
		
				
		/*
		var radiolabel = document.createElement('label')
		radiolabel.className = 'radio-inline';
		radiolabel.innerHTML = musicType;
		radiolabel.style.styleFloat = 'left';
		radiolabel.style.cssFloat = 'left';
		radiolabel.style.display = 'inline-block';
		radiolabel.style.textAlign = 'center';
		*/
		
		cellInd = 0;
		cellWidth = (100-40) / possibleVals.length;
		
		for(val of possibleVals) {
			
			var cell = row.insertCell(++cellInd);
			cell.style.width = cellWidth.toString() + '%';
			cell.style.border = 'thin solid black';
			cell.style.textAlign = 'center';
			
			var radiotest = document.createElement('input');
			radiotest.name=currQuestionNumber.toString() + '_response';
			radiotest.type='radio';
			radiotest.style.display = 'inline-block';
			radiotest.value=val;
			
			radiotest.onchange = function () {
				respdata[this.name] = this.value;
				console.log(respdata);
			};
			
			cell.appendChild(radiotest);
		}
		
		//break line
		/*
		var row = surveyTable2.insertRow(++rowIndex);
		row.style.width = '100%';
		var cell = row.insertCell(0);
		cell.innerHTML = '<hr>';
		cell.style.width = '40%';
		*/
	
	}
	
	//Create survey table 4
	var surveyTable4 = document.createElement('table');
	surveyTable4.style.width = '100%';
	surveyDiv6.appendChild(surveyTable4);
	var rowIndex = -1;
	
	
	//Comment on distinguishing
	var row = surveyTable4.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') If you answered the last two, please specify:';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
	
	var aidexpectationcomments = document.createElement('textarea');
	aidexpectationcomments.style.fontSize = '100%';
	aidexpectationcomments.style.width = '100%';
		
	var nameForMusicLiking = currQuestionNumber.toString() + '_response';
	
	aidexpectationcomments.onblur = function () {
		respdata[nameForMusicLiking] = this.value;
		console.log(respdata);
	};
	
	//Noting as optional question
	optionalQuestions.push(currQuestionNumber);
	
	cell.appendChild(aidexpectationcomments);
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	
	
	
	
	//Create survey division 6
	var surveyDiv6 = document.createElement('div');
	surveyDiv6.style.marginTop = '25px';
	surveyDiv6.className = 'ui-widget-content';
	main.appendChild(surveyDiv6);
		
	
	
	//Create survey table 2
	var surveyTable2 = document.createElement('table');
	surveyTable2.style.width = '100%';
	surveyTable2.style.border = 'thin solid black';
	surveyTable2.style.borderStyle = 'separate';
	surveyTable2.style.borderSpacing = '0px';
	surveyTable2.style.rules = 'all';
	surveyTable2.style.border
	surveyDiv6.appendChild(surveyTable2);
	var rowIndex = -1;
	
	
	//Overall rating
	var row = surveyTable2.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
		
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') Overall, what is your appraisal of your ability to hear music?';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
		
	var speechperc = layout.select(['Very Bad', 'Bad', 'Neutral', 'Good', 'Very good', 'Perfect']);
	speechperc.value = '';
		
	var nameForOverallRating = currQuestionNumber.toString() + '_response'
	
	speechperc.onchange = function () {
		respdata[nameForOverallRating] = this.value;
		console.log(respdata);
	};
	
	cell.appendChild(speechperc);
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	//Comment expectations
	var row = surveyTable2.insertRow(++rowIndex);
	row.style.width = '100%';
	row.style.border = 'thin solid black';
	
	currCell = -1;
	
	currQuestionNumber++;
	
	var cell = row.insertCell(++currCell);
	cell.innerHTML = currQuestionNumber.toString() + ') Feel free to leave any other comments or things you would like to mention:';
	allQuestions.push(cell.innerHTML);
	cell.style.textAlign = 'left';
	cell.style.width = '40%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	var cell = row.insertCell(++currCell);
	cell.style.width = '40%';
	
	var aidexpectationcomments = document.createElement('textarea');
	aidexpectationcomments.style.fontSize = '100%';
	aidexpectationcomments.style.width = '100%';
		
	var nameForFinalComments = currQuestionNumber.toString() + '_response'

	
	aidexpectationcomments.onblur = function () {
		respdata[nameForFinalComments] = this.value;
		console.log(respdata);
	};
	
	//Noting as optional question
	optionalQuestions.push(currQuestionNumber);
	
	cell.appendChild(aidexpectationcomments);
	var cell = row.insertCell(++currCell);
	cell.style.width = '10%';
	
	
	console.log(allQuestions);
	
	
	//Submission button
	var submitButton = document.createElement('button');
	submitButton.innerHTML = 'Submit';
	submitButton.onclick = function () {
		
		var unansweredQuestions = [];
		
		//Check that all questions have been answered, if not alert user to answer them
		for(var ind = 1; ind <= currQuestionNumber; ind++) {
			if(!optionalQuestions.includes(ind)) {
				unansweredQuestions.push(ind);
			}
		}
		
		console.log(optionalQuestions)
		console.log(unansweredQuestions)
		
		for(respName in respdata) {
			var allCuts = respName.split('_');
			var thisQuestionNum = parseInt(allCuts[0],10);
			
			var indexVal = unansweredQuestions.indexOf(thisQuestionNum);
			
			if(indexVal > -1) {
				unansweredQuestions.splice(indexVal, 1)
			}
			
		}
		
		console.log(unansweredQuestions);
		
		// dialog: Check submissions or confirm submission/thanks
		var dialog = document.createElement('div');
		dialog.id = 'dialog';
		
		
		//debug, test if other dialog box works
		/*
		unansweredQuestions = [];
		console.log(subuser);
		console.log(user);
		console.log(version);
		*/
		
		if(unansweredQuestions.length > 0) {
			dialog.title = 'Unanswered questions';
			
			stringUnanswered = unansweredQuestions.toString();
			stringUnanswered = stringUnanswered.replace(/,/g, ', ');
			
			dialog.innerHTML = 'Please answer questions: <br><br>' + stringUnanswered + '.';
			
			jQuery(dialog).dialog({
				buttons: {
					Return: function () { jQuery(this).dialog('destroy').remove(); }
				},
				modal: true,
				width: 'auto'
			});
			
		} else {
			dialog.title = 'Thank you!';
						
			dialog.innerHTML = 'Thank you for taking our survey!<br><br>If you would like to go back to check your answers, please select "Return" below. Otherwise, click "Submit" to submit your answers!';
			
			jQuery(dialog).dialog({
				buttons: {
					Return: function () { jQuery(this).dialog('destroy').remove(); },
					Submit: function () {
						respdata.surveyname = 'MLEQ';
						respdata['questiontext'] = allQuestions;
						respdata['surveyversion'] = MLEQversion;
						submitData(respdata)
						jQuery(this).dialog('destroy').remove(); 
					}
				},
				modal: true,
				width: 'auto'
			});
		}
	}
	
	main.appendChild(submitButton);

	
	

}

function loadMTEQ() {
	layout.main('MTEQ');
	console.log('b');
	
	
}

function loadUCMLQ() {
	layout.main('UCMLQ');
	console.log('c');
	
	
}




function submitData(data) {
	
	data.user = user.ID;
	data.subuser = subuser.ID;
	
	jQuery.ajax({
		data: data,
		type: 'POST',
		url: 'version/'+version+'/php/'+'survey_data.php',
		success: function (data) {
			console.log(data);   
		},
		error: function (data) {
			console.log(data);
		}
	});
}