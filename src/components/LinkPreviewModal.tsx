import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Link2, Check, X } from 'lucide-react';

interface LinkSuggestion {
  exactText: string;
  url: string;
  reason?: string;
  authorityScore?: number;
  relevanceScore?: number;
  sentenceContext?: string;
  targetTitle?: string;
  targetType?: string;
}

interface LinkPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  externalLinks: LinkSuggestion[];
  internalLinks: LinkSuggestion[];
  articleTitle: string;
  onApprove: (approvedExternal: LinkSuggestion[], approvedInternal: LinkSuggestion[]) => void;
}

export function LinkPreviewModal({
  isOpen,
  onClose,
  externalLinks,
  internalLinks,
  articleTitle,
  onApprove
}: LinkPreviewModalProps) {
  const [selectedExternal, setSelectedExternal] = useState<Set<number>>(
    new Set(externalLinks.map((_, i) => i))
  );
  const [selectedInternal, setSelectedInternal] = useState<Set<number>>(
    new Set(internalLinks.map((_, i) => i))
  );

  const toggleExternal = (index: number) => {
    const newSet = new Set(selectedExternal);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedExternal(newSet);
  };

  const toggleInternal = (index: number) => {
    const newSet = new Set(selectedInternal);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedInternal(newSet);
  };

  const handleApprove = () => {
    const approvedExternal = externalLinks.filter((_, i) => selectedExternal.has(i));
    const approvedInternal = internalLinks.filter((_, i) => selectedInternal.has(i));
    onApprove(approvedExternal, approvedInternal);
  };

  const totalSelected = selectedExternal.size + selectedInternal.size;
  const totalLinks = externalLinks.length + internalLinks.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Review Link Suggestions for "{articleTitle}"</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {totalSelected} of {totalLinks} links selected
          </p>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {externalLinks.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="h-5 w-5" />
                <h3 className="text-lg font-semibold">External Links ({externalLinks.length})</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedExternal(
                    selectedExternal.size === externalLinks.length 
                      ? new Set() 
                      : new Set(externalLinks.map((_, i) => i))
                  )}
                >
                  {selectedExternal.size === externalLinks.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-4">
                {externalLinks.map((link, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedExternal.has(index)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedExternal.has(index)}
                        onCheckedChange={() => toggleExternal(index)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-medium">
                            {link.exactText}
                          </code>
                          {link.authorityScore && (
                            <Badge variant={link.authorityScore >= 90 ? 'default' : 'secondary'}>
                              Authority: {link.authorityScore}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {link.url}
                        </p>
                        {link.reason && (
                          <p className="text-sm mb-2">{link.reason}</p>
                        )}
                        {link.sentenceContext && (
                          <div className="bg-muted/50 p-3 rounded text-sm">
                            <span className="font-medium">Context: </span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: link.sentenceContext.replace(
                                  link.exactText,
                                  `<mark class="bg-yellow-200">${link.exactText}</mark>`
                                )
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {internalLinks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Internal Links ({internalLinks.length})</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInternal(
                    selectedInternal.size === internalLinks.length 
                      ? new Set() 
                      : new Set(internalLinks.map((_, i) => i))
                  )}
                >
                  {selectedInternal.size === internalLinks.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-4">
                {internalLinks.map((link, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedInternal.has(index)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedInternal.has(index)}
                        onCheckedChange={() => toggleInternal(index)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-medium">
                            {link.exactText}
                          </code>
                          {link.relevanceScore && (
                            <Badge variant={link.relevanceScore >= 85 ? 'default' : 'secondary'}>
                              Relevance: {link.relevanceScore}
                            </Badge>
                          )}
                          {link.targetType && (
                            <Badge variant="outline">{link.targetType.toUpperCase()}</Badge>
                          )}
                        </div>
                        {link.targetTitle && (
                          <p className="text-sm text-muted-foreground mb-2">
                            → {link.targetTitle}
                          </p>
                        )}
                        {link.reason && (
                          <p className="text-sm mb-2">{link.reason}</p>
                        )}
                        {link.sentenceContext && (
                          <div className="bg-muted/50 p-3 rounded text-sm">
                            <span className="font-medium">Context: </span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: link.sentenceContext.replace(
                                  link.exactText,
                                  `<mark class="bg-yellow-200">${link.exactText}</mark>`
                                )
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={totalSelected === 0}>
            <Check className="h-4 w-4 mr-2" />
            Apply {totalSelected} Link{totalSelected !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
