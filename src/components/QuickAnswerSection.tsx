import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Volume2 } from 'lucide-react';

interface QuickAnswerSectionProps {
  title: string;
  excerpt: string;
  ctaText: string;
  ctaLink: string;
  readingTime: number;
  className?: string;
}

export const QuickAnswerSection: React.FC<QuickAnswerSectionProps> = ({
  title,
  excerpt,
  ctaText,
  ctaLink,
  readingTime,
  className = ''
}) => {
  return (
    <Card className={`p-6 sm:p-8 bg-primary/5 border-primary/20 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-foreground speakable" data-speakable="true">
              Quick Answer
            </h2>
            <Badge variant="secondary" className="text-xs">
              <Volume2 className="w-3 h-3 mr-1" />
              Voice Ready
            </Badge>
            <Badge variant="outline" className="text-xs">
              {readingTime} min read
            </Badge>
          </div>
          
          <div className="quick-answer ai-optimized voice-friendly speakable" data-speakable="true">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-6">
              {excerpt}
            </p>
          </div>
          
          <Button 
            asChild
            className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-105"
          >
            <a href={ctaLink}>
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuickAnswerSection;