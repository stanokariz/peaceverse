import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import CountUp from "react-countup";
import AuthModal from "../pages/AuthModal";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const points = user?.points || 0;

  const [prevPoints, setPrevPoints] = useState(points);
  const [burst, setBurst] = useState(false);

   // Listen for global "openAuthModal" events
  useEffect(() => {
    const openModal = () => setAuthOpen(true);
    window.addEventListener("openAuthModal", openModal);
    return () => window.removeEventListener("openAuthModal", openModal);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Peace Radio", path: "/radio" },
    { name: "Share Peace Story", path: "/peace-story" },
    { name: "Peace Centers", path: "/" },
    { name: "Report Incident", path: "/contact" },
  ];


  // ✅ Close menu on scroll + scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Animate points if they increase
  useEffect(() => {
    if (points > prevPoints) {
      setBurst(true);
      const timer = setTimeout(() => setBurst(false), 1000);
      setPrevPoints(points);
      return () => clearTimeout(timer);
    }
  }, [points, prevPoints]);

  const handleLogoClick = () => {
    setMenuOpen(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* === HEADER === */}
      <motion.header
        animate={{
          background: scrolled
            ? darkMode
              ? "rgba(15,23,42,0.95)"
              : "rgba(0,128,96,0.95)"
            : darkMode
            ? "rgba(15,23,42,0.75)"
            : "rgba(0,128,96,0.75)",
          paddingTop: scrolled ? "0.3rem" : "0.8rem",
          paddingBottom: scrolled ? "0.3rem" : "0.8rem",
          boxShadow: scrolled
            ? "0 4px 12px rgba(0,0,0,0.3)"
            : "0 2px 4px rgba(0,0,0,0.1)",
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 transition-all">
          {/* === LOGO === */}
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 text-white font-bold text-xl md:text-2xl hover:text-yellow-300 transition-all focus:outline-none"
          >
            <motion.span
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🕊️
            </motion.span>
            <motion.span
              className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-yellow-300 shadow-lg"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.8, 1, 0.8],
                boxShadow: [
                  "0 0 10px rgba(255,215,0,0.6)",
                  "0 0 20px rgba(255,215,0,0.9)",
                  "0 0 10px rgba(255,215,0,0.6)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span>Peace-Verse</span>
          </button>

          {/* === NAV (Desktop) === */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-all ${
                  pathname === link.path
                    ? "text-yellow-300 border-b-2 border-yellow-300 pb-1"
                    : "text-white hover:text-yellow-200"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {!user ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-white hover:text-yellow-300 font-semibold transition"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={logout}
                className="text-white hover:text-red-400 font-semibold transition"
              >
                Logout
              </button>
            )}
          </nav>

          {/* === Theme toggle + Points + Mobile === */}
          <div className="flex items-center gap-4 relative">
            {user && (
              <div className="relative">
                <span className="px-3 py-1 bg-yellow-500 text-black font-bold rounded-full shadow-md inline-block">
                  <CountUp start={prevPoints} end={points} duration={1} separator="," />
                </span>
                {burst && (
                  <motion.div
                    key="burst"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute -top-2 -right-2 text-yellow-400 font-bold"
                  >
                    +{points - prevPoints}
                  </motion.div>
                )}
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-black"
              aria-label="Toggle dark/light mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white hover:text-yellow-200 transition focus:outline-none"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* === Mobile Dropdown === */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden ${
                darkMode ? "bg-gray-900/95" : "bg-[#008060]/95"
              } backdrop-blur-xl border-t border-white/10`}
            >
              <ul className="flex flex-col text-center py-4 space-y-4">
                {navLinks.map((link) => (
                  <motion.li
                    key={link.name}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(link.path);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <span
                      className={`block text-lg font-semibold transition-colors ${
                        pathname === link.path
                          ? "text-yellow-300"
                          : "text-white hover:text-yellow-200"
                      }`}
                    >
                      {link.name}
                    </span>
                  </motion.li>
                ))}
                <motion.li whileHover={{ scale: 1.05 }}>
                  {!user ? (
                    <button
                      onClick={() => {
                        setAuthOpen(true);
                        setMenuOpen(false);
                      }}
                      className="text-white hover:text-yellow-300 font-semibold"
                    >
                      Sign In
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="text-white hover:text-red-400 font-semibold"
                    >
                      Logout
                    </button>
                  )}
                </motion.li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ✅ Global Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
