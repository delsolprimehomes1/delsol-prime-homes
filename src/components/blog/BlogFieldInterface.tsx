import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { processBlogFields } from '@/utils/blog-field-processor';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { BlogLinkSelector } from './BlogLinkSelector';
import { BlogImageManager } from './BlogImageManager';

interface QAArticle {
  id: string;
  title: string;
  slug: string;
  funnel_stage: string;
  topic: string;
}

interface BlogLink {
  targetId: string;
  targetType: 'QA' | 'Blog';
  relation: string;
}

interface BlogImage {
  filename: string;
  alt: string;
  caption?: string;
  description?: string;
}

export function BlogFieldInterface() {
  const { toast } = useToast();
  const [qaArticles, setQaArticles] = useState<QAArticle[]>([]);
  const [selectedQAId, setSelectedQAId] = useState<string>('');
  const [funnelStage, setFunnelStage] = useState<'TOFU' | 'MOFU' | 'BOFU'>('TOFU');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [links, setLinks] = useState<BlogLink[]>([]);
  const [images, setImages] = useState<BlogImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);

  // Fetch QA articles on mount
  useEffect(() => {
    fetchQAArticles();
  }, []);

  // Update word count when content changes
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
    // Clear validation errors when content changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [content]);

  // Auto-generate canonical URL from title
  useEffect(() => {
    if (title) {
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setCanonicalUrl(`https://delsolprimehomes.com/en/blog/${slug}`);
    }
  }, [title]);

  const fetchQAArticles = async () => {
    const { data, error } = await supabase
      .from('qa_articles')
      .select('id, title, slug, funnel_stage, topic')
      .order('funnel_stage', { ascending: true })
      .order('title', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load QA articles',
        variant: 'destructive'
      });
      return;
    }

    setQaArticles(data || []);
  };

  const validateBlog = (): boolean => {
    const errors: string[] = [];

    // Word count validation
    const ranges = {
      TOFU: [850, 1100],
      MOFU: [950, 1200],
      BOFU: [1200, 1500]
    };
    const [min, max] = ranges[funnelStage];
    if (wordCount < min || wordCount > max) {
      errors.push(`Word count must be between ${min}-${max} for ${funnelStage} stage (currently ${wordCount})`);
    }

    // Required fields
    if (!title.trim()) errors.push('Title is required');
    if (!content.trim()) errors.push('Content is required');
    if (!excerpt.trim()) errors.push('Excerpt is required');
    if (!canonicalUrl.trim()) errors.push('Canonical URL is required');
    if (!selectedQAId) errors.push('Must select a QA article for context');

    // Image validation
    if (images.length < 2) {
      errors.push('At least 2 images required (hero + content images)');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleGenerateContent = async () => {
    if (!selectedQAId) {
      toast({
        title: 'Selection Required',
        description: 'Please select a QA article first',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setValidationErrors([]); // Clear any existing validation errors
    
    try {
      const selectedQA = qaArticles.find(qa => qa.id === selectedQAId);
      if (!selectedQA) return;

      const ranges = {
        TOFU: '850-1100',
        MOFU: '950-1200',
        BOFU: '1200-1500'
      };

      const { data, error } = await supabase.functions.invoke('content-enhancer', {
        body: {
          content: `Generate a ${funnelStage} blog post based on QA article: ${selectedQA.title}. Target word count: ${ranges[funnelStage]} words.`,
          stage: funnelStage,
          topic: selectedQA.topic,
          contentType: 'blog'
        }
      });

      if (error) throw error;

      setContent(data.enhancedContent || '');
      setFunnelStage(selectedQA.funnel_stage as 'TOFU' | 'MOFU' | 'BOFU');
      
      toast({
        title: 'Content Generated',
        description: 'AI has generated initial blog content'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (!validateBlog()) {
      toast({
        title: 'Validation Failed',
        description: 'Please fix validation errors before publishing',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processBlogFields({
        title,
        content,
        excerpt,
        canonicalUrl,
        funnelStage,
        qaArticleId: selectedQAId,
        links,
        images,
        language: 'en'
      });

      if (result.success) {
        toast({
          title: 'Success',
          description: `Blog published successfully! ID: ${result.blogId}`
        });
        
        // Reset form
        setTitle('');
        setContent('');
        setExcerpt('');
        setLinks([]);
        setImages([]);
        setSelectedQAId('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish blog',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTargetRange = () => {
    const ranges = {
      TOFU: '850-1100',
      MOFU: '950-1200',
      BOFU: '1200-1500'
    };
    return ranges[funnelStage];
  };

  const getWordCountStatus = () => {
    const ranges = {
      TOFU: [850, 1100],
      MOFU: [950, 1200],
      BOFU: [1200, 1500]
    };
    const [min, max] = ranges[funnelStage];
    if (wordCount < min) return 'below';
    if (wordCount > max) return 'above';
    return 'good';
  };

  const getWordCountProgress = () => {
    const ranges = {
      TOFU: [850, 1100],
      MOFU: [950, 1200],
      BOFU: [1200, 1500]
    };
    const [min, max] = ranges[funnelStage];
    if (wordCount < min) return (wordCount / min) * 100;
    if (wordCount > max) return 100;
    return 100;
  };

  const getWordCountColor = () => {
    const status = getWordCountStatus();
    if (status === 'good') return 'text-green-600';
    if (status === 'below') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Field Interface</CardTitle>
          <CardDescription>
            Create TOFU/MOFU/BOFU blog posts linked to QA clusters with full schema support
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* QA Article Selection */}
      <Card>
        <CardHeader>
          <CardTitle>1. Select QA Article Context</CardTitle>
          <CardDescription>
            Choose a QA article to generate complementary blog content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>QA Article</Label>
            <Select value={selectedQAId} onValueChange={setSelectedQAId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a QA article..." />
              </SelectTrigger>
              <SelectContent>
                {qaArticles.map((qa) => (
                  <SelectItem key={qa.id} value={qa.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{qa.funnel_stage}</Badge>
                      {qa.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Blog Funnel Stage</Label>
            <Select value={funnelStage} onValueChange={(v) => setFunnelStage(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOFU">TOFU - Awareness (850-1100 words)</SelectItem>
                <SelectItem value="MOFU">MOFU - Consideration (950-1200 words)</SelectItem>
                <SelectItem value="BOFU">BOFU - Decision (1200-1500 words)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerateContent} 
            disabled={!selectedQAId || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Blog Content'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Blog Content */}
      <Card>
        <CardHeader>
          <CardTitle>2. Blog Content</CardTitle>
          <CardDescription className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Target: {getTargetRange()} words</span>
              <Badge variant={
                getWordCountStatus() === 'good' ? 'default' :
                getWordCountStatus() === 'below' ? 'secondary' : 'destructive'
              }>
                <span className={getWordCountColor()}>
                  {wordCount} words
                </span>
              </Badge>
            </div>
            {wordCount > 0 && (
              <div className="space-y-1">
                <Progress value={getWordCountProgress()} className="h-2" />
                <p className="text-xs">
                  {getWordCountStatus() === 'good' && '✓ Word count is within target range'}
                  {getWordCountStatus() === 'below' && `Need ${(() => {
                    const ranges = { TOFU: [850, 1100], MOFU: [950, 1200], BOFU: [1200, 1500] };
                    return ranges[funnelStage][0] - wordCount;
                  })()} more words to reach minimum`}
                  {getWordCountStatus() === 'above' && `Reduce by ${(() => {
                    const ranges = { TOFU: [850, 1100], MOFU: [950, 1200], BOFU: [1200, 1500] };
                    return wordCount - ranges[funnelStage][1];
                  })()} words to stay within range`}
                </p>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title..."
            />
          </div>

          <div className="space-y-2">
            <Label>Canonical URL</Label>
            <Input
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://delsolprimehomes.com/en/blog/..."
            />
          </div>

          <div className="space-y-2">
            <Label>Excerpt (160 chars max)</Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, 160))}
              placeholder="Brief summary for meta description..."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">{excerpt.length}/160</p>
          </div>

          <div className="space-y-2">
            <Label>Content (Markdown)</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content in markdown format..."
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Link Selector */}
      <Card>
        <CardHeader>
          <CardTitle>3. Link Selector (Funnel Mapping)</CardTitle>
          <CardDescription>
            Map this blog to QA articles or other blogs in the funnel journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlogLinkSelector 
            currentStage={funnelStage}
            links={links}
            onChange={setLinks}
          />
        </CardContent>
      </Card>

      {/* Image Management */}
      <Card>
        <CardHeader>
          <CardTitle>4. Image Management</CardTitle>
          <CardDescription>
            Add hero image and content images (minimum 2 required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlogImageManager 
            images={images}
            onChange={setImages}
            funnelStage={funnelStage}
            blogTitle={title}
          />
        </CardContent>
      </Card>

      {/* Publish Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handlePublish} 
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Publish Blog Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}