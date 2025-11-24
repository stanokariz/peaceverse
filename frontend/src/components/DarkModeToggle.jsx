import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const DarkModeToggle = () => {
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      aria-label="Toggle theme"
      className="
        relative w-12 h-12 flex items-center justify-center
        rounded-full transition hover:bg-white/10
        text-white
      "
    >
      {/* Sun (Light Mode) */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{
          transform: dark ? "rotate(180deg) scale(0.5)" : "rotate(0deg) scale(1)",
          opacity: dark ? 0 : 1,
        }}
      >
        <Sun
          size={26}
          strokeWidth={2.2}
          className="text-yellow-300 drop-shadow-[0_0_6px_rgba(255,225,100,0.85)]"
        />
      </span>

      {/* Moon (Dark Mode) */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{
          transform: dark ? "rotate(0deg) scale(1)" : "rotate(-180deg) scale(0.5)",
          opacity: dark ? 1 : 0,
        }}
      >
        <Moon
          size={26}
          strokeWidth={2.2}
          className="text-blue-200 drop-shadow-[0_0_5px_rgba(180,205,255,0.45)]"
        />
      </span>
    </button>
  );
};
