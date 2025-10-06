import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { type SupportedLanguage } from '@/i18n';
import { supabase } from '@/integrations/supabase/client';
import { setLanguageCookie, getLanguageCookie } from '@/utils/cookies';
import { useToast } from '@/hooks/use-toast';

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
  hu: 0,
  no: 0,
  fi: 0,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [userId, setUserId] = useState<string | null>(null);

  // Detect language from URL, localStorage, cookie, or default to 'en'
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
    
    // Check cookie
    const cookieLang = getLanguageCookie();
    if (cookieLang && contentCounts.hasOwnProperty(cookieLang)) {
      return cookieLang;
    }
    
    // Default to English
    return 'en';
  };

  // Update document meta tags
  const updateDocumentMeta = (language: SupportedLanguage) => {
    document.documentElement.lang = language;
    
    const ogLocaleTag = document.querySelector('meta[property="og:locale"]');
    if (ogLocaleTag) {
      ogLocaleTag.setAttribute('content', `${language}_${language.toUpperCase()}`);
    }
  };

  // Save language preference to Supabase
  const saveLanguageToSupabase = async (language: SupportedLanguage) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          language,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('Error saving language preference:', error);
      }
    } catch (err) {
      console.error('Exception saving language:', err);
    }
  };

  // Get current user and load preferences
  useEffect(() => {
    const initializeUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      if (user?.id) {
        const { data } = await supabase
          .from('user_preferences')
          .select('language')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.language) {
          const dbLang = data.language as SupportedLanguage;
          setCurrentLanguage(dbLang);
          i18n.changeLanguage(dbLang);
          localStorage.setItem('preferred-language', dbLang);
          setLanguageCookie(dbLang);
          updateDocumentMeta(dbLang);
          return;
        }
      }
      
      // If no user preference, detect from other sources
      const detected = detectLanguage();
      setCurrentLanguage(detected);
      i18n.changeLanguage(detected).then(() => {
        console.log(`Language changed to ${detected} and resources loaded`);
      }).catch((error) => {
        console.error('Error loading language resources:', error);
      });
      updateDocumentMeta(detected);
    };
    
    initializeUser();
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
    
    // Save to localStorage
    localStorage.setItem('preferred-language', language);
    
    // Save to cookie (1 year expiry)
    setLanguageCookie(language);
    
    // Change i18n language
    i18n.changeLanguage(language).then(() => {
      console.log(`Language switched to ${language} and resources loaded`);
    }).catch((error) => {
      console.error('Error switching language:', error);
    });

    // Update URL structure: English stays at root, others get language prefix
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    
    // Remove any existing language prefix from path
    const cleanPath = currentPath.replace(/^\/(?:es|de|nl|fr|pl|sv|da|hu|no|fi)/, '') || '/';
    
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
    
    // Update document meta tags
    updateDocumentMeta(language);
    
    // Save to Supabase if user is authenticated
    if (userId) {
      saveLanguageToSupabase(language);
    }
    
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
    const cleanPath = targetPath.replace(/^\/(?:es|de|nl|fr|pl|sv|da|hu|no|fi)/, '') || '/';
    
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
