// Feedback Experiment
// Design choice: I break the interaction into preview, press, release and mode-shift states
// so the sound feels less like a single click and more like a responsive instrument.

const playButton = document.querySelector("#playButton");
const panel = document.querySelector(".instrument-panel");
const statusText = document.querySelector("#statusText");
const noteText = document.querySelector("#noteText");
const modeText = document.querySelector("#modeText");

const notePool = ["C4", "D4", "E4", "G4", "A4", "C5"];
let currentNote = "C4";
let audioStarted = false;
let isHeld = false;
let echoMode = false;

// Audio routing: synth -> filter -> delay -> speakers.
// I included delay because the course brief asks for feedback design,
// and an echo effect makes the idea of “feedback” audible as well as visual.
const filter = new Tone.Filter(900, "lowpass");
const delay = new Tone.FeedbackDelay("8n", 0.28);
const synth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.02,
    decay: 0.15,
    sustain: 0.4,
    release: 0.8,
  },
});

synth.connect(filter);
filter.connect(delay);
delay.toDestination();
filter.toDestination();
delay.wet.value = 0;

function updateStatus(message) {
  statusText.textContent = message;
}

function setPointerFeedback(event) {
  const bounds = panel.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;

  const clampedX = Math.min(Math.max(x, 0), 1);
  const clampedY = Math.min(Math.max(y, 0), 1);

  document.documentElement.style.setProperty("--pointer-x", `${clampedX * 100}%`);
  document.documentElement.style.setProperty("--pointer-y", `${clampedY * 100}%`);

  const hue = Math.round(180 + clampedX * 130);
  document.documentElement.style.setProperty("--accent-hue", hue);

  const noteIndex = Math.min(notePool.length - 1, Math.floor(clampedX * notePool.length));
  currentNote = notePool[noteIndex];
  noteText.textContent = currentNote;

  // Higher pointer position opens the filter, making the sound brighter.
  const targetCutoff = 350 + (1 - clampedY) * 2200;
  filter.frequency.rampTo(targetCutoff, 0.08);
}

async function ensureAudio() {
  if (!audioStarted) {
    await Tone.start();
    audioStarted = true;
  }
}

async function startSound() {
  await ensureAudio();

  if (isHeld) return;

  isHeld = true;
  playButton.classList.add("is-pressed");
  synth.triggerAttack(currentNote);
  updateStatus(`holding ${currentNote.toLowerCase()}`);
}

function stopSound() {
  if (!isHeld) return;

  isHeld = false;
  playButton.classList.remove("is-pressed");
  synth.triggerRelease();
  updateStatus("released");
}

function previewState() {
  playButton.classList.add("is-armed");
  updateStatus(`preview ${currentNote.toLowerCase()}`);
}

function clearPreview() {
  playButton.classList.remove("is-armed");
  updateStatus("idle");
}

function toggleEchoMode() {
  echoMode = !echoMode;
  delay.wet.rampTo(echoMode ? 0.35 : 0, 0.15);
  modeText.textContent = echoMode ? "echo" : "dry";
  document.body.classList.toggle("mode-echo", echoMode);
  updateStatus(echoMode ? "echo enabled" : "echo disabled");
}

playButton.addEventListener("mouseenter", () => {
  previewState();
});

panel.addEventListener("mousemove", (event) => {
  setPointerFeedback(event);
  if (!isHeld) {
    updateStatus(`preview ${currentNote.toLowerCase()}`);
  }
});

playButton.addEventListener("mouseleave", () => {
  stopSound();
  clearPreview();
});

playButton.addEventListener("mousedown", async (event) => {
  setPointerFeedback(event);
  await startSound();
});

window.addEventListener("mouseup", () => {
  stopSound();
});

playButton.addEventListener("click", async (event) => {
  // Short accent after click release: gives a second layer of feedback
  // so the user hears a clear response even from a brief tap.
  setPointerFeedback(event);
  await ensureAudio();
  synth.triggerAttackRelease(currentNote, "8n");
  updateStatus(`clicked ${currentNote.toLowerCase()}`);
});

playButton.addEventListener("dblclick", async () => {
  await ensureAudio();
  toggleEchoMode();
});

playButton.addEventListener("focus", () => {
  previewState();
});

playButton.addEventListener("blur", () => {
  stopSound();
  clearPreview();
});

playButton.addEventListener("keydown", async (event) => {
  if (event.code === "Space" || event.code === "Enter") {
    event.preventDefault();
    await startSound();
  }

  if (event.code === "KeyE") {
    event.preventDefault();
    await ensureAudio();
    toggleEchoMode();
  }
});

playButton.addEventListener("keyup", (event) => {
  if (event.code === "Space" || event.code === "Enter") {
    event.preventDefault();
    stopSound();
  }
});
