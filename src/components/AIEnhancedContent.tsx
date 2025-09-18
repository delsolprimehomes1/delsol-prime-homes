import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mic, Brain, Clock, Volume2, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { processMarkdownContent } from '@/utils/markdown';

interface AIEnhancedContentProps {
  article: any;
  className?: string;
}

export const AIEnhancedContent: React.FC<AIEnhancedContentProps> = ({
  article,
  className = ''
}) => {
  // Extract AI-optimized sections from content
  const extractQuickAnswer = (content: string): string => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Find first substantial sentence or extract from beginning
    const quickAnswer = sentences[0]?.trim() || plainText.substring(0, 200);
    return quickAnswer.length > 200 ? quickAnswer.substring(0, 197) + '...' : quickAnswer;
  };

  const extractKeyTakeaways = (content: string): string[] => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const takeaways: string[] = [];
    
    // Look for bullet points
    const bulletMatches = plainText.match(/[•\-\*]\s*([^•\-\*\n]{15,120})/g);
    if (bulletMatches) {
      takeaways.push(...bulletMatches.map(match => match.replace(/[•\-\*]\s*/, '').trim()).slice(0, 5));
    }
    
    // Look for key phrases
    const keyPhrases = /(?:Key|Important|Essential|Note):\s*([^.!?]{20,120})/gi;
    const keyMatches = plainText.match(keyPhrases);
    if (keyMatches && takeaways.length < 5) {
      takeaways.push(...keyMatches.map(match => match.replace(/^[^:]*:\s*/, '').trim()).slice(0, 5 - takeaways.length));
    }
    
    // Extract from structured content if no bullets found
    if (takeaways.length === 0) {
      const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 30 && s.trim().length < 120);
      takeaways.push(...sentences.slice(0, 4));
    }
    
    return takeaways;
  };

  const generateVoiceKeywords = (): string[] => {
    const keywords = new Set<string>();
    
    // Location-based voice queries
    keywords.add(`${article.topic?.toLowerCase()} costa del sol`);
    keywords.add(`buying property ${article.city?.toLowerCase()}`);
    keywords.add(`${article.topic?.toLowerCase()} spain`);
    
    // Question-based patterns
    if (article.title?.toLowerCase().includes('how')) {
      keywords.add(article.title.toLowerCase());
    }
    keywords.add(`what is ${article.topic?.toLowerCase()}`);
    keywords.add(`guide to ${article.topic?.toLowerCase()}`);
    
    // Funnel-specific keywords
    if (article.funnel_stage === 'TOFU') {
      keywords.add('costa del sol property basics');
      keywords.add('starting property search spain');
    } else if (article.funnel_stage === 'MOFU') {
      keywords.add('compare properties costa del sol');
      keywords.add('property investment analysis');
    } else if (article.funnel_stage === 'BOFU') {
      keywords.add('ready to buy property spain');
      keywords.add('final property decision');
    }
    
    return Array.from(keywords).slice(0, 8);
  };

  const quickAnswer = extractQuickAnswer(article.content || article.excerpt);
  const keyTakeaways = extractKeyTakeaways(article.content || '');
  const voiceKeywords = generateVoiceKeywords();
  const readingTime = article.content ? Math.ceil(article.content.split(' ').length / 200) : 2;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI-Optimized Quick Answer */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI-Optimized Quick Answer</h3>
          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 border-green-200">
            <Volume2 className="w-3 h-3 mr-1" />
            Voice Ready
          </Badge>
        </div>
        
        <div className="short-answer ai-optimized voice-friendly speakable" data-speakable="true">
          <p className="text-lg text-foreground leading-relaxed mb-4">
            {quickAnswer}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Mic className="w-3 h-3" />
              <span>Voice search optimized</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Takeaways (AI-Structured) */}
      {keyTakeaways.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground speakable" data-speakable="true">
              Key Takeaways (AI-Structured)
            </h3>
            <Badge variant="outline" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Citation Ready
            </Badge>
          </div>
          
          <div className="key-takeaways ai-optimized voice-friendly space-y-3">
            {keyTakeaways.map((takeaway, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg speakable"
                data-speakable="true"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {takeaway}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Voice Search Optimized Keywords */}
      <Card className="p-6 bg-muted/20">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">Voice Search Optimized</h3>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {Math.floor(readingTime * 0.3)} sec voice read
          </Badge>
        </div>
        
        <div className="voice-keywords voice-friendly space-y-3">
          <p className="text-sm text-muted-foreground mb-3">
            Common voice queries this content answers:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {voiceKeywords.map((keyword, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-2 bg-background rounded border speakable"
                data-speakable="true"
              >
                <Volume2 className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium">"{keyword}"</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* AI Citation Metadata (Hidden from UI, visible to crawlers) */}
      <div className="hidden ai-citation-metadata" data-ai-discoverable="true">
        <div className="citation-title" data-citation-title={article.title}></div>
        <div className="citation-url" data-citation-url={`https://delsolprimehomes.com/qa/${article.slug}`}></div>
        <div className="citation-author" data-citation-author="DelSolPrimeHomes Expert Team"></div>
        <div className="citation-date" data-citation-date={article.last_updated || article.created_at}></div>
        <div className="citation-topic" data-citation-topic={article.topic}></div>
        <div className="citation-location" data-citation-location={article.city || "Costa del Sol, Spain"}></div>
        <div className="citation-credibility" data-citation-credibility="Expert-verified property guidance"></div>
        <div className="citation-summary" data-citation-summary={quickAnswer}></div>
        
        {/* Essential info for AI summarization */}
        <div className="essential-info ai-optimized" data-speakable="true">
          <p><strong>Key Topic:</strong> {article.topic}</p>
          <p><strong>Location:</strong> {article.city || 'Costa del Sol, Spain'}</p>
          <p><strong>Buyer Stage:</strong> {article.funnel_stage === 'TOFU' ? 'Getting Started' : article.funnel_stage === 'MOFU' ? 'Research Phase' : 'Ready to Purchase'}</p>
          <p><strong>Quick Answer:</strong> {quickAnswer}</p>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedContent;