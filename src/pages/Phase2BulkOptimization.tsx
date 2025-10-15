import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { generateAll160Summaries, Summary160Result } from '@/utils/generate-160-summaries';
import { Globe, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Phase2BulkOptimization() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [results, setResults] = useState<Summary160Result | null>(null);

  const { data: stats, refetch } = useQuery({
    queryKey: ['non-english-stats'],
    queryFn: async () => {
      const { data: articles, error } = await supabase
        .from('qa_articles')
        .select('id, language, seo, title, excerpt')
        .neq('language', 'en');

      if (error) throw error;

      const byLanguage = articles?.reduce((acc, article) => {
        acc[article.language] = (acc[article.language] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const needsSummary = articles?.filter(a => {
        const seoData = a.seo as Record<string, any>;
        return !seoData?.metaDescription;
      }).length || 0;

      return {
        total: articles?.length || 0,
        byLanguage,
        needsSummary,
        hasOptimizedSummary: (articles?.length || 0) - needsSummary
      };
    }
  });

  const handleOptimize = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentPhase('Preparing non-English articles...');
    
    try {
      toast.info('Starting bulk optimization for non-English articles...');

      // Filter to only non-English articles
      const { data: nonEnglishArticles } = await supabase
        .from('qa_articles')
        .select('id')
        .neq('language', 'en');

      if (!nonEnglishArticles?.length) {
        toast.error('No non-English articles found');
        return;
      }

      setCurrentPhase(`Processing ${nonEnglishArticles.length} articles...`);

      // Generate 160-char summaries with progress tracking
      const result = await generateAll160Summaries((progressResult) => {
        const percentage = (progressResult.processed / nonEnglishArticles.length) * 100;
        setProgress(Math.min(percentage, 100));
        setCurrentPhase(`Processed ${progressResult.processed}/${nonEnglishArticles.length} articles`);
      });

      setResults(result);
      setProgress(100);
      setCurrentPhase('Optimization complete!');

      await refetch();

      toast.success(`Optimized ${result.successful} articles successfully!`, {
        description: result.errors.length > 0 ? `${result.errors.length} errors occurred` : undefined
      });

    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Optimization failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phase 2: Non-English Content Optimization</h1>
          <p className="text-muted-foreground mt-2">
            Bulk optimize 160-char summaries for all non-English articles
          </p>
        </div>
        <Button
          onClick={handleOptimize}
          disabled={isRunning || !stats?.needsSummary}
          size="lg"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Start Optimization
            </>
          )}
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Non-English content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Need Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.needsSummary}</div>
              <p className="text-xs text-muted-foreground">Missing 160-char summaries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Optimized</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.hasOptimizedSummary}</div>
              <p className="text-xs text-muted-foreground">With AI summaries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.byLanguage).length}</div>
              <p className="text-xs text-muted-foreground">Supported languages</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Progress</CardTitle>
            <CardDescription>{currentPhase}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
            <CardDescription>Summary of bulk optimization process</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="errors">Errors ({results.errors.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{results.processed}</div>
                      <div className="text-sm text-muted-foreground">Processed</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">{results.successful}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <div className="text-2xl font-bold">{results.errors.length}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      Success Rate: {((results.successful / results.processed) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="errors" className="space-y-2">
                {results.errors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No errors occurred during optimization!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.errors.map((error, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="font-medium text-red-900">{error}</div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>Articles by language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-4">
              {Object.entries(stats.byLanguage).map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between p-3 border rounded-lg">
                  <Badge variant="outline">{lang.toUpperCase()}</Badge>
                  <span className="font-medium">{count} articles</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
