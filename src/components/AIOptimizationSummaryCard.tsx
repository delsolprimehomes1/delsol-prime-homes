import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, TrendingUp, Globe, Mic, Quote, Brain } from 'lucide-react';

interface OptimizationSummaryProps {
  totalArticles: number;
  aiReadinessScore: number;
  voiceSearchScore: number;
  citationScore: number;
  multilingualScore: number;
  articlesOptimized: number;
  issuesFixed: number;
}

export const AIOptimizationSummaryCard: React.FC<OptimizationSummaryProps> = ({
  totalArticles,
  aiReadinessScore,
  voiceSearchScore,
  citationScore,
  multilingualScore,
  articlesOptimized,
  issuesFixed
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    if (score >= 50) return 'outline';
    return 'destructive';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          AI Optimization Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalArticles}</div>
            <div className="text-sm text-muted-foreground">Total Articles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{articlesOptimized}</div>
            <div className="text-sm text-muted-foreground">Optimized</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{issuesFixed}</div>
            <div className="text-sm text-muted-foreground">Issues Fixed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round((articlesOptimized / totalArticles) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Coverage</div>
          </div>
        </div>

        {/* AI Readiness Scores */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">AI Discovery Readiness</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Overall AI Readiness</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${getScoreColor(aiReadinessScore)}`}>
                  {aiReadinessScore.toFixed(1)}/100
                </span>
                <Badge variant={getScoreBadgeVariant(aiReadinessScore)}>
                  {aiReadinessScore >= 90 ? 'Excellent' : 
                   aiReadinessScore >= 70 ? 'Good' : 
                   aiReadinessScore >= 50 ? 'Fair' : 'Needs Work'}
                </Badge>
              </div>
            </div>
            <Progress value={aiReadinessScore} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-green-600" />
                <span className="font-medium">Voice Search Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${getScoreColor(voiceSearchScore)}`}>
                  {voiceSearchScore.toFixed(1)}%
                </span>
                <Badge variant={getScoreBadgeVariant(voiceSearchScore)}>
                  Voice Optimized
                </Badge>
              </div>
            </div>
            <Progress value={voiceSearchScore} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Citation Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${getScoreColor(citationScore)}`}>
                  {citationScore.toFixed(1)}%
                </span>
                <Badge variant={getScoreBadgeVariant(citationScore)}>
                  LLM Citations
                </Badge>
              </div>
            </div>
            <Progress value={citationScore} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Multilingual Coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${getScoreColor(multilingualScore)}`}>
                  {multilingualScore.toFixed(1)}%
                </span>
                <Badge variant={getScoreBadgeVariant(multilingualScore)}>
                  Global Ready
                </Badge>
              </div>
            </div>
            <Progress value={multilingualScore} className="h-2" />
          </div>
        </div>

        {/* Optimization Achievements */}
        {aiReadinessScore >= 90 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
              <CheckCircle2 className="w-5 h-5" />
              Optimization Excellence Achieved!
            </div>
            <p className="text-sm text-green-600">
              Your content is perfectly optimized for AI discovery, citations, and voice search. 
              Expect significant improvements in AI assistant recommendations and search visibility.
            </p>
          </div>
        )}

        {/* Expected Impact */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 font-medium mb-3">
            <TrendingUp className="w-5 h-5" />
            Expected Impact
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-700">AI Assistant Citations</div>
              <div className="text-blue-600">
                {aiReadinessScore >= 90 ? '+400%' : aiReadinessScore >= 70 ? '+250%' : '+150%'} increase
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-700">Voice Search Visibility</div>
              <div className="text-blue-600">
                {voiceSearchScore >= 90 ? '+350%' : voiceSearchScore >= 70 ? '+200%' : '+100%'} improvement
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-700">LLM Recommendations</div>
              <div className="text-blue-600">
                {citationScore >= 90 ? '+300%' : citationScore >= 70 ? '+180%' : '+80%'} boost
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-700">Global Reach</div>
              <div className="text-blue-600">
                {multilingualScore >= 50 ? '4 Languages' : '1 Language'} coverage
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIOptimizationSummaryCard;