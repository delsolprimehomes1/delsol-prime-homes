import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Target, Mic, FileText, TrendingUp, Zap } from 'lucide-react';
import { batchScoreAllArticles } from '@/lib/aiScoring';
import { useToast } from '@/hooks/use-toast';

export const Phase1CompletionStatus: React.FC = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);

  const handleEnhancedScoring = async () => {
    setIsProcessing(true);
    try {
      toast({
        title: "Phase 1 AI Optimization Started",
        description: "Running enhanced AI scoring with new 9.5+ target system...",
      });

      const scoringResults = await batchScoreAllArticles();
      setResults(scoringResults);

      toast({
        title: "Phase 1 Optimization Complete!",
        description: `Processed ${scoringResults.totalProcessed} articles. New average: ${scoringResults.averageScore}/10`,
      });
    } catch (error) {
      console.error('Phase 1 optimization failed:', error);
      toast({
        title: "Optimization Failed",
        description: "There was an error running the Phase 1 optimization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Phase 1: AI/LLM Optimization Complete</h2>
            <p className="text-muted-foreground">Emergency AI Score Rescue - Target: 9.5+/10 AI Scores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">AI Direct Answers</span>
            </div>
            <div className="text-sm text-muted-foreground">
              ✅ Structured answer blocks<br/>
              ✅ Evidence backing<br/>
              ✅ Confidence scoring
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Voice Optimization</span>
            </div>
            <div className="text-sm text-muted-foreground">
              ✅ Voice-friendly Q&As<br/>
              ✅ Quick facts format<br/>
              ✅ Speakable elements
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-800">Citation Ready</span>
            </div>
            <div className="text-sm text-muted-foreground">
              ✅ Source references<br/>
              ✅ E-E-A-T signals<br/>
              ✅ Expert credentials
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Enhanced Scoring</span>
            </div>
            <div className="text-sm text-muted-foreground">
              ✅ 9.5+ target system<br/>
              ✅ AI structure detection<br/>
              ✅ Voice readiness check
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Phase 1 Implementation Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">New Components Added:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• AIDirectAnswerBlock - Structured answer sections</li>
                <li>• VoiceSearchOptimizedBlock - Voice-friendly content</li>
                <li>• CitationReadyBlock - AI citation optimization</li>
                <li>• AIContentEnhancer - Comprehensive integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Enhanced Systems:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• AI Scoring System - 9.5+ target optimization</li>
                <li>• Content Quality Detection - AI structure aware</li>
                <li>• Voice Search Readiness - Enhanced patterns</li>
                <li>• Citation Metadata - LLM consumption ready</li>
              </ul>
            </div>
          </div>
        </div>

        {results && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold mb-3 text-green-800">Latest Scoring Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{results.averageScore}</div>
                <div className="text-xs text-muted-foreground">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{results.voiceReadyCount}</div>
                <div className="text-xs text-muted-foreground">Voice Ready</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{results.citationReadyCount}</div>
                <div className="text-xs text-muted-foreground">Citation Ready</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{results.articlesAboveTarget}</div>
                <div className="text-xs text-muted-foreground">Above Target</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleEnhancedScoring}
            disabled={isProcessing}
            size="lg"
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Running Phase 1 Optimization...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Run Enhanced AI Scoring (Phase 1)
              </>
            )}
          </Button>
          
          <Badge variant="outline" className="px-4 py-2 justify-center">
            Next: Phase 2 - Advanced Schema & Speakable Optimization
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default Phase1CompletionStatus;