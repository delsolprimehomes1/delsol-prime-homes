import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, Target, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QACardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    funnel_stage: 'TOFU' | 'MOFU' | 'BOFU';
    topic: string;
    city: string;
    tags?: string[];
    last_updated: string;
    content: string;
  };
  funnelConfig: {
    [key: string]: {
      label: string;
      color: string;
      textColor?: string;
      bgColor?: string;
    };
  };
}

const QACard: React.FC<QACardProps> = ({ article, funnelConfig }) => {
  // Calculate estimated read time
  const wordCount = article.content.split(' ').length;
  const readTime = Math.ceil(wordCount / 200); // 200 words per minute

  const config = funnelConfig[article.funnel_stage] || {
    label: article.funnel_stage,
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50'
  };

  return (
    <Card className="group sleek-card minimal-hover border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Header with funnel stage indicator */}
      <div className={cn("h-1", config.color)}></div>
      
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <Badge 
            className={cn(
              "px-2 py-1 text-xs font-medium border-0",
              config.bgColor,
              config.textColor
            )}
          >
            <Target className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime}m
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(article.last_updated).toLocaleDateString()}
            </div>
          </div>
        </div>

        <h3 className="heading-sm leading-tight mb-3 group-hover:text-primary transition-colors duration-200">
          {article.title}
        </h3>
      </CardHeader>

      <CardContent className="p-6 pt-0 flex-1 flex flex-col">
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
          {article.excerpt}
        </p>

        {/* Meta information */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {article.city}
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {article.tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs px-2 py-0 border-muted-foreground/20"
                >
                  {tag}
                </Badge>
              ))}
              {article.tags.length > 2 && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0 border-muted-foreground/20"
                >
                  +{article.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link to={`/qa/${article.slug}`} className="block">
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto hover:bg-primary/5 hover:text-primary transition-all duration-200 group/btn"
          >
            <span className="font-medium">Read Guide</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default QACard;