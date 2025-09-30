import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface SEOFieldsSectionProps {
  tags: string[];
  locationFocus: string;
  targetAudience: string;
  intent: string;
  onTagsChange: (tags: string[]) => void;
  onLocationFocusChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
  onIntentChange: (value: string) => void;
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
}: SEOFieldsSectionProps) => {
  const [tagInput, setTagInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(t => t !== tagToRemove));
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
          <span className="text-sm font-medium">SEO Fields</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
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
