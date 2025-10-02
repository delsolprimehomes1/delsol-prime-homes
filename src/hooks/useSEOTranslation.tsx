import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '@/i18n';

interface SEOTranslation {
  title: string;
  description: string;
  keywords: string;
}

type PageKey = 'home' | 'qa' | 'blog' | 'booking';

export const useSEOTranslation = (page: PageKey = 'home'): SEOTranslation => {
  const { t, i18n } = useTranslation('seo');
  
  return {
    title: t(`${page}.title`, { lng: i18n.language }),
    description: t(`${page}.description`, { lng: i18n.language }),
    keywords: t(`${page}.keywords`, { lng: i18n.language }),
  };
};

export const useDynamicSEO = () => {
  const { i18n } = useTranslation();
  
  const updateMetaTags = (seo: SEOTranslation) => {
    // Update title
    document.title = seo.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seo.description);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seo.keywords);
    }
    
    // Update OG title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', seo.title);
    }
    
    // Update OG description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', seo.description);
    }
    
    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', seo.title);
    }
    
    // Update Twitter description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', seo.description);
    }
  };
  
  return { updateMetaTags, currentLanguage: i18n.language as SupportedLanguage };
};
