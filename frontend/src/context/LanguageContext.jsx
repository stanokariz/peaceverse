// context/LanguageContext.jsx
import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); // default English

  const t = async (text) => {
    if (!text) return "";
    
    if (language === "en") return text; // no translation needed
    
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=en|${language}`
      );
      const data = await res.json();
      return data.responseData.translatedText;
    } catch {
      return text; // fallback
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
