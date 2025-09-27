import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Target, CheckCircle2, Clock } from 'lucide-react';

interface AIDirectAnswerBlockProps {
  question: string;
  answer: string;
  evidence: string[];
  confidenceScore?: number;
  readingTime?: number;
  className?: string;
}

export const AIDirectAnswerBlock: React.FC<AIDirectAnswerBlockProps> = ({
  question,
  answer,
  evidence,
  confidenceScore = 0.95,
  readingTime = 2,
  className = ''
}) => {
  return (
    <div className={`ai-direct-answer ${className}`} itemScope itemType="https://schema.org/Answer">
      <Card className="p-6 bg-primary/5 border-primary/20 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="ai-question font-semibold text-lg text-foreground">
                {question}
              </h2>
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {readingTime} min read
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-50">
                <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                AI Optimized
              </Badge>
            </div>
            
            <div 
              className="ai-snippet mb-4" 
              itemProp="text"
              data-speakable="true"
            >
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                {answer}
              </p>
            </div>

            {evidence.length > 0 && (
              <div className="ai-evidence">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Supporting Evidence</span>
                  <Badge variant="outline" className="text-xs">
                    Confidence: {Math.round(confidenceScore * 100)}%
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {evidence.map((fact, index) => (
                    <li 
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                      data-speakable="true"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {fact}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hidden metadata for AI systems */}
            <div className="hidden ai-metadata" data-ai-optimized="true">
              <span className="confidence-score">{confidenceScore}</span>
              <span className="evidence-strength">strong</span>
              <span className="last-reviewed">{new Date().toISOString().split('T')[0]}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIDirectAnswerBlock;