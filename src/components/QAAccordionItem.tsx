import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight,
  Calendar, 
  Tag, 
  Clock,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { processMarkdownContent } from '@/utils/markdown';
import { trackEvent } from '@/utils/analytics';

interface QAArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  funnel_stage: string;
  topic: string;
  tags?: string[];
  last_updated: string;
  next_step_text?: string;
  next_step_url?: string;
  // New multilingual fields
  language?: string;
  parent_id?: string;
  image_url?: string;
  alt_text?: string;
  target_audience?: string;
  intent?: string;
  location_focus?: string;
  markdown_frontmatter?: any;
}

interface QAAccordionItemProps {
  article: QAArticle;
  animationDelay?: number;
}

export const QAAccordionItem = ({ article, animationDelay = 0 }: QAAccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

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

  const readingTime = Math.ceil((article.content?.split(' ').length || 0) / 200) || 1;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!contentLoaded) {
      setContentLoaded(true);
    }
    
    trackEvent('qa_accordion_toggle', {
      article_slug: article.slug,
      funnel_stage: article.funnel_stage,
      topic: article.topic,
      action: !isOpen ? 'expand' : 'collapse',
      timestamp: new Date().toISOString()
    });
  };

  const handleViewFullArticle = () => {
    trackEvent('qa_view_full_article', {
      article_slug: article.slug,
      funnel_stage: article.funnel_stage,
      topic: article.topic,
      timestamp: new Date().toISOString()
    });
  };

  const getCTAVariant = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'outline';
      case 'MOFU': return 'secondary';
      case 'BOFU': return 'default';
      default: return 'outline';
    }
  };

  const getCTAText = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'Learn More';
      case 'MOFU': return 'Compare Options';
      case 'BOFU': return 'Book A Viewing';
      default: return 'Learn More';
    }
  };

  return (
    <Card 
      className="group transition-all duration-300 hover:shadow-lg animate-fade-in will-change-transform"
      style={{ animationDelay: `${animationDelay}ms` }}
      itemScope 
      itemType="https://schema.org/Question"
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Layer 1: Short Answer - Always Visible */}
        <CollapsibleTrigger asChild>
          <CardHeader 
            className="pb-4 cursor-pointer hover:bg-muted/30 transition-colors duration-200"
            onClick={handleToggle}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                {/* Question Title with Speakable Class */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    className={`${stageColors[article.funnel_stage as keyof typeof stageColors]} text-xs px-3 py-1`}
                  >
                    {stageLabels[article.funnel_stage as keyof typeof stageLabels]}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{article.last_updated}</span>
                  </div>
                </div>

                <h3 
                  className="question-title text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 leading-tight"
                  itemProp="name"
                >
                  {article.title}
                </h3>

                {/* Short Answer - Optimized for AI/Voice */}
                <div 
                  className="short-answer text-muted-foreground leading-relaxed"
                  itemProp="acceptedAnswer"
                  itemScope
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text">
                    {article.excerpt}
                  </div>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="w-3 h-3 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                      {article.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          +{article.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {isOpen ? 'Less' : 'More'}
                </span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        {/* Layer 2: Detailed Content - Expandable */}
        <CollapsibleContent className="px-6 pb-6">
          <div className="pt-4 border-t border-muted/50">
            {contentLoaded && (
              <>
                {/* Reading Time Indicator */}
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min detailed read</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize font-medium">{article.topic}</span>
                </div>

                {/* Detailed Answer Content */}
                <div 
                  className="detailed-answer prose prose-sm max-w-none mb-6 text-muted-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: processMarkdownContent(article.content) 
                  }}
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-muted/30">
                  <Link 
                    to={`/qa/${article.slug}`}
                    onClick={handleViewFullArticle}
                    className="flex-1"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full justify-between group hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      <span>View Full Article</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>

                  <Link to={article.funnel_stage === 'BOFU' ? '/book-viewing' : (article.next_step_url || '#')} className="flex-1">
                    <Button 
                      variant={getCTAVariant(article.funnel_stage)}
                      className="w-full justify-between group"
                    >
                      <span>{article.funnel_stage === 'BOFU' ? 'Book A Viewing' : (article.next_step_text || getCTAText(article.funnel_stage))}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};