import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle2, Circle, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { SEOFieldsSection } from './SEOFieldsSection';
import { DiagramPreview } from './DiagramPreview';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ArticleField {
  title: string;
  content: string;
  diagram: string;
  diagramAltText?: string;
  diagramTitle?: string;
  diagramDescription?: string;
  diagramKeywords?: string[];
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
  language?: string;
}

export const ArticleFieldCard = ({ index, stage, article, onChange, language = 'en' }: ArticleFieldCardProps) => {
  const [isOpen, setIsOpen] = useState(index === 0);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const wordCount = article.content.trim() ? article.content.trim().split(/\s+/).length : 0;
  const meetsMinimum = wordCount >= 800;
  const isComplete = article.title && article.content;
  
  const stageColors = {
    TOFU: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    MOFU: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    BOFU: 'bg-green-500/10 text-green-700 dark:text-green-300',
  };

  const getWordCountColor = () => {
    if (wordCount < 800) return 'text-destructive';
    if (wordCount >= 800 && wordCount <= 1200) return 'text-green-600 dark:text-green-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      en: '🇬🇧', es: '🇪🇸', nl: '🇳🇱', fr: '🇫🇷', de: '🇩🇪',
      pl: '🇵🇱', sv: '🇸🇪', da: '🇩🇰', hu: '🇭🇺', no: '🇳🇴', fi: '🇫🇮'
    };
    return flags[lang] || '🌐';
  };

  const handleAIEnhance = async () => {
    if (!article.title || !article.content) {
      toast.error('Please add title and content first');
      return;
    }

    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-enhancer', {
        body: {
          title: article.title,
          content: article.content,
          stage,
          topic: article.tags?.[0] || 'Property',
          language,
          locationFocus: article.locationFocus || 'Costa del Sol',
          targetAudience: article.targetAudience || 'International buyers',
          tags: article.tags,
        },
      });

      if (error) throw error;

      if (data?.enhancedContent) {
        onChange({ ...article, content: data.enhancedContent });
        toast.success(`Content enhanced to ${data.wordCount} words`);
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Failed to enhance content');
    } finally {
      setIsEnhancing(false);
    }
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
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-muted-foreground">{article.title}</p>
                <Badge variant="outline" className="text-xs">
                  {getLanguageFlag(language)} {language.toUpperCase()}
                </Badge>
              </div>
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
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor={`${stage}-${index}-content`}>Content *</Label>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${getWordCountColor()}`}>
                    {wordCount} words {meetsMinimum ? '✓' : ''}
                  </span>
                  {!meetsMinimum && wordCount > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAIEnhance}
                      disabled={isEnhancing}
                      className="gap-2"
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          AI Enhance to 800+ words
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                id={`${stage}-${index}-content`}
                value={article.content}
                onChange={(e) => onChange({ ...article, content: e.target.value })}
                placeholder="## Short Explanation&#10;...&#10;&#10;## Detailed Explanation&#10;...&#10;&#10;## Tip&#10;..."
                rows={12}
                className="mt-1.5 font-mono text-sm"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {article.content.length} characters
                </p>
                {!meetsMinimum && wordCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="w-3 h-3" />
                    Minimum 800 words required
                  </div>
                )}
              </div>
            </div>

            <DiagramPreview
              value={article.diagram}
              onChange={(diagram) => onChange({ ...article, diagram })}
              articleTitle={article.title}
              articleContent={article.content}
              funnelStage={stage}
              tags={article.tags}
              altText={article.diagramAltText}
              onAltTextChange={(diagramAltText) => onChange({ ...article, diagramAltText })}
              titleAttr={article.diagramTitle}
              onTitleAttrChange={(diagramTitle) => onChange({ ...article, diagramTitle })}
              description={article.diagramDescription}
              onDescriptionChange={(diagramDescription) => onChange({ ...article, diagramDescription })}
              keywords={article.diagramKeywords}
              onKeywordsChange={(diagramKeywords) => onChange({ ...article, diagramKeywords })}
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
