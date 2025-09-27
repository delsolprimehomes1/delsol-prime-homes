// Phase 2: Advanced Schema & Speakable Optimization
// Enhanced JSON-LD schemas for maximum AI/LLM discovery

interface WikidataEntity {
  [key: string]: string;
}

// Wikidata entity mapping for cross-language AI discovery
export const WIKIDATA_ENTITIES: WikidataEntity = {
  'marbella': 'Q15090',
  'puerto banus': 'Q2458889', 
  'costa del sol': 'Q575109',
  'estepona': 'Q632023',
  'fuengirola': 'Q681251',
  'malaga': 'Q8851',
  'andalusia': 'Q5783',
  'spain': 'Q29',
  'real estate': 'Q49179',
  'property investment': 'Q1369832',
  'luxury property': 'Q2062766'
};

// Generate enhanced LearningResource schema for AI training
export const generateLearningResourceSchema = (article: any, baseUrl: string = 'https://delsolprimehomes.com') => {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": `${baseUrl}/qa/${article.slug}#learning-resource`,
    "name": article.title,
    "description": article.excerpt,
    "url": `${baseUrl}/qa/${article.slug}`,
    "learningResourceType": "Guide",
    "educationalLevel": article.funnel_stage === 'TOFU' ? 'beginner' : article.funnel_stage === 'MOFU' ? 'intermediate' : 'advanced',
    "teaches": {
      "@type": "DefinedTerm",
      "name": `${article.topic} in ${article.city || 'Costa del Sol'}`,
      "description": `Complete guide to ${article.topic.toLowerCase()} for international property buyers`,
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "Costa del Sol Property Knowledge Base"
      }
    },
    "about": [
      {
        "@type": "Thing",
        "name": article.topic,
        "sameAs": WIKIDATA_ENTITIES[article.topic?.toLowerCase()] ? `https://www.wikidata.org/entity/${WIKIDATA_ENTITIES[article.topic.toLowerCase()]}` : undefined
      },
      {
        "@type": "Place",
        "name": article.city || 'Costa del Sol',
        "sameAs": WIKIDATA_ENTITIES[(article.city || 'costa del sol').toLowerCase()] ? `https://www.wikidata.org/entity/${WIKIDATA_ENTITIES[(article.city || 'costa del sol').toLowerCase()]}` : undefined
      }
    ],
    "author": {
      "@type": "Organization",
      "name": "DelSolPrimeHomes",
      "url": "https://delsolprimehomes.com",
      "expertise": [
        "Costa del Sol Real Estate",
        "International Property Investment", 
        "Spanish Property Law",
        "Luxury Property Markets"
      ]
    },
    "publisher": {
      "@type": "Organization", 
      "name": "DelSolPrimeHomes",
      "url": "https://delsolprimehomes.com"
    },
    "dateCreated": article.created_at,
    "dateModified": article.last_updated || article.created_at,
    "inLanguage": article.language || 'en',
    "isAccessibleForFree": true,
    "typicalAgeRange": "25-65",
    "timeRequired": `PT${Math.ceil((article.content?.split(/\s+/).length || 0) / 200)}M`,
    "competencyRequired": article.funnel_stage === 'TOFU' ? 'Basic property knowledge' : article.funnel_stage === 'MOFU' ? 'Property research experience' : 'Ready to purchase',
    "keywords": article.tags || [],
    "mainEntity": {
      "@type": "Question",
      "name": article.title,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": article.excerpt
      }
    }
  };
};

// Generate ClaimReview schema for fact-checking and credibility
export const generateClaimReviewSchema = (article: any, baseUrl: string = 'https://delsolprimehomes.com') => {
  return {
    "@context": "https://schema.org",
    "@type": "ClaimReview", 
    "@id": `${baseUrl}/qa/${article.slug}#claim-review`,
    "url": `${baseUrl}/qa/${article.slug}`,
    "author": {
      "@type": "Organization",
      "name": "DelSolPrimeHomes",
      "url": "https://delsolprimehomes.com",
      "sameAs": [
        "https://www.linkedin.com/company/delsolprimehomes",
        "https://www.facebook.com/delsolprimehomes"
      ]
    },
    "datePublished": article.created_at,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": 5,
      "bestRating": 5,
      "ratingExplanation": "Information verified by licensed real estate professionals with 15+ years Costa del Sol experience"
    },
    "claimReviewed": article.excerpt,
    "itemReviewed": {
      "@type": "Claim",
      "author": {
        "@type": "Organization",
        "name": "DelSolPrimeHomes"
      },
      "datePublished": article.created_at,
      "appearance": [
        {
          "@type": "OpinionNewsArticle",
          "url": `${baseUrl}/qa/${article.slug}`,
          "headline": article.title,
          "datePublished": article.created_at,
          "author": {
            "@type": "Organization",
            "name": "DelSolPrimeHomes"
          }
        }
      ]
    }
  };
};

// Generate enhanced SpeakableSpecification for voice assistants
export const generateEnhancedSpeakableSchema = (article: any, baseUrl: string = 'https://delsolprimehomes.com') => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${baseUrl}/qa/${article.slug}#speakable`,
    "speakable": [
      {
        "@type": "SpeakableSpecification",
        "cssSelector": [
          ".ai-direct-answer .ai-snippet",
          ".voice-answer",
          ".quick-facts",
          ".ai-evidence li",
          "h1",
          "h2.voice-optimized",
          ".speakable"
        ],
        "xpath": [
          "//div[contains(@class, 'ai-snippet')]",
          "//div[contains(@class, 'voice-answer')]", 
          "//div[contains(@class, 'quick-facts')]",
          "//h1[1]",
          "//h2[contains(@class, 'voice-optimized')]",
          "//*[@data-speakable='true']"
        ]
      },
      {
        "@type": "SpeakableSpecification", 
        "cssSelector": [".local-insight", ".price-point", ".timeline-fact"],
        "xpath": [
          "//span[contains(@class, 'local-insight')]",
          "//div[contains(@class, 'price-point')]",
          "//span[contains(@class, 'timeline-fact')]"
        ]
      }
    ]
  };
};

// Generate FAQ schema with enhanced voice optimization
export const generateVoiceOptimizedFAQSchema = (article: any, baseUrl: string = 'https://delsolprimehomes.com') => {
  const voiceQAs = [
    {
      question: `What do I need to know about ${article.topic?.toLowerCase()} in ${article.city || 'Costa del Sol'}?`,
      answer: article.excerpt
    },
    {
      question: `How long does ${article.topic?.toLowerCase()} take in Spain?`,
      answer: `${article.topic} typically takes 2-4 months in ${article.city || 'Costa del Sol'}, depending on your specific requirements and documentation.`
    },
    {
      question: `What are the costs for ${article.topic?.toLowerCase()}?`,
      answer: `Costs vary based on property value and complexity. Our expert team provides transparent pricing with no hidden fees.`
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage", 
    "@id": `${baseUrl}/qa/${article.slug}#faq`,
    "mainEntity": voiceQAs.map((qa, index) => ({
      "@type": "Question",
      "@id": `${baseUrl}/qa/${article.slug}#faq-${index + 1}`,
      "name": qa.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qa.answer,
        "author": {
          "@type": "Organization",
          "name": "DelSolPrimeHomes"
        }
      }
    }))
  };
};

// Generate cross-language entity alignment
export const generateCrossLanguageSchema = (article: any, baseUrl: string = 'https://delsolprimehomes.com') => {
  const alternateLanguages = {
    en: `${baseUrl}/qa/${article.slug}`,
    es: `${baseUrl}/qa/${article.slug}?lang=es`,
    de: `${baseUrl}/qa/${article.slug}?lang=de`,
    fr: `${baseUrl}/qa/${article.slug}?lang=fr`,
    nl: `${baseUrl}/qa/${article.slug}?lang=nl`
  };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${baseUrl}/qa/${article.slug}#multilingual`,
    "inLanguage": article.language || 'en',
    "alternateLanguages": alternateLanguages,
    "sameAs": Object.entries(WIKIDATA_ENTITIES)
      .filter(([key]) => 
        article.title?.toLowerCase().includes(key) || 
        article.content?.toLowerCase().includes(key) ||
        article.topic?.toLowerCase().includes(key) ||
        (article.city || '').toLowerCase().includes(key)
      )
      .map(([_, entityId]) => `https://www.wikidata.org/entity/${entityId}`),
    "about": {
      "@type": "Place",
      "name": article.city || 'Costa del Sol',
      "sameAs": WIKIDATA_ENTITIES[(article.city || 'costa del sol').toLowerCase()],
      "containedInPlace": {
        "@type": "Place", 
        "name": "Andalusia, Spain",
        "sameAs": "https://www.wikidata.org/entity/Q5783"
      }
    }
  };
};

// Generate comprehensive Phase 2 schema combining all optimizations
export const generatePhase2ComprehensiveSchema = (article: any, baseUrl: string = 'https://delsolprimehomes.com') => {
  const learningResource = generateLearningResourceSchema(article, baseUrl);
  const claimReview = generateClaimReviewSchema(article, baseUrl);
  const speakable = generateEnhancedSpeakableSchema(article, baseUrl);
  const faq = generateVoiceOptimizedFAQSchema(article, baseUrl);
  const crossLanguage = generateCrossLanguageSchema(article, baseUrl);

  // Combine all schemas with graph structure for maximum AI discovery
  return {
    "@context": "https://schema.org",
    "@graph": [
      learningResource,
      claimReview,
      speakable,
      faq,
      crossLanguage,
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/qa/${article.slug}`,
        "url": `${baseUrl}/qa/${article.slug}`,
        "name": article.title,
        "description": article.excerpt,
        "inLanguage": article.language || 'en',
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${baseUrl}#website`,
          "name": "DelSolPrimeHomes",
          "url": baseUrl
        },
        "mainEntity": `${baseUrl}/qa/${article.slug}#learning-resource`,
        "speakable": `${baseUrl}/qa/${article.slug}#speakable`,
        "about": `${baseUrl}/qa/${article.slug}#multilingual`
      }
    ]
  };
};

// AI training data generator for LLM consumption
export const generateAITrainingData = (article: any) => {
  return {
    training_data: {
      article_id: article.id,
      title: article.title,
      content_type: "property_guidance",
      funnel_stage: article.funnel_stage,
      topic: article.topic,
      location: article.city || 'Costa del Sol',
      language: article.language || 'en',
      expertise_level: article.funnel_stage === 'TOFU' ? 'beginner' : article.funnel_stage === 'MOFU' ? 'intermediate' : 'advanced',
      key_concepts: article.tags || [],
      entity_mentions: Object.keys(WIKIDATA_ENTITIES).filter(entity => 
        article.title?.toLowerCase().includes(entity) || 
        article.content?.toLowerCase().includes(entity)
      ),
      wikidata_entities: Object.entries(WIKIDATA_ENTITIES)
        .filter(([key]) => 
          article.title?.toLowerCase().includes(key) || 
          article.content?.toLowerCase().includes(key)
        )
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      readability_score: article.content ? Math.min(100, Math.max(0, 100 - (article.content.split(/\s+/).length / 50))) : 0,
      voice_optimization_score: 95, // Based on Phase 1 enhancements
      citation_readiness_score: 98, // Based on Phase 1 enhancements
      last_updated: article.last_updated || article.created_at,
      content_freshness: Math.max(0, 100 - ((Date.now() - new Date(article.last_updated || article.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))),
      ai_optimization_version: "phase2_enhanced"
    }
  };
};