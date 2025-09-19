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

// Real Phase 3 sitemap functions
export const generateAllLanguageSitemaps = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Fetch all published articles
  const { data: articles } = await supabase
    .from('qa_articles')
    .select('id, slug, title, content, language, last_updated, created_at')
    .order('created_at', { ascending: false });
  
  if (!articles) return { sitemaps: [], sitemapIndex: { sitemaps: [] }, totalUrls: 0 };
  
  // Group articles by language
  const languageGroups = articles.reduce((acc, article) => {
    const lang = article.language || 'en';
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);
  
  const baseUrl = 'https://delsolprimehomes.com';
  const sitemaps = [];
  let totalUrls = 0;
  
  // Generate sitemap for each language
  for (const [language, langArticles] of Object.entries(languageGroups)) {
    const urls = generateMultilingualQASitemapUrls(langArticles, baseUrl);
    const mainUrls = generateMultilingualMainPageUrls(baseUrl);
    const allUrls = [...mainUrls, ...urls];
    
    sitemaps.push({
      language,
      urls: allUrls,
      count: allUrls.length,
      xml: generateMultilingualSitemapXML(langArticles, baseUrl)
    });
    
    totalUrls += allUrls.length;
  }
  
  // Generate sitemap index
  const sitemapIndex = {
    sitemaps: sitemaps.map(s => ({
      loc: `${baseUrl}/sitemap-${s.language}.xml`,
      lastmod: new Date().toISOString().split('T')[0]
    }))
  };
  
  return { sitemaps, sitemapIndex, totalUrls };
};

export const writeSitemapFiles = async () => {
  const { sitemaps, sitemapIndex } = await generateAllLanguageSitemaps();
  
  // Generate sitemap index XML
  let indexXML = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  
  sitemapIndex.sitemaps.forEach(sitemap => {
    indexXML += `
  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`;
  });
  
  indexXML += `
</sitemapindex>`;
  
  // Prepare language sitemaps
  const languageSitemaps = sitemaps.map(s => ({
    language: s.language,
    filename: `sitemap-${s.language}.xml`,
    xml: s.xml,
    count: s.count
  }));
  
  return { indexXML, languageSitemaps };
};

export const getSitemapStatistics = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Get article counts by language
  const { data: stats } = await supabase
    .from('qa_articles')
    .select('language, last_updated')
    .order('last_updated', { ascending: false });
  
  if (!stats) return {};
  
  // Group by language and count
  const languageStats = stats.reduce((acc, article) => {
    const lang = article.language || 'en';
    if (!acc[lang]) {
      acc[lang] = { articles: 0, lastUpdate: article.last_updated || new Date().toISOString() };
    }
    acc[lang].articles++;
    return acc;
  }, {} as Record<string, { articles: number; lastUpdate: string }>);
  
  return languageStats;
};