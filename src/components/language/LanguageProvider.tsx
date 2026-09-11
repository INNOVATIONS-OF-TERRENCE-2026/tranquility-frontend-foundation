import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "es";
export type LocalizedCopy = { en: string; es: string };

interface LanguageContextValue {
  language: Language;
  locale: "en-US" | "es-US";
  setLanguage: (language: Language) => void;
  text: (copy: LocalizedCopy) => string;
}

const STORAGE_KEY = "tlc-language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

function initialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "es") return stored;
  return window.navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    setLanguageState(initialLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  function setLanguage(next: Language) {
    setLanguageState(next);
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      locale: language === "es" ? "es-US" : "en-US",
      setLanguage,
      text: (copy) => copy[language],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
