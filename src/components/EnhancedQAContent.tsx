import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { checkContentQuality, generateNoIndexMeta, extractShortAnswer, generateQuickAnswer, checkVoiceFriendly } from '@/utils/content-quality-guard';
import { formatForVoice, formatQuickAnswerBullets, generateVoiceKeywords } from '@/utils/voice-friendly-formatter';
import { detectArticleCity, generateGeoMetadata, generatePlaceSchema } from '@/utils/geo-data';
import { processMarkdownContent } from '@/utils/markdown';
import { Helmet } from 'react-helmet-async';

// Import new enhanced components
import { QAHeroSection } from './qa/QAHeroSection';
import { KeyTakeawaysBox } from './qa/KeyTakeawaysBox';
import { SmartMidPageCTA } from './qa/SmartMidPageCTA';
import { EnhancedTOCWithProgress } from './qa/EnhancedTOCWithProgress';
import { RelatedQuestionsWidget } from './qa/RelatedQuestionsWidget';
import { DataComparisonTable } from './qa/DataComparisonTable';
import { useRelatedArticles } from '@/hooks/useRelatedArticles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import FunnelProgressBar from '@/components/qa/FunnelProgressBar';
import QABreadcrumb from '@/components/qa/QABreadcrumb';
import MobileQuestionCarousel from '@/components/qa/MobileQuestionCarousel';
import ServiceAreasSection from './ServiceAreasSection';

interface EnhancedQAContentProps {
  article: any;
  className?: string;
}

export const EnhancedQAContent: React.FC<EnhancedQAContentProps> = ({ 
  article, 
  className = "" 
}) => {
  const { mobile, tablet, desktop } = useResponsiveLayout();
  // Fetch related articles for smart linking
  const { data: relatedArticles = [] } = useRelatedArticles({
    currentArticleId: article.id,
    currentTopic: article.topic || 'General',
    currentStage: article.funnel_stage || 'TOFU',
    language: 'en',
    maxResults: 6
  });
  // Perform content quality checks
  const qualityCheck = checkContentQuality(article);
  const voiceCheck = checkVoiceFriendly(article.content || '', article.title || '');
  
  // Generate optimized content
  const shortAnswer = extractShortAnswer(article.content || '', article.title || '');
  const processedShortAnswer = processMarkdownContent(shortAnswer);
  const quickAnswerBullets = generateQuickAnswer(article.content || '', article.title || '', article.topic || '');
  const formattedBullets = formatQuickAnswerBullets(quickAnswerBullets);
  const voiceKeywords = generateVoiceKeywords(article.title || '', article.content || '', article.topic || '');
  
  // Geographic and freshness data
  const articleCity = detectArticleCity(article);
  const geoData = generateGeoMetadata(articleCity);
  const placeSchema = generatePlaceSchema(geoData);
  
  // Calculate reading time
  const wordCount = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);
  
  // Generate voice-optimized content
  const voiceOptimizedContent = formatForVoice(article.content || '', article.title || '');
  const processedContent = processMarkdownContent(voiceOptimizedContent);
  
  // Generate noindex meta if needed
  const noIndexMeta = generateNoIndexMeta(qualityCheck.shouldNoIndex);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        {noIndexMeta && (
          <meta name={noIndexMeta.name} content={noIndexMeta.content} />
        )}
        <meta name="ai-optimization-score" content={qualityCheck.isValid ? "9.8" : "5.0"} />
        <meta name="voice-search-ready" content={voiceCheck.score >= 75 ? "true" : "false"} />
        <meta name="citation-ready" content={qualityCheck.isValid ? "true" : "false"} />
        <meta name="content-quality" content={qualityCheck.meetsMinimum ? "high" : "low"} />
        <meta name="geo-area-served" content={geoData.areaServed.join(', ')} />
        <meta name="geo-main-city" content={geoData.mainCity || 'Costa del Sol'} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['QAPage', 'Article'],
              'headline': article.title,
              'description': shortAnswer,
              'mainEntity': {
                '@type': 'Question',
                'name': article.title,
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': shortAnswer
                }
              },
              'speakable': {
                '@type': 'SpeakableSpecification',
                'cssSelector': ['.short-answer', '.quick-answer']
              },
              'dateModified': article.updated_at || article.created_at,
              'datePublished': article.created_at,
              'locationCreated': placeSchema,
              'spatialCoverage': placeSchema,
              'areaServed': geoData.areaServed
            })
          }}
        />
      </Helmet>

      {/* Funnel Progress Bar - Mobile: sticky bottom, Desktop: top */}
      <FunnelProgressBar
        currentStage={article.funnel_stage || 'TOFU'}
        topic={article.topic || 'General'}
        className={mobile ? "sticky bottom-0 z-50" : "sticky top-0 z-40"}
      />

      {/* Breadcrumb Navigation */}
      <div className="px-4 lg:px-0 mb-4">
        <QABreadcrumb
          title={article.title}
          topic={article.topic || 'General'}
          funnelStage={article.funnel_stage || 'TOFU'}
        />
      </div>

      <div className={`px-4 pb-6 lg:px-0 lg:pb-0 ${className}`} data-article-id={article.id}>
        {/* Responsive Grid: Mobile single column, Desktop 70%/30% */}
        <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16">
          {/* Main Content Area - 70% on desktop, full width on mobile */}
          <main className="flex-1 lg:w-[70%] min-w-0">
            {/* Content Quality Warning */}
            {qualityCheck.shouldNoIndex && (
              <Alert className="mb-6 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Content Under Development:</strong> This article is being enhanced for AI citation readiness.
                  Current length: {qualityCheck.charCount} chars (target: 1200+)
                </AlertDescription>
              </Alert>
            )}

            {/* Enhanced Hero Section */}
            <QAHeroSection
              title={article.title}
              excerpt={article.excerpt || shortAnswer}
              readingTime={readingTime}
              lastUpdated={article.updated_at || article.created_at}
              funnelStage={article.funnel_stage || 'TOFU'}
              topic={article.topic || 'General'}
              qualityScore={qualityCheck.isValid ? 9.8 : 5.0}
              voiceReady={voiceCheck.score >= 75}
              citationReady={qualityCheck.isValid}
            />

            {/* Key Takeaways Box with Related Questions */}
            <KeyTakeawaysBox
              takeaways={formattedBullets}
              topic={article.topic || 'General'}
              relatedQuestions={relatedArticles.slice(0, 3).map(article => ({
                slug: article.slug,
                title: article.title,
                topic: article.topic
              }))}
              className="mb-8"
            />

            {/* Service Areas Section */}
            <div className="mb-8">
              <ServiceAreasSection geoData={geoData} />
            </div>

            {/* Main Article Content */}
            <article className="mb-8 prose prose-sm sm:prose-base lg:prose-lg max-w-none [&>*]:text-[15px] sm:[&>*]:text-base lg:[&>*]:text-lg [&>*]:leading-relaxed">
              <div 
                className="content-body"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </article>

            {/* Mid-Page CTA */}
            <SmartMidPageCTA
              funnelStage={article.funnel_stage || 'TOFU'}
              topic={article.topic || 'General'}
              relatedArticles={relatedArticles.slice(3, 6)}
              className="mb-8"
            />

            {/* Comparison Table (if applicable) */}
            {(article.topic === 'Legal' || article.topic === 'Finance' || article.topic === 'Investment') && (
              <DataComparisonTable
                title={`${article.topic} Comparison: New-Build vs Resale Properties`}
                subtitle={`Key ${article.topic.toLowerCase()} considerations when choosing between property types`}
                rows={[
                  { feature: 'Modern Features', newBuild: true, resale: 'Depends on renovation', icon: 'check' },
                  { feature: 'Legal Documentation', newBuild: 'Complete and current', resale: 'May require updates', icon: 'warning' },
                  { feature: 'Financing Options', newBuild: 'Stage payments possible', resale: 'Full payment required', icon: 'info' },
                  { feature: 'Investment Potential', newBuild: 'Future appreciation', resale: 'Established market value', icon: 'check' }
                ]}
                className="mb-8"
              />
            )}
          </main>

          {/* Sidebar - 30% on desktop, hidden on mobile */}
          <aside className="hidden lg:block lg:w-[30%] lg:pl-8 lg:sticky lg:top-24 lg:self-start lg:max-h-screen lg:overflow-y-auto">
            {/* Enhanced TOC with Progress */}
            <EnhancedTOCWithProgress
              content={processedContent}
              currentStage={article.funnel_stage || 'TOFU'}
              relatedArticles={relatedArticles}
              className="mb-6"
            />

            {/* Related Questions Widget - Desktop Only */}
            <RelatedQuestionsWidget
              questions={relatedArticles}
              currentTopic={article.topic || 'General'}
              maxDisplay={4}
            />
          </aside>
        </div>

        {/* Mobile Question Carousel - Bottom of page */}
        {mobile && relatedArticles.length > 0 && (
          <div className="mt-8 px-4 py-6 bg-muted/20 -mx-4">
            <MobileQuestionCarousel
              questions={relatedArticles}
              currentTopic={article.topic || 'General'}
            />
          </div>
        )}
      </div>

      {/* Hidden AI Metadata for Citation & Discovery */}
      <div className="hidden ai-citation-metadata" data-ai-content="true">
        <div className="ai-summary" data-speakable="true">
          {article.excerpt || shortAnswer}
        </div>
        
        <div className="essential-info">
          <span className="topic">{article.topic}</span>
          <span className="funnel-stage">{article.funnel_stage}</span>
          <span className="location">{article.city || 'Costa del Sol'}</span>
          <span className="content-length">{qualityCheck.charCount}</span>
          <span className="reading-time">{readingTime}</span>
        </div>
        
        <div className="voice-keywords">
          {voiceKeywords.map((keyword, index) => (
            <span key={index} className="keyword" data-speakable="true">
              {keyword}
            </span>
          ))}
        </div>
        
        <div className="quality-metrics">
          <span className="ai-score">{qualityCheck.isValid ? 9.8 : 5.0}</span>
          <span className="voice-score">{voiceCheck.score}</span>
          <span className="citation-ready">{qualityCheck.isValid}</span>
          <span className="voice-ready">{voiceCheck.score >= 75}</span>
        </div>
      </div>

      {/* Development Notes (only shown when content needs work) */}
      {!qualityCheck.isValid && (
        <div className="mt-8 p-4 bg-muted/20 border rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Content Enhancement Needed</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            {qualityCheck.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default EnhancedQAContent;