import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info, Loader2, Image as ImageIcon, GitGraph, Code } from 'lucide-react';
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

  const generateAIVisual = async (type: 'image' | 'diagram') => {
    if (!articleTitle || !articleContent) {
      toast.error('Please add a title and content first');
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl('');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-image', {
        body: {
          title: articleTitle,
          content: articleContent,
          visualType: type,
          funnelStage,
          tags,
          customPrompt: type === 'diagram' 
            ? `Create a professional infographic or diagram that visualizes the key concepts from this article. Style: modern, clean, real estate themed with Costa del Sol branding colors.`
            : `Create a modern, professional hero image that represents this article about ${articleTitle}. Style: real estate luxury, Costa del Sol aesthetic, branded for DelSol Prime Homes.`
        }
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
        
        if (onAltTextChange) onAltTextChange(generatedAlt);
        if (onTitleAttrChange) onTitleAttrChange(generatedTitle);
        if (onDescriptionChange) onDescriptionChange(generatedDesc);
        if (onKeywordsChange) onKeywordsChange(generatedKeys);
        
        setShowMetadata(true);
        toast.success('AI metadata generated for accessibility & SEO');
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

          {showMetadata && (altText || titleAttr || description) && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                AI-Generated Metadata
              </div>
              <div className="space-y-3">
                {altText && (
                  <div>
                    <Label className="text-xs">Alt Text (Accessibility)</Label>
                    <Textarea
                      value={altText}
                      onChange={(e) => onAltTextChange?.(e.target.value)}
                      rows={2}
                      className="mt-1 text-sm"
                    />
                  </div>
                )}
                {titleAttr && (
                  <div>
                    <Label className="text-xs">Title Attribute (Hover Text)</Label>
                    <Textarea
                      value={titleAttr}
                      onChange={(e) => onTitleAttrChange?.(e.target.value)}
                      rows={2}
                      className="mt-1 text-sm"
                    />
                  </div>
                )}
                {description && (
                  <div>
                    <Label className="text-xs">Long Description (AI/LLM Understanding)</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => onDescriptionChange?.(e.target.value)}
                      rows={3}
                      className="mt-1 text-sm"
                    />
                  </div>
                )}
                {keywords && keywords.length > 0 && (
                  <div>
                    <Label className="text-xs">Keywords</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {keywords.map((kw, idx) => (
                        <span key={idx} className="text-xs bg-primary/10 px-2 py-1 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
