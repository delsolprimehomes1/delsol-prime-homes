import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { ClusterMetadataForm } from './ClusterMetadataForm';
import { ArticleFieldCard, ArticleField } from './ArticleFieldCard';
import { processClusterFields } from '@/utils/cluster-field-processor';
import { toast } from 'sonner';

const createEmptyArticle = (): ArticleField => ({
  title: '',
  content: '',
  diagram: '',
  tags: [],
  locationFocus: '',
  targetAudience: '',
  intent: 'informational',
});

export const ClusterFieldInterface = () => {
  const [clusterTitle, setClusterTitle] = useState('');
  const [clusterDescription, setClusterDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('en');

  const [tofuArticles, setTofuArticles] = useState<ArticleField[]>([
    createEmptyArticle(),
    createEmptyArticle(),
    createEmptyArticle(),
  ]);
  const [mofuArticles, setMofuArticles] = useState<ArticleField[]>([
    createEmptyArticle(),
    createEmptyArticle(),
  ]);
  const [bofuArticle, setBofuArticle] = useState<ArticleField>(createEmptyArticle());

  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const updateTofuArticle = (index: number, article: ArticleField) => {
    const updated = [...tofuArticles];
    updated[index] = article;
    setTofuArticles(updated);
  };

  const updateMofuArticle = (index: number, article: ArticleField) => {
    const updated = [...mofuArticles];
    updated[index] = article;
    setMofuArticles(updated);
  };

  const calculateProgress = () => {
    const allArticles = [...tofuArticles, ...mofuArticles, bofuArticle];
    const completed = allArticles.filter(a => a.title && a.content).length;
    return (completed / 6) * 100;
  };

  const isValid = () => {
    return (
      clusterTitle &&
      clusterDescription &&
      topic &&
      tofuArticles.every(a => a.title && a.content) &&
      mofuArticles.every(a => a.title && a.content) &&
      bofuArticle.title &&
      bofuArticle.content
    );
  };

  const handleImport = async () => {
    if (!isValid()) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    try {
      const result = await processClusterFields({
        clusterTitle,
        clusterDescription,
        topic,
        language,
        tofuArticles,
        mofuArticles,
        bofuArticle,
      });

      setImportResult(result);
      if (result.success) {
        toast.success(`Successfully imported cluster with ${result.articleCount} articles`);
      } else {
        toast.error('Import completed with errors');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Import failed');
      setImportResult({ success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] });
    } finally {
      setIsProcessing(false);
    }
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Structured Cluster Import
          </CardTitle>
          <CardDescription>
            Create a complete 3-2-1 cluster with individual fields for each article
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ClusterMetadataForm
            title={clusterTitle}
            description={clusterDescription}
            topic={topic}
            language={language}
            onTitleChange={setClusterTitle}
            onDescriptionChange={setClusterDescription}
            onTopicChange={setTopic}
            onLanguageChange={setLanguage}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completion Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">TOFU Articles (3 Required)</h3>
          <div className="space-y-3">
            {tofuArticles.map((article, index) => (
              <ArticleFieldCard
                key={`tofu-${index}`}
                index={index}
                stage="TOFU"
                article={article}
                onChange={(updated) => updateTofuArticle(index, updated)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">MOFU Articles (2 Required)</h3>
          <div className="space-y-3">
            {mofuArticles.map((article, index) => (
              <ArticleFieldCard
                key={`mofu-${index}`}
                index={index}
                stage="MOFU"
                article={article}
                onChange={(updated) => updateMofuArticle(index, updated)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">BOFU Article (1 Required)</h3>
          <ArticleFieldCard
            index={0}
            stage="BOFU"
            article={bofuArticle}
            onChange={setBofuArticle}
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleImport}
            disabled={!isValid() || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Cluster...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Import Complete Cluster
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {importResult && (
        <Alert className={importResult.success ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}>
          <AlertDescription>
            {importResult.success ? (
              <div>
                <p className="font-semibold mb-2">✓ Import Successful!</p>
                <p>Cluster ID: {importResult.clusterId}</p>
                <p>Articles imported: {importResult.articleCount}</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold mb-2">Import Errors:</p>
                <ul className="list-disc list-inside">
                  {importResult.errors?.map((error: string, i: number) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
