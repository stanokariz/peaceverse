import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import HeroSlider from "../components/HeroSlider";
import MapComponent from "../components/MapComponent";

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#facc15"]; // blue, green, orange, yellow

const Home = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      boxShadow: [
        `0 0 10px ${colors[0]}, 0 0 20px ${colors[1]}`,
        `0 0 10px ${colors[1]}, 0 0 20px ${colors[2]}`,
        `0 0 10px ${colors[2]}, 0 0 20px ${colors[3]}`,
        `0 0 10px ${colors[3]}, 0 0 20px ${colors[0]}`,
      ],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
      },
    });
  }, [controls]);

  return (
    <div className="relative flex flex-col w-full min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#0d1117] dark:to-[#161b22] text-gray-900 dark:text-gray-100">
      {/* faint background image */}
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
        alt="background pattern"
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
      />

      {/* Hero section */}
      <section className="relative z-10 w-full">
        <HeroSlider />
      </section>

      {/* Map section with animated border */}
      <main className="relative z-10 flex flex-1 justify-center items-center w-full py-12 px-4">
        <motion.div
          animate={controls}
          className="
            w-full max-w-7xl
            min-h-[60vh] md:min-h-[70vh] lg:min-h-[75vh] xl:min-h-[80vh]
            rounded-3xl p-[2px]
            bg-gradient-to-b from-gray-100 dark:from-[#0d1117] to-gray-50 dark:to-[#161b22]
            flex justify-center items-center
          "
        >
          <div className="w-full h-full rounded-3xl overflow-hidden flex justify-center items-center bg-white/40 dark:bg-black/30 backdrop-blur-xl">
            <MapComponent />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
