import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RelatedLink {
  slug: string;
  title: string;
  topic: string;
}

interface KeyTakeawaysBoxProps {
  takeaways: string[];
  topic: string;
  relatedQuestions?: RelatedLink[];
  className?: string;
}

export const KeyTakeawaysBox: React.FC<KeyTakeawaysBoxProps> = ({
  takeaways,
  topic,
  relatedQuestions = [],
  className = ''
}) => {
  return (
    <Card className={`p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-primary/5 border-primary/20 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          🏖️ Quick Summary for Expats
        </h2>
        <Badge variant="secondary" className="text-xs ml-auto">
          AI Structured
        </Badge>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Takeaways - Responsive 2x2 Grid on Desktop, Stack on Mobile */}
        <div className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {takeaways.map((takeaway, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/60 border border-primary/10"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-foreground leading-relaxed font-medium">
                  {takeaway}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Questions Sidebar */}
        {relatedQuestions.length > 0 && (
          <div className="lg:col-span-1">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <LinkIcon className="w-4 h-4 text-primary" />
                Related Questions
              </h3>
              {relatedQuestions.slice(0, 3).map((question, index) => (
                <Link
                  key={index}
                  to={`/qa/${question.slug}`}
                  className="block group"
                >
                  <div className="p-3 rounded-lg bg-background/40 border border-primary/10 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {question.topic}
                        </p>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {question.title}
                        </p>
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default KeyTakeawaysBox;