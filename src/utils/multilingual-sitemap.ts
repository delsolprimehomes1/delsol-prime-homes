import type { SupportedLanguage } from '@/i18n';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: Array<{
    hreflang: string;
    href: string;
  }>;
}

/**
 * Generates multilingual sitemap URLs for Q&A articles
 */
export const generateMultilingualQASitemapUrls = (
  articles: Array<{ slug: string; last_updated?: string; language?: string }>,
  baseUrl: string = 'https://delsolprimehomes.com'
): SitemapUrl[] => {
  const supportedLanguages: SupportedLanguage[] = ['en', 'nl', 'fr', 'de', 'pl', 'sv', 'da'];
  const urls: SitemapUrl[] = [];

  articles.forEach(article => {
    const baseArticleUrl = `${baseUrl}/qa/${article.slug}`;
    const lastmod = article.last_updated || new Date().toISOString().split('T')[0];

    // Create alternates for all languages
    const alternates: Array<{ hreflang: string; href: string }> = supportedLanguages.map(lang => ({
      hreflang: lang,
      href: lang === 'en' ? baseArticleUrl : `${baseArticleUrl}?lang=${lang}`
    }));

    // Add x-default
    alternates.push({
      hreflang: 'x-default',
      href: baseArticleUrl
    });

    // Primary URL (English)
    urls.push({
      loc: baseArticleUrl,
      lastmod,
      changefreq: 'weekly',
      priority: 0.8,
      alternates
    });

    // Language-specific URLs
    supportedLanguages.slice(1).forEach(lang => {
      urls.push({
        loc: `${baseArticleUrl}?lang=${lang}`,
        lastmod,
        changefreq: 'weekly',
        priority: 0.7,
        alternates
      });
    });
  });

  return urls;
};

/**
 * Generates multilingual sitemap URLs for main pages
 */
export const generateMultilingualMainPageUrls = (
  baseUrl: string = 'https://delsolprimehomes.com'
): SitemapUrl[] => {
  const supportedLanguages: SupportedLanguage[] = ['en', 'nl', 'fr', 'de', 'pl', 'sv', 'da'];
  const mainPages = [
    { path: '/', priority: 1.0, changefreq: 'weekly' as const },
    { path: '/qa', priority: 0.9, changefreq: 'daily' as const },
    { path: '/blog', priority: 0.8, changefreq: 'daily' as const },
    { path: '/book-viewing', priority: 0.9, changefreq: 'monthly' as const }
  ];

  const urls: SitemapUrl[] = [];

  mainPages.forEach(page => {
    const basePageUrl = `${baseUrl}${page.path}`;
    
    // Create alternates for all languages
    const alternates: Array<{ hreflang: string; href: string }> = supportedLanguages.map(lang => ({
      hreflang: lang,
      href: lang === 'en' ? basePageUrl : `${basePageUrl}?lang=${lang}`
    }));

    // Add x-default
    alternates.push({
      hreflang: 'x-default',
      href: basePageUrl
    });

    // Primary URL (English)
    urls.push({
      loc: basePageUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority,
      alternates
    });

    // Language-specific URLs
    supportedLanguages.slice(1).forEach(lang => {
      urls.push({
        loc: `${basePageUrl}?lang=${lang}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: page.changefreq,
        priority: page.priority * 0.9, // Slightly lower priority for non-English
        alternates
      });
    });
  });

  return urls;
};

/**
 * Generates complete multilingual sitemap XML
 */
export const generateMultilingualSitemapXML = (
  articles: Array<{ slug: string; last_updated?: string; language?: string }>,
  baseUrl: string = 'https://delsolprimehomes.com'
): string => {
  const qaUrls = generateMultilingualQASitemapUrls(articles, baseUrl);
  const mainUrls = generateMultilingualMainPageUrls(baseUrl);
  const allUrls = [...mainUrls, ...qaUrls];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  allUrls.forEach(url => {
    xml += `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>`;

    // Add hreflang alternates
    if (url.alternates) {
      url.alternates.forEach(alternate => {
        xml += `
    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`;
      });
    }

    xml += `
  </url>`;
  });

  xml += `
</urlset>`;

  return xml;
};

// Additional Phase 3 sitemap functions
export const generateAllLanguageSitemaps = async () => {
  // Mock implementation for Phase 3
  return {
    sitemaps: [],
    sitemapIndex: { sitemaps: [] },
    totalUrls: 0
  };
};

export const writeSitemapFiles = async () => {
  // Mock implementation for Phase 3
  return {
    indexXML: '',
    languageSitemaps: []
  };
};

export const getSitemapStatistics = async () => {
  // Mock implementation for Phase 3
  return {};
};