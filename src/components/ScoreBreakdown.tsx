import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mic, FileJson, ExternalLink, Heading, Globe, Image, Award, Link2, 
  AlertCircle, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { AIScoreMetrics } from '@/lib/aiScoring';

interface ScoreBreakdownProps {
  metrics: AIScoreMetrics;
  recommendations: string[];
  onRescore?: () => void;
  isRescoring?: boolean;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  metrics,
  recommendations,
  onRescore,
  isRescoring = false
}) => {
  const criteria = [
    {
      name: 'Voice Search',
      icon: Mic,
      score: metrics.voiceSearch,
      maxScore: 2.0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Speakable markup, question format, conversational tone'
    },
    {
      name: 'JSON-LD Schema',
      icon: FileJson,
      score: metrics.schemaValidation,
      maxScore: 2.0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Valid schema, speakable spec, geo coordinates, language'
    },
    {
      name: 'External Links',
      icon: ExternalLink,
      score: metrics.externalLinks,
      maxScore: 1.5,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: '≥2 links/1000 words, authority ≥80, all HTTPS'
    },
    {
      name: 'Heading Structure',
      icon: Heading,
      score: metrics.headingStructure,
      maxScore: 1.5,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Single H1, logical H2/H3 hierarchy, no skipped levels'
    },
    {
      name: 'Multilingual',
      icon: Globe,
      score: metrics.multilingual,
      maxScore: 1.0,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      description: 'hreflang tags, canonical URL, language alternates'
    },
    {
      name: 'Images',
      icon: Image,
      score: metrics.images,
      maxScore: 1.0,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      description: 'Alt text, EXIF GPS, captions, optimized formats'
    },
    {
      name: 'E-E-A-T',
      icon: Award,
      score: metrics.eeat,
      maxScore: 1.0,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Author bio, reviewer, recent update, sources cited'
    },
    {
      name: 'Internal Links',
      icon: Link2,
      score: metrics.internalLinking,
      maxScore: 1.0,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: '≥2 links, descriptive anchors, funnel progression'
    }
  ];

  const getScoreStatus = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600' };
    if (percentage >= 70) return { label: 'Good', color: 'text-blue-600' };
    if (percentage >= 50) return { label: 'Fair', color: 'text-yellow-600' };
    return { label: 'Needs Work', color: 'text-red-600' };
  };

  const overallPercentage = (metrics.totalScore / 10) * 100;
  const overallStatus = getScoreStatus(metrics.totalScore, 10);

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                AI Optimization Score
                {metrics.totalScore >= 9.8 ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
              </CardTitle>
              <CardDescription>Target: 9.8/10 for optimal AI discovery</CardDescription>
            </div>
            {onRescore && (
              <Button
                onClick={onRescore}
                disabled={isRescoring}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRescoring ? 'animate-spin' : ''}`} />
                {isRescoring ? 'Rescoring...' : 'Re-score'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-5xl font-bold">{metrics.totalScore.toFixed(1)}</div>
              <div className="text-right">
                <div className="text-2xl text-muted-foreground">/10</div>
                <Badge variant={metrics.totalScore >= 9.8 ? 'default' : 'secondary'}>
                  {overallStatus.label}
                </Badge>
              </div>
            </div>
            <Progress value={overallPercentage} className="h-3" />
            <div className="text-sm text-muted-foreground">
              {metrics.totalScore >= 9.8 ? (
                <span className="text-green-600 font-medium">
                  ✓ Meets AI optimization target
                </span>
              ) : (
                <span className="text-yellow-600 font-medium">
                  {(9.8 - metrics.totalScore).toFixed(1)} points needed to reach target
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Criteria Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {criteria.map((criterion) => {
          const percentage = (criterion.score / criterion.maxScore) * 100;
          const status = getScoreStatus(criterion.score, criterion.maxScore);
          const Icon = criterion.icon;

          return (
            <Card key={criterion.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${criterion.bgColor}`}>
                      <Icon className={`w-4 h-4 ${criterion.color}`} />
                    </div>
                    <CardTitle className="text-lg">{criterion.name}</CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {criterion.score.toFixed(1)}/{criterion.maxScore}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">{criterion.description}</p>
                <Badge variant="outline" className={status.color}>
                  {status.label}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Improvement Recommendations
            </CardTitle>
            <CardDescription>
              Priority fixes to reach 9.8/10 target score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScoreBreakdown;
