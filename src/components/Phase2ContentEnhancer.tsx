import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Mic, 
  Quote, 
  BarChart3,
  Loader2
} from 'lucide-react';
import { batchEnhanceAllArticles, ContentEnhancementResult } from '@/utils/phase2-content-enhancer';

const Phase2ContentEnhancer: React.FC = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [results, setResults] = useState<ContentEnhancementResult | null>(null);
  const [enhancementComplete, setEnhancementComplete] = useState(false);

  const handleStartEnhancement = async () => {
    setIsEnhancing(true);
    setResults(null);
    setEnhancementComplete(false);

    try {
      console.log('🚀 Starting Phase 2: Content Enhancement...');
      const enhancementResults = await batchEnhanceAllArticles();
      setResults(enhancementResults);
      setEnhancementComplete(true);
    } catch (error) {
      console.error('Phase 2 enhancement error:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const getEnhancementProgress = () => {
    if (!results) return 0;
    return Math.round((results.articlesProcessed / (results.articlesProcessed || 1)) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Phase 2: Expand & Structure Content
          </CardTitle>
          <CardDescription>
            Transform 120+ short articles into full AI-citable answers with standardized structure (1200+ characters minimum)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Goal:</strong> Turn short pages into voice-friendly, citation-ready answers
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Structure:</strong> Question title + Short answer + Quick bullets + Detailed body (1200+ chars)
              </p>
            </div>
            <Button
              onClick={handleStartEnhancement}
              disabled={isEnhancing}
              className="min-w-[200px]"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing Content...
                </>
              ) : (
                'Start Content Enhancement'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      {isEnhancing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enhancement Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={getEnhancementProgress()} className="w-full" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing articles, expanding content, applying voice-friendly formatting...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Dashboard */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles Enhanced</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {results.articlesEnhanced}
              </div>
              <p className="text-xs text-muted-foreground">
                of {results.articlesProcessed} processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Length</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {results.averageCharCount}
              </div>
              <p className="text-xs text-muted-foreground">
                characters per article
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voice Ready</CardTitle>
              <Mic className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {results.voiceReadyCount}
              </div>
              <p className="text-xs text-muted-foreground">
                articles optimized for voice
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citation Ready</CardTitle>
              <Quote className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {results.citationReadyCount}
              </div>
              <p className="text-xs text-muted-foreground">
                articles ready for AI citation
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Enhancement Details</CardTitle>
            <CardDescription>
              Detailed breakdown of content enhancement results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="enhanced">Enhanced Articles</TabsTrigger>
                <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Enhancement Statistics</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Articles Processed:</span>
                        <Badge variant="outline">{results.articlesProcessed}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Articles Enhanced:</span>
                        <Badge variant="default">{results.articlesEnhanced}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Below Minimum Length:</span>
                        <Badge variant="destructive">{results.articlesBelowMinimum}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>NoIndex Required:</span>
                        <Badge variant="secondary">{results.articlesNoIndexed}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Quality Improvements</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Average Character Count:</span>
                        <Badge 
                          variant={getScoreBadgeVariant(results.averageCharCount >= 1200 ? 100 : 50)}
                        >
                          {results.averageCharCount}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Voice Search Ready:</span>
                        <Badge variant="default">{results.voiceReadyCount}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Citation Ready:</span>
                        <Badge variant="default">{results.citationReadyCount}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="enhanced" className="space-y-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.enhancementDetails
                    .filter(detail => detail.enhanced)
                    .map((detail) => (
                      <div key={detail.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{detail.title}</h5>
                          <p className="text-xs text-muted-foreground">/{detail.slug}</p>
                          {detail.issues.length > 0 && (
                            <p className="text-xs text-red-500 mt-1">
                              Issues: {detail.issues.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm">
                            <span className="text-red-500">{detail.oldCharCount}</span>
                            <span className="mx-1">→</span>
                            <span className="text-green-600">{detail.newCharCount}</span>
                          </div>
                          <Badge variant="default" className="text-xs">Enhanced</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Content Length Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>1200+ characters (Citation Ready):</span>
                        <span className={getScoreColor(results.citationReadyCount / results.articlesProcessed * 100)}>
                          {Math.round(results.citationReadyCount / results.articlesProcessed * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Voice Search Optimized:</span>
                        <span className={getScoreColor(results.voiceReadyCount / results.articlesProcessed * 100)}>
                          {Math.round(results.voiceReadyCount / results.articlesProcessed * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Enhancement Success Rate:</span>
                        <span className={getScoreColor(results.articlesEnhanced / results.articlesProcessed * 100)}>
                          {Math.round(results.articlesEnhanced / results.articlesProcessed * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Quality Targets</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Target: 90% Voice Ready</span>
                        <span className={
                          results.voiceReadyCount / results.articlesProcessed >= 0.9 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }>
                          {results.voiceReadyCount >= results.articlesProcessed * 0.9 ? '✅' : '🎯'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target: 85% Citation Ready</span>
                        <span className={
                          results.citationReadyCount / results.articlesProcessed >= 0.85 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }>
                          {results.citationReadyCount >= results.articlesProcessed * 0.85 ? '✅' : '🎯'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target: 1200+ avg chars</span>
                        <span className={
                          results.averageCharCount >= 1200 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }>
                          {results.averageCharCount >= 1200 ? '✅' : '🎯'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Success Alert */}
      {enhancementComplete && results && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Phase 2 Complete!</strong> Enhanced {results.articlesEnhanced} articles with standardized structure. 
            {results.voiceReadyCount} articles are now voice-ready and {results.citationReadyCount} are citation-ready.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Phase2ContentEnhancer;