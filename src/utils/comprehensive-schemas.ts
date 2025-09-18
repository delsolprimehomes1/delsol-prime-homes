// Comprehensive Schema Generator for Maximum AI/LLM Discovery and Citation
import type { SupportedLanguage } from '@/i18n';

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

// Maximum AI Discovery Schema with Voice Search & Citation Optimization
export const generateMaximalAISchema = (
  article: QAArticle,
  relatedArticles: QAArticle[] = [],
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  const wordCount = article.content ? article.content.split(' ').length : 0;
  const readingTime = Math.ceil(wordCount / 200);
  
  return {
    "@context": ["https://schema.org", {
      "ai": "https://schema.org/",
      "voice": "https://schema.org/",
      "llm": "https://schema.org/"
    }],
    "@graph": [
      // Primary Article Schema with AI Enhancement
      {
        "@type": ["Article", "QAPage", "FAQPage"],
        "@id": `${baseUrl}/qa/${article.slug}#article`,
        "headline": article.title,
        "alternativeHeadline": `${article.title} - AI-Enhanced Costa del Sol Property Guide`,
        "description": article.excerpt,
        "abstract": article.excerpt,
        "url": `${baseUrl}/qa/${article.slug}`,
        "mainEntityOfPage": `${baseUrl}/qa/${article.slug}`,
        "identifier": {
          "@type": "PropertyValue",
          "name": "AI-Article-ID",
          "value": article.id
        },
        
        // Enhanced Dating and Freshness
        "datePublished": article.created_at || new Date().toISOString(),
        "dateModified": article.last_updated || new Date().toISOString(),
        "dateCreated": article.created_at,
        "lastReviewed": new Date().toISOString().split('T')[0],
        
        // Language and Accessibility
        "inLanguage": article.language || 'en',
        "isAccessibleForFree": true,
        "accessibilityFeature": [
          "readingOrder",
          "structuralNavigation", 
          "alternativeText",
          "voiceSearch"
        ],
        "accessibilityHazard": "none",
        
        // Content Metrics
        "wordCount": wordCount,
        "timeRequired": `PT${readingTime}M`,
        "typicalAgeRange": "25-65",
        
        // Authority and Credibility (E-E-A-T)
        "author": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`,
          "name": "DelSolPrimeHomes",
          "knowsAbout": [
            "Costa del Sol Real Estate",
            "AI Property Assistance",
            "International Property Investment",
            "Spanish Property Law",
            "Multilingual Real Estate Services"
          ]
        },
        "publisher": {
          "@type": "Organization", 
          "@id": `${baseUrl}/#organization`
        },
        "copyrightHolder": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        },
        
        // Topic and Location Context
        "about": [
          {
            "@type": "Place",
            "name": article.city || "Costa del Sol",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "36.5201",
              "longitude": "-4.8773"
            },
            "containedInPlace": {
              "@type": "AdministrativeArea", 
              "name": "Andalusia, Spain"
            }
          },
          {
            "@type": "Thing",
            "name": article.topic,
            "description": `${article.topic} guidance for Costa del Sol property buyers`
          },
          {
            "@type": "Service",
            "name": "AI Property Assistant",
            "serviceType": "PropertyTech",
            "provider": {
              "@type": "Organization",
              "@id": `${baseUrl}/#organization`
            }
          }
        ],
        
        // Audience Targeting
        "audience": {
          "@type": "Audience",
          "audienceType": getFunnelStageAudience(article.funnel_stage),
          "geographicArea": [
            "United Kingdom", "Ireland", "Germany", "Netherlands", 
            "France", "Sweden", "Denmark", "Poland"
          ]
        },
        
        // Enhanced Mentions for AI Discovery
        "mentions": [
          {
            "@type": "SoftwareApplication",
            "name": "AI Property Assistant",
            "applicationCategory": "PropertyTech",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            }
          },
          ...((article.tags || []).map(tag => ({
            "@type": "Thing",
            "name": tag,
            "sameAs": `${baseUrl}/qa?topic=${encodeURIComponent(tag)}`
          })))
        ],
        
        // Citation and Related Content
        "citation": relatedArticles.map(related => ({
          "@type": "CreativeWork",
          "name": related.title,
          "url": `${baseUrl}/qa/${related.slug}`,
          "datePublished": related.created_at
        })),
        
        // Enhanced Speakable for Voice Search
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [
            "h1", "h2", "h3", ".short-answer", ".quick-answer",
            ".ai-optimized", ".voice-friendly", ".speakable", 
            "[data-speakable='true']", ".key-takeaways", 
            ".essential-info", ".citation-summary"
          ],
          "xpath": [
            "//h1[1]",
            "//h2[position()<=3]",
            "//*[contains(@class, 'short-answer')]",
            "//*[contains(@class, 'ai-optimized')]",
            "//*[@data-speakable='true']",
            "//strong[contains(text(), 'Important') or contains(text(), 'Key')]",
            "//*[contains(text(), 'Costa del Sol') or contains(text(), 'property')]"
          ]
        },
        
        // AI-Specific Potential Actions
        "potentialAction": [
          {
            "@type": "ReadAction",
            "target": `${baseUrl}/qa/${article.slug}`,
            "expectsAcceptanceOf": {
              "@type": "Offer",
              "category": "Free Property Consultation"
            }
          },
          {
            "@type": "SearchAction",
            "name": "Find Related Properties",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/search?topic=${encodeURIComponent(article.topic)}`
            }
          },
          ...(article.next_step_url ? [{
            "@type": "ConsumeAction",
            "name": article.next_step_text || "Next Step",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": article.next_step_url
            }
          }] : [])
        ]
      },
      
      // Enhanced Question Entity for FAQ Structure
      {
        "@type": "Question",
        "@id": `${baseUrl}/qa/${article.slug}#question`,
        "name": article.title,
        "text": article.title,
        "url": `${baseUrl}/qa/${article.slug}`,
        "dateCreated": article.created_at,
        "dateModified": article.last_updated,
        
        "author": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        },
        
        "acceptedAnswer": {
          "@type": "Answer",
          "@id": `${baseUrl}/qa/${article.slug}#answer`,
          "text": (article.content || article.excerpt).replace(/<[^>]*>/g, '').substring(0, 2000),
          "dateCreated": article.created_at,
          "author": {
            "@type": "Organization",
            "@id": `${baseUrl}/#organization`
          },
          "upvoteCount": 0,
          "url": `${baseUrl}/qa/${article.slug}`
        },
        
        // AI Summary for Quick Citation
        "suggestedAnswer": [
          {
            "@type": "Answer",
            "text": article.excerpt,
            "name": "AI Quick Answer",
            "encodingFormat": "text/plain"
          }
        ],
        
        "audience": {
          "@type": "Audience",
          "audienceType": getFunnelStageAudience(article.funnel_stage)
        },
        
        "about": [
          {
            "@type": "Place",
            "name": article.city || "Costa del Sol"
          },
          {
            "@type": "Thing",
            "name": article.topic
          }
        ]
      },
      
      // Location-Specific Schema for Geographic Targeting
      {
        "@type": "Place",
        "@id": `${baseUrl}/location/${(article.city || 'costa-del-sol').toLowerCase().replace(/\s+/g, '-')}`,
        "name": article.city || "Costa del Sol",
        "description": `Property information and guidance for ${article.city || 'Costa del Sol'}`,
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": getLocationCoordinates(article.city || 'Costa del Sol').lat,
          "longitude": getLocationCoordinates(article.city || 'Costa del Sol').lng
        },
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Andalusia, Spain"
        },
        "hasMap": `https://www.google.com/maps/search/${encodeURIComponent(article.city || 'Costa del Sol')}`
      }
    ]
  };
};

// Comprehensive FAQ Hub Schema for All Articles
export const generateComprehensiveFAQHubSchema = (
  articles: QAArticle[],
  language: string = 'en',
  baseUrl: string = 'https://delsolprimehomes.com'
) => {
  const totalWordCount = articles.reduce((sum, article) => 
    sum + (article.content?.split(' ').length || 0), 0);
  const avgReadingTime = Math.ceil(totalWordCount / (200 * articles.length));
  
  // Group articles by topic for better organization
  const articlesByTopic = articles.reduce((acc, article) => {
    const topic = article.topic || 'General';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(article);
    return acc;
  }, {} as Record<string, QAArticle[]>);

  return {
    "@context": ["https://schema.org", {
      "ai": "https://schema.org/",
      "voice": "https://schema.org/",
      "multilingual": "https://schema.org/"
    }],
    "@type": ["FAQPage", "CollectionPage", "WebPage"],
    "@id": `${baseUrl}/qa#faq-hub`,
    
    "name": "Costa del Sol Property FAQ Hub - AI-Enhanced Expert Guide",
    "description": `Comprehensive AI-optimized FAQ with ${articles.length}+ expert answers about Costa del Sol property investment. Multilingual support for international buyers with structured data for voice search and LLM citation.`,
    "url": `${baseUrl}/qa`,
    "inLanguage": language,
    
    // Enhanced Dating and Freshness
    "datePublished": new Date(Math.min(...articles.map(a => 
      new Date(a.created_at || Date.now()).getTime()))).toISOString(),
    "dateModified": new Date().toISOString(),
    "lastReviewed": new Date().toISOString().split('T')[0],
    
    // Content Metrics
    "isAccessibleForFree": true,
    "wordCount": totalWordCount,
    "timeRequired": `PT${avgReadingTime}M`,
    "numberOfItems": articles.length,
    
    // Authority and Publisher
    "author": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },
    
    // Enhanced Audience Targeting
    "audience": {
      "@type": "Audience",
      "audienceType": "International Property Buyers",
      "geographicArea": [
        "United Kingdom", "Ireland", "Germany", "Netherlands", 
        "France", "Sweden", "Denmark", "Poland", "North America"
      ]
    },
    
    // Topic Coverage
    "about": [
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
        "@type": "Service",
        "name": "AI Property Assistant",
        "description": "Multilingual AI technology for property guidance"
      }
    ],
    
    // All FAQ Items Structured for Maximum AI Discovery
    "mainEntity": articles.map((article, index) => ({
      "@type": "Question",
      "@id": `${baseUrl}/qa/${article.slug}#question`,
      "position": index + 1,
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
          "name": article.city || "Costa del Sol"
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
        "url": `${baseUrl}/qa/${article.slug}`,
        "author": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        },
        "dateCreated": article.created_at || new Date().toISOString(),
        "upvoteCount": 0
      },
      
      "mentions": (article.tags || []).map(tag => ({
        "@type": "Thing",
        "name": tag
      })),
      
      "isPartOf": {
        "@type": "FAQPage",
        "@id": `${baseUrl}/qa`
      }
    })),
    
    // Topic-Based Organization
    "hasPart": Object.entries(articlesByTopic).map(([topic, topicArticles]) => ({
      "@type": "ItemList",
      "name": `${topic} Questions`,
      "description": `${topicArticles.length} expert answers about ${topic.toLowerCase()}`,
      "numberOfItems": topicArticles.length,
      "itemListElement": topicArticles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Question",
          "@id": `${baseUrl}/qa/${article.slug}#question`,
          "name": article.title,
          "url": `${baseUrl}/qa/${article.slug}`
        }
      }))
    })),
    
    // Enhanced Speakable for Voice Assistants
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [
        "h1", "h2", "h3", ".question-title", ".short-answer",
        ".qa-card h3", ".topic-cluster-title", ".stage-description",
        ".ai-optimized", ".voice-friendly", ".quick-facts", 
        ".essential-info", ".speakable", "[data-speakable='true']",
        ".faq-answer-summary", ".topic-title"
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
        "//*[contains(text(), 'Costa del Sol') or contains(text(), 'property')]",
        "//div[contains(@class, 'ai-optimized') or @data-speakable='true']"
      ]
    },
    
    // Enhanced Potential Actions for AI Integration
    "potentialAction": [
      {
        "@type": "SearchAction",
        "name": "AI-Powered FAQ Search",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/qa?q={search_term_string}`,
          "actionPlatform": [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform",
            "https://schema.org/IOSPlatform",
            "https://schema.org/AndroidPlatform"
          ]
        },
        "query-input": {
          "@type": "PropertyValueSpecification",
          "valueName": "search_term_string",
          "description": "Search for property questions and expert answers"
        }
      },
      {
        "@type": "ReadAction",
        "name": "Browse by Topic",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/qa?topic={topic_name}`
        }
      },
      {
        "@type": "ConsumeAction",
        "name": "AI Chat Assistant",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/chat`
        }
      }
    ]
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

const getLocationCoordinates = (location: string): { lat: string; lng: string } => {
  const coords: Record<string, { lat: string; lng: string }> = {
    'Costa del Sol': { lat: '36.5201', lng: '-4.8773' },
    'Marbella': { lat: '36.5109', lng: '-4.8850' },
    'Estepona': { lat: '36.4285', lng: '-5.1457' },
    'Fuengirola': { lat: '36.5394', lng: '-4.6267' },
    'Torremolinos': { lat: '36.6201', lng: '-4.4999' },
    'Benalmádena': { lat: '36.5988', lng: '-4.5166' },
    'Málaga': { lat: '36.7213', lng: '-4.4214' }
  };
  
  return coords[location] || coords['Costa del Sol'];
};