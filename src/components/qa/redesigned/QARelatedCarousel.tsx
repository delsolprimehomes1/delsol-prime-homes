import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RelatedQuestion {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  funnelStage: string;
  topic: string;
  readingTime?: number;
}

interface QARelatedCarouselProps {
  questions: RelatedQuestion[];
  currentTopic?: string;
  maxDisplay?: number;
  className?: string;
}

export const QARelatedCarousel: React.FC<QARelatedCarouselProps> = ({
  questions,
  currentTopic,
  maxDisplay = 6,
  className = "",
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerView = 2; // Show 2 cards at a time

  const filteredQuestions = questions
    .filter(q => currentTopic ? q.topic === currentTopic : true)
    .slice(0, maxDisplay);

  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + itemsPerView < filteredQuestions.length;

  const scrollLeft = () => {
    setStartIndex(Math.max(0, startIndex - itemsPerView));
  };

  const scrollRight = () => {
    setStartIndex(Math.min(filteredQuestions.length - itemsPerView, startIndex + itemsPerView));
  };

  const getStageColor = (stage: string) => {
    const colors = {
      TOFU: 'bg-blue-100 text-blue-700',
      MOFU: 'bg-amber-100 text-amber-700',
      BOFU: 'bg-green-100 text-green-700'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      TOFU: 'Getting Started',
      MOFU: 'Researching',
      BOFU: 'Ready to Buy'
    };
    return labels[stage as keyof typeof labels] || 'Guide';
  };

  if (filteredQuestions.length === 0) {
    return null;
  }

  return (
    <section className={`mt-12 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Related Questions</h3>
        
        {/* Navigation Controls */}
        {filteredQuestions.length > itemsPerView && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="p-2 h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="p-2 h-8 w-8"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{
            transform: `translateX(-${startIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {filteredQuestions.map((question, index) => (
            <Card
              key={question.id}
              className="flex-shrink-0 w-1/2 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-gray-200 hover:border-indigo-300"
            >
              <Link to={`/qa/${question.slug}`} className="block h-full">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${getStageColor(question.funnelStage)} text-xs px-2 py-1`}>
                      {getStageLabel(question.funnelStage)}
                    </Badge>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {question.title}
                  </h4>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                    {question.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                    {question.topic !== currentTopic && (
                      <Badge variant="secondary" className="text-xs">
                        {question.topic}
                      </Badge>
                    )}
                    {question.readingTime && (
                      <span className="ml-auto">{question.readingTime} min read</span>
                    )}
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* View All Button */}
      {questions.length > maxDisplay && (
        <div className="text-center mt-6">
          <Button variant="outline" asChild>
            <Link to={`/qa${currentTopic ? `?topic=${encodeURIComponent(currentTopic)}` : ''}`}>
              View All Questions
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
};

export default QARelatedCarousel;