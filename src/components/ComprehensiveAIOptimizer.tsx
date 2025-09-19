import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Play, AlertTriangle, Globe, Zap, Bot, Mic } from 'lucide-react';
import { runComprehensiveAIOptimization } from '@/utils/enhanced-ai-optimization';
import { toast } from 'sonner';

interface OptimizationResult {
  totalArticles: number;
  optimizedArticles: number;
  criticalIssuesFixed: number;
  multilingualContentCreated: number;
  aiReadinessScore: number;
  voiceSearchScore: number;
  citationScore: number;
  overallProgress: number;
}

interface ComprehensiveResults {
  phase1: OptimizationResult;
  phase2: OptimizationResult;
  phase3: OptimizationResult;
  overall: OptimizationResult;
}

export const ComprehensiveAIOptimizer: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [results, setResults] = useState<ComprehensiveResults | null>(null);
  const [optimizationComplete, setOptimizationComplete] = useState(false);

  const handleStartOptimization = async () => {
    setIsOptimizing(true);
    setCurrentPhase(1);
    setResults(null);
    setOptimizationComplete(false);

    try {
      toast.info('🚀 Starting comprehensive AI optimization...');
      
      // Simulate phase progression for better UX
      const phaseProgressInterval = setInterval(() => {
        setCurrentPhase(prev => {
          if (prev < 3) return prev + 1;
          clearInterval(phaseProgressInterval);
          return prev;
        });
      }, 2000);

      const optimizationResults = await runComprehensiveAIOptimization();
      
      clearInterval(phaseProgressInterval);
      setResults(optimizationResults);
      setOptimizationComplete(true);
      setCurrentPhase(0);
      
      toast.success('✅ Comprehensive AI optimization completed successfully!');
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('❌ Optimization failed. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getPhaseStatus = (phaseNumber: number) => {
    if (!isOptimizing) return 'pending';
    if (currentPhase > phaseNumber) return 'completed';
    if (currentPhase === phaseNumber) return 'active';
    return 'pending';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Comprehensive AI Optimization Dashboard
          </CardTitle>
          <CardDescription>
            Optimize all 158 QA articles for AI/LLM discovery, JSON-LD speakable markup, SEO, and AEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={handleStartOptimization}
              disabled={isOptimizing}
              size="lg"
              className="min-w-[200px]"
            >
              {isOptimizing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start AI Optimization
                </>
              )}
            </Button>
            
            {optimizationComplete && (
              <Badge variant="outline" className="px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-1" />
                Optimization Complete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Phase Progress */}
      {isOptimizing && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${
                  getPhaseStatus(1) === 'active' ? 'bg-blue-50 border-blue-200' :
                  getPhaseStatus(1) === 'completed' ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getPhaseStatus(1) === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : getPhaseStatus(1) === 'active' ? (
                      <Zap className="h-5 w-5 text-blue-600 animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <h3 className="font-semibold">Phase 1</h3>
                  </div>
                  <p className="text-sm text-gray-600">Content Quality Enhancement</p>
                  <p className="text-xs text-gray-500 mt-1">Expanding short articles, fixing metadata</p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  getPhaseStatus(2) === 'active' ? 'bg-blue-50 border-blue-200' :
                  getPhaseStatus(2) === 'completed' ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getPhaseStatus(2) === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : getPhaseStatus(2) === 'active' ? (
                      <Globe className="h-5 w-5 text-blue-600 animate-pulse" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <h3 className="font-semibold">Phase 2</h3>
                  </div>
                  <p className="text-sm text-gray-600">Multilingual Content Creation</p>
                  <p className="text-xs text-gray-500 mt-1">Spanish, German, French translations</p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  getPhaseStatus(3) === 'active' ? 'bg-blue-50 border-blue-200' :
                  getPhaseStatus(3) === 'completed' ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getPhaseStatus(3) === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : getPhaseStatus(3) === 'active' ? (
                      <Bot className="h-5 w-5 text-blue-600 animate-bounce" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <h3 className="font-semibold">Phase 3</h3>
                  </div>
                  <p className="text-sm text-gray-600">Advanced AI Discovery</p>
                  <p className="text-xs text-gray-500 mt-1">Schema optimization, citation metadata</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Dashboard */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">AI Readiness Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className={`text-3xl font-bold ${getScoreColor(results.overall.aiReadinessScore)}`}>
                  {results.overall.aiReadinessScore}
                </span>
                <Badge variant={getScoreBadgeVariant(results.overall.aiReadinessScore)}>
                  /100
                </Badge>
              </div>
              <Progress value={results.overall.aiReadinessScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Search Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className={`text-3xl font-bold ${getScoreColor(results.overall.voiceSearchScore)}`}>
                  {results.overall.voiceSearchScore}
                </span>
                <Badge variant={getScoreBadgeVariant(results.overall.voiceSearchScore)}>
                  /100
                </Badge>
              </div>
              <Progress value={results.overall.voiceSearchScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Citation Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className={`text-3xl font-bold ${getScoreColor(results.overall.citationScore)}`}>
                  {results.overall.citationScore}
                </span>
                <Badge variant={getScoreBadgeVariant(results.overall.citationScore)}>
                  /100
                </Badge>
              </div>
              <Progress value={results.overall.citationScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Multilingual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-600">
                  {results.overall.multilingualContentCreated}
                </span>
                <Badge variant="secondary">
                  translations
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">Content created</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Phase 1: Content Quality
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Articles Enhanced:</span>
                    <Badge variant="outline">{results.phase1.optimizedArticles}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Issues Fixed:</span>
                    <Badge variant="destructive">{results.phase1.criticalIssuesFixed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <Badge>{results.phase1.overallProgress}%</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  Phase 2: Multilingual
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Translations Created:</span>
                    <Badge variant="outline">{results.phase2.multilingualContentCreated}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Languages:</span>
                    <Badge variant="secondary">ES, DE, FR</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <Badge>{results.phase2.overallProgress}%</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-purple-600" />
                  Phase 3: AI Discovery
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Schemas Enhanced:</span>
                    <Badge variant="outline">{results.phase3.optimizedArticles}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Score:</span>
                    <Badge className={getScoreColor(results.phase3.aiReadinessScore)}>
                      {results.phase3.aiReadinessScore}/100
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <Badge>{results.phase3.overallProgress}%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Alert */}
      {optimizationComplete && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            🎉 <strong>Comprehensive AI Optimization Complete!</strong> All 158 QA articles are now optimized for AI/LLM discovery, 
            voice search, citations, and multilingual support. Your content is ready for maximum AI visibility across all platforms.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};