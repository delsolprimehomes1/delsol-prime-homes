// AI Feed JSON generation for enhanced AI discovery

import { supabase } from '@/integrations/supabase/client';
import { detectArticleCity, generateGeoMetadata } from './geo-data';

export interface AIFeedItem {
  url: string;
  lang: string;
  title: string;
  short_answer: string;
  quick_answer: string[];
  updated_at: string;
  coords: { lat: number; lng: number };
  stage: string;
  ai_score?: number;
  citation_ready?: boolean;
  voice_ready?: boolean;
  word_count?: number;
  tags?: string[];
}

export interface AIFeedExport {
  generated_at: string;
  total_articles: number;
  citation_ready_count: number;
  voice_ready_count: number;
  average_ai_score: number;
  languages: string[];
  articles: AIFeedItem[];
  metadata: {
    site_url: string;
    content_type: 'qa_articles';
    target_audience: 'property_buyers';
    geographic_focus: 'costa_del_sol';
    update_frequency: 'weekly';
  };
}

// Extract short answer from content (first meaningful paragraph)
const extractShortAnswer = (content: string): string => {
  const paragraphs = content.split('\n').filter(p => p.trim().length > 50);
  
  if (paragraphs.length === 0) {
    return content.slice(0, 200).trim() + '...';
  }
  
  const firstParagraph = paragraphs[0].replace(/#+\s*/, '').trim();
  
  // Ensure it's 2-4 sentences for voice-friendly consumption
  const sentences = firstParagraph.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const shortAnswer = sentences.slice(0, 3).join('. ').trim();
  
  return shortAnswer.length > 20 ? shortAnswer : firstParagraph.slice(0, 250).trim();
};

// Generate quick answer bullets from content
const generateQuickAnswerBullets = (content: string, title: string): string[] => {
  const bullets: string[] = [];
  
  // Look for existing bullet points or numbered lists
  const bulletMatches = content.match(/^[•\-\*\d\.]\s+(.+)$/gm);
  if (bulletMatches && bulletMatches.length >= 3) {
    return bulletMatches
      .slice(0, 5)
      .map(bullet => bullet.replace(/^[•\-\*\d\.]\s*/, '').trim())
      .filter(bullet => bullet.length > 10 && bullet.length < 100);
  }
  
  // Generate bullets from key sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keywordPhrases = [
    'cost', 'price', 'fee', 'tax', 'required', 'need', 'must',
    'process', 'step', 'how to', 'when', 'where', 'what', 'why'
  ];
  
  sentences.forEach(sentence => {
    if (bullets.length >= 4) return;
    
    const cleanSentence = sentence.trim();
    const hasKeyword = keywordPhrases.some(keyword => 
      cleanSentence.toLowerCase().includes(keyword)
    );
    
    if (hasKeyword && cleanSentence.length < 120) {
      bullets.push(cleanSentence);
    }
  });
  
  // Fallback: generate generic bullets
  if (bullets.length < 2) {
    bullets.push(`${title.replace(/^(What|How|When|Where|Why)\s*/i, '')} explained`);
    bullets.push('Key information for Costa del Sol property buyers');
    bullets.push('Updated regulations and requirements');
    bullets.push('Expert guidance and recommendations');
  }
  
  return bullets.slice(0, 4);
};

// Generate AI feed for all articles
export const generateAIFeed = async (): Promise<AIFeedExport> => {
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }

  const citationReadyArticles = articles?.filter(article => 
    article.citation_ready && article.content.length >= 1200
  ) || [];

  const aiItems: AIFeedItem[] = citationReadyArticles.map(article => {
    const city = detectArticleCity(article);
    const geoData = generateGeoMetadata(city);
    const mainCoords = geoData.coordinates[geoData.mainCity || 'Marbella'];
    
    return {
      url: `https://delsolprimehomes.com/qa/${article.slug}`,
      lang: article.language || 'en',
      title: article.title,
      short_answer: extractShortAnswer(article.content),
      quick_answer: generateQuickAnswerBullets(article.content, article.title),
      updated_at: article.updated_at || article.created_at,
      coords: mainCoords,
      stage: article.funnel_stage || 'consideration',
      ai_score: article.ai_optimization_score || 0,
      citation_ready: article.citation_ready || false,
      voice_ready: article.voice_search_ready || false,
      word_count: article.content.length,
      tags: article.tags || []
    };
  });

  const totalAIScore = aiItems.reduce((sum, item) => sum + (item.ai_score || 0), 0);
  const avgScore = aiItems.length > 0 ? totalAIScore / aiItems.length : 0;
  const languages = [...new Set(aiItems.map(item => item.lang))];

  return {
    generated_at: new Date().toISOString(),
    total_articles: articles?.length || 0,
    citation_ready_count: citationReadyArticles.length,
    voice_ready_count: aiItems.filter(item => item.voice_ready).length,
    average_ai_score: Math.round(avgScore * 10) / 10,
    languages,
    articles: aiItems,
    metadata: {
      site_url: 'https://delsolprimehomes.com',
      content_type: 'qa_articles',
      target_audience: 'property_buyers',
      geographic_focus: 'costa_del_sol',
      update_frequency: 'weekly'
    }
  };
};

// Generate AI-optimized sitemap for citation-ready content
export const generateAISitemap = async (): Promise<string> => {
  const { data: articles } = await supabase
    .from('qa_articles')
    .select('slug, updated_at, ai_optimization_score, citation_ready, language')
    .eq('citation_ready', true)
    .gte('ai_optimization_score', 8)
    .order('ai_optimization_score', { ascending: false });

  if (!articles) return '';

  const currentDate = new Date().toISOString().split('T')[0];
  
  const urlEntries = articles.map(article => `  <url>
    <loc>https://delsolprimehomes.com/qa/${article.slug}</loc>
    <lastmod>${article.updated_at?.split('T')[0] || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <ai:score>${article.ai_optimization_score}</ai:score>
    <ai:citation_ready>true</ai:citation_ready>
    <ai:language>${article.language || 'en'}</ai:language>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:ai="https://delsolprimehomes.com/schemas/ai-optimization/1.0">
  
  <!-- AI-Optimized Content for Citation and Discovery -->
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Total citation-ready articles: ${articles.length} -->
  
${urlEntries}
  
</urlset>`;
};