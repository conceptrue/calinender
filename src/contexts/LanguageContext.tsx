"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { nl, en, type Language, type Translations } from "@/i18n";

interface LanguageContextValue {
  language: Language;
  t: Translations;
}

const translations: Record<Language, Translations> = { nl, en };

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  language: Language;
  children: ReactNode;
}

export function LanguageProvider({ language, children }: LanguageProviderProps) {
  const value = useMemo(
    () => ({
      language,
      t: translations[language],
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback to Dutch if used outside provider
    return { language: "nl", t: nl };
  }
  return context;
}
