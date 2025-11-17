import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="
        relative 
        w-full 
        py-2 sm:py-3 
        text-center 
        overflow-hidden 
        bg-gradient-to-br from-blue-900 via-green-800 to-yellow-600
        dark:from-[#0a0d12] dark:via-[#0b1a14] dark:to-[#0b101c]
        text-gray-100 
        backdrop-blur-md 
        border-t border-blue-700/20
        m-0 p-0
      "
      style={{ marginTop: 0 }}
    >
      {/* Animated gradient glow overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-400 to-yellow-400 opacity-25 blur-2xl"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: "200% 200%",
        }}
      ></motion.div>

      {/* Glass layer */}
      <div className="absolute inset-0 bg-blue-950/40 dark:bg-blue-950/60 backdrop-blur-xl"></div>

      {/* Footer text */}
      <div className="relative z-10 space-y-0.5">
        <p className="text-sm sm:text-base font-semibold tracking-wide">
          © {new Date().getFullYear()}{" "}
          <span className="text-yellow-400 font-bold">Peaceverse</span> — Building a United Africa 🌍
        </p>
        <p className="text-[11px] sm:text-xs text-gray-300">
          Promoting peace, good governance, and food security across COMESA
        </p>
      </div>

      {/* Subtle animated top edge glow */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-green-400 to-yellow-400"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      ></motion.div>
    </motion.footer>
  );
};

export default Footer;
