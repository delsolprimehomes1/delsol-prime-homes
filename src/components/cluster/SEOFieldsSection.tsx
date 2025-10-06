import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';

interface SEOFieldsSectionProps {
  tags: string[];
  locationFocus: string;
  targetAudience: string;
  intent: string;
  onTagsChange: (tags: string[]) => void;
  onLocationFocusChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
  onIntentChange: (value: string) => void;
  // New props for AI generation
  articleTitle?: string;
  articleContent?: string;
  stage?: string;
  language?: string;
}

export const SEOFieldsSection = ({
  tags,
  locationFocus,
  targetAudience,
  intent,
  onTagsChange,
  onLocationFocusChange,
  onTargetAudienceChange,
  onIntentChange,
  articleTitle,
  articleContent,
  stage,
  language,
}: SEOFieldsSectionProps) => {
  const [tagInput, setTagInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isAdmin, loading: roleLoading } = useUserRole();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(t => t !== tagToRemove));
  };

  const handleGenerateSEO = async () => {
    if (!articleTitle || !articleContent) {
      toast({
        title: "Missing Information",
        description: "Please add article title and content first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-seo-fields', {
        body: {
          title: articleTitle,
          content: articleContent,
          stage: stage || 'TOFU',
          language: language || 'en',
        },
      });

      if (error) {
        console.error('Error generating SEO fields:', error);
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate SEO fields. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // Merge new tags with existing ones (avoid duplicates)
        const newTags = data.tags || [];
        const mergedTags = [...new Set([...tags, ...newTags])];
        onTagsChange(mergedTags);
        
        // Update other fields
        if (data.locationFocus) onLocationFocusChange(data.locationFocus);
        if (data.targetAudience) onTargetAudienceChange(data.targetAudience);
        if (data.intent) onIntentChange(data.intent);

        toast({
          title: "SEO Fields Generated",
          description: "AI has successfully generated SEO metadata for this article.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex-1 justify-between p-0 h-auto">
            <span className="text-sm font-medium">SEO Fields</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        {isAdmin && !roleLoading && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateSEO}
            disabled={isGenerating || !articleTitle || !articleContent}
            className="gap-2 text-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Generate
              </>
            )}
          </Button>
        )}
      </div>
      
      <CollapsibleContent className="space-y-4 mt-4">
        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add tag and press Enter"
            />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Location Focus</Label>
          <Input
            value={locationFocus}
            onChange={(e) => onLocationFocusChange(e.target.value)}
            placeholder="e.g., Costa del Sol – Torremolinos to Sotogrande"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Target Audience</Label>
          <Input
            value={targetAudience}
            onChange={(e) => onTargetAudienceChange(e.target.value)}
            placeholder="e.g., UK, Scottish & Irish buyers (45–70 years)"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Intent</Label>
          <Select value={intent} onValueChange={onIntentChange}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select intent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="informational">Informational</SelectItem>
              <SelectItem value="consideration">Consideration</SelectItem>
              <SelectItem value="decision">Decision-making</SelectItem>
              <SelectItem value="transactional">Transactional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
