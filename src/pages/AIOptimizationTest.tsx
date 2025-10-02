import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { runFiveArticleTest, TestArticle, TestProgress } from '@/utils/ai-optimization-test';
import { toast } from 'sonner';

export default function AIOptimizationTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<TestProgress | null>(null);
  const [results, setResults] = useState<TestArticle[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleRunTest = async () => {
    setIsRunning(true);
    setCompleted(false);
    setResults([]);
    setProgress(null);

    toast.info('🧪 Starting 5-article AI optimization test...');

    try {
      const testResults = await runFiveArticleTest((prog) => {
        setProgress(prog);
      });

      setResults(testResults);
      setCompleted(true);

      const avgBefore = testResults.reduce((sum, r) => sum + r.scoreBefore, 0) / testResults.length;
      const avgAfter = testResults.reduce((sum, r) => sum + r.scoreAfter, 0) / testResults.length;
      const improvement = avgAfter - avgBefore;

      toast.success(
        `✅ Test complete! Average score: ${avgBefore.toFixed(1)} → ${avgAfter.toFixed(1)} (+${improvement.toFixed(1)} points)`
      );
    } catch (error) {
      console.error('Test error:', error);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getImprovementBadge = (before: number, after: number) => {
    const improvement = after - before;
    if (improvement > 30) return <Badge className="bg-green-600">Excellent</Badge>;
    if (improvement > 15) return <Badge className="bg-blue-600">Good</Badge>;
    return <Badge variant="secondary">Moderate</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Optimization Test</h1>
        </div>

        <p className="text-muted-foreground mb-6">
          Test AI optimization on 5 sample articles (1 TOFU, 2 MOFU, 2 BOFU) to validate the enhancement system 
          before running on all 209 articles.
        </p>

        <Button 
          size="lg" 
          onClick={handleRunTest}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Test...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run 5-Article Test
            </>
          )}
        </Button>
      </div>

      {/* Progress Display */}
      {progress && isRunning && (
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Phase: {progress.phase}
              </h3>
              <Badge variant="outline">
                {progress.currentArticle} / {progress.totalArticles}
              </Badge>
            </div>

            <Progress 
              value={(progress.currentArticle / progress.totalArticles) * 100} 
              className="h-2"
            />

            <p className="text-sm text-muted-foreground">
              {progress.details}
            </p>
          </div>
        </Card>
      )}

      {/* Results Display */}
      {completed && results.length > 0 && (
        <>
          {/* Summary Card */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Articles Tested</div>
                <div className="text-3xl font-bold">{results.length}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Avg Score Before</div>
                <div className={`text-3xl font-bold ${getScoreColor(
                  results.reduce((sum, r) => sum + r.scoreBefore, 0) / results.length
                )}`}>
                  {(results.reduce((sum, r) => sum + r.scoreBefore, 0) / results.length).toFixed(1)}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Avg Score After</div>
                <div className={`text-3xl font-bold ${getScoreColor(
                  results.reduce((sum, r) => sum + r.scoreAfter, 0) / results.length
                )}`}>
                  {(results.reduce((sum, r) => sum + r.scoreAfter, 0) / results.length).toFixed(1)}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Improvement</div>
                <div className="text-3xl font-bold text-green-600">
                  +{(
                    (results.reduce((sum, r) => sum + r.scoreAfter, 0) / results.length) -
                    (results.reduce((sum, r) => sum + r.scoreBefore, 0) / results.length)
                  ).toFixed(1)}
                </div>
              </div>
            </div>
          </Card>

          {/* Individual Results */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Article-by-Article Results</h2>

            {results.map((result, idx) => (
              <Card key={result.id} className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{result.funnel_stage}</Badge>
                        {getImprovementBadge(result.scoreBefore, result.scoreAfter)}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{result.title}</h3>
                      <p className="text-sm text-muted-foreground">{result.slug}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {(result.processingTime / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>

                  {/* Score Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Score Before</div>
                      <div className={`text-2xl font-bold ${getScoreColor(result.scoreBefore)}`}>
                        {result.scoreBefore.toFixed(1)}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Score After</div>
                      <div className={`text-2xl font-bold ${getScoreColor(result.scoreAfter)}`}>
                        {result.scoreAfter.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Improvement Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Improvement</span>
                      <span className="text-sm font-bold text-green-600">
                        +{(result.scoreAfter - result.scoreBefore).toFixed(1)} points
                      </span>
                    </div>
                    <Progress 
                      value={result.scoreAfter} 
                      className="h-2"
                    />
                  </div>

                  {/* Enhancements Applied */}
                  <div>
                    <div className="text-sm font-medium mb-2">Enhancements Applied</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.enhancements.map((enhancement, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{enhancement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Next Steps */}
          <Alert className="mt-8">
            <TrendingUp className="w-4 h-4" />
            <AlertDescription>
              <strong>Test Successful!</strong> Based on these results, you can now:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Run full optimization on all 209 articles</li>
                <li>Expected final average score: {(
                  (results.reduce((sum, r) => sum + r.scoreAfter, 0) / results.length)
                ).toFixed(1)}/100</li>
                <li>Processing time per article: ~{(
                  results.reduce((sum, r) => sum + r.processingTime, 0) / results.length / 1000
                ).toFixed(1)}s</li>
                <li>Total estimated time: ~{(
                  (results.reduce((sum, r) => sum + r.processingTime, 0) / results.length / 1000) * 209 / 60
                ).toFixed(1)} minutes</li>
              </ul>
            </AlertDescription>
          </Alert>
        </>
      )}

      {/* Empty State */}
      {!isRunning && !completed && (
        <Alert>
          <AlertDescription>
            Click "Run 5-Article Test" to begin the optimization test. This will:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Select 5 representative articles (1 TOFU, 2 MOFU, 2 BOFU)</li>
              <li>Generate 40-60 word speakable answers</li>
              <li>Add 2+ external links per 1,000 words</li>
              <li>Add internal links to related content</li>
              <li>Optimize for voice search</li>
              <li>Calculate before/after AI scores</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
