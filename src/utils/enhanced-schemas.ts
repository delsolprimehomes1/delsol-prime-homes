import type { SupportedLanguage } from '@/i18n';

// Enhanced Schema Types for AI/LLM Optimization
interface QAArticle {
  id: string;
  slug: string;
  title: string;
  content?: string;
  excerpt: string;
  funnel_stage: string;
  topic: string;
  city?: string;
  language?: string;
  tags?: string[];
  last_updated?: string;
  created_at?: string;
  next_step_url?: string;
  next_step_text?: string;
}

// Phase 1: Enhanced FAQ Schema with AI Citation Optimization
export const generateComprehensiveFAQSchema = (
  articles: QAArticle[],
  language: string = 'en',
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  const totalWordCount = articles.reduce((sum, article) => sum + (article.content?.split(' ').length || 0), 0);
  const avgReadingTime = Math.ceil(totalWordCount / (200 * articles.length)); // 200 words per minute average

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "Costa del Sol Property FAQ Hub - AI-Enhanced Expert Guide",
    "description": "Comprehensive AI-optimized FAQ with 68+ expert answers about Costa del Sol property investment. Multilingual support for international buyers with structured data for voice search and LLM citation.",
    "inLanguage": language,
    "url": `${baseUrl}/qa`,
    "datePublished": new Date(Math.min(...articles.map(a => new Date(a.created_at || Date.now()).getTime()))).toISOString(),
    "dateModified": new Date().toISOString(),
    "lastReviewed": new Date().toISOString().split('T')[0],
    "isAccessibleForFree": true,
    "wordCount": totalWordCount,
    "timeRequired": `PT${avgReadingTime}M`,
    "reviewedBy": {
      "@type": "Organization", 
      "@id": `${baseUrl}/#organization`,
      "name": "DelSolPrimeHomes Expert Team"
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "copyrightHolder": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },
    "about": [
      {
        "@type": "Place",
        "name": "Costa del Sol",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "36.5201",
          "longitude": "-4.8773"
        },
        "containedInPlace": {
          "@type": "Country",
          "name": "Spain"
        }
      },
      {
        "@type": "Service",
        "name": "AI Property Assistant",
        "description": "Multilingual AI technology for property guidance"
      }
    ],
    "audience": {
      "@type": "Audience",
      "audienceType": "International Property Buyers",
      "geographicArea": [
        "United Kingdom", "Ireland", "Germany", "Netherlands", 
        "France", "Sweden", "Denmark", "Poland", "North America"
      ]
    },
    "mainEntity": articles.map(article => ({
      "@type": "Question",
      "@id": `${baseUrl}/qa/${article.slug}#question`,
      "name": article.title,
      "url": `${baseUrl}/qa/${article.slug}`,
      "dateCreated": article.created_at,
      "dateModified": article.last_updated,
      "audience": {
        "@type": "Audience",
        "audienceType": getFunnelStageAudience(article.funnel_stage)
      },
      "about": [
        {
          "@type": "Place",
          "name": article.city
        },
        {
          "@type": "Thing", 
          "name": article.topic
        }
      ],
      "acceptedAnswer": {
        "@type": "Answer",
        "@id": `${baseUrl}/qa/${article.slug}#answer`,
        "text": article.excerpt,
        "author": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        },
        "dateCreated": article.created_at || new Date().toISOString(),
        "upvoteCount": 0,
        "url": `${baseUrl}/qa/${article.slug}`
      },
      "mentions": article.tags?.map(tag => ({
        "@type": "Thing",
        "name": tag
      })) || [],
      "isPartOf": {
        "@type": "FAQPage",
        "@id": `${baseUrl}/qa`
      }
    })),
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [
        "h1", "h2", "h3", ".question-title", ".short-answer", ".key-answer",
        ".qa-card h3", ".topic-cluster-title", ".stage-description", 
        ".ai-optimized", ".voice-friendly", ".quick-facts", ".essential-info",
        ".speakable", "[data-speakable='true']", ".faq-answer-summary"
      ],
      "xpath": [
        "//h1[1]",
        "//h2[contains(@class, 'topic-title') or contains(@class, 'cluster-title')]",
        "//*[contains(@class, 'question-title') or contains(@class, 'qa-title')]",
        "//*[contains(@class, 'short-answer') or contains(@class, 'key-answer')]",
        "//div[contains(@class, 'qa-card')]//h3",
        "//*[contains(@class, 'quick-facts')]//li[position()<=3]",
        "//*[contains(@class, 'essential-info')]//p[position()<=2]",
        "//strong[contains(text(), 'Important:') or contains(text(), 'Key:')]",
        "//*[contains(text(), 'Costa del Sol') or contains(text(), 'property') or contains(text(), 'buying') or contains(text(), 'investment')]",
        "//div[contains(@class, 'ai-optimized') or @data-speakable='true']"
      ]
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/qa?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "ReadAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/qa/{article_slug}`
        }
      }
    ]
  };
};

// Phase 2: Enhanced Individual Article Schema with AI Optimization
export const generateEnhancedQAArticleSchema = (
  article: QAArticle,
  relatedArticles: QAArticle[] = [],
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${baseUrl}/qa/${article.slug}#article`,
        "headline": article.title,
        "description": article.excerpt,
        "url": `${baseUrl}/qa/${article.slug}`,
        "datePublished": article.created_at || new Date().toISOString(),
        "dateModified": article.last_updated || new Date().toISOString(),
        "inLanguage": article.language || 'en',
        "wordCount": article.content ? article.content.split(' ').length : 0,
        "author": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        },
        "publisher": {
          "@type": "Organization", 
          "@id": `${baseUrl}/#organization`
        },
        "reviewedBy": {
          "@type": "Person",
          "name": "Carlos Mendez",
          "jobTitle": "Financial Compliance Auditor",
          "credential": "Certified Financial Planner (CFP)"
        },
        "areaServed": [
          {
            "@type": "City",
            "name": "Marbella",
            "containedInPlace": {
              "@type": "AdministrativeArea",
              "name": "Málaga"
            }
          },
          {
            "@type": "City",
            "name": "Estepona",
            "containedInPlace": {
              "@type": "AdministrativeArea",
              "name": "Málaga"
            }
          },
          {
            "@type": "City",
            "name": "Fuengirola",
            "containedInPlace": {
              "@type": "AdministrativeArea",
              "name": "Málaga"
            }
          }
        ],
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${baseUrl}/qa/${article.slug}#webpage`
        },
        "about": [
          {
            "@type": "Place",
            "name": article.city || "Costa del Sol",
            "containedInPlace": {
              "@type": "AdministrativeArea", 
              "name": "Andalusia, Spain"
            }
          },
          {
            "@type": "Thing",
            "name": article.topic,
            "sameAs": getTopicReference(article.topic)
          }
        ],
        "mentions": [
          {
            "@type": "SoftwareApplication",
            "name": "AI Property Assistant",
            "applicationCategory": "PropertyTech",
            "operatingSystem": "Web Browser"
          },
          ...article.tags?.map(tag => ({
            "@type": "Thing",
            "name": tag
          })) || []
        ],
        "citation": relatedArticles.map(related => ({
          "@type": "CreativeWork",
          "name": related.title,
          "url": `${baseUrl}/qa/${related.slug}`
        })),
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [
            "h1", "h2", "h3", ".short-answer", ".quick-answer",
            ".detailed-content", ".qa-content", ".key-points li"
          ],
          "xpath": [
            "//h1[1]",
            "//h2[position()<=3]",
            "//*[contains(@class, 'short-answer')]",
            "//*[contains(@class, 'detailed-content')]//p[position()<=3]",
            "//strong[contains(text(), 'important') or contains(text(), 'key')]",
            "//li[contains(text(), 'Costa del Sol') or contains(text(), 'property')]"
          ]
        },
        "potentialAction": [
          {
            "@type": "ReadAction",
            "target": `${baseUrl}/qa/${article.slug}`,
            "expectsAcceptanceOf": {
              "@type": "Offer",
              "category": "Free Consultation"
            }
          },
          ...(article.next_step_url ? [{
            "@type": "Action",
            "name": article.next_step_text || "Next Step",
            "target": {
              "@type": "EntryPoint", 
              "urlTemplate": article.next_step_url
            }
          }] : [])
        ]
      },
      // Enhanced Question Entity
      {
        "@type": "Question",
        "@id": `${baseUrl}/qa/${article.slug}#question`,
        "name": article.title,
        "text": article.title,
        "dateCreated": article.created_at,
        "author": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        },
        "acceptedAnswer": {
          "@type": "Answer",
          "@id": `${baseUrl}/qa/${article.slug}#answer`,
          "text": (article.content || article.excerpt).replace(/<[^>]*>/g, '').substring(0, 500) + '...',
          "author": {
            "@type": "Organization",
            "@id": `${baseUrl}/#organization`
          },
          "dateCreated": article.created_at,
          "upvoteCount": 0
        },
        "suggestedAnswer": [
          {
            "@type": "Answer",
            "text": article.excerpt,
            "name": "Quick Answer"
          }
        ],
        "audience": {
          "@type": "Audience",
          "audienceType": getFunnelStageAudience(article.funnel_stage)
        }
      }
    ]
  };
};

// Phase 3: Enhanced Organization Schema with AI Capabilities
export const generateAIEnhancedOrganizationSchema = (
  language: string = 'en',
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "RealEstateAgent"],
    "@id": `${baseUrl}/#organization`,
    "name": "DelSolPrimeHomes",
    "alternateName": "Del Sol Prime Homes",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo.png`,
      "width": 300,
      "height": 100
    },
    "description": "Premier Costa del Sol property specialists with AI-powered multilingual support for international buyers",
    "foundingDate": "2020",
    "areaServed": [
      {
        "@type": "Place",
        "name": "Costa del Sol",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "36.5201",
          "longitude": "-4.8773"
        }
      },
      {
        "@type": "Country",
        "name": "Spain"
      }
    ],
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "36.5201",
        "longitude": "-4.8773"
      },
      "geoRadius": "100000"
    },
    "knowsAbout": [
      "Costa del Sol Property Market",
      "AI Property Assistance", 
      "Multilingual Real Estate Services",
      "Spanish Property Law",
      "International Property Investment",
      "Expat Relocation Services",
      "Property Valuation",
      "Mortgage Assistance",
      "Legal Property Guidance"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI-Enhanced Property Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Property Search Assistant",
            "description": "Multilingual AI-powered property recommendations"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Virtual Property Tours",
            "description": "AI-enhanced virtual property viewings"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Multilingual Legal Support", 
            "description": "AI-assisted legal guidance in multiple languages"
          }
        }
      ]
    },
    "availableLanguage": [
      "English", "Spanish", "German", "French", 
      "Dutch", "Swedish", "Danish", "Polish"
    ],
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    ]
  };
};

// Phase 4: Enhanced WebSite Schema with AI Search Capabilities  
export const generateAIWebsiteSchema = (
  language: string = 'en',
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "name": "DelSolPrimeHomes - AI-Powered Costa del Sol Property Portal",
    "alternateName": "Del Sol Prime Homes AI Assistant",
    "url": baseUrl,
    "description": "Advanced AI-powered property portal for Costa del Sol with multilingual support",
    "inLanguage": language,
    "publisher": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "name": "AI Property Search",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`,
          "actionPlatform": [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform"
          ]
        },
        "query-input": {
          "@type": "PropertyValueSpecification",
          "valueName": "search_term_string",
          "description": "Search for properties, locations, or services"
        }
      },
      {
        "@type": "Action",
        "name": "AI Chat Assistant",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/chat`
        }
      }
    ],
    "mainEntity": {
      "@type": "ItemList",
      "name": "Main Site Sections",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "WebPage",
            "name": "AI Property Search",
            "url": `${baseUrl}/search`
          }
        },
        {
          "@type": "ListItem", 
          "position": 2,
          "item": {
            "@type": "WebPage",
            "name": "FAQ Hub", 
            "url": `${baseUrl}/qa`
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "WebPage",
            "name": "Property Blog",
            "url": `${baseUrl}/blog`
          }
        }
      ]
    }
  };
};

// Utility Functions
const getFunnelStageAudience = (stage: string): string => {
  switch (stage) {
    case 'TOFU': return 'First-time Property Buyers';
    case 'MOFU': return 'Active Property Researchers'; 
    case 'BOFU': return 'Ready-to-Purchase Buyers';
    default: return 'Property Interested Individuals';
  }
};

const getTopicReference = (topic: string): string => {
  const topicMap: Record<string, string> = {
    'Legal & Documentation': 'https://schema.org/LegalService',
    'Financing & Mortgages': 'https://schema.org/FinancialService', 
    'Property Search': 'https://schema.org/RealEstateAgent',
    'Investment Strategy': 'https://schema.org/InvestmentOrFinancialProduct',
    'Insurance & Protection': 'https://schema.org/InsuranceAgency'
  };
  return topicMap[topic] || 'https://schema.org/Thing';
};

// Phase 5: Enhanced Breadcrumb with Topic Clusters
export const generateEnhancedBreadcrumbSchema = (
  items: Array<{ label: string; href?: string; current?: boolean }>,
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      ...items.map((item, index) => ({
        "@type": "ListItem", 
        "position": index + 2,
        "name": item.label,
        ...(item.href && !item.current ? { "item": `${baseUrl}${item.href}` } : {})
      }))
    ]
  };
};