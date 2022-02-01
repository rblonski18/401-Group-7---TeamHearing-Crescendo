function spin(settings) {
	// defaults
	settings.speech = true;
	if (!('alternatives' in settings)) { settings.alternatives = 25; }
	
	// initialize activity
	activity = new AFC(settings);
	
	// inialize material
	activity.material = new SPIN(settings);
	
	// initialize
	activity.init();
}
function SPIN(settings) {
	this.ID = 'spin';
	this.available = [];
	this.context = 'Off';
	this.filetype = '.wav';
	this.list = Math.floor(7*Math.random());
	this.materials = undefined;
	this.path = '/data/spin/calibrated/';
	this.startmessage = 'You will hear a spoken sentence with the last word missing.</br>Click on the button for the missing word.';
	this.stimuli = [];
	this.title = 'SPIN Sentences';
	this.titleShort = 'SPIN';
	this.word = [];
	this.words = [];
	
	// overrides
	for (let key in settings) { if (key in this) { this[key] = settings[key]; } }
		
	// information
	this.information();
	
	// alphabetize words
	this.materials.sort(compareK);
	for (let a = 0; a < this.materials.length; a++) {
		this.words[a] = this.materials[a].keyword;
	}
}
SPIN.prototype.information = function () {
	var materials = [];
	materials[0] = [];
	materials[1] = [];

	// Form 1 of the Revised SPIN Test (12/83)
	info = [
	'Miss White won\'t think about the ________.','CRACK',
	'He would think about the ________.','RAG',		
	'The old man talked about ____.','LUNGS',	
	'I was considering the ____.','CROOK',		
	'Bill might discuss the ____.','FOAM',		
	'Nancy didn\'t discuss the ____.','SKIRT',	
	'Bob has discussed the ____.','SPLASH',		
	'Ruth hopes he heard about the ____.','HIPS',	
	'She wants to talk about the ____.','CREW',	
	'They had a problem with the ____.','CLIFF',	
	'You heard Jane called about the ____.','VAN',	
	'We could consider the ____.','FEAST',		
	'Bill heard we asked about the ____.','HOST',	
	'I had not thought about the ____.','GROWL',	
	'He should know about the ____.','HUT',		
	'I\'m glad you heard about the ____.','BEND',	
	'You\'re talking about the ____.','POND',		
	'Nancy had considered the ____.','SLEEVES',	
	'He can\'t consider the ____.','CRIB',		
	'Tom discussed the ____.','HAY',		
	'She\'s glad Jane asked about the ____.','DRAIN',	
	'Bill hopes Paul heard about the ____.','MIST',	
	'We\'re speaking about the ____.','TOLL',	
	'We spoke about the ____.','KNOB',		
	'I\'ve spoken about the ____.','PILE'];
	Info(info,0,0);

	info = [
	'His plan meant taking a big ____.','RISK',
	'Stir your coffee with a ____.','SPOON', 	
	'The plow was pulled by an ____.','OX', 	
	'The old train was powered by ____.','STEAM', 
	'Let\'s decide by tossing a ____.','COIN', 	
	'The doctor prescribed the ____.','DRUG', 
	'Hold the baby on your ____.','LAP', 	
	'The dog chewed on a ____.','BONE', 	
	'The war was fought with armored ____.','TANKS', 
	'They drank a whole bottle of ____.','GIN', 
	'The witness took a solemn ____.','OATH', 
	'They tracked the lion to his ____.','DEN', 
	'The cow gave birth to a ____.','CALF', 	
	'The scarf was made of shiny ____.','SILK', 
	'The super highway has six ____.','LANES', 
	'For dessert he had apple ____.','PIE',	
	'The beer drinkers raised their ____.','MUGS', 
	'The rude remark made her ____.','BLUSH', 
	'We heard the ticking of the ____.','CLOCK', 
	'He killed the dragon with his ____.','SWORD', 
	'Mary wore her hair in ____.','BRAIDS', 
	'We\'re lost so let\'s look at the ____.','MAP', 
	'No one was injured in the ____.','CRASH', 
	'My son has a dog for a ____.','PET', 	
	'He was scared out of his ____.','WITS'];
	Info(info,1,0);

	// Form 2 of the Revised SPIN Test (12/83)
	info = [
	'Miss Black thought about the ____.','LAP',	
	'Miss Black would consider the ____.','BONE',	
	'Bob could have known about the ____.','SPOON',
	'He wants to talk about the ____.','RISK',	
	'He heard they called about the ____.','LANES',	
	'She has known about the ____.','DRUG',	
	'I want to speak about the ____.','CRASH',	
	'I should have considered the ____.','MAP',	
	'Ruth must have known about the ____.','PIE',	
	'The man should discuss the ____.','OX',		
	'They heard I called about the ____.','PET',	
	'Bill cannot consider the ____.','DEN',		
	'She hopes Jane called about the ____.','CALF',	
	'Jane has a problem with the ____.','COIN',	
	'Paul hopes she called about the ____.','TANKS',	
	'The girl talked about the ____.','GIN',		
	'Mary should think about the ____.','SWORD',	
	'Ruth could have discussed the ____.','WITS',	
	'You had a problem with a ____.','BLUSH',	
	'We have discussed the ____.','STEAM',		
	'Tom is considering the ____.','CLOCK',		
	'You should not speak about the ____.','BRAIDS', 
	'Peter should speak about the ____.','MUGS',	
	'He has a problem with the ____.','OATH',	
	'Tom won\'t consider the ____.','SILK'];
	Info(info,0,1);

	info = [
	'The baby slept in his ____.','CRIB',	
	'The watchdog gave a warning ____.','GROWL',
	'The natives built a wooden ____.','HUT',
	'Unlock the door and turn the ____.','KNOB',
	'Wipe your greasy hands on the ____.','RAG',
	'The wedding banquet was a ____.','FEAST',
	'Paul hit the water with a ____.','SPLASH',
	'The ducks swam around the ____.','POND',
	'Bob stood with his hands on his ____.','HIPS',
	'The cigarette smoke filled his ____.','LUNGS',
	'The cushion was filled with ____.','FOAM',
	'Ruth poured the water down the ____.','DRAIN',
	'This nozzle sprays a fine ____.','MIST',	
	'The sport shirt has short ____.','SLEEVES',
	'She shortened the hem of her ____.','SKIRT',
	'The guests were welcomed by the ____.','HOST',
	'The ship\'s captain summoned his ____.','CREW',
	'The flood took a heavy ____.','TOLL',	
	'The car drove off the steep ____.','CLIFF',
	'The policeman captured the ____.','CROOK',
	'The door was opened just a ____.','CRACK',
	'The sand was heaped in a ____.','PILE',	
	'Household goods are moved in a ____.','VAN',
	'Follow this road around the ____.','BEND',
	'The farmer baled the ____.','HAY'];
	Info(info,1,1);

	// Form 3 of the Revised SPIN Test (12/83)
	info = [
	'Mr. White discussed the ____.','CRUISE',	
	'Miss White thinks about the ____.','TEA',	
	'He is thinking about the ____.','ROAR',		
	'She\'s spoken about the ____.','BOMB',		
	'You want to talk about the ____.','DITCH',	
	'We\'re discussing the ____.','SHEETS',		
	'Betty has considered the ____.','BARK',		
	'Tom will discuss the ____.','SWAN',		
	'You\'d been considering the ____.','GEESE',	
	'They were interested in the ____.','STRAP',	
	'He could discuss the ____.','BREAD',		
	'Jane hopes Ruth asked about the ____.','STRIPES',
	'Paul spoke about the ____.','PORK',		
	'Mr. Smith thinks about the ____.','CAP',	
	'We are speaking about the ____.','PRIZE',	
	'Harry had thought about the ____.','LOGS',	
	'Bob could consider the ____.','POLE',		
	'Ruth has a problem with the ____.','JOINTS',	
	'He is considering the ____.','THROAT',		
	'We can\'t consider the ____.','WHEAT',		
	'The man spoke about the ____.','CLUE',	
	'David has discussed the ____.','DENT',		
	'Bill heard Tom called about the ____.','COACH',
	'Jane has spoken about the ____.','CHEST',	
	'Mr. White spoke about the ____.','FIRM'];
	Info(info,0,2);

	info = [
	'Kill the bugs with this ____.','SPRAY',	
	'How much can I buy for a ____.','DIME',
	'We shipped the furniture by ____.','TRUCK',
	'My T.V. has a twelve-inch ____.','SCREEN',
	'That accident gave me a ____.','SCARE',
	'The king wore a golden ____.','CROWN',
	'The girl swept the floor with a ____.','BROOM',
	'The nurse gave him first ____.','AID',	
	'She faced them with a foolish ____.','GRIN',
	'Watermelons have lots of ____.','SEEDS',
	'Use this spray to kill the ____.','BUGS',	
	'The teacher sat on a sharp ____.','TACK',
	'The sailor swabbed the ____.','DECK',	
	'He tossed the drowning man a ____.','ROPE',
	'The boy gave the football a ____.','KICK',
	'The storm broke the sailboat\'s ____.','MAST',
	'Mr. Brown carved the roast ____.','BEEF',
	'The glass had a chip on the ____.','RIM',
	'Her cigarette had a long ____.','ASH',	
	'The soup was served in a ____.','BOWL',
	'The lonely bird searched for its ____.','MATE',
	'Please wipe your feet on the ____.','MAT',
	'The pond was full of croaking ____.','FROGS',
	'He hit me with a clenched ____.','FIST',	
	'A bicycle has two ____.','WHEELS'];
	Info(info,1,2);

	// Form 4 of the Revised SPIN Test (12/83)
	info = [
	'Mary had considered the ____.','SPRAY',	
	'The woman talked about the ____.','FROGS',	
	'Miss Brown will speak about the ____.','GRIN',	
	'Bill can\'t have considered the ____.','WHEELS',	
	'Mr. Smith spoke about the ____.','AID',		
	'He hears she asked about the ____.','DECK',	
	'You want to think about the ____.','DIME',	
	'You\'ve considered the ____.','SEEDS',		
	'Ruth\'s Grandmother discussed the ____.','BROOM',
	'Miss Smith considered the ____.','SCARE',	
	'Peter has considered the ____.','MAT',		
	'The old man considered the ____.','KICK',	
	'Paul could not consider the ____.','RIM',	
	'I\'ve been considering the ____.','CROWN',	
	'We\'ve spoken about the ____.','TRUCK',	
	'Mary could not discuss the ____.','TACK',	
	'Harry might consider the ____.','BEEF',		
	'We\'re glad Bill heard about the ____.','ASH',	
	'Nancy should consider the ____.','FIST',	
	'They did not discuss the ____.','SCREEN',	
	'The old man thinks about the ____.','MAST',	
	'Paul wants to speak about the ____.','BUGS',	
	'You\'re glad she called about the ____.','BOWL',	
	'Miss Black could have discussed the ____.','ROPE',
	'I hope Paul asked about the ____.','MATE'];
	Info(info,0,3);

	info = [
	'The doctor X-rayed his ____.','CHEST',	
	'The workers are digging a ____.','DITCH',
	'The duck swam with the white ____.','SWAN',
	'Your knees and your elbows are ____.','JOINTS',
	'Raise the flag up the ____.','POLE',	
	'The detectives searched for a ____.','CLUE',
	'The steamship left on the ____.','CRUISE',
	'Tree trunks are covered with ____.','BARK',
	'The meat from a pig is called ____.','PORK',
	'Ruth poured herself a cup of ____.','TEA',
	'We saw a flock of wild ____.','GEESE',	
	'How did your car get that ____?','DENT',
	'She made the bed with clean ____.','SHEETS',
	'The team was trained by their ____.','COACH',
	'I\'ve got a cold and sore ____.','THROAT',
	'She wore a feather in her ____.','CAP',	
	'The bread was made from whole ____.','WHEAT',
	'Spread some butter on your ____.','BREAD',
	'The cabin was made of ____.','LOGS',	
	'The lion gave an angry ____.','ROAR',	
	'The sandal has a broken ____.','STRAP',
	'He\'s employed by a large ____.','FIRM',	
	'Her entry should win first ____.','PRIZE',
	'The airplane dropped like a ____.','BOMB',
	'A zebra has black and white ____.','STRIPES'];
	Info(info,1,3);

	// Form 5 of the Revised SPIN Test (12/83)
	info = [
	'Betty knew about the ____.','NAP',		
	'The girl should consider the ____.','FLAME',	
	'They heard I asked about the ____.','BET',	
	'Mary knows about the ____.','RUG',		
	'He was interested in the ____.','HEDGE',	
	'Jane did not speak about the ____.','SLICE',	
	'Mr. Brown can\'t discuss the ____.','SLOT',	
	'Paul can\'t discuss the ____.','WAX',		
	'Miss Brown shouldn\'t discuss the ____.','SAND',
	'David might consider the ____.','FUN',		
	'She wants to speak about the ____.','ANT',	
	'He hasn\'t considered the ____.','DART',		
	'We\'ve been discussing the ____.','CRATES',	
	'We\'ve been thinking about the ____.','FAN',	
	'Jane didn\'t think about the ____.','BROOK',	
	'Betty can\'t consider the ____.','GRIEF',		
	'Harry will consider the ____.','TRAIL',		
	'Tom is talking about the ____.','FEE',		
	'Tom had spoken about the ____.','PILL',	
	'Tom has been discussing the ____.','BEADS',	
	'Tom could have thought about the ____.','SPORT',
	'Mary can\'t consider the ____.','TIDE',		
	'He hopes Tom asked about the ____.','BAR',	
	'We could discuss the ____.','DUST',		
	'Paul hopes we heard about the ____.','LOOT'];
	Info(info,0,4);

	info = [
	'It\'s getting dark, so light the ____.','LAMP',
	'To store his wood he built a ____.','SHED',
	'The mouse was caught in a ____.','TRAP',
	'The airplane went into a ____.','DIVE',	
	'The fireman heard her frightened ____.','SCREAM',
	'He wiped the sink with a ____.','SPONGE',
	'The papers were held by a ____.','CLIP',
	'The chicks followed the mother ____.','HEN',
	'The fur coat was made of ____.','MINK',
	'The boy took shelter in a ____.','CAVE',
	'Eve was made from Adam\'s ____.','RIB',
	'The boat sailed along the ____.','COAST',
	'The judge is sitting on the ____.','BENCH',
	'Cut a piece of meat from the ____.','ROAST',
	'The heavy rains caused a ____.','FLOOD',
	'The swimmer dove into the ____.','POOL',
	'Let\'s invite the whole ____.','GANG',	
	'The house was robbed by a ____.','THIEF',
	'Bob wore a watch on his ____.','WRIST',
	'The secret agent was a ____.','SPY',	
	'The rancher rounded up his ____.','HERD',
	'Ann works in the bank as a ____.','CLERK',
	'A chimpanzee is an ____.','APE',	
	'The bandits escaped from ____.','JAIL',	
	'The landlord raised the ____.','RENT'];
	Info(info,1,4);

	// Form 6 of the Revised SPIN Test (12/83)
	info = [
	'You were considering the ____.','GANG',	
	'The boy considered the ____.','MINK',		
	'He wants to know about the ____.','RIB',	
	'She might have discussed the ____.','APE',	
	'The old woman discussed the ____.','THIEF',	
	'You were interested in the ____.','SCREAM',	
	'We hear they asked about the ____.','SHED',	
	'I haven\'t discussed the ____.','SPONGE',	
	'Ruth will consider the ____.','HERD',		
	'The old man discussed the ____.','DIVE',	
	'The class should consider the ____.','FLOOD',	
	'I\'m talking about the ____.','BENCH',		
	'Paul has discussed the ____.','LAMP',		
	'You knew about the ____.','CLIP',		
	'She might consider the ____.','POOL',		
	'Bob was considering the ____.','CLERK',	
	'The man knew about the ____.','SPY',		
	'The class is discussing the ____.','WRIST',	
	'They hope he heard about the ____.','RENT',	
	'Mr. White spoke about the ____.','JAIL',	
	'Miss Brown might consider the ____.','COAST',
	'Bill didn\'t discuss the ____.','HEN',		
	'The boy might consider the ____.','TRAP',	
	'He should consider the ____.','ROAST',		
	'Miss Brown spoke about the ____.','CAVE'];
	Info(info,0,5);

	info = [
	'Playing checkers can be ____.','FUN',	
	'The doctor charged a low ____.','FEE',	
	'The gambler lost the ____.','BET',	
	'Get the bread and cut me a ____.','SLICE',
	'The sleepy child took a ____.','NAP',	
	'Instead of a fence, plant a ____.','HEDGE',
	'Drop the coin through the ____.','SLOT',
	'They fished in the babbling ____.','BROOK',
	'The widow\'s sob expressed her ____.','GRIEF',
	'The candle flame melted the ____.','WAX',
	'He was hit by a poisoned ____.','DART',
	'Ruth had a necklace of glass ____.','BEADS',
	'The singer was mobbed by her ____.','FANS',
	'The fruit was shipped in wooden ____.','CRATES',
	'The candle burned with a bright ____.','FLAME',
	'We swam at the beach at high ____.','TIDE',
	'We got drunk in the local ____.','BAR',	
	'A termite looks like an ____.','ANT', 	
	'The chick swallowed the ____.','PILL',	
	'The burglar escaped with the ____.','LOOT',
	'He rode off in a cloud of ____.','DUST',	
	'The bloodhound followed the ____.','TRAIL',
	'On the beach we play in the ____.','SAND',
	'She hated to vacuum the ____.','RUG',	
	'Football is a dangerous ____.','SPORT'];
	Info(info,1,5);

	// Form 7 of the Revised SPIN Test (12/83)
	info = [
	'We\'re considering the ____.','BROW',		
	'I am thinking about the ____.','KNIFE',		
	'They\'ve considered the ____.','SHEEP',		
	'He\'s glad we heard about the ____.','SKUNK',	
	'The girl should not discuss the ____.','GOWN',	
	'Mr. Smith knew about the ____.','BAY',	
	'We did not discuss the ____.','SHOCK',		
	'Mr. Black had discussed the ____.','CARDS',	
	'Mr. Black considered the ____.','FLEET',	
	'We are considering the ____.','CHEERS',	
	'Sue was interested in the ____.','BRUISE',	
	'Miss Smith couldn\'t discuss the ____.','ROW',	
	'I am discussing the ____.','TASK',		
	'Paul should know about the ____.','NET',	
	'Miss Smith might consider the ____.','SHELL',	
	'You cannot have discussed the ____.','GREASE',
	'I did not know about the ____.','CHUNKS',	
	'I should have known about the ____.','GUM',	
	'Mary hasn\'t discussed the ____.','BLADE',	
	'Ruth has discussed the ____.','PEG',		
	'We have not thought about the ____.','HINT',	
	'The old man discussed the ____.','YELL',	
	'They\'re glad we heard about the ____.','TRACK',
	'The boy can\'t talk about the ____.','THORNS',	
	'Bill won\'t consider the ____.','BRAT'];
	Info(info,0,6);

	info = [
	'You cut the wood against the ____.','GRAIN',
	'The cop wore a bullet-proof ____.','VEST',
	'His pants were held up by a ____.','BELT',
	'Paul took a bath in the ____.','TUB',	
	'Maple syrup is made from ____.','SAP',	
	'They played a game of cat and ____.','MOUSE',
	'The thread was wound on a ____.','SPOOL',
	'The crook entered a guilty ____.','PLEA',
	'A bear has a thick coat of ____.','FUR',	
	'To open the jar, twist the ____.','LID',	
	'Tighten the belt by a ____.','NOTCH',	
	'The cookies were kept in a ____.','JAR',	
	'The marksman took careful ____.','AIM',
	'I ate a piece of chocolate ____.','FUDGE',
	'John\'s front tooth had a ____.','CHIP',	
	'At breakfast he drank some ____.','JUICE',
	'Our cat is good at catching ____.','MICE',
	'The stale bread was covered with ____.','MOLD',
	'How long can you hold your ____?','BREATH',
	'His boss made him work like a ____.','SLAVE',
	'Air mail requires a special ____.','STAMP',
	'The bottle was sealed with a ____.','CORK',
	'Cut the bacon into ____.','STRIPS',	
	'Throw out all this useless ____.','JUNK',
	'The shipwrecked sailors built a ____.','RAFT'];
	Info(info,1,6);

	// Form 8 of the Revised SPIN Test (12/83)
	info = [
	'Bob heard Paul called about the ____.','STRIPS',
	'Paul has a problem with the ____.','BELT',	
	'They knew about the ____.','FUR',		
	'We�re glad Ann asked about the ____.','FUDGE',
	'Jane was interested in the ____.','STAMP',	
	'Miss white would consider the ____.','MOLD',	
	'They want to know about the ____.','AIM',	
	'The woman discussed the ____.','GRAIN',	
	'You hope they asked about the ____.','VEST',	
	'We should have considered the ____.','JUICE',	
	'The woman considered the ____.','NOTCH',	
	'The woman knew about the ____.','LID',	
	'Jane wants to speak about the ____.','CHIP',	
	'Bob should not consider the ____.','MICE',	
	'Ruth hopes she called about the ____.','JUNK',	
	'I can�t consider the ____.','PLEA',		
	'Paul was interested in the ____.','SAP',		
	'He�s glad you called about the ____.','JAR',	
	'Miss Smith knows about the ____.','TUB',	
	'The man would not discuss the ____.','MOUSE',
	'Ann was interested in the ____.','BREATH',	
	'You�re glad they heard about the ____.','SLAVE',
	'The man could consider the ____.','SPOOL',	
	'Peter knows about the ____.','RAFT',		
	'She hears Bob asked about the ____.','CORK'];
	Info(info,0,7);

	info = [
	'My turtle went into its ____.','SHELL',	
	'I cut my finger with a ____.','KNIFE',	
	'Greet the heroes with loud ____.','CHEERS',
	'That animal stinks like a ____.','SKUNK',
	'A round hole won�t take a square ____.','PEG',
	'The admiral commands the ____.','FLEET',
	'The bride wore a white ____.','GOWN',	
	'I can�t guess so give me a ____.','HINT',
	'Our seats were in the second ____.','ROW',
	'The boat sailed across the ____.','BAY',	
	'That job was an easy ____.','TASK',	
	'The shepherd watched his flock of ____.','SHEEP',
	'David wiped the sweat from his ____.','BROW',
	'The bad news came as a ____.','SHOCK',
	'A spoiled child is a ____.','BRAT',	
	'The drowning man let out a ____.','YELL',
	'A rose bush has prickly ____.','THORNS',
	'The dealer shuffled the ____.','CARDS',
	'The railroad train ran off the ____.','TRACK',
	'My jaw aches when I chew ____.','GUM',
	'He caught the fish in his ____.','NET',	
	'Bob was cut by the jackknife�s ____.','BLADE',
	'Tom fell down and got a bad ____.','BRUISE',
	'Lubricate the car with ____.','GREASE',
	'Cut the meat into small ____.','CHUNKS'];
	Info(info,1,7);
	
	//
	var context = (this.context == 'Off') ? 0:1;
	this.materials = materials[context][this.list];
	
	// helper function
	function Info(info, context, set) {
		var contexts = ['A','B'];
		var filename;
		materials[context][set] = [];
		for (item=0; item<25; item++) {
			materials[context][set][item] = {};
			if (item<9) {
				sentence = item+1;
				filename = String(set+1)+'frm'+contexts[context]+'0'+sentence;
			} else {
				sentence = item+1;
				filename = String(set+1)+'frm'+contexts[context]+sentence;
			}
			materials[context][set][item].filename = filename;
			materials[context][set][item].keyword = info[2*item+1];
			materials[context][set][item].phrase = info[2*item];
		}
	}
};
SPIN.prototype.preload = function () {
	let that = this;	
	
	//
	activity.ready++;
	
	// disable start
	jQuery(".ui-dialog-buttonpane button:contains('Start')").button('disable');
	jQuery(".ui-dialog-buttonpane #message").html('Please wait, preparing test...&nbsp;');
		
	// load audio function
	let counter = 0;	
	function loadAudio(a,url,total) {
		let request = new XMLHttpRequest();
		request.index = a;
		request.open('GET',url,true);
		request.responseType = 'arraybuffer';
		request.onload = function (a) {
			audio.decodeAudioData(request.response, function (incomingBuffer) {
				that.stimuli[request.index] = incomingBuffer;
				counter++;
				if (counter == total) {
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
	let i = 0, total = 24, url;
	for (let a = 0; a < this.materials.length; a++) {
		url = 'data/spin/calibrated/'+this.materials[a].filename+'.wav';
		loadAudio(i++,url,total);
	}
};
SPIN.prototype.save = function (data) {
	data.context = this.context;
	return data;
}
SPIN.prototype.select = function () {
	if (this.available.length == 0) {	
		this.available.sequence(this.words.length);
		this.available.shuffle();
	}
	
	// specify target
	var target = this.available.pop();
	
	// carrier phrase
	jQuery('#message').html(this.materials[target].phrase);
	
	return target;
}
SPIN.prototype.settings = function(table,rowIndex) {
	var that = this;

	// context
	var row = table.insertRow(++rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = 'Context:';
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	var select = layout.select(['Off','On']);
	select.onchange = function() { 
		that.context = this.selectedIndex; 
		that.information();
		that.materials.sort(compareK);
		for (let a = 0; a < that.materials.length; a++) {
			that.words[a] = that.materials[a].keyword;
		}
	};
	select.value = that.context;
	jQuery(cell).append(select);
	if (widgetUI) { jQuery(select).selectmenu({change:select.onchange}); }
	var cell = row.insertCell(2);
	cell.style.width = '20%';
	
	return rowIndex;
};
SPIN.prototype.stimulus = function (call) {
	call = call ? call : 0;
	
	if ('preload' in this) {
		if(debug){console.log(call+': '+this.materials[call].filename)}
		processor.signal(this.stimuli[call]);
	} else {
		processor.signal(this.path+this.materials[call].filename+'.wav');

	}
}

// sorting function
function compareK(a, b) {
	if (a.keyword < b.keyword)
		return -1;
	if (a.keyword > b.keyword)
		return 1;
	return 0;
}