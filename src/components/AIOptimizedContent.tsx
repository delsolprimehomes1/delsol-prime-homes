import React from 'react';
import { generateAIOptimizedContent, getEnhancedSpeakableSelectors } from '@/utils/ai-optimization';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Volume2, Target, Clock, MessageSquare } from 'lucide-react';
import AIContentEnhancer from './AIContentEnhancer';
import Phase2EnhancedSchemas from './Phase2EnhancedSchemas';
import ProgressiveEnhancementLayers from './ProgressiveEnhancementLayers';

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
      {/* Phase 1: Enhanced AI Content Blocks */}
      <AIContentEnhancer article={article} />

      {/* Phase 2: Advanced Schema & Speakable Optimization */}
      <Phase2EnhancedSchemas article={article} />

      {/* Progressive Enhancement Layers Display */}
      <ProgressiveEnhancementLayers article={article} />

      {/* Legacy Support: Original AI Quick Answer Section */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-foreground">Phase 1+2 Enhanced Summary</h3>
              <Badge variant="secondary" className="text-xs">
                <Volume2 className="w-3 h-3 mr-1" />
                Voice Ready
              </Badge>
              <Badge variant="outline" className="text-xs bg-purple-50">
                Phase 2 Enhanced
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

      {/* Hidden AI Metadata for Crawlers - Enhanced for Phase 2 */}
      <div className="hidden ai-metadata ai-citation-metadata phase2-enhanced" data-ai-optimized="true" data-phase="2">
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
            voiceSearchReady: true,
            citationReady: true,
            aiOptimizationScore: article.ai_optimization_score || 9.5,
            confidenceLevel: "high",
            expertiseArea: article.topic,
            lastUpdated: article.last_updated || article.created_at,
            phase1Enhanced: true,
            phase2Enhanced: true,
            crossLanguageOptimized: true,
            wikidataEntityLinked: true,
            learningResourceSchema: true,
            claimReviewSchema: true,
            enhancedSpeakableSpecification: true
          })}
        </div>
      </div>
    </div>
  );
};

export default AIOptimizedContent;