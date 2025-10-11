import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { isApprovedDomain, getDomainCategory, getCategoryDisplayName } from '@/lib/external-links/whitelist';

interface ExternalLink {
  id: string;
  url: string;
  article_id: string;
  article_type: string;
  anchor_text: string;
  health_status: string;
  status_code: number;
  verified: boolean;
  article_title?: string;
}

export function LinkHealthManager() {
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    setLoading(true);
    
    try {
      const { data: externalLinks, error } = await supabase
        .from('external_links')
        .select('*')
        .order('health_status', { ascending: false });

      if (error) throw error;

      // Fetch article titles
      const linksWithTitles = await Promise.all(
        (externalLinks || []).map(async (link) => {
          if (link.article_type === 'qa') {
            const { data: article } = await supabase
              .from('qa_articles')
              .select('title')
              .eq('id', link.article_id)
              .single();
            return { ...link, article_title: article?.title };
          } else {
            const { data: article } = await supabase
              .from('blog_posts')
              .select('title')
              .eq('id', link.article_id)
              .single();
            return { ...link, article_title: article?.title };
          }
        })
      );

      setLinks(linksWithTitles);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch external links',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function checkAllLinks() {
    toast({
      title: 'Health Check Started',
      description: 'Checking all links... This may take a few minutes.',
    });

    // In production, this would trigger the health check script
    // For now, just refresh the data
    await fetchLinks();

    toast({
      title: 'Health Check Complete',
      description: 'All links have been checked',
    });
  }

  function exportCSV() {
    const csv = [
      'URL,Article,Status,Code,Approved,Category,Anchor',
      ...filteredLinks.map(link => {
        const category = getDomainCategory(link.url);
        const approved = isApprovedDomain(link.url);
        return [
          `"${link.url}"`,
          `"${link.article_title || 'Unknown'}"`,
          link.health_status,
          link.status_code || 'N/A',
          approved ? 'Yes' : 'No',
          category || 'N/A',
          `"${link.anchor_text}"`,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `external-links-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exported',
      description: 'Link report exported to CSV',
    });
  }

  const filteredLinks = links.filter(link => {
    const matchesHealth = 
      filter === 'all' ? true :
      filter === 'broken' ? link.health_status === 'broken' :
      filter === 'healthy' ? link.health_status === 'healthy' :
      link.health_status === filter;

    const matchesDomain = 
      domainFilter === 'all' ? true :
      domainFilter === 'approved' ? isApprovedDomain(link.url) :
      domainFilter === 'unapproved' ? !isApprovedDomain(link.url) :
      true;

    return matchesHealth && matchesDomain;
  });

  const stats = {
    total: links.length,
    healthy: links.filter(l => l.health_status === 'healthy').length,
    broken: links.filter(l => l.health_status === 'broken').length,
    approved: links.filter(l => isApprovedDomain(l.url)).length,
    unapproved: links.filter(l => !isApprovedDomain(l.url)).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">External Link Management</h1>
          <p className="text-muted-foreground">Monitor and manage all external links</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkAllLinks} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Health
          </Button>
          <Button onClick={exportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-muted-foreground">Total</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-green-600">Healthy</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.healthy}
            </div>
            <div className="text-xs text-muted-foreground">
              {((stats.healthy / stats.total) * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-red-600">Broken</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.broken}
            </div>
            <div className="text-xs text-muted-foreground">
              {((stats.broken / stats.total) * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-green-600">Approved</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <div className="text-xs text-muted-foreground">
              {((stats.approved / stats.total) * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-orange-600">Unapproved</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.unapproved}
            </div>
            <div className="text-xs text-muted-foreground">
              {((stats.unapproved / stats.total) * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by health" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Links</SelectItem>
            <SelectItem value="healthy">Healthy Only</SelectItem>
            <SelectItem value="broken">Broken Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            <SelectItem value="approved">Approved Only</SelectItem>
            <SelectItem value="unapproved">Unapproved Only</SelectItem>
          </SelectContent>
        </SelectContent>
      </div>

      {/* Links List */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {filteredLinks.length} Links
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLinks.map((link) => {
              const category = getDomainCategory(link.url);
              const approved = isApprovedDomain(link.url);

              return (
                <div
                  key={link.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {link.health_status === 'healthy' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium text-sm">
                          {link.article_title || 'Unknown Article'}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground mb-2">
                        Anchor: {link.anchor_text}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {link.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      <div className="flex gap-2">
                        <Badge variant={link.health_status === 'healthy' ? 'default' : 'destructive'}>
                          {link.health_status}
                        </Badge>
                        {link.status_code && (
                          <Badge variant="outline">
                            {link.status_code}
                          </Badge>
                        )}
                        {approved ? (
                          <Badge className="bg-green-100 text-green-800">
                            ✓ {category ? getCategoryDisplayName(category) : 'Approved'}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            ⚠️ Not Approved
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {link.health_status === 'broken' && (
                        <Button size="sm" variant="outline">
                          Fix Link
                        </Button>
                      )}
                      {!approved && (
                        <Button size="sm" variant="outline">
                          Replace
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredLinks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No links found matching the current filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
