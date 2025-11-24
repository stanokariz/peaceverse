import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DarkModeToggle } from "./DarkModeToggle";
import { toast } from "react-hot-toast";
import { Lock, Unlock } from "lucide-react";

export const Header = () => {
  const { user, logout, setAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lockFlipped, setLockFlipped] = useState(false); // For flip animation

  const handleLogout = async () => {
    setLockFlipped(true);
    const res = await logout();
    if (res?.ok) {
      toast.success("Logged out successfully");
      navigate("/");
    }
    setDrawerOpen(false);
    setTimeout(() => setLockFlipped(false), 300); // Reset flip
  };

  const handleLoginClick = () => {
    setLockFlipped(true);
    setAuthModalOpen(true);
    setTimeout(() => setLockFlipped(false), 300); // Reset flip
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

  return (
    <header className="bg-[#074F98] dark:bg-[#074F98] p-3 md:p-2 flex justify-between items-center relative shadow-lg">
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
          <button
            key={link.name}
            onClick={() =>
              link.protected ? handleProtectedLink(link) : navigate(link.to)
            }
            className="text-white font-semibold px-3 py-1 rounded hover:bg-white/20 transition-colors text-sm"
          >
            {link.name}
          </button>
        ))}

        {/* Sun/Moon toggle */}
        <DarkModeToggle />

        {/* Login / Logout Buttons with flipping padlock */}
        {user ? (
          <button onClick={handleLogout} className={buttonClass}>
            <span
              className={`transition-transform duration-300 ${
                lockFlipped ? "rotate-y-180" : ""
              }`}
            >
              <Unlock size={16} stroke="#275432" className="animate-pulse" />
            </span>
            Logout
          </button>
        ) : (
          <button onClick={handleLoginClick} className={buttonClass}>
            <span
              className={`transition-transform duration-300 ${
                lockFlipped ? "rotate-y-180" : ""
              }`}
            >
              <Lock size={16} stroke="#275432" className="animate-pulse" />
            </span>
            Login
          </button>
        )}
      </nav>

      {/* Mobile Menu Button */}
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
        <div className="absolute top-full left-0 w-full bg-[#074F98] dark:bg-[#074F98] p-4 flex flex-col gap-3 z-50 shadow-xl">
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setDrawerOpen(false);
                link.protected ? handleProtectedLink(link) : navigate(link.to);
              }}
              className="text-white font-medium text-left px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors text-sm"
            >
              {link.name}
            </button>
          ))}

          {user ? (
            <button onClick={handleLogout} className={buttonClass + " mt-2"}>
              <span
                className={`transition-transform duration-300 ${
                  lockFlipped ? "rotate-y-180" : ""
                }`}
              >
                <Unlock size={16} stroke="#275432" className="animate-pulse" />
              </span>
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
              <span
                className={`transition-transform duration-300 ${
                  lockFlipped ? "rotate-y-180" : ""
                }`}
              >
                <Lock size={16} stroke="#275432" className="animate-pulse" />
              </span>
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
};
