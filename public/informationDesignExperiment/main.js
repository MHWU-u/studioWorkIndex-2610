// Find elements
const introDialog = document.getElementById("intro-dialog");
const dialogCloseButton = document.getElementById("dialog-close-button");
const rangeSlider1 = document.getElementById("var1Range");
const rangeSlider2 = document.getElementById("var2Range");
const rangeSlider3 = document.getElementById("var3Range");

// UI defaults
const range1DefaultValue = -6;
const range2DefaultValue = 5;
const range3DefaultValue = 50;

// Tone init
const synth = new Tone.Synth({
    oscillator: {
        type: "fatsawtooth",
        count: 3,
        spread: 10,
    },
    envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.1,
        attackCurve: "exponential",
    }
});

const autoPanner = new Tone.AutoPanner("8n").start();
autoPanner.set({ wet: 0.15 });

const filter = new Tone.Filter(0, "highpass");

async function toneInit() {
    await Tone.start();
    synth.chain(autoPanner, filter, Tone.Destination);
}

// Dialog init
introDialog.showModal();

dialogCloseButton.addEventListener("click", () => {
    introDialog.close();
});

introDialog.addEventListener("close", toneInit);

// Sound helper
function setVolume(newVolume) {
    synth.set({ volume: newVolume });
}

// Visual helper for slider fill in Chrome / Safari.
// Firefox uses ::-moz-range-progress, but setting this custom property keeps the same look elsewhere.
function updateSliderVisual(slider) {
    const min = Number(slider.min);
    const max = Number(slider.max);
    const value = Number(slider.value);
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.setProperty("--range-progress", `${percentage}%`);
}

function attachSliderVisual(slider) {
    updateSliderVisual(slider);
    slider.addEventListener("input", () => updateSliderVisual(slider));
}

// Slider 1: clear volume control from the class example
rangeSlider1.value = range1DefaultValue;
rangeSlider1.addEventListener("input", () => {
    setVolume(rangeSlider1.value);
});
rangeSlider1.dispatchEvent(new Event("input"));
attachSliderVisual(rangeSlider1);

// Slider 2: interpreted as rhythmic fluctuation.
// The 🎵 to 🎶 shift suggests that the sound becomes more active and musically animated.
rangeSlider2.value = range2DefaultValue;
rangeSlider2.addEventListener("input", () => {
    const intValue = Math.floor(rangeSlider2.value);
    const newCount = clamp(1 + (intValue / 5), 3, 6);
    const newSpread = intValue * 2;

    synth.set({
        oscillator: {
            count: newCount,
            spread: newSpread
        }
    });

    autoPanner.set({
        wet: newSpread / 100
    });
});
rangeSlider2.dispatchEvent(new Event("input"));
attachSliderVisual(rangeSlider2);

// Slider 3: interpreted as audio height.
// The whale and bird are a more poetic cue for low vs high sound, instead of a technical frequency label.
rangeSlider3.value = range3DefaultValue;
rangeSlider3.addEventListener("input", () => {
    const value = Number(rangeSlider3.value);

    if (value > 50) {
        filter.set({
            frequency: clamp(remapRange(value, 60, 100, 0, 6000), 0, 6000),
            type: "highpass"
        });
    } else {
        filter.set({
            frequency: clamp(remapRange(value, 0, 40, 0, 20000), 0, 20000),
            type: "lowpass"
        });
    }

    synth.set({
        detune: remapRange(value, 0, 100, -1200, 1200)
    });
});
rangeSlider3.dispatchEvent(new Event("input"));
attachSliderVisual(rangeSlider3);

// Helper functions
function remapRange(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * (value - min1) / (max1 - min1);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
