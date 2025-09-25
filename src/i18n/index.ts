import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const supportedLanguages = ['en', 'nl', 'fr', 'de', 'pl', 'sv', 'da'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const languageConfig = {
  en: { name: 'English', flag: '🇬🇧' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  sv: { name: 'Svenska', flag: '🇸🇪' },
  da: { name: 'Dansk', flag: '🇩🇰' },
};

// Initialize i18n synchronously to avoid React hook errors
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['cookie', 'localStorage'],
      cookieMinutes: 10080, // 7 days
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
    },

    resources: {
      en: { common: {} },
      nl: { common: {} },
      fr: { common: {} },
      de: { common: {} },
      pl: { common: {} },
      sv: { common: {} },
      da: { common: {} },
    },
    ns: ['common'],
    defaultNS: 'common',
    
    supportedLngs: supportedLanguages,
    load: 'languageOnly',
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;