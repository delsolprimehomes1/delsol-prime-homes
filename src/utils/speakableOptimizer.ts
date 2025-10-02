/**
 * Optimize content for voice search and speakable markup
 * Ensures content is between 40-60 words for optimal voice output
 */

interface SpeakableBlock {
  text: string;
  wordCount: number;
  type: 'summary' | 'answer' | 'takeaway';
}

const MIN_WORDS = 40;
const MAX_WORDS = 60;
const OPTIMAL_WORDS = 50;

/**
 * Generate a speakable summary from article content
 */
export function generateSpeakableSummary(
  content: string,
  excerpt?: string
): SpeakableBlock {
  // Use excerpt if available and within range
  if (excerpt) {
    const excerptWords = countWords(excerpt);
    if (excerptWords >= MIN_WORDS && excerptWords <= MAX_WORDS) {
      return {
        text: excerpt,
        wordCount: excerptWords,
        type: 'summary'
      };
    }
  }

  // Extract first paragraph from content
  const firstParagraph = extractFirstParagraph(content);
  const wordCount = countWords(firstParagraph);

  // If within range, use as is
  if (wordCount >= MIN_WORDS && wordCount <= MAX_WORDS) {
    return {
      text: firstParagraph,
      wordCount,
      type: 'summary'
    };
  }

  // If too short, expand
  if (wordCount < MIN_WORDS) {
    const expanded = expandToOptimalLength(content, firstParagraph);
    return {
      text: expanded,
      wordCount: countWords(expanded),
      type: 'summary'
    };
  }

  // If too long, truncate
  const truncated = truncateToOptimalLength(firstParagraph);
  return {
    text: truncated,
    wordCount: countWords(truncated),
    type: 'summary'
  };
}

/**
 * Generate speakable answer from FAQ answer text
 */
export function generateSpeakableAnswer(answer: string): SpeakableBlock {
  const wordCount = countWords(answer);

  if (wordCount >= MIN_WORDS && wordCount <= MAX_WORDS) {
    return {
      text: answer,
      wordCount,
      type: 'answer'
    };
  }

  if (wordCount > MAX_WORDS) {
    const truncated = truncateToOptimalLength(answer);
    return {
      text: truncated,
      wordCount: countWords(truncated),
      type: 'answer'
    };
  }

  // If too short, return as is (better than nothing)
  return {
    text: answer,
    wordCount,
    type: 'answer'
  };
}

/**
 * Generate speakable takeaways from content
 */
export function generateSpeakableTakeaways(content: string): SpeakableBlock[] {
  const takeaways: SpeakableBlock[] = [];
  
  // Look for bullet points or numbered lists
  const listItems = extractListItems(content);
  
  for (const item of listItems) {
    const wordCount = countWords(item);
    
    // Only include items that are close to optimal length
    if (wordCount >= 20 && wordCount <= MAX_WORDS) {
      takeaways.push({
        text: item,
        wordCount,
        type: 'takeaway'
      });
    }
  }
  
  return takeaways.slice(0, 3); // Limit to 3 takeaways
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Extract first paragraph from markdown content
 */
function extractFirstParagraph(content: string): string {
  const paragraphs = content
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0 && !p.startsWith('#') && !p.startsWith('!['));
  
  return paragraphs[0] || '';
}

/**
 * Expand text to optimal length by adding subsequent sentences
 */
function expandToOptimalLength(content: string, initialText: string): string {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  let result = initialText;
  let currentWords = countWords(result);
  
  for (const sentence of sentences) {
    if (result.includes(sentence)) continue;
    
    const sentenceWords = countWords(sentence);
    if (currentWords + sentenceWords <= MAX_WORDS) {
      result += ' ' + sentence.trim();
      currentWords += sentenceWords;
    }
    
    if (currentWords >= MIN_WORDS) break;
  }
  
  return result.trim();
}

/**
 * Truncate text to optimal length at sentence boundaries
 */
function truncateToOptimalLength(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  let result = '';
  let currentWords = 0;
  
  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);
    
    if (currentWords + sentenceWords <= OPTIMAL_WORDS) {
      result += sentence;
      currentWords += sentenceWords;
    } else {
      break;
    }
  }
  
  return result.trim() || text.substring(0, 300) + '...';
}

/**
 * Extract list items from markdown content
 */
function extractListItems(content: string): string[] {
  const items: string[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Match bullet points (-, *, +) or numbered lists (1., 2., etc.)
    const match = trimmed.match(/^[-*+]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
    if (match) {
      items.push(cleanMarkdown(match[1]));
    }
  }
  
  return items;
}

/**
 * Clean markdown formatting from text
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove bold/italic
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .trim();
}

/**
 * Validate speakable block meets requirements
 */
export function isValidSpeakable(block: SpeakableBlock): boolean {
  return (
    block.text.length > 0 &&
    block.wordCount >= MIN_WORDS &&
    block.wordCount <= MAX_WORDS
  );
}

/**
 * Get optimization score for speakable content
 */
export function getSpeakableScore(block: SpeakableBlock): number {
  if (!isValidSpeakable(block)) return 0;
  
  // Optimal range is 45-55 words
  if (block.wordCount >= 45 && block.wordCount <= 55) return 100;
  if (block.wordCount >= 40 && block.wordCount <= 60) return 90;
  
  // Outside optimal range
  const distance = Math.min(
    Math.abs(block.wordCount - MIN_WORDS),
    Math.abs(block.wordCount - MAX_WORDS)
  );
  
  return Math.max(0, 90 - distance * 5);
}
