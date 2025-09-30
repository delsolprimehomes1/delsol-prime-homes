import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClusterManager, QACluster, ClusteredQAArticle } from '@/utils/cluster-manager';
import { ClusterJourneyValidator } from './ClusterJourneyValidator';
import { supabase } from '@/integrations/supabase/client';
import { ClusterGitHubExporter } from '@/utils/cluster-github-export';
import { generateClusterSchema } from '@/utils/enhanced-cluster-schemas';
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download,
  FileJson,
  GitBranch
} from 'lucide-react';

interface ClusterStats {
  totalClusters: number;
  completeClusters: number;
  incompleteClusters: number;
  totalArticles: number;
  clusteredArticles: number;
  unclusteredArticles: number;
  healthyLinks: number;
  brokenLinks: number;
}

interface ClusterHealth {
  clusterId: string;
  clusterTitle: string;
  isComplete: boolean;
  hasValidStructure: boolean;
  articleCount: number;
  missingPositions: number[];
  brokenLinks: string[];
  healthScore: number;
}

export function ClusterTrackerDashboard() {
  const [clusters, setClusters] = useState<QACluster[]>([]);
  const [stats, setStats] = useState<ClusterStats | null>(null);
  const [clusterHealth, setClusterHealth] = useState<ClusterHealth[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadClusterData();
  }, []);

  const loadClusterData = async () => {
    setIsLoading(true);
    try {
      const allClusters = await ClusterManager.getAllClustersWithArticles('en');
      
      // Get total article count
      const { count: totalArticles } = await supabase
        .from('qa_articles')
        .select('*', { count: 'exact', head: true })
        .eq('language', 'en');

      const clusteredArticles = allClusters.reduce((sum, cluster) => 
        sum + (cluster.articles?.length || 0), 0);

      // Calculate cluster health
      const healthData: ClusterHealth[] = allClusters.map(cluster => 
        calculateClusterHealth(cluster)
      );

      // Calculate stats
      const completeClusters = healthData.filter(h => h.isComplete).length;
      const brokenLinksCount = healthData.reduce((sum, h) => 
        sum + h.brokenLinks.length, 0);

      setStats({
        totalClusters: allClusters.length,
        completeClusters,
        incompleteClusters: allClusters.length - completeClusters,
        totalArticles: totalArticles || 0,
        clusteredArticles,
        unclusteredArticles: (totalArticles || 0) - clusteredArticles,
        healthyLinks: clusteredArticles * 2 - brokenLinksCount, // Each article should have 2 links
        brokenLinks: brokenLinksCount
      });

      setClusters(allClusters);
      setClusterHealth(healthData);
    } catch (error) {
      console.error('Error loading cluster data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateClusterHealth = (cluster: QACluster): ClusterHealth => {
    const articles = cluster.articles || [];
    const articleCount = articles.length;
    const isComplete = articleCount === 6;

    // Check for missing positions (1-6)
    const positions = articles.map(a => a.cluster_position).filter(p => p !== null);
    const missingPositions = [1, 2, 3, 4, 5, 6].filter(pos => !positions.includes(pos));

    // Check for broken links
    const brokenLinks: string[] = [];
    articles.forEach(article => {
      if (article.points_to_mofu_id && !articles.find(a => a.id === article.points_to_mofu_id)) {
        brokenLinks.push(`${article.title} → Missing MOFU`);
      }
      if (article.points_to_bofu_id && !articles.find(a => a.id === article.points_to_bofu_id)) {
        brokenLinks.push(`${article.title} → Missing BOFU`);
      }
    });

    // Validate structure
    const validation = ClusterManager.validateClusterStructure(articles);
    
    // Calculate health score (0-100)
    let healthScore = 0;
    if (isComplete) healthScore += 40;
    if (validation.isValid) healthScore += 40;
    if (brokenLinks.length === 0) healthScore += 20;

    return {
      clusterId: cluster.id,
      clusterTitle: cluster.title,
      isComplete,
      hasValidStructure: validation.isValid,
      articleCount,
      missingPositions,
      brokenLinks,
      healthScore
    };
  };

  const exportClusterToGitHub = async (clusterId: string) => {
    setIsExporting(true);
    try {
      const cluster = clusters.find(c => c.id === clusterId);
      if (!cluster) return;

      // Generate markdown export
      const markdown = ClusterGitHubExporter.generateClusterMarkdown(cluster);
      
      // Generate JSON with schema
      const jsonExport = {
        ...cluster,
        schema: generateClusterSchema(cluster)
      };
      
      // Download markdown file
      const markdownBlob = new Blob([markdown], { type: 'text/markdown' });
      const markdownUrl = URL.createObjectURL(markdownBlob);
      const markdownLink = document.createElement('a');
      markdownLink.href = markdownUrl;
      markdownLink.download = `cluster-${cluster.id}.md`;
      markdownLink.click();
      URL.revokeObjectURL(markdownUrl);
      
      // Download JSON file
      const jsonBlob = new Blob([JSON.stringify(jsonExport, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `cluster-${cluster.id}.json`;
      jsonLink.click();
      URL.revokeObjectURL(jsonUrl);
      
      alert('Cluster exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default" className="bg-green-600">Healthy</Badge>;
    if (score >= 50) return <Badge variant="secondary" className="bg-yellow-600">Warning</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cluster data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Cluster Tracker Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and analyze your 3-2-1 TOFU→MOFU→BOFU cluster structure
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clusters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalClusters}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.completeClusters} complete, {stats?.incompleteClusters} incomplete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Article Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.clusteredArticles}/{stats?.totalArticles}</div>
            <Progress 
              value={(stats?.clusteredArticles || 0) / (stats?.totalArticles || 1) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.unclusteredArticles} articles need clustering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Link Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.healthyLinks}/{stats?.healthyLinks + (stats?.brokenLinks || 0)}</div>
            <Progress 
              value={(stats?.healthyLinks || 0) / ((stats?.healthyLinks || 0) + (stats?.brokenLinks || 1)) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.brokenLinks} broken links detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((clusterHealth.reduce((sum, h) => sum + h.healthScore, 0) / (clusterHealth.length || 1)))}%
            </div>
            <Progress 
              value={clusterHealth.reduce((sum, h) => sum + h.healthScore, 0) / (clusterHealth.length || 1)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Average cluster health score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clusters">Cluster Details</TabsTrigger>
          <TabsTrigger value="issues">Issues & Gaps</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cluster Health Overview</CardTitle>
              <CardDescription>Quick status of all clusters on your QA page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clusterHealth.map((health) => (
                  <div key={health.clusterId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{health.clusterTitle}</h3>
                        {getHealthBadge(health.healthScore)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{health.articleCount}/6 articles</span>
                        {health.hasValidStructure ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            Valid structure
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            Invalid structure
                          </span>
                        )}
                        {health.brokenLinks.length > 0 && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="w-4 h-4" />
                            {health.brokenLinks.length} broken links
                          </span>
                        )}
                      </div>
                      <Progress value={health.healthScore} className="mt-2" />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedCluster(health.clusterId)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cluster Details Tab */}
        <TabsContent value="clusters" className="space-y-4">
          {clusters.map((cluster) => {
            const health = clusterHealth.find(h => h.clusterId === cluster.id);
            const articles = cluster.articles || [];
            const tofuArticles = articles.filter(a => a.funnel_stage === 'TOFU').sort((a, b) => (a.cluster_position || 0) - (b.cluster_position || 0));
            const mofuArticles = articles.filter(a => a.funnel_stage === 'MOFU').sort((a, b) => (a.cluster_position || 0) - (b.cluster_position || 0));
            const bofuArticles = articles.filter(a => a.funnel_stage === 'BOFU');

            return (
              <Card key={cluster.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        {cluster.title}
                        {health && getHealthBadge(health.healthScore)}
                      </CardTitle>
                      <CardDescription>{cluster.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportClusterToGitHub(cluster.id)}
                        disabled={isExporting}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Journey Flow Visualization */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* TOFU */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline">TOFU</Badge>
                        Awareness Stage ({tofuArticles.length}/3)
                      </h4>
                      {tofuArticles.map((article, idx) => (
                        <div key={article.id} className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{article.title}</p>
                              <p className="text-xs text-muted-foreground">Position {article.cluster_position}</p>
                            </div>
                            {article.points_to_mofu_id && (
                              <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* MOFU */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline">MOFU</Badge>
                        Consideration Stage ({mofuArticles.length}/2)
                      </h4>
                      {mofuArticles.map((article) => (
                        <div key={article.id} className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{article.title}</p>
                              <p className="text-xs text-muted-foreground">Position {article.cluster_position}</p>
                            </div>
                            {article.points_to_bofu_id && (
                              <ArrowRight className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* BOFU */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline">BOFU</Badge>
                        Decision Stage ({bofuArticles.length}/1)
                      </h4>
                      {bofuArticles.map((article) => (
                        <div key={article.id} className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{article.title}</p>
                            <p className="text-xs text-muted-foreground">Position {article.cluster_position}</p>
                            {article.appointment_booking_enabled && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                <GitBranch className="w-3 h-3 mr-1" />
                                Chatbot Enabled
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Journey Validator */}
                  <ClusterJourneyValidator 
                    clusterId={cluster.id}
                    onValidationComplete={(isValid) => {
                      console.log(`Cluster ${cluster.title} validation:`, isValid);
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Issues & Missing Links</CardTitle>
              <CardDescription>Problems that need attention in your cluster structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {clusterHealth.filter(h => !h.isComplete || h.brokenLinks.length > 0 || !h.hasValidStructure).length === 0 ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    All clusters are healthy! No issues detected.
                  </AlertDescription>
                </Alert>
              ) : (
                clusterHealth
                  .filter(h => !h.isComplete || h.brokenLinks.length > 0 || !h.hasValidStructure)
                  .map((health) => (
                    <Alert key={health.clusterId} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-2">{health.clusterTitle}</div>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {!health.isComplete && (
                            <li>Incomplete cluster: {health.articleCount}/6 articles</li>
                          )}
                          {health.missingPositions.length > 0 && (
                            <li>Missing positions: {health.missingPositions.join(', ')}</li>
                          )}
                          {!health.hasValidStructure && (
                            <li>Invalid 3-2-1 structure</li>
                          )}
                          {health.brokenLinks.map((link, idx) => (
                            <li key={idx}>Broken link: {link}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ))
              )}

              {stats && stats.unclusteredArticles > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Unclustered Articles</div>
                    <p className="text-sm">
                      {stats.unclusteredArticles} articles are not assigned to any cluster. 
                      Consider organizing them into proper 3-2-1 cluster structures.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
