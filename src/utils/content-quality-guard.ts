// Content Quality Guard - Compile-time enforcement for AI-ready content
// Ensures all QA articles meet minimum standards for AI citation and voice search

export interface ContentQualityCheck {
  isValid: boolean;
  charCount: number;
  meetsMinimum: boolean;
  hasShortAnswer: boolean;
  hasQuickAnswer: boolean;
  shouldNoIndex: boolean;
  issues: string[];
  recommendations: string[];
}

export interface VoiceFriendlyCheck {
  answersInFirstSentence: boolean;
  usesPlainTerms: boolean;
  usesDigitsNotWords: boolean;
  avoidsLongIntros: boolean;
  score: number;
}

const MIN_BODY_CHARS = 1200;
const MAX_INTRO_CHARS = 150;

// Extract short answer from content for voice optimization
export const extractShortAnswer = (content: string, title: string): string => {
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Find sentence that best answers the question
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const scoredSentences = sentences.map(sentence => {
    const sentenceLower = sentence.toLowerCase();
    const score = titleWords.reduce((acc, word) => {
      return acc + (sentenceLower.includes(word) ? 1 : 0);
    }, 0);
    return { sentence: sentence.trim(), score };
  });
  
  const bestSentence = scoredSentences.sort((a, b) => b.score - a.score)[0];
  let shortAnswer = bestSentence?.sentence || sentences[0] || plainText.substring(0, 200);
  
  // Ensure it's 2-4 sentences and voice-friendly
  const answerSentences = shortAnswer.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (answerSentences.length > 4) {
    shortAnswer = answerSentences.slice(0, 4).join('. ') + '.';
  }
  
  // Ensure minimum length but not too long
  if (shortAnswer.length < 100) {
    const additionalSentences = sentences.slice(1, 3);
    shortAnswer += ' ' + additionalSentences.join('. ');
  }
  
  if (shortAnswer.length > 300) {
    shortAnswer = shortAnswer.substring(0, 297) + '...';
  }
  
  return shortAnswer.trim();
};

// Generate quick answer bullet points
export const generateQuickAnswer = (content: string, title: string, topic: string): string[] => {
  const plainText = content.replace(/<[^>]*>/g, '');
  const bullets: string[] = [];
  
  // Look for existing bullet points
  const existingBullets = plainText.match(/[•\-\*]\s*([^•\-\*\n]{10,100})/g);
  if (existingBullets && existingBullets.length >= 3) {
    return existingBullets
      .map(bullet => bullet.replace(/[•\-\*]\s*/, '').trim())
      .slice(0, 4);
  }
  
  // Generate topic-specific bullets based on common patterns
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Extract key facts using common patterns
  const patterns = [
    /(?:is called|known as|called)\s+([^,.]{5,30})/gi,
    /(?:costs?|price|fee).*?([0-9]+(?:\.[0-9]+)?%?.*?)/gi,
    /(?:paid|due|required).*?(yearly|monthly|annually|quarterly)/gi,
    /(?:ranges?|between).*?([0-9]+(?:\.[0-9]+)?%?.*?to.*?[0-9]+(?:\.[0-9]+)?%?)/gi,
  ];
  
  patterns.forEach(pattern => {
    const matches = plainText.match(pattern);
    if (matches && bullets.length < 4) {
      matches.slice(0, 2).forEach(match => {
        const cleaned = match.replace(/^\w+\s+/, '').trim();
        if (cleaned.length > 10 && cleaned.length < 80) {
          bullets.push(cleaned);
        }
      });
    }
  });
  
  // If still no bullets, extract from first few sentences
  if (bullets.length < 3) {
    sentences.slice(0, 4).forEach(sentence => {
      if (bullets.length < 4 && sentence.length > 15 && sentence.length < 100) {
        bullets.push(sentence.trim());
      }
    });
  }
  
  // Ensure we have at least 3 bullets
  while (bullets.length < 3 && sentences.length > bullets.length) {
    const sentence = sentences[bullets.length];
    if (sentence && sentence.length > 10) {
      bullets.push(sentence.trim());
    } else {
      break;
    }
  }
  
  return bullets.slice(0, 4);
};

// Check content quality against AI citation standards
export const checkContentQuality = (article: any): ContentQualityCheck => {
  const content = article.content || '';
  const title = article.title || '';
  const excerpt = article.excerpt || '';
  
  const plainText = content.replace(/<[^>]*>/g, '');
  const charCount = plainText.length;
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check minimum character count
  const meetsMinimum = charCount >= MIN_BODY_CHARS;
  if (!meetsMinimum) {
    issues.push(`Content too short: ${charCount} chars (minimum: ${MIN_BODY_CHARS})`);
    recommendations.push(`Expand content by ${MIN_BODY_CHARS - charCount} characters with detailed examples and steps`);
  }
  
  // Check for short answer capability
  const shortAnswer = extractShortAnswer(content, title);
  const hasShortAnswer = shortAnswer.length >= 50 && shortAnswer.length <= 300;
  if (!hasShortAnswer) {
    issues.push('Cannot generate quality short answer from content');
    recommendations.push('Add clear, direct answer in first paragraph');
  }
  
  // Check for quick answer bullet points
  const quickAnswerBullets = generateQuickAnswer(content, title, article.topic);
  const hasQuickAnswer = quickAnswerBullets.length >= 3;
  if (!hasQuickAnswer) {
    issues.push('Insufficient content for structured quick answer');
    recommendations.push('Add key facts in bullet-point format');
  }
  
  // Check question format title
  const isQuestionFormat = /^(how|what|where|when|why|which|can|should|do|does|is|are|will)/i.test(title);
  if (!isQuestionFormat) {
    issues.push('Title not in question format for voice search');
    recommendations.push('Reformat title as a natural question');
  }
  
  // Check excerpt quality
  if (!excerpt || excerpt.length < 100) {
    issues.push('Missing or insufficient excerpt');
    recommendations.push('Add comprehensive excerpt (150-200 characters)');
  }
  
  // Determine if should be noindexed
  const shouldNoIndex = !meetsMinimum || !hasShortAnswer || !hasQuickAnswer;
  
  return {
    isValid: issues.length === 0,
    charCount,
    meetsMinimum,
    hasShortAnswer,
    hasQuickAnswer,
    shouldNoIndex,
    issues,
    recommendations
  };
};

// Check voice-friendly formatting
export const checkVoiceFriendly = (content: string, title: string): VoiceFriendlyCheck => {
  const plainText = content.replace(/<[^>]*>/g, '');
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const firstSentence = sentences[0] || '';
  
  // Check if answers in first sentence
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const firstSentenceLower = firstSentence.toLowerCase();
  const answersInFirstSentence = titleWords.some(word => 
    firstSentenceLower.includes(word)
  ) && firstSentence.length > 30;
  
  // Check for plain terms (avoid jargon)
  const jargonWords = ['aforementioned', 'heretofore', 'pursuant', 'whereby', 'hereinafter'];
  const usesPlainTerms = !jargonWords.some(jargon => 
    plainText.toLowerCase().includes(jargon)
  );
  
  // Check for digits vs spelled numbers
  const numberWords = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/gi;
  const hasNumberWords = numberWords.test(plainText);
  const hasDigits = /\b\d+\b/.test(plainText);
  const usesDigitsNotWords = hasDigits && !hasNumberWords;
  
  // Check intro length
  const firstParagraph = plainText.split('\n')[0] || firstSentence;
  const avoidsLongIntros = firstParagraph.length <= MAX_INTRO_CHARS;
  
  // Calculate score
  let score = 0;
  if (answersInFirstSentence) score += 25;
  if (usesPlainTerms) score += 25;
  if (usesDigitsNotWords) score += 25;
  if (avoidsLongIntros) score += 25;
  
  return {
    answersInFirstSentence,
    usesPlainTerms,
    usesDigitsNotWords,
    avoidsLongIntros,
    score
  };
};

// Generate noindex meta tag for low-quality content
export const generateNoIndexMeta = (shouldNoIndex: boolean) => {
  if (shouldNoIndex) {
    return {
      name: 'robots',
      content: 'noindex, nofollow'
    };
  }
  return null;
};

// Batch check all articles for quality issues
export const batchCheckContentQuality = async () => {
  // This would be implemented to check all articles
  // For now, return structure for integration
  return {
    totalArticles: 0,
    belowMinimum: 0,
    missingShortAnswer: 0,
    missingQuickAnswer: 0,
    shouldNoIndex: 0,
    recommendations: []
  };
};