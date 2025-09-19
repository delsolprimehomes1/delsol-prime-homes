import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, TrendingUp, Mic, FileText, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { runComprehensiveFix, quickScoreFix } from '@/utils/comprehensive-ai-fix';

export const AIScoreFixDashboard: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixComplete, setFixComplete] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState('');

  const handleQuickFix = async () => {
    setIsFixing(true);
    setCurrentPhase('Fixing AI Scoring Bug...');
    
    try {
      const fixResults = await quickScoreFix();
      setResults({ quickFix: fixResults });
      setFixComplete(true);
      console.log('Quick fix completed:', fixResults);
    } catch (error) {
      console.error('Error during quick fix:', error);
    } finally {
      setIsFixing(false);
    }
  };

  const handleComprehensiveFix = async () => {
    setIsFixing(true);
    setCurrentPhase('Phase 1: Fixing AI Scores...');
    
    try {
      const comprehensiveResults = await runComprehensiveFix();
      setResults({ comprehensive: comprehensiveResults });
      setFixComplete(true);
      console.log('Comprehensive fix completed:', comprehensiveResults);
    } catch (error) {
      console.error('Error during comprehensive fix:', error);
    } finally {
      setIsFixing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return 'text-green-600';
    if (score >= 6.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8.0) return 'default';
    if (score >= 6.0) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            AI Readiness Score Fix
          </CardTitle>
          <p className="text-muted-foreground">
            Fix the critical scoring bug that's causing 129 articles to have 0 AI scores despite having good content.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={handleQuickFix}
              disabled={isFixing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {isFixing && currentPhase.includes('Fixing') ? 'Fixing...' : 'Quick Score Fix'}
            </Button>
            <Button 
              onClick={handleComprehensiveFix}
              disabled={isFixing}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isFixing ? 'Running...' : 'Comprehensive Fix & Optimization'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      {isFixing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              {currentPhase}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={currentPhase.includes('Phase 1') ? 33 : currentPhase.includes('Phase 2') ? 66 : 100} />
          </CardContent>
        </Card>
      )}

      {/* Results Card */}
      {fixComplete && results && (
        <>
          {results.quickFix && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Quick Fix Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{results.quickFix.totalProcessed}</div>
                    <div className="text-sm text-muted-foreground">Articles Processed</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(results.quickFix.averageScoreAfter)}`}>
                      {results.quickFix.averageScoreAfter.toFixed(1)}/10
                    </div>
                    <div className="text-sm text-muted-foreground">New Average Score</div>
                    <div className="text-xs text-muted-foreground">
                      Was: {results.quickFix.averageScoreBefore.toFixed(1)}/10
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{results.quickFix.zeroScoresBefore}</div>
                    <div className="text-sm text-muted-foreground">Zero Scores Fixed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      +{(results.quickFix.averageScoreAfter - results.quickFix.averageScoreBefore).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Score Improvement</div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    AI scoring bug fixed! Your average score improved from {results.quickFix.averageScoreBefore.toFixed(1)} to {results.quickFix.averageScoreAfter.toFixed(1)}. 
                    Run the comprehensive fix for full optimization.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {results.comprehensive && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-semibold">AI Readiness</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(results.comprehensive.finalStats.avg_score)}`}>
                      {results.comprehensive.finalStats.avg_score.toFixed(1)}/10
                    </div>
                    <Badge variant={getScoreBadge(results.comprehensive.finalStats.avg_score)} className="mt-2">
                      {results.comprehensive.finalStats.avg_score >= 8.0 ? 'Excellent' : 
                       results.comprehensive.finalStats.avg_score >= 6.0 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Voice Ready</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results.comprehensive.finalStats.voice_ready}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round((results.comprehensive.finalStats.voice_ready / results.comprehensive.finalStats.total_articles) * 100)}% Ready
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">Citation Ready</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {results.comprehensive.finalStats.citation_ready}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round((results.comprehensive.finalStats.citation_ready / results.comprehensive.finalStats.total_articles) * 100)}% Ready
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold">Total Articles</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {results.comprehensive.finalStats.total_articles}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Zero Scores: {results.comprehensive.finalStats.zero_scores}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comprehensive Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Comprehensive Optimization Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        🎉 AI Citation Readiness optimization complete! Your site is now highly optimized for AI/LLM citation and voice search.
                        Score improved from {results.comprehensive.scoringFix.averageScoreBefore.toFixed(1)} to {results.comprehensive.finalStats.avg_score.toFixed(1)}.
                      </AlertDescription>
                    </Alert>

                    {results.comprehensive.finalStats.avg_score >= 8.0 && (
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          🚀 Excellent! Your AI readiness score is now {results.comprehensive.finalStats.avg_score.toFixed(1)}/10. 
                          Your content is highly optimized for AI citation and discovery.
                        </AlertDescription>
                      </Alert>
                    )}

                    {results.comprehensive.finalStats.avg_score < 8.0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          To reach 9.5/10, focus on expanding content length, adding more voice-friendly patterns, 
                          and enhancing multilingual coverage.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AIScoreFixDashboard;