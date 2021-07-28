import lyrics from "./lyrics.js";

const bubblePadding = 15;
const bubbleDelayMs = 400;
const floatPxPerSec = 100;
const maxBubbleScore = 10;


function stripPunctuation(text) {
  var punctuation = /[^a-zA-Z'\-\s+]/g;
  return text.replace(punctuation, "");
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
    top: -${bubbleDiameter-1}px`;

  bubble.setAttribute("style", bubbleAnimationStyles);
  bubble.addEventListener("transitionend", function({ target }) {
    this.remove();
  });
  bubble.addEventListener("mousedown", e => scoreBubble(e));
}

function scoreBubble({currentTarget}) {
  let points = maxBubbleScore - currentTarget.innerText.length + 1;
  points = points > 0 ? points : 1; 
  console.log(`POP! - ${currentTarget.innerText} - ${points} points`);
  currentTarget.remove();
}


/********** Main **********/

const playableArea = document.getElementById("playable-area");
const playableHeight = playableArea.clientHeight;
const floatTransitionSecs = playableHeight / floatPxPerSec;
const bubbleStartY = playableHeight;
const words = stripPunctuation(lyrics).split(/\s/);
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
