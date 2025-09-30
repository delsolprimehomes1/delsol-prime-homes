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
}

export const DiagramPreview = ({ 
  value, 
  onChange, 
  articleTitle, 
  articleContent, 
  funnelStage,
  tags 
}: DiagramPreviewProps) => {
  const [visualType, setVisualType] = useState<'ai-image' | 'ai-diagram' | 'mermaid'>('mermaid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');

  const generateAIVisual = async (type: 'image' | 'diagram') => {
    if (!articleTitle || !articleContent) {
      toast.error('Please add a title and content first');
      return;
    }

    setIsGenerating(true);
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

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        onChange(data.imageUrl);
        toast.success(`AI ${type} generated successfully!`);
      }
    } catch (error) {
      console.error('Error generating AI visual:', error);
      toast.error(`Failed to generate AI ${type}`);
    } finally {
      setIsGenerating(false);
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
                alt="Generated visual" 
                className="w-full h-auto rounded-md"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateAIVisual(visualType === 'ai-image' ? 'image' : 'diagram')}
                className="mt-2 w-full"
                disabled={isGenerating}
              >
                Regenerate
              </Button>
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
