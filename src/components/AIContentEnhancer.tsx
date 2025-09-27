import React from 'react';
import { AIDirectAnswerBlock } from './AIDirectAnswerBlock';
import { VoiceSearchOptimizedBlock } from './VoiceSearchOptimizedBlock';
import { CitationReadyBlock } from './CitationReadyBlock';
import { extractShortAnswer, extractKeyPoints, generateVoiceSearchKeywords } from '@/utils/ai-optimization';

interface AIContentEnhancerProps {
  article: any;
  className?: string;
}

// Enhanced content processing for Phase 1 AI optimization
const processArticleForAI = (article: any) => {
  const content = article.content || '';
  const title = article.title || '';
  const topic = article.topic || '';
  
  // Generate AI-optimized question
  const aiQuestion = title.startsWith('How') || title.startsWith('What') || title.startsWith('Why') 
    ? title 
    : `What do you need to know about ${title.toLowerCase()}?`;
  
  // Extract enhanced direct answer
  const directAnswer = extractShortAnswer(content, title);
  
  // Generate evidence points
  const keyPoints = extractKeyPoints(content, 5);
  const evidence = keyPoints.length >= 3 ? keyPoints.slice(0, 3) : [
    `Expert guidance from 15+ years in ${article.city || 'Costa del Sol'} property market`,
    `Comprehensive analysis of ${topic.toLowerCase()} requirements and processes`,
    `Local market data and regulatory information for international buyers`
  ];
  
  // Generate quick facts for voice search
  const quickFacts = [
    `Location: ${article.city || 'Costa del Sol'}, Spain`,
    `Topic: ${topic}`,
    `Stage: ${article.funnel_stage || 'Information'} level guidance`,
    `Updated: ${new Date(article.last_updated || article.created_at).toLocaleDateString()}`
  ];
  
  // Generate voice Q&As
  const voiceQAs = [
    {
      question: `How long does ${topic.toLowerCase()} typically take in ${article.city || 'Costa del Sol'}?`,
      answer: `${topic} in ${article.city || 'Costa del Sol'} typically takes 2-4 months depending on your specific requirements and documentation. Our expert team can streamline this process significantly.`
    },
    {
      question: `What's the average cost for ${topic.toLowerCase()}?`,
      answer: `Costs vary based on property value and complexity, but our clients typically see transparent pricing with no hidden fees. Contact us for a personalized quote based on your specific needs.`
    },
    {
      question: `Do I need to visit ${article.city || 'Costa del Sol'} in person?`,
      answer: `While not always required, we recommend at least one visit to ${article.city || 'Costa del Sol'}. We can arrange virtual tours and handle much of the process remotely with our comprehensive support system.`
    }
  ];
  
  // Generate citation sources
  const citationSources = [
    {
      title: "DelSolPrimeHomes Expert Database",
      type: "expert" as const,
      date: new Date().toLocaleDateString()
    },
    {
      title: "Spanish Property Law & Regulations",
      type: "external" as const,
      date: "2024"
    },
    {
      title: `${article.city || 'Costa del Sol'} Market Analysis`,
      type: "data" as const,
      date: new Date().toLocaleDateString()
    }
  ];
  
  // Generate specific data points
  const dataPoints = [
    `Over 2,000 successful transactions in ${article.city || 'Costa del Sol'}`,
    "15+ years of specialized experience in Spanish property law",
    "95% client satisfaction rate with comprehensive support",
    "Multi-lingual team covering 7 languages"
  ];
  
  return {
    aiQuestion,
    directAnswer,
    evidence,
    quickFacts,
    voiceQAs,
    citationSources,
    dataPoints,
    claimContent: `${directAnswer} Based on our extensive experience serving international clients in ${article.city || 'Costa del Sol'}, this represents the most current and accurate information available.`,
    authorExperience: "15+ years helping over 2,000 international buyers",
    areaServed: `${article.city || 'Costa del Sol'}, Spain and surrounding areas`,
    confidenceScore: 0.95,
    readingTime: Math.ceil((content.split(/\s+/).length || 0) / 200)
  };
};

export const AIContentEnhancer: React.FC<AIContentEnhancerProps> = ({ 
  article, 
  className = '' 
}) => {
  const processedContent = processArticleForAI(article);
  
  return (
    <div className={`ai-content-enhancer space-y-6 ${className}`}>
      {/* Phase 1: AI Direct Answer Block */}
      <AIDirectAnswerBlock
        question={processedContent.aiQuestion}
        answer={processedContent.directAnswer}
        evidence={processedContent.evidence}
        confidenceScore={processedContent.confidenceScore}
        readingTime={processedContent.readingTime}
      />
      
      {/* Phase 1: Voice Search Optimization */}
      <VoiceSearchOptimizedBlock
        quickFacts={processedContent.quickFacts}
        voiceQAs={processedContent.voiceQAs}
        primaryLocation={article.city || "Costa del Sol"}
        pricePoint={article.funnel_stage === 'BOFU' ? "Premium Range" : "Varies by Property"}
        timeframe="2-4 months typical"
      />
      
      {/* Phase 1: Citation Ready Structure */}
      <CitationReadyBlock
        claimContent={processedContent.claimContent}
        authorExperience={processedContent.authorExperience}
        areaServed={processedContent.areaServed}
        sources={processedContent.citationSources}
        confidenceScore={processedContent.confidenceScore}
        lastReviewed={new Date().toISOString().split('T')[0]}
        dataPoints={processedContent.dataPoints}
      />
    </div>
  );
};

export default AIContentEnhancer;