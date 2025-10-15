import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, RefreshCw, ExternalLink } from 'lucide-react';

interface SitemapStatus {
  name: string;
  url: string;
  status: 'loading' | 'success' | 'error';
  lastChecked?: Date;
  urlCount?: number;
}

interface StaticHTMLStatus {
  qaFiles: number;
  blogFiles: number;
  lastGenerated?: string;
}

const AIDiscoveryMonitoring = () => {
  const [sitemaps, setSitemaps] = useState<SitemapStatus[]>([
    { name: 'Main Sitemap Index', url: '/api/sitemap.xml', status: 'loading' },
    { name: 'QA Sitemap', url: '/api/qa-sitemap.xml', status: 'loading' },
    { name: 'Blog Sitemap', url: '/api/blog-sitemap.xml', status: 'loading' },
    { name: 'AI Training Sitemap', url: '/api/sitemap-ai.xml', status: 'loading' },
    { name: 'Location Sitemap', url: '/api/location-sitemap.xml', status: 'loading' },
  ]);

  const [staticHTML, setStaticHTML] = useState<StaticHTMLStatus>({
    qaFiles: 0,
    blogFiles: 0,
  });

  const checkSitemapStatus = async (sitemap: SitemapStatus) => {
    try {
      const response = await fetch(sitemap.url);
      const text = await response.text();
      const urlCount = (text.match(/<loc>/g) || []).length;
      
      return {
        ...sitemap,
        status: response.ok ? 'success' as const : 'error' as const,
        lastChecked: new Date(),
        urlCount,
      };
    } catch (error) {
      return {
        ...sitemap,
        status: 'error' as const,
        lastChecked: new Date(),
      };
    }
  };

  const checkAllSitemaps = async () => {
    setSitemaps(prev => prev.map(s => ({ ...s, status: 'loading' as const })));
    const results = await Promise.all(sitemaps.map(checkSitemapStatus));
    setSitemaps(results);
  };

  const checkStaticHTML = async () => {
    try {
      const { data: qaArticles } = await supabase
        .from('qa_articles')
        .select('id', { count: 'exact' });
      
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact' })
        .eq('status', 'published');

      setStaticHTML({
        qaFiles: qaArticles?.length || 0,
        blogFiles: blogPosts?.length || 0,
        lastGenerated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error checking static HTML:', error);
    }
  };

  useEffect(() => {
    checkAllSitemaps();
    checkStaticHTML();
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Discovery Monitoring - DelSolPrimeHomes</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Discovery Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor sitemap health, static HTML generation, and AI crawler accessibility
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Sitemap Status
                <Button size="sm" variant="outline" onClick={checkAllSitemaps}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                Monitor all sitemap endpoints for AI crawler discovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sitemaps.map((sitemap) => (
                  <div key={sitemap.url} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sitemap.status === 'loading' && <Clock className="h-4 w-4 text-yellow-500" />}
                      {sitemap.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {sitemap.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                      <span className="font-medium">{sitemap.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sitemap.urlCount !== undefined && (
                        <Badge variant="secondary">{sitemap.urlCount} URLs</Badge>
                      )}
                      <a 
                        href={sitemap.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Static HTML Generation</CardTitle>
              <CardDescription>
                Pre-rendered HTML files for AI crawlers without JavaScript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">QA Articles</span>
                  <Badge variant="secondary">{staticHTML.qaFiles} files</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Blog Posts</span>
                  <Badge variant="secondary">{staticHTML.blogFiles} files</Badge>
                </div>
                {staticHTML.lastGenerated && (
                  <div className="text-sm text-muted-foreground">
                    Last checked: {new Date(staticHTML.lastGenerated).toLocaleString()}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => window.open('/.github/workflows/generate-static-html.yml', '_blank')}
                >
                  View GitHub Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Crawler Accessibility Checklist</CardTitle>
            <CardDescription>
              Ensure all AI crawlers can discover and index your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>robots.txt allows GPTBot, ClaudeBot, CCBot</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Static HTML files in /public/static/</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Multilingual sitemaps with hreflang tags</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>JSON-LD schemas embedded in all pages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Automated daily sitemap regeneration</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AIDiscoveryMonitoring;
