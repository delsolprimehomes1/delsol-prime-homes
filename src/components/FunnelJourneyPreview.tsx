import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, Calendar, Download, Mail, Phone } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  topic: string;
  funnel_stage: string;
  points_to_mofu_id?: string;
  points_to_bofu_id?: string;
  final_cta_type?: 'booking' | 'consultation' | 'download' | 'newsletter' | 'custom';
  final_cta_url?: string;
}

interface FunnelJourneyPreviewProps {
  article: Article;
  allArticles: Article[];
}

export const FunnelJourneyPreview: React.FC<FunnelJourneyPreviewProps> = ({ article, allArticles }) => {
  const getJourneyPath = (startArticle: Article): Article[] => {
    const path: Article[] = [startArticle];
    let currentArticle = startArticle;

    // Traverse forward through the funnel
    while (currentArticle) {
      let nextArticle: Article | undefined;

      if (currentArticle.funnel_stage === 'TOFU' && currentArticle.points_to_mofu_id) {
        nextArticle = allArticles.find(a => a.id === currentArticle.points_to_mofu_id);
      } else if (currentArticle.funnel_stage === 'MOFU' && currentArticle.points_to_bofu_id) {
        nextArticle = allArticles.find(a => a.id === currentArticle.points_to_bofu_id);
      }

      if (nextArticle && !path.find(p => p.id === nextArticle!.id)) {
        path.push(nextArticle);
        currentArticle = nextArticle;
      } else {
        break;
      }
    }

    // If we started from MOFU or BOFU, find the TOFU articles that lead here
    if (startArticle.funnel_stage !== 'TOFU') {
      const leadingArticles = findLeadingArticles(startArticle, allArticles);
      return [...leadingArticles, ...path];
    }

    return path;
  };

  const findLeadingArticles = (targetArticle: Article, articles: Article[]): Article[] => {
    const leading: Article[] = [];

    if (targetArticle.funnel_stage === 'MOFU') {
      // Find TOFU articles that point to this MOFU
      const tofuArticles = articles.filter(a => 
        a.funnel_stage === 'TOFU' && a.points_to_mofu_id === targetArticle.id
      );
      leading.push(...tofuArticles);
    } else if (targetArticle.funnel_stage === 'BOFU') {
      // Find MOFU articles that point to this BOFU
      const mofuArticles = articles.filter(a => 
        a.funnel_stage === 'MOFU' && a.points_to_bofu_id === targetArticle.id
      );
      
      // Then find TOFU articles that point to those MOFU articles
      for (const mofu of mofuArticles) {
        const tofuArticles = articles.filter(a => 
          a.funnel_stage === 'TOFU' && a.points_to_mofu_id === mofu.id
        );
        leading.push(...tofuArticles, mofu);
      }
    }

    return leading;
  };

  const getCTAIcon = (ctaType?: string) => {
    switch (ctaType) {
      case 'booking': return <Calendar className="w-4 h-4" />;
      case 'consultation': return <Phone className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'newsletter': return <Mail className="w-4 h-4" />;
      case 'custom': return <ExternalLink className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getCTALabel = (ctaType?: string) => {
    switch (ctaType) {
      case 'booking': return 'Book Appointment';
      case 'consultation': return 'Schedule Consultation';
      case 'download': return 'Download Guide';
      case 'newsletter': return 'Subscribe';
      case 'custom': return 'Custom Action';
      default: return 'Book Appointment';
    }
  };

  const journeyPath = getJourneyPath(article);
  const isTopicAligned = journeyPath.every((step, index) => 
    index === 0 || step.topic === journeyPath[0].topic || step.topic === 'general'
  );

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Complete Funnel Journey</h3>
          <p className="text-sm text-muted-foreground">
            {journeyPath.length} steps • Topic: {journeyPath[0]?.topic}
          </p>
        </div>
        <Badge variant={isTopicAligned ? 'default' : 'destructive'}>
          {isTopicAligned ? 'Topic Aligned' : 'Topic Misaligned'}
        </Badge>
      </div>

      {/* Journey Steps */}
      <div className="space-y-4">
        {journeyPath.map((step, index) => {
          const nextStep = journeyPath[index + 1];
          const isCurrentArticle = step.id === article.id;
          const topicMismatch = index > 0 && step.topic !== journeyPath[0].topic && step.topic !== 'general';

          return (
            <div key={step.id} className="relative">
              <Card className={`${isCurrentArticle ? 'ring-2 ring-primary' : ''} ${topicMismatch ? 'border-red-200' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={
                          step.funnel_stage === 'TOFU' ? 'default' : 
                          step.funnel_stage === 'MOFU' ? 'secondary' : 'destructive'
                        }
                      >
                        {step.funnel_stage}
                      </Badge>
                      <Badge variant={topicMismatch ? 'destructive' : 'outline'}>
                        {step.topic}
                      </Badge>
                      {isCurrentArticle && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">Step {index + 1}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">/{step.slug}</p>
                  
                  {/* Stage-specific content */}
                  {step.funnel_stage === 'TOFU' && (
                    <div className="text-sm text-blue-600">
                      🎯 Awareness Stage: Attracting potential buyers with helpful information
                    </div>
                  )}
                  {step.funnel_stage === 'MOFU' && (
                    <div className="text-sm text-orange-600">
                      🔍 Consideration Stage: Providing detailed guidance and comparisons
                    </div>
                  )}
                  {step.funnel_stage === 'BOFU' && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-green-600">
                        ✅ Decision Stage: Ready to take action
                      </div>
                      <Button size="sm" variant="outline" className="h-8">
                        {getCTAIcon(step.final_cta_type)}
                        <span className="ml-1">{getCTALabel(step.final_cta_type)}</span>
                      </Button>
                    </div>
                  )}

                  {topicMismatch && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      ⚠️ Topic mismatch: This step breaks topic consistency
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Arrow to next step */}
              {nextStep && (
                <div className="flex justify-center my-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-xs">
                      {step.funnel_stage === 'TOFU' && nextStep.funnel_stage === 'MOFU' && 'Research Phase'}
                      {step.funnel_stage === 'MOFU' && nextStep.funnel_stage === 'BOFU' && 'Decision Phase'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Journey Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Journey Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Steps:</span> {journeyPath.length}
            </div>
            <div>
              <span className="font-medium">Topic Consistency:</span>{' '}
              <span className={isTopicAligned ? 'text-green-600' : 'text-red-600'}>
                {isTopicAligned ? 'Aligned' : 'Misaligned'}
              </span>
            </div>
            <div>
              <span className="font-medium">Entry Point:</span> {journeyPath[0]?.funnel_stage}
            </div>
            <div>
              <span className="font-medium">Final CTA:</span> {getCTALabel(journeyPath[journeyPath.length - 1]?.final_cta_type)}
            </div>
          </div>

          {!isTopicAligned && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-sm text-yellow-800">
                <strong>Optimization Suggestion:</strong> Consider linking to topic-specific articles to improve user experience and conversion rates.
              </div>
            </div>
          )}

          {journeyPath.length < 3 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm text-blue-800">
                <strong>Incomplete Funnel:</strong> This journey is missing some funnel stages. Consider adding missing MOFU or BOFU content.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};