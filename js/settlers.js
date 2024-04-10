var QUESTIONS_PER_ERA = 2;
var QUESTIONS_PER_GAME = 20;
var COUNTER_VOTE_CHANCE = 0.25;
var graph;

var gameObject = {};

var hDisplay = document.querySelector("#hook-text");
var eDisplay = document.querySelector("#era-title");			
var tDisplay = document.querySelector("#text-canvas");
var aDisplay = document.querySelector("#answer-canvas");

var displayContentComplete = false;
var gameOver = false;

//DEBUG
DEBUG = false;
GAME_OVER_DEBUG = false;
MAX_DEBUG_QUESTIONS = 1;

$(window).on('resize', function(){
	graph.configure({
		width: window.innerWidth - 200,
		height: 250
	});
	graph.render();
});


function loadScript(url, callback) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;

	script.onreadystatechange = callback;
	script.onload = callback;
	
	head.appendChild(script);
}

function gameSetup() {	
	
	gameObject.gameContent = generateGameContent(SoPQuestionData);	
	gameObject.gameScore = {"pop": 0, "econ": 0, "rep": 0, "sol": 0};
	gameObject.contentCount = 0;
	
	startGame();
}

function startGame() {
	
	drawGraph();
	requestAnimationFrame(frame);

}

function frame() {
	if (GAME_OVER_DEBUG) {
		displayGameOver();
	}
	
	if (!displayContentComplete && !gameOver) {
		resetCanvas();

		if (gameObject.gameContent.length > 0) {					
			displayContent();
			requestAnimationFrame(frame);
			
		} else {
			displayGameOver();
		}
	} /*else if (gameOver) {
		displayGameOver();
	}*/			
}

function generateGameContent(json) {

	var arr = [];
	
	if (DEBUG) {
		for (var k = 0; k < json.length; k++) {
			arr.push(json[k].newEra);
			if (MAX_DEBUG_QUESTIONS > 0) {
				for (var l = 0; l < MAX_DEBUG_QUESTIONS; l++) {
					arr.push(json[k].questions[l]);
				}
			} else {
				for (var l = 0; l < json[k].questions.length; l++) {
					arr.push(json[k].questions[l]);
				}
			}
		}		
	} else {
		//Setup 
		arr.push(json[0].newEra);
		for (var j = 0; j < json[0].questions.length; j++) {
			arr.push(json[0].questions[j]);
		}
		
		for (var i=1; i<json.length; i++) {
			
			arr.push(json[i].newEra);
			var	questionArray = json[i].questions;				
			var bossQuestionIndex = getIndex(questionArray, "B");
							
			if (bossQuestionIndex > 0) {					
				var tempObj = questionArray.splice(bossQuestionIndex,1);
				arr.push(questionArray.splice(Math.floor(questionArray.length*Math.random()),1)[0]);
				arr.push(tempObj[0]);
			} else {
				for (var j=0; j<QUESTIONS_PER_ERA; j++) {
					arr.push(questionArray.splice(Math.floor(questionArray.length*Math.random()),1)[0]);
				}				
			}				
		}
	}
	
	return arr;

}

function getStringLength(str, div) {
	var lengthTestDiv = document.getElementById("invisibleContainer");
	lengthTestDiv.style.fontSize = window.getComputedStyle(div,null).getPropertyValue('font-size');
	lengthTestDiv.innerHTML = str;
	var height = (lengthTestDiv.clientHeight + 1) + "px";
	var width = (lengthTestDiv.clientWidth + 60) + "px";
	return {"width":width,"height":height};
}

function displayContent() {
	var headerDiv = document.querySelector("#headerContent");
	var mainDiv = document.querySelector("#mainContent");
	var answerDiv = document.querySelector("#answerContent");
	
	var e, h, t, a;
	var divSize;
	
	var curGameContent = gameObject.gameContent.shift();

	
	//Hook text			
	if (curGameContent.type === "newEra") { 
		//divSize = getStringLength(curGameContent.hook,eDisplay);
		t = document.createTextNode(curGameContent.hook);
		//headerDiv.style.width = divSize.width;
		eDisplay.appendChild(t);
		headerDiv.classList.add("fadeInAnimation");				
	} else {
		h = document.createTextNode(curGameContent.hook);
		hDisplay.appendChild(h);
		headerDiv.classList.add("fadeInAnimation");
	}
	
	//Main text
	if (curGameContent.text != "") {
		t = document.createTextNode(curGameContent.text);
		tDisplay.appendChild(t);
		mainDiv.classList.add("fadeInAnimation");
	//	mainDiv.style.animationDelay = "1s";
	}
	
	if (curGameContent.answers) {
		
		for(var i=0; i<curGameContent.answers.length; i++) {
			
			(function(i) {
				var para = createPElement(curGameContent.answers[i].answer, 0, "0.4em");

				para.answerIndex = i;									
				para.addEventListener("click", function() {
					var answerChosen;
					if (curGameContent.type != "setup" && kibbutzVotesAgainst()) {
						answerChosen = findNewAnswer(curGameContent.answers, para.answerIndex);
					} else {
						answerChosen = curGameContent.answers[para.answerIndex];
					}
					resolveScore(answerChosen);
					if (curGameContent.type === "setup") {
						gameObject.gameScore[answerChosen.trig] = answerChosen.answer;							
					}
					if (curGameContent.type != "setup" && curGameContent.type != "newEra" && !DEBUG) { 
						updateGraph(); 
					}
					displayReply(curGameContent,answerChosen);
					resetAnimation(headerDiv,mainDiv,answerDiv);	
			
				});
				aDisplay.appendChild(para);	
			})(i)
			
			answerDiv.classList.add("fadeInAnimation");
			//answerDiv.style.animationDelay = "1.5s";
		}
		
	} else {
		var para = createPElement("Continue...",0,0);
		
		para.addEventListener("click", function() {						
			resolveScore(curGameContent);
			requestAnimationFrame(frame);
			displayContentComplete = false;
			if (curGameContent.type != "setup" && curGameContent.hook != '"Welcome to Palestine!"' && !DEBUG) {
				updateGraph();
			}
			resetAnimation(headerDiv,mainDiv,answerDiv);
			
		})
		aDisplay.appendChild(para);
		answerDiv.classList.add("fadeInAnimation");
		//answerDiv.style.animationDelay = "1.5s";
	}
		
	displayContentComplete = true;			
}

function kibbutzVotesAgainst() {
	if (gameObject.gameScore.sol < 50) {
		if (Math.random() < COUNTER_VOTE_CHANCE) {
			return true;
		}
	}
	return false;
}

function findNewAnswer(answers, indexChosen) {
	for (var i = 0; i < answers.length; i++) {
		if (i != indexChosen && answers[i].answerIdeology === gameObject.gameScore.ideology) {
			var reply = answers[i].reply;
			answers[i].reply = "Unfortunately, the kibbutz voted against you. The kibbutz chose:\n\n" + answers[i].answer;
			return answers[i];
		}
	}
	var newIndex = parseInt(Math.random() * answers.length);
	while (newIndex === indexChosen) {
		newIndex = parseInt(Math.random() * answers.length);
	}
	var reply = answers[newIndex].reply;
	answers[newIndex].reply = "Unfortunately, the kibbutz voted against you. The kibbutz chose:\n\n" + answers[newIndex].answer;
	return answers[newIndex];
}

function displayReply(gc, ans) {
	if (!gameOver) {
		resetCanvas();
	
		var replyContent = gc;
		var answer = ans;
			
		var headerDiv = document.querySelector("#headerContent");
		var mainDiv = document.querySelector("#mainContent");
		var answerDiv = document.querySelector("#answerContent");

		var e, h, t, a;
		
		h = document.createTextNode(replyContent.hook);
		hDisplay.appendChild(h);
		headerDiv.classList.add("fadeInAnimation");
		
		if (answer.reply != "") {
			t = document.createTextNode(answer.reply);
			tDisplay.appendChild(t);
			mainDiv.classList.add("fadeInAnimation");
		}
		
		var para = createPElement("Continue...",0,0);
			
		para.addEventListener("click", function() {						
			requestAnimationFrame(frame);
			displayContentComplete = false;
			
			resetAnimation(headerDiv,mainDiv,answerDiv);
			
		})
		
		aDisplay.appendChild(para);
		answerDiv.classList.add("fadeInAnimation");
		//answerDiv.style.animationDelay = "1.5s";
	}
}


function resetAnimation() {

	for (var i=0; i<arguments.length; i++) {
		arguments[i].classList.remove("fadeInAnimation");
		arguments[i].offsetWidth = arguments[i].offsetWidth;
		arguments[i].classList.add("fadeInAnimation");
	}
}

function resolveScore(answerObj) {

	var indicies = ["pop", "econ", "rep", "sol"];
	
	for (var i=0; i<indicies.length; i++) {
		//Could be impoved with better json structure
		if (answerObj[indicies[i]] % 1 != 0) {
			gameObject.gameScore[indicies[i]] = parseInt(gameObject.gameScore[indicies[i]] * answerObj[indicies[i]]);
		} else {
			gameObject.gameScore[indicies[i]] += answerObj[indicies[i]];
		}
		
		if (indicies[i] === "rep" || indicies[i] === "sol") {
			if (gameObject.gameScore[indicies[i]] > 100) { gameObject.gameScore[indicies[i]] = 100; }
			if (gameObject.gameScore[indicies[i]] < 0) { gameObject.gameScore[indicies[i]] = 0; }					
		}
	}	
	
	if (gameObject.gameScore.ideology && gameObject.gameScore.ideology === answerObj.answerIdeology) {
		if (answerObj.answerBonusValue % 1 != 0) {
			gameObject.gameScore[answerObj.answerBonusVariable] = parseInt(gameObject.gameScore[answerObj.answerBonusVariable] * answerObj.answerBonusValue);
		} else {
			gameObject.gameScore[answerObj.answerBonusVariable] += answerObj.answerBonusValue;
		}
	}
	
	if (!DEBUG) {
		checkScore();
	}
}

function checkScore() {

	if (gameObject.gameScore.pop <= 0) {
		displayGameOver("pop");	
	} else if (gameObject.gameScore.sol <= 0) {
		displayGameOver("sol");
	} else if (gameObject.gameScore.econ <= -20) {
		displayGameOver("econ");
	}

}

function displayGameOver(str) {
	
	gameOver = true;
	resetCanvas();
	var gameOverText;
	
	if (str === "pop") {
		gameOverText = "The last member leaves the kibbutz. Your settlement becomes a ghost town.";
	} else if (str === "sol") {
		gameOverText = "Unfortunately, all your fellow kibbutzniks lose faith in each other and your greater mission. They abandon the kibbutz and go their own ways.";
	} else if (str === "econ") {
		gameOverText = "Your kibbutz is bankrupt. The bank liquidates your assets and all your members must leave.";
	} else {
		var variableText = resolveGameOverText();
		gameOverText = "Your kibbutz persisted through many hardships to contemporary times. You created a " + variableText.popText + ", " + variableText.econText + ", " + variableText.repText + " community of " + variableText.solText + " members.\n\nWas the 'experiment' a success? Only you can judge...";
	}
	
	
	var h = document.createTextNode("Game Over");
	var t = document.createTextNode(gameOverText);					
	hDisplay.appendChild(h);
	tDisplay.appendChild(t)
	
	var para = createPElement("Click to replay...",0,0);
	
	para.addEventListener("click", function() {
		displayContentComplete = false;
		gameOver = false;
		loadScript("data/SoPQuestionData.json", gameSetup);				
	});
	aDisplay.appendChild(para);	

	displayContentComplete = true;
}

function resolveGameOverText() {
	
	var popText, econText, repText, solText;
	
	var popBounds = [150, 100, 50, 20];
	var econBounds = [150, 100, 75, 50, 25, 5];
	var repBounds = [100, 75, 50, 25, 5];
	var solBounds = [75, 60, 40, 25, 10];
	
	var variableIndicies = [{"name":"pop","bounds":popBounds}, {"name":"econ","bounds":econBounds}, {"name":"rep","bounds":repBounds}, {"name":"sol","bounds":solBounds}];
	
	for (var i=0; i < variableIndicies.length; i++) {
		
		if (variableIndicies[i].bounds[0] && gameObject.gameScore[variableIndicies[i].name] >= variableIndicies[i].bounds[0]) {
			switch (variableIndicies[i].name) {
				case "pop":
					popText = "enormous";
					break;
				case "econ":
					econText = "extravangantly rich";
					break;
				case "rep":
					repText = "internationally renowned";
					break;
				case "sol":
					solText = "delighted and united";
					break;
			}			
		} else if (variableIndicies[i].bounds[1] && gameObject.gameScore[variableIndicies[i].name] < variableIndicies[i].bounds[0] && gameObject.gameScore[variableIndicies[i].name] >= variableIndicies[i].bounds[1]) {
			switch (variableIndicies[i].name) {
				case "pop":
					popText = "large";
					break;
				case "econ":
					econText = "well-off";
					break;
				case "rep":
					repText = "nationally famous";
					break;
				case "sol":
					solText = "happy and cooperative";
					break;
			}				
		} else if (variableIndicies[i].bounds[2] && gameObject.gameScore[variableIndicies[i].name] < variableIndicies[i].bounds[1] && gameObject.gameScore[variableIndicies[i].name] >= variableIndicies[i].bounds[2]) {
			switch (variableIndicies[i].name) {
				case "pop":
					popText = "medium-sized";
					break;
				case "econ":
					econText = "well-off";
					break;
				case "rep":
					repText = "well-regarded";
					break;
				case "sol":
					solText = "mostly satisfied";
					break;
			}				
		} else if (variableIndicies[i].bounds[3] && gameObject.gameScore[variableIndicies[i].name] < variableIndicies[i].bounds[2] && gameObject.gameScore[variableIndicies[i].name] >= variableIndicies[i].bounds[3]) {
			switch (variableIndicies[i].name) {
				case "pop":
					popText = "small";
					break;
				case "econ":
					econText = "economically stable";
					break;
				case "rep":
					repText = "occasionally talked about";
					break;
				case "sol":
					solText = "occasionally grumpy";
					break;
			}				
		} else if (variableIndicies[i].bounds[4] && gameObject.gameScore[variableIndicies[i].name] < variableIndicies[i].bounds[3] && gameObject.gameScore[variableIndicies[i].name] >= variableIndicies[i].bounds[4]) {
			switch (variableIndicies[i].name) {
				case "pop":
					popText = "";
					break;
				case "econ":
					econText = "financially struggling";
					break;
				case "rep":
					repText = "relatively unknown";
					break;
				case "sol":
					solText = "quarrelsome";
					break;
			}				
		} else if (variableIndicies[i].bounds[5] && gameObject.gameScore[variableIndicies[i].name] < variableIndicies[i].bounds[4] && gameObject.gameScore[variableIndicies[i].name] >= variableIndicies[i].bounds[5]) {
			switch (variableIndicies[i].name) {
				case "pop":
					popText = "";
					break;
				case "econ":
					econText = "poor";
					break;
				case "rep":
					repText = "";
					break;
				case "sol":
					solText = "";
					break;
			}				
		} else if (variableIndicies[i].bounds[variableIndicies[i].bounds.length-1] && gameObject.gameScore[variableIndicies[i].name] < variableIndicies[i].bounds[variableIndicies[i].bounds.length-1]) {
			switch (variableIndicies[i].name) {
				case "pop":
					popText = "tiny";
					break;
				case "econ":
					econText = "deeply indebted";
					break;
				case "rep":
					repText = "infamous";
					break;
				case "sol":
					solText = "deeply divided and depressed";
					break;
			}	
		} else {
			switch (variableIndicies[i].name) {
				case "pop":
					popText = "";
					break;
				case "econ":
					econText = "";
					break;
				case "rep":
					repText = "";
					break;
				case "sol":
					solText = "";
					break;
			}	
		}		
	}
	
	return {"popText":popText,"econText":econText,"repText":repText,"solText":solText};
}


function resetCanvas() {
	var qDisplay = document.querySelectorAll(".question-canvas");
	for (i = 0; i < qDisplay.length; i++) {
		qDisplay[i].textContent = "";
		//qDisplay[i].style.opacity = 0;
	}	
	if (graph) {graph.render();	}
}

function getIndex(data, type) {
	
	for (var i=0; i<data.length; i++) {
		if (data[i].type === type) {
			return i;					
		}												
	}
	return -1;
}

function createPElement(s, mt, mb) {

	var para = document.createElement("p");
	var a = document.createTextNode(s);
	
	para.appendChild(a);
	para.style.cursor = "pointer";
	//para.style.pointerEvents = "none";
	
	if (mt != undefined) { para.style.marginTop = mt; } 
	if (mb != undefined) { para.style.marginBottom = mb; }

	return para;
}


loadScript("data/SoPQuestionData.json", gameSetup);	