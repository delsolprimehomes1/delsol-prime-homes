import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Download, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ScoreStats {
  totalArticles: number;
  avgScore: number;
  excellentCount: number;
  goodCount: number;
  needsWorkCount: number;
  criticalCount: number;
}

interface LowScoringArticle {
  id: string;
  title: string;
  ai_score: number;
  language: string;
  funnel_stage: string;
}

export function AIScoreDashboard() {
  const [stats, setStats] = useState<ScoreStats>({
    totalArticles: 0,
    avgScore: 0,
    excellentCount: 0,
    goodCount: 0,
    needsWorkCount: 0,
    criticalCount: 0,
  });
  const [lowScoringArticles, setLowScoringArticles] = useState<LowScoringArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);

    try {
      // Get all articles with scores
      const { data: articles, error } = await supabase
        .from('qa_articles')
        .select('id, title, ai_score, language, funnel_stage')
        .not('ai_score', 'is', null);

      if (error) throw error;

      if (!articles || articles.length === 0) {
        setStats({
          totalArticles: 0,
          avgScore: 0,
          excellentCount: 0,
          goodCount: 0,
          needsWorkCount: 0,
          criticalCount: 0,
        });
        return;
      }

      const totalArticles = articles.length;
      const avgScore = articles.reduce((sum, a) => sum + (a.ai_score || 0), 0) / totalArticles;

      const excellentCount = articles.filter(a => (a.ai_score || 0) >= 9.8).length;
      const goodCount = articles.filter(a => (a.ai_score || 0) >= 9.0 && (a.ai_score || 0) < 9.8).length;
      const needsWorkCount = articles.filter(a => (a.ai_score || 0) >= 8.0 && (a.ai_score || 0) < 9.0).length;
      const criticalCount = articles.filter(a => (a.ai_score || 0) < 8.0).length;

      setStats({
        totalArticles,
        avgScore: Number(avgScore.toFixed(2)),
        excellentCount,
        goodCount,
        needsWorkCount,
        criticalCount,
      });

      // Get low-scoring articles
      const lowScoring = articles
        .filter(a => (a.ai_score || 0) < 9.8)
        .sort((a, b) => (a.ai_score || 0) - (b.ai_score || 0))
        .slice(0, 10);

      setLowScoringArticles(lowScoring);

    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI score statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function recalculateScores() {
    setRecalculating(true);

    try {
      toast({
        title: 'Recalculation Started',
        description: 'This may take several minutes...',
      });

      // In production, this would trigger the Edge Function
      const { error } = await supabase.functions.invoke('calculate-ai-score', {
        body: { recalculateAll: true },
      });

      if (error) throw error;

      await fetchStats();

      toast({
        title: 'Success',
        description: 'All scores have been recalculated',
      });

    } catch (error) {
      console.error('Error recalculating scores:', error);
      toast({
        title: 'Error',
        description: 'Failed to recalculate scores',
        variant: 'destructive',
      });
    } finally {
      setRecalculating(false);
    }
  }

  function exportCSV() {
    const csvContent = [
      'ID,Title,Score,Language,Funnel Stage',
      ...lowScoringArticles.map(a =>
        `"${a.id}","${a.title}",${a.ai_score},"${a.language}","${a.funnel_stage}"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `low-scoring-articles-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exported',
      description: 'Low-scoring articles exported to CSV',
    });
  }

  const readinessPercentage = stats.totalArticles > 0
    ? Math.round((stats.excellentCount / stats.totalArticles) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Optimization Dashboard</h1>
          <p className="text-muted-foreground">Monitor and improve AI readiness across all content</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={recalculateScores} disabled={recalculating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
            Recalculate All
          </Button>
        </div>
      </div>

      {/* Overall Readiness Gauge */}
      <Card>
        <CardHeader>
          <CardTitle>Overall AI Readiness</CardTitle>
          <CardDescription>
            Articles meeting the 9.8/10 threshold
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary">
                {readinessPercentage}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {stats.excellentCount} of {stats.totalArticles} articles
              </p>
            </div>
            <Progress value={readinessPercentage} className="h-4" />
            <div className="text-center text-sm">
              <span className="font-medium">Average Score: </span>
              <span className={stats.avgScore >= 9.8 ? 'text-green-600' : 'text-orange-600'}>
                {stats.avgScore}/10
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
          <CardDescription>
            Articles by quality tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {stats.excellentCount}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500">
                9.8-10.0<br />Excellent
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {stats.goodCount}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-500">
                9.0-9.7<br />Good
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {stats.needsWorkCount}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-500">
                8.0-8.9<br />Needs Work
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {stats.criticalCount}
              </div>
              <div className="text-xs text-red-600 dark:text-red-500">
                &lt;8.0<br />Critical
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low-Scoring Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Lowest-Scoring Articles</CardTitle>
          <CardDescription>
            Articles that need immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lowScoringArticles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                🎉 All articles meet the quality threshold!
              </p>
            ) : (
              lowScoringArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => window.open(`/qa/${article.language}/${article.id}`, '_blank')}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{article.title}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{article.language.toUpperCase()}</Badge>
                      <Badge variant="outline">{article.funnel_stage}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      article.ai_score >= 9.0 ? 'text-yellow-600' :
                      article.ai_score >= 8.0 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {article.ai_score}/10
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
