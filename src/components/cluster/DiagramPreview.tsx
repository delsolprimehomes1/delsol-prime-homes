import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Info, Loader2, Image as ImageIcon, GitGraph, Code, Eye, ChevronDown, X, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiagramPreviewProps {
  value: string;
  onChange: (value: string) => void;
  articleTitle: string;
  articleContent: string;
  funnelStage: string;
  tags: string[];
  altText?: string;
  onAltTextChange?: (altText: string) => void;
  titleAttr?: string;
  onTitleAttrChange?: (title: string) => void;
  description?: string;
  onDescriptionChange?: (description: string) => void;
  keywords?: string[];
  onKeywordsChange?: (keywords: string[]) => void;
}

export const DiagramPreview = ({ 
  value, 
  onChange, 
  articleTitle, 
  articleContent, 
  funnelStage,
  tags,
  altText = '',
  onAltTextChange,
  titleAttr = '',
  onTitleAttrChange,
  description = '',
  onDescriptionChange,
  keywords = [],
  onKeywordsChange
}: DiagramPreviewProps) => {
  const [visualType, setVisualType] = useState<'ai-image' | 'ai-diagram' | 'mermaid'>('mermaid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [useCustomPrompt, setUseCustomPrompt] = useState<boolean>(false);
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [originalMetadata, setOriginalMetadata] = useState<{
    altText: string;
    titleAttr: string;
    description: string;
    keywords: string[];
  } | null>(null);

  const generateAIVisual = async (type: 'image' | 'diagram') => {
    if (!articleTitle || !articleContent) {
      toast.error('Please add a title and content first');
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl('');
    
    try {
      const requestBody: any = {
        title: articleTitle,
        content: articleContent,
        visualType: type,
        funnelStage,
        tags,
      };

      // Only include customPrompt if enabled and not empty
      if (useCustomPrompt && customPrompt.trim().length >= 50) {
        requestBody.customPrompt = customPrompt.trim();
      }

      const { data, error } = await supabase.functions.invoke('generate-blog-image', {
        body: requestBody
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast.error(error.message || `Failed to generate AI ${type}`);
        return;
      }

      if (!data?.success) {
        console.error('Generation failed:', data);
        const errorMsg = data?.details || data?.error || `Failed to generate AI ${type}`;
        toast.error(errorMsg);
        return;
      }

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        onChange(data.imageUrl);
        toast.success(`AI ${type} generated successfully! Use "Generate Metadata" button if you need new metadata.`);
      }
    } catch (error) {
      console.error('Error generating AI visual:', error);
      toast.error(error instanceof Error ? error.message : `Failed to generate AI ${type}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeVisualMetadata = async (imageUrl: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-visual-content', {
        body: {
          imageUrl,
          articleTitle,
          articleContent,
          funnelStage,
          tags,
        }
      });

      if (error) {
        console.error('Metadata analysis error:', error);
        toast.error('Failed to analyze image metadata');
        return;
      }

      if (data?.success && data.metadata) {
        const { altText: generatedAlt, title: generatedTitle, description: generatedDesc, keywords: generatedKeys } = data.metadata;
        
        // Store original AI-generated metadata
        setOriginalMetadata({
          altText: generatedAlt,
          titleAttr: generatedTitle,
          description: generatedDesc,
          keywords: generatedKeys,
        });
        
        if (onAltTextChange) onAltTextChange(generatedAlt);
        if (onTitleAttrChange) onTitleAttrChange(generatedTitle);
        if (onDescriptionChange) onDescriptionChange(generatedDesc);
        if (onKeywordsChange) onKeywordsChange(generatedKeys);
        
        setShowMetadata(true);
        toast.success('AI metadata generated for accessibility & SEO');
      } else {
        toast.error('No metadata generated. Please try again or enter manually.');
      }
    } catch (error) {
      console.error('Error analyzing visual metadata:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Visual Content Type</Label>
        <RadioGroup value={visualType} onValueChange={(v) => setVisualType(v as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ai-image" id="ai-image" />
            <Label htmlFor="ai-image" className="flex items-center gap-2 cursor-pointer">
              <ImageIcon className="h-4 w-4" />
              AI-Generated Image
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ai-diagram" id="ai-diagram" />
            <Label htmlFor="ai-diagram" className="flex items-center gap-2 cursor-pointer">
              <GitGraph className="h-4 w-4" />
              AI-Generated Diagram
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mermaid" id="mermaid" />
            <Label htmlFor="mermaid" className="flex items-center gap-2 cursor-pointer">
              <Code className="h-4 w-4" />
              Manual Mermaid Diagram
            </Label>
          </div>
        </RadioGroup>
      </div>

      {visualType === 'mermaid' && (
        <>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="graph TD&#10;    A[Start] --> B[Process]&#10;    B --> C[End]"
            rows={6}
            className="font-mono text-sm"
          />
          {value && (
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-2">Preview:</div>
              <pre className="text-xs overflow-x-auto">{value}</pre>
            </Card>
          )}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Use Mermaid syntax to create flowcharts, diagrams, or visual aids for this article.
            </AlertDescription>
          </Alert>
        </>
      )}

      {(visualType === 'ai-image' || visualType === 'ai-diagram') && (
        <div className="space-y-3">
          {/* Custom Prompt Section */}
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="use-custom-prompt" className="text-sm font-semibold">
                Use Custom Prompt
              </Label>
              <Switch
                id="use-custom-prompt"
                checked={useCustomPrompt}
                onCheckedChange={setUseCustomPrompt}
              />
            </div>

            {useCustomPrompt && (
              <div className="space-y-3">
                <div>
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value.slice(0, 1000))}
                    placeholder={
                      visualType === 'ai-image'
                        ? "Example: Professional real estate photography, luxury villa exterior, Costa del Sol Mediterranean style, sunset lighting, 16:9 composition"
                        : "Example: Step-by-step process diagram with numbered stages, infographic style, clean minimal layout, blue and gold accents, 2025 data"
                    }
                    rows={4}
                    className="text-sm resize-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${customPrompt.length < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {customPrompt.length}/1000 characters {customPrompt.length > 0 && customPrompt.length < 50 && '(minimum 50)'}
                    </span>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs space-y-2">
                    <p className="font-medium">Tips for great {visualType === 'ai-image' ? 'image' : 'diagram'} prompts:</p>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                      {visualType === 'ai-image' ? (
                        <>
                          <li>Describe the style: "luxury", "modern", "Mediterranean"</li>
                          <li>Include lighting: "sunset", "golden hour", "bright daylight"</li>
                          <li>Specify composition: "16:9", "aerial view", "exterior shot"</li>
                          <li>Add brand elements: "Costa del Sol aesthetic", "upscale"</li>
                        </>
                      ) : (
                        <>
                          <li>Specify diagram type: "flowchart", "infographic", "process diagram"</li>
                          <li>Include style notes: "minimal", "modern", "numbered stages"</li>
                          <li>Mention colors: "blue and gold", "brand colors", "professional"</li>
                          <li>Add data context: "2025 statistics", "step-by-step guide"</li>
                        </>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>

                {customPrompt.length > 0 && customPrompt.length < 50 && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-xs">
                      Prompt too short. Please write at least 50 characters for better results.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {!useCustomPrompt && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Smart auto-generation is enabled. AI will create a prompt based on your article title, content, funnel stage, and brand guidelines.
                </AlertDescription>
              </Alert>
            )}
          </Card>

          <Button
            onClick={() => generateAIVisual(visualType === 'ai-image' ? 'image' : 'diagram')}
            disabled={isGenerating || !articleTitle || !articleContent}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                {visualType === 'ai-image' ? <ImageIcon className="h-4 w-4 mr-2" /> : <GitGraph className="h-4 w-4 mr-2" />}
                Generate AI {visualType === 'ai-image' ? 'Image' : 'Diagram'}
              </>
            )}
          </Button>

          {generatedImageUrl && (
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-2">Generated Visual:</div>
              <img 
                src={generatedImageUrl} 
                alt={altText || "Generated visual"} 
                title={titleAttr}
                className="w-full h-auto rounded-md"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIVisual(visualType === 'ai-image' ? 'image' : 'diagram')}
                  className="flex-1"
                  disabled={isGenerating}
                >
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => analyzeVisualMetadata(generatedImageUrl)}
                  className="flex-1"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Generate Metadata'
                  )}
                </Button>
              </div>
            </Card>
          )}

{showMetadata && (
            <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  AI-Generated Metadata
                </div>
                {originalMetadata && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (onAltTextChange) onAltTextChange(originalMetadata.altText);
                      if (onTitleAttrChange) onTitleAttrChange(originalMetadata.titleAttr);
                      if (onDescriptionChange) onDescriptionChange(originalMetadata.description);
                      if (onKeywordsChange) onKeywordsChange(originalMetadata.keywords);
                      toast.success('Restored AI-generated metadata');
                    }}
                    className="text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>

              <div className="space-y-5">
                {/* Accessibility Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      📋 Accessibility
                    </h4>
                    <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Required</Badge>
                  </div>

                  <div className="bg-background/50 p-3 rounded-lg space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs font-medium">Alt Text</Label>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] ${
                            !altText ? 'text-destructive' :
                            altText.length < 50 ? 'text-orange-500' :
                            altText.length > 125 ? 'text-orange-500' :
                            'text-green-600'
                          }`}>
                            {altText.length}/125
                          </span>
                          {altText.length >= 50 && altText.length <= 125 && (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                      </div>
                      <Textarea
                        value={altText}
                        onChange={(e) => onAltTextChange?.(e.target.value.slice(0, 125))}
                        rows={2}
                        className="text-sm resize-none"
                        placeholder="Describe the image for screen readers..."
                      />
                      {!altText && (
                        <div className="flex items-center gap-1 mt-1 text-destructive text-[10px]">
                          <AlertTriangle className="h-3 w-3" />
                          Alt text is required for accessibility
                        </div>
                      )}
                      {altText && altText.length < 50 && (
                        <div className="flex items-center gap-1 mt-1 text-orange-600 text-[10px]">
                          <Info className="h-3 w-3" />
                          Recommended: 50-125 characters for better accessibility
                        </div>
                      )}
                      {altText.length > 125 && (
                        <div className="flex items-center gap-1 mt-1 text-orange-600 text-[10px]">
                          <AlertTriangle className="h-3 w-3" />
                          Alt text too long (max 125 chars)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SEO & Discovery Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      🔍 SEO & Discovery
                    </h4>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">Optional</Badge>
                  </div>

                  <div className="bg-background/50 p-3 rounded-lg space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs font-medium">Title Attribute (hover text)</Label>
                        <span className="text-[10px] text-muted-foreground">
                          {titleAttr.length}/150
                        </span>
                      </div>
                      <Textarea
                        value={titleAttr}
                        onChange={(e) => onTitleAttrChange?.(e.target.value.slice(0, 150))}
                        rows={2}
                        className="text-sm resize-none"
                        placeholder="Additional context shown on hover..."
                      />
                      {titleAttr && altText && titleAttr.toLowerCase() === altText.toLowerCase() && (
                        <div className="flex items-center gap-1 mt-1 text-orange-600 text-[10px]">
                          <Info className="h-3 w-3" />
                          Title is same as alt text (redundant)
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Keywords (comma-separated)</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && keywordInput.trim()) {
                              e.preventDefault();
                              const newKeyword = keywordInput.trim();
                              if (!keywords.includes(newKeyword)) {
                                onKeywordsChange?.([...keywords, newKeyword]);
                                setKeywordInput('');
                              } else {
                                toast.error('Keyword already exists');
                              }
                            }
                          }}
                          placeholder="Type keyword and press Enter..."
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
                              onKeywordsChange?.([...keywords, keywordInput.trim()]);
                              setKeywordInput('');
                            }
                          }}
                          disabled={!keywordInput.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {keywords.map((kw, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs pl-2 pr-1 py-0.5 flex items-center gap-1"
                          >
                            {kw}
                            <button
                              onClick={() => onKeywordsChange?.(keywords.filter((_, i) => i !== idx))}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {keywords.length === 0 && (
                          <span className="text-[10px] text-muted-foreground">No keywords added yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI/LLM Understanding Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      🧠 AI/LLM Understanding
                    </h4>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">Recommended</Badge>
                  </div>

                  <div className="bg-background/50 p-3 rounded-lg space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs font-medium">Long Description</Label>
                        <span className={`text-[10px] ${
                          description.length > 500 ? 'text-orange-500' : 'text-muted-foreground'
                        }`}>
                          {description.length}/500
                        </span>
                      </div>
                      <Textarea
                        value={description}
                        onChange={(e) => onDescriptionChange?.(e.target.value.slice(0, 500))}
                        rows={3}
                        className="text-sm resize-none"
                        placeholder="Detailed description for AI citation and image understanding..."
                      />
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <Info className="h-3 w-3" />
                        Used by AI/LLMs to cite and understand this image
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Final Output */}
                <Collapsible open={showPreview} onOpenChange={setShowPreview}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-3 w-3 mr-2" />
                      {showPreview ? 'Hide' : 'Preview'} Final Output
                      <ChevronDown className={`h-3 w-3 ml-2 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-3">
                    <div className="bg-background p-3 rounded-lg border">
                      <div className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        HTML Output
                      </div>
                      <pre className="text-[10px] overflow-x-auto text-foreground/80 whitespace-pre-wrap break-all">
{`<img 
  src="${generatedImageUrl || '[image-url]'}"
  alt="${altText || '[alt-text-required]'}"${titleAttr ? `\n  title="${titleAttr}"` : ''}${description ? `\n  aria-describedby="img-desc-${Date.now()}"` : ''}
/>
${description ? `<div id="img-desc-${Date.now()}" class="sr-only">
  ${description}
</div>` : ''}`}
                      </pre>
                    </div>

                    <div className="bg-background p-3 rounded-lg border">
                      <div className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        Schema.org JSON-LD
                      </div>
                      <pre className="text-[10px] overflow-x-auto text-foreground/80 whitespace-pre-wrap">
{JSON.stringify({
  "@type": "ImageObject",
  "url": generatedImageUrl || "[image-url]",
  "description": description || altText || "[description]",
  "name": titleAttr || articleTitle,
  ...(keywords.length > 0 && { "keywords": keywords.join(", ") })
}, null, 2)}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </Card>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              AI will create a {visualType === 'ai-image' ? 'branded image' : 'professional diagram'} based on your article content, 
              funnel stage, and DelSol Prime Homes branding.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};
