import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'full' | 'icon';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'icon', className = '' }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 transition-all text-xs font-bold text-slate-300 ${className}`}
      title={language === 'en' ? "Mudar para Português" : "Switch to English"}
    >
      <span className="text-base">{language === 'en' ? '🇺🇸' : '🇧🇷'}</span>
      {variant === 'full' && (
        <span>{language === 'en' ? 'EN' : 'PT'}</span>
      )}
    </button>
  );
};