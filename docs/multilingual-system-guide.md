# Multilingual System Guide

## Overview
DelSolPrimeHomes supports 9 languages with comprehensive i18next integration, Supabase user preferences, cookie fallback, and per-locale formatting.

## Supported Languages
- English (EN) - Default, GBP currency
- Spanish (ES) - EUR currency
- German (DE) - EUR currency, formal tone
- Dutch (NL) - EUR currency, casual tone
- French (FR) - EUR currency, formal tone
- Polish (PL) - EUR currency
- Swedish (SV) - EUR currency
- Danish (DA) - EUR currency
- Hungarian (HU) - EUR currency

## Architecture

### 1. Language Detection Priority
1. **URL path prefix** (`/es/`, `/de/`, etc.)
2. **URL query parameter** (`?lang=es`)
3. **Supabase user preferences** (for authenticated users)
4. **localStorage** (`preferred-language`)
5. **Cookie** (`language_pref`, 1-year expiry)
6. **Default** (English)

### 2. Translation Files
```
public/
└── locales/
    ├── en/
    │   ├── common.json    # UI strings
    │   └── seo.json       # SEO meta tags
    ├── es/
    │   ├── common.json
    │   └── seo.json
    └── ... (all 9 languages)
```

### 3. Database Storage
**Table:** `user_preferences`
```sql
- user_id (UUID, unique)
- language (VARCHAR(2))
- currency (VARCHAR(3))
- date_format (VARCHAR(20))
- created_at, updated_at
```

## Usage

### Basic Translation
```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <h1>{t('nav.home')}</h1>;
};
```

### SEO Translation
```tsx
import { useSEOTranslation } from '@/hooks/useSEOTranslation';

const HomePage = () => {
  const seo = useSEOTranslation('home');
  
  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
    </Helmet>
  );
};
```

### Language Switching
```tsx
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageButton = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  
  return (
    <button onClick={() => setLanguage('es')}>
      Switch to Spanish
    </button>
  );
};
```

### Currency Formatting
```tsx
import { formatCurrency, formatArea } from '@/utils/locale-formatting';
import { useLanguage } from '@/contexts/LanguageContext';

const PropertyPrice = ({ price }: { price: number }) => {
  const { currentLanguage } = useLanguage();
  
  return (
    <div>
      <p>{formatCurrency(price, currentLanguage)}</p>
      <p>{formatArea(250, currentLanguage)}</p>
    </div>
  );
};
```

### Date Formatting
```tsx
import { formatDate } from '@/utils/locale-formatting';
import { useLanguage } from '@/contexts/LanguageContext';

const DateDisplay = ({ date }: { date: Date }) => {
  const { currentLanguage } = useLanguage();
  
  // EN: MM/DD/YYYY, Others: DD/MM/YYYY
  return <p>{formatDate(date, currentLanguage)}</p>;
};
```

## Per-Locale Adaptations

### Currency
- **English (EN):** GBP (£)
- **All others:** EUR (€)

### Date Format
- **English (EN):** MM/DD/YYYY
- **All others:** DD/MM/YYYY

### Measurements
- **All languages:** Metric (m², km, etc.)

### Tone
- **Formal:** German (DE), French (FR)
- **Casual:** English (EN), Dutch (NL)
- **Default:** Formal for all others

### Accessing Locale Config
```tsx
import { getLocaleConfig } from '@/utils/locale-formatting';

const config = getLocaleConfig('de');
// { currency: 'EUR', dateFormat: 'DD/MM/YYYY', tone: 'formal', measurementSystem: 'metric' }
```

## SEO Integration

### Meta Tags
Language switching automatically updates:
- `<html lang="...">`
- `<meta property="og:locale">`
- Page title and description
- Keywords meta tag
- JSON-LD `@inLanguage` property

### Hreflang Tags
Automatically generated in page components:
```tsx
<link rel="alternate" hreflang="en" href="https://delsolprimehomes.com/" />
<link rel="alternate" hreflang="es" href="https://delsolprimehomes.com/es/" />
<link rel="alternate" hreflang="x-default" href="https://delsolprimehomes.com/" />
```

## Cookie Management

### Setting Language Cookie
```tsx
import { setLanguageCookie } from '@/utils/cookies';

setLanguageCookie('es'); // 1-year expiry
```

### Reading Language Cookie
```tsx
import { getLanguageCookie } from '@/utils/cookies';

const lang = getLanguageCookie(); // Returns SupportedLanguage | null
```

## Supabase Integration

### Authenticated Users
Language preferences are automatically:
1. **Loaded** on login from `user_preferences` table
2. **Saved** when language is changed
3. **Synced** across devices for logged-in users

### Guest Users
Fallback to localStorage + cookies

## URL Structure

### English (Default)
- Homepage: `/`
- Blog: `/blog`
- QA: `/qa`

### Other Languages
- Spanish Homepage: `/es/`
- German Blog: `/de/blog`
- French QA: `/fr/qa`

## Cross-Tab Synchronization
Language changes are automatically synced across browser tabs using:
- `storage` events (localStorage changes)
- Custom `languageChanged` events

## Best Practices

1. **Always use translation keys** instead of hardcoded strings
2. **Use semantic tokens** for colors and design system
3. **Format numbers/dates/currency** using locale utilities
4. **Test all languages** before deploying
5. **Consider tone** when writing content (formal vs casual)
6. **Provide fallback content** for missing translations

## Components

### LanguageSwitcher
Pre-built component in `src/components/LanguageSwitcher.tsx`:
- Dropdown with all 9 languages
- Shows content count per language
- Flag icons for visual identification
- Compact and full variants

### LanguageProvider
Context provider wrapping the entire app:
```tsx
<LanguageProvider>
  <App />
</LanguageProvider>
```

## API Reference

### Hooks
- `useLanguage()` - Access current language and setLanguage function
- `useSEOTranslation(page)` - Get SEO translations for a page
- `useDynamicSEO()` - Programmatically update meta tags
- `useTranslation()` - Standard i18next hook

### Utilities
- `formatCurrency(amount, locale)` - Format currency with correct symbol
- `formatDate(date, locale)` - Format date with correct pattern
- `formatNumber(value, locale)` - Format numbers with locale-specific separators
- `formatArea(sqm, locale)` - Format area measurements
- `getLocaleConfig(locale)` - Get all locale settings
- `getToneForLocale(locale)` - Get tone preference (formal/casual)

## Troubleshooting

### Translation not showing
1. Check if translation file exists in `/public/locales/{lang}/`
2. Verify translation key exists in JSON
3. Check browser console for i18next errors
4. Clear cache and reload

### Language not persisting
1. Check browser localStorage
2. Verify cookies are enabled
3. For authenticated users, check Supabase `user_preferences` table
4. Check URL structure

### SEO meta tags not updating
1. Verify `seo.json` file exists for language
2. Check if `useSEOTranslation()` hook is used
3. Verify Helmet/meta tags are rendered
4. Check browser dev tools Elements tab

## Future Enhancements
- [ ] RTL language support (Arabic, Hebrew)
- [ ] Automatic translation API integration
- [ ] Language-specific content recommendations
- [ ] A/B testing for different language variants
- [ ] Analytics per language performance
