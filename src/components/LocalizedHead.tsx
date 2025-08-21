import { useTranslation } from 'react-i18next';
import { buildMetaTags, buildHrefLangTags, updateHtmlLang } from '@/utils/seo';
import type { SupportedLanguage } from '@/i18n';
import { useEffect } from 'react';

interface LocalizedHeadProps {
  route?: 'home' | 'faq';
  currentPath?: string;
}

export function LocalizedHead({ route = 'home', currentPath = '/' }: LocalizedHeadProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;
  
  useEffect(() => {
    updateHtmlLang(currentLang);
  }, [currentLang]);

  const metaTags = buildMetaTags(currentLang, route);
  const hrefLangTags = buildHrefLangTags(currentPath);

  return (
    <>
      {/* Base Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      {metaTags.keywords && <meta name="keywords" content={metaTags.keywords} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={metaTags.ogTitle} />
      <meta property="og:description" content={metaTags.ogDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={currentLang} />
      {metaTags.ogImage && <meta property="og:image" content={metaTags.ogImage} />}
      
      {/* Add alternate locales */}
      {['en', 'nl', 'fr', 'de', 'pl', 'sv', 'da']
        .filter(lang => lang !== currentLang)
        .map(lang => (
          <meta key={lang} property="og:locale:alternate" content={lang} />
        ))}
      
      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTags.twitterTitle} />
      <meta name="twitter:description" content={metaTags.twitterDescription} />
      {metaTags.ogImage && <meta name="twitter:image" content={metaTags.ogImage} />}
      
      {/* Hreflang Tags */}
      {hrefLangTags.map(({ href, hreflang }) => (
        <link key={hreflang} rel="alternate" href={href} hrefLang={hreflang} />
      ))}
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://delsolprimehomes.com/${currentLang}${currentPath === '/' ? '/' : currentPath}`} />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="ES-AN" />
      <meta name="geo.placename" content="Costa Del Sol, Spain" />
      <meta name="geo.position" content="36.5105;-4.8803" />
      <meta name="ICBM" content="36.5105, -4.8803" />
      <meta name="robots" content="index,follow" />
    </>
  );
}