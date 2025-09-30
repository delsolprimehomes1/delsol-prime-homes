import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';
import { SEOFieldsSection } from './SEOFieldsSection';
import { DiagramPreview } from './DiagramPreview';

export interface ArticleField {
  title: string;
  content: string;
  diagram: string;
  tags: string[];
  locationFocus: string;
  targetAudience: string;
  intent: string;
}

interface ArticleFieldCardProps {
  index: number;
  stage: 'TOFU' | 'MOFU' | 'BOFU';
  article: ArticleField;
  onChange: (article: ArticleField) => void;
}

export const ArticleFieldCard = ({ index, stage, article, onChange }: ArticleFieldCardProps) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  const isComplete = article.title && article.content;
  const stageColors = {
    TOFU: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    MOFU: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    BOFU: 'bg-green-500/10 text-green-700 dark:text-green-300',
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-2">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <CardTitle className="text-lg">
                  {stage} Article {index + 1}
                </CardTitle>
                <Badge className={stageColors[stage]}>{stage}</Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {article.title && (
              <p className="text-sm text-muted-foreground mt-2">{article.title}</p>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor={`${stage}-${index}-title`}>Article Title *</Label>
              <Input
                id={`${stage}-${index}-title`}
                value={article.title}
                onChange={(e) => onChange({ ...article, title: e.target.value })}
                placeholder="Enter the question or article title"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor={`${stage}-${index}-content`}>Content *</Label>
              <Textarea
                id={`${stage}-${index}-content`}
                value={article.content}
                onChange={(e) => onChange({ ...article, content: e.target.value })}
                placeholder="## Short Explanation&#10;...&#10;&#10;## Detailed Explanation&#10;...&#10;&#10;## Tip&#10;..."
                rows={12}
                className="mt-1.5 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {article.content.length} characters
              </p>
            </div>

            <DiagramPreview
              value={article.diagram}
              onChange={(diagram) => onChange({ ...article, diagram })}
              articleTitle={article.title}
              articleContent={article.content}
              funnelStage={stage}
              tags={article.tags}
            />

            <SEOFieldsSection
              tags={article.tags}
              locationFocus={article.locationFocus}
              targetAudience={article.targetAudience}
              intent={article.intent}
              onTagsChange={(tags) => onChange({ ...article, tags })}
              onLocationFocusChange={(locationFocus) => onChange({ ...article, locationFocus })}
              onTargetAudienceChange={(targetAudience) => onChange({ ...article, targetAudience })}
              onIntentChange={(intent) => onChange({ ...article, intent })}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
