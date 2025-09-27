import React from 'react';
import { Card } from '@/components/ui/card';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import QAHeroSection from './QAHeroSection';
import QAJourneyProgress from './QAJourneyProgress';
import QAQuickAnswer from './QAQuickAnswer';
import QACTASection from './QACTASection';
import QAMobileLayout from './QAMobileLayout';
import QASpacedLayout from './QASpacedLayout';
import { ContextualContentProcessor } from '../ContextualContentProcessor';

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
  funnel_stage: string;
  topic: string;
  readingTime?: number;
  relevanceScore?: number;
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
        content={article.content}
        topic={article.topic}
        funnelStage={article.funnel_stage}
        readingTime={readingTime}
        lastUpdated={article.last_updated}
        qualityScore={article.ai_optimization_score || 0}
        voiceReady={article.voice_search_ready || false}
        citationReady={article.citation_ready || false}
        quickAnswer={quickAnswer}
        relatedArticles={relatedQuestions}
        ctaComponent={ctaComponent}
      />
    );
  }

  // Desktop Layout - Full Width, Clean Focus
  return (
    <QASpacedLayout>
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hero Section */}
        <section>
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
        </section>

        {/* Quick Answer Section */}
        <section>
          <QAQuickAnswer directAnswer={quickAnswer} />
        </section>

        {/* Main Content with Contextual Links */}
        <section>
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 lg:p-20 border-0">
            <ContextualContentProcessor
              content={article.content}
              relatedArticles={relatedQuestions}
              currentTopic={article.topic}
              currentStage={article.funnel_stage}
            />
          </div>
        </section>

        {/* Journey Progress & CTA Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <QAJourneyProgress
            currentStage={article.funnel_stage}
            topic={article.topic}
          />
          {ctaComponent}
        </section>

        {/* Continue Journey Footer */}
        <section>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg p-8 border-0">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Continue Your Property Journey</h3>
              <p className="text-gray-600">Discover related topics through the contextual links above to deepen your Costa del Sol property knowledge</p>
            </div>
          </Card>
        </section>
      </div>
    </QASpacedLayout>
  );
};

export default QAPageLayout;