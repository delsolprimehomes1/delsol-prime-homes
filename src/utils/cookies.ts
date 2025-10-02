import type { SupportedLanguage } from '@/i18n';

const COOKIE_NAME = 'language_pref';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export const setCookie = (name: string, value: string, maxAge: number = COOKIE_MAX_AGE): void => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const matches = document.cookie.match(new RegExp(
    `(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`
  ));
  
  return matches ? decodeURIComponent(matches[1]) : null;
};

export const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; max-age=0; path=/`;
};

export const setLanguageCookie = (language: SupportedLanguage): void => {
  setCookie(COOKIE_NAME, language);
};

export const getLanguageCookie = (): SupportedLanguage | null => {
  const value = getCookie(COOKIE_NAME);
  return value as SupportedLanguage | null;
};

export const deleteLanguageCookie = (): void => {
  deleteCookie(COOKIE_NAME);
};
