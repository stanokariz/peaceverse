let ttsQueue = [];
let isPlaying = false;
let ttsRef = null;
let ambientAudio = null;
let audioCtx = null;

export const emotionPresets = {
  neutral: { rate: 1, pitch: 1, pause: 200 },
  calm: { rate: 0.9, pitch: 1, pause: 250 },
  dramatic: { rate: 1.2, pitch: 1, pause: 150 },
  angry: { rate: 1.3, pitch: 1.1, pause: 100 },
  soothing: { rate: 0.8, pitch: 0.9, pause: 300 },
};

const soundtrackMap = {
  neutral: "/soundtracks/newsroom_bed.mp3",
  calm: "/soundtracks/lofi.mp3",
  dramatic: "/soundtracks/news_tension.mp3",
  angry: "/soundtracks/news_tension.mp3",
  soothing: "/soundtracks/ambient_soft.mp3",
};

const stinger = new Audio("/sfx/breaking_news_sting.mp3");

// --- TTS with speechSynthesis ---
export async function speak(text, options = {}) {
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = options.lang || "en-US";
  utterance.rate = options.rate || 1;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  const voices = window.speechSynthesis.getVoices();
  if (options.voice) {
    const selected = voices.find((v) =>
      v.name.toLowerCase().includes(options.voice.toLowerCase())
    );
    if (selected) utterance.voice = selected;
  } else {
    utterance.voice = voices[0] || null;
  }

  utterance.onstart = () => {
    isPlaying = true;
  };
  utterance.onend = () => {
    isPlaying = false;
    if (ttsQueue.length > 0) playNext();
  };

  ttsRef = utterance;

  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = () => speechSynthesis.speak(utterance);
  } else {
    speechSynthesis.speak(utterance);
  }

  return utterance;
}

// --- Stop current TTS ---
export function stopSpeak() {
  if (ttsRef) {
    speechSynthesis.cancel();
    ttsRef = null;
    isPlaying = false;
  }
}

// --- Queue management ---
export function enqueueTTS(text, options) {
  ttsQueue.push({ text, options });
  if (!isPlaying) playNext();
}

export function playNext() {
  if (ttsQueue.length === 0) return;
  const next = ttsQueue.shift();
  speak(next.text, next.options);
}

// --- Ambient music with fade and emotion switch ---
export async function initAmbientMusic(src) {
  if (!ambientAudio) {
    ambientAudio = new Audio(src || "/ambient.mp3");
    ambientAudio.loop = true;
    ambientAudio.volume = 0.3;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(ambientAudio);
    source.connect(audioCtx.destination);
  }
  try {
    await ambientAudio.play();
  } catch {}
}

export async function changeSoundtrack(emotion) {
  await initAmbientMusic();
  const newTrack = soundtrackMap[emotion] || soundtrackMap.neutral;
  await fadeAmbient(0, 400);
  ambientAudio.src = newTrack;
  ambientAudio.currentTime = 0;
  try {
    await ambientAudio.play();
  } catch {}
  await fadeAmbient(0.3, 400);
}

export function fadeAmbient(targetVolume, duration = 400) {
  return new Promise((res) => {
    if (!ambientAudio) return res();
    const startVol = ambientAudio.volume;
    const startTime = performance.now();
    const step = () => {
      const now = performance.now();
      const t = Math.min((now - startTime) / duration, 1);
      ambientAudio.volume = startVol + t * (targetVolume - startVol);
      if (t < 1) requestAnimationFrame(step);
      else res();
    };
    step();
  });
}

// --- Breaking news stinger ---
export async function playStinger(emotion) {
  if (emotion !== "dramatic" && emotion !== "angry") return;
  try {
    stinger.currentTime = 0;
    await stinger.play();
    await new Promise((r) => setTimeout(r, 500));
  } catch {}
}

// --- Multi-language translation ---
export async function translateText(text, targetLang = "en") {
  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target: targetLang }),
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch {
    return text;
  }
}

// --- Load voices helper ---
export function loadVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    window.speechSynthesis.onvoiceschanged = () =>
      resolve(window.speechSynthesis.getVoices());
  });
}

// --- Get voices (exported now) ---
export function getVoices() {
  return window.speechSynthesis.getVoices();
}

// --- Pause / resume ---
export function pauseSpeak() {
  speechSynthesis.pause();
}
export function resumeSpeak() {
  speechSynthesis.resume();
}

// --- Podcast script builder ---
export function buildPodcastScript(incident) {
  if (!incident) return [];
  const title = incident.title || "Untitled";
  const description = incident.description || "";
  return [
    `Breaking news: ${title}.`,
    description,
    "Stay tuned for more updates.",
  ];
}
