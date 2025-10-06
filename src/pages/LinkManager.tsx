import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Link2, Search, Filter, RefreshCw, Loader2, Sparkles, Plus, AlertTriangle, CheckCircle, Activity, Zap } from 'lucide-react';
import { LinkPreviewModal } from '@/components/LinkPreviewModal';
import { BrokenLinkRepairModal } from '@/components/BrokenLinkRepairModal';
import { insertInlineLinks } from '@/utils/insertInlineLinks';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: 'blog' | 'qa';
  topic?: string;
  funnel_stage?: string;
  external_link_count: number;
  internal_link_count: number;
  ai_score?: number;
}

interface LinkHealth {
  healthy: number;
  broken: number;
  needsOptimization: number;
  avgAuthority: number;
}

export default function LinkManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'blog' | 'qa'>('all');
  const [linkStatus, setLinkStatus] = useState<'all' | 'missing-external' | 'missing-internal' | 'missing-both' | 'broken'>('all');
  const [loading, setLoading] = useState(true);
  const [generatingLinks, setGeneratingLinks] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [healthCheckRunning, setHealthCheckRunning] = useState(false);
  
  // Link health stats
  const [linkHealth, setLinkHealth] = useState<LinkHealth>({
    healthy: 0,
    broken: 0,
    needsOptimization: 0,
    avgAuthority: 0
  });
  
  // Link preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    external: any[];
    internal: any[];
    article: Article;
  } | null>(null);

  // Broken link repair modal state
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [brokenLinkReports, setBrokenLinkReports] = useState<any[]>([]);
  const [brokenLinkStats, setBrokenLinkStats] = useState<any>(null);
  const [scanningLinks, setScanningLinks] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
    fetchBrokenLinkStats();
    fetchLinkHealth();
  }, []);

  useEffect(() => {
    filterArticlesList();
  }, [articles, searchTerm, typeFilter, linkStatus, brokenLinkReports]);

  const fetchLinkHealth = async () => {
    try {
      const { data: externalLinks } = await supabase
        .from('external_links')
        .select('health_status, authority_score');

      if (externalLinks) {
        const healthy = externalLinks.filter(l => l.health_status === 'healthy').length;
        const broken = externalLinks.filter(l => l.health_status === 'broken').length;
        const needsOpt = externalLinks.filter(l => 
          l.health_status === 'unchecked' || (l.authority_score && l.authority_score < 70)
        ).length;
        const avgAuth = externalLinks.length > 0
          ? Math.round(externalLinks.reduce((sum, l) => sum + (l.authority_score || 0), 0) / externalLinks.length)
          : 0;

        setLinkHealth({
          healthy,
          broken,
          needsOptimization: needsOpt,
          avgAuthority: avgAuth
        });
      }
    } catch (error) {
      console.error('Error fetching link health:', error);
    }
  };

  const handleHealthCheck = async () => {
    setHealthCheckRunning(true);
    toast({
      title: "Running Health Check",
      description: "Testing all external links...",
    });

    try {
      const { data, error } = await supabase.functions.invoke('monitor-external-links');

      if (error) throw error;

      toast({
        title: "Health Check Complete",
        description: `${data.healthy} healthy, ${data.broken} broken, ${data.redirect} redirects`,
      });

      await fetchLinkHealth();
      await fetchArticles();
    } catch (error: any) {
      console.error('Error running health check:', error);
      toast({
        title: "Health Check Failed",
        description: error.message || "Failed to run health check",
        variant: "destructive",
      });
    } finally {
      setHealthCheckRunning(false);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data: blogs, error: blogsError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content, category_key, ai_score')
        .eq('published', true);

      if (blogsError) throw blogsError;

      const { data: qaArticles, error: qaError } = await supabase
        .from('qa_articles')
        .select('id, title, slug, content, topic, funnel_stage, ai_score')
        .eq('published', true);

      if (qaError) throw qaError;

      const { data: externalLinks } = await supabase
        .from('external_links')
        .select('article_id, article_type');

      const { data: internalLinks } = await supabase
        .from('internal_links')
        .select('source_article_id, source_article_type');

      const processedBlogs: Article[] = (blogs || []).map(blog => ({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        type: 'blog' as const,
        topic: blog.category_key,
        ai_score: blog.ai_score,
        external_link_count: externalLinks?.filter(l => l.article_id === blog.id && l.article_type === 'blog').length || 0,
        internal_link_count: internalLinks?.filter(l => l.source_article_id === blog.id && l.source_article_type === 'blog').length || 0,
      }));

      const processedQA: Article[] = (qaArticles || []).map(qa => ({
        id: qa.id,
        title: qa.title,
        slug: qa.slug,
        content: qa.content,
        type: 'qa' as const,
        topic: qa.topic,
        funnel_stage: qa.funnel_stage,
        ai_score: qa.ai_score,
        external_link_count: externalLinks?.filter(l => l.article_id === qa.id && l.article_type === 'qa').length || 0,
        internal_link_count: internalLinks?.filter(l => l.source_article_id === qa.id && l.source_article_type === 'qa').length || 0,
      }));

      setArticles([...processedBlogs, ...processedQA]);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBrokenLinkStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-and-fix-links', {
        body: { action: 'scan' }
      });

      if (error) throw error;

      setBrokenLinkStats(data.summary);
      setBrokenLinkReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching broken link stats:', error);
    }
  };

  const handleScanBrokenLinks = async () => {
    setScanningLinks(true);
    toast({
      title: "Scanning Links",
      description: "Analyzing all articles for broken links...",
    });
    
    try {
      await fetchBrokenLinkStats();
      toast({
        title: "Scan Complete",
        description: "Check the results in the dashboard",
      });
    } catch (error) {
      console.error('Error scanning links:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to scan for broken links",
        variant: "destructive",
      });
    } finally {
      setScanningLinks(false);
    }
  };

  const handleOpenRepairModal = (report: any) => {
    setSelectedReport(report);
    setRepairModalOpen(true);
  };

  const handleRepairComplete = () => {
    fetchBrokenLinkStats();
    fetchArticles();
  };

  const filterArticlesList = () => {
    let filtered = articles;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    if (linkStatus === 'missing-external') {
      filtered = filtered.filter(a => a.external_link_count === 0);
    } else if (linkStatus === 'missing-internal') {
      filtered = filtered.filter(a => a.internal_link_count === 0);
    } else if (linkStatus === 'missing-both') {
      filtered = filtered.filter(a => a.external_link_count === 0 && a.internal_link_count === 0);
    } else if (linkStatus === 'broken') {
      const articlesWithBrokenLinks = new Set(brokenLinkReports.map(r => r.articleId));
      filtered = filtered.filter(a => articlesWithBrokenLinks.has(a.id));
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.topic?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const generateInlineLinks = async (article: Article) => {
    setGeneratingLinks(true);

    try {
      toast({
        title: "Generating Links...",
        description: `AI is analyzing "${article.title}" and inserting inline links`,
      });

      const { data, error } = await supabase.functions.invoke('ai-link-insertion', {
        body: { 
          articleId: article.id, 
          articleType: article.type 
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Links Inserted Successfully",
          description: data.message || `✅ Added ${data.inserted} inline links (${data.skipped} skipped)`,
        });
        await fetchArticles();
      } else {
        throw new Error(data.error || 'Failed to generate links');
      }
    } catch (err: any) {
      console.error('Error generating inline links:', err);
      const errorMsg = err.message || 'Failed to generate inline links';
      toast({
        title: "Generation Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setGeneratingLinks(false);
    }
  };

  const generateAndPreviewLinks = async (article: Article) => {
    setGeneratingLinks(true);
    try {
      const [externalResult, internalResult] = await Promise.all([
        supabase.functions.invoke('generate-external-links', {
          body: {
            articleId: article.id,
            articleType: article.type,
            content: article.content,
            topic: article.topic
          }
        }),
        supabase.functions.invoke('generate-internal-links', {
          body: {
            articleId: article.id,
            articleType: article.type,
            content: article.content,
            topic: article.topic
          }
        })
      ]);

      if (externalResult.error) throw externalResult.error;
      if (internalResult.error) throw internalResult.error;

      setPreviewData({
        external: externalResult.data?.links || [],
        internal: internalResult.data?.links || [],
        article
      });
      setPreviewModalOpen(true);

    } catch (error) {
      console.error('Error generating links:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate links",
        variant: "destructive",
      });
    } finally {
      setGeneratingLinks(false);
    }
  };

  const handleApproveLinks = async (approvedExternal: any[], approvedInternal: any[]) => {
    if (!previewData) return;

    try {
      const { article } = previewData;
      const table = article.type === 'blog' ? 'blog_posts' : 'qa_articles';

      const { data: currentArticle } = await supabase
        .from(table)
        .select('content')
        .eq('id', article.id)
        .single();

      if (!currentArticle) throw new Error('Article not found');

      const allLinks = [
        ...approvedExternal.map(l => ({ 
          exactText: l.exactText || l.anchorText, 
          url: l.url 
        })),
        ...approvedInternal.map(l => ({ 
          exactText: l.exactText || l.anchorText, 
          url: `/${l.targetType === 'qa' ? 'qa' : 'blog'}/${l.targetSlug}` 
        }))
      ];

      const result = insertInlineLinks(currentArticle.content, allLinks);

      const { error: updateError } = await supabase
        .from(table)
        .update({
          content: result.updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (updateError) throw updateError;

      for (const link of approvedExternal) {
        await supabase.from('external_links').insert({
          article_id: article.id,
          article_type: article.type,
          url: link.url,
          anchor_text: link.anchorText,
          authority_score: link.authorityScore,
          verified: true,
          context_snippet: link.sentenceContext
        });
      }

      for (const link of approvedInternal) {
        const targetTable = link.targetType === 'blog' ? 'blog_posts' : 'qa_articles';
        const { data: targetArticle } = await supabase
          .from(targetTable)
          .select('id')
          .eq('slug', link.targetSlug)
          .single();

        if (targetArticle) {
          await supabase.from('internal_links').insert({
            source_article_id: article.id,
            source_article_type: article.type,
            target_article_id: targetArticle.id,
            target_article_type: link.targetType,
            anchor_text: link.anchorText,
            relevance_score: link.relevanceScore,
            verified: true,
            context_snippet: link.sentenceContext
          });
        }
      }

      toast({
        title: "Links Inserted Successfully",
        description: `Added ${result.linksInserted} inline links to "${article.title}"${result.skippedLinks.length > 0 ? ` (${result.skippedLinks.length} skipped)` : ''}`,
      });

      setPreviewModalOpen(false);
      setPreviewData(null);
      fetchArticles();

    } catch (error) {
      console.error('Error applying links:', error);
      toast({
        title: "Failed to Apply Links",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const generateBulkLinks = async () => {
    const articlesToProcess = filteredArticles.filter(
      a => a.external_link_count === 0 || a.internal_link_count === 0
    );

    if (articlesToProcess.length === 0) {
      toast({
        title: "No Articles to Process",
        description: "All filtered articles already have links",
      });
      return;
    }

    setBulkGenerating(true);
    let successCount = 0;

    for (const article of articlesToProcess) {
      try {
        await generateAndPreviewLinks(article);
        successCount++;
      } catch (error) {
        console.error(`Failed to process ${article.title}:`, error);
      }
    }

    setBulkGenerating(false);
    toast({
      title: "Bulk Processing Complete",
      description: `Processed ${successCount} of ${articlesToProcess.length} articles`,
    });
  };

  const healthScore = brokenLinkStats 
    ? Math.round(((brokenLinkStats.totalArticlesScanned - brokenLinkStats.articlesWithBrokenLinks) / brokenLinkStats.totalArticlesScanned) * 100)
    : 100;

  const linkHealthScore = linkHealth.healthy + linkHealth.broken > 0
    ? Math.round((linkHealth.healthy / (linkHealth.healthy + linkHealth.broken)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Link Manager | DelSol Prime Homes</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Link Manager</h1>
              <p className="text-muted-foreground mt-1">
                Generate, monitor, and optimize inline hyperlinks
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleHealthCheck}
                disabled={healthCheckRunning}
                variant="outline"
              >
                {healthCheckRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Health Check
                  </>
                )}
              </Button>
              <Button
                onClick={handleScanBrokenLinks}
                disabled={scanningLinks}
                variant="outline"
              >
                {scanningLinks ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan Broken Links
                  </>
                )}
              </Button>
              <Button
                onClick={generateBulkLinks}
                disabled={bulkGenerating}
                size="default"
              >
                {bulkGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Bulk Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-6">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Articles</div>
              <div className="text-2xl font-bold mt-2">{articles.length}</div>
            </Card>
            <Card className="p-4 border-green-500/50">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Healthy Links
              </div>
              <div className="text-2xl font-bold mt-2 text-green-600">{linkHealth.healthy}</div>
            </Card>
            <Card className="p-4 border-destructive/50">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Broken Links
              </div>
              <div className="text-2xl font-bold mt-2 text-destructive">{linkHealth.broken}</div>
            </Card>
            <Card className="p-4 border-blue-500/50">
              <div className="text-sm text-muted-foreground">Health Score</div>
              <div className="text-2xl font-bold mt-2">{linkHealthScore}%</div>
            </Card>
            <Card className="p-4 border-yellow-500/50">
              <div className="text-sm text-muted-foreground">Needs Optimization</div>
              <div className="text-2xl font-bold mt-2 text-yellow-600">{linkHealth.needsOptimization}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Avg Authority</div>
              <div className="text-2xl font-bold mt-2">{linkHealth.avgAuthority}/100</div>
            </Card>
            <Card className="p-4 border-destructive/50">
              <div className="text-sm text-muted-foreground">Broken Internal</div>
              <div className="text-2xl font-bold mt-2 text-destructive">
                {brokenLinkStats?.totalBrokenLinks || 0}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Internal Health</div>
              <div className="text-2xl font-bold mt-2">{healthScore}%</div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={linkStatus} onValueChange={(v: any) => setLinkStatus(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="missing-external">Missing External</SelectItem>
                <SelectItem value="missing-internal">Missing Internal</SelectItem>
                <SelectItem value="missing-both">Missing Both</SelectItem>
                <SelectItem value="broken">With Broken Links</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const brokenReport = brokenLinkReports.find(r => r.articleId === article.id);
              const hasBrokenLinks = brokenReport && brokenReport.brokenLinks && brokenReport.brokenLinks.length > 0;

              return (
                <Card key={article.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={article.type === 'blog' ? 'default' : 'secondary'}>
                          {article.type.toUpperCase()}
                        </Badge>
                        {hasBrokenLinks && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {brokenReport?.brokenLinks?.length || 0} Broken
                          </Badge>
                        )}
                        {article.ai_score && (
                          <Badge variant="outline">
                            AI: {article.ai_score}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          {article.external_link_count} external
                        </span>
                        <span className="flex items-center gap-1">
                          <Link2 className="h-4 w-4" />
                          {article.internal_link_count} internal
                        </span>
                        {article.topic && (
                          <span>Topic: {article.topic}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {hasBrokenLinks && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOpenRepairModal(brokenReport)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Repair
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateAndPreviewLinks(article)}
                        disabled={generatingLinks}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => generateInlineLinks(article)}
                        disabled={generatingLinks}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Auto-Insert
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {previewData && (
        <LinkPreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          externalLinks={previewData.external}
          internalLinks={previewData.internal}
          articleTitle={previewData.article.title}
          onApprove={handleApproveLinks}
        />
      )}

      {selectedReport && (
        <BrokenLinkRepairModal
          open={repairModalOpen}
          onClose={() => setRepairModalOpen(false)}
          report={selectedReport}
          onRepairComplete={handleRepairComplete}
        />
      )}
    </div>
  );
}
