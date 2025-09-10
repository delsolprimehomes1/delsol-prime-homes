import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import QANavigation from '@/components/QANavigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Progress } from '@/components/ui/progress';
import { Clock, Calendar, ArrowLeft, ArrowRight, BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const QAArticle = () => {
  const { slug } = useParams();
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  const { data: article, isLoading } = useQuery({
    queryKey: ['qa-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_articles')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['related-articles', article?.topic, article?.funnel_stage],
    queryFn: async () => {
      if (!article) return [];
      
      const { data, error } = await supabase
        .from('qa_articles')
        .select('*')
        .or(`topic.eq.${article.topic},funnel_stage.eq.${article.funnel_stage}`)
        .neq('slug', slug)
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!article
  });

  // Calculate reading time and progress
  useEffect(() => {
    if (article) {
      const wordsPerMinute = 200;
      const wordCount = article.content.split(' ').length;
      setEstimatedReadTime(Math.ceil(wordCount / wordsPerMinute));
    }

    const handleScroll = () => {
      const articleElement = document.getElementById('article-content');
      if (articleElement) {
        const scrollTop = window.scrollY;
        const articleTop = articleElement.offsetTop;
        const articleHeight = articleElement.offsetHeight;
        const windowHeight = window.innerHeight;
        
        const progress = Math.min(
          Math.max((scrollTop - articleTop + windowHeight / 2) / articleHeight * 100, 0),
          100
        );
        setReadingProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  const funnelConfig = {
    TOFU: { label: 'Discover', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
    MOFU: { label: 'Consider', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
    BOFU: { label: 'Decide', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="navbar-offset">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded mb-4"></div>
                <div className="h-16 bg-muted rounded mb-8"></div>
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="navbar-offset">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="heading-lg mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
            <Link to="/qa">
              <Button>Back to Q&A Hub</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navbar />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 navbar-offset">
        <Progress 
          value={readingProgress} 
          className="h-1 bg-transparent border-0"
        />
      </div>

      <div className="navbar-offset py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Breadcrumb Navigation */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/qa" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Q&A Hub
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-muted-foreground">
                    {article.title.length > 50 
                      ? `${article.title.substring(0, 50)}...`
                      : article.title
                    }
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Article Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge 
                  className={cn(
                    "px-3 py-1 text-sm font-medium",
                    funnelConfig[article.funnel_stage]?.bgColor,
                    funnelConfig[article.funnel_stage]?.textColor
                  )}
                >
                  <Target className="w-3 h-3 mr-1" />
                  {funnelConfig[article.funnel_stage]?.label}
                </Badge>
                
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  {estimatedReadTime} min read
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.last_updated).toLocaleDateString()}
                </div>
              </div>

              <h1 className="heading-display mb-4 animate-fade-in-up">
                {article.title}
              </h1>
              
              <p className="body-lg text-muted-foreground leading-relaxed animate-fade-in-delay">
                {article.excerpt}
              </p>
            </div>

            {/* Article Content */}
            <Card className="p-8 mb-8 sleek-card animate-scale-in">
              <div 
                id="article-content"
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: article.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/###\s+(.*?)$/gm, '<h3 class="heading-md mt-8 mb-4">$1</h3>')
                    .replace(/^-\s+(.*?)$/gm, '<li class="mb-2">$1</li>')
                    .replace(/(<li.*?<\/li>\s*)+/g, '<ul class="list-disc pl-6 mb-6 space-y-2">$&</ul>')
                }}
              />
              
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">Related Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Call to Action */}
            {article.next_step_url && article.next_step_text && (
              <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 border-primary/20">
                <div className="text-center">
                  <h3 className="heading-md mb-4">Ready for the next step?</h3>
                  <p className="text-muted-foreground mb-6">
                    Get personalized guidance for your Costa del Sol property journey
                  </p>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105">
                    {article.next_step_text}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <QANavigation 
              currentArticle={article}
              relatedArticles={relatedArticles}
              funnelConfig={funnelConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAArticle;