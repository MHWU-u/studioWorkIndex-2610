// Konva stage setup
const stage = new Konva.Stage({
  container: "konva-stage",
  width: 720,
  height: 420
});

const layer = new Konva.Layer();
stage.add(layer);

// Default circle colour
let circleColour = "red";

// DOM references
const drawCircleButton = document.querySelector("#drawCircleButton");
const colourNumberInput = document.querySelector("#colourNumber");
const colourNameText = document.querySelector("#colourName");

// This object maps numbers 1-7 to rainbow colours.
const rainbowMap = {
  1: "red",
  2: "orange",
  3: "yellow",
  4: "green",
  5: "cyan",
  6: "blue",
  7: "violet"
};

// Convert the input number into a valid CSS colour string.
function updateCircleColour() {
  let inputValue = parseInt(colourNumberInput.value, 10);

  if (isNaN(inputValue)) {
    inputValue = 1;
  }

  if (inputValue < 1) {
    inputValue = 1;
  }

  if (inputValue > 7) {
    inputValue = 7;
  }

  colourNumberInput.value = inputValue;
  circleColour = rainbowMap[inputValue];
  colourNameText.textContent =
    circleColour.charAt(0).toUpperCase() + circleColour.slice(1);
}

// Draw a new circle using the current mapped colour.
function drawCircle() {
  const radius = 30 + Math.random() * 25;
  const x = radius + Math.random() * (stage.width() - radius * 2);
  const y = radius + Math.random() * (stage.height() - radius * 2);

  const circle = new Konva.Circle({
    x: x,
    y: y,
    radius: radius,
    fill: circleColour,
    stroke: "black",
    strokeWidth: 2
  });

  layer.add(circle);
  layer.draw();
}

// Events
colourNumberInput.addEventListener("input", updateCircleColour);
drawCircleButton.addEventListener("click", drawCircle);

// Set the initial colour state when the page loads
updateCircleColour();
