import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="
        w-full 
        py-2 sm:py-3 
        text-center 
        bg-[#074F98] 
        dark:bg-[#074F98]
        text-gray-100 
        border-t border-blue-700/20
        font-sans
      "
    >
      {/* Footer text */}
      <div className="space-y-0.5">
        <p className="text-sm sm:text-base font-semibold tracking-wide">
          © {new Date().getFullYear()}{" "}
          <span className="text-yellow-400 font-bold">Peaceverse</span> — Building a United Africa 🌍
        </p>
        <p className="text-[11px] sm:text-xs text-gray-300">
          Promoting peace, good governance, and empowerment for African nations.
        </p>
      </div>
    </motion.footer>
  );
};

