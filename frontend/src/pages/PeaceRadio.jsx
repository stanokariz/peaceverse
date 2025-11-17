import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";
import axios from "axios";
import api from "../api"; // your axios instance

export default function PeaceRadio({ bgImage = "../../public/radio.jpeg.jpeg" }) {
  const audioRef = useRef(null);
  const ttsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [volume, setVolume] = useState(0);
  const [lights, setLights] = useState([false, false, false]);

  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [voice, setVoice] = useState("luna");
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [loadingTTS, setLoadingTTS] = useState(false);

  const STREAM_URL = "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service";

  // --- Radio Play / Pause ---
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

      if (audioCtx?.state === "suspended") await audioCtx.resume();

      if (!isPlaying) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Playback error:", err);
      alert("Click Play again — your browser blocked autoplay.");
    }
  };

  // --- Audio Visualizer ---
  useEffect(() => {
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrame;

    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setVolume(avg);
      const intensity = avg / 255;
      setLights([
        Math.random() < intensity,
        Math.random() < intensity * 1.2,
        Math.random() < intensity * 0.8,
      ]);
      animationFrame = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrame);
  }, [analyser]);

  // --- Fetch incidents from backend ---
  useEffect(() => {
    const fetchIncidents = async () => {
        try {
          const res = await api.get("/incidents/all/all", { params: filters });
          setIncidents(res.data.incidents || []);
          setTotalPages(res.data.pages || 1);
        } catch (err) {
          console.error(err);
          toast.error("Failed to fetch incidents");
        } finally {
          setLoading(false);
        }
      };
    fetchIncidents();
  }, []);

  // --- Generate TTS ---
  const generateTTS = async (text) => {
    if (!text) return;
    setLoadingTTS(true);
    setIsTTSPlaying(false);
    try {
      const response = await axios.post(
        "http://localhost:8080/tts/generate",
        { text, voice },
        { responseType: "blob" }
      );
      const audioURL = URL.createObjectURL(response.data);
      ttsRef.current.src = audioURL;
      await ttsRef.current.play();
      setIsTTSPlaying(true);
    } catch (err) {
      console.error("TTS ERROR:", err);
      alert("Failed to generate audio.");
    } finally {
      setLoadingTTS(false);
    }
  };

  const stopTTS = () => {
    ttsRef.current.pause();
    ttsRef.current.currentTime = 0;
    setIsTTSPlaying(false);
  };

  return (
    <section
      className="fixed top-0 left-0 w-full min-h-screen flex flex-col items-center justify-start
                 text-gray-100 overflow-auto pt-[4.5rem] sm:pt-[5rem] px-3"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0,0,0,0.65)",
      }}
    >
      {/* Subtle glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle_at_center, rgba(255,215,0,0.08) 0%, transparent 70%)",
        }}
        animate={{ opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.15 }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* ON AIR */}
      <motion.div
        className="absolute top-8 flex flex-col items-center"
        animate={{
          opacity: isPlaying ? [0.8, 1, 0.8] : 0.4,
          textShadow: isPlaying
            ? [
                "0 0 8px #ff0040, 0 0 16px #ff0040, 0 0 32px #ff0040",
                "0 0 12px #ff3366, 0 0 24px #ff3366, 0 0 40px #ff3366",
                "0 0 8px #ff0040, 0 0 16px #ff0040, 0 0 32px #ff0040",
              ]
            : "none",
        }}
        transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ff0040] tracking-widest drop-shadow-lg">
          ON AIR
        </h2>
        <div className="w-16 sm:w-20 h-1 bg-red-600 mt-1 rounded-full shadow-[0_0_10px_#ff0040]" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mt-24 text-lg sm:text-2xl font-bold mb-4 text-amber-400 text-center drop-shadow-lg"
      >
        PeaceVerse Radio 📻 — Broadcasting Unity Across Africa
      </motion.h1>

      {/* Radio Body */}
      <motion.div
        className="relative w-[80%] sm:w-[65%] md:w-[45%] lg:w-[35%]
                   bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900
                   border-[2px] sm:border-[3px] border-yellow-600 rounded-2xl
                   shadow-2xl p-3 sm:p-4 flex flex-col items-center mx-auto"
      >
        {/* Play / Pause */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className={`mt-1 sm:mt-2 px-6 sm:px-8 py-1.5 sm:py-2.5 rounded-full font-semibold shadow-md ${
            isPlaying ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-xs sm:text-sm">
            {isPlaying ? (
              <>
                <Pause /> Pause
              </>
            ) : (
              <>
                <Play /> Play
              </>
            )}
          </div>
        </motion.button>

        <audio ref={audioRef} src={STREAM_URL} preload="none" crossOrigin="anonymous" />
      </motion.div>

      {/* --- Incident TTS Panel --- */}
      <motion.div className="mt-6 w-full max-w-md bg-black/40 backdrop-blur-lg p-4 rounded-xl border border-yellow-700 shadow-lg">
        <h2 className="text-center text-yellow-300 font-semibold mb-2 text-sm">🎧 Choose an Incident → Read Aloud</h2>

        <div className="mb-3">
          <label className="text-xs text-gray-200">Select Incident</label>
          <select
            value={selectedIncident?._id || ""}
            onChange={(e) => {
              const inc = incidents.find((i) => i._id === e.target.value);
              setSelectedIncident(inc);
              setVoice("luna"); // incident voice
            }}
            className="w-full bg-black/50 border border-yellow-600 text-yellow-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">-- Choose an incident --</option>
            {incidents.map((i) => (
              <option key={i._id} value={i._id}>
                {i.title} ({i.city}, {i.country})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-200">Voice</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full bg-black/50 border border-yellow-600 text-yellow-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-400"
          >
            <option value="alloy">Alloy (Peace Stories)</option>
            <option value="luna">Luna (Incidents)</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            disabled={loadingTTS || !selectedIncident}
            onClick={() => generateTTS(selectedIncident?.description || selectedIncident?.title)}
            className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg flex items-center justify-center gap-2 text-xs"
          >
            {loadingTTS ? <Loader2 className="animate-spin" /> : <Volume2 />}
            Play Incident
          </button>

          {isTTSPlaying && (
            <button
              onClick={stopTTS}
              className="bg-red-600 hover:bg-red-700 px-4 rounded-lg text-xs"
            >
              Stop
            </button>
          )}
        </div>

        <audio ref={ttsRef} onEnded={() => setIsTTSPlaying(false)} />
      </motion.div>

      {/* Signal Strength */}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-2 sm:h-2.5 w-20 sm:w-28 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-500"
            animate={{ width: `${Math.min(volume, 100)}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <span className="text-[9px] sm:text-xs text-gray-300">Signal</span>
      </div>
    </section>
  );
}
