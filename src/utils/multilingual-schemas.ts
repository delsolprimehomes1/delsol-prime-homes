import type { SupportedLanguage } from '@/i18n';

export interface MultilingualQAArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  funnel_stage: string;
  topic: string;
  language: SupportedLanguage;
  tags: string[];
  image_url?: string;
  alt_text?: string;
  target_audience?: string;
  intent?: string;
  location_focus?: string;
  parent_id?: string;
  last_updated: string;
  next_step_url?: string;
  next_step_text?: string;
}

/**
 * Generate multilingual FAQ schema with language linking
 */
export function generateMultilingualFAQSchema(
  articles: MultilingualQAArticle[],
  currentLanguage: SupportedLanguage,
  baseUrl: string = 'https://delsolprimehomes.com'
): any {
  const currentLangArticles = articles.filter(a => a.language === currentLanguage);
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${baseUrl}/${currentLanguage}/faq`,
    "inLanguage": currentLanguage,
    "url": `${baseUrl}/${currentLanguage}/faq`,
    "name": "Frequently Asked Questions - Costa del Sol Real Estate",
    "description": "Expert answers to common questions about buying property on the Costa del Sol, Spain",
    "publisher": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "DelSolPrimeHomes",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/${currentLanguage}/qa?search={search_term_string}`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/IOSPlatform",
          "http://schema.org/AndroidPlatform"
        ]
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": currentLangArticles.map(article => ({
      "@type": "Question",
      "@id": `${baseUrl}/${currentLanguage}/qa/${article.slug}#question`,
      "name": article.title,
      "inLanguage": currentLanguage,
      "acceptedAnswer": {
        "@type": "Answer",
        "@id": `${baseUrl}/${currentLanguage}/qa/${article.slug}#answer`,
        "text": article.excerpt,
        "inLanguage": currentLanguage,
        "url": `${baseUrl}/${currentLanguage}/qa/${article.slug}`,
        "author": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        },
        "dateCreated": article.last_updated,
        "upvoteCount": 0
      },
      // Add cross-language linking
      "sameAs": generateSameAsLinks(article, articles, baseUrl),
      "about": {
        "@type": "Thing",
        "name": article.topic,
        "keywords": article.tags?.join(', ')
      },
      "audience": {
        "@type": "Audience",
        "audienceType": article.target_audience || "Property buyers"
      }
    })),
    // Add alternate language versions
    "alternateName": generateAlternateLanguageVersions(currentLanguage, baseUrl)
  };
}

/**
 * Generate enhanced QA article schema with multilingual support
 */
export function generateMultilingualQAArticleSchema(
  article: MultilingualQAArticle,
  relatedArticles: MultilingualQAArticle[],
  baseUrl: string = 'https://delsolprimehomes.com'
): any {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${baseUrl}/${article.language}/qa/${article.slug}`,
    "headline": article.title,
    "inLanguage": article.language,
    "url": `${baseUrl}/${article.language}/qa/${article.slug}`,
    "description": article.excerpt,
    "articleBody": article.content,
    "keywords": article.tags?.join(', '),
    "author": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "DelSolPrimeHomes"
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },
    "datePublished": article.last_updated,
    "dateModified": article.last_updated,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/${article.language}/qa/${article.slug}`
    },
    "image": article.image_url ? {
      "@type": "ImageObject",
      "url": article.image_url,
      "description": article.alt_text || article.title
    } : undefined,
    // Enhanced for AI/LLM consumption
    "mainEntity": {
      "@type": "Question",
      "@id": `${baseUrl}/${article.language}/qa/${article.slug}#question`,
      "name": article.title,
      "inLanguage": article.language,
      "acceptedAnswer": {
        "@type": "Answer",
        "@id": `${baseUrl}/${article.language}/qa/${article.slug}#answer`,
        "text": article.content,
        "inLanguage": article.language,
        "author": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        }
      }
    },
    // Cross-language linking
    "sameAs": generateSameAsLinks(article, relatedArticles, baseUrl),
    "isPartOf": {
      "@type": "FAQPage",
      "@id": `${baseUrl}/${article.language}/faq`
    },
    "about": {
      "@type": "Place",
      "name": article.location_focus || "Costa del Sol, Spain",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 36.5105,
        "longitude": -4.8803
      }
    },
    "audience": {
      "@type": "Audience",
      "audienceType": article.target_audience || "International property buyers",
      "geographicArea": {
        "@type": "Place",
        "name": "United Kingdom, Ireland, Netherlands"
      }
    },
    // Speakable content for voice search
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".qa-question", ".qa-answer"],
      "xpath": [
        "/html/body//h1",
        "/html/body//div[contains(@class, 'qa-content')]//p[1]"
      ]
    }
  };
}

/**
 * Generate same-as links for multilingual versions
 */
function generateSameAsLinks(
  article: MultilingualQAArticle,
  allArticles: MultilingualQAArticle[],
  baseUrl: string
): string[] {
  const relatedArticles = allArticles.filter(a => 
    (a.parent_id === article.parent_id || a.parent_id === article.id || article.parent_id === a.id) && 
    a.language !== article.language
  );

  return relatedArticles.map(a => `${baseUrl}/${a.language}/qa/${a.slug}`);
}

/**
 * Generate alternate language versions for schema
 */
function generateAlternateLanguageVersions(
  currentLanguage: SupportedLanguage,
  baseUrl: string
): { [key: string]: string } {
  const languages: SupportedLanguage[] = ['en', 'nl', 'fr', 'de', 'pl', 'sv', 'da'];
  const alternates: { [key: string]: string } = {};

  languages.forEach(lang => {
    if (lang !== currentLanguage) {
      alternates[lang] = `${baseUrl}/${lang}/faq`;
    }
  });

  return alternates;
}

/**
 * Generate breadcrumb schema with language support
 */
export function generateMultilingualBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  language: SupportedLanguage,
  baseUrl: string = 'https://delsolprimehomes.com'
): any {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "inLanguage": language,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}