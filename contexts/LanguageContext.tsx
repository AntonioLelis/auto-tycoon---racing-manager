import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TRANSLATIONS, Language } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load from local storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('at_language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'pt')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('at_language', lang);
  };

  /**
   * Translation function.
   * Usage: t('menu.dashboard') -> returns "Dashboard" or "Painel"
   */
  const t = (key: string): string => {
    const keys = key.split('.');
    let current: any = TRANSLATIONS[language];

    for (const k of keys) {
      if (current[k] === undefined) {
        console.warn(`Translation missing for key: ${key} in ${language}`);
        return key; // Fallback to key if not found
      }
      current = current[k];
    }

    return typeof current === 'string' ? current : key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};