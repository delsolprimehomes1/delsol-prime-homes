import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Tag, Clock, MessageSquare, Shield, CheckCircle } from 'lucide-react';
import { processMarkdownContent, processMarkdownTitle } from '@/utils/markdown';

interface QAArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  funnel_stage: string;
  topic: string;
  tags?: string[];
  last_updated: string;
  ai_optimization_score?: number;
  voice_search_ready?: boolean;
  citation_ready?: boolean;
}

interface QAEnhancedCardProps {
  article: QAArticle;
  animationDelay?: number;
}

export const QAEnhancedCard: React.FC<QAEnhancedCardProps> = ({ 
  article, 
  animationDelay = 0 
}) => {
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

  const readingTime = Math.ceil((article.excerpt?.length || 200) / 200);

  return (
    <Link to={`/qa/${article.slug}`} className="block group">
      <Card 
        className="qa-card bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header with stage and meta */}
              <div className="flex items-center justify-between mb-3">
                <Badge className={`${stageColors[article.funnel_stage as keyof typeof stageColors]} text-xs px-3 py-1.5`}>
                  {stageLabels[article.funnel_stage as keyof typeof stageLabels]}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>{article.last_updated}</span>
                </div>
              </div>

              {/* Title */}
              <h3 
                className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight"
                dangerouslySetInnerHTML={{ __html: processMarkdownTitle(article.title) }}
              />

              {/* Excerpt */}
              <div 
                className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: processMarkdownContent(article.excerpt) }}
              />

              {/* Quality Indicators */}
              <div className="flex items-center gap-2 mb-4">
                {article.citation_ready && (
                  <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                    <Shield className="w-3 h-3" />
                    <span>Citation Ready</span>
                  </div>
                )}
                {article.voice_search_ready && (
                  <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    <span>Voice Ready</span>
                  </div>
                )}
                {article.ai_optimization_score && (
                  <div className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                    AI: {article.ai_optimization_score}/10
                  </div>
                )}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-start gap-2 mb-4">
                  <Tag className="w-3 h-3 text-muted-foreground mt-0.5 hidden sm:block flex-shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                        {tag}
                      </Badge>
                    ))}
                    {article.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        +{article.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="capitalize font-medium">{article.topic}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default QAEnhancedCard;