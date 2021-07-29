import lyrics from "./lyrics.js";
import * as State from "./state.js";

const bubblePadding = 15;
const bubbleDelayMs = 400;
const floatPxPerSec = 100;
const maxBubbleScore = 10;
const bubbleDamage = 10;

class Bubbler {
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

function renderHealth() {
	healthElement.setAttribute("style", `width: ${health}%;`);
}

function renderScore() {
	scoreElement.innerText = String(score).padStart(9, "0");
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

function scoreBubble({ currentTarget }) {
	let points = maxBubbleScore - currentTarget.innerText.length + 1;
	points = points > 0 ? points : 1;
	points *= floatPxPerSec;
	score += points;
	renderScore();
	console.log(`Popped "${currentTarget.innerText}": ${points} points`);
	currentTarget.remove();
}

function removeBubble({currentTarget}) {
  currentTarget.remove();
  let newHealth = health - bubbleDamage;
  if (newHealth <= 0) {
    newHealth = 0
    setState(State.GAME_OVER);
  }
  health = newHealth;
  renderHealth();
}

function setState(newState) {
  console.log(`Game state: ${newState}`);
	switch (newState) {
		case State.DEMO:
			break;
		case State.PLAYING:
			bubbleGenerator.resume();
      bubblePause.remove();
      modal.classList.add("hidden");
      playButton.classList.add("hidden");
      startButton.classList.add("hidden");
      pauseButton.classList.remove("hidden");
			break;
		case State.PAUSED:
			bubbleGenerator.pause();
      document.head.append(bubblePause);
      // modal.classList.remove("hidden");
      playButton.classList.remove("hidden");
      pauseButton.classList.add("hidden");
			break;
		case State.LEVEL_COMPLETE:
			break;
		case State.GAME_OVER:
      // modal.classList.remove("hidden");
			break;
		default:
	}
	state = newState;
}

function handlePlayPause() {
	state == State.PLAYING ? setState(State.PAUSED) : setState(State.PLAYING);
}

function resumegame() {
	while (!words[currentWord] && currentWord < numWords) {
		currentWord++;
	}
	if (words[currentWord]) {
		renderBubble(words[currentWord], playableArea);
		currentWord++;
		if (currentWord >= numWords) {
			bubbleGenerator.clear();
			setState(State.LEVEL_COMPLETE);
		}
	}
}

/********** Main **********/

let state;
let score = 0;
let health = 100;
let currentWord = 0;
const playButton = document.getElementById("play-btn");
const pauseButton = document.getElementById("pause-btn");
const startButton = document.getElementById("start-btn");
const playableArea = document.getElementById("playable-area");
const healthElement = document.getElementById("health");
const scoreElement = document.getElementById("score");
const modal = document.getElementById("modal");
const playableHeight = playableArea.clientHeight;
const floatTransitionSecs = playableHeight / floatPxPerSec;
const bubbleStartY = playableHeight;
const words = stripPunctuation(lyrics).split(/\s/);
const numWords = words.length;
const bubbleGenerator = new Bubbler(resumegame, bubbleDelayMs);
const bubblePause = document.createElement("style");
bubblePause.setAttribute("type", "text/css")
bubblePause.innerText = "#game {animation-play-state: paused;}";
document.getElementById("start-btn").addEventListener("click", handlePlayPause);
document.getElementById("play-btn").addEventListener("click", handlePlayPause);
document.getElementById("pause-btn").addEventListener("click", handlePlayPause);

renderScore();
setState(State.DEMO);
