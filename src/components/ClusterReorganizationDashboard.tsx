import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FolderTree, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  Upload,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface Article {
  id: string;
  slug: string;
  title: string;
  topic: string;
  funnel_stage: string;
  cluster_id: string | null;
  cluster_position: number | null;
}

interface ClusterDraft {
  id?: string;
  title: string;
  topic: string;
  description: string;
  articles: {
    TOFU: Article[];
    MOFU: Article[];
    BOFU: Article[];
  };
}

export const ClusterReorganizationDashboard = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [clusterDrafts, setClusterDrafts] = useState<ClusterDraft[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [newCluster, setNewCluster] = useState<ClusterDraft>({
    title: '',
    topic: '',
    description: '',
    articles: { TOFU: [], MOFU: [], BOFU: [] }
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('qa_articles')
      .select('id, slug, title, topic, funnel_stage, cluster_id, cluster_position')
      .eq('language', 'en')
      .order('topic', { ascending: true });

    if (error) {
      toast.error('Failed to fetch articles');
      console.error(error);
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  const getTopics = () => {
    const topics = new Set(articles.map(a => a.topic));
    return Array.from(topics).sort();
  };

  const getArticlesByTopic = (topic: string) => {
    return articles.filter(a => 
      (topic === 'all' || a.topic === topic) &&
      !a.cluster_id &&
      (searchQuery === '' || 
       a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       a.topic.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getClusteredCount = () => {
    return articles.filter(a => a.cluster_id).length;
  };

  const getUnclusteredCount = () => {
    return articles.filter(a => !a.cluster_id).length;
  };

  const addArticleToCluster = (article: Article, stage: 'TOFU' | 'MOFU' | 'BOFU') => {
    if (newCluster.articles[stage].length >= getStageLimit(stage)) {
      toast.error(`Maximum ${getStageLimit(stage)} ${stage} articles allowed`);
      return;
    }

    setNewCluster(prev => ({
      ...prev,
      articles: {
        ...prev.articles,
        [stage]: [...prev.articles[stage], article]
      }
    }));
  };

  const removeArticleFromCluster = (articleId: string, stage: 'TOFU' | 'MOFU' | 'BOFU') => {
    setNewCluster(prev => ({
      ...prev,
      articles: {
        ...prev.articles,
        [stage]: prev.articles[stage].filter(a => a.id !== articleId)
      }
    }));
  };

  const getStageLimit = (stage: 'TOFU' | 'MOFU' | 'BOFU') => {
    return stage === 'TOFU' ? 3 : stage === 'MOFU' ? 2 : 1;
  };

  const validateCluster = (cluster: ClusterDraft): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!cluster.title.trim()) errors.push('Cluster title is required');
    if (!cluster.topic.trim()) errors.push('Cluster topic is required');
    if (cluster.articles.TOFU.length !== 3) errors.push('Exactly 3 TOFU articles required');
    if (cluster.articles.MOFU.length !== 2) errors.push('Exactly 2 MOFU articles required');
    if (cluster.articles.BOFU.length !== 1) errors.push('Exactly 1 BOFU article required');

    return { valid: errors.length === 0, errors };
  };

  const saveCluster = async () => {
    const validation = validateCluster(newCluster);
    if (!validation.valid) {
      toast.error(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    try {
      // Create cluster
      const { data: cluster, error: clusterError } = await supabase
        .from('qa_clusters')
        .insert({
          title: newCluster.title,
          topic: newCluster.topic,
          description: newCluster.description,
          language: 'en',
          is_active: true
        })
        .select()
        .single();

      if (clusterError) throw clusterError;

      // Update articles with cluster assignment
      const allArticles = [
        ...newCluster.articles.TOFU,
        ...newCluster.articles.MOFU,
        ...newCluster.articles.BOFU
      ];

      let position = 0;
      for (const article of allArticles) {
        const { error: updateError } = await supabase
          .from('qa_articles')
          .update({
            cluster_id: cluster.id,
            cluster_position: position++
          })
          .eq('id', article.id);

        if (updateError) throw updateError;
      }

      toast.success(`Cluster "${newCluster.title}" created successfully!`);
      
      // Reset form and refresh
      setNewCluster({
        title: '',
        topic: '',
        description: '',
        articles: { TOFU: [], MOFU: [], BOFU: [] }
      });
      
      fetchArticles();
    } catch (error) {
      console.error('Error saving cluster:', error);
      toast.error('Failed to save cluster');
    }
  };

  const exportClusterTemplate = () => {
    const topics = getTopics();
    const template = topics.map(topic => {
      const topicArticles = articles.filter(a => a.topic === topic && !a.cluster_id);
      return {
        topic,
        unclustered_count: topicArticles.length,
        suggested_clusters: Math.ceil(topicArticles.length / 6),
        articles: topicArticles.map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          current_funnel_stage: a.funnel_stage
        }))
      };
    });

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qa-cluster-template.json';
    a.click();
    toast.success('Template exported!');
  };

  const progress = articles.length > 0 ? (getClusteredCount() / articles.length) * 100 : 0;

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderTree className="w-8 h-8" />
            QA Cluster Reorganization
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize {articles.length} articles into proper 3-2-1 clusters
          </p>
        </div>
        <Button onClick={exportClusterTemplate} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Template
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Organization Progress</p>
              <p className="text-2xl font-bold">{Math.round(progress)}%</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{getClusteredCount()}</p>
                <p className="text-sm text-muted-foreground">Clustered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{getUnclusteredCount()}</p>
                <p className="text-sm text-muted-foreground">Unclustered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">~{Math.ceil(articles.length / 6)}</p>
                <p className="text-sm text-muted-foreground">Target Clusters</p>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Cluster</TabsTrigger>
          <TabsTrigger value="overview">Overview by Topic</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Cluster Builder */}
            <Card className="p-6 lg:col-span-1">
              <h3 className="font-semibold text-lg mb-4">New Cluster</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Cluster Title</label>
                  <Input
                    value={newCluster.title}
                    onChange={(e) => setNewCluster(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Buying Process Overview"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Topic</label>
                  <Input
                    value={newCluster.topic}
                    onChange={(e) => setNewCluster(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Legal & Process"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newCluster.description}
                    onChange={(e) => setNewCluster(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this cluster's theme"
                    rows={3}
                  />
                </div>

                {/* Cluster Preview */}
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">TOFU (3)</span>
                      <Badge variant={newCluster.articles.TOFU.length === 3 ? 'default' : 'secondary'}>
                        {newCluster.articles.TOFU.length}/3
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {newCluster.articles.TOFU.map(a => (
                        <div key={a.id} className="text-xs bg-muted p-2 rounded flex justify-between items-center">
                          <span className="truncate flex-1">{a.title}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeArticleFromCluster(a.id, 'TOFU')}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">MOFU (2)</span>
                      <Badge variant={newCluster.articles.MOFU.length === 2 ? 'default' : 'secondary'}>
                        {newCluster.articles.MOFU.length}/2
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {newCluster.articles.MOFU.map(a => (
                        <div key={a.id} className="text-xs bg-muted p-2 rounded flex justify-between items-center">
                          <span className="truncate flex-1">{a.title}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeArticleFromCluster(a.id, 'MOFU')}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">BOFU (1)</span>
                      <Badge variant={newCluster.articles.BOFU.length === 1 ? 'default' : 'secondary'}>
                        {newCluster.articles.BOFU.length}/1
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {newCluster.articles.BOFU.map(a => (
                        <div key={a.id} className="text-xs bg-muted p-2 rounded flex justify-between items-center">
                          <span className="truncate flex-1">{a.title}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeArticleFromCluster(a.id, 'BOFU')}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={saveCluster} 
                  className="w-full"
                  disabled={!validateCluster(newCluster).valid}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Cluster
                </Button>
              </div>
            </Card>

            {/* Right Panel - Available Articles */}
            <Card className="p-6 lg:col-span-2">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles..."
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="px-4 py-2 border rounded-md"
                  >
                    <option value="all">All Topics</option>
                    {getTopics().map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {getArticlesByTopic(selectedTopic).map(article => (
                      <Card key={article.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{article.title}</h4>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {article.topic}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {article.funnel_stage}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addArticleToCluster(article, 'TOFU')}
                              disabled={newCluster.articles.TOFU.length >= 3}
                            >
                              Add to TOFU
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addArticleToCluster(article, 'MOFU')}
                              disabled={newCluster.articles.MOFU.length >= 2}
                            >
                              Add to MOFU
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addArticleToCluster(article, 'BOFU')}
                              disabled={newCluster.articles.BOFU.length >= 1}
                            >
                              Add to BOFU
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid gap-4">
            {getTopics().map(topic => {
              const topicArticles = articles.filter(a => a.topic === topic && !a.cluster_id);
              const clusteredCount = articles.filter(a => a.topic === topic && a.cluster_id).length;
              
              return (
                <Card key={topic} className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{topic}</h3>
                      <p className="text-sm text-muted-foreground">
                        {topicArticles.length} unclustered • {clusteredCount} clustered • 
                        Needs ~{Math.ceil(topicArticles.length / 6)} more clusters
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {topicArticles.length > 0 && (
                        <Badge variant="outline">
                          {topicArticles.length} available
                        </Badge>
                      )}
                      {clusteredCount > 0 && (
                        <Badge variant="default">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {clusteredCount} organized
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
