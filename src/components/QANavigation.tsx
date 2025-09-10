import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, BookOpen, Target, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QANavigationProps {
  currentArticle: {
    id: string;
    funnel_stage: string;
    topic: string;
  };
  relatedArticles: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    funnel_stage: string;
    topic: string;
  }>;
  funnelConfig: {
    [key: string]: {
      label: string;
      color?: string;
      textColor?: string;
      bgColor?: string;
    };
  };
}

const QANavigation: React.FC<QANavigationProps> = ({ 
  currentArticle, 
  relatedArticles, 
  funnelConfig 
}) => {
  // Group related articles by type
  const sameFunnelStage = relatedArticles.filter(
    article => article.funnel_stage === currentArticle.funnel_stage && article.id !== currentArticle.id
  );
  
  const sameTopic = relatedArticles.filter(
    article => article.topic === currentArticle.topic && 
    article.funnel_stage !== currentArticle.funnel_stage &&
    article.id !== currentArticle.id
  );

  const nextStageArticles = relatedArticles.filter(article => {
    const stageOrder = { TOFU: 0, MOFU: 1, BOFU: 2 };
    const currentStageIndex = stageOrder[currentArticle.funnel_stage as keyof typeof stageOrder] || 0;
    const articleStageIndex = stageOrder[article.funnel_stage as keyof typeof stageOrder] || 0;
    return articleStageIndex === currentStageIndex + 1;
  });

  const NavigationCard = ({ article, label, icon: Icon }: { 
    article: any; 
    label: string; 
    icon: any; 
  }) => {
    const config = funnelConfig[article.funnel_stage] || {
      label: article.funnel_stage,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700'
    };

    return (
      <Link to={`/qa/${article.slug}`} className="block group">
        <Card className="h-full sleek-card minimal-hover border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4" />
                {label}
              </div>
              <Badge 
                className={cn(
                  "px-2 py-1 text-xs",
                  config.bgColor,
                  config.textColor
                )}
              >
                {config.label}
              </Badge>
            </div>
            <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
              {article.title}
            </h4>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {article.excerpt}
            </p>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      {/* Back to Hub */}
      <div className="flex justify-center">
        <Link to="/qa">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Q&A Hub
          </Button>
        </Link>
      </div>

      {/* Next Steps - Priority for BOFU articles */}
      {nextStageArticles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary" />
            <h3 className="heading-sm">Next Steps in Your Journey</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextStageArticles.slice(0, 2).map((article) => (
              <NavigationCard
                key={article.id}
                article={article}
                label="Next Step"
                icon={Target}
              />
            ))}
          </div>
        </div>
      )}

      {/* Same Funnel Stage - Related at current level */}
      {sameFunnelStage.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="heading-sm">
              More {funnelConfig[currentArticle.funnel_stage]?.label || currentArticle.funnel_stage} Guides
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sameFunnelStage.slice(0, 3).map((article) => (
              <NavigationCard
                key={article.id}
                article={article}
                label="Similar Guide"
                icon={BookOpen}
              />
            ))}
          </div>
        </div>
      )}

      {/* Same Topic - Different funnel stages */}
      {sameTopic.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3 className="heading-sm">Related Topics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sameTopic.slice(0, 2).map((article) => (
              <NavigationCard
                key={article.id}
                article={article}
                label="Related Topic"
                icon={BookOpen}
              />
            ))}
          </div>
        </div>
      )}

      {/* If no related articles */}
      {relatedArticles.length === 0 && (
        <Card className="p-8 text-center bg-muted/30">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="heading-sm mb-2">Explore More Guides</h3>
          <p className="text-muted-foreground mb-4">
            Discover more expert insights for your Costa del Sol property journey
          </p>
          <Link to="/qa">
            <Button>Browse All Guides</Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default QANavigation;