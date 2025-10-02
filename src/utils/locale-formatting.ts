import type { SupportedLanguage } from '@/i18n';

// Currency configuration per locale
export const getCurrencyForLocale = (locale: SupportedLanguage): string => {
  switch (locale) {
    case 'en':
      return 'GBP';
    default:
      return 'EUR';
  }
};

// Date format configuration per locale
export const getDateFormatForLocale = (locale: SupportedLanguage): string => {
  return locale === 'en' ? 'MM/DD/YYYY' : 'DD/MM/YYYY';
};

// Format currency based on locale
export const formatCurrency = (
  amount: number,
  locale: SupportedLanguage,
  options?: Intl.NumberFormatOptions
): string => {
  const currency = getCurrencyForLocale(locale);
  const localeCode = locale === 'en' ? 'en-GB' : `${locale}-${locale.toUpperCase()}`;
  
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency,
    ...options,
  }).format(amount);
};

// Format date based on locale
export const formatDate = (
  date: Date | string,
  locale: SupportedLanguage,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeCode = locale === 'en' ? 'en-GB' : `${locale}-${locale.toUpperCase()}`;
  
  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  }).format(dateObj);
};

// Format numbers based on locale (all use metric)
export const formatNumber = (
  value: number,
  locale: SupportedLanguage,
  options?: Intl.NumberFormatOptions
): string => {
  const localeCode = locale === 'en' ? 'en-GB' : `${locale}-${locale.toUpperCase()}`;
  
  return new Intl.NumberFormat(localeCode, options).format(value);
};

// Format area measurements (all metric - square meters)
export const formatArea = (sqm: number, locale: SupportedLanguage): string => {
  return `${formatNumber(sqm, locale)} m²`;
};

// Get tone/formality level for locale
export const getToneForLocale = (locale: SupportedLanguage): 'formal' | 'casual' => {
  switch (locale) {
    case 'de':
    case 'fr':
      return 'formal';
    case 'en':
    case 'nl':
      return 'casual';
    default:
      return 'formal'; // Default to formal for other languages
  }
};

// Get locale-specific configuration
export interface LocaleConfig {
  currency: string;
  dateFormat: string;
  tone: 'formal' | 'casual';
  measurementSystem: 'metric';
}

export const getLocaleConfig = (locale: SupportedLanguage): LocaleConfig => ({
  currency: getCurrencyForLocale(locale),
  dateFormat: getDateFormatForLocale(locale),
  tone: getToneForLocale(locale),
  measurementSystem: 'metric',
});
