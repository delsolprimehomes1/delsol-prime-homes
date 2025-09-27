import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Mic, 
  Quote, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  BarChart3,
  Zap,
  Globe,
  Clock
} from 'lucide-react';
import { batchScoreAllArticles, generateAIReport, type ArticleScoreResult } from '@/lib/aiScoring';

interface OptimizationStats {
  totalProcessed: number;
  averageScore: number;
  voiceReadyCount: number;
  citationReadyCount: number;
  articlesAboveTarget: number;
  results: ArticleScoreResult[];
}

const AIOptimizationDashboard = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [stats, setStats] = useState<OptimizationStats | null>(null);
  const [report, setReport] = useState<any>(null);
  const [optimizationComplete, setOptimizationComplete] = useState(false);

  const TARGET_SCORE = 9.5; // Updated for Phase 1 - Enhanced AI optimization target

  const handleStartOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationComplete(false);
    setCurrentPhase('Analyzing articles...');

    try {
      // Phase 1: Analyze and score all articles
      setCurrentPhase('🧠 Calculating AI optimization scores...');
      const results = await batchScoreAllArticles();
      setStats(results);

      // Phase 2: Generate comprehensive report
      setCurrentPhase('📊 Generating optimization report...');
      const optimizationReport = await generateAIReport();
      setReport(optimizationReport);

      setCurrentPhase('✅ Optimization complete!');
      setOptimizationComplete(true);
    } catch (error) {
      console.error('Optimization failed:', error);
      setCurrentPhase('❌ Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9.0) return 'text-green-600';
    if (score >= 7.0) return 'text-yellow-600';
    if (score >= 5.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 9.0) return 'default';
    if (score >= 7.0) return 'secondary';
    return 'destructive';
  };

  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Phase 1: AI Optimization Scoring
              </CardTitle>
              <CardDescription>
                Calculate AI optimization scores for all 168 QA articles targeting 9.8/10 citation readiness
              </CardDescription>
            </div>
            <Button 
              onClick={handleStartOptimization}
              disabled={isOptimizing}
              className="min-w-[200px]"
            >
              {isOptimizing ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Start AI Optimization
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Card */}
      {isOptimizing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 animate-pulse" />
              Optimization in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="animate-pulse w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">{currentPhase}</span>
              </div>
              <Progress value={stats ? 100 : 45} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Dashboard */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average AI Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getScoreColor(stats.averageScore)}>
                  {stats.averageScore}/10
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Target: {TARGET_SCORE}/10
              </p>
              <Progress 
                value={(stats.averageScore / 10) * 100} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voice Search Ready</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(stats.voiceReadyCount, stats.totalProcessed)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.voiceReadyCount} of {stats.totalProcessed} articles
              </p>
              <Progress 
                value={formatPercentage(stats.voiceReadyCount, stats.totalProcessed)} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citation Ready</CardTitle>
              <Quote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(stats.citationReadyCount, stats.totalProcessed)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.citationReadyCount} of {stats.totalProcessed} articles
              </p>
              <Progress 
                value={formatPercentage(stats.citationReadyCount, stats.totalProcessed)} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Above Target</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(stats.articlesAboveTarget, stats.totalProcessed)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.articlesAboveTarget} articles ≥ {TARGET_SCORE}
              </p>
              <Progress 
                value={formatPercentage(stats.articlesAboveTarget, stats.totalProcessed)} 
                className="mt-2" 
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results */}
      {report && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
            <TabsTrigger value="needs-improvement">Needs Work</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {report.score_distribution.excellent}
                    </div>
                    <div className="text-sm text-green-700">Excellent (9.0+)</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {report.score_distribution.good}
                    </div>
                    <div className="text-sm text-yellow-700">Good (7.0-8.9)</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {report.score_distribution.fair}
                    </div>
                    <div className="text-sm text-orange-700">Fair (5.0-6.9)</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {report.score_distribution.poor}
                    </div>
                    <div className="text-sm text-red-700">Poor (&lt; 5.0)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-performers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Articles</CardTitle>
                <CardDescription>Articles already optimized for AI citation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.top_performing_articles.slice(0, 10).map((article: any, index: number) => (
                    <div key={article.slug} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{article.title}</h4>
                        <div className="flex gap-2 mt-1">
                          {article.voice_ready && (
                            <Badge variant="secondary" className="text-xs">
                              <Mic className="w-3 h-3 mr-1" />
                              Voice Ready
                            </Badge>
                          )}
                          {article.citation_ready && (
                            <Badge variant="secondary" className="text-xs">
                              <Quote className="w-3 h-3 mr-1" />
                              Citation Ready
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={getScoreBadgeVariant(article.score)}>
                        {article.score}/10
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="needs-improvement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Articles Needing Improvement</CardTitle>
                <CardDescription>Focus areas for Phase 2 optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.improvement_needed.slice(0, 15).map((article: any) => (
                    <div key={article.slug} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{article.title}</h4>
                        <Badge variant="destructive">{article.score}/10</Badge>
                      </div>
                      {article.recommendations.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Priority:</span> {article.recommendations[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Next Steps: Phase 2 Actions</CardTitle>
                <CardDescription>Recommended optimizations based on scoring results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.recommendations.map((rec: string, index: number) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{rec}</AlertDescription>
                    </Alert>
                  ))}
                  
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold mb-2">Recommended Phase 2 Actions:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Expand {report.score_distribution.poor + report.score_distribution.fair} articles to minimum 1200 characters
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Add structured quick-answer sections to {stats.totalProcessed - stats.voiceReadyCount} articles
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Implement Spanish translations for top 25 TOFU articles
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Add citation-ready metadata to {stats.totalProcessed - stats.citationReadyCount} articles
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Success Alert */}
      {optimizationComplete && stats && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Phase 1 Complete!</strong> Processed {stats.totalProcessed} articles with an average AI score of {stats.averageScore}/10. 
            {stats.voiceReadyCount} articles are voice-search ready and {stats.citationReadyCount} are citation-ready.
            {stats.averageScore >= TARGET_SCORE ? ' 🎉 Target achieved!' : ' Ready for Phase 2 optimization.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AIOptimizationDashboard;