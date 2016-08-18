
var graph;

var gameObject = function() {
	
	this.QUESTIONS_PER_ERA = 2,
	this.QUESTIONS_PER_GAME = 20,

	this.hDisplay = document.querySelector("#hook-text"),
	this.eDisplay = document.querySelector("#era-title"),			
	this.tDisplay = document.querySelector("#text-canvas"),
	this.aDisplay = document.querySelector("#answer-canvas"),

	this.displayContentComplete = false,
	this.gameOver = false;

};

gameObject.prototype = {
	
	initialize: function() {
		this.gameContent = this.generateGameContent(SoPQuestionData);	
		this.gameScore = {"pop": 0, "econ": 0, "rep": 0, "sol": 0};
		this.contentCount = 0;
	},
	
	loadScript: function(url, callback) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;

		script.onreadystatechange = callback;
		script.onload = callback;
		
		head.appendChild(script);
	},

	gameSetup: function() {	
				
		go.initialize();		
		go.startGame();
	},

	startGame: function() {
		
		drawGraph();
		
		if (!go.displayContentComplete && this.gameContent.length > 0) {
			window.requestAnimationFrame(this.draw);
		}

	},
	
    generateGameContent: function(json) {

		var arr = [];
				
		for (var i=0; i<json.length; i++) {
			
			arr.push(json[i].newEra);
			var	questionArray = json[i].questions;	
			
			if (json[i].type === "setup") {
				arr.push(questionArray[0]);
				arr.push(questionArray[1]);
			} else {						
				var bossQuestionIndex = this.getIndex(questionArray, "B");
								
				if (bossQuestionIndex > 0) {					
					var tempObj = questionArray.splice(bossQuestionIndex,1);
					arr.push(questionArray.splice(Math.floor(questionArray.length*Math.random()),1)[0]);
					arr.push(tempObj[0]);
				} else {
					for (var j=0; j<this.QUESTIONS_PER_ERA; j++) {
						arr.push(questionArray.splice(Math.floor(questionArray.length*Math.random()),1)[0]);
					}
				}				
			}
		}
		
		return arr;

	},
	
	 draw: function() {
	
		/*go.resetCanvas();
		go.displayContent();
		window.requestAnimationFrame(go.draw);*/
		
		if (!go.displayContentComplete) {
			go.resetCanvas();

			if (go.gameContent.length > 0) {					
				go.displayContent();
				go.displayContent();
				window.requestAnimationFrame(go.draw);
				
			} else {
				this.displayGameOver();
			}
		} else if (this.gameOver) {
			this.displayGameOver();
		}
		
	},
	
	displayContent: function() {
		var headerDiv = document.querySelector("#headerContent");
		var mainDiv = document.querySelector("#mainContent");
		var answerDiv = document.querySelector("#answerContent");
		
		var e, h, t, a;
		
		var curGameContent = this.gameContent.shift();
		
		//Hook text			
		if (curGameContent.type === "newEra") { 
			if (curGameContent.hook != '"Welcome to Palestine!"') { //temporary hack solution
				updateGraph(go);
			}
			t = document.createTextNode(curGameContent.hook);
			this.eDisplay.appendChild(t);
			headerDiv.classList.add("fadeInAnimation");				
		} else {
			h = document.createTextNode(curGameContent.hook);
			this.hDisplay.appendChild(h);
			headerDiv.classList.add("fadeInAnimation");
		}
		
		//Main text
		if (curGameContent.text != "") {
			t = document.createTextNode(curGameContent.text);
			this.tDisplay.appendChild(t);
			mainDiv.classList.add("fadeInAnimation");
		//	mainDiv.style.animationDelay = "1s";
		}
		
		if (curGameContent.answers) {
			var divLength = 50;
			
			for(var i=0; i<curGameContent.answers.length; i++) {
				
				(function(i) {
					var para = go.createPElement(curGameContent.answers[i].answer, 0, "0.4em");
					para.answerIndex = i;									
					para.addEventListener("click", function() {
						var answerChosen = curGameContent.answers[para.answerIndex];
						go.resolveScore(answerChosen);
						if (curGameContent.type === "setup") {
							go.gameScore[answerChosen.trig] = answerChosen.answer;
						}
						if (curGameContent.type != "setup" && curGameContent.type != "newEra") { updateGraph(go); }
						go.displayReply(curGameContent,para.answerIndex);
						go.resetAnimation(headerDiv,mainDiv,answerDiv);	
				
					});

					go.aDisplay.appendChild(para);						
				})(i)
				
				answerDiv.classList.add("fadeInAnimation");
				//answerDiv.style.animationDelay = "1.5s";
			}
			
		} else {
			var para = this.createPElement("Continue...",0,0);
			
			para.addEventListener("click", function() {						
				go.resolveScore(curGameContent);
				window.requestAnimationFrame(draw);
				go.displayContentComplete = false;
				
				this.resetAnimation(headerDiv,mainDiv,answerDiv);
				
			})
			this.aDisplay.appendChild(para);
			answerDiv.classList.add("fadeInAnimation");
			//answerDiv.style.animationDelay = "1.5s";
		}
			
		go.displayContentComplete = true;			
	},

	displayReply: function(gc, i) {
		this.resetCanvas();
		
		var replyContent = gc;
		var index = i;
			
		var headerDiv = document.querySelector("#headerContent");
		var mainDiv = document.querySelector("#mainContent");
		var answerDiv = document.querySelector("#answerContent");

		var e, h, t, a;
		
		h = document.createTextNode(replyContent.hook);
		this.hDisplay.appendChild(h);
		headerDiv.classList.add("fadeInAnimation");
		
		if (replyContent.answers[index].reply != "") {
			t = document.createTextNode(replyContent.answers[index].reply);
			this.tDisplay.appendChild(t);
			mainDiv.classList.add("fadeInAnimation");
		}
		
		var para = go.createPElement("Continue...",0,0);
			
		para.addEventListener("click", function() {						
			window.requestAnimationFrame(go.draw);
			go.displayContentComplete = false;
			
			go.resetAnimation(headerDiv,mainDiv,answerDiv);
			
		})
		
		this.aDisplay.appendChild(para);
		answerDiv.classList.add("fadeInAnimation");
		//answerDiv.style.animationDelay = "1.5s";
	},


	resetAnimation: function(...args) {

		for (var i=0; i<args.length; i++) {
			args[i].classList.remove("fadeInAnimation");
			args[i].offsetWidth = args[i].offsetWidth;
			args[i].classList.add("fadeInAnimation");
		}
	},

	resolveScore: function(answerObj) {

		var indicies = ["pop", "econ", "rep", "sol"];
		
		for (var i=0; i<indicies.length; i++) {
			//Could be impoved with better json structure
			if (answerObj[indicies[i]] % 1 != 0) {
				this.gameScore[indicies[i]] *= answerObj[indicies[i]];
			} else {
				this.gameScore[indicies[i]] += answerObj[indicies[i]];
			}

			if (this.gameScore.ideology && this.gameScore.ideology === answerObj.answerIdeology) {
				if (answerObj.answerBonusValue % 1 != 0) {
					this.gameScore[answerObj.answerBonusVariable] *= answerObj.answerBonusValue;
				} else {
					this.gameScore[answerObj.answerBonusVariable] += answerObj.answerBonusValue;
				}
			} 
			
			if (indicies[i] === "rep" || indicies[i] === "sol") {
				if (this.gameScore[indicies[i]] > 100) { this.gameScore[indicies[i]] = 100; }
				if (this.gameScore[indicies[i]] < 0) { this.gameScore[indicies[i]] = 0; }					
			}
		}	
		this.checkScore();
	},

	checkScore: function() {

		if (this.gameScore.pop <= 0 || this.gameScore.sol <= 0) {
			
			this.displayGameOver();
		
		}

	},

	displayGameOver: function() {
		
		this.resetCanvas();
		
		var h = document.createTextNode("Game Over");
		var t = document.createTextNode("Your kibbutz has managed to persist through many hardships to contemporary times. Was the 'experiment' a success? Only you can judge...");					
		this.hDisplay.appendChild(h);
		this.tDisplay.appendChild(t)
		
		var para = this.createPElement("Click to replay...",0,0);
		
		para.addEventListener("click", function() {
			go.displayContentComplete = false;
			this.loadScript("data/SoPQuestionData.json", gameSetup);				
		});
		this.aDisplay.appendChild(para);	

		go.displayContentComplete = true;
	},


	resetCanvas: function() {
		var qDisplay = document.querySelectorAll(".question-canvas");
		for (i = 0; i < qDisplay.length; i++) {
			qDisplay[i].textContent = "";
			//qDisplay[i].style.opacity = 0;
		}	
		if (graph) {graph.render();	}
	},

	getIndex: function(data, type) {
		
		for (var i=0; i<data.length; i++) {
			if (data[i].type === type) {
				return i;					
			}												
		}
		return -1;
	},

	createPElement: function(s, mt, mb) {

		var para = document.createElement("p");
		var a = document.createTextNode(s);
		
		para.appendChild(a);
		para.style.cursor = "default";
		//para.style.pointerEvents = "none";
		
		if (mt != undefined) { para.style.marginTop = mt; } 
		if (mb != undefined) { para.style.marginBottom = mb; }

		return para;
	}

};

/*$(window).on('resize', function(){
	graph.configure({
		width: window.innerWidth - 200,
		height: 250
	});
	graph.render();
});*/



var go = new gameObject();
go.loadScript("data/SoPQuestionData.json", go.gameSetup);	


