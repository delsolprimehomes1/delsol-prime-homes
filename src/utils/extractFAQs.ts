/**
 * Extract FAQ (Question & Answer) pairs from markdown content
 */

interface FAQ {
  question: string;
  answer: string;
}

/**
 * Extract FAQs from markdown content
 * Looks for headings ending with "?" and extracts following content as answers
 */
export function extractFAQsFromMarkdown(content: string): FAQ[] {
  const faqs: FAQ[] = [];
  
  if (!content) return faqs;

  // Split content into lines
  const lines = content.split('\n');
  
  let currentQuestion: string | null = null;
  let currentAnswer: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line is a heading with a question (ends with ?)
    const questionMatch = line.match(/^#{1,3}\s+(.+\?)\s*$/);
    
    if (questionMatch) {
      // Save previous FAQ if exists
      if (currentQuestion && currentAnswer.length > 0) {
        faqs.push({
          question: currentQuestion,
          answer: cleanAnswer(currentAnswer.join(' '))
        });
      }
      
      // Start new FAQ
      currentQuestion = questionMatch[1];
      currentAnswer = [];
    } else if (currentQuestion && line) {
      // Skip other headings
      if (line.startsWith('#')) {
        // Save current FAQ and reset
        if (currentAnswer.length > 0) {
          faqs.push({
            question: currentQuestion,
            answer: cleanAnswer(currentAnswer.join(' '))
          });
        }
        currentQuestion = null;
        currentAnswer = [];
      } else {
        // Add to current answer
        currentAnswer.push(line);
      }
    }
  }
  
  // Don't forget the last FAQ
  if (currentQuestion && currentAnswer.length > 0) {
    faqs.push({
      question: currentQuestion,
      answer: cleanAnswer(currentAnswer.join(' '))
    });
  }
  
  return faqs;
}

/**
 * Clean answer text by removing markdown formatting and limiting length
 */
function cleanAnswer(text: string): string {
  let cleaned = text
    // Remove markdown links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bold/italic markers
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  // Limit to first 300 characters for schema (reasonable answer length)
  if (cleaned.length > 300) {
    cleaned = cleaned.substring(0, 297) + '...';
  }
  
  return cleaned;
}

/**
 * Extract FAQs from speakable_questions JSONB field
 */
export function extractFAQsFromJSON(speakableQuestions: any[]): FAQ[] {
  if (!Array.isArray(speakableQuestions)) return [];
  
  return speakableQuestions
    .filter(item => item.question && item.answer)
    .map(item => ({
      question: item.question,
      answer: item.answer
    }));
}

/**
 * Combine FAQs from multiple sources
 */
export function combineFAQs(
  contentFAQs: FAQ[],
  jsonFAQs: FAQ[],
  maxFAQs: number = 10
): FAQ[] {
  const allFAQs = [...jsonFAQs, ...contentFAQs];
  
  // Remove duplicates based on question similarity
  const uniqueFAQs: FAQ[] = [];
  const seenQuestions = new Set<string>();
  
  for (const faq of allFAQs) {
    const normalizedQuestion = faq.question.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenQuestions.has(normalizedQuestion)) {
      seenQuestions.add(normalizedQuestion);
      uniqueFAQs.push(faq);
    }
  }
  
  // Limit to max FAQs
  return uniqueFAQs.slice(0, maxFAQs);
}

/**
 * Validate FAQ structure
 */
export function isValidFAQ(faq: any): faq is FAQ {
  return (
    faq &&
    typeof faq.question === 'string' &&
    faq.question.length > 0 &&
    typeof faq.answer === 'string' &&
    faq.answer.length > 0
  );
}
