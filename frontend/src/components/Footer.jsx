import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

export const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebookF />, href: "https://www.facebook.com", label: "Facebook", color: "#4267B2" },
    { icon: <FaTwitter />, href: "https://www.twitter.com", label: "Twitter", color: "#1DA1F2" },
    { icon: <FaInstagram />, href: "https://www.instagram.com", label: "Instagram", color: "#C13584" },
    { icon: <FaLinkedinIn />, href: "https://www.linkedin.com", label: "LinkedIn", color: "#0077B5" },
    { icon: <FaWhatsapp />, href: "https://wa.me/1234567890", label: "WhatsApp", color: "#25D366" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="
        w-full
        py-1
        text-center
        bg-[#074F98] dark:bg-[#275432]
        text-gray-100
        border-t border-blue-700/20
        font-sans
        relative
      "
    >
      {/* Footer text */}
      <div className="space-y-0.5 mb-1">
        <p className="text-xs font-semibold tracking-wide">
          © {new Date().getFullYear()} <span className="text-yellow-400 font-bold">Peaceverse</span> — Building a United Africa 🌍
        </p>
        <p className="text-[9px] text-gray-300">
          Promoting peace, good governance, and empowerment for African nations.
        </p>
        <p className="text-[9px] text-white-600">
          Site built and maintained by <span className="text-beige-400 font-bold italic">Diamstan Technologies ltd</span>
        </p>
      </div>

      {/* Social media icons */}
      <div className="flex justify-center gap-1.5 mt-1 relative">
        {socialLinks.map((link, index) => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-white dark:border-[#275432]"
            whileHover={{ scale: 1.05 }}
          >
            {/* Outer glow */}
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 0px ${link.color}` }}
              whileHover={{ boxShadow: `0 0 6px ${link.color}, 0 0 12px ${link.color}` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            ></motion.span>

            {/* Shimmer */}
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at -20% 50%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)`,
                boxShadow: `0 0 3px ${link.color}, 0 0 6px ${link.color}`,
              }}
              animate={{ backgroundPositionX: ["-20%", "120%"] }}
              transition={{ duration: 2.5 + index * 0.2, repeat: Infinity, ease: "linear" }}
            ></motion.span>

            {/* Icon container */}
            <span
              className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full text-sm"
              style={{ backgroundColor: link.color, color: "#fff" }}
            >
              {link.icon}
            </span>
          </motion.a>
        ))}
      </div>
    </motion.footer>
  );
};
