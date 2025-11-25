import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DarkModeToggle } from "./DarkModeToggle";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

export const Header = () => {
  const { user, logout, setAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [locked, setLocked] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to shrink header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setLocked(false);
    const res = await logout();
    if (res?.ok) {
      toast.success("Logged out successfully");
      navigate("/");
    }
    setDrawerOpen(false);
    setTimeout(() => setLocked(true), 300);
  };

  const handleLoginClick = () => {
    setLocked(true);
    setAuthModalOpen(true);
  };

  const handleProtectedLink = (link) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (link.roles && !link.roles.includes(user.role)) {
      toast.error("Access denied");
      navigate("/");
      return;
    }
    navigate(link.to);
  };

  const links = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    { name: "Peace Radio", to: "/radio" },
    { name: "Analytics", to: "/analytics" },
    { name: "Profile", to: "/profile", protected: true },
    { name: "Share Peace Story", to: "/peace-story", protected: true },
    { name: "Report Incident", to: "/report-incident", protected: true },
    { name: "Reports", to: "/incidents", protected: true },
  ];

  if (user && ["editor", "admin"].includes(user.role)) {
    links.push({ name: "Editor", to: "/editor", protected: true, roles: ["editor", "admin"] });
  }
  if (user?.role === "admin") {
    links.push({ name: "Admin", to: "/admin", protected: true, roles: ["admin"] });
  }

  const buttonClass =
    "px-2 py-0.5 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 dark:bg-[#275432]/50 dark:hover:bg-[#275432]/70 transition-colors transform active:scale-95 flex items-center gap-1 text-xs";

  const linkClass =
    "relative text-white text-xs font-light px-1 py-0.5 cursor-pointer font-sans transition-all duration-300 hover:text-yellow-400 hover:drop-shadow-[0_0_6px_#FFD700] group";

  return (
    <header
      className={`bg-[#074F98] dark:bg-[#275432] fixed top-0 left-0 w-full z-50
    flex items-center shadow-md font-sans transition-all duration-300
    ${scrolled ? "py-1" : "py-2"}`}
    >
      {/* Left: Logo */}
      <div className="cursor-pointer flex items-center gap-1 ml-2 md:ml-4" onClick={() => navigate("/")}>
        <img
          src={logo}
          alt="Peace-Verse Logo"
          className={`object-contain transition-all duration-300 ${scrolled ? "h-6 md:h-7" : "h-7 md:h-8"}`}
        />
        <span className={`text-white font-bold transition-all duration-300 ${scrolled ? "text-sm md:text-base" : "text-base md:text-lg"}`}>
          Peace-Verse
        </span>
      </div>

      {/* Center: Desktop Navigation */}
      <nav className="hidden md:flex flex-1 justify-center gap-1.5 items-center">
        {links.map((link) => (
          <div
            key={link.name}
            onClick={() => (link.protected ? handleProtectedLink(link) : navigate(link.to))}
            className={linkClass + " px-1 py-0.5 text-xs"}
          >
            {link.name}
            <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
          </div>
        ))}
      </nav>

      {/* Right: Dark Mode + Login */}
      <div className="flex items-center gap-1 mr-10 md:mr-4">
        <DarkModeToggle />

        {user ? (
          <button onClick={handleLogout} className={buttonClass}>
            Logout
          </button>
        ) : (
          <button onClick={handleLoginClick} className={buttonClass}>
            Login
          </button>
        )}
      </div>

      {/* Drawer Toggle Button — Now Top Right */}
      <motion.button
        onClick={() => setDrawerOpen(!drawerOpen)}
        animate={{ rotate: drawerOpen ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="md:hidden absolute top-2 right-3 text-white text-2xl font-bold z-50"
      >
        {drawerOpen ? "✕" : "☰"}
      </motion.button>

      {/* Drawer Slide-Down + Backdrop Blur */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Blur backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Slide-down drawer */}
            <motion.div
              key="drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 15,
              }}
              className="absolute top-full left-0 w-full bg-[#074F98] dark:bg-[#275432]
                         p-3 flex flex-col gap-2 shadow-xl z-50 md:hidden overflow-hidden"
            >
              {links.map((link) => (
                <div
                  key={link.name}
                  onClick={() => {
                    setDrawerOpen(false);
                    link.protected ? handleProtectedLink(link) : navigate(link.to);
                  }}
                  className={linkClass + " py-2 px-2 text-sm"}
                >
                  {link.name}
                </div>
              ))}

              <div className="mt-2">
                {user ? (
                  <button onClick={handleLogout} className={buttonClass + " w-full py-1.5"}>
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleLoginClick();
                      setDrawerOpen(false);
                    }}
                    className={buttonClass + " w-full py-1.5"}
                  >
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
