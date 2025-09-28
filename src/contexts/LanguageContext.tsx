import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { type SupportedLanguage } from '@/i18n';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  getContentCount: (language: SupportedLanguage) => number;
  getUrlForLanguage: (language: SupportedLanguage, path?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const contentCounts: Record<SupportedLanguage, number> = {
  en: 191,
  es: 15,
  de: 2,
  nl: 0,
  fr: 0,
  pl: 0,
  sv: 0,
  da: 0,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  // Detect language from URL, localStorage, or default to 'en'
  const detectLanguage = (): SupportedLanguage => {
    // Check URL path for language prefix (/es/, /de/, etc.)
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && contentCounts.hasOwnProperty(pathSegments[0] as SupportedLanguage)) {
      return pathSegments[0] as SupportedLanguage;
    }
    
    // Check URL query parameter (?lang=es)
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && contentCounts.hasOwnProperty(langParam as SupportedLanguage)) {
      return langParam as SupportedLanguage;
    }
    
    // Check localStorage
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && contentCounts.hasOwnProperty(savedLang as SupportedLanguage)) {
      return savedLang as SupportedLanguage;
    }
    
    // Default to English
    return 'en';
  };

  // Initialize language on mount
  useEffect(() => {
    const detected = detectLanguage();
    setCurrentLanguage(detected);
    i18n.changeLanguage(detected);
  }, [i18n]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const detected = detectLanguage();
      setCurrentLanguage(detected);
      i18n.changeLanguage(detected);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [i18n]);

  // Sync across tabs using storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferred-language' && e.newValue) {
        const newLang = e.newValue as SupportedLanguage;
        if (contentCounts.hasOwnProperty(newLang)) {
          setCurrentLanguage(newLang);
          i18n.changeLanguage(newLang);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [i18n]);

  const setLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem('preferred-language', language);

    // Update URL structure: English stays at root, others get language prefix
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    
    // Remove any existing language prefix from path
    const cleanPath = currentPath.replace(/^\/(?:es|de|nl|fr|pl|sv|da)/, '') || '/';
    
    let newUrl: string;
    if (language === 'en') {
      // English: no prefix, clean URL
      const searchParams = new URLSearchParams(currentSearch);
      searchParams.delete('lang');
      const searchString = searchParams.toString();
      newUrl = cleanPath + (searchString ? `?${searchString}` : '');
    } else {
      // Other languages: add prefix
      newUrl = `/${language}${cleanPath}`;
    }

    // Update URL without page reload
    window.history.pushState({}, '', newUrl);
    
    // Dispatch custom event for components that need to react to language changes
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language, path: newUrl } 
    }));
  };

  const getContentCount = (language: SupportedLanguage): number => {
    return contentCounts[language];
  };

  const getUrlForLanguage = (language: SupportedLanguage, path?: string): string => {
    const targetPath = path || window.location.pathname;
    const cleanPath = targetPath.replace(/^\/(?:es|de|nl|fr|pl|sv|da)/, '') || '/';
    
    if (language === 'en') {
      return cleanPath;
    } else {
      return `/${language}${cleanPath}`;
    }
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    setLanguage,
    getContentCount,
    getUrlForLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
