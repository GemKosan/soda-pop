import lyrics from "./lyrics.js";
import * as State from "./state.js";
import SoundBank, { Sound } from "./soundBank.js";

let currentLevel = 0;
const levels = ["Cola", "Lemon Lime", "Grape Soda"];

const baseBubbleDelayMs = 1000;
const bubbleDelayStep = 200;
const baseBubbleSpeed = 150;
const bubbleSpeedStep = 50;
const baseBubbleDamage = 10;
const baseBubbleScore = 10;
const levelStartDelay = 1500;
const bubblePadding = 5;

function randomLevel() {
	const level = Math.floor(Math.random() * levels.length);
	return level;
}

function indexCurrentLevel() {
	return currentLevel % levels.length;
}

function getBubbleDelay() {
	return baseBubbleDelayMs - currentLevel * bubbleDelayStep;
}

function getBubbleSpeed() {
	return baseBubbleSpeed + currentLevel * bubbleSpeedStep;
}

function getBubbleDamage() {
	return baseBubbleDamage;
}

function getBubblePoints() {
	return baseBubbleScore * (currentLevel + 1);
}

function getLevelWords(level) {
	return lyrics[level];
}

function setState(newState) {
	console.log(newState);
	state = newState;
	switch (newState) {
		case State.DEMO:
			modal.show("Press Start", [], true);
			controls.show(GameControls.START_BUTTON);
			playableArea.classList.remove("paused");
			loadLevel(randomLevel());
			bubbler.start(getBubbleDelay());
			break;
		case State.PLAYING:
			modal.hide();
			controls.show(GameControls.PAUSE_BUTTON);
			playableArea.classList.remove("paused");
			scoreElement.classList.remove("blink");
			bubbler.start(getBubbleDelay());
			break;
		case State.PAUSED:
			modal.show("Paused", [ModalWindow.RESTART, ModalWindow.QUIT]);
			controls.show(GameControls.PLAY_BUTTON);
			playableArea.classList.add("paused");
			bubbler.stop();
			break;
		case State.LEVEL_COMPLETE:
			modal.show("Level Complete!", [ModalWindow.NEXT_LEVEL]);
			sounds.play(Sound.COMPLETE);
			controls.hide();
			playableArea.classList.add("paused");
			bubbler.stop();
			break;
		case State.LEVEL_UP:
			currentLevel++;
			setHealth(100);
			loadLevel(indexCurrentLevel());
			setState(State.PLAYING);
			break;
		case State.GAME_OVER:
			modal.show("Game Over", [ModalWindow.PLAY_AGAIN, ModalWindow.QUIT]);
			controls.hide();
			playableArea.classList.add("paused");
			bubbler.stop();
			break;
		case State.RESTART:
			setScore(0);
			setHealth(100);
			loadLevel(indexCurrentLevel());
			setState(State.PLAYING);
			break;
		default:
			console.log(`Error: invalid state ${newState} `);
	}
}

class GameControls {
	static START_BUTTON = "startButton";
	static PLAY_BUTTON = "playButton";
	static PAUSE_BUTTON = "pauseButton";

	constructor() {
		this.startButton = document.getElementById("start-btn");
		this.playButton = document.getElementById("play-btn");
		this.pauseButton = document.getElementById("pause-btn");
		this.startButton.addEventListener("click", () => setState(State.RESTART));
		this.playButton.addEventListener("click", () => setState(State.PLAYING));
		this.pauseButton.addEventListener("click", () => setState(State.PAUSED));
	}

	show(button) {
		this.hide();
		this[button].classList.remove("hidden");
	}

	hide() {
		this.startButton.classList.add("hidden");
		this.playButton.classList.add("hidden");
		this.pauseButton.classList.add("hidden");
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

	show(title, buttons, blink) {
		this.title.innerText = title;
		this.restartButton.classList.add("hidden");
		this.playAgainButton.classList.add("hidden");
		this.nextLevelButton.classList.add("hidden");
		this.quitButton.classList.add("hidden");

		for (const button of buttons) {
			this[button].classList.remove("hidden");
		}

		if (blink) {
			this.title.classList.add("blink");
		} else {
			this.title.classList.remove("blink");
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
		this.floatAnimationSecs = playableHeight / getBubbleSpeed();
		this.words = this.splitText(text);
		this.clear();
	}

	stop() {
		clearInterval(this.startDelay);
		clearInterval(this.timer);
	}

	start(delay) {
		this.stop();
		this.startDelay = setTimeout(() => {
			this.stop();
			this.render();
			this.timer = setInterval(() => {
				this.render();
			}, delay);
		}, levelStartDelay);
	}

	splitText(text) {
		const punctuation = /[^a-zA-Z'\-\s+]/g;
		const words = [];
		for (let word of text.replace(punctuation, "").split(/\s/)) {
			if(word) {
				words.push(word);
			}
		}
		return words;
	}

	clear() {
		while (this.container.firstChild) {
			this.container.removeChild(this.container.firstChild);
		}
	}

	removeBubble(target) {
		target.remove();
		if (this.container.childElementCount === 0 && this.words.length === 0) {
			this.stop();
			if (state === State.DEMO) {
				setState(State.DEMO);
				return;
			}
			if (health > 0) {
				setState(State.LEVEL_COMPLETE);
			}
		}
	}

	poppingAnimation(target) {
		target.classList.add("paused", "popped");
		target.addEventListener("transitionend", () => this.removeBubble(target));
	}

	bubbleScored = (e) => {
		e.preventDefault();
		let currentTarget = e.currentTarget;
		if (state === State.PLAYING) {
			sounds.play(Sound.POP);
			this.poppingAnimation(currentTarget);
			let points = getBubblePoints() - currentTarget.innerText.length + 1;
			points = points > 0 ? points : 1;
			points *= getBubbleSpeed();
			setScore(score + points);
		} else if (state === State.DEMO) {
			sounds.play(Sound.POP);
			this.poppingAnimation(currentTarget);
		}
	};

	bubbleEscaped = ({ currentTarget }) => {
		this.poppingAnimation(currentTarget);
		if (state === State.PLAYING) {
			sounds.play(Sound.POP);
			let newHealth = health - getBubbleDamage();
			newHealth = newHealth > 0 ? newHealth : 0;
			setHealth(newHealth);
			if (newHealth === 0) {
				setState(State.GAME_OVER);
			}
		}
	};

	render() {
		if (this.words.length) {
			this.renderBubble(this.words.shift());
		}
	}

	renderBubble(text) {
		let bubble = document.createElement("div");
		bubble.innerText = text;
		bubble.className = "bubble";
		this.container.append(bubble);
		const bubbleDiameter = bubble.clientWidth;
		const containerWidth = this.container.clientWidth;
		const maxX = containerWidth - bubbleDiameter - (2 * bubblePadding);
		const randomX = Math.random() * maxX;
		const bubbleAnimationStyles = `
			animation-name: rise;
			animation-duration: ${this.floatAnimationSecs}s;
			animation-timing-function: linear;
			width: ${bubbleDiameter}px;
			height: ${bubbleDiameter}px; 
			left: ${randomX}px;`;

		bubble.setAttribute("style", bubbleAnimationStyles);
		bubble.addEventListener("animationend", this.bubbleEscaped);
		bubble.addEventListener("mousedown", this.bubbleScored);
		bubble.addEventListener("touchstart", this.bubbleScored);
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

function loadLevel(level) {
	console.log(
		`Level ${level} bubble Settings: [delay: ${getBubbleDelay()}, speed: ${getBubbleSpeed()}, damage: ${getBubbleDamage()}, points: ${getBubblePoints()}]`
	);
	levelNameElement.innerText = levels[level];
	if (bubbler) {
		bubbler.stop();
		bubbler.clear();
	}
	bubbler = new Bubbler(playableArea, getLevelWords(level));
}

/********** Main **********/

let score;
let health;
let state;
let bubbler;
const playableArea = document.getElementById("playable-area");
const healthElement = document.getElementById("health");
const scoreElement = document.getElementById("score");
const modalElement = document.getElementById("modal");
const levelNameElement = document.getElementById("level-name");
const allButtons = document.querySelectorAll("button");
const playableHeight = playableArea.clientHeight;
const controls = new GameControls();
const modal = new ModalWindow(modalElement);
const sounds = new SoundBank();
for (let button of allButtons) {
	button.addEventListener("click", () => sounds.play(Sound.CLICK));
}
// disable iOS zoom on double tap
playableArea.addEventListener("click", event => {});

setState(State.DEMO);
