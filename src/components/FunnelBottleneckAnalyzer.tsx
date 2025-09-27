import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingDown, 
  Link, 
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  detectFunnelBottlenecks, 
  generateSmartLinkSuggestions,
  applySmartLinkingRecommendations,
  type FunnelBottleneck,
  type SmartLinkSuggestion
} from '@/utils/phase3-funnel-intelligence';

export const FunnelBottleneckAnalyzer: React.FC = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [bottlenecks, setBottlenecks] = React.useState<FunnelBottleneck[]>([]);
  const [suggestions, setSuggestions] = React.useState<SmartLinkSuggestion[]>([]);
  const [isApplying, setIsApplying] = React.useState(false);
  const [applicationResults, setApplicationResults] = React.useState<any>(null);

  const handleAnalyzeBottlenecks = async () => {
    setIsAnalyzing(true);
    try {
      toast({
        title: "Analyzing Funnel Bottlenecks",
        description: "Detecting articles with excessive incoming links...",
      });

      const detectedBottlenecks = await detectFunnelBottlenecks();
      setBottlenecks(detectedBottlenecks);

      // Generate suggestions for the most critical bottlenecks
      if (detectedBottlenecks.length > 0) {
        const allSuggestions: SmartLinkSuggestion[] = [];
        
        for (const bottleneck of detectedBottlenecks.slice(0, 5)) { // Top 5 bottlenecks
          const bottleneckSuggestions = await generateSmartLinkSuggestions(bottleneck);
          allSuggestions.push(...bottleneckSuggestions.slice(0, 10)); // Top 10 per bottleneck
        }
        
        setSuggestions(allSuggestions);
      }

      toast({
        title: "Analysis Complete",
        description: `Found ${detectedBottlenecks.length} bottlenecks with ${suggestions.length} optimization suggestions.`,
      });

    } catch (error) {
      console.error('Bottleneck analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing funnel bottlenecks.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestions = async () => {
    if (suggestions.length === 0) return;

    setIsApplying(true);
    try {
      toast({
        title: "Applying Smart Linking",
        description: "Redistributing links to eliminate bottlenecks...",
      });

      const results = await applySmartLinkingRecommendations(suggestions);
      setApplicationResults(results);

      toast({
        title: "Smart Linking Applied",
        description: `Applied ${results.applied} optimizations with ${results.errors} errors.`,
      });

    } catch (error) {
      console.error('Smart linking application failed:', error);
      toast({
        title: "Application Failed",
        description: "There was an error applying smart linking suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <Info className="w-5 h-5 text-yellow-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Analysis Button */}
      <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Funnel Bottleneck Detection & Resolution
            </h3>
            <p className="text-muted-foreground mb-4">
              Identify articles with excessive incoming links (bottlenecks) and redistribute traffic for better user flow
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleAnalyzeBottlenecks}
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Analyzing Bottlenecks...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Detect Bottlenecks
                  </>
                )}
              </Button>

              {suggestions.length > 0 && (
                <Button 
                  onClick={handleApplySuggestions}
                  disabled={isApplying}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      Apply Smart Linking ({suggestions.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Bottlenecks Display */}
      {bottlenecks.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Detected Bottlenecks ({bottlenecks.length})
          </h4>
          
          <div className="space-y-4">
            {bottlenecks.slice(0, 10).map((bottleneck, index) => (
              <div 
                key={bottleneck.targetArticleId}
                className={`p-4 rounded-lg border ${getSeverityColor(bottleneck.severity)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(bottleneck.severity)}
                    <div>
                      <h5 className="font-medium">{bottleneck.targetTitle}</h5>
                      <p className="text-sm opacity-75">/{bottleneck.targetSlug}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-1">
                      {bottleneck.incomingLinkCount} incoming links
                    </Badge>
                    <div className="text-xs capitalize">{bottleneck.severity} severity</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Linking Articles:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {bottleneck.linkingArticles.slice(0, 6).map((article) => (
                      <div 
                        key={article.id}
                        className="p-2 bg-white/50 rounded border text-xs"
                      >
                        <div className="font-medium truncate">{article.title}</div>
                        <div className="opacity-60">{article.funnel_stage} • {article.topic}</div>
                      </div>
                    ))}
                    {bottleneck.linkingArticles.length > 6 && (
                      <div className="p-2 bg-white/50 rounded border text-xs flex items-center justify-center opacity-60">
                        +{bottleneck.linkingArticles.length - 6} more
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Recommendations:</div>
                  <ul className="text-sm space-y-1">
                    {bottleneck.recommendedActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-600" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Smart Linking Suggestions */}
      {suggestions.length > 0 && (
        <Card className="p-6 bg-blue-50/50 border-blue-200">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Link className="w-5 h-5 text-blue-600" />
            Smart Linking Suggestions ({suggestions.length})
          </h4>
          
          <div className="space-y-3">
            {suggestions.slice(0, 15).map((suggestion, index) => (
              <div 
                key={`${suggestion.fromArticleId}-${suggestion.toArticleId}`}
                className="p-3 bg-white rounded-lg border border-blue-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.linkType}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(suggestion.relevanceScore * 100)}% match
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate">{suggestion.fromTitle}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate">{suggestion.toTitle}</div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  <strong>Anchor:</strong> "{suggestion.suggestedAnchorText}" | 
                  <strong> Reason:</strong> {suggestion.reasoning}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Application Results */}
      {applicationResults && (
        <Card className="p-6 bg-green-50/50 border-green-200">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Smart Linking Results
          </h4>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">{applicationResults.applied}</div>
              <div className="text-xs text-muted-foreground">Links Applied</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-red-600">{applicationResults.errors}</div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((applicationResults.applied / (applicationResults.applied + applicationResults.errors)) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>

          <div className="text-sm text-green-800">
            <strong>Phase 3 Progress:</strong> Bottleneck resolution applied to reduce funnel 
            chokepoints and improve content flow distribution.
          </div>
        </Card>
      )}

      {/* No Bottlenecks Found */}
      {bottlenecks.length === 0 && !isAnalyzing && (
        <Card className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-foreground mb-2">
            No Critical Bottlenecks Detected
          </h4>
          <p className="text-muted-foreground">
            Your funnel flow appears well-distributed. Run analysis to verify current status.
          </p>
        </Card>
      )}

    </div>
  );
};

export default FunnelBottleneckAnalyzer;