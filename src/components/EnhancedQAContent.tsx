import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Mic, Quote, AlertTriangle } from 'lucide-react';
import { checkContentQuality, generateNoIndexMeta, extractShortAnswer, generateQuickAnswer, checkVoiceFriendly } from '@/utils/content-quality-guard';
import { formatForVoice, formatQuickAnswerBullets, generateVoiceKeywords } from '@/utils/voice-friendly-formatter';
import { Helmet } from 'react-helmet-async';

interface EnhancedQAContentProps {
  article: any;
  className?: string;
}

export const EnhancedQAContent: React.FC<EnhancedQAContentProps> = ({ 
  article, 
  className = "" 
}) => {
  // Perform content quality checks
  const qualityCheck = checkContentQuality(article);
  const voiceCheck = checkVoiceFriendly(article.content || '', article.title || '');
  
  // Generate optimized content
  const shortAnswer = extractShortAnswer(article.content || '', article.title || '');
  const quickAnswerBullets = generateQuickAnswer(article.content || '', article.title || '', article.topic || '');
  const formattedBullets = formatQuickAnswerBullets(quickAnswerBullets);
  const voiceKeywords = generateVoiceKeywords(article.title || '', article.content || '', article.topic || '');
  
  // Calculate reading time
  const wordCount = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);
  
  // Generate voice-optimized content
  const voiceOptimizedContent = formatForVoice(article.content || '', article.title || '');
  
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
      </Helmet>

      <div className={`enhanced-qa-content ${className}`} data-article-id={article.id}>
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

        {/* Article Header with Quality Indicators */}
        <header className="mb-8">
          <h1 className="question-title text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant={qualityCheck.isValid ? "default" : "secondary"} className="flex items-center gap-1">
              <Quote className="w-3 h-3" />
              {qualityCheck.isValid ? 'Citation Ready' : 'Needs Enhancement'}
            </Badge>
            
            <Badge variant={voiceCheck.score >= 75 ? "default" : "secondary"} className="flex items-center gap-1">
              <Mic className="w-3 h-3" />
              {voiceCheck.score >= 75 ? 'Voice Optimized' : 'Voice Pending'}
            </Badge>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {qualityCheck.charCount} characters
            </div>
          </div>
        </header>

        {/* Short Answer - Voice Search Optimized */}
        <section className="mb-8">
          <div 
            className="short-answer bg-primary/5 border border-primary/20 rounded-lg p-6 prose prose-lg max-w-none"
            data-speakable="true"
            data-voice-priority="high"
          >
            <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Quick Answer
            </h2>
            <div className="text-foreground leading-relaxed">
              {shortAnswer || 'Short answer being generated...'}
            </div>
          </div>
        </section>

        {/* Quick Answer Bullets - AI Citation Ready */}
        <section className="mb-8">
          <div 
            className="quick-answer bg-muted/30 border rounded-lg p-6"
            data-speakable="true"
            data-citation-ready="true"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Quote className="w-5 h-5" />
              Key Points
            </h2>
            <ul className="space-y-2">
              {formattedBullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">•</span>
                  <span className="text-foreground leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Main Article Content */}
        <article className="body prose prose-lg max-w-none">
          <div 
            className="content-body"
            dangerouslySetInnerHTML={{ __html: voiceOptimizedContent }}
          />
        </article>

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
      </div>
    </>
  );
};

export default EnhancedQAContent;