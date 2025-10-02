import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Link, ExternalLink, Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  type: 'blog' | 'qa';
  topic?: string;
  funnel_stage?: string;
  content: string;
  external_links_count: number;
  internal_links_count: number;
  ai_score?: number;
}

const LinkManager = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'blog' | 'qa'>('all');
  const [filterLinkStatus, setFilterLinkStatus] = useState<'all' | 'no-external' | 'no-internal'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticlesList();
  }, [articles, searchTerm, filterType, filterLinkStatus]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Fetch blog posts
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content, category_key, ai_score')
        .eq('status', 'published');

      // Fetch QA articles
      const { data: qaArticles } = await supabase
        .from('qa_articles')
        .select('id, title, slug, content, topic, funnel_stage, ai_score')
        .eq('published', true);

      // Count external links
      const { data: externalLinks } = await supabase
        .from('external_links')
        .select('article_id, article_type');

      // Count internal links
      const { data: internalLinks } = await supabase
        .from('internal_links')
        .select('source_article_id, source_article_type');

      // Process blog posts
      const blogArticles: Article[] = (blogPosts || []).map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        type: 'blog' as const,
        topic: post.category_key,
        content: post.content,
        ai_score: post.ai_score,
        external_links_count: externalLinks?.filter(l => l.article_id === post.id && l.article_type === 'blog').length || 0,
        internal_links_count: internalLinks?.filter(l => l.source_article_id === post.id && l.source_article_type === 'blog').length || 0,
      }));

      // Process QA articles
      const qaArticlesList: Article[] = (qaArticles || []).map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        type: 'qa' as const,
        topic: article.topic,
        funnel_stage: article.funnel_stage,
        content: article.content,
        ai_score: article.ai_score,
        external_links_count: externalLinks?.filter(l => l.article_id === article.id && l.article_type === 'qa').length || 0,
        internal_links_count: internalLinks?.filter(l => l.source_article_id === article.id && l.source_article_type === 'qa').length || 0,
      }));

      setArticles([...blogArticles, ...qaArticlesList]);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch articles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterArticlesList = () => {
    let filtered = articles;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    // Filter by link status
    if (filterLinkStatus === 'no-external') {
      filtered = filtered.filter(a => a.external_links_count === 0);
    } else if (filterLinkStatus === 'no-internal') {
      filtered = filtered.filter(a => a.internal_links_count === 0);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.topic?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const generateLinks = async (article: Article, linkType: 'external' | 'internal' | 'both') => {
    setProcessing(article.id);
    try {
      if (linkType === 'external' || linkType === 'both') {
        const { error: extError } = await supabase.functions.invoke('generate-external-links', {
          body: {
            articleId: article.id,
            articleType: article.type,
            content: article.content,
            topic: article.topic
          }
        });

        if (extError) throw new Error(`External links: ${extError.message}`);
      }

      if (linkType === 'internal' || linkType === 'both') {
        const { error: intError } = await supabase.functions.invoke('generate-internal-links', {
          body: {
            articleId: article.id,
            articleType: article.type,
            content: article.content,
            topic: article.topic
          }
        });

        if (intError) throw new Error(`Internal links: ${intError.message}`);
      }

      toast({
        title: 'Success',
        description: `Link generation completed for "${article.title}"`,
      });

      // Refresh articles
      await fetchArticles();
    } catch (error) {
      console.error('Error generating links:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate links',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const generateBulkLinks = async () => {
    const articlesToProcess = filteredArticles.filter(
      a => a.external_links_count === 0 || a.internal_links_count === 0
    );

    if (articlesToProcess.length === 0) {
      toast({
        title: 'No Articles',
        description: 'No articles need link generation',
      });
      return;
    }

    setProcessing('bulk');

    let successCount = 0;
    let errorCount = 0;

    for (const article of articlesToProcess) {
      try {
        await generateLinks(article, 'both');
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setProcessing(null);
    
    toast({
      title: 'Bulk Generation Complete',
      description: `Processed ${articlesToProcess.length} articles. Success: ${successCount}, Errors: ${errorCount}`,
    });
  };

  return (
    <>
      <Helmet>
        <title>Link Manager | DelSol Prime Homes</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <h1 className="text-lg font-semibold">Link Manager</h1>
            <Button
              onClick={generateBulkLinks}
              disabled={processing !== null}
              variant="default"
            >
              {processing === 'bulk' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Links for All
                </>
              )}
            </Button>
          </div>
        </header>

        <main className="container py-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Link Generation Overview</CardTitle>
              <CardDescription>
                Automatically generate external and internal links for your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{articles.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">No External Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      {articles.filter(a => a.external_links_count === 0).length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">No Internal Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      {articles.filter(a => a.internal_links_count === 0).length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Fully Linked</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {articles.filter(a => a.external_links_count > 0 && a.internal_links_count > 0).length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Article Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="blog">Blog Posts</SelectItem>
                    <SelectItem value="qa">QA Articles</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterLinkStatus} onValueChange={(v: any) => setFilterLinkStatus(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Link Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Articles</SelectItem>
                    <SelectItem value="no-external">No External Links</SelectItem>
                    <SelectItem value="no-internal">No Internal Links</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead className="text-center">External Links</TableHead>
                        <TableHead className="text-center">Internal Links</TableHead>
                        <TableHead className="text-center">AI Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {article.type === 'blog' ? 'Blog' : 'QA'}
                            </Badge>
                          </TableCell>
                          <TableCell>{article.topic || '-'}</TableCell>
                          <TableCell className="text-center">
                            {article.external_links_count === 0 ? (
                              <XCircle className="h-4 w-4 text-destructive inline" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                            )}
                            <span className="ml-2">{article.external_links_count}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {article.internal_links_count === 0 ? (
                              <XCircle className="h-4 w-4 text-destructive inline" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                            )}
                            <span className="ml-2">{article.internal_links_count}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {article.ai_score ? Math.round(article.ai_score) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateLinks(article, 'external')}
                                disabled={processing !== null}
                              >
                                {processing === article.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ExternalLink className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateLinks(article, 'internal')}
                                disabled={processing !== null}
                              >
                                {processing === article.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Link className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => generateLinks(article, 'both')}
                                disabled={processing !== null}
                              >
                                Both
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default LinkManager;
