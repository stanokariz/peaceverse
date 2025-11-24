import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DarkModeToggle } from "./DarkModeToggle";
import { toast } from "react-hot-toast";

export const Header = () => {
  const { user, logout, setAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    const res = await logout();
    if (res?.ok) {
      toast.success("Logged out successfully");
      navigate("/");
    }
    setDrawerOpen(false);
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

  return (
    <header
      className="
        bg-[#074F98]
        dark:bg-[#074F98]
        p-3 md:p-2
        flex justify-between items-center relative shadow-lg
      "
    >
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
            className="text-white font-semibold px-3 py-1 rounded hover:bg-white/20 transition-colors"
          >
            {link.name}
          </button>
        ))}

        <DarkModeToggle />

        {/* Logout Button */}
        {user ? (
          <button
            onClick={handleLogout}
            className="
              px-4 py-2 rounded-lg font-semibold text-white
              bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400
              animate-flashBorderFast shadow-md
              hover:scale-105 transition-transform
            "
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="
              px-4 py-2 rounded-lg font-semibold text-blue-900
              bg-gradient-to-r from-yellow-200 via-white to-blue-200
              animate-flashBorderFast shadow-md
              hover:scale-110 transition-transform
            "
          >
            Login / Signup
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
        <div
          className="
            absolute top-full left-0 w-full
            bg-[#074F98]
            dark:bg-[#074F98]
            p-4 flex flex-col gap-3 z-50 shadow-xl
          "
        >
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setDrawerOpen(false);
                link.protected ? handleProtectedLink(link) : navigate(link.to);
              }}
              className="
                text-white font-medium text-left px-3 py-2 rounded
                bg-white/10 hover:bg-white/20 transition-colors
                animate-flashBorderFast
              "
            >
              {link.name}
            </button>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="
                bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400
                text-white px-4 py-2 rounded-lg mt-2 font-semibold
                animate-flashBorderFast
              "
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthModalOpen(true);
                setDrawerOpen(false);
              }}
              className="
                bg-gradient-to-r from-yellow-200 via-white to-blue-200
                text-blue-900 px-4 py-2 rounded-lg font-semibold mt-2
                animate-flashBorderFast
              "
            >
              Login / Signup
            </button>
          )}
        </div>
      )}
    </header>
  );
};
