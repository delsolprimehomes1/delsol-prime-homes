import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

interface ClusterMetadataFormProps {
  title: string;
  description: string;
  topic: string;
  language: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  generatedImageUrl?: string;
  imageGenerationPrompt?: string;
  articleTitle?: string;
  articleContent?: string;
  funnelStage?: string;
  tags?: string[];
  onMetadataGenerated?: () => void;
}

export const ClusterMetadataForm = ({
  title,
  description,
  topic,
  language,
  onTitleChange,
  onDescriptionChange,
  onTopicChange,
  onLanguageChange,
  generatedImageUrl,
  imageGenerationPrompt,
  articleTitle,
  articleContent,
  funnelStage,
  tags = [],
  onMetadataGenerated,
}: ClusterMetadataFormProps) => {
  const { isAdmin } = useUserRole();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateMetadata = async () => {
    if (!generatedImageUrl || !imageGenerationPrompt) {
      toast.error('Please generate an image first');
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-cluster-metadata', {
        body: {
          imageUrl: generatedImageUrl,
          imagePrompt: imageGenerationPrompt,
          articleTitle,
          articleContent,
          funnelStage,
          tags,
          language,
        }
      });

      if (error) {
        console.error('Generate metadata error:', error);
        toast.error('Failed to generate cluster metadata');
        return;
      }

      if (data?.success && data.metadata) {
        onTitleChange(data.metadata.clusterTitle);
        onDescriptionChange(data.metadata.clusterDescription);
        onTopicChange(data.metadata.topic);
        toast.success('Cluster metadata generated! Generating SEO fields...');
        
        // Trigger SEO generation after successful metadata generation
        if (onMetadataGenerated) {
          onMetadataGenerated();
        }
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
      toast.error('Failed to generate metadata');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && generatedImageUrl && imageGenerationPrompt && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateMetadata}
          disabled={isGenerating}
          className="w-full gap-2 mb-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Image...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Cluster Metadata from Image
            </>
          )}
        </Button>
      )}
      <div>
        <Label htmlFor="cluster-title">Cluster Title *</Label>
        <Input
          id="cluster-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., Internet & Connectivity for Remote Workers"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="cluster-description">Cluster Description *</Label>
        <Textarea
          id="cluster-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Brief description of what this cluster covers"
          rows={3}
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cluster-topic">Topic *</Label>
          <Input
            id="cluster-topic"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="e.g., Technology & Infrastructure"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="cluster-language">Language</Label>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger id="cluster-language" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇬🇧 English</SelectItem>
              <SelectItem value="es">🇪🇸 Español</SelectItem>
              <SelectItem value="nl">🇳🇱 Nederlands</SelectItem>
              <SelectItem value="fr">🇫🇷 Français</SelectItem>
              <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
              <SelectItem value="pl">🇵🇱 Polski</SelectItem>
              <SelectItem value="sv">🇸🇪 Svenska</SelectItem>
              <SelectItem value="da">🇩🇰 Dansk</SelectItem>
              <SelectItem value="hu">🇭🇺 Magyar</SelectItem>
              <SelectItem value="no">🇳🇴 Norsk</SelectItem>
              <SelectItem value="fi">🇫🇮 Suomi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
