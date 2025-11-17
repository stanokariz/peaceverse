import { motion } from "framer-motion";
import {
  Home,
  BarChart,
  Settings,
  Radio,
  PenLine,
  Menu,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/" },
    { name: "Peace Stories", icon: <PenLine size={18} />, path: "/peace-story" },
    { name: "Peace Radio", icon: <Radio size={18} />, path: "/peace-radio" },
    { name: "Reports", icon: <BarChart size={18} />, path: "/reports" },
    { name: "Settings", icon: <Settings size={18} />, path: "/settings" },
  ];

  return (
    <motion.aside
      animate={{ width: isOpen ? "15rem" : "5rem" }}
      transition={{ type: "spring", stiffness: 90, damping: 16 }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col 
                 bg-gradient-to-b from-[#0e1014] via-[#0c1219] to-[#0a0d12]
                 border-r border-white/10 text-gray-100 shadow-2xl"
    >
      {/* Header + Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 relative">
        {/* Menu Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute right-2 top-3 p-2 rounded-md hover:bg-white/10 transition ${
            !isOpen ? "left-2 right-auto" : ""
          }`}
        >
          <Menu size={22} />
        </button>

        {/* Brand */}
        <h2
          className={`text-xl font-semibold bg-clip-text text-transparent 
                      bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 
                      transition-all duration-300 ${!isOpen && "opacity-0 w-0"}`}
        >
          Peaceverse
        </h2>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-2 mt-6 px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md group transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-blue-600 via-green-500 to-yellow-500 text-white shadow-md"
                  : "hover:bg-white/10 text-gray-300 hover:text-white"
              }`}
            >
              <div
                className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  active ? "text-white" : "text-gray-300"
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-sm font-medium transition-all duration-300 ${
                  !isOpen && "opacity-0 w-0"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
