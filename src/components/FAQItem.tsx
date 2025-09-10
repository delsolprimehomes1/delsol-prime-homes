import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

interface FAQItemProps {
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    funnel_stage: string;
    topic: string;
    tags?: string[];
  };
  animationDelay?: number;
}

export const FAQItem = ({ article, animationDelay = 0 }: FAQItemProps) => {
  const handleClick = () => {
    trackEvent('faq_item_click', {
      question_slug: article.slug,
      funnel_stage: article.funnel_stage,
      topic: article.topic,
      timestamp: new Date().toISOString()
    });
  };

  const stageColors = {
    TOFU: 'bg-blue-500/10 text-blue-700 border-blue-200',
    MOFU: 'bg-amber-500/10 text-amber-700 border-amber-200', 
    BOFU: 'bg-green-500/10 text-green-700 border-green-200'
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in border-l-4 border-l-primary/20"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <CardContent className="p-6">
        <Link 
          to={`/qa/${article.slug}`}
          className="block"
          onClick={handleClick}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${stageColors[article.funnel_stage as keyof typeof stageColors]} text-xs`}>
                  {article.funnel_stage}
                </Badge>
                <span className="text-xs text-muted-foreground capitalize">
                  {article.topic}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {article.tags.slice(0, 3).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="text-xs px-2 py-0.5 bg-muted/50"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted/50">
                      +{article.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};