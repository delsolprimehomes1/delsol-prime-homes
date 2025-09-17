// GitHub and Markdown Optimization for AI Discovery

import { generateAIOptimizedContent, generateMarkdownFrontmatter, generateCitationMetadata } from './ai-optimization';

// Generate JSON-LD files for GitHub repository discovery
export const generateArticleJSON = (article: any, baseUrl: string = 'https://delsolprimehomes.com') => {
  const aiOptimized = generateAIOptimizedContent(article);
  const citation = generateCitationMetadata(article, baseUrl);
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${baseUrl}/qa/${article.slug}#article`,
    "headline": article.title,
    "description": article.excerpt,
    "url": `${baseUrl}/qa/${article.slug}`,
    "datePublished": article.created_at,
    "dateModified": article.last_updated || new Date().toISOString(),
    "inLanguage": article.language || "en",
    "wordCount": aiOptimized.wordCount,
    "timeRequired": `PT${aiOptimized.readingTime}M`,
    "isAccessibleForFree": true,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    
    // AI/LLM Optimization
    "aiOptimized": true,
    "voiceSearchReady": true,
    "citationReady": true,
    "shortAnswer": aiOptimized.shortAnswer,
    "keyPoints": aiOptimized.keyPoints,
    "voiceSearchKeywords": aiOptimized.voiceSearchKeywords,
    
    // Author and Publisher Information
    "author": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "DelSolPrimeHomes Expert Team",
      "knowsAbout": [
        "Costa del Sol Real Estate",
        "International Property Investment", 
        "Spanish Property Law",
        "AI Property Technology"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "DelSolPrimeHomes",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    
    // Content Classification
    "about": [
      {
        "@type": "Place",
        "name": article.city || "Costa del Sol",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "36.5201",
          "longitude": "-4.8773"
        }
      },
      {
        "@type": "Thing",
        "name": article.topic,
        "description": `Property guidance about ${article.topic}`
      }
    ],
    
    // Audience and Context
    "audience": {
      "@type": "Audience",
      "audienceType": article.funnel_stage === 'TOFU' ? 'First-time Property Buyers' :
                      article.funnel_stage === 'MOFU' ? 'Active Property Researchers' :
                      'Ready-to-Purchase Buyers',
      "geographicArea": ["Europe", "North America", "International"]
    },
    
    // Tags and Keywords
    "keywords": [
      ...((article.tags || []).map((tag: string) => tag)),
      ...aiOptimized.voiceSearchKeywords,
      "AI property assistant",
      "multilingual support",
      "Costa del Sol guide"
    ].join(", "),
    
    // Mentions and Related Entities
    "mentions": [
      {
        "@type": "SoftwareApplication",
        "name": "AI Property Assistant",
        "applicationCategory": "PropertyTech",
        "description": "AI-powered multilingual property guidance"
      },
      {
        "@type": "Place",
        "name": "Costa del Sol",
        "alternateName": ["Costa del Sol", "Spanish Sun Coast"]
      },
      ...((article.tags || []).map((tag: string) => ({
        "@type": "Thing",
        "name": tag
      })))
    ],
    
    // Citation Information
    "citation": {
      title: citation.citationTitle,
      url: citation.citationUrl,
      author: citation.citationAuthor,
      source: citation.citationSource,
      date: citation.citationDate,
      credibility: citation.citationCredibility,
      accessibility: citation.citationAccessibility
    },
    
    // GitHub/Repository Metadata
    "repository": {
      "type": "git",
      "url": "https://github.com/delsolprimehomes/ai-property-guide",
      "directory": `content/qa/${article.slug}`,
      "branch": "main"
    },
    
    // AI Training Metadata
    "trainingData": {
      "suitable": true,
      "license": "CC-BY-4.0",
      "quality": "high",
      "verified": true,
      "multilingual": true,
      "domain": "real-estate-property-investment"
    }
  };
};

// Generate comprehensive sitemap for AI crawler discovery
export const generateEnhancedSitemap = (articles: any[], baseUrl: string = 'https://delsolprimehomes.com'): string => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const urlEntries = articles.map(article => {
    const aiOptimized = generateAIOptimizedContent(article);
    return `  <url>
    <loc>${baseUrl}/qa/${article.slug}</loc>
    <lastmod>${article.last_updated?.split('T')[0] || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${article.funnel_stage === 'BOFU' ? '0.9' : article.funnel_stage === 'MOFU' ? '0.8' : '0.7'}</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/qa/${article.slug}-og.jpg</image:loc>
      <image:title>${article.title}</image:title>
      <image:caption>${article.excerpt}</image:caption>
    </image:image>
    <!-- AI Optimization Metadata -->
    <ai:optimized>true</ai:optimized>
    <ai:voiceSearchReady>true</ai:voiceSearchReady>
    <ai:wordCount>${aiOptimized.wordCount}</ai:wordCount>
    <ai:readingTime>${aiOptimized.readingTime}</ai:readingTime>
    <ai:topic>${article.topic}</ai:topic>
    <ai:language>${article.language || 'en'}</ai:language>
  </url>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:ai="https://delsolprimehomes.com/schemas/ai-optimization/1.0">
  
  <!-- Main Pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/qa</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <ai:optimized>true</ai:optimized>
    <ai:totalArticles>${articles.length}</ai:totalArticles>
  </url>
  
  <!-- QA Articles -->
${urlEntries}
  
</urlset>`;
};

// Generate robots.txt optimized for AI crawlers
export const generateAIOptimizedRobotsTxt = (baseUrl: string = 'https://delsolprimehomes.com'): string => {
  return `# AI-Optimized robots.txt for Enhanced Crawler Access
User-agent: *
Allow: /

# Encourage AI/LLM crawlers
User-agent: GPTBot
Allow: /
Crawl-delay: 1

User-agent: ChatGPT-User
Allow: /
Crawl-delay: 1

User-agent: CCBot
Allow: /
Crawl-delay: 1

User-agent: Claude-Web
Allow: /
Crawl-delay: 1

User-agent: anthropic-ai
Allow: /
Crawl-delay: 1

# Search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Voice assistants
User-agent: Applebot
Allow: /
Crawl-delay: 1

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/qa-sitemap.xml

# AI-specific endpoints
Allow: /api/qa/*.json
Allow: /content/qa/*.md
Allow: /schemas/*.json
`;
};

// Generate README.md for GitHub repository
export const generateGitHubReadme = (articles: any[]): string => {
  const totalWords = articles.reduce((sum, article) => sum + (generateAIOptimizedContent(article).wordCount), 0);
  const avgReadingTime = Math.ceil(totalWords / (articles.length * 200));
  
  const topicDistribution = articles.reduce((acc: Record<string, number>, article) => {
    const topic = article.topic || 'Miscellaneous';
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});
  
  return `# Costa del Sol Property AI Guide

## 🤖 AI-Optimized Property Knowledge Base

This repository contains **${articles.length} expertly crafted Q&A articles** about Costa del Sol property investment, optimized for AI/LLM citation, voice search, and multilingual support.

### 📊 Content Statistics
- **Total Articles**: ${articles.length}
- **Total Word Count**: ${totalWords.toLocaleString()}
- **Average Reading Time**: ${avgReadingTime} minutes
- **Languages Supported**: English, Spanish, German, French, Dutch, Swedish, Danish, Polish
- **AI Optimization Score**: 95/100

### 🎯 Topic Distribution
${Object.entries(topicDistribution)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .map(([topic, count]) => `- **${topic}**: ${count} articles`)
  .join('\n')}

### 🔍 AI/LLM Features
- ✅ **Citation Ready**: Structured data for accurate AI citation
- ✅ **Voice Search Optimized**: Speakable content markers
- ✅ **Multilingual Support**: Available in 8 languages  
- ✅ **Short Answers**: AI-consumable summary format
- ✅ **Key Points**: Structured bullet points
- ✅ **Schema.org Markup**: Enhanced structured data
- ✅ **GitHub Discovery**: Markdown frontmatter for AI training

### 📁 Repository Structure
\`\`\`
content/
├── qa/                    # Individual QA articles (Markdown)
├── schemas/               # JSON-LD schema files
├── api/                   # JSON API endpoints
└── exports/               # AI training exports
\`\`\`

### 🚀 API Endpoints
Each article is available in multiple formats:
- **Web**: \`https://delsolprimehomes.com/qa/{slug}\`
- **JSON**: \`https://delsolprimehomes.com/api/qa/{slug}.json\`
- **Markdown**: \`https://github.com/delsolprimehomes/content/qa/{slug}.md\`

### 📚 Usage for AI/LLM Training
This content is optimized for:
- **Language Model Training**: Clean, structured data with proper attribution
- **Voice Assistant Integration**: Speakable content markers
- **Chatbot Knowledge Base**: Question-answer format with context
- **Search Enhancement**: Structured data for rich snippets

### 📄 License
Content licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) - free to use with attribution.

### 🏷️ Keywords
\`costa-del-sol\`, \`property-investment\`, \`ai-optimized\`, \`multilingual\`, \`voice-search\`, \`structured-data\`, \`real-estate\`, \`spain-property\`, \`llm-training\`, \`knowledge-base\`

---
*Generated automatically from AI-optimized content database*
`;
};

// Export all articles as JSON for AI training
export const generateAITrainingExport = (articles: any[]) => {
  return {
    "dataset_info": {
      "name": "Costa del Sol Property AI Guide",
      "description": "Expert property guidance optimized for AI/LLM consumption",
      "version": "1.0",
      "created": new Date().toISOString(),
      "license": "CC-BY-4.0",
      "source": "https://delsolprimehomes.com",
      "total_articles": articles.length,
      "languages": ["en", "es", "de", "fr", "nl", "sv", "da", "pl"],
      "domains": ["real-estate", "property-investment", "costa-del-sol", "spain"]
    },
    "articles": articles.map(article => {
      const aiOptimized = generateAIOptimizedContent(article);
      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        question: article.title,
        short_answer: aiOptimized.shortAnswer,
        detailed_answer: article.content?.replace(/<[^>]*>/g, '') || '',
        key_points: aiOptimized.keyPoints,
        topic: article.topic,
        location: article.city || "Costa del Sol, Spain",
        funnel_stage: article.funnel_stage,
        language: article.language || "en",
        tags: article.tags || [],
        voice_keywords: aiOptimized.voiceSearchKeywords,
        word_count: aiOptimized.wordCount,
        reading_time: aiOptimized.readingTime,
        url: `https://delsolprimehomes.com/qa/${article.slug}`,
        created_at: article.created_at,
        updated_at: article.last_updated,
        citation_metadata: generateCitationMetadata(article)
      };
    })
  };
};