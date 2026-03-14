// src/components/chat/LanguageSelector.tsx

import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: '??????' },
  { code: 'mr', name: '?????' },
  { code: 'ta', name: '?????' },
  { code: 'te', name: '??????' },
  { code: 'bn', name: '?????' },
  { code: 'kn', name: '?????' },
  { code: 'gu', name: '???????' },
];

export const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
      <Globe className="h-4 w-4 text-accent-green" />
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="bg-transparent text-xs font-bold text-text-secondary focus:outline-none cursor-pointer"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-bg-card text-text-primary">
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
