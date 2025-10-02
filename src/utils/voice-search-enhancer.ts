// Advanced Voice Search Optimization Utilities
// Enhances content for voice assistants, conversational AI, and natural language queries

export interface VoiceOptimizationResult {
  questionBasedHeadings: string[];
  naturalLanguageAnswers: string[];
  speakableSelectors: string[];
  faqSchema: any;
  conversationalScore: number;
}

/**
 * Convert standard headings to question-based format for voice search
 */
export const convertToQuestionHeading = (heading: string, topic: string): string => {
  const headingLower = heading.toLowerCase();
  
  // Already a question
  if (headingLower.includes('?')) return heading;
  
  // Common patterns to convert
  const patterns = [
    { regex: /^(cost|price|fee)/i, prefix: 'How much does', suffix: 'cost?' },
    { regex: /^(process|procedure|steps)/i, prefix: 'What is the process for', suffix: '?' },
    { regex: /^(requirements|needed|necessary)/i, prefix: 'What do I need for', suffix: '?' },
    { regex: /^(time|duration|timeline)/i, prefix: 'How long does', suffix: 'take?' },
    { regex: /^(benefits|advantages)/i, prefix: 'What are the benefits of', suffix: '?' },
    { regex: /^(location|where)/i, prefix: 'Where can I find', suffix: '?' },
    { regex: /^(best|top|ideal)/i, prefix: 'What is the best', suffix: '?' },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(headingLower)) {
      const cleanHeading = heading.replace(pattern.regex, '').trim();
      return `${pattern.prefix} ${cleanHeading} ${pattern.suffix}`;
    }
  }

  // Default: convert to "What about X?"
  return `What about ${heading}?`;
};

/**
 * Generate natural language answer from content
 */
export const generateNaturalAnswer = (content: string, maxWords: number = 50): string => {
  // Remove markdown formatting
  let cleaned = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`/g, '');

  // Split into sentences
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return '';

  // Take first few sentences that fit within word limit
  let answer = '';
  let wordCount = 0;
  
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).length;
    if (wordCount + words <= maxWords) {
      answer += sentence.trim() + '. ';
      wordCount += words;
    } else {
      break;
    }
  }

  return answer.trim();
};

/**
 * Extract speakable content sections with CSS selectors
 */
export const generateSpeakableSelectors = (contentType: string = 'qa'): string[] => {
  const baseSelectors = [
    'h1',
    '.question-title',
    '.quick-answer',
    '.short-answer',
    '.voice-answer',
    '[data-speakable="true"]',
  ];

  const typeSpecificSelectors: Record<string, string[]> = {
    qa: [
      '.qa-answer-text',
      '.key-takeaway',
      '.quick-facts li',
    ],
    blog: [
      '.article-summary',
      '.key-points li',
      'h2',
    ],
    faq: [
      '.faq-answer',
      '.accordion-content',
    ],
  };

  return [...baseSelectors, ...(typeSpecificSelectors[contentType] || [])];
};

/**
 * Generate FAQ schema for voice search results
 */
export const generateVoiceFAQSchema = (
  questions: Array<{ question: string; answer: string }>,
  url: string
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(qa => ({
      '@type': 'Question',
      'name': qa.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': qa.answer,
        'inLanguage': 'en',
        'encodingFormat': 'text/plain'
      }
    })),
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': generateSpeakableSelectors('faq'),
      'xpath': [
        '//h2',
        '//*[@data-speakable="true"]',
        '//*[contains(@class, "voice-answer")]'
      ]
    },
    'url': url,
    'inLanguage': 'en',
    'isAccessibleForFree': true
  };
};

/**
 * Calculate conversational tone score
 */
export const calculateConversationalScore = (content: string): number => {
  let score = 0;
  const contentLower = content.toLowerCase();

  // Positive indicators (add points)
  const positivePatterns = [
    { regex: /\b(you|your)\b/g, points: 2, label: 'Direct address' },
    { regex: /\?/g, points: 3, label: 'Questions' },
    { regex: /\b(let's|we'll|we can)\b/g, points: 2, label: 'Inclusive language' },
    { regex: /\b(simply|easily|quick|straightforward)\b/g, points: 1, label: 'Accessible language' },
    { regex: /\b(for example|such as|like)\b/g, points: 1, label: 'Examples' },
    { regex: /\b(first|next|then|finally)\b/g, points: 1, label: 'Sequential language' },
  ];

  // Negative indicators (subtract points)
  const negativePatterns = [
    { regex: /\b(heretofore|aforementioned|pursuant)\b/g, points: -5, label: 'Legal jargon' },
    { regex: /\b(utilize|commence|terminate)\b/g, points: -2, label: 'Formal vocabulary' },
    { regex: /sentences over 30 words/g, points: -1, label: 'Long sentences' },
  ];

  // Calculate positive score
  positivePatterns.forEach(pattern => {
    const matches = contentLower.match(pattern.regex);
    if (matches) {
      score += matches.length * pattern.points;
    }
  });

  // Calculate negative score
  negativePatterns.forEach(pattern => {
    const matches = contentLower.match(pattern.regex);
    if (matches) {
      score += matches.length * pattern.points;
    }
  });

  // Check average sentence length
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWords = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  
  if (avgWords > 25) score -= 5; // Penalize long sentences
  if (avgWords < 15) score += 5; // Reward concise sentences

  // Normalize to 0-100 scale
  return Math.max(0, Math.min(100, 50 + score));
};

/**
 * Optimize content for voice search
 */
export const optimizeForVoiceSearch = (
  article: any
): VoiceOptimizationResult => {
  const content = article.content || '';
  const topic = article.topic || '';
  
  // Extract headings and convert to questions
  const headingMatches = content.match(/^#{1,6}\s+(.+)$/gm) || [];
  const questionBasedHeadings = headingMatches.map((h: string) => {
    const text = h.replace(/^#{1,6}\s+/, '');
    return convertToQuestionHeading(text, topic);
  });

  // Generate natural language answers
  const paragraphs = content.split(/\n\n+/).filter((p: string) => p.trim().length > 50);
  const naturalLanguageAnswers = paragraphs
    .slice(0, 5)
    .map((p: string) => generateNaturalAnswer(p, 50));

  // Get speakable selectors
  const speakableSelectors = generateSpeakableSelectors('qa');

  // Generate FAQ schema
  const faqs = questionBasedHeadings.slice(0, 5).map((q: string, i: number) => ({
    question: q,
    answer: naturalLanguageAnswers[i] || ''
  }));
  
  const faqSchema = generateVoiceFAQSchema(
    faqs,
    `https://delsolprimehomes.com/qa/${article.slug}`
  );

  // Calculate conversational score
  const conversationalScore = calculateConversationalScore(content);

  return {
    questionBasedHeadings,
    naturalLanguageAnswers,
    speakableSelectors,
    faqSchema,
    conversationalScore
  };
};

/**
 * Validate voice search readiness
 */
export const validateVoiceReadiness = (article: any): {
  isReady: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const content = article.content || '';
  const title = article.title || '';

  // Check title format
  if (!title.includes('?') && !title.toLowerCase().startsWith('how') && !title.toLowerCase().startsWith('what')) {
    issues.push('Title is not in question format');
    recommendations.push('Convert title to question format (e.g., "How to..." or "What is..."?)');
    score -= 10;
  }

  // Check for speakable markup
  if (!content.includes('data-speakable') && !content.includes('speakable')) {
    issues.push('No speakable markup found');
    recommendations.push('Add data-speakable="true" attributes to key content sections');
    score -= 15;
  }

  // Check conversational tone
  const conversationalScore = calculateConversationalScore(content);
  if (conversationalScore < 60) {
    issues.push('Content lacks conversational tone');
    recommendations.push('Use more direct address (you/your) and simpler language');
    score -= 20;
  }

  // Check answer length
  const firstParagraph = content.split('\n\n')[0];
  const wordCount = firstParagraph?.split(/\s+/).length || 0;
  if (wordCount > 75) {
    issues.push('Opening answer is too long for voice');
    recommendations.push('Provide a concise answer in the first 50 words');
    score -= 10;
  }

  return {
    isReady: score >= 70,
    score: Math.max(0, score),
    issues,
    recommendations
  };
};

export default {
  convertToQuestionHeading,
  generateNaturalAnswer,
  generateSpeakableSelectors,
  generateVoiceFAQSchema,
  calculateConversationalScore,
  optimizeForVoiceSearch,
  validateVoiceReadiness
};
