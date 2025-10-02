import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wrench, Zap, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AIScoreFixDashboard: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixComplete, setFixComplete] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState('');
  const { toast } = useToast();

  const handleQuickFix = async () => {
    setIsFixing(true);
    setFixComplete(false);
    setCurrentPhase('Analyzing articles...');

    try {
      // Call the edge function to recalculate scores
      const { data, error } = await supabase.functions.invoke('calculate-ai-score', {
        body: { recalculateAll: true }
      });

      if (error) throw error;

      setResults(data);
      setFixComplete(true);
      setCurrentPhase('Complete');

      toast({
        title: 'AI Score Recalculation Complete',
        description: `Processed ${data.processed} articles successfully`,
      });
    } catch (error) {
      console.error('Error during quick fix:', error);
      toast({
        title: 'Error',
        description: 'Failed to recalculate AI scores',
        variant: 'destructive',
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleComprehensiveFix = async () => {
    setIsFixing(true);
    setFixComplete(false);
    setCurrentPhase('Running comprehensive optimization...');

    try {
      // First recalculate all scores
      setCurrentPhase('Phase 1: Recalculating AI scores...');
      const { data, error } = await supabase.functions.invoke('calculate-ai-score', {
        body: { recalculateAll: true }
      });

      if (error) throw error;

      // Get updated statistics
      setCurrentPhase('Phase 2: Analyzing results...');
      const { data: articles, error: statsError } = await supabase
        .from('qa_articles')
        .select('ai_optimization_score, voice_search_ready, citation_ready');

      if (statsError) throw statsError;

      const stats = {
        totalArticles: articles?.length || 0,
        averageScore: articles?.reduce((sum, a) => sum + (a.ai_optimization_score || 0), 0) / (articles?.length || 1),
        voiceReady: articles?.filter(a => a.voice_search_ready).length || 0,
        citationReady: articles?.filter(a => a.citation_ready).length || 0,
        above98: articles?.filter(a => (a.ai_optimization_score || 0) >= 9.8).length || 0,
      };

      setResults({ ...data, stats });
      setFixComplete(true);
      setCurrentPhase('Complete');

      toast({
        title: 'Comprehensive Optimization Complete',
        description: `Average score: ${stats.averageScore.toFixed(2)}/10`,
      });
    } catch (error) {
      console.error('Error during comprehensive fix:', error);
      toast({
        title: 'Error',
        description: 'Failed to run comprehensive optimization',
        variant: 'destructive',
      });
    } finally {
      setIsFixing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9.8) return 'text-green-600';
    if (score >= 9.0) return 'text-blue-600';
    if (score >= 8.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 9.8) return <Badge className="bg-green-600">Excellent</Badge>;
    if (score >= 9.0) return <Badge className="bg-blue-600">Good</Badge>;
    if (score >= 8.0) return <Badge variant="secondary">Fair</Badge>;
    return <Badge variant="destructive">Needs Work</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Problem Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            AI Score Optimization System
          </CardTitle>
          <CardDescription>
            Recalculate and optimize AI scores for all articles using Phase 8 enhanced scoring (Target: 9.8/10)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The new Phase 8 scoring system evaluates 8 comprehensive criteria:
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                <li>Voice Search Readiness (2 pts)</li>
                <li>JSON-LD Schema Validation (2 pts)</li>
                <li>External Links Quality (1.5 pts)</li>
                <li>Heading Structure (1.5 pts)</li>
                <li>Multilingual Support (1 pt)</li>
                <li>Image Optimization (1 pt)</li>
                <li>E-E-A-T Signals (1 pt)</li>
                <li>Internal Linking (1 pt)</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button
              onClick={handleQuickFix}
              disabled={isFixing}
              variant="outline"
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Quick Recalculation
            </Button>
            <Button
              onClick={handleComprehensiveFix}
              disabled={isFixing}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-2" />
              Comprehensive Optimization
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Display */}
      {isFixing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentPhase}</span>
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {fixComplete && results && (
        <div className="space-y-4">
          {/* Quick Fix Results */}
          {!results.stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Quick Fix Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Articles Processed</p>
                    <p className="text-2xl font-bold">{results.processed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comprehensive Fix Results */}
          {results.stats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Comprehensive Optimization Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">AI Readiness</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-2xl font-bold ${getScoreColor(results.stats.averageScore)}`}>
                          {results.stats.averageScore.toFixed(2)}
                        </p>
                        {getScoreBadge(results.stats.averageScore)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Voice Ready</p>
                      <p className="text-2xl font-bold">{results.stats.voiceReady}</p>
                      <p className="text-xs text-muted-foreground">
                        {((results.stats.voiceReady / results.stats.totalArticles) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Citation Ready</p>
                      <p className="text-2xl font-bold">{results.stats.citationReady}</p>
                      <p className="text-xs text-muted-foreground">
                        {((results.stats.citationReady / results.stats.totalArticles) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Above 9.8</p>
                      <p className="text-2xl font-bold text-green-600">{results.stats.above98}</p>
                      <p className="text-xs text-muted-foreground">
                        {((results.stats.above98 / results.stats.totalArticles) * 100).toFixed(1)}% target
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.stats.averageScore >= 9.8 ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Excellent!</strong> Your content meets the 9.8/10 AI optimization target.
                        Continue maintaining high-quality standards.
                      </AlertDescription>
                    </Alert>
                  ) : results.stats.averageScore >= 9.0 ? (
                    <Alert className="bg-blue-50 border-blue-200">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Good progress!</strong> Average score is {results.stats.averageScore.toFixed(2)}/10.
                        Focus on the recommendations to reach 9.8 target.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <strong>Needs improvement.</strong> Average score is {results.stats.averageScore.toFixed(2)}/10.
                        Review individual article recommendations for specific fixes.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIScoreFixDashboard;
