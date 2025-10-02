import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Link2, Search, Filter, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { LinkPreviewModal } from '@/components/LinkPreviewModal';
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

export default function LinkManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'blog' | 'qa'>('all');
  const [linkStatus, setLinkStatus] = useState<'all' | 'missing-external' | 'missing-internal' | 'missing-both'>('all');
  const [loading, setLoading] = useState(true);
  const [generatingLinks, setGeneratingLinks] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  
  // Link preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    external: any[];
    internal: any[];
    article: Article;
  } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticlesList();
  }, [articles, searchTerm, typeFilter, linkStatus]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Fetch blog posts
      const { data: blogs, error: blogsError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content, category_key, ai_score')
        .eq('published', true);

      if (blogsError) throw blogsError;

      // Fetch QA articles
      const { data: qaArticles, error: qaError } = await supabase
        .from('qa_articles')
        .select('id, title, slug, content, topic, funnel_stage, ai_score')
        .eq('published', true);

      if (qaError) throw qaError;

      // Count links for each article
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
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.topic?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const generateAndPreviewLinks = async (article: Article) => {
    setGeneratingLinks(true);
    try {
      // Generate both external and internal links
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

      // Show preview modal
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

      // Fetch current content
      const { data: currentArticle } = await supabase
        .from(table)
        .select('content')
        .eq('id', article.id)
        .single();

      if (!currentArticle) throw new Error('Article not found');

      // Prepare links for insertion (use exactText or anchorText)
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

      // Insert links into content
      const result = insertInlineLinks(currentArticle.content, allLinks);

      // Update article in database
      const { error: updateError } = await supabase
        .from(table)
        .update({
          content: result.updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (updateError) throw updateError;

      // Store link metadata
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
        // Find target article ID
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
                Generate and insert inline hyperlinks automatically
              </p>
            </div>
            <Button
              onClick={generateBulkLinks}
              disabled={bulkGenerating}
              size="lg"
            >
              {bulkGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Bulk Generate
                </>
              )}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Articles</div>
              <div className="text-2xl font-bold mt-2">{articles.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Missing External Links</div>
              <div className="text-2xl font-bold mt-2 text-destructive">
                {articles.filter(a => a.external_link_count === 0).length}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Missing Internal Links</div>
              <div className="text-2xl font-bold mt-2 text-destructive">
                {articles.filter(a => a.internal_link_count === 0).length}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Fully Optimized</div>
              <div className="text-2xl font-bold mt-2 text-green-600">
                {articles.filter(a => a.external_link_count > 0 && a.internal_link_count > 0).length}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="blog">Blog Posts</SelectItem>
                <SelectItem value="qa">QA Articles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={linkStatus} onValueChange={(v: any) => setLinkStatus(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Articles</SelectItem>
                <SelectItem value="missing-external">Missing External</SelectItem>
                <SelectItem value="missing-internal">Missing Internal</SelectItem>
                <SelectItem value="missing-both">Missing Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Articles Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArticles.map(article => (
              <Card key={article.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{article.title}</h3>
                      <Badge variant="outline" className="shrink-0">
                        {article.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Topic: {article.topic || 'N/A'}</span>
                      <span className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {article.external_link_count} external
                      </span>
                      <span className="flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {article.internal_link_count} internal
                      </span>
                      {article.ai_score && (
                        <Badge variant="secondary">
                          AI Score: {Math.round(article.ai_score)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => generateAndPreviewLinks(article)}
                    disabled={generatingLinks}
                  >
                    {generatingLinks ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate & Preview Links
                  </Button>
                </div>
              </Card>
            ))}

            {filteredArticles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No articles found matching your filters
              </div>
            )}
          </div>
        )}
      </div>

      {previewData && (
        <LinkPreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewData(null);
          }}
          externalLinks={previewData.external}
          internalLinks={previewData.internal}
          articleTitle={previewData.article.title}
          onApprove={handleApproveLinks}
        />
      )}
    </div>
  );
}
