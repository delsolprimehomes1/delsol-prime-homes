import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { checkContentQuality, generateNoIndexMeta, extractShortAnswer, generateQuickAnswer, checkVoiceFriendly } from '@/utils/content-quality-guard';
import { formatForVoice, formatQuickAnswerBullets, generateVoiceKeywords } from '@/utils/voice-friendly-formatter';
import { detectArticleCity, generateGeoMetadata, generatePlaceSchema } from '@/utils/geo-data';
import { processMarkdownContent } from '@/utils/markdown';
import { Helmet } from 'react-helmet-async';

// Import new enhanced components
import { QAHeroSection } from './qa/QAHeroSection';
import { KeyTakeawaysBox } from './qa/KeyTakeawaysBox';
import { SmartMidPageCTA } from './qa/SmartMidPageCTA';
import { DataComparisonTable } from './qa/DataComparisonTable';
import { ContextualContentProcessor } from './qa/ContextualContentProcessor';
import { DiagramDisplay } from './qa/DiagramDisplay';
import { useRelatedArticles } from '@/hooks/useRelatedArticles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import FunnelProgressBar from '@/components/qa/FunnelProgressBar';
import QABreadcrumb from '@/components/qa/QABreadcrumb';
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
  
  // Extract diagram from markdown_frontmatter
  const diagram = article.markdown_frontmatter?.diagram;
  
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

      {/* Funnel Progress Bar - Hidden from public view */}
      {/* <FunnelProgressBar
        currentStage={article.funnel_stage || 'TOFU'}
        topic={article.topic || 'General'}
        className={mobile ? "sticky bottom-0 z-50" : "sticky top-0 z-40"}
      /> */}

      {/* Breadcrumb Navigation */}
      <div className="px-4 lg:px-0 mb-4">
        <QABreadcrumb
          title={article.title}
          topic={article.topic || 'General'}
        />
      </div>

      <div className={`px-4 pb-6 lg:px-0 lg:pb-0 ${className}`} data-article-id={article.id}>
        {/* Single Column Layout - Clean and Focused */}
        <div className="max-w-4xl mx-auto">
          {/* Main Content Area - Full width, optimized for reading */}
          <main className="w-full">
            {/* Content Quality Enhancement Indicator */}
            {qualityCheck.isValid && voiceCheck.score >= 75 ? (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">Expert-Level Content</p>
                    <p className="text-green-700 text-sm">Fully optimized for AI citation and voice search discovery</p>
                  </div>
                </div>
              </div>
            ) : qualityCheck.charCount >= 1200 ? (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium">Content Enhanced</p>
                    <p className="text-blue-700 text-sm">Comprehensive guide ready for your Costa del Sol property journey</p>
                  </div>
                </div>
              </div>
            ) : null}
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

            {/* Speakable Answer for Voice Search */}
            {article.speakable_answer && (
              <div className="speakable mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl" data-speakable="true">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2">Voice Search Answer</p>
                    <p className="text-base leading-relaxed text-blue-900">{article.speakable_answer}</p>
                  </div>
                </div>
              </div>
            )}

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

            {/* Visual Content (AI-Generated Image/Diagram or Mermaid) */}
            {diagram && (
              <DiagramDisplay 
                diagram={diagram}
                title={article.title}
                className="mb-8"
              />
            )}

            {/* Main Article Content with Contextual Links */}
            <article className="mb-8">
              <ContextualContentProcessor
                content={article.content || ''}
                relatedArticles={relatedArticles}
                currentTopic={article.topic || 'General'}
                currentStage={article.funnel_stage || 'TOFU'}
              />
            </article>

            {/* Mid-Page CTA */}
            <SmartMidPageCTA
              funnelStage={article.funnel_stage || 'TOFU'}
              topic={article.topic || 'General'}
              relatedArticles={relatedArticles.slice(3, 6)}
              className="mb-8"
            />

            {/* Financial Disclaimer (for finance-related articles) */}
            {(article.topic === 'Finance' || article.topic === 'Mortgage' || article.title.toLowerCase().includes('mortgage') || article.title.toLowerCase().includes('finance')) && (
              <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-2">Financial Information Disclaimer</p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      This content provides general information about mortgage calculators and financial tools for educational purposes only. 
                      It does not constitute financial advice. Mortgage rates, terms, and eligibility criteria vary by lender and individual circumstances. 
                      Always consult with licensed mortgage advisors and financial professionals before making property financing decisions. 
                      DelSolPrimeHomes is not a financial institution and does not provide mortgage services directly.
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            {/* Journey Progress Footer */}
            <div className="mt-12 pt-8 border-t border-border/40">
              <div className="text-center space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">Continue Your Journey</h3>
                <p className="text-sm text-muted-foreground/80">Explore related topics through the contextual links above to deepen your Costa del Sol property knowledge</p>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Hidden AI Metadata for Citation & Discovery */}
      <div className="hidden ai-citation-metadata" data-ai-content="true" style={{ display: 'none' }} aria-hidden="true">
        <div className="ai-summary" data-speakable="true">
          {article.excerpt || shortAnswer}
        </div>
        
        <div className="essential-info">
          <span className="topic">{article.topic}</span>
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