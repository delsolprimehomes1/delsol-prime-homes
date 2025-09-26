import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Navigation, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
interface TOCItem {
  id: string;
  title: string;
  level: number;
  funnelStage?: 'TOFU' | 'MOFU' | 'BOFU';
}

interface RelatedArticle {
  slug: string;
  title: string;
  topic: string;
  funnel_stage: string;
}

interface EnhancedTOCWithProgressProps {
  content: string;
  currentStage: string;
  nextMofuArticle?: RelatedArticle;
  nextBofuArticle?: RelatedArticle;
  relatedArticles?: RelatedArticle[];
  className?: string;
}

export const EnhancedTOCWithProgress: React.FC<EnhancedTOCWithProgressProps> = ({
  content,
  currentStage,
  nextMofuArticle,
  nextBofuArticle,
  relatedArticles = [],
  className = ''
}) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Extract TOC items from content
  useEffect(() => {
    const headingRegex = /<h([1-3])[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h[1-3]>/g;
    const items: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const id = match[2];
      const title = match[3].trim();
      
      // Determine funnel stage based on heading content
      let funnelStage: 'TOFU' | 'MOFU' | 'BOFU' | undefined;
      const titleLower = title.toLowerCase();
      if (titleLower.includes('getting started') || titleLower.includes('basics') || titleLower.includes('overview')) {
        funnelStage = 'TOFU';
      } else if (titleLower.includes('compare') || titleLower.includes('options') || titleLower.includes('guide')) {
        funnelStage = 'MOFU';
      } else if (titleLower.includes('action') || titleLower.includes('checklist') || titleLower.includes('book')) {
        funnelStage = 'BOFU';
      }

      items.push({ id, title, level, funnelStage });
    }

    setTocItems(items);
  }, [content]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active heading using intersection observer
  useEffect(() => {
    const headingElements = tocItems.map(item => document.getElementById(item.id)).filter(Boolean);
    
    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0.1,
      }
    );

    headingElements.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      headingElements.forEach((element) => {
        if (element) observer.unobserve(element);
      });
    };
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getStageColor = (stage?: 'TOFU' | 'MOFU' | 'BOFU') => {
    switch (stage) {
      case 'TOFU': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'MOFU': return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'BOFU': return 'bg-green-500/10 text-green-700 border-green-200';
      default: return 'bg-muted/20 text-muted-foreground border-border';
    }
  };

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1: return 'pl-0';
      case 2: return 'pl-4';
      case 3: return 'pl-8';
      default: return 'pl-0';
    }
  };

  const getFunnelProgress = () => {
    const stages = ['TOFU', 'MOFU', 'BOFU'];
    const currentIndex = stages.indexOf(currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  if (tocItems.length === 0) return null;

  return (
    <Card className={`sticky top-24 p-4 max-h-[calc(100vh-6rem)] overflow-y-auto ${className}`}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Table of Contents</h3>
          <Badge variant="secondary" className="text-xs">
            {tocItems.length} sections
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* Buyer Journey Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Buyer Journey Progress</span>
              <span className="font-medium text-foreground">{Math.round(getFunnelProgress())}%</span>
            </div>
            <Progress value={getFunnelProgress()} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={currentStage === 'TOFU' ? 'text-blue-600 font-medium' : ''}>Getting Started</span>
              <span className={currentStage === 'MOFU' ? 'text-amber-600 font-medium' : ''}>Researching</span>
              <span className={currentStage === 'BOFU' ? 'text-green-600 font-medium' : ''}>Ready to Buy</span>
            </div>
          </div>

          {/* Reading Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Reading Progress</span>
              <span className="font-medium text-foreground">{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-1" />
          </div>

          {/* TOC Items */}
          <nav className="space-y-1 mb-6">
            {tocItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => scrollToHeading(item.id)}
                className={`w-full justify-start text-left h-auto py-2 px-2 ${getIndentClass(item.level)} ${
                  activeId === item.id
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm leading-relaxed">{item.title}</span>
                  {item.funnelStage && (
                    <Badge variant="outline" className={`text-xs ml-2 ${getStageColor(item.funnelStage)}`}>
                      {item.funnelStage}
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </nav>

          {/* Continue Reading Suggestions */}
          <div className="border-t border-border/40 pt-4">
            <h4 className="font-medium text-foreground mb-3 text-sm">Continue Your Journey</h4>
            
            {/* Next Stage Articles */}
            {currentStage === 'TOFU' && nextMofuArticle && (
              <Link to={`/qa/${nextMofuArticle.slug}`} className="block mb-3 group">
                <div className="p-3 rounded-lg bg-muted/20 border border-border/40 hover:border-amber-200 hover:bg-amber-50/50 transition-colors">
                  <Badge variant="outline" className="text-xs mb-1 bg-amber-500/10 text-amber-700 border-amber-200">
                    Next: Research
                  </Badge>
                  <p className="text-sm font-medium text-foreground group-hover:text-amber-700 transition-colors line-clamp-2">
                    {nextMofuArticle.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <ArrowRight className="w-3 h-3" />
                    <span>Continue reading</span>
                  </div>
                </div>
              </Link>
            )}

            {currentStage === 'MOFU' && nextBofuArticle && (
              <Link to={`/qa/${nextBofuArticle.slug}`} className="block mb-3 group">
                <div className="p-3 rounded-lg bg-muted/20 border border-border/40 hover:border-green-200 hover:bg-green-50/50 transition-colors">
                  <Badge variant="outline" className="text-xs mb-1 bg-green-500/10 text-green-700 border-green-200">
                    Next: Take Action
                  </Badge>
                  <p className="text-sm font-medium text-foreground group-hover:text-green-700 transition-colors line-clamp-2">
                    {nextBofuArticle.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3" />
                    <span>Ready to proceed</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="space-y-2">
                {relatedArticles.slice(0, 2).map((article, index) => (
                  <Link key={index} to={`/qa/${article.slug}`} className="block group">
                    <div className="p-2 rounded-lg bg-muted/10 border border-border/20 hover:border-primary/30 transition-colors">
                      <p className="text-xs text-muted-foreground mb-1">{article.topic}</p>
                      <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {article.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default EnhancedTOCWithProgress;