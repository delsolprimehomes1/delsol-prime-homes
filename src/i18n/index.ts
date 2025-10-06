import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const supportedLanguages = ['en', 'es', 'nl', 'fr', 'de', 'pl', 'sv', 'da', 'hu', 'no'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const languageConfig = {
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Español', flag: '🇪🇸' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  sv: { name: 'Svenska', flag: '🇸🇪' },
  da: { name: 'Dansk', flag: '🇩🇰' },
  hu: { name: 'Magyar', flag: '🇭🇺' },
  no: { name: 'Norsk', flag: '🇳🇴' },
};

// Initialize i18n with dynamic loading from public/locales
i18n
  .use(Backend)
  .use(LanguageDetector)  
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: true, // Enable debug to see loading issues
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      allowMultiLoading: false,
      requestOptions: {
        cache: 'no-cache'
      }
    },
    
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },

    ns: ['common', 'seo'],
    defaultNS: 'common',
    preload: supportedLanguages, // Preload all supported languages
    
    supportedLngs: supportedLanguages,
    
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
    
    // Wait for resources to load before initializing
    initImmediate: false,
  });

export default i18n;