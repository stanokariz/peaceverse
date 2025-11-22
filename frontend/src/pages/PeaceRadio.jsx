// src/pages/PeaceRadio.jsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import api from "../api";
import {
  loadVoices,
  getVoices,
  speak,
  stopSpeak,
  pauseSpeak,
  resumeSpeak,
  emotionPresets,
  buildPodcastScript,
  initAmbientMusic,
  fadeAmbient,
} from "../utils/tts";

import radioBg from "../assets/radio.jpeg";

export default function PeaceRadio() {
  const STREAM_URL = "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service";
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const ttsRef = useRef(null);

  // --- Radio & audio states ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [volume, setVolume] = useState(0);

  // --- Incident states ---
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState({ q: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  // --- TTS states ---
  const [voice, setVoice] = useState("");
  const [emotion, setEmotion] = useState("neutral");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [isTTSPaused, setIsTTSPaused] = useState(false);
  const [loadingTTS, setLoadingTTS] = useState(false);

  // --- Podcast / display ---
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [subtitleChunks, setSubtitleChunks] = useState([]);
  const [podcastMode, setPodcastMode] = useState(false);

  // =========================================
  // RADIO STREAM
  // =========================================
  const togglePlay = async () => {
    const audio = audioRef.current;
    try {
      if (!audioCtx) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const analyserNode = ctx.createAnalyser();
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyserNode);
        analyserNode.connect(ctx.destination);
        analyserNode.fftSize = 256;
        setAudioCtx(ctx);
        setAnalyser(analyserNode);
      }
      if (audioCtx && audioCtx.state === "suspended") await audioCtx.resume();

      if (!isPlaying) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Autoplay blocked:", err);
      alert("Click Play again — your browser blocked autoplay.");
    }
  };

  // Visualizer for radio & TTS
  useEffect(() => {
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let frame;

    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      setVolume(dataArray.reduce((a, b) => a + b, 0) / dataArray.length);
      frame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frame);
  }, [analyser]);

  // =========================================
  // FETCH INCIDENTS
  // =========================================
  useEffect(() => {
    (async () => {
      setLoadingIncidents(true);
      try {
        const params = {
          page,
          limit: 10,
          q: filters.q || undefined,
          sortBy: "createdAt",
          sortDir: "desc",
        };
        const res = await api.get("/incidents/all/public", { params });
        const list = res.data.incidents || [];
        setIncidents(list);
        setTotalPages(res.data.pages || 1);

        if (list.length > 0 && !selectedIncident) {
          setSelectedIncident(list[0]);
          setCurrentIndex(0);
          generateTTS(list[0].description || list[0].title, 0);
        }
      } catch (err) {
        alert("Failed to fetch incidents.");
      }
      setLoadingIncidents(false);
    })();
  }, [page, filters]);

  // Ambient music init
  useEffect(() => {
    window.addEventListener("click", () => initAmbientMusic("/ambient.mp3"));
  }, []);

  // =========================================
  // WAVEFORM VISUALIZER
  // =========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let anim;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      let amp = isTTSPlaying ? 25 : 10;
      let freq = isTTSPlaying ? 0.15 : 0.05;

      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        let y;
        if (isScratching) {
          y = Math.random() * h;
        } else {
          y = h / 2 + Math.sin((x + frame) * freq) * amp * Math.sin(frame * 0.02);
        }
        const hue = (x + frame) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.lineWidth = 3;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      frame++;
      anim = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("resize", resize);
    };
  }, [isTTSPlaying, isScratching]);

  // =========================================
  // RADIO SCRATCH EFFECT
  // =========================================
  const playRadioScratch = () => {
    return new Promise((resolve) => {
      setIsScratching(true);

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      whiteNoise.connect(gainNode).connect(ctx.destination);
      whiteNoise.start();

      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.25);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

      setTimeout(() => {
        whiteNoise.stop();
        setIsScratching(false);
        resolve();
      }, 300);
    });
  };

  // =========================================
  // TTS GENERATION WITH LOOP
  // =========================================
  const generateTTS = async (text, idx = currentIndex) => {
    if (!text || incidents.length === 0) return;

    stopSpeak();
    setLoadingTTS(true);
    setIsTTSPlaying(false);
    setIsTTSPaused(false);
    setHighlightIndex(null);
    setSubtitleChunks([]);

    await loadVoices();
    const preset = emotionPresets[emotion] || emotionPresets.neutral;
    const enriched = text.replace(/([,.!?])/g, `$1 <break time="${preset.pause}ms" />`);

    const onWord = (e) => {
      const charIndex = e.charIndex;
      setHighlightIndex(charIndex);
      const wordsBefore = text.slice(0, charIndex).split(/\s+/).length - 1;
      setSubtitleChunks((prev) => (prev.includes(wordsBefore) ? prev : [...prev, wordsBefore]));
    };

    await playRadioScratch();
    await fadeAmbient(0.05, 200);

    const utter = await speak(enriched, {
      voice,
      rate: preset.rate * rate,
      pitch: preset.pitch * pitch,
      onWord,
    });

    utter.onstart = () => {
      setIsTTSPlaying(true);
      setLoadingTTS(false);
    };

    utter.onend = async () => {
      setIsTTSPlaying(false);
      setIsTTSPaused(false);

      if (!podcastMode && incidents.length > 0) {
        const nextIndex = (idx + 1) % incidents.length;
        setCurrentIndex(nextIndex);
        setSelectedIncident(incidents[nextIndex]);
        setTimeout(() => {
          generateTTS(incidents[nextIndex].description || incidents[nextIndex].title, nextIndex);
        }, 500);
      }
    };

    ttsRef.current = utter;
  };

  // =========================================
  // PODCAST MODE
  // =========================================
  const playPodcast = async (incident) => {
    stopSpeak();
    const script = buildPodcastScript(incident);

    for (let i = 0; i < script.length; i++) {
      await fadeAmbient(0.05, 350);
      await new Promise((resolve) => {
        const utter = speak(script[i], { voice });
        utter.onend = () => resolve();
      });
      await fadeAmbient(0.3, 350);
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  const playIncident = async (idx) => {
    if (!incidents[idx]) return;
    await fadeAmbient(0.05, 400);
    stopSpeak();
    setSelectedIncident(incidents[idx]);
    setCurrentIndex(idx);
    setTimeout(() => {
      generateTTS(incidents[idx].description || incidents[idx].title, idx);
      fadeAmbient(0.3, 400);
    }, 300);
  };

  // =========================================
  // TTS CONTROLS (PAUSE/RESUME)
  // =========================================
  const togglePauseResume = () => {
    if (!isTTSPlaying) return;
    if (isTTSPaused) {
      resumeSpeak();
      setIsTTSPaused(false);
    } else {
      pauseSpeak();
      setIsTTSPaused(true);
    }
  };

  const onStop = () => {
    stopSpeak();
    setIsTTSPlaying(false);
    setIsTTSPaused(false);
  };

  // =========================================
  // UI
  // =========================================
  return (
    <motion.section
      className="relative w-full min-h-screen flex flex-col items-center justify-start text-gray-100 overflow-auto pt-[4.5rem] px-3"
      style={{
        backgroundImage: `url(${radioBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "rgba(0,0,0,0.65)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Optional overlay for readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <motion.div className="relative z-10 mt-6 w-full max-w-sm bg-black/40 p-4 rounded-xl border border-yellow-700 shadow-lg">
        <h2 className="text-center text-yellow-300 font-semibold mb-2 text-sm">
          🎧 Choose an Incident → Read Aloud
        </h2>

        {/* INCIDENT SELECT */}
        <select
          value={selectedIncident?._id || ""}
          onChange={async (e) => {
            const idx = incidents.findIndex((i) => i._id === e.target.value);
            setCurrentIndex(idx);
            const inc = incidents[idx];
            setSelectedIncident(inc);
            await playRadioScratch();
            generateTTS(inc.description || inc.title, idx);
          }}
          className="w-full bg-black/50 border border-yellow-600 text-yellow-200 rounded-lg p-2 text-sm mb-2"
        >
          <option value="">-- Choose an incident --</option>
          {incidents.map((i) => (
            <option key={i._id} value={i._id}>
              {i.title}
            </option>
          ))}
        </select>

        {/* VOICE SELECT */}
        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          className="w-full bg-black/50 border border-yellow-600 text-yellow-200 rounded-lg p-2 text-sm mb-2"
        >
          <option value="">Default Voice</option>
          {getVoices().map((v, idx) => (
            <option key={idx} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>

        {/* EMOTION */}
        <select
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          className="w-full bg-black/50 border border-yellow-600 text-yellow-200 rounded-lg p-2 text-sm mb-2"
        >
          <option value="neutral">Neutral / Reporter</option>
          <option value="calm">Calm</option>
          <option value="dramatic">Dramatic</option>
          <option value="angry">Urgent / Angry</option>
          <option value="soothing">Soothing / Soft</option>
        </select>

        {/* PODCAST MODE */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={podcastMode}
            onChange={(e) => setPodcastMode(e.target.checked)}
          />
          <span className="text-yellow-300 text-xs">Enable Podcast Mode</span>
        </div>

        {/* RATE & PITCH */}
        <div className="mb-2">
          <label className="text-xs text-yellow-300">Rate</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="mb-2">
          <label className="text-xs text-yellow-300">Pitch</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* CONTROLS */}
        <div className="flex gap-1 mb-2 flex-wrap">
          <button
            onClick={togglePlay}
            className="flex-1 bg-blue-600 hover:bg-blue-700 py-1 rounded text-xs flex items-center justify-center gap-1"
          >
            <Play size={12} /> BBC
          </button>
          <button
            disabled={loadingTTS || incidents.length === 0}
            onClick={() => {
              if (podcastMode) playPodcast(selectedIncident);
              else generateTTS(selectedIncident?.description || selectedIncident?.title, currentIndex);
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 py-1 rounded flex items-center justify-center gap-1 text-xs"
          >
            {loadingTTS ? <Loader2 className="animate-spin" /> : <Play size={12} />} Play TTS
          </button>
          <button
            onClick={togglePauseResume}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-1 rounded text-xs"
          >
            {isTTSPaused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={onStop}
            className="flex-1 bg-red-600 hover:bg-red-700 py-1 rounded text-xs"
          >
            Stop
          </button>
        </div>

        {/* WAVEFORM */}
        <canvas
          ref={canvasRef}
          height={100}
          className="w-full rounded-lg bg-black/40 border border-yellow-600"
        ></canvas>
        <audio ref={audioRef} src={STREAM_URL} preload="none" crossOrigin="anonymous" />
      </motion.div>
    </motion.section>
  );
}
