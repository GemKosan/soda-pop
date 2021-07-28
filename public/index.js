import lyrics from "./lyrics.js";
import * as State from "./state.js";

const bubblePadding = 15;
const bubbleDelayMs = 400;
const floatPxPerSec = 100;
const maxBubbleScore = 10;

class GameTimer {
	constructor(callback, delay) {
		this.callback = callback;
		this.delay = delay;
	}

	clear() {
		clearInterval(this.timer);
	}

	pause() {
		this.clear();
	}

	resume() {
		this.clear();
		this.timer = setInterval(this.callback, this.delay);
    this.callback();
	}
}

function stripPunctuation(text) {
	var punctuation = /[^a-zA-Z'\-\s+]/g;
	return text.replace(punctuation, "");
}

function renderScore(score) {
	scoreElement.innerText = String(score).padStart(10, "0");
}

function renderBubble(text, container) {
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
    transition: top ${floatTransitionSecs}s cubic-bezier(0, 0, 1, 1);
    width: ${bubbleDiameter}px;
    height: ${bubbleDiameter}px; 
    left: ${randomX}px;
    top: -${bubbleDiameter - 1}px`;

	bubble.setAttribute("style", bubbleAnimationStyles);
	bubble.addEventListener("transitionend", function ({ target }) {
		this.remove();
	});
	bubble.addEventListener("mousedown", (e) => scoreBubble(e));
}

function scoreBubble({ currentTarget }) {
	let points = maxBubbleScore - currentTarget.innerText.length + 1;
	points = points > 0 ? points : 1;
	points *= floatPxPerSec;
	score += points;
	renderScore(score);
	console.log(`POP! - ${currentTarget.innerText} - ${points} points`);
	currentTarget.remove();
}

function setState(newState) {
	switch (newState) {
		case State.DEMO:
			console.log("DEMO");
			break;
		case State.PLAYING:
			console.log("PLAYING");
			console.log(game);
      game.resume();
			break;
		case State.PAUSED:
			console.log("PAUSED");
      game.pause();
			break;
		case State.LEVEL_COMPLETE:
			console.log("LEVEL_COMPLETE");
			break;
		case State.GAME_OVER:
			console.log("GAME_OVER");
			break;
		default:
			console.log(`ERROR: Unknown state ${newState}`);
	}
	state = newState;
}

function handlePlayPause() {
	state == State.PLAYING ? setState(State.PAUSED) : setState(State.PLAYING);
}

function resumeGame() {
	while (!words[currentWord] && currentWord < numWords) {
		currentWord++;
	}
	if (words[currentWord]) {
		renderBubble(words[currentWord], playableArea);
		currentWord++;
		if (currentWord >= numWords) {
			game.clear();
			setState(State.LEVEL_COMPLETE);
		}
	}
}

/********** Main **********/

let state;
let score;
const playableArea = document.getElementById("playable-area");
const scoreElement = document.getElementById("score-value");
document.getElementById("start-btn").addEventListener('click', handlePlayPause);
const playableHeight = playableArea.clientHeight;
const floatTransitionSecs = playableHeight / floatPxPerSec;
const bubbleStartY = playableHeight;
const words = stripPunctuation(lyrics).split(/\s/);
const numWords = words.length;
let currentWord = 0;
const game = new GameTimer(resumeGame, bubbleDelayMs);

renderScore(0);
setState(State.DEMO);
