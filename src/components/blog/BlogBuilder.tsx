import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Image, Wand2, Eye, Save, FileText } from 'lucide-react';
import { BlogPreview } from './BlogPreview';
import { getTemplateForStage, generateGuidedContent, type FunnelStage } from '@/utils/blog-content-templates';
import { validateContentQuality } from '@/utils/blog-content-enhancer';
import { AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category_key: string;
  language: string;
  funnel_stage: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  custom_cta_text: string;
  custom_cta_url: string;
  image_alt: string;
  custom_image_prompt: string;
}

const INITIAL_FORM_DATA: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: 'DelSolPrimeHomes',
  category_key: 'real-estate-guides',
  language: 'en',
  funnel_stage: 'TOFU',
  tags: [],
  meta_title: '',
  meta_description: '',
  custom_cta_text: '',
  custom_cta_url: '',
  image_alt: '',
  custom_image_prompt: ''
};

export const BlogBuilder: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<BlogFormData>(INITIAL_FORM_DATA);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [humanizeToggle, setHumanizeToggle] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [tagInput, setTagInput] = useState('');
  const [contentQuality, setContentQuality] = useState({ isValid: true, warnings: [] as string[], score: 100 });
  const [showTemplateGuide, setShowTemplateGuide] = useState(false);

  const handleInputChange = (field: keyof BlogFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }

    // Validate content quality when content changes
    if (field === 'content' && typeof value === 'string') {
      const quality = validateContentQuality(value, formData.funnel_stage as FunnelStage);
      setContentQuality(quality);
    }
  };

  const loadTemplate = () => {
    if (!formData.title) {
      toast({
        title: "Title Required",
        description: "Please enter a blog title first",
        variant: "destructive"
      });
      return;
    }

    const template = generateGuidedContent(
      formData.funnel_stage as FunnelStage,
      formData.title
    );
    
    handleInputChange('content', template);
    setShowTemplateGuide(true);
    
    toast({
      title: "Template Loaded",
      description: `${formData.funnel_stage} content template with guidance applied`
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const generateImage = async () => {
    if (!formData.title && !formData.content) {
      toast({
        title: "Error",
        description: "Please add a title and content before generating an image",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-image', {
        body: {
          blogTitle: formData.title,
          blogContent: formData.content,
          customPrompt: formData.custom_image_prompt
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedImageUrl(data.imageUrl);
        toast({
          title: "Image Generated",
          description: "AI-generated hero image created successfully!"
        });
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const humanizeContent = async () => {
    if (!formData.content) {
      toast({
        title: "Error",
        description: "Please add content before humanizing",
        variant: "destructive"
      });
      return;
    }

    setIsHumanizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('humanize-content', {
        body: {
          content: formData.content,
          title: formData.title
        }
      });

      if (error) throw error;

      if (data.humanizedContent) {
        handleInputChange('content', data.humanizedContent);
        toast({
          title: "Content Humanized",
          description: "Content has been made more conversational and engaging!"
        });
      }
    } catch (error) {
      console.error('Error humanizing content:', error);
      toast({
        title: "Error",
        description: "Failed to humanize content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsHumanizing(false);
    }
  };

  const generateSEOMetadata = () => {
    if (!formData.title || !formData.content) return;

    // Auto-generate meta title if empty
    if (!formData.meta_title) {
      const metaTitle = formData.title.length > 50 
        ? formData.title.substring(0, 50) + '...' 
        : formData.title;
      handleInputChange('meta_title', metaTitle);
    }

    // Auto-generate meta description if empty
    if (!formData.meta_description) {
      const firstParagraph = formData.content.split('\n').find(p => p.trim().length > 20);
      if (firstParagraph) {
        const metaDesc = firstParagraph.length > 150 
          ? firstParagraph.substring(0, 150) + '...' 
          : firstParagraph;
        handleInputChange('meta_description', metaDesc);
      }
    }

    // Auto-generate image alt text
    if (!formData.image_alt && formData.title) {
      handleInputChange('image_alt', `${formData.title} - DelSolPrimeHomes Blog`);
    }
  };

  const saveBlog = async (status: 'draft' | 'published' = 'draft') => {
    if (!formData.title || !formData.content || !formData.slug) {
      toast({
        title: "Error",
        description: "Please fill in title, content, and slug",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Generate SEO metadata before saving
      generateSEOMetadata();

      // Calculate reading time
      const wordsPerMinute = 200;
      const wordCount = formData.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / wordsPerMinute);

      const blogData = {
        ...formData,
        featured_image: generatedImageUrl || '/assets/blog/default-hero.webp',
        ai_generated_image: !!generatedImageUrl,
        reading_time_minutes: readingTime,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('blog_posts')
        .insert([blogData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Blog ${status === 'published' ? 'published' : 'saved as draft'} successfully!`
      });

      // Reset form
      setFormData(INITIAL_FORM_DATA);
      setGeneratedImageUrl('');
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: "Error",
        description: "Failed to save blog. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Blog Builder</h1>
        <p className="text-muted-foreground">Create engaging blog posts with AI-powered images and content optimization</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Core blog post details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter blog title..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="url-friendly-slug"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Brief description of the blog post..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Content</CardTitle>
                      <CardDescription>Write your blog post content in Markdown</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={loadTemplate}
                        variant="outline"
                        size="sm"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Load Template
                      </Button>
                      <Switch
                        checked={humanizeToggle}
                        onCheckedChange={setHumanizeToggle}
                      />
                      <Label>AI Humanizer</Label>
                      <Button
                        onClick={humanizeContent}
                        disabled={isHumanizing || !humanizeToggle}
                        variant="outline"
                        size="sm"
                      >
                        {isHumanizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        Humanize
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showTemplateGuide && (
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertTitle>Template Guidance</AlertTitle>
                      <AlertDescription>
                        {getTemplateForStage(formData.funnel_stage as FunnelStage).guidance[0]}
                      </AlertDescription>
                    </Alert>
                  )}

                  {contentQuality.warnings.length > 0 && (
                    <Alert variant={contentQuality.score < 60 ? "destructive" : "default"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Content Quality: {contentQuality.score}/100</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          {contentQuality.warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm">{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {contentQuality.score >= 80 && formData.content && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Excellent Content Structure!</AlertTitle>
                      <AlertDescription>
                        Your content follows the enhanced blog structure and is optimized for AI/voice search.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your blog content here using Markdown formatting..."
                    rows={20}
                    className="font-mono"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Image Generator</CardTitle>
                  <CardDescription>Generate hero image with AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="custom_image_prompt">Custom Prompt (Optional)</Label>
                    <Textarea
                      id="custom_image_prompt"
                      value={formData.custom_image_prompt}
                      onChange={(e) => handleInputChange('custom_image_prompt', e.target.value)}
                      placeholder="Custom image description..."
                      rows={3}
                    />
                  </div>
                  
                  <Button
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                    className="w-full"
                  >
                    {isGeneratingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Image className="h-4 w-4 mr-2" />
                    )}
                    Generate Image
                  </Button>

                  {generatedImageUrl && (
                    <div className="space-y-2">
                      <img 
                        src={generatedImageUrl} 
                        alt="Generated hero image" 
                        className="w-full rounded-md"
                      />
                      <div>
                        <Label htmlFor="image_alt">Image Alt Text</Label>
                        <Input
                          id="image_alt"
                          value={formData.image_alt}
                          onChange={(e) => handleInputChange('image_alt', e.target.value)}
                          placeholder="Describe the image for accessibility..."
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => handleInputChange('author', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="funnel_stage">Funnel Stage</Label>
                    <Select value={formData.funnel_stage} onValueChange={(value) => handleInputChange('funnel_stage', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TOFU">TOFU (Top of Funnel)</SelectItem>
                        <SelectItem value="MOFU">MOFU (Middle of Funnel)</SelectItem>
                        <SelectItem value="BOFU">BOFU (Bottom of Funnel)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tag..."
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button onClick={addTag} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO & CTA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      placeholder="SEO title (auto-generated if empty)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      placeholder="SEO description (auto-generated if empty)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom_cta_text">Custom CTA Text</Label>
                    <Input
                      id="custom_cta_text"
                      value={formData.custom_cta_text}
                      onChange={(e) => handleInputChange('custom_cta_text', e.target.value)}
                      placeholder="e.g., Get Your Free Market Report"
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom_cta_url">Custom CTA URL</Label>
                    <Input
                      id="custom_cta_url"
                      value={formData.custom_cta_url}
                      onChange={(e) => handleInputChange('custom_cta_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => saveBlog('draft')}
                  disabled={isSaving}
                  variant="outline"
                  className="w-full"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Draft
                </Button>
                <Button
                  onClick={() => saveBlog('published')}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <BlogPreview
            title={formData.title}
            content={formData.content}
            author={formData.author}
            featuredImage={generatedImageUrl}
            customCtaText={formData.custom_cta_text}
            customCtaUrl={formData.custom_cta_url}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};