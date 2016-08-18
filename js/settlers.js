var QUESTIONS_PER_ERA = 2;
var QUESTIONS_PER_GAME = 20;
var COUNTER_VOTE_CHANCE = 0.99;
var graph;

var gameObject = {};

var hDisplay = document.querySelector("#hook-text");
var eDisplay = document.querySelector("#era-title");			
var tDisplay = document.querySelector("#text-canvas");
var aDisplay = document.querySelector("#answer-canvas");

var displayContentComplete = false;
var gameOver = false;


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
	if (!displayContentComplete) {
		resetCanvas();

		if (gameObject.gameContent.length > 0) {					
			displayContent();
			requestAnimationFrame(frame);
			
		} else {
			displayGameOver();
		}
	} else if (gameOver) {
		displayGameOver();
	}
				
}

function generateGameContent(json) {

	var arr = [];
			
	for (var i=0; i<json.length; i++) {
		
		arr.push(json[i].newEra);
		var	questionArray = json[i].questions;	
		
		if (json[i].type === "setup") {
			arr.push(questionArray[0]);
			arr.push(questionArray[1]);
		} else {						
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

function displayContent() {
	var headerDiv = document.querySelector("#headerContent");
	var mainDiv = document.querySelector("#mainContent");
	var answerDiv = document.querySelector("#answerContent");
	
	var e, h, t, a;
	
	var curGameContent = gameObject.gameContent.shift();

	
	//Hook text			
	if (curGameContent.type === "newEra") { 
		if (curGameContent.hook != '"Welcome to Palestine!"') { //temporary hack solution
			updateGraph();
		}
		t = document.createTextNode(curGameContent.hook);
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
		var divLength = 50;
		
		for(var i=0; i<curGameContent.answers.length; i++) {
			
			(function(i) {
				var para = createPElement(curGameContent.answers[i].answer, 0, "0.4em");
				para.answerIndex = i;									
				para.addEventListener("click", function() {
					var answerChosen;
					if (kibbutzVotesAgainst()) {
						answerChosen = findNewAnswer(curGameContent.answers, para.answerIndex);
					} else {
						answerChosen = curGameContent.answers[para.answerIndex];
					}
					resolveScore(answerChosen);
					if (curGameContent.type === "setup") {
						gameObject.gameScore[answerChosen.trig] = answerChosen.answer;							
					}
					if (curGameContent.type != "setup" && curGameContent.type != "newEra") { 
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
			
			resetAnimation(headerDiv,mainDiv,answerDiv);
			
		})
		aDisplay.appendChild(para);
		answerDiv.classList.add("fadeInAnimation");
		//answerDiv.style.animationDelay = "1.5s";
	}
		
	displayContentComplete = true;			
}

function kibbutzVotesAgainst() {
	if (gameObject.gameScore.sol <= 50) {
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
		newIndex = int(Math.random() * answers.length);
	}
	var reply = answers[newIndex].reply;
	answers[newIndex].reply = "Unfortunately, the kibbutz voted against you. The kibbutz chose:\n\n" + answers[newIndex].answer;
	return answers[newIndex];
}

function displayReply(gc, ans) {
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
			gameObject.gameScore[indicies[i]] *= parseInt(answerObj[indicies[i]]);
		} else {
			gameObject.gameScore[indicies[i]] += parseInt(answerObj[indicies[i]]);
		}

		if (gameObject.gameScore.ideology && gameObject.gameScore.ideology === answerObj.answerIdeology) {
			if (answerObj.answerBonusValue % 1 != 0) {
				gameObject.gameScore[answerObj.answerBonusVariable] *= parseInt(answerObj.answerBonusValue);
			} else {
				gameObject.gameScore[answerObj.answerBonusVariable] += parseInt(answerObj.answerBonusValue);
			}
		} 
		
		if (indicies[i] === "rep" || indicies[i] === "sol") {
			if (gameObject.gameScore[indicies[i]] > 100) { gameObject.gameScore[indicies[i]] = 100; }
			if (gameObject.gameScore[indicies[i]] < 0) { gameObject.gameScore[indicies[i]] = 0; }					
		}
	}	
	checkScore();
}

function checkScore() {

	if (gameObject.gameScore.pop <= 0 || gameObject.gameScore.sol <= 0) {
		
		gameOver = true;
	
	}

}

function displayGameOver() {
	
	resetCanvas();
	
	var h = document.createTextNode("Game Over");
	var t = document.createTextNode("Your kibbutz has managed to persist through many hardships to contemporary times. Was the 'experiment' a success? Only you can judge...");					
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
	para.style.cursor = "default";
	//para.style.pointerEvents = "none";
	
	if (mt != undefined) { para.style.marginTop = mt; } 
	if (mb != undefined) { para.style.marginBottom = mb; }

	return para;
}


loadScript("data/SoPQuestionData.json", gameSetup);	