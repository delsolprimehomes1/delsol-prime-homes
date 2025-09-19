import { supabase } from '@/integrations/supabase/client';

interface QAArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  funnel_stage: string;
  topic: string;
  language: string;
  tags?: string[];
  location_focus?: string;
  target_audience?: string;
  markdown_frontmatter?: any;
}

interface VoiceSearchOptimization {
  originalTitle: string;
  optimizedTitle: string;
  naturalLanguageAnswer: string;
  speakableContent: string[];
  voiceKeywords: string[];
  readingTime: number;
  optimizationScore: number;
}

/**
 * Generate voice search optimized content for QA articles
 */
export function generateVoiceSearchOptimization(article: QAArticle): VoiceSearchOptimization {
  const optimizedTitle = optimizeForVoiceSearch(article.title, article.topic);
  const naturalLanguageAnswer = generateNaturalAnswer(article);
  const speakableContent = extractSpeakableContent(article);
  const voiceKeywords = generateVoiceKeywords(article);
  const readingTime = calculateReadingTime(article.content);
  const optimizationScore = calculateVoiceOptimizationScore(article);

  return {
    originalTitle: article.title,
    optimizedTitle,
    naturalLanguageAnswer,
    speakableContent,
    voiceKeywords,
    readingTime,
    optimizationScore
  };
}

/**
 * Optimize title for voice search queries
 */
function optimizeForVoiceSearch(title: string, topic: string): string {
  // If already a question, return as is
  if (/^(how|what|where|when|why|which|who)/i.test(title)) {
    return title;
  }

  // Convert statements to questions based on topic and content
  const questionStarters = {
    'investment': 'How to',
    'legal': 'What are the',
    'lifestyle': 'What is',
    'buying': 'How to',
    'selling': 'How to',
    'rental': 'What are',
    'taxation': 'How does',
    'finance': 'What are',
    'location': 'What makes',
    'general': 'What should I know about'
  };

  const topicKey = Object.keys(questionStarters).find(key => 
    topic.toLowerCase().includes(key)
  ) || 'general';

  const starter = questionStarters[topicKey as keyof typeof questionStarters];
  
  // Clean up the title for question format
  const cleanTitle = title.toLowerCase()
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `${starter} ${cleanTitle}?`;
}

/**
 * Generate natural language answer for voice assistants
 */
function generateNaturalAnswer(article: QAArticle): string {
  const location = article.location_focus || 'Costa del Sol';
  const topic = article.topic;
  
  // Extract first meaningful sentence from content
  const cleanContent = article.content.replace(/<[^>]*>/g, '');
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  let baseAnswer = '';
  if (sentences.length > 0) {
    baseAnswer = sentences[0].trim();
  } else {
    baseAnswer = article.excerpt;
  }

  // Add natural language context for voice
  const voiceIntro = getVoiceIntroduction(topic, location);
  const voiceContext = getVoiceContext(article.funnel_stage);
  
  return `${voiceIntro} ${baseAnswer}. ${voiceContext}`;
}

/**
 * Extract content suitable for voice output
 */
function extractSpeakableContent(article: QAArticle): string[] {
  const content = article.content.replace(/<[^>]*>/g, '');
  const location = article.location_focus || 'Costa del Sol';
  
  const speakableItems: string[] = [];
  
  // Add optimized excerpt
  if (article.excerpt) {
    speakableItems.push(article.excerpt);
  }
  
  // Extract bullet points and lists
  const bulletPoints = content.match(/^\s*[-*•]\s+(.+)$/gm);
  if (bulletPoints) {
    bulletPoints.slice(0, 3).forEach(point => {
      const cleanPoint = point.replace(/^\s*[-*•]\s+/, '').trim();
      if (cleanPoint.length > 20 && cleanPoint.length < 150) {
        speakableItems.push(cleanPoint);
      }
    });
  }
  
  // Extract short, informative sentences
  const sentences = content.split(/[.!?]+/).filter(s => {
    const trimmed = s.trim();
    return trimmed.length > 30 && trimmed.length < 200 && 
           trimmed.includes(location) || trimmed.toLowerCase().includes('costa del sol');
  });
  
  sentences.slice(0, 2).forEach(sentence => {
    speakableItems.push(sentence.trim());
  });
  
  return speakableItems.slice(0, 5); // Limit to 5 speakable items
}

/**
 * Generate voice search keywords
 */
function generateVoiceKeywords(article: QAArticle): string[] {
  const topic = article.topic;
  const location = article.location_focus || 'Costa del Sol';
  const funnelStage = article.funnel_stage;
  
  const keywords: string[] = [];
  
  // Base voice search patterns
  const basePatterns = [
    `how to ${topic.toLowerCase()} in ${location}`,
    `what is ${topic.toLowerCase()} like in ${location}`,
    `${location} ${topic.toLowerCase()} guide`,
    `best ${topic.toLowerCase()} advice ${location}`,
    `${topic.toLowerCase()} tips ${location}`
  ];
  
  keywords.push(...basePatterns);
  
  // Funnel-specific patterns
  if (funnelStage === 'TOFU') {
    keywords.push(
      `learn about ${topic.toLowerCase()} ${location}`,
      `${topic.toLowerCase()} information ${location}`,
      `understanding ${topic.toLowerCase()} in Spain`
    );
  } else if (funnelStage === 'MOFU') {
    keywords.push(
      `compare ${topic.toLowerCase()} options ${location}`,
      `best ${topic.toLowerCase()} services ${location}`,
      `${topic.toLowerCase()} costs ${location}`
    );
  } else if (funnelStage === 'BOFU') {
    keywords.push(
      `${topic.toLowerCase()} help ${location}`,
      `hire ${topic.toLowerCase()} expert ${location}`,
      `${topic.toLowerCase()} consultation ${location}`
    );
  }
  
  // Location-specific long-tail keywords
  const locationKeywords = [
    `${location} property ${topic.toLowerCase()}`,
    `expat ${topic.toLowerCase()} ${location}`,
    `international ${topic.toLowerCase()} Spain`,
    `British ${topic.toLowerCase()} ${location}`,
    `European ${topic.toLowerCase()} Costa del Sol`
  ];
  
  keywords.push(...locationKeywords);
  
  return keywords.slice(0, 12); // Limit to 12 keywords
}

/**
 * Calculate reading time for voice output
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 150; // Average speaking speed
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Calculate voice optimization score
 */
function calculateVoiceOptimizationScore(article: QAArticle): number {
  let score = 0;
  
  // Question format (25 points)
  if (/^(how|what|where|when|why|which|who)/i.test(article.title)) {
    score += 25;
  }
  
  // Natural language content (20 points)
  const hasNaturalLanguage = !/<[^>]*>/g.test(article.excerpt || '');
  if (hasNaturalLanguage) score += 20;
  
  // Location context (20 points)
  const locationMentions = (article.content.match(/costa del sol|marbella|estepona|spain/gi) || []).length;
  if (locationMentions >= 2) score += 20;
  else if (locationMentions >= 1) score += 10;
  
  // Answer length optimization (15 points)
  if (article.excerpt && article.excerpt.length >= 50 && article.excerpt.length <= 200) {
    score += 15;
  }
  
  // Structured content (10 points)
  const hasBulletPoints = /^\s*[-*•]\s+/m.test(article.content);
  if (hasBulletPoints) score += 10;
  
  // Speakable elements (10 points)
  const speakableElements = extractSpeakableContent(article);
  if (speakableElements.length >= 3) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Get voice introduction based on topic
 */
function getVoiceIntroduction(topic: string, location: string): string {
  const introductions = {
    'investment': `For property investment in ${location},`,
    'legal': `Regarding legal matters in ${location},`,
    'lifestyle': `When it comes to lifestyle in ${location},`,
    'buying': `For buying property in ${location},`,
    'selling': `When selling property in ${location},`,
    'rental': `For rental properties in ${location},`,
    'taxation': `Concerning taxes in ${location},`,
    'finance': `For financing in ${location},`,
    'location': `About ${location},`,
    'general': `In ${location},`
  };
  
  const topicKey = Object.keys(introductions).find(key => 
    topic.toLowerCase().includes(key)
  ) || 'general';
  
  return introductions[topicKey as keyof typeof introductions];
}

/**
 * Get voice context based on funnel stage
 */
function getVoiceContext(funnelStage: string): string {
  const contexts = {
    'TOFU': 'For more detailed information, you can explore our comprehensive property guides.',
    'MOFU': 'Our expert team can provide personalized guidance for your specific situation.',
    'BOFU': 'Contact our specialists today for immediate assistance with your property needs.'
  };
  
  return contexts[funnelStage as keyof typeof contexts] || contexts.TOFU;
}

/**
 * Batch optimize all articles for voice search
 */
export async function batchOptimizeForVoiceSearch(): Promise<{
  totalProcessed: number;
  optimizedCount: number;
  averageScore: number;
}> {
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('*');
  
  if (error) throw error;
  
  let optimizedCount = 0;
  let totalScore = 0;
  
  for (const article of articles as QAArticle[]) {
    const optimization = generateVoiceSearchOptimization(article);
    
    // Update article with voice search optimization
    const updates = {
      voice_search_ready: optimization.optimizationScore >= 70,
      markdown_frontmatter: {
        ...(article.markdown_frontmatter || {}),
        voiceSearch: {
          optimizedTitle: optimization.optimizedTitle,
          naturalAnswer: optimization.naturalLanguageAnswer,
          speakableContent: optimization.speakableContent,
          voiceKeywords: optimization.voiceKeywords,
          readingTime: optimization.readingTime,
          score: optimization.optimizationScore
        }
      }
    };
    
    const { error: updateError } = await supabase
      .from('qa_articles')
      .update(updates)
      .eq('id', article.id);
    
    if (!updateError) {
      optimizedCount++;
      totalScore += optimization.optimizationScore;
    }
  }
  
  return {
    totalProcessed: articles?.length || 0,
    optimizedCount,
    averageScore: optimizedCount > 0 ? Math.round(totalScore / optimizedCount) : 0
  };
}