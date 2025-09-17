import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ContentProcessor, type ContentBatch } from '@/utils/content-processor';
import { useToast } from '@/hooks/use-toast';

interface ImportManagerProps {
  onImportComplete?: () => void;
}

export function ContentImportManager({ onImportComplete }: ImportManagerProps) {
  const [batchName, setBatchName] = useState('');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!batchName.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a batch name and content to import.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      // Split content into individual question blocks
      const questionBlocks = content
        .split(/(?=```\s*title:)/)
        .filter(block => block.trim().length > 0);

      if (questionBlocks.length === 0) {
        throw new Error('No valid question blocks found in the content');
      }

      const questions = [];
      const errors = [];
      let successCount = 0;

      // Parse each question block
      for (let i = 0; i < questionBlocks.length; i++) {
        try {
          const question = ContentProcessor.parseContentBlock(questionBlocks[i]);
          questions.push(question);
          successCount++;
          setProgress(((i + 1) / questionBlocks.length) * 50); // First 50% for parsing
        } catch (error) {
          errors.push(`Block ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (questions.length === 0) {
        throw new Error('No valid questions could be parsed from the content');
      }

      // Create batch and import
      const batch: ContentBatch = {
        batchName,
        questions
      };

      await ContentProcessor.processBatch(batch);
      setProgress(100);

      setResults({
        success: successCount,
        failed: errors.length,
        errors
      });

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} questions. ${errors.length > 0 ? `${errors.length} failed.` : ''}`,
        variant: successCount > 0 ? "default" : "destructive"
      });

      if (onImportComplete) {
        onImportComplete();
      }

      // Clear form on success
      if (errors.length === 0) {
        setBatchName('');
        setContent('');
      }

    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
      setResults({
        success: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exampleContent = `\`\`\`
title: "Is internet coverage and mobile reception reliable in new-build complexes on the Costa del Sol?"
slug: internet-coverage-costa-del-sol
language: en
funnelStage: TOFU
locationFocus: "Costa del Sol – Torremolinos to Sotogrande"
tags: [internet in Spain, Costa del Sol fiber, new-build Wi-Fi, 5G coverage Spain, remote working expats]
targetAudience: "UK, Scottish & Irish buyers (45–70 years)"
intent: "Informational + reassuring (remote working / quality of life)"
\`\`\`

**Short Explanation:**
Yes, most new-build complexes along the Costa del Sol come with excellent internet coverage and modern mobile reception. Fiber-optic connections and 4G/5G service are typically included in coastal and urban developments.

**Detailed Explanation:**
The demand for fast and reliable internet has grown significantly — especially among international buyers from the UK, Scotland, and Ireland who often work remotely. Developers now include:

- Fiber-optic broadband extended directly to each unit  
- Wired Ethernet ports in key rooms (ideal for streaming, remote work)  
- Strong mobile reception — 4G is standard, 5G is emerging in many zones  
- Smart home-ready setups requiring high-speed connections  

Even in hillside or rural locations, developers often install mesh Wi-Fi or boosters to ensure coverage.

**Tip:**
Ask the developer about infrastructure during your purchase. Run a speed test at handover to confirm real-world bandwidth.`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Content Import Manager
          </CardTitle>
          <CardDescription>
            Import structured QA content blocks to populate the multilingual knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Batch Name</label>
            <Input
              placeholder="e.g., TOFU Batch 1 - Property Basics"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Content Blocks</label>
            <Textarea
              placeholder={`Paste your structured content blocks here...\n\nExample format:\n${exampleContent}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isProcessing}
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing content...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button 
            onClick={handleImport}
            disabled={isProcessing || !batchName.trim() || !content.trim()}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Badge variant="default" className="bg-green-100 text-green-800">
                {results.success} Successful
              </Badge>
              {results.failed > 0 && (
                <Badge variant="destructive">
                  {results.failed} Failed
                </Badge>
              )}
            </div>

            {results.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <strong>Errors encountered:</strong>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {results.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content Format Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Required Format:</h4>
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{exampleContent}
            </pre>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Required Fields:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><strong>title:</strong> The question text (quoted)</li>
              <li><strong>slug:</strong> URL-friendly identifier</li>
              <li><strong>language:</strong> Language code (en, nl, fr, de, pl, sv, da)</li>
              <li><strong>funnelStage:</strong> TOFU, MOFU, or BOFU</li>
              <li><strong>locationFocus:</strong> Geographic focus (quoted)</li>
              <li><strong>tags:</strong> Array of keywords [tag1, tag2, tag3]</li>
              <li><strong>targetAudience:</strong> Target audience description (quoted)</li>
              <li><strong>intent:</strong> Search intent description (quoted)</li>
              <li><strong>Short Explanation:</strong> Brief answer (2-3 sentences)</li>
              <li><strong>Detailed Explanation:</strong> Full detailed answer</li>
              <li><strong>Tip:</strong> Optional helpful tip</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}