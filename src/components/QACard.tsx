import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { processMarkdownContent } from '@/utils/markdown';

interface QAArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  funnel_stage: string;
  topic: string;
  tags?: string[];
  last_updated: string;
}

interface QACardProps {
  article: QAArticle;
  animationDelay?: number;
}

export const QACard = ({ article, animationDelay = 0 }: QACardProps) => {
  const stageColors = {
    TOFU: 'bg-blue-500/10 text-blue-700 border-blue-200',
    MOFU: 'bg-amber-500/10 text-amber-700 border-amber-200',
    BOFU: 'bg-green-500/10 text-green-700 border-green-200'
  };

  const stageLabels = {
    TOFU: 'Getting Started',
    MOFU: 'Researching',
    BOFU: 'Ready to Buy'
  };

  return (
    <Link to={`/qa/${article.slug}`} className="block group touch-manipulation">
      <Card 
        className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-muted hover:border-primary/20 animate-fade-in will-change-transform p-1 sm:p-0"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <Badge className={`${stageColors[article.funnel_stage as keyof typeof stageColors]} text-xs px-3 py-1.5 self-start`}>
              {stageLabels[article.funnel_stage as keyof typeof stageLabels]}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Calendar className="w-3 h-3" />
              <span>{article.last_updated}</span>
            </div>
          </div>
          
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-3">
            {article.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
          <div 
            className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: processMarkdownContent(article.excerpt) }}
          />
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-start gap-2 mb-4">
              <Tag className="w-3 h-3 text-muted-foreground mt-0.5 hidden sm:block" />
              <div className="flex flex-wrap gap-1.5">
                {article.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1 touch-target-44">
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs px-2 py-1 touch-target-44">
                    +{article.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs sm:text-sm text-muted-foreground capitalize font-medium">
              {article.topic}
            </span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};