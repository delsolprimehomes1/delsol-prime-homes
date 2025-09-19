import type { SupportedLanguage } from '@/i18n';

/**
 * Generates hreflang URLs for multilingual SEO
 */
export const generateHreflangUrls = (
  basePath: string,
  supportedLanguages: SupportedLanguage[] = ['en', 'nl', 'fr', 'de', 'pl', 'sv', 'da'],
  baseUrl: string = 'https://delsolprimehomes.com'
): Array<{ href: string; hreflang: string }> => {
  const hreflangs: Array<{ href: string; hreflang: string }> = supportedLanguages.map(lang => ({
    href: `${baseUrl}${basePath}?lang=${lang}`,
    hreflang: lang
  }));

  // Add x-default for the primary language (English)
  hreflangs.push({
    href: `${baseUrl}${basePath}`,
    hreflang: 'x-default'
  });

  return hreflangs;
};

/**
 * Gets the current language from URL parameters or i18n
 */
export const getCurrentLanguageFromUrl = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';
  
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang') as SupportedLanguage;
  
  const supportedLanguages: SupportedLanguage[] = ['en', 'nl', 'fr', 'de', 'pl', 'sv', 'da'];
  
  if (langParam && supportedLanguages.includes(langParam)) {
    return langParam;
  }
  
  return 'en';
};

/**
 * Updates the current URL with a new language parameter
 */
export const updateUrlWithLanguage = (language: SupportedLanguage, path?: string): void => {
  if (typeof window === 'undefined') return;
  
  const currentPath = path || window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set('lang', language);
  
  const newUrl = `${currentPath}?${searchParams.toString()}`;
  window.history.pushState({}, '', newUrl);
};

/**
 * Generates alternate language versions for a given path
 */
export const generateAlternateLanguages = (
  currentPath: string,
  baseUrl: string = 'https://delsolprimehomes.com'
): Record<SupportedLanguage, string> => {
  const languages: SupportedLanguage[] = ['en', 'nl', 'fr', 'de', 'pl', 'sv', 'da'];
  
  return languages.reduce((acc, lang) => {
    acc[lang] = `${baseUrl}${currentPath}?lang=${lang}`;
    return acc;
  }, {} as Record<SupportedLanguage, string>);
};

/**
 * Checks if multilingual content is available for a specific article
 */
export const checkMultilingualAvailability = async (
  articleSlug: string,
  targetLanguage: SupportedLanguage
): Promise<boolean> => {
  // This would typically check the database for translated versions
  // For now, we'll simulate that only English content is available
  return targetLanguage === 'en';
};

/**
 * Redirects to the appropriate language version of a page
 */
export const redirectToLanguageVersion = (
  currentPath: string,
  targetLanguage: SupportedLanguage,
  fallbackPath: string = '/qa'
): void => {
  if (typeof window === 'undefined') return;
  
  // For now, redirect to the QA hub with language parameter
  // In the future, this could check for actual multilingual content
  const targetUrl = `${fallbackPath}?lang=${targetLanguage}`;
  window.location.href = targetUrl;
};

// Additional Phase 3 functions for multilingual SEO
export interface HreflangLinks {
  links: Array<{
    hreflang: string;
    href: string;
  }>;
  canonical: string;
  defaultLanguage: string;
}

// Generate hreflang links for an article
export const generateHreflangLinks = (
  slug: string, 
  availableLanguages: string[], 
  currentLanguage: string = 'en'
): HreflangLinks => {
  const baseUrl = 'https://delsolprimehomes.com';
  const links: Array<{ hreflang: string; href: string }> = [];
  
  availableLanguages.forEach(lang => {
    const href = lang === 'en' 
      ? `${baseUrl}/qa/${slug}`
      : `${baseUrl}/qa/${lang}/${slug}`;
    
    links.push({
      hreflang: lang,
      href
    });
  });
  
  // Add x-default link (English)
  links.push({
    hreflang: 'x-default',
    href: `${baseUrl}/qa/${slug}`
  });
  
  const canonical = currentLanguage === 'en'
    ? `${baseUrl}/qa/${slug}`
    : `${baseUrl}/qa/${currentLanguage}/${slug}`;
  
  return {
    links,
    canonical,
    defaultLanguage: 'en'
  };
};

// Generate sameAs URLs for JSON-LD
export const generateSameAsURLs = (slug: string, availableLanguages: string[]): string[] => {
  const baseUrl = 'https://delsolprimehomes.com';
  const sameAsURLs: string[] = [];
  
  availableLanguages.forEach(lang => {
    const url = lang === 'en' 
      ? `${baseUrl}/qa/${slug}`
      : `${baseUrl}/qa/${lang}/${slug}`;
    sameAsURLs.push(url);
  });
  
  return sameAsURLs;
};

// Generate OpenGraph locale tags
export const generateOpenGraphLocales = (availableLanguages: string[]): string[] => {
  const localeMap: Record<string, string> = {
    'en': 'en_GB',
    'es': 'es_ES',
    'de': 'de_DE',
    'nl': 'nl_NL',
    'fr': 'fr_FR'
  };
  
  return availableLanguages.map(lang => localeMap[lang] || localeMap['en']);
};