import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RelatedQuestion {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  funnelStage: string;
  topic: string;
  readingTime?: number;
  last_updated?: string;
}

interface RelatedQuestionsGridProps {
  questions: RelatedQuestion[];
  currentTopic?: string;
  maxInitialDisplay?: number;
  className?: string;
}

export const RelatedQuestionsGrid: React.FC<RelatedQuestionsGridProps> = ({
  questions,
  currentTopic,
  maxInitialDisplay = 8,
  className = "",
}) => {
  const [showAll, setShowAll] = useState(false);
  
  const filteredQuestions = questions.filter(q => 
    currentTopic ? q.topic === currentTopic : true
  );

  const displayedQuestions = showAll 
    ? filteredQuestions 
    : filteredQuestions.slice(0, maxInitialDisplay);

  const hasMoreQuestions = filteredQuestions.length > maxInitialDisplay;

  const getStageColor = (stage: string) => {
    const colors = {
      TOFU: 'bg-blue-50 text-blue-700 border-blue-200',
      MOFU: 'bg-amber-50 text-amber-700 border-amber-200',
      BOFU: 'bg-green-50 text-green-700 border-green-200'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
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
    <section className={`space-y-12 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
          Related Questions & Answers
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore these commonly asked questions to deepen your understanding and make informed decisions about your Costa del Sol property journey.
        </p>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
        {displayedQuestions.map((question, index) => (
          <Card
            key={question.id}
            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden p-8 h-full"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Link to={`/qa/${question.slug}`} className="block h-full">
              <div className="flex flex-col h-full space-y-6">
                {/* Header with stage and meta */}
                <div className="flex items-start justify-between">
                  <Badge className={`${getStageColor(question.funnelStage)} text-sm px-4 py-2 font-medium border`}>
                    {getStageLabel(question.funnelStage)}
                  </Badge>
                  <ArrowUpRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200" />
                </div>

                {/* Title */}
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight line-clamp-3">
                  {question.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 leading-relaxed line-clamp-4 flex-grow text-base">
                  {question.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {question.topic !== currentTopic && (
                      <Badge variant="outline" className="text-xs px-3 py-1 bg-gray-50">
                        {question.topic}
                      </Badge>
                    )}
                    {question.readingTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{question.readingTime} min read</span>
                      </div>
                    )}
                  </div>
                  {question.last_updated && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{question.last_updated}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      {/* Load More / View All */}
      {hasMoreQuestions && (
        <div className="text-center space-y-4">
          {!showAll ? (
            <Button
              onClick={() => setShowAll(true)}
              size="lg"
              className="px-8 py-4 text-base font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Show {filteredQuestions.length - maxInitialDisplay} More Questions
              <ArrowUpRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => setShowAll(false)}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-base font-semibold rounded-2xl"
              >
                Show Less
              </Button>
              <Button variant="outline" size="lg" asChild className="px-8 py-4 text-base font-semibold rounded-2xl">
                <Link to={`/qa${currentTopic ? `?topic=${encodeURIComponent(currentTopic)}` : ''}`}>
                  Browse All Questions
                  <ArrowUpRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default RelatedQuestionsGrid;