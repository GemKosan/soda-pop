import lyrics from "./lyrics.js";
import * as State from "./state.js";

const bubblePadding = 15;
const bubbleDelayMs = 400;
const floatPxPerSec = 100;
const maxBubbleScore = 10;
const bubbleDamage = 10;

class Modal {
	constructor(element) {
		this.element = element;
		this.title = this.element.querySelector(".title");
		this.restartButton = this.element.querySelector(".restart-btn");
		this.restartButton.addEventListener("click", () => setState(State.PLAYING));
		this.playAgainButton = this.element.querySelector(".play-again-btn");
		this.restartButton.addEventListener("click", () => setState(State.PLAYING));
		this.nextLevelButton = this.element.querySelector(".next-level-btn");
		this.quitButton = this.element.querySelector(".quit-btn");
	}

	setState(state) {
		switch (state) {
			case State.PLAYING:
				this.title.innerText = "Playing";
				this.element.classList.add("hidden");
				break;
			case State.PAUSED:
				this.title.innerText = "Paused";
				this.restartButton.classList.remove("hidden");
				this.playAgainButton.classList.add("hidden");
				this.nextLevelButton.classList.add("hidden");
				this.quitButton.classList.remove("hidden");
				this.element.classList.remove("hidden");
				break;
			case State.LEVEL_COMPLETE:
				this.title.innerText = "Level Complete!";
				this.restartButton.classList.add("hidden");
				this.playAgainButton.classList.add("hidden");
				this.nextLevelButton.classList.remove("hidden");
				this.quitButton.classList.add("hidden");
				this.element.classList.remove("hidden");
				break;
			case State.GAME_OVER:
				this.title.innerText = "Game Over";
				this.restartButton.classList.add("hidden");
				this.playAgainButton.classList.remove("hidden");
				this.nextLevelButton.classList.add("hidden");
				this.quitButton.classList.remove("hidden");
				this.element.classList.remove("hidden");
				break;
			case State.DEMO:
				this.title.innerText = "Demo";
				this.element.classList.add("hidden");
				break;
			default:
				console.log(`Error: invalid state ${newState} `);
		}
	}
}

class Bubbler {
	constructor(text) {
		this.currentWord = 0;
		this.words = this.stripPunctuation(lyrics).split(/\s/);
	}

	clear() {
		clearInterval(this.timer);
	}

	pause() {
		this.clear();
	}

	start(delay) {
		this.clear();
		this.timer = setInterval(() => {
			while (!this.words[this.currentWord] && this.currentWord < this.words.length) {
				this.currentWord++;
			}
			if (this.words[this.currentWord]) {
				this.renderBubble(this.words[this.currentWord], playableArea);
				this.currentWord++;
				if (this.currentWord >= this.words.length) {
					this.clear();
					setState(State.LEVEL_COMPLETE);
				}
			}
		}, delay);
	}

	stripPunctuation(text) {
		var punctuation = /[^a-zA-Z'\-\s+]/g;
		return text.replace(punctuation, "");
	}

	renderBubble(text, container) {
		let bubble = document.createElement("div");
		let textSpan = document.createElement("span");
		textSpan.className = "bubble-text";
		textSpan.innerText = text;
		bubble.className = "bubble";
		bubble.setAttribute("style", `top: ${bubbleStartY}px;`);
		bubble.append(textSpan);
		container.append(bubble);

		const bubbleDiameter = textSpan.clientWidth + bubblePadding;
		const containerWidth = container.clientWidth;
		const maxX = containerWidth - bubbleDiameter;
		const randomX = Math.random() * maxX;
		const bubbleAnimationStyles = `
			animation-name: rise;
			animation-duration: ${floatTransitionSecs}s;
			animation-timing-function: linear;
			width: ${bubbleDiameter}px;
			height: ${bubbleDiameter}px; 
			left: ${randomX}px;`;

		bubble.setAttribute("style", bubbleAnimationStyles);

		bubble.addEventListener("animationend", removeBubble);
		bubble.addEventListener("mousedown", scoreBubble);
	}
}

function renderHealth() {
	healthElement.setAttribute("style", `width: ${health}%;`);
}

function renderScore() {
	scoreElement.innerText = String(score).padStart(9, "0");
}

function scoreBubble({ currentTarget }) {
	let points = maxBubbleScore - currentTarget.innerText.length + 1;
	points = points > 0 ? points : 1;
	points *= floatPxPerSec;
	score += points;
	renderScore();
	console.log(`Popped "${currentTarget.innerText}": ${points} points`);
	currentTarget.remove();
}

function removeBubble({ currentTarget }) {
	currentTarget.remove();
	let newHealth = health - bubbleDamage;
	if (newHealth <= 0) {
		newHealth = 0;
		setState(State.GAME_OVER);
	}
	health = newHealth;
	renderHealth();
}

function setState(newState) {
	state = newState;
	console.log(`Game state: ${newState}`);
	modal.setState(newState);
	switch (newState) {
		case State.DEMO:
			break;
		case State.PLAYING:
			startButton.classList.add("hidden");
			playButton.classList.add("hidden");
			pauseButton.classList.remove("hidden");
			bubblePause.remove();
			bubbler.start(bubbleDelayMs);
			break;
		case State.PAUSED:
			playButton.classList.remove("hidden");
			pauseButton.classList.add("hidden");
			document.head.append(bubblePause);	
			bubbler.pause();
			break;
		case State.LEVEL_COMPLETE:
			document.head.append(bubblePause);
			bubbler.pause();
			break;
		case State.GAME_OVER:
			document.head.append(bubblePause);
			bubbler.pause();
			break;
		default:
			console.log(`Error: invalid state ${newState} `);
	}
}

function loadLevel(level) {
	bubbler = new Bubbler(lyrics);	
}



/********** Main **********/

let state;
let score = 0;
const startButton = document.getElementById("start-btn");
const playButton = document.getElementById("play-btn");
const pauseButton = document.getElementById("pause-btn");
const playableArea = document.getElementById("playable-area");
const healthElement = document.getElementById("health");
const scoreElement = document.getElementById("score");
const modalElement = document.getElementById("modal");
const playableHeight = playableArea.clientHeight;
const floatTransitionSecs = playableHeight / floatPxPerSec;
const bubbleStartY = playableHeight;
const modal = new Modal(modalElement);
const bubblePause = document.createElement("style");
let bubbler;
bubblePause.setAttribute("type", "text/css");
bubblePause.innerText = "#game {animation-play-state: paused;}";
startButton.addEventListener("click", () => setState(State.PLAYING));
playButton.addEventListener("click", () => setState(State.PLAYING));
pauseButton.addEventListener("click", () => setState(State.PAUSED));

let health = 100;
setState(State.DEMO);
loadLevel(1);