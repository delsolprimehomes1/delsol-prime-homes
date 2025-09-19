import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Mic, 
  Quote, 
  FileText, 
  Clock,
  Target,
  Zap
} from 'lucide-react';
import type { ContentQualityCheck, VoiceFriendlyCheck } from '@/utils/content-quality-guard';

interface ContentQualityIndicatorProps {
  qualityCheck: ContentQualityCheck;
  voiceCheck: VoiceFriendlyCheck;
  readingTime: number;
  isCompact?: boolean;
}

export const ContentQualityIndicator: React.FC<ContentQualityIndicatorProps> = ({
  qualityCheck,
  voiceCheck,
  readingTime,
  isCompact = false
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    return 'destructive';
  };

  const overallScore = qualityCheck.isValid ? 
    Math.min(100, (voiceCheck.score + (qualityCheck.meetsMinimum ? 40 : 0) + (qualityCheck.hasShortAnswer ? 30 : 0) + (qualityCheck.hasQuickAnswer ? 30 : 0))) : 
    Math.max(25, voiceCheck.score * 0.5);

  if (isCompact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={getScoreBadgeVariant(overallScore)} className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          {Math.round(overallScore)}% Ready
        </Badge>
        
        {qualityCheck.isValid && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Quote className="w-3 h-3" />
            Citation Ready
          </Badge>
        )}
        
        {voiceCheck.score >= 75 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Mic className="w-3 h-3" />
            Voice Ready
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-primary" />
          Content Quality Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall AI Readiness</span>
            <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
              {Math.round(overallScore)}%
            </span>
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>

        {/* Quality Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Content Length</span>
            </div>
            <div className={`text-lg font-bold ${qualityCheck.meetsMinimum ? 'text-green-600' : 'text-red-600'}`}>
              {qualityCheck.charCount}
            </div>
            <div className="text-xs text-muted-foreground">
              Target: 1200+ chars
            </div>
          </div>

          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Reading Time</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {readingTime} min
            </div>
            <div className="text-xs text-muted-foreground">
              Optimal: 2-4 min
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={qualityCheck.hasShortAnswer ? "default" : "secondary"} className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Short Answer
          </Badge>
          
          <Badge variant={qualityCheck.hasQuickAnswer ? "default" : "secondary"} className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Quick Answer
          </Badge>
          
          <Badge variant={voiceCheck.answersInFirstSentence ? "default" : "secondary"} className="flex items-center gap-1">
            <Mic className="w-3 h-3" />
            Voice Friendly
          </Badge>
          
          <Badge variant={voiceCheck.usesPlainTerms ? "default" : "secondary"} className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Plain Language
          </Badge>
        </div>

        {/* Voice Search Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice Search Readiness
            </span>
            <span className={`text-sm font-bold ${getScoreColor(voiceCheck.score)}`}>
              {voiceCheck.score}%
            </span>
          </div>
          <Progress value={voiceCheck.score} className="h-1.5" />
        </div>

        {/* Issues & Recommendations */}
        {qualityCheck.issues.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="font-medium mb-1">Issues Found:</div>
              <ul className="text-xs space-y-1">
                {qualityCheck.issues.slice(0, 3).map((issue, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span>•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {qualityCheck.isValid && voiceCheck.score >= 75 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Fully Optimized!</strong> This content is ready for AI citation and voice search discovery.
            </AlertDescription>
          </Alert>
        )}

        {/* NoIndex Warning */}
        {qualityCheck.shouldNoIndex && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Not Indexed:</strong> This page is marked noindex until content quality improves.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentQualityIndicator;