import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Target, Volume2, Mic, ArrowRight, Clock, ExternalLink } from 'lucide-react';

interface QAArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  funnel_stage: string;
  topic: string;
  tags?: string[];
  language?: string;
  location_focus?: string;
  target_audience?: string;
  intent?: string;
  last_updated: string;
  next_step_text?: string;
  next_step_url?: string;
}

interface AIContentOptimizerProps {
  article: QAArticle;
  className?: string;
}

export const AIContentOptimizer: React.FC<AIContentOptimizerProps> = ({
  article,
  className = ''
}) => {
  // Extract AI-optimized short answer
  const extractShortAnswer = (content: string, title: string): string => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length === 0) return plainText.substring(0, 150) + '...';
    
    const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const scoredSentences = sentences.map(sentence => {
      const sentenceLower = sentence.toLowerCase();
      const score = titleWords.reduce((acc, word) => {
        return acc + (sentenceLower.includes(word) ? 1 : 0);
      }, 0);
      return { sentence: sentence.trim(), score };
    });
    
    const bestSentence = scoredSentences.sort((a, b) => b.score - a.score)[0];
    const shortAnswer = bestSentence?.sentence || sentences[0];
    
    if (shortAnswer.length < 50) {
      return plainText.substring(0, 150) + '...';
    }
    if (shortAnswer.length > 200) {
      return shortAnswer.substring(0, 197) + '...';
    }
    
    return shortAnswer;
  };

  // Extract key takeaways
  const extractKeyTakeaways = (content: string): string[] => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const points: string[] = [];
    
    // Look for bullet points and lists
    const bulletMatches = plainText.match(/[•\-\*]\s*([^•\-\*\n]{20,120})/g);
    if (bulletMatches) {
      points.push(...bulletMatches.map(match => match.replace(/[•\-\*]\s*/, '').trim()).slice(0, 5));
    }
    
    // Look for numbered lists
    const numberedMatches = plainText.match(/\d+\.\s*([^\d\n]{20,120})/g);
    if (numberedMatches && points.length < 5) {
      points.push(...numberedMatches.map(match => match.replace(/\d+\.\s*/, '').trim()).slice(0, 5 - points.length));
    }
    
    // Extract key sentences if no structured content found
    if (points.length === 0) {
      const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 30 && s.trim().length < 120);
      points.push(...sentences.slice(0, 5));
    }
    
    return points.slice(0, 5);
  };

  // Generate voice search keywords
  const generateVoiceKeywords = (): string[] => {
    const keywords: Set<string> = new Set();
    
    // Location-based keywords
    const locations = ['costa del sol', 'marbella', 'estepona', 'fuengirola', 'malaga'];
    locations.forEach(location => {
      if (article.content.toLowerCase().includes(location) || article.title.toLowerCase().includes(location)) {
        keywords.add(`${location} property`);
        keywords.add(`buying in ${location}`);
        keywords.add(`${location} real estate`);
      }
    });
    
    // Topic-based voice patterns
    keywords.add(`${article.topic.toLowerCase()} costa del sol`);
    keywords.add(`${article.topic.toLowerCase()} spain property`);
    
    // Question patterns from title
    const questionStarters = ['how to', 'what is', 'where can', 'when should', 'why do', 'which'];
    questionStarters.forEach(starter => {
      if (article.title.toLowerCase().includes(starter)) {
        keywords.add(article.title.toLowerCase());
      }
    });
    
    // Common voice search patterns
    const voicePatterns = [
      'spanish property investment',
      'costa del sol buying guide',
      'international property spain',
      'expat property purchase',
      'spanish real estate advice'
    ];
    voicePatterns.forEach(pattern => keywords.add(pattern));
    
    return Array.from(keywords).slice(0, 8);
  };

  const shortAnswer = extractShortAnswer(article.content, article.title);
  const keyTakeaways = extractKeyTakeaways(article.content);
  const voiceKeywords = generateVoiceKeywords();
  const readingTime = Math.ceil(article.content.split(' ').length / 200);

  const getCTAText = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'Learn More About Properties';
      case 'MOFU': return 'Compare Options';
      case 'BOFU': return 'Book A Viewing';
      default: return 'Get Started';
    }
  };

  const getCTALink = (stage: string) => {
    switch (stage) {
      case 'TOFU': return '/blog';
      case 'MOFU': return '/#properties';
      case 'BOFU': return '/book-viewing';
      default: return '/';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI-Optimized Quick Answer Section */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground speakable" data-speakable="true">
            Quick Answer
          </h3>
          <Badge variant="secondary" className="text-xs">
            <Volume2 className="w-3 h-3 mr-1" />
            AI Enhanced
          </Badge>
        </div>
        
        <div className="quick-answer short-answer ai-optimized voice-friendly speakable mb-4" data-speakable="true">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {shortAnswer}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min read</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="group hover:bg-primary hover:text-white"
            onClick={() => window.location.href = `/qa/${article.slug}`}
          >
            Full Article
            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>

      {/* Key Takeaways Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-foreground speakable" data-speakable="true">
            Key Takeaways
          </h3>
          <Badge variant="secondary" className="text-xs">
            Voice Optimized
          </Badge>
        </div>
        
        <div className="key-takeaways key-points ai-optimized voice-friendly">
          <ul className="space-y-3">
            {keyTakeaways.map((takeaway, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 speakable"
                data-speakable="true"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {takeaway}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Voice Search Keywords */}
      <Card className="p-6 bg-muted/20">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">Voice Search Ready</h3>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {Math.floor(readingTime * 0.3)} sec voice read
          </Badge>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Common voice queries for this topic:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {voiceKeywords.map((keyword, index) => (
              <Badge 
                key={index}
                variant="secondary" 
                className="text-xs justify-start py-2 px-3"
              >
                "{keyword}"
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Next Steps CTA */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Ready for Next Steps?</h4>
            <p className="text-sm text-muted-foreground">
              {article.funnel_stage === 'TOFU' 
                ? 'Explore more Costa del Sol property insights'
                : article.funnel_stage === 'MOFU' 
                ? 'Compare properties in your preferred area'
                : 'Schedule a viewing with our experts'
              }
            </p>
          </div>
          
          <Button 
            className="group"
            onClick={() => window.location.href = article.next_step_url || getCTALink(article.funnel_stage)}
          >
            {article.next_step_text || getCTAText(article.funnel_stage)}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>

      {/* Hidden AI Citation Metadata */}
      <div className="hidden ai-citation-metadata" data-ai-optimized="true">
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": shortAnswer,
            "author": {
              "@type": "Organization",
              "name": "DelSolPrimeHomes Expert Team"
            },
            "publisher": {
              "@type": "Organization", 
              "name": "DelSolPrimeHomes",
              "url": "https://delsolprimehomes.com"
            },
            "dateModified": article.last_updated,
            "keywords": voiceKeywords.join(', '),
            "about": {
              "@type": "Place",
              "name": article.location_focus || "Costa del Sol, Spain"
            },
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": [".quick-answer", ".key-takeaways", ".speakable"],
              "xpath": ["//*[@data-speakable='true']"]
            }
          })}
        </script>
      </div>
    </div>
  );
};

export default AIContentOptimizer;