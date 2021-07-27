import lyrics from "./lyrics.js";

const bubblePadding = 15;
const bubbleDelayMs = 800;
const floatPxPerSec = 100;
const bubbleFontFamily = "helvetica";
const bubbleFontSize = "16px";

const words = lyrics.split(/\s/);

const playableArea = document.getElementById("playable-area");
const playableHeight = playableArea.clientHeight;
const floatTransitionSecs = playableHeight / floatPxPerSec;
const bubbleStartY = playableHeight;

const fontStyles = `
    font-family: ${bubbleFontFamily};
    font-size: ${bubbleFontSize};`;


function renderBubble(text, container) {
  let bubble = document.createElement("div");
  let textSpan = document.createElement("span");
  textSpan.className = "bubble-text";
  textSpan.innerText = text;
  textSpan.setAttribute("style", fontStyles);
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
    top: -${bubbleDiameter-1}px`;

  bubble.setAttribute("style", bubbleAnimationStyles);
  bubble.addEventListener("transitionend", function({ target }) {
    this.remove();
  });
  bubble.addEventListener("mousedown", function({ target }) {
    console.log(`POP! - ${this.innerText}`);
    this.remove();
  });
}

const numBubbles = words.length;
let i = 0;
const timer = setInterval(function() {
  while (!words[i] && i < numBubbles) {
    i++;
  }
  words[i] && renderBubble(words[i], playableArea);
  i++;
  if (i >= numBubbles) {
    clearInterval(timer);
  }
}, bubbleDelayMs);
