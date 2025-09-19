import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Circle, Loader2, Zap } from 'lucide-react';
import { runComprehensiveAIActivation } from '@/utils/comprehensive-ai-activator';

interface PhaseStatus {
  phase: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  result?: any;
}

const ComprehensiveAIActivator = () => {
  const [isActivating, setIsActivating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phases, setPhases] = useState<PhaseStatus[]>([
    { phase: 'AI Scoring System', status: 'pending' },
    { phase: 'Content Enhancement', status: 'pending' },
    { phase: 'Multilingual Expansion', status: 'pending' }
  ]);
  const [results, setResults] = useState<any>(null);
  const [activationComplete, setActivationComplete] = useState(false);

  const handleStartActivation = async () => {
    setIsActivating(true);
    setCurrentPhase(0);
    setActivationComplete(false);
    
    try {
      // Update phase status to running
      const updatePhaseStatus = (phaseIndex: number, status: PhaseStatus['status']) => {
        setPhases(prev => prev.map((p, i) => 
          i === phaseIndex ? { ...p, status } : p
        ));
        setCurrentPhase(phaseIndex);
      };

      // Phase 1: AI Scoring
      updatePhaseStatus(0, 'running');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Visual feedback
      
      // Phase 2: Content Enhancement  
      updatePhaseStatus(1, 'running');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Phase 3: Multilingual
      updatePhaseStatus(2, 'running');
      
      // Run comprehensive activation
      const activationResults = await runComprehensiveAIActivation();
      
      // Update all phases to complete
      setPhases(prev => prev.map((p, i) => ({
        ...p,
        status: 'complete',
        result: [activationResults.phase1, activationResults.phase2, activationResults.phase3][i]
      })));
      
      setResults(activationResults);
      setActivationComplete(true);
      
    } catch (error) {
      console.error('Activation failed:', error);
      setPhases(prev => prev.map(p => ({ ...p, status: 'error' })));
    } finally {
      setIsActivating(false);
    }
  };

  const getPhaseIcon = (status: PhaseStatus['status']) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error': return <Circle className="w-5 h-5 text-red-600" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getOverallProgress = () => {
    const completed = phases.filter(p => p.status === 'complete').length;
    return Math.round((completed / phases.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Comprehensive AI Activation</CardTitle>
              <CardDescription>
                Activate all 3 phases: AI scoring, content enhancement, and multilingual expansion
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleStartActivation}
            disabled={isActivating}
            size="lg"
            className="w-full"
          >
            {isActivating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Activating Phase {currentPhase + 1}/3
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Activate All 3 Phases
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Card */}
      {isActivating && (
        <Card>
          <CardHeader>
            <CardTitle>Activation Progress</CardTitle>
            <Progress value={getOverallProgress()} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            {phases.map((phase, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getPhaseIcon(phase.status)}
                  <div>
                    <p className="font-medium">{phase.phase}</p>
                    <p className="text-sm text-muted-foreground capitalize">{phase.status}</p>
                  </div>
                </div>
                <Badge variant={phase.status === 'complete' ? 'default' : 'secondary'}>
                  Phase {index + 1}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Results Dashboard */}
      {results && activationComplete && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {results.summary.totalArticles}
              </div>
              <p className="text-sm text-muted-foreground">
                Including {results.summary.multilingualArticles} multilingual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Readiness Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {results.summary.finalAIScore}/10
              </div>
              <Progress value={results.summary.finalAIScore * 10} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voice Search Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {results.summary.voiceReadyCount}
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.round((results.summary.voiceReadyCount / results.summary.totalArticles) * 100)}% of articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Citation Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {results.summary.citationReadyCount}
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.round((results.summary.citationReadyCount / results.summary.totalArticles) * 100)}% of articles
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results */}
      {results && activationComplete && (
        <Card>
          <CardHeader>
            <CardTitle>Phase Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[results.phase1, results.phase2, results.phase3].map((phase, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{phase.phase}</h4>
                  <Badge variant={phase.success ? 'default' : 'destructive'}>
                    {phase.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Articles Processed</p>
                    <p className="text-lg font-semibold">{phase.articlesProcessed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-lg font-semibold">{phase.averageScore.toFixed(1)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {phase.improvements.map((improvement: string, i: number) => (
                    <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      {improvement}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Success Alert */}
      {activationComplete && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            🎉 All 3 phases activated successfully! Your site is now optimized for AI citation, 
            voice search, and multilingual discovery. Articles are ready for ChatGPT, Claude, 
            Perplexity, and other AI platforms to cite your expertise.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ComprehensiveAIActivator;