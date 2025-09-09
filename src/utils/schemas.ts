import type { SupportedLanguage } from '@/i18n';

// Generate Article + Question/Answer schema for Q&A detail pages
export const generateQAArticleSchema = (
  qaData: {
    question: string;
    answer_short: string;
    answer_long: string;
    author_name?: string;
    author_url?: string;
    reviewed_at: string;
    created_at: string;
    updated_at: string;
    slug: string;
    language: string;
  },
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  const articleUrl = `${baseUrl}/${qaData.language}/qa/${qaData.slug}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": qaData.question,
    "description": qaData.answer_short,
    "url": articleUrl,
    "datePublished": qaData.created_at,
    "dateModified": qaData.updated_at,
    "author": {
      "@type": "Person",
      "name": qaData.author_name || "DelSolPrimeHomes Expert",
      "url": qaData.author_url || `${baseUrl}/about`
    },
    "publisher": {
      "@type": "Organization",
      "name": "DelSolPrimeHomes",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "mainEntity": {
      "@type": "Question",
      "name": qaData.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qaData.answer_long || qaData.answer_short,
        "author": {
          "@type": "Person", 
          "name": qaData.author_name || "DelSolPrimeHomes Expert"
        },
        "dateCreated": qaData.created_at,
        "upvoteCount": 0
      }
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".short-answer"]
    }
  };
};

// Generate enhanced Speakable schema for voice search optimization
export const generateSpeakableSchema = (question: string, shortAnswer: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".short-answer"],
    "xpath": [
      "//h1[1]",
      "//*[contains(@class, 'short-answer')]"
    ]
  };
};

// Generate enhanced Open Graph data
export const generateOpenGraphData = (
  qaData: {
    question: string;
    answer_short: string;
    slug: string;
    language: string;
    category?: string;
  },
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  const articleUrl = `${baseUrl}/${qaData.language}/qa/${qaData.slug}`;
  
  return {
    'og:type': 'article',
    'og:title': qaData.question,
    'og:description': qaData.answer_short,
    'og:url': articleUrl,
    'og:site_name': 'DelSolPrimeHomes',
    'og:locale': qaData.language === 'en' ? 'en_US' : `${qaData.language}_ES`,
    'og:image': `${baseUrl}/assets/og-image.jpg`,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/jpeg',
    'article:author': 'DelSolPrimeHomes Expert',
    'article:section': qaData.category || 'Property Guide',
    'article:tag': 'Costa del Sol, Property, Real Estate'
  };
};

// Generate Twitter Card data
export const generateTwitterCardData = (
  qaData: {
    question: string;
    answer_short: string;
    slug: string;
    language: string;
  },
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:site': '@DelSolPrimeHomes',
    'twitter:creator': '@DelSolPrimeHomes',
    'twitter:title': qaData.question,
    'twitter:description': qaData.answer_short,
    'twitter:image': `${baseUrl}/assets/twitter-card.jpg`,
    'twitter:image:alt': 'DelSolPrimeHomes - Costa del Sol Property Experts'
  };
};

// Generate canonical and hreflang tags
export const generateCanonicalAndHreflang = (
  slug: string,
  currentLang: string,
  availableLanguages: string[] = ['en', 'es', 'de', 'fr', 'nl'],
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  const canonical = `${baseUrl}/${currentLang}/qa/${slug}`;
  
  const hreflang = availableLanguages.reduce((acc, lang) => {
    acc[lang] = `${baseUrl}/${lang}/qa/${slug}`;
    return acc;
  }, {} as Record<string, string>);
  
  // Add x-default
  hreflang['x-default'] = `${baseUrl}/en/qa/${slug}`;
  
  return { canonical, hreflang };
};