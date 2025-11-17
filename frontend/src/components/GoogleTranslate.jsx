// components/GoogleTranslate.jsx
import { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    // Prevent multiple script injections
    if (window.googleTranslateLoaded) return;
    window.googleTranslateLoaded = true;

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,sw,fr,ar,am,ha,zu",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE, // simpler layout
        },
        "google_translate_element"
      );
    };
  }, []);

  return (
    <div id="google_translate_element" className="text-black" />
  );
};

export default GoogleTranslate;
