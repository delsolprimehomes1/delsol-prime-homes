// Voice-Friendly Content Formatter
// Optimizes content for voice search and AI assistant consumption

export interface VoiceFormattingRules {
  answerInFirstSentence: boolean;
  usePlainTerms: boolean;
  useDigitsNotWords: boolean;
  avoidLongIntros: boolean;
  maxIntroLength: number;
}

const DEFAULT_RULES: VoiceFormattingRules = {
  answerInFirstSentence: true,
  usePlainTerms: true,
  useDigitsNotWords: true,
  avoidLongIntros: true,
  maxIntroLength: 150
};

// Convert number words to digits for voice clarity
export const convertNumberWordsToDigits = (text: string): string => {
  const numberMap: Record<string, string> = {
    'one': '1',
    'two': '2', 
    'three': '3',
    'four': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8',
    'nine': '9',
    'ten': '10',
    'eleven': '11',
    'twelve': '12',
    'thirteen': '13',
    'fourteen': '14',
    'fifteen': '15',
    'sixteen': '16',
    'seventeen': '17',
    'eighteen': '18',
    'nineteen': '19',
    'twenty': '20',
    'thirty': '30',
    'forty': '40',
    'fifty': '50',
    'sixty': '60',
    'seventy': '70',
    'eighty': '80',
    'ninety': '90',
    'hundred': '100',
    'thousand': '1000',
    'million': '1000000'
  };

  let formatted = text;
  
  // Replace number words with digits
  Object.entries(numberMap).forEach(([word, digit]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    formatted = formatted.replace(regex, digit);
  });
  
  return formatted;
};

// Replace jargon with plain terms
export const simplifyJargon = (text: string): string => {
  const jargonMap: Record<string, string> = {
    'aforementioned': 'mentioned',
    'heretofore': 'until now',
    'pursuant to': 'according to',
    'whereby': 'where',
    'hereinafter': 'from now on',
    'notwithstanding': 'despite',
    'facilitate': 'help',
    'utilize': 'use',
    'commence': 'start',
    'terminate': 'end',
    'subsequent to': 'after',
    'prior to': 'before',
    'in order to': 'to',
    'with regard to': 'about',
    'in the event that': 'if',
    'at this point in time': 'now',
    'due to the fact that': 'because'
  };

  let simplified = text;
  
  Object.entries(jargonMap).forEach(([jargon, plain]) => {
    const regex = new RegExp(`\\b${jargon}\\b`, 'gi');
    simplified = simplified.replace(regex, plain);
  });
  
  return simplified;
};

// Create voice-friendly first sentence that answers the question
export const createAnsweringSentence = (content: string, title: string): string => {
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Extract key terms from question
  const questionWords = title.toLowerCase().match(/\b(what|how|where|when|why|which)\b/gi);
  const questionType = questionWords?.[0]?.toLowerCase() || 'what';
  
  // Get the core topic from title
  const coreTerms = title
    .toLowerCase()
    .replace(/^(what|how|where|when|why|which|is|are|can|should|do|does)\s+/i, '')
    .replace(/\?$/, '')
    .trim();
  
  // Find sentence that contains answer
  const answerSentence = sentences.find(sentence => {
    const sentenceLower = sentence.toLowerCase();
    return coreTerms.split(' ').some(term => 
      term.length > 3 && sentenceLower.includes(term)
    );
  }) || sentences[0];
  
  if (!answerSentence) return '';
  
  // Format as direct answer based on question type
  let formattedAnswer = answerSentence.trim();
  
  // Ensure it starts with the answer, not preamble
  if (questionType === 'what' && !formattedAnswer.toLowerCase().match(/^(the|it|this|that|[a-z]+ is|[a-z]+ are)/)) {
    // Extract the key definition/answer
    const definition = formattedAnswer.match(/is\s+([^.]{10,})/i);
    if (definition) {
      const topic = coreTerms.split(' ').slice(-2).join(' '); // Last 2 words usually the topic
      formattedAnswer = `${topic} is ${definition[1].trim()}`;
    }
  }
  
  // Keep it concise for voice
  if (formattedAnswer.length > 200) {
    formattedAnswer = formattedAnswer.substring(0, 197) + '...';
  }
  
  return formattedAnswer;
};

// Format content for voice optimization
export const formatForVoice = (content: string, title: string, rules = DEFAULT_RULES): string => {
  let formatted = content;
  
  // Apply plain terms
  if (rules.usePlainTerms) {
    formatted = simplifyJargon(formatted);
  }
  
  // Convert numbers to digits
  if (rules.useDigitsNotWords) {
    formatted = convertNumberWordsToDigits(formatted);
  }
  
  // Ensure direct answer in first sentence if needed
  if (rules.answerInFirstSentence) {
    const plainFormatted = formatted.replace(/<[^>]*>/g, '');
    const answeringSentence = createAnsweringSentence(plainFormatted, title);
    
    if (answeringSentence && !plainFormatted.startsWith(answeringSentence.substring(0, 50))) {
      // Prepend the answering sentence
      const firstParagraphEnd = formatted.indexOf('\n') > 0 ? formatted.indexOf('\n') : formatted.indexOf('</p>');
      if (firstParagraphEnd > 0) {
        formatted = answeringSentence + '. ' + formatted;
      }
    }
  }
  
  return formatted;
};

// Generate voice-optimized quick answer bullets
export const formatQuickAnswerBullets = (bullets: string[]): string[] => {
  return bullets.map(bullet => {
    let formatted = bullet.trim();
    
    // Remove redundant intro words
    formatted = formatted.replace(/^(The|A|An)\s+/i, '');
    
    // Convert numbers to digits
    formatted = convertNumberWordsToDigits(formatted);
    
    // Simplify jargon
    formatted = simplifyJargon(formatted);
    
    // Ensure it's concise
    if (formatted.length > 80) {
      formatted = formatted.substring(0, 77) + '...';
    }
    
    // Capitalize first letter
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
    return formatted;
  });
};

// Check if content meets voice-friendly criteria
export const isVoiceFriendly = (content: string, title: string): boolean => {
  const plainText = content.replace(/<[^>]*>/g, '');
  const firstSentence = plainText.split(/[.!?]+/)[0] || '';
  
  // Check if first sentence answers the question
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const answersDirectly = titleWords.some(word => 
    firstSentence.toLowerCase().includes(word)
  );
  
  // Check for jargon
  const jargonWords = ['aforementioned', 'heretofore', 'pursuant', 'whereby'];
  const hasJargon = jargonWords.some(jargon => 
    plainText.toLowerCase().includes(jargon)
  );
  
  // Check for spelled-out numbers in key facts
  const hasSpelledNumbers = /\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/i.test(plainText);
  
  return answersDirectly && !hasJargon && !hasSpelledNumbers;
};

// Generate voice search keywords
export const generateVoiceKeywords = (title: string, content: string, topic: string): string[] => {
  const keywords: Set<string> = new Set();
  
  // Add the full question
  keywords.add(title.toLowerCase());
  
  // Add variations without question words
  const coreQuestion = title.replace(/^(what|how|where|when|why|which|is|are|can|should|do|does)\s+/i, '').replace(/\?$/, '').trim();
  keywords.add(coreQuestion.toLowerCase());
  
  // Add "how to" variations
  if (title.toLowerCase().includes('how')) {
    keywords.add(`how to ${coreQuestion}`);
  }
  
  // Add location-specific variations
  const locations = ['costa del sol', 'spain', 'marbella', 'estepona'];
  locations.forEach(location => {
    if (content.toLowerCase().includes(location)) {
      keywords.add(`${coreQuestion} ${location}`);
      keywords.add(`${location} ${coreQuestion}`);
    }
  });
  
  // Add topic-based variations
  keywords.add(`${topic.toLowerCase()} ${coreQuestion}`);
  keywords.add(`${coreQuestion} ${topic.toLowerCase()}`);
  
  return Array.from(keywords).slice(0, 8);
};
