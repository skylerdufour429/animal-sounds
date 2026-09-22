const animals = {
  cat: [
    { frequency: 720, duration: 0.12, type: 'triangle', gain: 0.08 },
    { frequency: 660, duration: 0.18, type: 'triangle', gain: 0.07 },
    { frequency: 540, duration: 0.28, type: 'sine', gain: 0.05 }
  ],
  dog: [
    { frequency: 520, duration: 0.12, type: 'square', gain: 0.05 },
    { frequency: 430, duration: 0.12, type: 'square', gain: 0.05 },
    { frequency: 480, duration: 0.16, type: 'sawtooth', gain: 0.04 }
  ],
  cow: [
    { frequency: 160, duration: 0.32, type: 'sine', gain: 0.09 },
    { frequency: 150, duration: 0.22, type: 'triangle', gain: 0.08 },
    { frequency: 140, duration: 0.26, type: 'sine', gain: 0.07 }
  ],
  lion: [
    { frequency: 260, duration: 0.18, type: 'sawtooth', gain: 0.08 },
    { frequency: 200, duration: 0.22, type: 'sawtooth', gain: 0.09 },
    { frequency: 180, duration: 0.3, type: 'triangle', gain: 0.06 }
  ],
  pig: [
    { frequency: 360, duration: 0.12, type: 'square', gain: 0.05 },
    { frequency: 300, duration: 0.16, type: 'square', gain: 0.04 },
    { frequency: 330, duration: 0.18, type: 'triangle', gain: 0.05 }
  ],
  duck: [
    { frequency: 560, duration: 0.07, type: 'square', gain: 0.04 },
    { frequency: 420, duration: 0.12, type: 'square', gain: 0.045 },
    { frequency: 390, duration: 0.2, type: 'triangle', gain: 0.04 }
  ],
  bird: [
    { frequency: 1500, duration: 0.08, type: 'triangle', gain: 0.04 },
    { frequency: 1700, duration: 0.08, type: 'triangle', gain: 0.04 },
    { frequency: 1600, duration: 0.12, type: 'sine', gain: 0.04 }
  ],
  sheep: [
    { frequency: 220, duration: 0.24, type: 'sine', gain: 0.07 },
    { frequency: 200, duration: 0.2, type: 'triangle', gain: 0.06 },
    { frequency: 180, duration: 0.18, type: 'sine', gain: 0.06 }
  ]
};

let audioContext;

function getAudioContext() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioCtor();
  }

  return audioContext;
}

function playTone({ frequency, duration, type, gain, startAt = 0, endFrequency = frequency }) {
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }

  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startAt);
  if (frequency !== endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      ctx.currentTime + startAt + duration
    );
  }

  volume.gain.setValueAtTime(0.001, ctx.currentTime + startAt);
  volume.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + startAt + 0.02);
  volume.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);

  oscillator.connect(volume);
  volume.connect(ctx.destination);

  oscillator.start(ctx.currentTime + startAt);
  oscillator.stop(ctx.currentTime + startAt + duration + 0.05);
}

function playAnimalSound(animalName) {
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const soundPattern = animals[animalName] || animals.cat;

  soundPattern.forEach((note, index) => {
    const nextNote = soundPattern[index + 1];
    const startAt = index * 0.16;
    const endFrequency = nextNote ? nextNote.frequency : note.frequency * 0.85;

    playTone({
      frequency: note.frequency,
      duration: note.duration,
      type: note.type,
      gain: note.gain,
      startAt,
      endFrequency
    });
  });
}

const cards = document.querySelectorAll('.animal-card');

cards.forEach((card) => {
  card.addEventListener('click', () => {
    const animalName = card.dataset.animal;
    playAnimalSound(animalName);
  });
});

const downloadButton = document.querySelector('.download-btn');
downloadButton.addEventListener('click', () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
  playAnimalSound('dog');
});
