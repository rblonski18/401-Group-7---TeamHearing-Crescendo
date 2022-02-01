var jQuery, Howl;

// ListenAndRead object definition
var ListenAndRead = function(bookDivId, initialTitle, createTestButton) {
	"use strict";
	var useThis = this,
		numberOfButtons = 5.0;

	this.bookDivId = bookDivId;
	this.createTestButton = createTestButton;
	
	this.bookList = {};
	this.pstructures = [];
	this.currentPstructureIndex = 0;
	this.currentTTPairIndex = 0;
	this.audio = 0;
	this.isPlaying = false;
	
	// construct my infrastructure if needed
	this.initDiv("audiobooktext", bookDivId, {});
	jQuery("#audiobooktext").css({
		position: "absolute",
		top: "0%",
		left: "0%",
		width: "100%",
		height: "80%",
		padding: "3%",
		overflow: "auto"
	});
	
	this.initDiv("audiobookcontrols", bookDivId, {});
	jQuery("#audiobookcontrols")
	.css({
		position: "absolute",
		top: "80%",
		left: "10%",
		width: "80%",
		height: "8%",
		fontSize: 0
	})
	.addClass("ui-widget-header ui-corner-all");
	
	if (createTestButton) {
		numberOfButtons += 1.0;
	}
	
	this.initButton("backend", "ui-icon-seek-first", "#audiobookcontrols", {}, 1.0/numberOfButtons);
	this.initButton("backfast", "ui-icon-seek-prev", "#audiobookcontrols", {}, 1.0/numberOfButtons);
	this.initButton("playpause", "ui-icon-play", "#audiobookcontrols", {}, 1.0/numberOfButtons);
	this.initButton("forward", "ui-icon-seek-next", "#audiobookcontrols", {}, 1.0/numberOfButtons);
	this.initButton("forwardend", "ui-icon-seek-end", "#audiobookcontrols", {}, 1.0/numberOfButtons);

	// Poor separation between own div & rest of page layout here:
	// assume that if the caller has an element with the "startListenAndReadTest" class,
	// we don't need to construct a button
	if (createTestButton) {
		this.initButton("test", "ui-icon-extlink", "#audiobookcontrols", {}, 1.0/numberOfButtons);
		jQuery("#test").addClass("startListenAndReadTest");
	}

	jQuery.getScript("js/howler.js", function() {
		jQuery.ajax({
	        type: 'GET',
			url: '/version/'+version+'/php/audiobook.php',
	        success: function(data){
	            useThis.bookList = data;
	            
	            useThis.bookSelected(initialTitle /*'The Tortoise and the Ducks'*/);
	        },
	        error: function(data){
	            alert('Error');
	        }
	    });
	});
};
ListenAndRead.prototype.initDiv = function(idSelector, target, createOptions) {
	"use strict";
	if (jQuery("#" + idSelector).length === 0) {
		jQuery(target).append(jQuery("<div/>",
			jQuery.extend({},
				{id: idSelector},
				createOptions
			)
		));
	}
};
ListenAndRead.prototype.initButton = function(idSelector, iconClass, target, createOptions, fractionalWidth) {
	"use strict";
	
	var percentageWidth = 100.0 * fractionalWidth;
	if (jQuery("#" + idSelector).length === 0) {
		jQuery(target).append(jQuery("<button/>",
			jQuery.extend({},
				{id: idSelector, height: "100%", width: "" + percentageWidth + "%"},
				createOptions
			)).button({icons: {primary: iconClass}})
		);
	}
};
ListenAndRead.prototype.bookSelected = function (title) {
	"use strict";
	var useThis = this,
		audioPath;
	
	if (useThis.audio) {
		useThis.audioStop(useThis);
	}
	
	jQuery.each(jQuery.parseJSON(useThis.bookList), function(index, listingObject) {
    	if (listingObject.title === title) {
    		audioPath = listingObject.path;
    		useThis.selectedBookDBId = listingObject.id;
    		
    		// make sure to call audio.unload() if you select a different audio to load/play
    		if (useThis.audio) {
    			useThis.audio.unload();
    		}
    		
    		useThis.audio = new Howl({
    			urls: [audioPath],
    			onload: function() {
    				var sprite;
    				
    				// add sprites, including last one, which uses duration of total audio
    				sprite = useThis.putP(useThis.audio._duration);
    				useThis.audio.sprite(sprite);
    				
    				
    				jQuery("#backend").removeAttr("disabled");
    				jQuery("#backfast").removeAttr("disabled");
    				jQuery("#playpause").removeAttr("disabled");
    				jQuery("#forward").removeAttr("disabled");
    				jQuery("#forwardend").removeAttr("disabled");

    				if (useThis.createTestButton) {
        				jQuery(".startListenAndReadTest").removeAttr("disabled");
    				}
    			},
    			onloaderror: function() {
    				alert("Error: Not loaded!");
    			},
    			onplay: function() {
    				jQuery(".ui-icon-play").toggleClass("ui-icon-play ui-icon-pause");
    				useThis.isPlaying = true;
    			},
    			onend: function() {
    				if (useThis.isPlaying) {
    					useThis.setCompletedCurrent(useThis);
    					useThis.forward(useThis);
    				}
    			}
    		});
    	}
    });
	
	jQuery.ajax({
        type: 'GET',
		url: '/version/'+version+'/php/audiobookchunk.php',
        data: {
        	title: title
        },
        success: function(data){
            useThis.pstructures = useThis.buildAudioBookChunkList(jQuery.parseJSON(data));
            //alert('Success');
        },
        error: function(data){
            alert('Error');
        }
    });
	
	
	useThis.reset(useThis);
	
	// initialize and bind controls
	jQuery("#backend").attr("disabled", "disabled");
	jQuery("#backfast").attr("disabled", "disabled");
	jQuery("#playpause").attr("disabled", "disabled");
	jQuery("#forward").attr("disabled", "disabled");
	jQuery("#forwardend").attr("disabled", "disabled");

	if (useThis.createTestButton) {
		jQuery(".startListenAndReadTest").attr("disabled", "disabled");
	}
	
	jQuery("#backend").off("click");
	jQuery("#backfast").off("click");
	jQuery("#playpause").off("click");
	jQuery("#forward").off("click");
	jQuery("#forwardend").off("click");
	
	if (useThis.createTestButton) {
		jQuery(".startListenAndReadTest").off("click");
	}
	
	jQuery("#backend").on("click", function() {useThis.backend(useThis);});
	jQuery("#backfast").on("click", function() {useThis.backfast(useThis);});
	jQuery("#playpause").on("click", function() {useThis.playpause(useThis);});
	jQuery("#forward").on("click", function() {useThis.forward(useThis);});
	jQuery("#forwardend").on("click", function() {useThis.forwardend(useThis);});
	
	if (useThis.createTestButton) {
		jQuery(".startListenAndReadTest").on("click", function() {useThis.startTest(useThis);});
	}
	
	// remove separate title in favor of narrated title
	//jQuery("#audiobooktitle").text(title);
	jQuery("#audiobooktext").text("Loading ...");
};
ListenAndRead.prototype.writeBookCompletionStatus = function(subuser, user) {
	"use strict";
	var useThis = this, completed;
	
	if (useThis.completedAnyChunks()) {
		completed = 0; // at least started listening
		
		if (useThis.completedAllChunks()) {
			completed = 1; // and actually completed all - not counting how many completions in this session
		}

		jQuery.ajax({
	        type: 'POST',
			url: '/version/'+version+'/php/audiobookUser.php',
	        data: {
	        	// caller should provide these from the "framework"
	        	userid: (subuser ? subuser.ID : null) || user.ID,
    			audiobookid: useThis.selectedBookDBId,
    			completed: completed
	        },
	        success: function(data){},
	        error: function(data){
	            alert('Error');
	        }
	    });
	}
};
ListenAndRead.prototype.buildAudioBookChunkList = function(objectArray) {
	"use strict";
	var ps = [],
		p = [],
		i;
	
	for (i = 0; i < objectArray.length; i += 1) {
		p.push({time: objectArray[i].starttime, text: objectArray[i].text});
		
		// change appeared in "Aesops 12-5-13" - last chunk not marked as "endpara"
		if (i === (objectArray.length - 1)) {
			objectArray[i].endpara = "1";
		}
		
		if (objectArray[i].endpara === "1") {
			ps.push(p);
			
			p = [];
		}
	}
	return ps;
};
ListenAndRead.prototype.makeSpriteName = function(pstructureIndex, ttPairIndex) {
	"use strict";
	
	return pstructureIndex.toString() + "-" + ttPairIndex.toString();
};
ListenAndRead.prototype.setCompletedCurrent = function(useThis) {
	"use strict";
	var p, chunk;
	
	if ((useThis.currentPstructureIndex < useThis.pstructures.length) &&
		(useThis.currentTTPairIndex < useThis.pstructures[useThis.currentPstructureIndex].length)) {
		p = useThis.pstructures[useThis.currentPstructureIndex];
		chunk = p[useThis.currentTTPairIndex];
		
		if (! chunk.completed) {
			chunk.completed = true;
		}
	}
};
ListenAndRead.prototype.completedAllChunks = function() {
	"use strict";
	var useThis = this,
		iP,
		iChunk,
		p,
		chunk;
	
	for (iP = 0; iP < useThis.pstructures.length; iP += 1) {
		p = useThis.pstructures[iP];
		
		for (iChunk = 0; iChunk < useThis.pstructures[iP].length; iChunk += 1) {
			chunk = p[iChunk];
			
			if (! (chunk.completed)) {
				return false;
			}
		}
	}
	
	return true;
};
ListenAndRead.prototype.completedAnyChunks = function() {
	"use strict";
	var useThis = this,
		iP,
		iChunk,
		p,
		chunk;
	
	for (iP = 0; iP < useThis.pstructures.length; iP += 1) {
		p = useThis.pstructures[iP];
		
		for (iChunk = 0; iChunk < useThis.pstructures[iP].length; iChunk += 1) {
			chunk = p[iChunk];
			
			if (chunk.completed) {
				return true;
			}
		}
	}
	
	return false;
};
ListenAndRead.prototype.setCurrent = function(spriteName) {
	"use strict";
	var useThis = this,
		parts = spriteName.split("-");
	
	useThis.currentPstructureIndex = parts[0] * 1;
	useThis.currentTTPairIndex = parts[1] * 1;
};
ListenAndRead.prototype.putP = function(totalDuration) {
	"use strict";
	var useThis = this,
		p,
		iP,
		pDiv,
		ttPair,
		iPair,
		sprites = {}, spriteStart, spriteEnd,
		buildSpriteTextChunk = function (elem, spriteName, startT, endT, text) {
			sprites[spriteName] = [startT, (endT - startT)];
		
			jQuery(elem).append(
				jQuery("<span/>", {
					id: spriteName,
					text: text
				})
			);
		};
	
	jQuery("#audiobooktext").empty();
	
	// build audio sprites & corresponding text chunks
	for (iP = 0; iP < useThis.pstructures.length; iP += 1) {
		p = useThis.pstructures[iP];
		pDiv = jQuery("<p/>");
		jQuery("#audiobooktext").append(pDiv);
		
		for (iPair = 0; iPair < (p.length - 1); iPair += 1) {
			ttPair = p[iPair];
			
			spriteStart = ttPair.time * 1000.0;
			spriteEnd = p[iPair+1].time * 1000.0;
			buildSpriteTextChunk(pDiv, useThis.makeSpriteName(iP, iPair), spriteStart, spriteEnd, ((iPair === 0) ? "" : " ") + ttPair.text, iPair.toString());
		}
		
		// iPair is last in pstructure, look into next one
		if (iP < (useThis.pstructures.length - 1)) {
			ttPair = p[iPair];
			
			spriteStart = ttPair.time * 1000.0;
			spriteEnd = (useThis.pstructures[iP+1])[0].time * 1000.0;
			buildSpriteTextChunk(pDiv, useThis.makeSpriteName(iP, iPair), spriteStart, spriteEnd, ((iPair === 0) ? "" : " ") + ttPair.text);
		} else {
			// need to play to end of audio file
			// duration of audio does not seem to be available right away, so defer it
			ttPair = p[iPair];
			
			spriteStart = ttPair.time * 1000.0;
			spriteEnd = totalDuration * 1000.0;
			buildSpriteTextChunk(pDiv, useThis.makeSpriteName(iP, iPair), spriteStart, spriteEnd, ((iPair === 0) ? "" : " ") + ttPair.text, iPair.toString());
		}
	}
	
	// make text chunks responsive
	jQuery("span").on("click", function (event) {
		var targetId = event.target.id;
		
		useThis.audio.stop();
		useThis.highlightCurrent(false);
		useThis.isPlaying = false;
		
		useThis.setCurrent(targetId);
		
		useThis.highlightCurrent(true);
		useThis.audio.play(targetId);
	});
	
	return sprites;
};
ListenAndRead.prototype.incrementPair = function() {
	"use strict";
	var useThis = this,
		p = useThis.pstructures[useThis.currentPstructureIndex];
	
	if (useThis.currentTTPairIndex < (p.length - 1)) {
		useThis.currentTTPairIndex += 1;
		return true;
	}
	
	if (useThis.currentPstructureIndex < (useThis.pstructures.length - 1)) {
		useThis.currentPstructureIndex += 1;
		useThis.currentTTPairIndex = 0;
		return true;
	}
	
	return false;
};
ListenAndRead.prototype.decrementPair = function() {
	"use strict";
	var useThis = this;
	
	if (useThis.currentTTPairIndex > 0) {
		useThis.currentTTPairIndex -= 1;
		return true;
	}
	
	if (useThis.currentPstructureIndex > 0) {
		useThis.currentPstructureIndex -= 1;
		useThis.currentTTPairIndex = 0;
		return true;
	}
	
	return false;
};
ListenAndRead.prototype.highlightCurrent = function(tf) {
	// highlight a chunk and scroll if into view
	"use strict";
	var useThis = this,
		id,
		divHalfHeight,
		chunkTop,
		chunkJump;

	id = "#" + useThis.makeSpriteName(useThis.currentPstructureIndex, useThis.currentTTPairIndex);
	divHalfHeight = jQuery("#audiobooktext").height() / 2;
	chunkTop = jQuery(id).position().top;
	chunkJump = ((chunkTop > divHalfHeight) ||
			(chunkTop < jQuery("#audiobooktext").scrollTop())) ? true : false;

	// set the location in the div
	if (chunkJump) {
		jQuery("#audiobooktext").scrollTop(chunkTop - divHalfHeight);
	}
	
	// highlight
	jQuery(id).css({backgroundColor: tf ? 'yellow' : 'white'});
};
ListenAndRead.prototype.audioStop = function(useThis) {
	"use strict";
	useThis.audio.stop();
	useThis.highlightCurrent(false);
//	jQuery("#playpause img").attr("src","./images/play.png");
	jQuery(".ui-icon-pause").toggleClass("ui-icon-pause ui-icon-play");
	useThis.isPlaying = false;
};
ListenAndRead.prototype.audioPlay = function(useThis) {
	"use strict";
	useThis.highlightCurrent(true);
	useThis.audio.play(useThis.makeSpriteName(useThis.currentPstructureIndex, useThis.currentTTPairIndex));
};
ListenAndRead.prototype.reset = function(useThis) {
	"use strict";
	useThis.currentPstructureIndex = 0;
	useThis.currentTTPairIndex = 0;
};
ListenAndRead.prototype.backend = function(useThis) {
	"use strict";
	
	useThis.audioStop(useThis);
	
	useThis.currentTTPairIndex = 0;

	if (useThis.decrementPair()) {
		useThis.audioPlay(useThis);
	}
};
ListenAndRead.prototype.backfast = function(useThis) {
	"use strict";
	
	useThis.audioStop(useThis);
	
	// from first chunk in para,
	// go back to last chunk of previous para
	if ((useThis.currentTTPairIndex === 0) && (useThis.currentPstructureIndex > 0)) {
		useThis.currentPstructureIndex -= 1;
		useThis.currentTTPairIndex = useThis.pstructures[useThis.currentPstructureIndex].length;
	}
	
	if (useThis.decrementPair()) {
		useThis.audioPlay(useThis);
	}
};
ListenAndRead.prototype.playpause = function(useThis) {
	"use strict";
	
	if (! useThis.isPlaying) {
		useThis.audioPlay(useThis);
	} else {
		// pause does not work well for me.
		//audio.pause();
		useThis.audio.stop();
//		jQuery("#playpause img").attr("src","./images/play.png");
		jQuery(".ui-icon-pause").toggleClass("ui-icon-pause ui-icon-play");
		useThis.isPlaying = false;
	}
};
ListenAndRead.prototype.forward = function(useThis) {
	"use strict";
	
	useThis.audioStop(useThis);
	
	if (useThis.incrementPair()) {
		useThis.audioPlay(useThis);
	} else {
		// handle end-of-audio - reset to beginning
		useThis.reset(useThis);
	}
};
ListenAndRead.prototype.forwardend = function(useThis) {
	"use strict";
	
	useThis.audioStop(useThis);
	
	useThis.currentTTPairIndex = useThis.pstructures.length - 1;

	if (useThis.incrementPair()) {
		useThis.audioPlay(useThis);
	} else {
		// handle end-of-audio - reset to beginning
		useThis.reset(useThis);
	}
};

/*
 * AudioBook "testing"
 */
ListenAndRead.prototype.startTest = function(useThis, numberOfFoils, numberOfTrials, correctCallback, incorrectCallback, completeCallback) {
	"use strict";
	
	useThis.theLRTest = new ListenAndReadTest(useThis.bookDivId/*testDivId*/, useThis, false /*useFullText*/, numberOfFoils, numberOfTrials, correctCallback, incorrectCallback, completeCallback);
};
ListenAndRead.prototype.saveTestResults = function(useThis, subuser, user) {
	useThis.theLRTest.saveResults(subuser, user);
};

// --- UI Functions ---
// Listen & Read UI functions called directly or indirectly from dashboard.js
function rebuildMainUI(forModule) {
	// main
	var main = jQuery('#main');
	main.empty();
	
	// back button
	layout.backbutton(function(){layout.training()});
	
	// title
	main.append(jQuery("<h1>", {text: forModule}).css("display", "inline-block"));
	
	// horizontal rule
	main.append(jQuery("<hr>", {"class": "ui-widget-header"}));
		
	// hook for future re-use with different module names
	if (forModule == 'Listen & Read') {
		var exit = jQuery("#exit"),
			test = jQuery(".startListenAndReadTest"),
			menu = jQuery("<ul>").css({
			maxHeight: "80%",
			overflow: "auto"
		});
		
		// remove the "exit" buttons if they exist - we are no longer in a story
		if (test.length > 0) {test.remove();}
		if (exit.length > 0) {exit.remove();}
		
		// get menu content
		jQuery.ajax({
	        type: 'GET',
			url: '/version/'+version+'/php/audiobook.php',
	        success: function(data){
	        	buildMenuUI(main, menu, data);
	        },
	        error: function(data){console.log(data);}
	    });
	}
}
function buildMenuUI(main, menu, menuData) {
	jQuery.ajax({
        type: 'GET',
		url: '/version/'+version+'/php/audiobookUserTest.php',
        data: {userid: (subuser.ID) ? subuser.ID : user.ID},
        success: function(completionData){
        	buildBookListUI(menu, menuData, completionData);
            
        	main.append(menu.menu({
                select: function(event, ui) {
                	// exit and test buttons
                	var exit,
                		test;
                	
                    // 
                	main.empty();
                	
					// footer 
                	jQuery("#footer").empty();
                	
					//
                	theAudioBook = new ListenAndRead('#main', ui.item.text());
                	
                	// apply some theme coloration: this is a fudge, because it breaks encapsulation
                	jQuery("#audiobooktext").addClass("ui-widget ui-widget-content ui-corner-all");
                	jQuery("#audiobookcontrols").addClass("ui-widget ui-widget-content ui-corner-all");
                	
                	// test button
            		test = jQuery("<img>", { id: 'startTest', src: '/images/report_check.png', title: 'test' })
            		.css({
            			height: 0.7*jQuery("#footer").outerHeight(true)+'px',
            			paddingRight: '20px',
            			float: 'right'
            		})
            		.addClass("startListenAndReadTest");
                	test.on("click", buildBookTest);  
                	jQuery("#footer").append(test);
                	
                	// exit button;
            		exit = jQuery("<img>", { id: 'exit', src: '/images/exit.png', title: 'exit' }).css({
            			height: 0.7*jQuery("#footer").outerHeight(true)+'px',
            			paddingRight: '20px',
            			float: 'right'
            		});
                	exit.on("click", function() {
                		// track whether or not user has completed the book
                		theAudioBook.writeBookCompletionStatus(subuser, user);
                		// repair the footer
                		layout.footer();
                		// return to menu
                		rebuildMainUI("Listen & Read");
                	});
                	
                	// to make appearance consistent with SHS, make this the right-most img
                	jQuery("#footer img:first").before(exit);
            }}));
        	
        },
        error: function(data){console.log(data);}
    });
}
function buildBookTest() {
	var numberOfFoils = 4,
		numberOfTrials = 5;
	
	// remove the "test" button - don't need it!
	// in fact, remove all the buttons except "exit" from the footer
	jQuery("#startTest").remove();
	jQuery.each(jQuery("#footer").children(), function(index, elem) {
		var e = jQuery(elem);
		
		if (e.attr("id") !== "exit") {
			e.remove();
		}
	});

	// build score-keeping list
	listenAndReadScore = [];
	while (listenAndReadScore.length < numberOfTrials) {
		listenAndReadScore.push(
			jQuery("<img>", {src: "/images/score-nan.png"})
		);
		jQuery("#footer").append(
			listenAndReadScore[listenAndReadScore.length - 1]
		);
	}
	
	// invoke test
	theAudioBook.startTest(theAudioBook,
		numberOfFoils,
		numberOfTrials,
		/*correctCallback*/ function() {
			jQuery("#footer img[src='/images/score-nan.png']")
			.filter(":first")
			.attr("src", "/images/score-yay.png");
		},
		/*incorrectCallback*/ function() {
			jQuery("#footer img[src='/images/score-nan.png']")
			.filter(":first")
			.attr("src", "/images/score-nay.png");
		},
		/*completeCallback*/ function() {
			theAudioBook.saveTestResults(theAudioBook, subuser, user);
	
			// repair the footer
			layout.footer();
			// return to menu
			rebuildMainUI("Listen & Read");
		});
}
function buildBookListUI(menu, data, completionData) {
	var completedList = jQuery.parseJSON(completionData);
	
	jQuery.each(jQuery.parseJSON(data), function(index, listing) {
		var
        	// RG 23 Jan 2014: change function of stars - indicate test results, not completion of book
			starPath,
			numberOfStars,
			iStar,
			stars,
			starDescription,
			//completed;
			itemCount,
			correct;
		
		// I can't figure something much cleaner right now
		// until Array.find() is implemented widely
		
		//completed = null;
		itemCount = null;
		correct = null;
		jQuery.each(completedList, function(cIndex, cItem){
			var currentItemCount, currentCorrect;
			if (cItem.audiobookid === listing.id) {
		        // RG 23 Jan 2014: change function of stars - indicate test results, not completion of book
				//completed = parseInt(cItem.completed, 10);
				currentItemCount = parseFloat(cItem.itemCount, 10);
				currentCorrect = parseFloat(cItem.correct, 10);
				
				if (itemCount) {
					// RG 24 Jan 2014: if tested more than once, show best result
					if ((currentCorrect / currentItemCount) > (correct / itemCount)) {
						itemCount = currentItemCount;
						correct = currentCorrect;
					}
				} else {
					// first time test has been done
					itemCount = currentItemCount;
					correct = currentCorrect;
				}
				return true;
			}
			return true;
		});
		
		// RG 23 Jan 2014: "1 star for completing the test, 2 stars for only missing 1 question, 3 stars for perfect"
		if (! itemCount) {
			// has not done test: black stars only
			starDescription = "Not yet.";
			numberOfStars = 0;
		} else if (itemCount === correct) {
			// perfect: 3 gold stars
			starDescription = "Perfect!";
			numberOfStars = 3;
		} else if ((itemCount - 1) === correct) {
			// good: 2 gold stars
			starDescription = "Good job.";
			numberOfStars = 2;
		} else {
			// did it: 1 gold star
			starDescription = "Test completed.";
			numberOfStars = 1;
		}
		
		stars = jQuery("<span>", {
			title: starDescription
		})
		.css({
			float: "right"
		});
		
		for (iStar = 2; iStar >= 0; iStar -= 1) {
			if (iStar < numberOfStars) {
				starPath = "/images/star_gold_48.png";
			} else {
				starPath = "/images/star_full_48.png";
			}
			stars.append(
				jQuery("<img>", {
					src: starPath
				})
				.css({height: "1em"})
			);
		}
		
		menu.append(
			jQuery("<li>", {
				id: index
			})
			.append(jQuery("<a>", {
				id: "menuitem" + index,
				href: "#"
			})
			.text(listing.title)
			.append(stars)
		));
		
	});

	// enable display of tooltips on elements containing a "title" attribute
	menu.tooltip();
}

// --- Test Creation ---
// Listen & Read Test object
/*
 * Assume someone built the "Test" button at the end of the story;
 * when the user chose to take the test, we got created.
 * 
 * In general, you can't assume that all the text fits on screen.
 * (Some stories are long, and you might have a tablet or other
 * smalelr device.) In addition, trying to find a single phrase
 * out of 4 or 5 (or more) paragraphs of text is some kind
 * of visual search task, not a reading task per se.
 */
var ListenAndReadTest = function(testDivId, theLR, useFullText, numberOfFoils, numberOfTrials, correctCallback, incorrectCallback, completeCallback) {
	"use strict";
	var useThis = this,
		iP,
		iChunk;
	
	// cache arguments
	this.theDivId = testDivId;
	this.theLR = theLR;
	this.useFullText = useFullText;
	
	if ((! useFullText) && numberOfFoils) {
		this.numberOfFoils = numberOfFoils;
	} else if (! useFullText) {
		this.numberOfFoils = 3;
	}
	
	if (numberOfTrials) {
		this.numberOfTrials = numberOfTrials;
	} else {
		this.numberOfTrials = 5;
	}
	this.numberOfTrialsCompleted = 0;
	
	this.correctCallback = correctCallback;
	this.incorrectCallback = incorrectCallback;
	this.completeCallback = completeCallback;

	
	// build list of items for "questions"
	this.spriteNameList = [];
	for (iP = 0; iP < theLR.pstructures.length; iP += 1) {
		//p = theLR.pstructures[iP];
		
		for (iChunk = 0; iChunk < theLR.pstructures[iP].length; iChunk += 1) {
			//chunk = p[iChunk];
			
			this.spriteNameList.push(theLR.makeSpriteName(iP, iChunk));
		}
	}
	
	/**
	 * modify audio sprite player to unhook it from UI items
	 */
	useThis.theLR.audio._onplay = [];
	useThis.theLR.audio._onpause = [];
	useThis.theLR.audio._onend = [];
	
	/**
	 * build our control items in the given element (div):
	 * - "Start" dialog with button
	 */
	jQuery(testDivId)
	.empty()
	.append(jQuery("<div/>", {id: "listenAndReadStartDlg"}));
	
	jQuery("#listenAndReadStartDlg")
	.dialog({
		title: "Listen & Read Test",
		modal: true,
		autoOpen: false,
		resizable: false
	});
	
	jQuery("#listenAndReadStartDlg .ui-dialog-titlebar-close")
	.css("display", "none");
	
	jQuery("#listenAndReadStartDlg")
	.text('Press "Start" to begin')
	.append("<br>").append("<br>")
	.append(jQuery("<button>", {id: "listenAndReadStartBtn", text: "Start"}));
	
	jQuery("#listenAndReadStartBtn")
	.on("click", function() {
		jQuery("#listenAndReadStartDlg").dialog("destroy").remove();
		useThis.correctTrials = 0;
		useThis.buildTrial();
	})
	.button();
	
	jQuery("#listenAndReadStartDlg")
	.dialog("open");
};

/**
 * build our control items in the given element (div):
 * - random foil phrases or full text? (each clickable)
 * - "Listen again" button
 */
ListenAndReadTest.prototype.buildTrial = function() {
	"use strict";
	var useThis = this,
		items = useThis.randomSet(),
		//itemPicker = [],
		i,
		spriteList = [],
		listenButton = jQuery("<button/>", {
			text: "Listen again"
		}),
		answers = jQuery("<div>", {
			width: "100%"
		});
	
	spriteList.push(items.selectedSpriteName);
	for (i = 0; i < items.foilSpriteNames.length; i += 1) {
		spriteList.push(items.foilSpriteNames[i]);
	}
	spriteList = useThis.randomize(spriteList);
	
	jQuery.each(spriteList, function(index, spriteName) {
		var itemButton = jQuery("<button/>", {
				text: useThis.getText(spriteName)//chunk.text
			});
		
		if (spriteName === items.selectedSpriteName) {
			itemButton.on("click", function() {
				useThis.correctResponse();
			});
		} else {
			itemButton.on("click", function() {
				useThis.incorrectResponse();
			});
		}
		
		answers.append(itemButton.button());
		answers.append(jQuery("<br>"));
	});
	
	jQuery(useThis.theDivId).append(answers);
	answers.position({
		my: "center",
		at: "center",
		of: jQuery(useThis.theDivId)
	});
	
	listenButton.on("click", function() {
		useThis.theLR.audio.play(items.selectedSpriteName);
	})
	.button();
	jQuery(useThis.theDivId).append(listenButton);
	listenButton.position({
		my: "center bottom",
		at: "center bottom",
		of: listenButton.parent()
	});
	
	useThis.theLR.audio.play(items.selectedSpriteName);
};
ListenAndReadTest.prototype.correctResponse = function() {
	"use strict";
	var useThis = this;
	
	useThis.correctTrials += 1;
	
	if (useThis.correctCallback) {
		useThis.correctCallback();
	}
	
	useThis.nextTrial();
};
ListenAndReadTest.prototype.incorrectResponse = function() {
	"use strict";
	var useThis = this;

	if (useThis.incorrectCallback) {
		useThis.incorrectCallback();
	}
	
	useThis.nextTrial();
};
ListenAndReadTest.prototype.nextTrial = function() {
	"use strict";
	var useThis = this;
	
	useThis.numberOfTrialsCompleted += 1;
	
	if (useThis.numberOfTrialsCompleted < useThis.numberOfTrials) {
		jQuery(useThis.theDivId).empty();
		useThis.buildTrial();
	} else {
		// display score, etc.
		useThis.wrapUpTrials();
	}
};
ListenAndReadTest.prototype.wrapUpTrials = function() {
	"use strict";
	var useThis = this;
	
	jQuery(useThis.theDivId)
	.append(jQuery("<div/>", {id: "listenAndReadDoneDlg"}));
	
	jQuery("#listenAndReadDoneDlg")
	.dialog({
		title: "Listen & Read Test",
		modal: true,
		autoOpen: false,
		resizable: false
	});
	
	jQuery("#listenAndReadDoneDlg .ui-dialog-titlebar-close")
	.css("display", "none");
	
	jQuery("#listenAndReadDoneDlg")
	.text("" + useThis.correctTrials + " correct out of " + useThis.numberOfTrials)
	.append("<br>").append("<br>")
	.append(jQuery("<button>", {id: "listenAndReadDoneBtn", text: "Done"}));
	
	jQuery("#listenAndReadDoneBtn")
	.on("click", function() {
		jQuery("#listenAndReadDoneDlg").dialog("destroy").remove();
		// Let caller decide how to return to menu of readings?
		if (useThis.completeCallback) {
			useThis.completeCallback();
		}
	})
	.button();
	
	jQuery("#listenAndReadDoneDlg")
	.dialog("open");
};

/**
 * - entry point for saving score, more than once for each book?
 */
ListenAndReadTest.prototype.saveResults = function(subuser, user) {
	"use strict";
	var useThis = this, now = new Date().toString();
	
	useThis.createResult(
		useThis.theLR.selectedBookDBId,
		(subuser ? subuser.ID : user.ID),
		now,
		useThis.numberOfTrials,
		useThis.numberOfFoils,
		useThis.correctTrials
	);
};
ListenAndReadTest.prototype.getResults = function(userid) {
	"use strict";
	var testsForUser;
	
	jQuery.ajax({
        type: 'GET',
        url: '/version/'+version+'/php/audiobookUserTest.php',
        data: {
    		userid: userid
        },
        async: false,
        success: function(data){
            console.log(data);
            //alert('Success');
            
            testsForUser = jQuery.parseJSON(data);
        },
        error: function(data){
            console.log(data);
            //alert('Error');
        }
    });
	
	return testsForUser;
};
ListenAndReadTest.prototype.createResult = function(audiobookid, userid, datetime, itemCount, foilCount, correct) {
	"use strict";
	
	jQuery.ajax({
        type: 'POST',
        url: '/version/'+version+'/php/audiobookUserTest.php',
        data: {
        	audiobookid: audiobookid,
    		userid: userid,
    		datetime: datetime,
    		itemCount: itemCount,
    		foilCount: foilCount,
    		correct: correct
        },
        async: false,
        success: function(data){
            console.log(data);
            console.log('Success');
        },
        error: function(data){
            console.log(data);
            console.log('Error');
        }
    });
};
ListenAndReadTest.prototype.deleteResult = function(audiobookid, userid, datetime) {
	"use strict";
	
	jQuery.ajax({
        type: 'DELETE',
        url: '/version/'+version+'/php/audiobookUserTest.php',
        data: {
        	audiobookid: audiobookid,
    		userid: userid,
    		datetime: datetime
        },
        success: function(data){
            console.log(data);
            console.log('Success');
        },
        error: function(data){
            console.log(data);
            console.log('Error');
        }
    });
};
ListenAndReadTest.prototype.getText = function(spriteName) {
	"use strict";
	var useThis = this,
		nameParts,
		iP,
		iChunk,
		p,
		chunk;
	
	nameParts = spriteName.split("-");
	iP = nameParts[0] * 1;
	iChunk = nameParts[1] * 1;
	p = useThis.theLR.pstructures[iP];
	chunk = p[iChunk];
	
	return chunk.text;
};
ListenAndReadTest.prototype.randomSet = function() {
	"use strict";
	var useThis = this,
		selectedSpriteName,
		foilSpriteNames = [],
		dedupTextSpriteNameList = [],
		iSN,
		text,
		testSN,
		testText;
	
	/* ignore if using full text */
	if (useThis.useFullText) {
		return null;
	}
	
	/* check for, and exclude, sprites with duplicated text, in case */
	for (iSN = 0; iSN < useThis.spriteNameList.length; iSN += 1) {
		if (dedupTextSpriteNameList.length === 0) {
			dedupTextSpriteNameList.push(useThis.spriteNameList[iSN]);
			continue;
		}
		
		text = useThis.getText(useThis.spriteNameList[iSN]);
		
		for (testSN = 0; testSN < dedupTextSpriteNameList.length; testSN += 1) {
			testText = useThis.getText(dedupTextSpriteNameList[testSN]);
			
			if ((text === testText) || (text.toUpperCase() === testText.toUpperCase())) {
				continue;
			}
			
			// not duplicated: add it to clean list, go get next item
			dedupTextSpriteNameList.push(useThis.spriteNameList[iSN]);
			break;
		}
	}
	
	// select random without replacement
	for(iSN = 0; iSN < (useThis.numberOfFoils + 1); iSN += 1) {
		if (iSN === 0) {
			testSN = Math.floor(Math.random() * dedupTextSpriteNameList.length);
			selectedSpriteName = dedupTextSpriteNameList[testSN];
		} else {
			testSN = Math.floor(Math.random() * dedupTextSpriteNameList.length);
			foilSpriteNames.push(dedupTextSpriteNameList[testSN]);
		}
		dedupTextSpriteNameList.splice(testSN, 1);
	}
	
	return {selectedSpriteName: selectedSpriteName, foilSpriteNames: foilSpriteNames};
};

// in-place shuffle
ListenAndReadTest.prototype.randomize = function(array) {
	"use strict";
	var i = array.length, t, j;

	while (0 !== i) {
		j = Math.floor(Math.random() * i);
		i -= 1;

		t = array[i];
		array[i] = array[j];
		array[j] = t;
	}

	return array;
};