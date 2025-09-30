import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, ArrowRight, Network } from 'lucide-react';
import { ClusterManager, QACluster, ClusteredQAArticle } from '@/utils/cluster-manager';
import { ClusterImportValidator } from '@/utils/cluster-import-validator';

interface ClusterJourneyValidatorProps {
  clusterId?: string;
  articles?: ClusteredQAArticle[];
  onValidationComplete?: (isValid: boolean) => void;
}

export function ClusterJourneyValidator({ 
  clusterId, 
  articles, 
  onValidationComplete 
}: ClusterJourneyValidatorProps) {
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
    journeyMap?: any;
  } | null>(null);
  const [cluster, setCluster] = useState<QACluster | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (clusterId) {
      validateCluster();
    } else if (articles) {
      validateArticles();
    }
  }, [clusterId, articles]);

  const validateCluster = async () => {
    if (!clusterId) return;
    
    setIsLoading(true);
    try {
      const result = await ClusterImportValidator.validateClusterJourney(clusterId);
      setValidation(result);
      
      const clusterData = await ClusterManager.getClusterWithArticles(clusterId);
      setCluster(clusterData);

      if (onValidationComplete) {
        onValidationComplete(result.isValid);
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateArticles = () => {
    if (!articles || articles.length === 0) return;

    const structure = ClusterManager.validateClusterStructure(articles);
    setValidation({
      isValid: structure.isValid,
      errors: structure.errors
    });

    if (onValidationComplete) {
      onValidationComplete(structure.isValid);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 animate-pulse" />
            <span>Validating cluster journey...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validation) return null;

  const clusterArticles = cluster?.articles || articles || [];
  const tofuArticles = clusterArticles.filter(a => a.funnel_stage === 'TOFU');
  const mofuArticles = clusterArticles.filter(a => a.funnel_stage === 'MOFU');
  const bofuArticles = clusterArticles.filter(a => a.funnel_stage === 'BOFU');

  return (
    <div className="space-y-4">
      {/* Validation Status */}
      <Alert variant={validation.isValid ? 'default' : 'destructive'}>
        <div className="flex items-start gap-3">
          {validation.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <div className="flex-1">
            <div className="font-semibold mb-1">
              {validation.isValid 
                ? 'Valid 3-2-1 Cluster Structure' 
                : 'Invalid Cluster Structure'}
            </div>
            <AlertDescription>
              {validation.isValid 
                ? 'Journey flow is properly configured with correct TOFU→MOFU→BOFU linking'
                : 'Issues found with cluster structure or journey flow'}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Error List */}
      {validation.errors.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-base">Validation Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {validation.errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Journey Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Journey Flow Diagram
          </CardTitle>
          <CardDescription>
            Visual representation of the 3→2→1 funnel structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* TOFU Section */}
            <div className="flex items-center gap-4">
              <div className="w-32 shrink-0">
                <Badge variant="secondary" className="w-full justify-center">
                  TOFU ({tofuArticles.length})
                </Badge>
              </div>
              <div className="flex-1 space-y-2">
                {tofuArticles.map((article, index) => (
                  <div 
                    key={article.id} 
                    className="p-3 bg-secondary/30 rounded-lg text-sm border border-border"
                  >
                    <div className="font-medium mb-1">Variation {index + 1}</div>
                    <div className="text-muted-foreground line-clamp-1">{article.title}</div>
                    {article.variation_group && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Group: {article.variation_group}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>

            {/* MOFU Section */}
            <div className="flex items-center gap-4">
              <div className="w-32 shrink-0">
                <Badge variant="secondary" className="w-full justify-center">
                  MOFU ({mofuArticles.length})
                </Badge>
              </div>
              <div className="flex-1 space-y-2">
                {mofuArticles.map((article, index) => (
                  <div 
                    key={article.id} 
                    className="p-3 bg-primary/10 rounded-lg text-sm border border-primary/20"
                  >
                    <div className="font-medium mb-1">MOFU {index + 1}</div>
                    <div className="text-muted-foreground line-clamp-1">{article.title}</div>
                  </div>
                ))}
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>

            {/* BOFU Section */}
            <div className="flex items-center gap-4">
              <div className="w-32 shrink-0">
                <Badge variant="default" className="w-full justify-center">
                  BOFU ({bofuArticles.length})
                </Badge>
              </div>
              <div className="flex-1">
                {bofuArticles.map((article) => (
                  <div 
                    key={article.id} 
                    className="p-3 bg-primary/20 rounded-lg text-sm border border-primary"
                  >
                    <div className="font-medium mb-1">Final Question → Chatbot</div>
                    <div className="text-muted-foreground line-clamp-1">{article.title}</div>
                    {article.appointment_booking_enabled && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Booking enabled</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm">3 TOFU variations → Same MOFU</span>
            {tofuArticles.every(a => a.points_to_mofu_id) ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm">2 MOFU → Same BOFU</span>
            {mofuArticles.every(a => a.points_to_bofu_id) ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm">BOFU → Chatbot Integration</span>
            {bofuArticles[0]?.appointment_booking_enabled ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
