import React from 'react';
import { Card } from '@/components/ui/card';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import QAHeroSection from './QAHeroSection';
import QAJourneyProgress from './QAJourneyProgress';
import QAQuickAnswer from './QAQuickAnswer';
import QARelatedCarousel from './QARelatedCarousel';
import QACTASection from './QACTASection';
import QAMobileLayout from './QAMobileLayout';

interface QAArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  funnel_stage: 'TOFU' | 'MOFU' | 'BOFU';
  topic: string;
  last_updated: string;
  ai_optimization_score: number;
  voice_search_ready: boolean;
  citation_ready: boolean;
  tags?: string[];
}

interface RelatedQuestion {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  funnelStage: string;
  topic: string;
  readingTime?: number;
}

interface QAPageLayoutProps {
  article: QAArticle;
  relatedQuestions?: RelatedQuestion[];
  readingTime: number;
  children: React.ReactNode;
}

export const QAPageLayout: React.FC<QAPageLayoutProps> = ({
  article,
  relatedQuestions = [],
  readingTime,
  children,
}) => {
  const breakpoints = useResponsiveLayout();

  // Generate quick answer from excerpt
  const quickAnswer = article.excerpt || 
    "Get expert guidance on your Costa del Sol property journey with personalized recommendations and professional support.";

  // CTA Component
  const ctaComponent = (
    <QACTASection 
      funnelStage={article.funnel_stage}
      topic={article.topic}
    />
  );

  // Mobile Layout
  if (breakpoints.mobile) {
    return (
      <QAMobileLayout
        title={article.title}
        excerpt={article.excerpt}
        funnelStage={article.funnel_stage}
        readingTime={readingTime}
        lastUpdated={article.last_updated}
        qualityScore={article.ai_optimization_score || 0}
        voiceReady={article.voice_search_ready || false}
        citationReady={article.citation_ready || false}
        quickAnswer={quickAnswer}
        ctaComponent={ctaComponent}
      >
        {children}
      </QAMobileLayout>
    );
  }

  // Desktop Layout - 12-column grid
  return (
    <div className="qa-container max-w-7xl mx-auto grid grid-cols-12 gap-8 px-6 py-8">
      {/* Main Content Area (8 columns) */}
      <main className="col-span-8 space-y-8">
        {/* Hero Question Block */}
        <QAHeroSection
          title={article.title}
          excerpt={article.excerpt}
          readingTime={readingTime}
          lastUpdated={article.last_updated}
          funnelStage={article.funnel_stage}
          topic={article.topic}
          qualityScore={article.ai_optimization_score || 0}
          voiceReady={article.voice_search_ready || false}
          citationReady={article.citation_ready || false}
        />

        {/* Quick Answer Card */}
        <QAQuickAnswer
          directAnswer={quickAnswer}
        />

        {/* Detailed Content */}
        <article className="prose prose-lg max-w-none">
          <Card className="bg-white rounded-2xl shadow-md p-8 space-y-6">
            {children}
          </Card>
        </article>

        {/* Related Q&A Carousel */}
        {relatedQuestions.length > 0 && (
          <QARelatedCarousel
            questions={relatedQuestions}
            currentTopic={article.topic}
            maxDisplay={6}
          />
        )}
      </main>

      {/* Sidebar (4 columns) */}
      <aside className="col-span-4 space-y-6">
        {/* Journey Progress */}
        <QAJourneyProgress
          currentStage={article.funnel_stage}
          topic={article.topic}
        />

        {/* CTA Widget */}
        {ctaComponent}

        {/* Topic Tags */}
        {article.tags && article.tags.length > 0 && (
          <Card className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4">Browse Topics</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 8).map((tag, index) => (
                <a
                  key={index}
                  href={`/qa?topic=${encodeURIComponent(tag)}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                >
                  {tag}
                </a>
              ))}
            </div>
          </Card>
        )}
      </aside>
    </div>
  );
};

export default QAPageLayout;