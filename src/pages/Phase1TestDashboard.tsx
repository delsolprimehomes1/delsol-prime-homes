import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Link as LinkIcon,
  Mic,
  UserCheck,
  Clock,
  Target
} from 'lucide-react';
import { runPhase1Test, runPhase1FullBatch, Phase1BatchResult, Phase1TestResult } from '@/utils/phase1-content-enhancer';
import { toast } from 'sonner';

const TEST_ARTICLES = [
  'what-is-costa-del-sol-like-for-expats',
  'choosing-between-marbella-estepona',
  'nie-number-application-process',
  'property-purchase-checklist-spain',
  'spain-property-costs-calculator'
];

export default function Phase1TestDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Phase1BatchResult | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'test' | 'full' | null>(null);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const runTest = async () => {
    setIsRunning(true);
    setCurrentPhase('test');
    setTestResults(null);
    
    try {
      toast.info('Starting Phase 1 test on 5 articles...');
      const results = await runPhase1Test(TEST_ARTICLES);
      setTestResults(results);
      
      if (results.successCount === results.totalProcessed) {
        toast.success(`Test complete! Average score improved from ${results.avgScoreBefore.toFixed(1)} to ${results.avgScoreAfter.toFixed(1)}`);
      } else {
        toast.warning(`Test complete with ${results.failureCount} failures`);
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Test failed: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const runFullBatch = async () => {
    if (!confirm('This will process all 209 articles. This may take 30-60 minutes. Continue?')) {
      return;
    }

    setIsRunning(true);
    setCurrentPhase('full');
    setTestResults(null);
    setBatchProgress({ current: 0, total: 209 });

    try {
      toast.info('Starting full batch processing...');
      
      const results = await runPhase1FullBatch(10, (current, total, batchResult) => {
        setBatchProgress({ current, total });
        toast.success(`Batch progress: ${current}/${total} articles processed`);
      });

      setTestResults(results);
      toast.success(`Full batch complete! ${results.successCount} articles enhanced successfully`);
    } catch (error) {
      console.error('Batch processing failed:', error);
      toast.error('Batch processing failed: ' + error.message);
    } finally {
      setIsRunning(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImprovementBadge = (before: number, after: number) => {
    const diff = after - before;
    if (diff >= 40) return <Badge className="bg-green-600">Excellent</Badge>;
    if (diff >= 25) return <Badge className="bg-blue-600">Good</Badge>;
    if (diff >= 10) return <Badge className="bg-yellow-600">Moderate</Badge>;
    return <Badge variant="outline">Minimal</Badge>;
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin: Phase 1 Test Dashboard - Internal Tool</title>
      </Helmet>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Phase 1: Content Enhancement Test</h1>
          <p className="text-muted-foreground mt-2">
            AI Citation Optimization - Speakable Answers, External Links, Expert Reviews
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={runTest} 
            disabled={isRunning}
            size="lg"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Run 5-Article Test
          </Button>
          <Button 
            onClick={runFullBatch}
            disabled={isRunning || !testResults || testResults.successCount === 0}
            variant="default"
            size="lg"
          >
            <Target className="mr-2 h-5 w-5" />
            Process All 209 Articles
          </Button>
        </div>
      </div>

      {isRunning && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {currentPhase === 'test' 
              ? 'Processing test articles... This may take 2-3 minutes.'
              : `Processing batch: ${batchProgress.current}/${batchProgress.total} articles...`
            }
          </AlertDescription>
          {currentPhase === 'full' && (
            <Progress 
              value={(batchProgress.current / batchProgress.total) * 100} 
              className="mt-2"
            />
          )}
        </Alert>
      )}

      {testResults && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">AI Score Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className={getScoreColor(testResults.avgScoreBefore)}>
                    {testResults.avgScoreBefore.toFixed(1)}
                  </span>
                  <TrendingUp className="inline mx-2 h-5 w-5 text-green-600" />
                  <span className={getScoreColor(testResults.avgScoreAfter)}>
                    {testResults.avgScoreAfter.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  +{(testResults.avgScoreAfter - testResults.avgScoreBefore).toFixed(1)} points average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Speakable Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testResults.totalSpeakableAnswers}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Voice-optimized summaries generated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  External Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testResults.totalExternalLinks}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Authority sources integrated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Expert Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testResults.totalReviewersAdded}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  BOFU articles reviewed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Citation Likelihood */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Estimated AI Citation Likelihood
              </CardTitle>
              <CardDescription>
                Based on content quality, E-E-A-T signals, and optimization metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Before: 15-25%</span>
                    <span className="text-sm font-medium text-green-600">
                      After: {testResults.estimatedCitationLikelihood.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={testResults.estimatedCitationLikelihood} className="h-3" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>✓ Speakable markup implemented across all tested articles</p>
                  <p>✓ Authority links increase trust signals</p>
                  <p>✓ Expert attribution strengthens E-E-A-T</p>
                  <p className="mt-2 font-medium">
                    Target: 90%+ after completing Phases 2 & 3
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article Results */}
          <Card>
            <CardHeader>
              <CardTitle>Article Results</CardTitle>
              <CardDescription>
                Detailed breakdown of enhancements per article
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.articles.map((article: Phase1TestResult) => (
                  <Card key={article.articleId}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{article.funnelStage}</Badge>
                            <span className="text-xs">/{article.slug}</span>
                          </CardDescription>
                        </div>
                        {getImprovementBadge(article.beforeScore, article.afterScore)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Score Improvement */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">AI Score:</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${getScoreColor(article.beforeScore)}`}>
                            {article.beforeScore}
                          </span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className={`text-lg font-bold ${getScoreColor(article.afterScore)}`}>
                            {article.afterScore}
                          </span>
                        </div>
                      </div>

                      {/* Speakable Answer */}
                      {article.speakableAnswer && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Mic className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Speakable Answer ({article.wordCount} words)</span>
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            "{article.speakableAnswer}"
                          </p>
                        </div>
                      )}

                      {/* External Links */}
                      {article.externalLinksAdded > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <LinkIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">
                              {article.externalLinksAdded} External Links Added
                            </span>
                          </div>
                          <div className="space-y-1">
                            {article.externalLinks.slice(0, 3).map((link, idx) => (
                              <div key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium">{link.anchorText}</span>
                                  <br />
                                  <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline truncate block"
                                  >
                                    {link.url}
                                  </a>
                                  <span className="text-xs">Authority: {link.authorityScore}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reviewer */}
                      {article.reviewerAdded && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <UserCheck className="h-4 w-4" />
                          <span>Expert reviewer attributed</span>
                        </div>
                      )}

                      {/* Processing Time */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Processing time: {(article.processingTime / 1000).toFixed(1)}s</span>
                        {article.errors.length > 0 && (
                          <span className="text-red-600 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {article.errors.length} errors
                          </span>
                        )}
                      </div>

                      {/* Errors */}
                      {article.errors.length > 0 && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            <ul className="list-disc list-inside text-xs">
                              {article.errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {testResults.successCount > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Test successful!</strong> Ready to process all 209 articles. 
                Click "Process All 209 Articles" to run the full Phase 1 enhancement.
                Estimated time: 30-60 minutes.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {!testResults && !isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Phase 1 Test Overview</CardTitle>
            <CardDescription>
              Test content enhancement on 5 representative articles before full batch processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Speakable Answers
                </h4>
                <p className="text-sm text-muted-foreground">
                  AI-generated 40-60 word voice-optimized summaries for each article
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  External Links
                </h4>
                <p className="text-sm text-muted-foreground">
                  2-4 authority links per article from trusted government and industry sources
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Expert Reviews
                </h4>
                <p className="text-sm text-muted-foreground">
                  Expert reviewer attribution for BOFU articles to strengthen E-E-A-T
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Test Articles:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• TOFU: what-is-costa-del-sol-like-for-expats</li>
                <li>• MOFU: choosing-between-marbella-estepona</li>
                <li>• MOFU: nie-number-application-process</li>
                <li>• BOFU: property-purchase-checklist-spain</li>
                <li>• BOFU: spain-property-costs-calculator</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
}
