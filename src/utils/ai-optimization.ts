// AI/LLM Optimization Utilities for Enhanced Content Discovery and Citation

interface AIOptimizedContent {
  shortAnswer: string;
  keyPoints: string[];
  essentialInfo: string;
  aiSummary: string;
  citations: string[];
  relatedTopics: string[];
  readingTime: number;
  wordCount: number;
  voiceSearchKeywords: string[];
}

// Extract short answers optimized for AI consumption
export const extractShortAnswer = (content: string, title: string): string => {
  // Clean HTML and get plain text
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  
  // Look for key patterns that indicate important information
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Find the most relevant sentence based on title keywords
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const scoredSentences = sentences.map(sentence => {
    const sentenceLower = sentence.toLowerCase();
    const score = titleWords.reduce((acc, word) => {
      return acc + (sentenceLower.includes(word) ? 1 : 0);
    }, 0);
    return { sentence: sentence.trim(), score };
  });
  
  // Get the highest scoring sentence or first substantial sentence
  const bestSentence = scoredSentences.sort((a, b) => b.score - a.score)[0];
  const shortAnswer = bestSentence?.sentence || sentences[0] || plainText.substring(0, 200);
  
  // Ensure it's between 50-200 characters for optimal AI consumption
  if (shortAnswer.length < 50) {
    return plainText.substring(0, 150) + '...';
  }
  if (shortAnswer.length > 200) {
    return shortAnswer.substring(0, 197) + '...';
  }
  
  return shortAnswer;
};

// Extract key points for structured AI consumption
export const extractKeyPoints = (content: string, maxPoints: number = 5): string[] => {
  const plainText = content.replace(/<[^>]*>/g, '');
  const points: string[] = [];
  
  // Look for bullet points, numbered lists, or structured content
  const bulletMatches = plainText.match(/[•\-\*]\s*([^•\-\*\n]{20,100})/g);
  if (bulletMatches) {
    points.push(...bulletMatches.map(match => match.replace(/[•\-\*]\s*/, '').trim()).slice(0, maxPoints));
  }
  
  // Look for sentences starting with key indicators
  const keyPhrases = /(?:Key|Important|Essential|Note|Remember|Consider):\s*([^.!?]{20,150})/gi;
  const keyMatches = plainText.match(keyPhrases);
  if (keyMatches && points.length < maxPoints) {
    points.push(...keyMatches.map(match => match.replace(/^[^:]*:\s*/, '').trim()).slice(0, maxPoints - points.length));
  }
  
  // Extract first few substantial sentences if no structured content found
  if (points.length === 0) {
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 30 && s.trim().length < 150);
    points.push(...sentences.slice(0, maxPoints));
  }
  
  return points.slice(0, maxPoints);
};

// Generate voice search optimized keywords
export const generateVoiceSearchKeywords = (title: string, content: string, topic: string): string[] => {
  const keywords: Set<string> = new Set();
  
  // Add question patterns
  const questionStarters = ['how to', 'what is', 'where can', 'when should', 'why do', 'which'];
  questionStarters.forEach(starter => {
    if (title.toLowerCase().includes(starter)) {
      keywords.add(title.toLowerCase());
    }
  });
  
  // Add location-based keywords
  const locations = ['costa del sol', 'marbella', 'estepona', 'fuengirola', 'malaga', 'spain', 'andalusia'];
  locations.forEach(location => {
    if (content.toLowerCase().includes(location)) {
      keywords.add(`${location} property`);
      keywords.add(`buying in ${location}`);
    }
  });
  
  // Add topic-based voice patterns
  keywords.add(`${topic.toLowerCase()} costa del sol`);
  keywords.add(`${topic.toLowerCase()} spain property`);
  
  // Add common voice search patterns
  const voicePatterns = [
    'property investment spain',
    'buying house costa del sol',
    'spanish property guide',
    'international property buyer',
    'costa del sol real estate'
  ];
  voicePatterns.forEach(pattern => keywords.add(pattern));
  
  return Array.from(keywords).slice(0, 15);
};

// Generate AI-optimized content structure
export const generateAIOptimizedContent = (article: any): AIOptimizedContent => {
  const content = article.content || '';
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);
  
  return {
    shortAnswer: extractShortAnswer(content, article.title),
    keyPoints: extractKeyPoints(content),
    essentialInfo: article.excerpt || extractShortAnswer(content, article.title),
    aiSummary: `${article.title} - ${article.excerpt}`,
    citations: [`https://delsolprimehomes.com/qa/${article.slug}`],
    relatedTopics: article.tags || [],
    readingTime,
    wordCount,
    voiceSearchKeywords: generateVoiceSearchKeywords(article.title, content, article.topic)
  };
};

// Enhanced speakable content selectors for maximum AI/Voice discovery
export const getEnhancedSpeakableSelectors = (): {
  cssSelector: string[];
  xpath: string[];
} => {
  return {
    cssSelector: [
      // Core content selectors
      'h1', 'h2', 'h3',
      // AI-optimized content classes
      '.short-answer', '.key-answer', '.quick-answer', '.ai-summary',
      '.essential-info', '.quick-facts', '.key-points',
      // Voice-friendly selectors
      '.voice-friendly', '.speakable', '[data-speakable="true"]',
      // FAQ-specific selectors
      '.question-title', '.qa-title', '.faq-question',
      '.answer-summary', '.faq-answer-summary',
      // Topic and category selectors
      '.topic-title', '.category-title', '.cluster-title',
      // Important information markers
      '.important', '.highlighted', '.emphasis',
      // Structured content
      '.bullet-points li', '.key-points li', '.checklist li'
    ],
    xpath: [
      // Primary headings
      '//h1[1]',
      '//h2[position()<=3]',
      '//h3[position()<=5]',
      // AI-optimized content
      '//*[contains(@class, "short-answer") or contains(@class, "key-answer")]',
      '//*[contains(@class, "essential-info") or contains(@class, "quick-facts")]',
      '//*[contains(@class, "ai-summary") or @data-speakable="true"]',
      // Question and answer patterns
      '//*[contains(@class, "question-title") or contains(@class, "qa-title")]',
      '//*[contains(@class, "answer-summary")]',
      // Important markers
      '//strong[contains(text(), "Important:") or contains(text(), "Key:") or contains(text(), "Note:")]',
      '//em[contains(text(), "Essential") or contains(text(), "Critical")]',
      // Location and topic specific
      '//*[contains(text(), "Costa del Sol") or contains(text(), "property") or contains(text(), "buying")]',
      '//*[contains(text(), "investment") or contains(text(), "real estate")]',
      // Lists and structured content
      '//li[contains(@class, "key-point") or contains(@class, "important")]',
      '//p[position()<=3 and string-length(.) > 50 and string-length(.) < 200]'
    ]
  };
};

// Generate citation-optimized metadata for LLMs
export const generateCitationMetadata = (article: any, baseUrl: string = 'https://delsolprimehomes.com') => {
  return {
    citationTitle: article.title,
    citationUrl: `${baseUrl}/qa/${article.slug}`,
    citationDate: article.last_updated || article.created_at,
    citationAuthor: "DelSolPrimeHomes Expert Team",
    citationSource: "DelSolPrimeHomes AI-Enhanced Property Guide",
    citationTopic: article.topic,
    citationLocation: article.city || "Costa del Sol, Spain",
    citationRelevance: article.funnel_stage === 'TOFU' ? 'introductory' : 
                      article.funnel_stage === 'MOFU' ? 'detailed' : 'decisive',
    citationCredibility: "Expert-verified property guidance with AI optimization",
    citationAccessibility: "Free access, multilingual support available"
  };
};

// Export for GitHub/Markdown optimization
export const generateMarkdownFrontmatter = (article: any): string => {
  const aiOptimized = generateAIOptimizedContent(article);
  const citation = generateCitationMetadata(article);
  
  return `---
title: "${article.title}"
slug: "${article.slug}"
description: "${article.excerpt}"
topic: "${article.topic}"
funnel_stage: "${article.funnel_stage}"
language: "${article.language || 'en'}"
created_at: "${article.created_at}"
updated_at: "${article.last_updated}"
word_count: ${aiOptimized.wordCount}
reading_time: ${aiOptimized.readingTime}
ai_optimized: true
voice_search_ready: true
citation_ready: true
tags:
${(article.tags || []).map((tag: string) => `  - "${tag}"`).join('\n')}
voice_keywords:
${aiOptimized.voiceSearchKeywords.map((keyword: string) => `  - "${keyword}"`).join('\n')}
key_points:
${aiOptimized.keyPoints.map((point: string) => `  - "${point}"`).join('\n')}
citation:
  title: "${citation.citationTitle}"
  url: "${citation.citationUrl}"
  author: "${citation.citationAuthor}"
  source: "${citation.citationSource}"
  date: "${citation.citationDate}"
  credibility: "${citation.citationCredibility}"
---

# ${article.title}

## Quick Answer (AI-Optimized)
<div class="short-answer ai-optimized" data-speakable="true">
${aiOptimized.shortAnswer}
</div>

## Key Points (Voice-Search Friendly)
<div class="key-points voice-friendly">
${aiOptimized.keyPoints.map((point: string) => `- ${point}`).join('\n')}
</div>

## Detailed Answer
${article.content}

---
*AI-Enhanced Content | Voice Search Optimized | Citation Ready*
`;
};