import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";

// === IMAGES ===
import youth from "../assets/youth.png";
import women from "../assets/women.png";
import governance from "../assets/governance.png";
import peace from "../assets/peace.png";
import food from "../assets/food.png";
import civic from "../assets/civic.png";
import security from "../assets/security.png";

const slides = [
    { image: youth, title: "Youth Empowerment", color: "#facc15", description: "Empowering the next generation through education, leadership, peacebuilding, dialogue, and innovation that address conflict drivers.." },
    { image: women, title: "Women Inclusivity", color: "#ec4899", description: "Advocating for gender inclusion and leadership representation in public decision-making and policy design across African nations. " },
    { image: governance, title: "Good Governance", color: "#3b82f6", description: "Advocating for transparency, accountability, and strong institutions." },
    { image: peace, title: "Peace & Security", color: "#22c55e", description: "Fostering harmony and sustainable peace among African nations." },
    { image: food, title: "Food Sustainability", color: "#f97316", description: "Building resilient communities through agricultural innovation." },
    { image: civic, title: "Civic Education", color: "#8b5cf6", description: "Encouraging active citizenship and participation in governance." },
    { image: security, title: "Security Among Nations", color: "#ef4444", description: "Strengthening cooperation and collective safety across borders." },
];

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    useEffect(() => {
        const timer = setInterval(nextSlide, 7000);
        return () => clearInterval(timer);
    }, [current]);

    const handlers = useSwipeable({
        onSwipedLeft: nextSlide,
        onSwipedRight: prevSlide,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    return (
        <section {...handlers} className="relative w-full h-[80vh] md:h-[85vh] overflow-hidden select-none">
            {/* Background Motion */}
            <motion.img
                key={current}
                src={slides[current].image}
                alt={slides[current].title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: [1.05, 1.1, 1.05] }}
                transition={{
                    opacity: { duration: 1.5, ease: "easeInOut" },
                    scale: { duration: 25, ease: "easeInOut", repeat: Infinity },
                }}
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Overlay layers */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90" />
            <motion.div
                animate={{ opacity: [0.2, 0.55, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-black mix-blend-overlay pointer-events-none"
            />

            {/* Text Overlay */}
            <motion.div
                key={`text-${current}`}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col justify-center items-center text-center px-6"
            >
                <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-wide"
                    style={{ color: slides[current].color }}
                >
                    {slides[current].title}
                </h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.3, delay: 0.3 }}
                    className="text-sm sm:text-base md:text-lg text-gray-100 max-w-2xl drop-shadow-md"
                >
                    {slides[current].description}
                </motion.p>
            </motion.div>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-3 h-3 rounded-full transition-all ${i === current ? "bg-white scale-125 shadow-lg" : "bg-white/40 hover:bg-white/70"
                            }`}
                    />
                ))}
            </div>

            {/* Arrows */}
            <button
                onClick={prevSlide}
                className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 text-white text-4xl opacity-70 hover:opacity-100 transition z-20"
            >
                ‹
            </button>
            <button
                onClick={nextSlide}
                className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 text-white text-4xl opacity-70 hover:opacity-100 transition z-20"
            >
                ›
            </button>
        </section>
    );
}
