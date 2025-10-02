import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';
import { 
  parseMarkdownWithFrontmatter,
  combineMarkdown
} from '@/utils/markdown-frontmatter-parser';
import { validateComplete } from '@/utils/content-validator';
import { 
  syncMarkdownToSupabase,
  syncSupabaseToMarkdown,
  ContentType 
} from '@/utils/github-content-sync';
import { toast } from 'sonner';

export const MarkdownContentManager = () => {
  const [markdownInput, setMarkdownInput] = useState('');
  const [contentType, setContentType] = useState<ContentType>('qa');
  const [validation, setValidation] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const handleValidate = () => {
    try {
      const parsed = parseMarkdownWithFrontmatter(markdownInput);
      const result = validateComplete(parsed.frontmatter, parsed.content);
      setValidation(result);
      setPreview(parsed);
      
      if (result.valid) {
        toast.success('Content is valid!');
      } else {
        toast.error('Content has validation errors');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Validation failed');
      setValidation(null);
      setPreview(null);
    }
  };

  const handleSync = async () => {
    if (!validation?.valid) {
      toast.error('Please fix validation errors before syncing');
      return;
    }

    setSyncing(true);
    try {
      const result = await syncMarkdownToSupabase(markdownInput, contentType);
      
      if (result.success) {
        toast.success(result.message);
        setMarkdownInput('');
        setValidation(null);
        setPreview(null);
      } else {
        toast.error(result.message);
        if (result.errors) {
          result.errors.forEach(err => toast.error(err));
        }
      }
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async (contentId: string) => {
    try {
      const result = await syncSupabaseToMarkdown(contentId, contentType);
      
      if (result.success && result.markdown) {
        // Download as file
        const blob = new Blob([result.markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Content exported successfully');
      } else {
        toast.error(result.error || 'Export failed');
      }
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GitHub Markdown Content Manager</h1>
        <p className="text-muted-foreground mt-2">
          Import, validate, and sync content between GitHub markdown and Supabase
        </p>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">
            <Upload className="w-4 h-4 mr-2" />
            Import Markdown
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="w-4 h-4 mr-2" />
            Export to Markdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Markdown Content</CardTitle>
              <CardDescription>
                Paste your markdown content with YAML frontmatter below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <label className="text-sm font-medium">Content Type:</label>
                <div className="flex gap-2">
                  <Button
                    variant={contentType === 'qa' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setContentType('qa')}
                  >
                    QA Article
                  </Button>
                  <Button
                    variant={contentType === 'blog' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setContentType('blog')}
                  >
                    Blog Post
                  </Button>
                </div>
              </div>

              <Textarea
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
                placeholder="---&#10;title: 'Your Title'&#10;slug: 'your-slug'&#10;...&#10;---&#10;&#10;# Your Content"
                className="min-h-[400px] font-mono text-sm"
              />

              <div className="flex gap-2">
                <Button onClick={handleValidate} variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Validate
                </Button>
                <Button 
                  onClick={handleSync} 
                  disabled={!validation?.valid || syncing}
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Sync to Supabase
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {validation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Validation Results</span>
                  <Badge 
                    variant={validation.valid ? 'default' : 'destructive'}
                    className="text-base"
                  >
                    Score: <span className={getScoreColor(validation.score)}>{validation.score}/100</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validation.valid ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Content is valid and ready to sync!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please fix the errors below before syncing
                    </AlertDescription>
                  </Alert>
                )}

                {validation.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-destructive">Errors:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.errors.map((error: any, i: number) => (
                        <li key={i} className="text-sm text-destructive">
                          <strong>{error.field}:</strong> {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-600">Warnings:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.warnings.map((warning: any, i: number) => (
                        <li key={i} className="text-sm text-yellow-600">
                          <strong>{warning.field}:</strong> {warning.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {preview && (
                  <div className="space-y-2 mt-6">
                    <h4 className="font-semibold">Preview:</h4>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <div><strong>Title:</strong> {preview.frontmatter.title}</div>
                      <div><strong>Slug:</strong> {preview.frontmatter.slug}</div>
                      <div><strong>Language:</strong> {preview.frontmatter.language}</div>
                      <div><strong>Funnel Stage:</strong> {preview.frontmatter.funnelStage}</div>
                      <div><strong>Topic:</strong> {preview.frontmatter.topic}</div>
                      <div><strong>Word Count:</strong> {preview.content.split(/\s+/).length}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export to Markdown</CardTitle>
              <CardDescription>
                Export existing Supabase content to markdown format with frontmatter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  This feature will be integrated with the existing content management interface.
                  Use the BlogFieldInterface or ContentManager to export content.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
