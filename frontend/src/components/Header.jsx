import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DarkModeToggle } from "./DarkModeToggle";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export const Header = () => {
  const { user, logout, setAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [locked, setLocked] = useState(true);

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
    "px-3 py-1 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-colors transform active:scale-95 flex items-center gap-2 text-sm";

  const linkClass =
    "relative text-white text-sm font-light px-2 py-1 cursor-pointer font-sans transition-all duration-300 hover:text-yellow-400 hover:drop-shadow-[0_0_6px_#FFD700] group";

  return (
    <header className="bg-[#074F98] dark:bg-[#074F98] p-3 md:p-2 flex justify-between items-center relative shadow-lg font-sans">
      {/* Logo */}
      <div
        className="text-xl md:text-2xl font-bold text-white cursor-pointer flex items-center gap-2"
        onClick={() => navigate("/")}
      >
        <span className="text-3xl">🌿</span> Peace-Verse
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-4 items-center">
        {links.map((link) => (
          <div
            key={link.name}
            onClick={() =>
              link.protected ? handleProtectedLink(link) : navigate(link.to)
            }
            className={linkClass}
          >
            {link.name}
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
          </div>
        ))}

        {/* Sun/Moon toggle */}
        <DarkModeToggle />

        {/* Login / Logout */}
        {user ? (
          <button onClick={handleLogout} className={buttonClass}>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#275432"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ d: locked ? lockPaths.locked : lockPaths.unlocked }}
            >
              <motion.path d={locked ? lockPaths.locked : lockPaths.unlocked} />
            </motion.svg>
            Logout
          </button>
        ) : (
          <button onClick={handleLoginClick} className={buttonClass}>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#275432"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ d: locked ? lockPaths.locked : lockPaths.unlocked }}
            >
              <motion.path d={locked ? lockPaths.locked : lockPaths.unlocked} />
            </motion.svg>
            Login
          </button>
        )}
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center gap-2">
        <DarkModeToggle />
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="text-white text-2xl font-bold"
        >
          ☰
        </button>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="absolute top-full left-0 w-full bg-[#074F98] dark:bg-[#074F98] p-4 flex flex-col gap-2 z-50 shadow-xl">
          {links.map((link) => (
            <div
              key={link.name}
              onClick={() => {
                setDrawerOpen(false);
                link.protected ? handleProtectedLink(link) : navigate(link.to);
              }}
              className={linkClass + " py-2"}
            >
              {link.name}
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </div>
          ))}

          {user ? (
            <button onClick={handleLogout} className={buttonClass + " mt-2"}>
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#275432"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ d: locked ? lockPaths.locked : lockPaths.unlocked }}
              >
                <motion.path d={locked ? lockPaths.locked : lockPaths.unlocked} />
              </motion.svg>
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                handleLoginClick();
                setDrawerOpen(false);
              }}
              className={buttonClass + " mt-2"}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#275432"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ d: locked ? lockPaths.locked : lockPaths.unlocked }}
              >
                <motion.path d={locked ? lockPaths.locked : lockPaths.unlocked} />
              </motion.svg>
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
};

// Padlock SVG paths
const lockPaths = {
  locked:
    "M12 17h8a2 2 0 002-2v-5a2 2 0 00-2-2h-8a2 2 0 00-2 2v5a2 2 0 002 2z M16 9V7a4 4 0 10-8 0v2",
  unlocked:
    "M12 17h8a2 2 0 002-2v-5a2 2 0 00-2-2h-8a2 2 0 00-2 2v5a2 2 0 002 2z M16 9V7a4 4 0 10-4 4h4",
};
