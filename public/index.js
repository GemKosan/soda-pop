import lyrics from "./lyrics.js";
import * as State from "./state.js";
import SoundBank, { Sound } from "./soundBank.js" ;

const bubblePadding = 15;
const bubbleDelayMs = 400;
const floatPxPerSec = 100;
const maxBubbleScore = 10;
const bubbleDamage = 10;

function setState(newState) {
	state = newState;
	console.log(`Game state: ${newState}`);
	switch (newState) {
		case State.DEMO:
			modal.hide();
			startButton.classList.remove("hidden");
			playButton.classList.add("hidden");
			pauseButton.classList.add("hidden");
			clickBlocker.classList.remove("hidden");
			break;
		case State.PLAYING:
			modal.hide();
			startButton.classList.add("hidden");
			playButton.classList.add("hidden");
			pauseButton.classList.remove("hidden");
			clickBlocker.classList.add("hidden");
			bubblePause.remove();
			bubbler.start(bubbleDelayMs);
			break;
		case State.PAUSED:
			modal.show("Paused", [ModalWindow.RESTART, ModalWindow.QUIT]);
			playButton.classList.remove("hidden");
			pauseButton.classList.add("hidden");
			clickBlocker.classList.remove("hidden");
			document.head.append(bubblePause);
			bubbler.stop();
			break;
		case State.LEVEL_COMPLETE:
			modal.show("Level Complete!", [ModalWindow.NEXT_LEVEL]);
			sounds.play(Sound.COMPLETE);
			clickBlocker.classList.remove("hidden");
			document.head.append(bubblePause);
			bubbler.stop();
			break;
		case State.LEVEL_UP:
			level++;
			break;
		case State.GAME_OVER:
			clickBlocker.classList.remove("hidden");
			modal.show("Game Over", [ModalWindow.PLAY_AGAIN, ModalWindow.QUIT]);
			document.head.append(bubblePause);
			bubbler.stop();
			break;
		case State.RESTART:
			restartGame();
			break;
		default:
			console.log(`Error: invalid state ${newState} `);
	}
}

class ModalWindow {
	static RESTART = "restartButton";
	static PLAY_AGAIN = "playAgainButton";
	static NEXT_LEVEL = "nextLevelButton";
	static QUIT = "quitButton";

	constructor(element) {
		this.modalwindow = element;
		this.title = this.modalwindow.querySelector(".title");
		this.restartButton = this.modalwindow.querySelector(".restart-btn");
		this.playAgainButton = this.modalwindow.querySelector(".play-again-btn");
		this.nextLevelButton = this.modalwindow.querySelector(".next-level-btn");
		this.quitButton = this.modalwindow.querySelector(".quit-btn");

		this.restartButton.addEventListener("click", () =>
			setState(State.RESTART)
		);
		this.playAgainButton.addEventListener("click", () =>
			setState(State.RESTART)
		);
		this.nextLevelButton.addEventListener("click", () =>
			setState(State.LEVEL_UP)
		);
		this.quitButton.addEventListener("click", () => setState(State.DEMO));
	}

	show(title, buttons) {
		this.title.innerText = title;
		this.restartButton.classList.add("hidden");
		this.playAgainButton.classList.add("hidden");
		this.nextLevelButton.classList.add("hidden");
		this.quitButton.classList.add("hidden");

		for (const button of buttons) {
			this[button].classList.remove("hidden");
		}
		this.modalwindow.classList.remove("hidden");
	}

	hide() {
		this.modalwindow.classList.add("hidden");
	}
}

class Bubbler {
	constructor(container, text) {
		this.container = container;
		this.currentWord = 0;
		this.words = this.stripPunctuation(text).split(/\s/);
		this.bubbles = [];
	}

	stop() {
		clearInterval(this.timer);
	}

	start(delay) {
		this.stop();
		this.timer = setInterval(() => {
			while (
				!this.words[this.currentWord] &&
				this.currentWord < this.words.length
			) {
				this.currentWord++;
			}
			if (this.words[this.currentWord]) {
				this.renderBubble(this.words[this.currentWord]);
				this.currentWord++;
				if (this.currentWord >= this.words.length) {
					this.stop();
					setState(State.LEVEL_COMPLETE);
				}
			}
		}, delay);
	}

	stripPunctuation(text) {
		var punctuation = /[^a-zA-Z'\-\s+]/g;
		return text.replace(punctuation, "");
	}

	clear() {
		for (const bubble of this.bubbles) {
			bubble.remove();
		}
		this.bubbles = [];
	}

	scoreBubble({ currentTarget }) {
		let points = maxBubbleScore - currentTarget.innerText.length + 1;
		points = points > 0 ? points : 1;
		points *= floatPxPerSec;
		console.log(`Popped "${currentTarget.innerText}": ${points} points`);
		setScore(score + points);
		sounds.play(Sound.POP);
		
		currentTarget.addEventListener("transitionend", currentTarget.remove);
		currentTarget.classList.add("paused", "popped");
	}
	
	removeBubble({ currentTarget }) {
		let newHealth = health - bubbleDamage;
		if (newHealth <= 0) {
			newHealth = 0;
			setState(State.GAME_OVER);
		}
		setHealth(newHealth);
		sounds.play(Sound.MISS);
		currentTarget.addEventListener("transitionend", currentTarget.remove);
		currentTarget.classList.add("paused", "popped");
	}

	renderBubble(text) {
		let bubble = document.createElement("div");
		let textSpan = document.createElement("span");
		textSpan.className = "bubble-text";
		textSpan.innerText = text;
		bubble.className = "bubble";
		bubble.setAttribute("style", `top: ${bubbleStartY}px;`);
		bubble.append(textSpan);
		this.container.append(bubble);
		this.bubbles.push(bubble);

		const bubbleDiameter = textSpan.clientWidth + bubblePadding;
		const containerWidth = this.container.clientWidth;
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

		bubble.addEventListener("animationend", this.removeBubble);
		bubble.addEventListener("mousedown", this.scoreBubble);
	}
}

function setHealth(newHealth) {
	health = newHealth;
	healthElement.setAttribute("style", `width: ${newHealth}%;`);
}

function setScore(newScore) {
	score = newScore;
	scoreElement.innerText = String(newScore).padStart(9, "0");
}

function loadLevel() {
	if (bubbler) {
		bubbler.stop();
		bubbler.clear();
	}
	bubbler = new Bubbler(playableArea, lyrics);
}

function restartGame() {
	setScore(0);
	setHealth(100);
	loadLevel(1);
	setState(State.PLAYING);
}

function startGame() {
	setScore(0);
	setHealth(100);
	loadLevel(1);
	setState(State.DEMO);
}



/********** Main **********/

const Timidity = require('timidity')

const player = new Timidity()
player.load('resources/Never-Gonna-Give-You-Up-3.midi')
player.play()

let score;
let health;
let state;
let bubbler;
const startButton = document.getElementById("start-btn");
const playButton = document.getElementById("play-btn");
const pauseButton = document.getElementById("pause-btn");
const playableArea = document.getElementById("playable-area");
const healthElement = document.getElementById("health");
const scoreElement = document.getElementById("score");
const modalElement = document.getElementById("modal");
const clickBlocker = playableArea.querySelector(".click-blocker");
const playableHeight = playableArea.clientHeight;
const floatTransitionSecs = playableHeight / floatPxPerSec;
const bubbleStartY = playableHeight;
const modal = new ModalWindow(modalElement);
const sounds = new SoundBank;
const bubblePause = document.createElement("style");

bubblePause.setAttribute("type", "text/css");
bubblePause.innerText = "#game {animation-play-state: paused;}";

const allButtons = document.querySelectorAll("button");
for (let button of allButtons) {
	button.addEventListener("click", () => sounds.play(Sound.CLICK));
}

startButton.addEventListener("click", () => setState(State.PLAYING));
playButton.addEventListener("click", () => setState(State.PLAYING));
pauseButton.addEventListener("click", () => setState(State.PAUSED));

setScore(0);
setHealth(100);
startGame();
