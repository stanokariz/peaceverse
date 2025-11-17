import { useState, useEffect } from "react";

export const DarkModeToggle = () => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)} className="p-2 border rounded">
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
};
