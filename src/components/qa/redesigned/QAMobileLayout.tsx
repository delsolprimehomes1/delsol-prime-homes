import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Zap, CheckCircle, Calendar, Clock } from 'lucide-react';
import { FreshnessIndicator } from '@/components/FreshnessIndicator';
import { ContextualContentProcessor } from '../ContextualContentProcessor';

interface QAMobileLayoutProps {
  title: string;
  excerpt: string;
  content: string;
  topic: string;
  funnelStage: string;
  readingTime: number;
  lastUpdated: string;
  qualityScore: number;
  voiceReady: boolean;
  citationReady: boolean;
  quickAnswer: string;
  relatedArticles: any[];
  ctaComponent: React.ReactNode;
}

export const QAMobileLayout: React.FC<QAMobileLayoutProps> = ({
  title,
  excerpt,
  content,
  topic,
  funnelStage,
  readingTime,
  lastUpdated,
  qualityScore,
  voiceReady,
  citationReady,
  quickAnswer,
  relatedArticles,
  ctaComponent,
}) => {
  const [quickAnswerExpanded, setQuickAnswerExpanded] = useState(false);
  
  const stageProgress = {
    TOFU: { step: 1, total: 3, label: 'Getting Started' },
    MOFU: { step: 2, total: 3, label: 'Researching' },
    BOFU: { step: 3, total: 3, label: 'Ready to Buy' },
  };

  const currentProgress = stageProgress[funnelStage as keyof typeof stageProgress] || stageProgress.TOFU;

  return (
    <div className="qa-mobile-container px-4 py-6 space-y-6 lg:hidden">
      {/* Sticky Header with Progress */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b -mx-4 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">
            Step {currentProgress.step} of {currentProgress.total}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-12 h-1 rounded ${
                  step <= currentProgress.step ? 'bg-indigo-500' : 
                  step === currentProgress.step + 1 ? 'bg-indigo-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question Hero (Mobile) */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
        </div>
        
        {/* Mobile Status Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium whitespace-nowrap">
            ✓ Citation Ready
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap">
            🎙 Voice Ready
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium whitespace-nowrap">
            AI Score: {qualityScore}/10
          </span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <FreshnessIndicator lastUpdated={lastUpdated} dateModified={lastUpdated} />
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{readingTime} min read</span>
          </div>
        </div>
      </section>

      {/* Expandable Quick Answer (Mobile) */}
      <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button 
          className="w-full p-4 flex items-center justify-between text-left touch-manipulation"
          onClick={() => setQuickAnswerExpanded(!quickAnswerExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="font-semibold text-gray-900">Quick Answer</span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transform transition-transform ${
              quickAnswerExpanded ? 'rotate-180' : ''
            }`} 
          />
        </button>
        
        {quickAnswerExpanded && (
          <div className="px-4 pb-4 animate-accordion-down">
            <p className="text-gray-700 leading-relaxed">
              {quickAnswer}
            </p>
          </div>
        )}
      </Card>

      {/* Mobile Content with Contextual Links */}
      <article className="prose prose-sm max-w-none">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <ContextualContentProcessor
            content={content}
            relatedArticles={relatedArticles}
            currentTopic={topic}
            currentStage={funnelStage}
          />
        </div>
      </article>

      {/* Floating CTA (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t z-50 lg:hidden">
        {ctaComponent}
      </div>

      {/* Add bottom padding to prevent content being hidden behind floating CTA */}
      <div className="h-20"></div>
    </div>
  );
};

export default QAMobileLayout;