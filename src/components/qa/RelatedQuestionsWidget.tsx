import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, ArrowRight, HelpCircle, Lightbulb } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

interface RelatedQuestion {
  slug: string;
  title: string;
  topic: string;
  funnel_stage: string;
  excerpt: string;
  relevanceScore?: number;
}

interface RelatedQuestionsWidgetProps {
  questions: RelatedQuestion[];
  currentTopic: string;
  title?: string;
  maxDisplay?: number;
  className?: string;
}

export const RelatedQuestionsWidget: React.FC<RelatedQuestionsWidgetProps> = ({
  questions,
  currentTopic,
  title = "Related Questions You Might Have",
  maxDisplay = 4,
  className = ''
}) => {
  if (questions.length === 0) return null;

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'MOFU': return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'BOFU': return 'bg-green-500/10 text-green-700 border-green-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'Getting Started';
      case 'MOFU': return 'Research';
      case 'BOFU': return 'Decision';
      default: return stage;
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <HelpCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            Continue exploring {currentTopic.toLowerCase()} topics
          </p>
        </div>
        <Lightbulb className="w-5 h-5 text-amber-500 ml-auto" />
      </div>

      <div className="space-y-4">
        {questions.slice(0, maxDisplay).map((question, index) => (
          <RouterLink
            key={question.slug}
            to={`/qa/${question.slug}`}
            className="block group"
          >
            <div className="p-4 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStageColor(question.funnel_stage)}`}
                    >
                      {getStageLabel(question.funnel_stage)}
                    </Badge>
                    {question.topic !== currentTopic && (
                      <Badge variant="secondary" className="text-xs">
                        {question.topic}
                      </Badge>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {question.title}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {question.excerpt}
                  </p>
                </div>
                
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>

              {/* Progress indicator for funnel progression */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Continue reading →</span>
                {question.relevanceScore && (
                  <span className="bg-muted/50 px-2 py-1 rounded">
                    {Math.round(question.relevanceScore * 100)}% match
                  </span>
                )}
              </div>
            </div>
          </RouterLink>
        ))}
      </div>

      {questions.length > maxDisplay && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <Button variant="outline" size="sm" className="w-full group" asChild>
            <RouterLink to={`/faq?topic=${encodeURIComponent(currentTopic)}`}>
              <span>View All {currentTopic} Questions</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </RouterLink>
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RelatedQuestionsWidget;