import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, CheckCircle, AlertCircle, Loader2, BarChart3, AlertTriangle, Link2 } from 'lucide-react';
import { ContentProcessor, type ContentBatch } from '@/utils/content-processor';
import { FunnelAnalyzer, type FunnelBottleneck, type TopicAnalysis, type DuplicateCandidate } from '@/utils/funnel-analyzer';
import { SmartLinkingEngine, type SmartLinkingSuggestion } from '@/utils/smart-linking';
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
    duplicates: DuplicateCandidate[];
    linkingSuggestions: SmartLinkingSuggestion[];
  } | null>(null);
  
  // Analysis states
  const [bottlenecks, setBottlenecks] = useState<FunnelBottleneck[]>([]);
  const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Bottleneck fixing states
  const [isFixing, setIsFixing] = useState(false);
  const [fixResults, setFixResults] = useState<{
    articlesCreated: number;
    linksRebalanced: number;
    errors: string[];
    newArticles: Array<{ id: string; title: string; topic: string; stage: string; }>;
  } | null>(null);
  const [showFixPreview, setShowFixPreview] = useState(false);
  const [fixPreview, setFixPreview] = useState<{
    articlesToCreate: Array<{ title: string; topic: string; stage: string; }>;
    linksToUpdate: Array<{ sourceTitle: string; newTarget: string; }>;
    summary: string;
  } | null>(null);
  
  const { toast } = useToast();

  const handleAnalyzeFunnel = async () => {
    setIsAnalyzing(true);
    try {
      const [bottleneckData, topicData] = await Promise.all([
        FunnelAnalyzer.analyzeFunnelBottlenecks('en'),
        FunnelAnalyzer.analyzeTopicDistribution('en')
      ]);
      
      setBottlenecks(bottleneckData);
      setTopicAnalysis(topicData);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${bottleneckData.length} bottlenecks across ${topicData.length} topics`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePreviewFix = async () => {
    if (bottlenecks.length === 0) {
      toast({
        title: "No Bottlenecks",
        description: "Run analysis first to detect bottlenecks before fixing.",
        variant: "destructive"
      });
      return;
    }

    try {
      const preview = await SmartLinkingEngine.previewBottleneckFixes(bottlenecks);
      setFixPreview(preview);
      setShowFixPreview(true);
      
      toast({
        title: "Preview Ready",
        description: preview.summary,
      });
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const handleFixBottlenecks = async () => {
    if (bottlenecks.length === 0) {
      toast({
        title: "No Bottlenecks",
        description: "Run analysis first to detect bottlenecks before fixing.",
        variant: "destructive"
      });
      return;
    }

    setIsFixing(true);
    setFixResults(null);

    try {
      const results = await SmartLinkingEngine.fixBottlenecks(bottlenecks, 'en');
      setFixResults(results);
      
      // Re-run analysis to show updated state
      await handleAnalyzeFunnel();
      
      toast({
        title: "Bottlenecks Fixed",
        description: `Created ${results.articlesCreated} articles, rebalanced ${results.linksRebalanced} links`,
        variant: results.errors.length > 0 ? "destructive" : "default"
      });

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      toast({
        title: "Fix Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleSmartImport = async () => {
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
      // Step 1: Parse content
      const isNewFormat = content.includes('## **') && content.includes('SEO-fields');
      
      let questionBlocks: string[];
      
      if (isNewFormat) {
        questionBlocks = content
          .split(/(?=##\s*\*\*\d+\.\s*(?:TOFU|MOFU|BOFU))/)
          .filter(block => block.trim().length > 0);
      } else {
        questionBlocks = content
          .split(/(?=```\s*title:)/)
          .filter(block => block.trim().length > 0);
      }

      if (questionBlocks.length === 0) {
        throw new Error('No valid question blocks found in the content');
      }

      const questions = [];
      const errors = [];
      const duplicates: DuplicateCandidate[] = [];
      let successCount = 0;

      setProgress(10);

      // Step 2: Parse and analyze for duplicates
      for (let i = 0; i < questionBlocks.length; i++) {
        try {
          let question;
          if (isNewFormat) {
            question = ContentProcessor.parseNewFormatBlock(questionBlocks[i], 'en');
          } else {
            question = ContentProcessor.parseContentBlock(questionBlocks[i]);
          }
          
          // Check for duplicates
          const dupsForQuestion = await FunnelAnalyzer.findDuplicateCandidates(
            question.title,
            ContentProcessor.generateTopic(question),
            question.funnelStage,
            'en'
          );
          
          if (dupsForQuestion.length > 0) {
            duplicates.push(...dupsForQuestion);
          }
          
          questions.push(question);
          successCount++;
          setProgress(10 + ((i + 1) / questionBlocks.length) * 30);
        } catch (error) {
          errors.push(`Block ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (questions.length === 0) {
        throw new Error('No valid questions could be parsed from the content');
      }

      setProgress(50);

      // Step 3: Analyze linking strategy
      const linkingAnalysis = await SmartLinkingEngine.analyzeBatchLinkingStrategy(
        questions.map(q => ({
          title: q.title,
          topic: ContentProcessor.generateTopic(q),
          funnelStage: q.funnelStage
        })),
        'en'
      );

      if (linkingAnalysis.warnings.length > 0) {
        toast({
          title: "Bottleneck Warning",
          description: `This import may create ${linkingAnalysis.warnings.length} funnel bottlenecks. Check analysis tab for details.`,
          variant: "destructive"
        });
      }

      setProgress(70);

      // Step 4: Enhanced import with smart linking
      const batch: ContentBatch = {
        batchName,
        questions
      };

      await ContentProcessor.processEnhancedBatch(batch);
      setProgress(90);

      // Step 5: Generate linking suggestions
      const linkingSuggestions: SmartLinkingSuggestion[] = [];
      for (const question of questions) {
        if (question.funnelStage !== 'BOFU') {
          // This would be implemented to get the article ID after import
          // For now, we'll skip this step in the demo
        }
      }

      setProgress(100);

      setResults({
        success: successCount,
        failed: errors.length,
        errors,
        duplicates,
        linkingSuggestions
      });

      toast({
        title: "Smart Import Complete",
        description: `Imported ${successCount} articles with ${duplicates.length} potential duplicates detected`,
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
      console.error('Smart Import Error:', error);
      const errorMessage = error instanceof Error ? error.message : `Unknown error: ${String(error)}`;
      toast({
        title: "Import Failed", 
        description: errorMessage,
        variant: "destructive"
      });
      setResults({
        success: 0,
        failed: 1,
        errors: [errorMessage],
        duplicates: [],
        linkingSuggestions: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exampleContent = `## **1. TOFU**  
## **Is internet coverage and mobile reception reliable in new-build complexes on the Costa del Sol?**

## **Short Explanation**  
Yes, most new-build complexes along the Costa del Sol are delivered with excellent internet coverage and modern mobile reception infrastructure. Developers typically install **fiber-optic connections** as standard, combined with strong **4G/5G coverage**, especially in urban and newly developed coastal areas.  

## **Detailed Explanation**  
The demand for fast and reliable internet has grown significantly in recent years — particularly among international buyers from the **UK, Scotland, and Ireland** who often work remotely. To meet this demand, most developers now include:  

- **Fiber-optic broadband**: usually extended right to the front door of each apartment.  
- **Wired connections** in several rooms, ideal for home offices, streaming, or gaming.  
- **Mobile reception**: 4G is nearly universal, and in many coastal zones 5G is already widely available.  
- **Smart home-ready features**: supporting advanced domotics systems that require stable, high-speed internet.  

For buyers looking for a **future-proof second home or investment**, this level of connectivity is a major advantage. In hillside or more rural areas, coverage may vary, but solutions such as **signal boosters** or **mesh Wi-Fi systems** are often integrated.  

## **Tip**  
Always ask the developer about the available internet infrastructure during your purchase process. At handover, it's advisable to run a **speed test** in the property to confirm real-world performance.  

## SEO-fields  
**Tags:** internet in Spain, Costa del Sol fiber, new-build Wi-Fi, 5G coverage Spain, remote working expats  
**Location focus:** Costa del Sol – Torremolinos to Sotogrande  
**Target audience:** UK, Scottish & Irish buyers (45–70 years)  
**Intent:** Informational + reassuring (remote working / quality of life)`;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">Smart Import</TabsTrigger>
          <TabsTrigger value="analysis">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="linking">Link Management</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Enhanced Content Import Manager
              </CardTitle>
              <CardDescription>
                Import content with smart duplicate detection, bottleneck prevention, and topic-aware linking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Batch Name</label>
                <Input
                  placeholder="e.g., Education Topic - Schools & International Programs"
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
                    <span className="text-sm">Smart processing with duplicate detection...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleSmartImport}
                  disabled={isProcessing || !batchName.trim() || !content.trim()}
                  className="flex-1"
                  variant="default"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Smart Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Smart Import
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Funnel Bottleneck Analysis
              </CardTitle>
              <CardDescription>
                Identify and resolve funnel bottlenecks to improve user journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button 
                  onClick={handleAnalyzeFunnel}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze Current Funnel
                    </>
                  )}
                </Button>

                {bottlenecks.length > 0 && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handlePreviewFix}
                      disabled={isFixing}
                      variant="secondary"
                      className="flex-1"
                    >
                      Preview Fix
                    </Button>
                    <Button 
                      onClick={handleFixBottlenecks}
                      disabled={isFixing}
                      variant="default"
                      className="flex-1"
                    >
                      {isFixing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Fixing...
                        </>
                      ) : (
                        'Fix Bottlenecks'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {bottlenecks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Detected Bottlenecks</h3>
                  {bottlenecks.map((bottleneck, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <strong>{bottleneck.sourceCount} articles</strong> funnel to:
                          <div className="font-medium">"{bottleneck.targetArticle.title}"</div>
                          <div className="text-sm">
                            Topic: {bottleneck.targetArticle.topic} | Stage: {bottleneck.targetArticle.funnel_stage}
                          </div>
                          <div className="text-xs">
                            Consider creating topic-specific {bottleneck.type === 'TOFU_TO_MOFU' ? 'MOFU' : 'BOFU'} articles
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Fix Preview Modal */}
              {showFixPreview && fixPreview && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <strong>Fix Preview:</strong>
                        <div>{fixPreview.summary}</div>
                        <div className="text-xs">
                          This will create new articles and redistribute links to resolve bottlenecks.
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => setShowFixPreview(false)} variant="secondary">
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleFixBottlenecks}>
                            Apply Fix
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {fixPreview.articlesToCreate.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Articles to Create:</h4>
                      {fixPreview.articlesToCreate.map((article, index) => (
                        <div key={index} className="text-sm bg-green-50 p-2 rounded">
                          <strong>{article.stage}:</strong> {article.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fix Results */}
              {fixResults && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <strong>Bottleneck Fix Complete:</strong>
                      <ul className="text-sm space-y-1">
                        <li>✅ Created {fixResults.articlesCreated} new articles</li>
                        <li>🔄 Rebalanced {fixResults.linksRebalanced} article links</li>
                        {fixResults.errors.length > 0 && (
                          <li className="text-red-600">⚠️ {fixResults.errors.length} errors occurred</li>
                        )}
                      </ul>
                      {fixResults.newArticles.length > 0 && (
                        <div className="text-xs mt-2">
                          <strong>New Articles:</strong>
                          {fixResults.newArticles.map((article, index) => (
                            <div key={index}>{article.stage}: {article.title}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {topicAnalysis.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Topic Distribution</h3>
                  <div className="grid gap-4">
                    {topicAnalysis.map((topic, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{topic.topic}</h4>
                            <div className="flex gap-2">
                              <Badge variant="default">{topic.stages.TOFU} TOFU</Badge>
                              <Badge variant="secondary">{topic.stages.MOFU} MOFU</Badge>
                              <Badge variant="destructive">{topic.stages.BOFU} BOFU</Badge>
                            </div>
                          </div>
                          {topic.missingStages.length > 0 && (
                            <div className="text-sm text-orange-600">
                              Missing: {topic.missingStages.join(', ')} articles
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Smart Linking Management
              </CardTitle>
              <CardDescription>
                Review and optimize article linking for better funnel flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results?.linkingSuggestions && results.linkingSuggestions.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Linking Suggestions</h3>
                  {results.linkingSuggestions.map((suggestion, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="font-medium">{suggestion.sourceTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            Suggested: {FunnelAnalyzer.generateButtonPreview(
                              suggestion.suggestedTarget.title,
                              suggestion.suggestedTarget.topic
                            )}
                          </div>
                          <div className="text-xs">
                            Confidence: {Math.round(suggestion.confidence * 100)}% | {suggestion.suggestedTarget.reason}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Import content to see smart linking suggestions
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
              Smart Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Badge variant="default" className="bg-green-100 text-green-800">
                {results.success} Imported
              </Badge>
              {results.failed > 0 && (
                <Badge variant="destructive">
                  {results.failed} Failed
                </Badge>
              )}
              {results.duplicates.length > 0 && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  {results.duplicates.length} Potential Duplicates
                </Badge>
              )}
            </div>

            {results.duplicates.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <strong>Potential duplicate articles detected:</strong>
                    <div className="space-y-2 text-sm">
                      {results.duplicates.slice(0, 3).map((duplicate, index) => (
                        <div key={index} className="p-2 bg-orange-50 rounded">
                          <div className="font-medium">"{duplicate.existing.title}"</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(duplicate.similarity * 100)}% similar | 
                            Suggested: {duplicate.suggested_action} | 
                            Topic: {duplicate.existing.topic}
                          </div>
                        </div>
                      ))}
                      {results.duplicates.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{results.duplicates.length - 3} more potential duplicates
                        </div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {results.errors.length > 0 && (
              <Alert variant="destructive">
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
          <CardTitle>Enhanced Content Format Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Smart Import Features:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><strong>Duplicate Detection:</strong> Automatically identifies similar existing articles</li>
              <li><strong>Topic-Aware Linking:</strong> Creates topic-specific funnel paths instead of generic ones</li>
              <li><strong>Bottleneck Prevention:</strong> Warns when imports might create funnel bottlenecks</li>
              <li><strong>Smart MOFU/BOFU Creation:</strong> Suggests missing articles for complete topic funnels</li>
              <li><strong>Preview-Enhanced Buttons:</strong> Navigation shows actual article titles</li>
            </ul>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Required Format:</h4>
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{exampleContent}
            </pre>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Best Practices for Smart Import:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><strong>Topic Consistency:</strong> Use consistent topic names across related articles</li>
              <li><strong>Balanced Funnels:</strong> Aim for 3 TOFU, 2 MOFU, 1 BOFU per topic</li>
              <li><strong>Unique Titles:</strong> Avoid duplicate question titles to prevent bottlenecks</li>
              <li><strong>Progressive Complexity:</strong> TOFU = basic info, MOFU = detailed guides, BOFU = action checklists</li>
            </ul>
            <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
              <strong>Smart Linking:</strong> The system now creates topic-specific funnel paths. Education TOFUs link to Education MOFUs, Investment TOFUs link to Investment MOFUs, etc.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}