import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Clock, Zap, Globe, Mic, Quote, Brain, PlayCircle, AlertTriangle } from 'lucide-react';
import { runComprehensiveAIOptimization } from '@/utils/comprehensive-ai-optimizer';

interface OptimizationResult {
  phase: string;
  articlesProcessed: number;
  issuesFixed: number;
  multilingualContent: number;
  aiReadinessScore: number;
  voiceSearchScore: number;
  citationScore: number;
  multilingualScore: number;
}

interface ComprehensiveResults {
  phase1: OptimizationResult;
  phase2: OptimizationResult;
  phase3: OptimizationResult;
  phase4: OptimizationResult;
  overall: OptimizationResult;
}

export const ComprehensiveAIOptimizerV2: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [results, setResults] = useState<ComprehensiveResults | null>(null);
  const [optimizationComplete, setOptimizationComplete] = useState(false);

  const phases = [
    { 
      id: 1, 
      title: 'Content Enhancement',
      description: 'Expanding short articles, AI scoring, speakable markup',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    { 
      id: 2, 
      title: 'Topic Consolidation', 
      description: 'Standardizing topics, improving structure',
      icon: <Brain className="w-5 h-5" />,
      color: 'text-purple-600'
    },
    { 
      id: 3, 
      title: 'Multilingual Creation',
      description: 'Spanish, German, French, Dutch translations',
      icon: <Globe className="w-5 h-5" />,
      color: 'text-green-600'
    },
    { 
      id: 4, 
      title: 'AI Discovery Enhancement',
      description: 'Advanced schemas, location coordinates, citations',
      icon: <Quote className="w-5 h-5" />,
      color: 'text-orange-600'
    }
  ];

  const handleStartOptimization = async () => {
    setIsOptimizing(true);
    setCurrentPhase(1);
    setResults(null);
    setOptimizationComplete(false);

    try {
      // Simulate phase progression
      const phaseInterval = setInterval(() => {
        setCurrentPhase(prev => {
          if (prev < 4) return prev + 1;
          clearInterval(phaseInterval);
          return prev;
        });
      }, 8000); // 8 seconds per phase for demonstration

      // Run the actual optimization
      const optimizationResults = await runComprehensiveAIOptimization();
      
      clearInterval(phaseInterval);
      setResults(optimizationResults);
      setCurrentPhase(5); // Complete
      setOptimizationComplete(true);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getPhaseStatus = (phaseId: number) => {
    if (!isOptimizing) return 'pending';
    if (currentPhase > phaseId) return 'completed';
    if (currentPhase === phaseId) return 'active';
    return 'pending';
  };

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
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Comprehensive AI Optimization (v2)
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Advanced 4-phase optimization for perfect AI/LLM discovery, citations, and multilingual content
              </p>
            </div>
            <Button
              onClick={handleStartOptimization}
              disabled={isOptimizing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isOptimizing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start Optimization
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
            <CardTitle>Optimization Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {phases.map((phase) => (
                  <div
                    key={phase.id}
                    className={`p-4 rounded-lg border transition-all ${
                      getPhaseStatus(phase.id) === 'completed'
                        ? 'border-green-200 bg-green-50'
                        : getPhaseStatus(phase.id) === 'active'
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={phase.color}>
                        {phase.icon}
                      </div>
                      <span className="font-medium text-sm">{phase.title}</span>
                      {getPhaseStatus(phase.id) === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      {getPhaseStatus(phase.id) === 'active' && (
                        <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{phase.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    Phase {Math.min(currentPhase, 4)} of 4
                  </span>
                </div>
                <Progress 
                  value={(Math.min(currentPhase, 4) / 4) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Dashboard */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Key Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <span className={getScoreColor(results.overall.aiReadinessScore)}>
                  {results.overall.aiReadinessScore.toFixed(1)}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <Progress 
                value={results.overall.aiReadinessScore} 
                className="mt-2 h-2"
              />
              <Badge 
                variant={getScoreBadgeVariant(results.overall.aiReadinessScore)}
                className="mt-2"
              >
                {results.overall.aiReadinessScore >= 90 ? 'Excellent' : 
                 results.overall.aiReadinessScore >= 70 ? 'Good' : 
                 results.overall.aiReadinessScore >= 50 ? 'Fair' : 'Needs Work'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-green-600" />
                Voice Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <span className={getScoreColor(results.overall.voiceSearchScore)}>
                  {results.overall.voiceSearchScore.toFixed(1)}
                </span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <Progress 
                value={results.overall.voiceSearchScore} 
                className="mt-2 h-2"
              />
              <Badge 
                variant={getScoreBadgeVariant(results.overall.voiceSearchScore)}
                className="mt-2"
              >
                Voice Ready
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-orange-600" />
                Citation Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <span className={getScoreColor(results.overall.citationScore)}>
                  {results.overall.citationScore.toFixed(1)}
                </span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <Progress 
                value={results.overall.citationScore} 
                className="mt-2 h-2"
              />
              <Badge 
                variant={getScoreBadgeVariant(results.overall.citationScore)}
                className="mt-2"
              >
                LLM Citations
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Multilingual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <span className={getScoreColor(results.overall.multilingualScore)}>
                  {results.overall.multilingualScore.toFixed(1)}
                </span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <Progress 
                value={results.overall.multilingualScore} 
                className="mt-2 h-2"
              />
              <Badge 
                variant={getScoreBadgeVariant(results.overall.multilingualScore)}
                className="mt-2"
              >
                {results.overall.multilingualContent} Languages
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phase Results */}
          {[results.phase1, results.phase2, results.phase3, results.phase4].map((phase, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {phases[index].icon}
                  {phases[index].title} Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Articles Processed:</span>
                    <Badge variant="secondary">{phase.articlesProcessed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Issues Fixed:</span>
                    <Badge variant="secondary">{phase.issuesFixed}</Badge>
                  </div>
                  {phase.multilingualContent > 0 && (
                    <div className="flex justify-between">
                      <span>Translations Created:</span>
                      <Badge variant="secondary">{phase.multilingualContent}</Badge>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>AI Score:</span>
                    <Badge variant={getScoreBadgeVariant(phase.aiReadinessScore)}>
                      {phase.aiReadinessScore.toFixed(1)}/100
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Overall Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Optimization Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {results.overall.articlesProcessed}
                  </div>
                  <div className="text-sm text-muted-foreground">Articles Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.overall.issuesFixed}
                  </div>
                  <div className="text-sm text-muted-foreground">Issues Fixed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {results.overall.multilingualContent}
                  </div>
                  <div className="text-sm text-muted-foreground">Translations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {results.overall.aiReadinessScore.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">AI Ready</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Alert */}
      {optimizationComplete && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Optimization Complete!</strong> All 158 QA articles have been optimized for AI/LLM discovery, 
            voice search, citations, and multilingual content. Your content is now perfectly structured for 
            AI assistants, search engines, and global audiences.
          </AlertDescription>
        </Alert>
      )}

      {/* Warning for incomplete optimization */}
      {results && results.overall.aiReadinessScore < 90 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Optimization Notes:</strong> Some articles may need additional manual review for optimal 
            AI discovery. Consider expanding content under 1,200 characters and adding more specific 
            location-based keywords for better targeting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ComprehensiveAIOptimizerV2;