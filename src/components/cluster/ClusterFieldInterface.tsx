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

  const calculateWordCount = (article: ArticleField) => {
    return article.content.trim().split(/\s+/).length;
  };

  const getWordCountStatus = (wordCount: number) => {
    if (wordCount >= 800) return { label: '✅ Ready', color: 'text-green-600' };
    if (wordCount >= 500) return { label: '⚠️ Will enhance', color: 'text-amber-600' };
    if (wordCount >= 200) return { label: '🚀 Will enhance', color: 'text-blue-600' };
    return { label: '❌ Too short', color: 'text-red-600' };
  };

  const getTotalWordCount = () => {
    const allArticles = [...tofuArticles, ...mofuArticles, bofuArticle];
    return allArticles.reduce((sum, article) => sum + calculateWordCount(article), 0);
  };

  const getReadyArticlesCount = () => {
    const allArticles = [...tofuArticles, ...mofuArticles, bofuArticle];
    return allArticles.filter(a => calculateWordCount(a) >= 800).length;
  };

  const isValid = () => {
    const allArticles = [...tofuArticles, ...mofuArticles, bofuArticle];
    return (
      clusterTitle &&
      clusterDescription &&
      topic &&
      allArticles.every(a => a.title && a.content && calculateWordCount(a) >= 200) // Min 200 words for AI enhancement
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

          {/* Word Count Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">
                    Total: {getTotalWordCount().toLocaleString()} words
                  </h3>
                  <p className="text-sm text-blue-700">
                    AI enhances articles under 800 words automatically
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900">
                    {getReadyArticlesCount()}
                    <span className="text-lg text-blue-600 font-normal">/6</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Ready (800+)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">TOFU Articles (3 Required)</h3>
          <div className="space-y-3">
            {tofuArticles.map((article, index) => {
              const wordCount = calculateWordCount(article);
              const status = getWordCountStatus(wordCount);
              return (
                <div key={`tofu-${index}`}>
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span className="text-sm font-medium text-muted-foreground">Article {index + 1}</span>
                    <span className={`text-xs font-semibold ${status.color}`}>
                      {wordCount} words {status.label}
                    </span>
                  </div>
                  <ArticleFieldCard
                    index={index}
                    stage="TOFU"
                    article={article}
                    onChange={(updated) => updateTofuArticle(index, updated)}
                    language={language}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">MOFU Articles (2 Required)</h3>
          <div className="space-y-3">
            {mofuArticles.map((article, index) => {
              const wordCount = calculateWordCount(article);
              const status = getWordCountStatus(wordCount);
              return (
                <div key={`mofu-${index}`}>
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span className="text-sm font-medium text-muted-foreground">Article {index + 1}</span>
                    <span className={`text-xs font-semibold ${status.color}`}>
                      {wordCount} words {status.label}
                    </span>
                  </div>
                  <ArticleFieldCard
                    index={index}
                    stage="MOFU"
                    article={article}
                    onChange={(updated) => updateMofuArticle(index, updated)}
                    language={language}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">BOFU Article (1 Required)</h3>
          <div>
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-sm font-medium text-muted-foreground">Article 1</span>
              <span className={`text-xs font-semibold ${getWordCountStatus(calculateWordCount(bofuArticle)).color}`}>
                {calculateWordCount(bofuArticle)} words {getWordCountStatus(calculateWordCount(bofuArticle)).label}
              </span>
            </div>
            <ArticleFieldCard
              index={0}
              stage="BOFU"
              article={bofuArticle}
              onChange={setBofuArticle}
              language={language}
            />
          </div>
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
                AI Enhancing & Importing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Import with AI Enhancement (800+ words/article)
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Articles under 800 words will be automatically enhanced with stage-specific content
          </p>
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
