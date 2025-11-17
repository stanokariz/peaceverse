import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

export default function PeaceRadio({ bgImage = "../../public/radio.jpeg.jpeg" }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [volume, setVolume] = useState(0);
  const [lights, setLights] = useState([false, false, false]);

  const STREAM_URL = "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service";

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

  return (
    <section
      className="fixed top-0 left-0 w-full min-h-screen flex flex-col items-center justify-start
                 text-gray-100 overflow-hidden pt-[4.5rem] sm:pt-[5rem] px-3"
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
        className="relative 
                   w-[80%] sm:w-[65%] md:w-[45%] lg:w-[35%]
                   bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900
                   border-[2px] sm:border-[3px] border-yellow-600 rounded-2xl
                   shadow-2xl p-3 sm:p-4 flex flex-col items-center mx-auto"
        animate={{
          y: isPlaying ? [0, -2, 0] : 0,
          rotate: isPlaying ? [0, 0.4, -0.4, 0] : 0,
        }}
        transition={{
          repeat: isPlaying ? Infinity : 0,
          duration: 3,
          ease: "easeInOut",
        }}
      >
        {/* Antenna + Amber Waves */}
        <motion.div
          className="absolute -top-10 left-1/2 w-1 h-10 bg-gradient-to-t from-gray-600 to-gray-300 origin-bottom"
          animate={{ rotate: isPlaying ? [-3, 3, -3] : 0 }}
          transition={{
            repeat: isPlaying ? Infinity : 0,
            duration: 3,
            ease: "easeInOut",
          }}
        >
          {/* Amber radio waves */}
          {isPlaying &&
            [0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-[-12px] left-1/2 w-[40px] h-[40px] rounded-full border border-amber-400/50"
                style={{ transform: "translateX(-50%)" }}
                animate={{
                  scale: [0.8, 2.2],
                  opacity: [0.5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  delay: i * 0.7,
                  ease: "easeOut",
                }}
              />
            ))}

          {/* Antenna tip */}
          <motion.div
            className="absolute -top-2 left-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg transform -translate-x-1/2"
            animate={{
              scale: isPlaying ? [1, 1.4, 1] : 1,
              opacity: isPlaying ? [1, 0.4, 1] : 0.8,
              boxShadow: isPlaying
                ? [
                    "0 0 6px rgba(255,200,0,0.5)",
                    "0 0 12px rgba(255,180,0,0.8)",
                    "0 0 6px rgba(255,200,0,0.5)",
                  ]
                : "none",
            }}
            transition={{
              repeat: isPlaying ? Infinity : 0,
              duration: 1.2,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Lights */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {lights.map((on, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-md ${on ? "bg-green-400" : "bg-gray-700"}`}
              animate={{ opacity: on ? [1, 0.6, 1] : 0.3 }}
              transition={{ duration: 0.3, repeat: on ? Infinity : 0 }}
            />
          ))}
        </div>

        {/* Speakers */}
        <div className="relative w-full bg-[repeating-linear-gradient(0deg,#111_0px,#111_2px,#222_2px,#222_6px)]
                         rounded-xl py-2 sm:py-3 px-2 shadow-inner border border-amber-800">
          <div className="flex justify-between items-center">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className="w-12 h-12 sm:w-16 sm:h-16 bg-[radial-gradient(circle_at_center,#000_30%,#222_100%)]
                           rounded-full border-2 sm:border-3 border-yellow-700 shadow-inner flex items-center justify-center"
                animate={{
                  scale: [1, 1 + volume / 400, 1],
                  boxShadow: isPlaying
                    ? [
                        "0 0 6px rgba(255,200,0,0.3)",
                        "0 0 15px rgba(255,150,0,0.6)",
                        "0 0 6px rgba(255,200,0,0.3)",
                      ]
                    : "none",
                }}
                transition={{ repeat: isPlaying ? Infinity : 0, duration: 1 }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-gray-700 to-black" />
              </motion.div>
            ))}
          </div>

          {/* Center Display */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                       w-28 sm:w-36 h-6 sm:h-8 bg-black/70 rounded-md border border-yellow-500
                       text-yellow-300 font-mono text-[9px] sm:text-xs flex items-center justify-center shadow-inner"
            animate={{ opacity: isPlaying ? [0.5, 1, 0.5] : 1 }}
            transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.2 }}
          >
            BBC World Service — Peace Wave FM
          </motion.div>
        </div>

        {/* Knobs */}
        <div className="flex justify-around w-full mt-2 mb-2">
          {[3, 2.5].map((duration, i) => (
            <motion.div
              key={i}
              className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-900 rounded-full border-2 border-yellow-400 shadow-inner"
              animate={{ rotate: isPlaying ? [0, 360] : 0 }}
              transition={{ repeat: isPlaying ? Infinity : 0, duration, ease: "linear" }}
            />
          ))}
        </div>

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

        <motion.p
          className="text-[10px] sm:text-xs text-yellow-100 mt-2 text-center"
          animate={{ opacity: isPlaying ? [0.6, 1, 0.6] : 1 }}
          transition={{ repeat: isPlaying ? Infinity : 0, duration: 3 }}
        >
          Streaming peace & unity across Africa 🌍
        </motion.p>

        <audio ref={audioRef} src={STREAM_URL} preload="none" crossOrigin="anonymous" />
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
