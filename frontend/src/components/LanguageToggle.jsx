// components/LanguageToggle.jsx
import { useLanguage } from "../context/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="px-2 py-1 rounded border"
    >
      <option value="en">English</option>
      <option value="sw">Swahili</option>
      <option value="fr">French</option>
      <option value="ar">Arabic</option>
    </select>
  );
}
