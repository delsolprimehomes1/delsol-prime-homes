import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrokenLink {
  url: string;
  anchorText: string;
  articleType: 'blog' | 'qa';
  slug: string;
  exists: boolean;
}

interface LinkSuggestion {
  id: string;
  slug: string;
  title: string;
  topic: string;
  funnelStage: string;
  relevanceScore: number;
}

interface ArticleReport {
  articleId: string;
  articleType: 'blog' | 'qa';
  title: string;
  slug: string;
  brokenLinks: BrokenLink[];
  suggestions: Record<string, LinkSuggestion[]>;
}

interface BrokenLinkRepairModalProps {
  open: boolean;
  onClose: () => void;
  report: ArticleReport | null;
  onRepairComplete: () => void;
}

export function BrokenLinkRepairModal({ 
  open, 
  onClose, 
  report,
  onRepairComplete 
}: BrokenLinkRepairModalProps) {
  const [selectedReplacements, setSelectedReplacements] = useState<Record<string, LinkSuggestion>>({});
  const [isFixing, setIsFixing] = useState(false);

  if (!report) return null;

  const handleSelectReplacement = (brokenUrl: string, suggestion: LinkSuggestion) => {
    setSelectedReplacements(prev => ({
      ...prev,
      [brokenUrl]: suggestion
    }));
  };

  const handleFixLinks = async () => {
    if (Object.keys(selectedReplacements).length === 0) {
      toast.error('Please select at least one replacement');
      return;
    }

    setIsFixing(true);
    try {
      const replacements = Object.entries(selectedReplacements).map(([oldUrl, suggestion]) => {
        const brokenLink = report.brokenLinks.find(l => l.url === oldUrl);
        const newUrl = `/${report.articleType}/${suggestion.slug}`;
        
        return {
          oldUrl,
          newUrl,
          anchorText: brokenLink?.anchorText || ''
        };
      });

      const { data, error } = await supabase.functions.invoke('validate-and-fix-links', {
        body: {
          action: 'fix',
          articleId: report.articleId,
          articleType: report.articleType,
          replacements
        }
      });

      if (error) throw error;

      toast.success(`✅ Fixed ${data.replacementCount} broken links`);
      onRepairComplete();
      onClose();
      setSelectedReplacements({});
    } catch (error) {
      console.error('Error fixing links:', error);
      toast.error('Failed to fix broken links');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Repair Broken Links - {report.title}
          </DialogTitle>
          <DialogDescription>
            Found {report.brokenLinks.length} broken link{report.brokenLinks.length !== 1 ? 's' : ''} in this article. 
            Select replacements to fix them automatically.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {report.brokenLinks.map((brokenLink, index) => {
              const suggestions = report.suggestions[brokenLink.url] || [];
              const selected = selectedReplacements[brokenLink.url];

              return (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    {/* Broken Link Info */}
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          "{brokenLink.anchorText}"
                        </p>
                        <p className="text-sm text-muted-foreground break-all">
                          {brokenLink.url}
                        </p>
                        <Badge variant="destructive" className="mt-2">
                          404 - Slug not found
                        </Badge>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 ? (
                      <div className="ml-8 space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          AI Suggestions:
                        </p>
                        {suggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selected?.id === suggestion.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleSelectReplacement(brokenLink.url, suggestion)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{suggestion.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  /{brokenLink.articleType}/{suggestion.slug}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {suggestion.topic}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.funnelStage}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Match: {suggestion.relevanceScore}%
                                  </Badge>
                                </div>
                              </div>
                              {selected?.id === suggestion.id && (
                                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="ml-8 text-sm text-muted-foreground">
                        No suitable replacements found
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {Object.keys(selectedReplacements).length} of {report.brokenLinks.length} links selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isFixing}>
              Cancel
            </Button>
            <Button 
              onClick={handleFixLinks} 
              disabled={Object.keys(selectedReplacements).length === 0 || isFixing}
            >
              {isFixing ? (
                'Fixing...'
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Fix Selected Links
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
