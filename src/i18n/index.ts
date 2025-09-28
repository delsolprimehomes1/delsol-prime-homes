import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const supportedLanguages = ['en', 'es', 'nl', 'fr', 'de', 'pl', 'sv', 'da'] as const;
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
};

// Simple synchronous initialization to avoid React hook errors
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },

    resources: {
      en: { 
        common: {
          welcome: 'Welcome',
          loading: 'Loading...'
        } 
      },
      es: { common: {} },
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
    
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: false,
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
  });

export default i18n;