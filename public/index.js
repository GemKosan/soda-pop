import lyrics from "./lyrics.js";
import * as State from "./state.js";
import SoundBank, { Sound } from "./soundBank.js";

let currentLevel = 0;
const levels = ["Cola", "Lemon Lime", "Cherry Cola"];

const baseBubbleDelayMs = 600;
const bubbleDelayStep = 25;
const baseBubbleSpeed = 60;
const bubbleSpeedStep = 20;
const baseBubbleDamage = 10;
const baseBubbleScore = 10;
const bubbleStartDelay = 1000;

function randomLevel() {
	const level = Math.floor(Math.random() * levels.length);
	console.log(level);
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
	state = newState;
	console.log(`${newState}`);
	switch (newState) {
		case State.DEMO:
			modal.show("Press Start", [], true);
			startButton.classList.remove("hidden");
			playButton.classList.add("hidden");
			pauseButton.classList.add("hidden");
			playableArea.classList.remove("paused");
			loadLevel(randomLevel());
			bubbler.start(getBubbleDelay());
			break;
		case State.PLAYING:
			modal.hide();
			startButton.classList.add("hidden");
			playButton.classList.add("hidden");
			pauseButton.classList.remove("hidden");
			playableArea.classList.remove("paused");
			scoreElement.classList.remove("blink");
			bubbler.start(getBubbleDelay());
			break;
		case State.PAUSED:
			modal.show("Paused", [ModalWindow.RESTART, ModalWindow.QUIT]);
			playButton.classList.remove("hidden");
			pauseButton.classList.add("hidden");
			playableArea.classList.add("paused");
			bubbler.stop();
			break;
		case State.LEVEL_COMPLETE:
			modal.show("Level Complete!", [ModalWindow.NEXT_LEVEL]);
			sounds.play(Sound.COMPLETE);
			startButton.classList.add("hidden");
			playButton.classList.add("hidden");
			pauseButton.classList.add("hidden");
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
			startButton.classList.add("hidden");
			playButton.classList.add("hidden");
			pauseButton.classList.add("hidden");
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
		this.words = this.stripPunctuation(text).split(/\s/);
		this.clear();
	}

	stop() {
		clearInterval(this.timer);
	}

	start(delay) {
		this.stop();
		setTimeout(() => {
			this.timer = setInterval(() => {
				while (!this.words[0] && this.words.length) {
					this.words.shift();
				}
				if (this.words.length) {
					this.renderBubble(this.words.shift());
				}
			}, delay);
		}, bubbleStartDelay);
	}

	stripPunctuation(text) {
		var punctuation = /[^a-zA-Z'\-\s+]/g;
		return text.replace(punctuation, "");
	}

	clear() {
		while (this.container.firstChild) {
			this.container.removeChild(this.container.firstChild);
		}
	}

	removeBubble(target) {
		target.remove();
		if (
			this.container.childElementCount === 0 &&
			this.words.length === 0 &&
			health > 0
		) {
			this.stop();
			if (state === State.DEMO) {
				setState(State.DEMO);
				return;
			}
			setState(State.LEVEL_COMPLETE);
		}
	}

	poppingAnimation(target) {
		target.addEventListener("transitionend", () => this.removeBubble(target));
		target.classList.add("paused", "popped");
	}

	bubbleScored = ({ currentTarget }) => {
		if (state === State.PLAYING) {
			let points = getBubblePoints() - currentTarget.innerText.length + 1;
			points = points > 0 ? points : 1;
			points *= getBubbleSpeed();
			setScore(score + points);
			sounds.play(Sound.POP);
			this.poppingAnimation(currentTarget);
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
			if (newHealth <= 0) {
				newHealth = 0;
				setState(State.GAME_OVER);
			}
			setHealth(newHealth);
		}
	};

	renderBubble(text) {
		let bubble = document.createElement("div");
		bubble.innerText = text;
		bubble.className = "bubble";
		bubble.setAttribute("style", `top: ${bubbleStartY}px;`);
		this.container.append(bubble);
		const bubbleDiameter = bubble.clientWidth;
		const containerWidth = this.container.clientWidth;
		const maxX = containerWidth - bubbleDiameter;
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
const startButton = document.getElementById("start-btn");
const playButton = document.getElementById("play-btn");
const pauseButton = document.getElementById("pause-btn");
const playableArea = document.getElementById("playable-area");
const healthElement = document.getElementById("health");
const scoreElement = document.getElementById("score");
const modalElement = document.getElementById("modal");
const levelNameElement = document.getElementById("level-name");
const allButtons = document.querySelectorAll("button");
const playableHeight = playableArea.clientHeight;
const bubbleStartY = playableHeight;
const modal = new ModalWindow(modalElement);
const sounds = new SoundBank();
for (let button of allButtons) {
	button.addEventListener("click", () => sounds.play(Sound.CLICK));
}
startButton.addEventListener("click", () => setState(State.RESTART));
playButton.addEventListener("click", () => setState(State.PLAYING));
pauseButton.addEventListener("click", () => setState(State.PAUSED));

setState(State.DEMO);
