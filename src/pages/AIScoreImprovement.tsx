import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, TrendingUp, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ArticleScore {
  id: string;
  title: string;
  slug: string;
  ai_score: number;
  issues: string[];
  suggestions: string[];
  funnel_stage: string;
  language: string;
}

interface ScoreStats {
  total: number;
  excellent: number; // 85+
  good: number; // 70-84
  needsWork: number; // 50-69
  critical: number; // <50
  averageScore: number;
}

const AIScoreImprovement = () => {
  const [stats, setStats] = useState<ScoreStats>({
    total: 0,
    excellent: 0,
    good: 0,
    needsWork: 0,
    critical: 0,
    averageScore: 0,
  });
  const [articles, setArticles] = useState<ArticleScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('critical');

  useEffect(() => {
    fetchScoreData();
  }, []);

  const fetchScoreData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('qa_articles')
        .select('id, title, slug, ai_score, content, excerpt, funnel_stage, language, tags, internal_links, external_links_ai')
        .eq('published', true)
        .order('ai_score', { ascending: true });

      if (error) throw error;

      // Calculate stats
      const total = data?.length || 0;
      const scores = data?.map(a => a.ai_score || 0) || [];
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      const excellent = data?.filter(a => (a.ai_score || 0) >= 85).length || 0;
      const good = data?.filter(a => (a.ai_score || 0) >= 70 && (a.ai_score || 0) < 85).length || 0;
      const needsWork = data?.filter(a => (a.ai_score || 0) >= 50 && (a.ai_score || 0) < 70).length || 0;
      const critical = data?.filter(a => (a.ai_score || 0) < 50).length || 0;

      setStats({ total, excellent, good, needsWork, critical, averageScore });

      // Analyze each article for issues
      const analyzedArticles: ArticleScore[] = data?.map(article => {
        const issues: string[] = [];
        const suggestions: string[] = [];
        const score = article.ai_score || 0;

        // Content length
        if (article.content.length < 800) {
          issues.push('Content too short (< 800 characters)');
          suggestions.push('Expand content to 1000+ characters with detailed information');
        }

        // Excerpt
        if (!article.excerpt || article.excerpt.length < 100) {
          issues.push('Missing or short excerpt');
          suggestions.push('Add a comprehensive 150-200 character excerpt');
        }

        // Internal links
        const internalLinksCount = article.internal_links?.length || 0;
        if (internalLinksCount < 2) {
          issues.push(`Only ${internalLinksCount} internal link(s)`);
          suggestions.push('Add 2-4 relevant internal links to related articles');
        }

        // External links
        const externalLinksCount = article.external_links_ai?.length || 0;
        if (externalLinksCount < 1) {
          issues.push('No external authority links');
          suggestions.push('Add 1-2 external links to authoritative sources');
        }

        // Tags
        if (!article.tags || article.tags.length < 3) {
          issues.push('Insufficient tags');
          suggestions.push('Add 3-5 relevant topic tags');
        }

        // Heading structure (simple check)
        const hasH2 = article.content.includes('##');
        const hasH3 = article.content.includes('###');
        if (!hasH2 || !hasH3) {
          issues.push('Poor heading structure');
          suggestions.push('Add clear H2 and H3 headings for better organization');
        }

        return {
          id: article.id,
          title: article.title,
          slug: article.slug,
          ai_score: score,
          issues,
          suggestions,
          funnel_stage: article.funnel_stage,
          language: article.language,
        };
      }) || [];

      setArticles(analyzedArticles);
    } catch (error) {
      console.error('Error fetching score data:', error);
      toast.error('Failed to load score data');
    } finally {
      setLoading(false);
    }
  };

  const recalculateScores = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('calculate-ai-score', {
        body: { recalculate_all: true }
      });

      if (error) throw error;

      toast.success('AI scores recalculated successfully');
      await fetchScoreData();
    } catch (error) {
      console.error('Error recalculating scores:', error);
      toast.error('Failed to recalculate scores');
    } finally {
      setProcessing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Needs Work</Badge>;
    return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
  };

  const filterArticles = (category: string) => {
    switch (category) {
      case 'critical':
        return articles.filter(a => a.ai_score < 50);
      case 'needsWork':
        return articles.filter(a => a.ai_score >= 50 && a.ai_score < 70);
      case 'good':
        return articles.filter(a => a.ai_score >= 70 && a.ai_score < 85);
      case 'excellent':
        return articles.filter(a => a.ai_score >= 85);
      default:
        return articles;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Loading AI score data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Score Improvement Dashboard - DelSolPrimeHomes</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20 bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              AI Score Improvement Dashboard
            </h1>
            <p className="text-muted-foreground">
              Identify and fix low-scoring articles to improve AI discoverability
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore.toFixed(1)}/100
                </div>
                <Progress value={stats.averageScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Critical
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                <p className="text-xs text-muted-foreground mt-1">&lt; 50 score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Needs Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.needsWork}</div>
                <p className="text-xs text-muted-foreground mt-1">50-69 score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Good
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.good}</div>
                <p className="text-xs text-muted-foreground mt-1">70-84 score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Excellent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
                <p className="text-xs text-muted-foreground mt-1">85+ score</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <Button onClick={recalculateScores} disabled={processing}>
              {processing ? 'Recalculating...' : 'Recalculate All Scores'}
            </Button>
            <Button variant="outline" onClick={fetchScoreData}>
              Refresh Data
            </Button>
          </div>

          {/* Articles by Category */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="critical">Critical ({stats.critical})</TabsTrigger>
              <TabsTrigger value="needsWork">Needs Work ({stats.needsWork})</TabsTrigger>
              <TabsTrigger value="good">Good ({stats.good})</TabsTrigger>
              <TabsTrigger value="excellent">Excellent ({stats.excellent})</TabsTrigger>
            </TabsList>

            {['critical', 'needsWork', 'good', 'excellent'].map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                {filterArticles(category).length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        No articles in this category
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filterArticles(category).map(article => (
                    <Card key={article.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              {getScoreBadge(article.ai_score)}
                              <span className={`text-2xl font-bold ${getScoreColor(article.ai_score)}`}>
                                {article.ai_score.toFixed(1)}
                              </span>
                              <Badge variant="outline">{article.funnel_stage}</Badge>
                              <Badge variant="outline">{article.language}</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={`/qa/${article.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {article.issues.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-sm text-red-600 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Issues Found:
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                              {article.issues.map((issue, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {article.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-green-600 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Suggested Improvements:
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                              {article.suggestions.map((suggestion, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default AIScoreImprovement;
