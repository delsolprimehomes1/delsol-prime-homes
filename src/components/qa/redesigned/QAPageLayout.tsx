import React from 'react';
import { Card } from '@/components/ui/card';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import QAHeroSection from './QAHeroSection';
import QAJourneyProgress from './QAJourneyProgress';
import QAQuickAnswer from './QAQuickAnswer';
import RelatedQuestionsGrid from './RelatedQuestionsGrid';
import QACTASection from './QACTASection';
import QAMobileLayout from './QAMobileLayout';
import QASpacedLayout from './QASpacedLayout';

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

  // Desktop Layout - Spacious and clean
  return (
    <QASpacedLayout>
      <div className="max-w-6xl mx-auto space-y-20">
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

        {/* Main Content Section */}
        <section>
          <article className="prose prose-xl max-w-none">
            <Card className="bg-white rounded-3xl shadow-xl p-12 lg:p-16 space-y-8 border-0">
              <div className="space-y-8 text-lg leading-relaxed">
                {children}
              </div>
            </Card>
          </article>
        </section>

        {/* Related Questions Grid - Full Width */}
        {relatedQuestions.length > 0 && (
          <RelatedQuestionsGrid
            questions={relatedQuestions}
            currentTopic={article.topic}
            maxInitialDisplay={8}
          />
        )}

        {/* Journey Progress & CTA Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <QAJourneyProgress
            currentStage={article.funnel_stage}
            topic={article.topic}
          />
          {ctaComponent}
        </section>

        {/* Topic Tags Section - Full Width */}
        {article.tags && article.tags.length > 0 && (
          <section>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg p-12 border-0">
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Explore Related Topics</h3>
                <p className="text-gray-600 text-lg">Discover more insights about Costa del Sol properties</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {article.tags.slice(0, 10).map((tag, index) => (
                    <a
                      key={index}
                      href={`/qa?topic=${encodeURIComponent(tag)}`}
                      className="px-6 py-3 bg-white hover:bg-blue-50 rounded-2xl text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 border border-blue-100 hover:border-blue-200"
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              </div>
            </Card>
          </section>
        )}
      </div>
    </QASpacedLayout>
  );
};

export default QAPageLayout;