import type { SupportedLanguage } from '@/i18n';

// Generate enhanced Article + Question/Answer schema for Q&A detail pages with AI/LLM optimization
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
    topic?: string;
    tags?: string[];
    funnel_stage?: string;
  },
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  const articleUrl = `${baseUrl}/${qaData.language}/qa/${qaData.slug}`;
  
  // Enhanced schema for AI/LLM optimization
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": qaData.question,
    "description": qaData.answer_short,
    "url": articleUrl,
    "datePublished": qaData.created_at,
    "dateModified": qaData.updated_at,
    "inLanguage": qaData.language,
    "author": {
      "@type": "Organization",
      "name": qaData.author_name || "DelSolPrimeHomes Expert",
      "url": qaData.author_url || `${baseUrl}/about`,
      "knowsAbout": [
        "Costa del Sol Real Estate",
        "International Property Investment", 
        "Spanish Property Law",
        "Multilingual Property Services",
        "AI-Powered Property Assistance"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "DelSolPrimeHomes",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      },
      "knowsAbout": [
        "AI Property Assistance",
        "Multilingual Support",
        "Costa del Sol Properties",
        "International Buyer Services"
      ]
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "International Property Buyers",
      "geographicArea": [
        "United Kingdom", "Germany", "Netherlands", 
        "France", "Scandinavia", "North America"
      ]
    },
    "about": [
      {
        "@type": "Thing",
        "name": "AI Property Assistant",
        "description": "Multilingual AI technology for international property buyers"
      },
      {
        "@type": "Place", 
        "name": "Costa del Sol",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "36.5201",
          "longitude": "-4.8773"
        }
      }
    ],
    "keywords": qaData.tags ? qaData.tags.join(", ") : "Costa del Sol, Property, AI Assistant, Multilingual Support",
    "mainEntity": {
      "@type": "Question",
      "name": qaData.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qaData.answer_long || qaData.answer_short,
        "author": {
          "@type": "Organization",
          "name": qaData.author_name || "DelSolPrimeHomes Expert"
        },
        "dateCreated": qaData.created_at,
        "upvoteCount": 0
      },
      "suggestedAnswer": [
        {
          "@type": "Answer",
          "text": qaData.answer_short,
          "name": "Quick Answer"
        }
      ],
      "mentions": [
        {
          "@type": "SoftwareApplication",
          "name": "Multilingual AI Assistant",
          "applicationCategory": "PropertyTech",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
          }
        }
      ]
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [
        "h1", "h2", "h3", 
        ".short-answer", ".quick-answer", 
        ".detailed-content", ".qa-content",
        ".key-benefits", ".feature-list"
      ],
      "xpath": [
        "//h1[1]",
        "//h2[position()<=3]",
        "//*[contains(@class, 'short-answer')]",
        "//*[contains(@class, 'quick-answer')]", 
        "//*[contains(@class, 'key-benefits')]//li",
        "//*[contains(@class, 'feature-list')]//li",
        "//strong[contains(text(), 'multilingual') or contains(text(), 'AI') or contains(text(), 'assistant')]",
        "//p[contains(text(), 'buyers') or contains(text(), 'international')]"
      ]
    }
  };
};

// Generate comprehensive AI/LLM optimized Service schema for multilingual property assistance
export const generateAIServiceSchema = (
  language: string,
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Multilingual AI Property Assistant",
    "description": "AI-powered multilingual support for international property buyers on Costa del Sol",
    "provider": {
      "@type": "Organization",
      "name": "DelSolPrimeHomes"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Costa del Sol, Spain"
    },
    "availableLanguage": [
      "English", "Spanish", "German", "French", 
      "Dutch", "Swedish", "Danish", "Polish"
    ],
    "serviceType": "AI Property Consultation",
    "audience": {
      "@type": "Audience",
      "audienceType": "International Property Buyers"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI Property Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Multilingual Property Search",
            "description": "AI-powered property recommendations in multiple languages"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Legal Process Guidance", 
            "description": "AI assistance with Spanish property law and procedures"
          }
        }
      ]
    }
  };
};

// Generate enhanced Speakable schema for voice search and AI optimization
export const generateSpeakableSchema = (question: string, shortAnswer: string, additionalContext?: {
  topic?: string;
  tags?: string[];
  isAIRelated?: boolean;
}) => {
  const baseSelectors = ["h1", ".short-answer", ".quick-answer"];
  const baseXPaths = [
    "//h1[1]",
    "//*[contains(@class, 'short-answer')]",
    "//*[contains(@class, 'quick-answer')]"
  ];

  // Enhanced selectors for AI-related content
  if (additionalContext?.isAIRelated) {
    baseSelectors.push(
      ".ai-features", ".multilingual-support", 
      ".technology-benefits", ".buyer-personas"
    );
    baseXPaths.push(
      "//*[contains(@class, 'ai-features')]//li",
      "//*[contains(@class, 'multilingual-support')]//p",
      "//strong[contains(text(), 'AI') or contains(text(), 'multilingual')]",
      "//p[contains(text(), 'language') or contains(text(), 'international')]"
    );
  }

  return {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "cssSelector": baseSelectors,
    "xpath": baseXPaths
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