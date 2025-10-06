import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClusterMetadataFormProps {
  title: string;
  description: string;
  topic: string;
  language: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
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
}: ClusterMetadataFormProps) => {
  return (
    <div className="space-y-4">
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
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
