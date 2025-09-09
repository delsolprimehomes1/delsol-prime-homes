import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Eye, ArrowRight, Bookmark, Share2, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FAQItem } from '@/hooks/useFAQData';

interface AnimatedFAQItemProps {
  faq: FAQItem;
  index: number;
  onExpand?: (itemId: string) => void;
  isExpanded?: boolean;
}

export function AnimatedFAQItem({ 
  faq, 
  index, 
  onExpand,
  isExpanded = false 
}: AnimatedFAQItemProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.2,
    freezeOnceVisible: true
  });

  // Fix ref typing issue
  const itemRef = targetRef as React.RefObject<HTMLDivElement>;

  const getFunnelStageInfo = (stage: string) => {
    switch (stage) {
      case 'TOFU':
        return { 
          label: 'Discovery', 
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          gradient: 'from-blue-500/10 to-blue-600/5',
          icon: '🔍' 
        };
      case 'MOFU':
        return { 
          label: 'Consideration', 
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          gradient: 'from-amber-500/10 to-amber-600/5',
          icon: '🤔' 
        };
      case 'BOFU':
        return { 
          label: 'Decision', 
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          gradient: 'from-emerald-500/10 to-emerald-600/5',
          icon: '✅' 
        };
      default:
        return { 
          label: stage, 
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          gradient: 'from-gray-500/10 to-gray-600/5',
          icon: '💡' 
        };
    }
  };

  const funnelInfo = getFunnelStageInfo(faq.funnel_stage);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const getReadingTime = (text: string) => {
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <AccordionItem 
      ref={itemRef}
      value={faq.id}
      className={cn(
        "border rounded-xl mb-6 overflow-hidden group transition-all duration-500 ease-out",
        "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm",
        "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
        "hover:scale-[1.01] hover:translate-y-[-2px]",
        isIntersecting && "animate-in slide-in-from-bottom-4 fade-in duration-700",
        isExpanded && "ring-1 ring-primary/20 shadow-lg"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
    >
      <AccordionTrigger 
        className="text-left p-6 hover:no-underline group/trigger"
        onClick={() => onExpand?.(faq.id)}
      >
        <div className="flex-1 space-y-4">
          {/* Header badges and actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                className={cn(
                  "text-xs font-medium border transition-all duration-200",
                  funnelInfo.color,
                  "group-hover/trigger:scale-105"
                )}
              >
                <span className="mr-1">{funnelInfo.icon}</span>
                {funnelInfo.label}
              </Badge>
              
              {faq.is_featured && (
                <Badge 
                  variant="default" 
                  className="text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                >
                  ⭐ Popular
                </Badge>
              )}
              
              {faq.view_count > 50 && (
                <Badge variant="outline" className="text-xs">
                  <Eye className="mr-1 h-3 w-3" />
                  {faq.view_count.toLocaleString()}
                </Badge>
              )}
            </div>

            {/* Interactive actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={cn(
                  "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300",
                  "hover:scale-110 hover:bg-primary/10",
                  isBookmarked && "text-primary opacity-100"
                )}
              >
                <Bookmark 
                  className={cn("h-4 w-4", isBookmarked && "fill-current")} 
                />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300",
                  "hover:scale-110 hover:bg-primary/10",
                  isLiked && "text-primary opacity-100"
                )}
              >
                <ThumbsUp 
                  className={cn("h-4 w-4", isLiked && "fill-current")} 
                />
              </Button>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-primary/10"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 p-2 bg-background/95 backdrop-blur-lg border rounded-lg shadow-xl z-10 animate-in slide-in-from-top-2">
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      Share this Q&A
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question title */}
          <h3 
            className={cn(
              "font-semibold text-lg leading-tight transition-all duration-300",
              "group-hover/trigger:text-primary group-hover/trigger:translate-x-1"
            )}
            data-speakable={faq.is_speakable ? `faq-${index}` : undefined}
          >
            {faq.question}
          </h3>

          {/* Preview and metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{getReadingTime(faq.answer_long || faq.answer_short)}</span>
              <span>•</span>
              <span>{faq.author_name}</span>
            </div>
            
            {faq.tags && faq.tags.length > 0 && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {faq.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {faq.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{faq.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-6 pb-6">
        <div className={cn(
          "space-y-4 animate-in slide-in-from-top-2 fade-in duration-500",
          "border-t pt-4 bg-gradient-to-r", 
          funnelInfo.gradient,
          "rounded-lg p-4 -m-2"
        )}>
          {/* Answer content */}
          <div 
            className="text-muted-foreground leading-relaxed"
            data-speakable={faq.is_speakable ? `faq-answer-${index}` : undefined}
          >
            {faq.answer_short}
          </div>
          
          {/* Action footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Updated {new Date(faq.updated_at).toLocaleDateString()}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className={cn(
                "hover:bg-primary hover:text-primary-foreground transition-all duration-300",
                "hover:scale-105 hover:shadow-md group/button"
              )}
            >
              <Link to={`/qa/${faq.slug}`}>
                Read Full Answer
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}