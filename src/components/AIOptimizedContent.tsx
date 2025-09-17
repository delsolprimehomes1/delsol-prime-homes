import React from 'react';
import { generateAIOptimizedContent, getEnhancedSpeakableSelectors } from '@/utils/ai-optimization';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Volume2, Target, Clock, MessageSquare } from 'lucide-react';

interface AIOptimizedContentProps {
  article: any;
  className?: string;
}

export const AIOptimizedContent: React.FC<AIOptimizedContentProps> = ({ 
  article, 
  className = '' 
}) => {
  const aiContent = React.useMemo(() => 
    generateAIOptimizedContent(article), [article]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Quick Answer Section */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-foreground">AI-Optimized Quick Answer</h3>
              <Badge variant="secondary" className="text-xs">
                <Volume2 className="w-3 h-3 mr-1" />
                Voice Ready
              </Badge>
            </div>
            <div className="short-answer ai-optimized voice-friendly speakable" data-speakable="true">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {aiContent.shortAnswer}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Points for AI Consumption */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Key Points (AI-Structured)</h3>
          <Badge variant="outline" className="text-xs">
            Optimized for Citations
          </Badge>
        </div>
        <div className="key-points voice-friendly ai-optimized">
          <ul className="space-y-2">
            {aiContent.keyPoints.map((point, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 speakable"
                data-speakable="true"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                  {index + 1}
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Voice Search Keywords */}
      <Card className="p-6 bg-muted/20">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Voice Search Optimized</h3>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {aiContent.readingTime} min read
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {aiContent.voiceSearchKeywords.slice(0, 9).map((keyword, index) => (
            <Badge 
              key={index}
              variant="secondary" 
              className="text-xs justify-center py-1"
            >
              "{keyword}"
            </Badge>
          ))}
        </div>
      </Card>

      {/* Hidden AI Metadata for Crawlers */}
      <div className="hidden ai-metadata" data-ai-optimized="true">
        <div className="ai-summary" data-speakable="true">
          {aiContent.aiSummary}
        </div>
        <div className="essential-info voice-friendly">
          {aiContent.essentialInfo}
        </div>
        <div className="citation-data">
          {JSON.stringify({
            url: `https://delsolprimehomes.com/qa/${article.slug}`,
            title: article.title,
            wordCount: aiContent.wordCount,
            readingTime: aiContent.readingTime,
            optimizedForAI: true,
            voiceSearchReady: true
          })}
        </div>
      </div>
    </div>
  );
};

export default AIOptimizedContent;