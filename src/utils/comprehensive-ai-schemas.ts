import type { SupportedLanguage } from '@/i18n';

interface QAArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  funnel_stage: string;
  topic: string;
  language?: string;
  tags?: string[];
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
 * Generate maximal AI/LLM discovery schema for individual articles
 */
export function generateMaximalAISchema(
  article: QAArticle,
  relatedArticles: QAArticle[] = [],
  baseUrl: string = 'https://delsolprimehomes.com'
): any {
  return [
    // Primary QA Page Schema
    {
      "@context": "https://schema.org",
      "@type": ["QAPage", "Article", "WebPage"],
      "@id": `${baseUrl}/qa/${article.slug}`,
      "url": `${baseUrl}/qa/${article.slug}`,
      "name": article.title,
      "headline": article.title,
      "description": article.excerpt,
      "inLanguage": article.language || "en",
      "keywords": article.tags?.join(', '),
      "datePublished": article.last_updated,
      "dateModified": article.last_updated,
      
      "author": {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "DelSolPrimeHomes Expert Team",
        "url": baseUrl,
        "expertise": [
          "Costa del Sol Real Estate",
          "International Property Investment",
          "Spanish Property Law",
          "Expatriate Relocation"
        ],
        "knowsAbout": [
          "AI Property Assistance",
          "Multilingual Real Estate Support",
          "Costa del Sol Market Analysis",
          "Property Investment Strategy"
        ]
      },
      
      "publisher": {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "DelSolPrimeHomes",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+34-952-123-456",
          "contactType": "Customer Service",
          "availableLanguage": ["en", "es", "de", "fr", "nl"]
        }
      },

      "mainEntity": {
        "@type": "Question",
        "@id": `${baseUrl}/qa/${article.slug}#question`,
        "name": article.title,
        "inLanguage": article.language || "en",
        "keywords": article.tags?.join(', '),
        "about": {
          "@type": "Place",
          "name": article.location_focus || "Costa del Sol, Spain",
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 36.5105,
            "longitude": -4.8803
          },
          "containedInPlace": {
            "@type": "AdministrativeArea",
            "name": "Andalusia, Spain"
          }
        },
        "acceptedAnswer": {
          "@type": "Answer",
          "@id": `${baseUrl}/qa/${article.slug}#answer`,
          "text": article.content.replace(/<[^>]*>/g, '').substring(0, 2000),
          "inLanguage": article.language || "en",
          "author": {
            "@type": "Organization",
            "@id": `${baseUrl}/#organization`
          },
          "dateCreated": article.last_updated,
          "upvoteCount": 0,
          "url": `${baseUrl}/qa/${article.slug}`
        }
      },

      "about": [
        {
          "@type": "Place",
          "name": article.location_focus || "Costa del Sol, Spain",
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 36.5105,
            "longitude": -4.8803
          }
        },
        {
          "@type": "Thing",
          "name": article.topic,
          "sameAs": `${baseUrl}/qa?topic=${encodeURIComponent(article.topic)}`
        }
      ],

      "audience": {
        "@type": "Audience",
        "audienceType": article.target_audience || "International Property Buyers",
        "geographicArea": [
          {
            "@type": "Place",
            "name": "United Kingdom"
          },
          {
            "@type": "Place", 
            "name": "Ireland"
          },
          {
            "@type": "Place",
            "name": "Netherlands"
          },
          {
            "@type": "Place",
            "name": "Germany"
          }
        ]
      },

      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [
          "h1",
          "h2",
          ".quick-answer",
          ".short-answer",
          ".key-takeaways",
          ".speakable",
          "[data-speakable='true']"
        ],
        "xpath": [
          "//h1[1]",
          "//h2[position()<=3]",
          "//*[contains(@class, 'quick-answer') or contains(@class, 'short-answer')]",
          "//*[@data-speakable='true']",
          "//p[position()<=3 and string-length(.) > 50 and string-length(.) < 200]"
        ]
      },

      "potentialAction": [
        {
          "@type": "ReadAction",
          "target": `${baseUrl}/qa/${article.slug}`
        },
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/qa?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        {
          "@type": "ViewAction",
          "target": `${baseUrl}/book-viewing`
        }
      ],

      "mentions": [
        {
          "@type": "SoftwareApplication",
          "name": "AI Property Assistant",
          "applicationCategory": "PropertyTech"
        },
        {
          "@type": "Place",
          "name": "Costa del Sol",
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 36.5105,
            "longitude": -4.8803
          }
        }
      ],

      "citation": [
        {
          "@type": "WebPage",
          "url": `${baseUrl}/qa/${article.slug}`,
          "name": article.title,
          "author": "DelSolPrimeHomes Expert Team"
        }
      ],

      "isPartOf": {
        "@type": "FAQPage",
        "@id": `${baseUrl}/faq`,
        "name": "Costa del Sol Property FAQ Hub",
        "url": `${baseUrl}/faq`
      },

      // Cross-language linking
      "sameAs": generateSameAsLinks(article, relatedArticles, baseUrl),
      
      // AI Assistant Integration
      "assistantIntegration": {
        "citationReady": true,
        "voiceSearchOptimized": true,
        "multilingualSupport": true,
        "realTimeUpdates": true
      }
    },

    // Enhanced FAQ Hub Reference
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${baseUrl}/faq#hub`,
      "name": "AI-Enhanced Costa del Sol Property FAQ Hub",
      "description": "Comprehensive multilingual property guidance with AI-powered insights for international buyers",
      "url": `${baseUrl}/faq`,
      "inLanguage": article.language || "en",
      "about": {
        "@type": "Place",
        "name": "Costa del Sol, Spain"
      },
      "hasPart": {
        "@type": "Question",
        "@id": `${baseUrl}/qa/${article.slug}#question`,
        "name": article.title
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/qa?search={search_term_string}`,
          "actionPlatform": [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/IOSPlatform",
            "http://schema.org/AndroidPlatform"
          ]
        },
        "query-input": "required name=search_term_string"
      }
    }
  ];
}

/**
 * Generate comprehensive multilingual FAQ hub schema
 */
export function generateComprehensiveFAQHubSchema(
  articles: QAArticle[],
  language: string = 'en',
  baseUrl: string = 'https://delsolprimehomes.com'
): any {
  const currentLangArticles = articles.filter(a => (a.language || 'en') === language);
  
  // Group articles by topic for better organization
  const topicGroups = currentLangArticles.reduce((acc, article) => {
    const topic = article.topic || 'General';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(article);
    return acc;
  }, {} as Record<string, QAArticle[]>);

  return {
    "@context": "https://schema.org",
    "@type": ["FAQPage", "CollectionPage", "WebPage"],
    "@id": `${baseUrl}/${language}/faq`,
    "url": `${baseUrl}/${language}/faq`,
    "name": "AI-Enhanced Costa del Sol Property FAQ Hub",
    "description": "Comprehensive multilingual property guidance with AI-powered insights for international buyers on Costa del Sol",
    "inLanguage": language,
    "isAccessibleForFree": true,

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

    "mainEntity": currentLangArticles.map(article => ({
      "@type": "Question",
      "@id": `${baseUrl}/qa/${article.slug}#question`,
      "name": article.title,
      "inLanguage": language,
      "keywords": article.tags?.join(', '),
      "acceptedAnswer": {
        "@type": "Answer",
        "@id": `${baseUrl}/qa/${article.slug}#answer`,
        "text": article.excerpt,
        "inLanguage": language,
        "url": `${baseUrl}/qa/${article.slug}`,
        "author": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        },
        "dateCreated": article.last_updated,
        "upvoteCount": 0
      },
      "about": {
        "@type": "Thing",
        "name": article.topic,
        "keywords": article.tags?.join(', ')
      },
      "audience": {
        "@type": "Audience",
        "audienceType": article.target_audience || "International Property Buyers"
      },
      "sameAs": generateSameAsLinks(article, articles, baseUrl)
    })),

    "about": {
      "@type": "Place",
      "name": "Costa del Sol, Spain",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 36.5105,
        "longitude": -4.8803
      },
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "Andalusia, Spain"
      }
    },

    "audience": {
      "@type": "Audience",
      "audienceType": "International Property Buyers",
      "geographicArea": [
        "United Kingdom",
        "Ireland", 
        "Netherlands",
        "Germany",
        "France",
        "Belgium",
        "Sweden",
        "Denmark"
      ]
    },

    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/${language}/qa?search={search_term_string}`,
          "actionPlatform": [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/IOSPlatform",
            "http://schema.org/AndroidPlatform"
          ]
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "ReadAction",
        "target": `${baseUrl}/${language}/faq`
      }
    ],

    "hasPart": Object.entries(topicGroups).map(([topic, topicArticles]) => ({
      "@type": "WebPageElement",
      "name": `${topic} Questions`,
      "description": `Frequently asked questions about ${topic.toLowerCase()} on Costa del Sol`,
      "mainEntity": topicArticles.map(article => ({
        "@type": "Question",
        "@id": `${baseUrl}/qa/${article.slug}#question`,
        "name": article.title
      }))
    })),

    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [
        "h1",
        "h2",
        ".faq-question",
        ".quick-answer",
        ".short-answer", 
        ".speakable"
      ],
      "xpath": [
        "//h1[1]",
        "//h2[position()<=5]",
        "//*[contains(@class, 'faq-question')]",
        "//*[@data-speakable='true']"
      ]
    },

    // Multilingual linking
    "alternateName": generateAlternateLanguageVersions(language as SupportedLanguage, baseUrl),

    // AI Discovery Enhancement
    "additionalType": [
      "https://schema.org/FAQPage",
      "https://schema.org/KnowledgeBase"
    ],

    "mentions": [
      {
        "@type": "SoftwareApplication",
        "name": "AI Property Assistant",
        "applicationCategory": "PropertyTech",
        "operatingSystem": "Web Browser"
      },
      {
        "@type": "Place",
        "name": "Costa del Sol",
        "alternateName": ["Málaga Coast", "Sun Coast"]
      }
    ],

    // Content freshness signals
    "dateModified": new Date().toISOString().split('T')[0],
    "contentSize": `${currentLangArticles.length} questions answered`,
    
    // AI/LLM specific metadata
    "aiOptimized": true,
    "voiceSearchReady": true,
    "citationReady": true,
    "multilingualSupport": true
  };
}

/**
 * Generate same-as links for multilingual versions
 */
function generateSameAsLinks(
  article: QAArticle,
  allArticles: QAArticle[],
  baseUrl: string
): string[] {
  const relatedArticles = allArticles.filter(a => 
    (a.parent_id === article.parent_id || a.parent_id === article.id || article.parent_id === a.id) && 
    (a.language || 'en') !== (article.language || 'en')
  );

  return relatedArticles.map(a => `${baseUrl}/${a.language || 'en'}/qa/${a.slug}`);
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