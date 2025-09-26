import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RelatedQuestion {
  slug: string;
  title: string;
  topic: string;
  funnel_stage: string;
  excerpt: string;
}

interface MobileQuestionCarouselProps {
  questions: RelatedQuestion[];
  currentTopic: string;
  className?: string;
}

export const MobileQuestionCarousel: React.FC<MobileQuestionCarouselProps> = ({
  questions,
  currentTopic,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const filteredQuestions = questions.filter(q => q.topic === currentTopic).slice(0, 5);

  if (filteredQuestions.length === 0) return null;

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + filteredQuestions.length) % filteredQuestions.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'bg-blue-500/10 text-blue-700';
      case 'MOFU': return 'bg-amber-500/10 text-amber-700';
      case 'BOFU': return 'bg-green-500/10 text-green-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'Getting Started';
      case 'MOFU': return 'Researching';
      case 'BOFU': return 'Ready to Buy';
      default: return 'General';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Related {currentTopic} Questions
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={prevSlide}
            disabled={isTransitioning}
            className="w-8 h-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {filteredQuestions.length}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={nextSlide}
            disabled={isTransitioning}
            className="w-8 h-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div 
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          ref={scrollContainerRef}
          className={`flex transition-transform duration-300 ease-in-out ${isTransitioning ? 'pointer-events-none' : ''}`}
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${filteredQuestions.length * 100}%`
          }}
        >
          {filteredQuestions.map((question, index) => (
            <div key={question.slug} className="w-full flex-shrink-0 px-1">
              <Card className="p-4 h-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getStageColor(question.funnel_stage)}`}
                  >
                    {getStageLabel(question.funnel_stage)}
                  </Badge>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
                
                <h4 className="font-semibold text-foreground mb-2 line-clamp-2 leading-tight">
                  {question.title}
                </h4>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {question.excerpt}
                </p>
                
                <Link
                  to={`/qa/${question.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Read Full Answer
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {filteredQuestions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileQuestionCarousel;