import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { ClusterMetadataForm } from './ClusterMetadataForm';
import { ArticleFieldCard, ArticleField } from './ArticleFieldCard';
import { processClusterFields } from '@/utils/cluster-field-processor';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

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
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [imageGenerationPrompt, setImageGenerationPrompt] = useState('');
  const [latestArticleTitle, setLatestArticleTitle] = useState('');
  const [latestArticleContent, setLatestArticleContent] = useState('');
  const [latestFunnelStage, setLatestFunnelStage] = useState('');
  const [latestTags, setLatestTags] = useState<string[]>([]);
  
  // Scheduling state
  const [publishMode, setPublishMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');

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

  const handleImageGenerated = (imageUrl: string, prompt: string, articleTitle: string, articleContent: string, funnelStage: string, tags: string[]) => {
    setGeneratedImageUrl(imageUrl);
    setImageGenerationPrompt(prompt);
    setLatestArticleTitle(articleTitle);
    setLatestArticleContent(articleContent);
    setLatestFunnelStage(funnelStage);
    setLatestTags(tags);
  };

  const handleAutoGenerateSEO = async () => {
    if (!latestArticleTitle || !latestArticleContent) {
      console.log('No article content available for SEO generation');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-seo-fields', {
        body: {
          title: latestArticleTitle,
          content: latestArticleContent,
          stage: latestFunnelStage || 'TOFU',
          language,
        }
      });

      if (error) {
        console.error('SEO generation error:', error);
        toast.error('Failed to generate SEO fields');
        return;
      }

      if (data?.success && data.seoFields) {
        // Update the first TOFU article with SEO fields
        const firstArticle = tofuArticles[0];
        const updatedArticle = {
          ...firstArticle,
          tags: data.seoFields.tags || [],
          locationFocus: data.seoFields.locationFocus || '',
          targetAudience: data.seoFields.targetAudience || '',
          intent: data.seoFields.intent || 'informational',
        };
        updateTofuArticle(0, updatedArticle);
        toast.success('Cluster and SEO metadata generated! ✨');
      }
    } catch (error) {
      console.error('Error generating SEO fields:', error);
      toast.error('Failed to generate SEO fields');
    }
  };

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
    
    if (publishMode === 'scheduled' && !scheduledDate) {
      toast.error('Please select a scheduled date and time');
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    try {
      // Combine date and time for scheduled publishing (Madrid timezone)
      let scheduledPublishAt: Date | undefined;
      if (publishMode === 'scheduled' && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const madridDate = new Date(scheduledDate);
        madridDate.setHours(hours, minutes, 0, 0);
        
        // Convert Madrid time to UTC for storage
        scheduledPublishAt = fromZonedTime(madridDate, 'Europe/Madrid');
      }

      const result = await processClusterFields({
        clusterTitle,
        clusterDescription,
        topic,
        language,
        tofuArticles,
        mofuArticles,
        bofuArticle,
        publishMode,
        scheduledPublishAt,
      });

      setImportResult(result);
      if (result.success) {
        const message = publishMode === 'scheduled' 
          ? `Cluster scheduled for ${formatScheduleTime()}`
          : `Successfully imported cluster with ${result.articleCount} articles`;
        toast.success(message);
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
  
  const formatScheduleTime = () => {
    if (!scheduledDate) return '';
    const [hours, minutes] = scheduledTime.split(':');
    const madridDate = new Date(scheduledDate);
    madridDate.setHours(Number(hours), Number(minutes), 0, 0);
    return formatInTimeZone(madridDate, 'Europe/Madrid', 'dd/MM/yyyy HH:mm') + ' (Madrid)';
  };
  
  const getCurrentMadridTime = () => {
    return formatInTimeZone(new Date(), 'Europe/Madrid', 'HH:mm');
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
            generatedImageUrl={generatedImageUrl}
            imageGenerationPrompt={imageGenerationPrompt}
            articleTitle={latestArticleTitle}
            articleContent={latestArticleContent}
            funnelStage={latestFunnelStage}
            tags={latestTags}
            onMetadataGenerated={handleAutoGenerateSEO}
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
                    onImageGenerated={(imageUrl, prompt) => handleImageGenerated(imageUrl, prompt, article.title, article.content, 'TOFU', article.tags)}
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
                    onImageGenerated={(imageUrl, prompt) => handleImageGenerated(imageUrl, prompt, article.title, article.content, 'MOFU', article.tags)}
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
              onImageGenerated={(imageUrl, prompt) => handleImageGenerated(imageUrl, prompt, bofuArticle.title, bofuArticle.content, 'BOFU', bofuArticle.tags)}
            />
          </div>
        </div>
      </div>

      {/* Publishing Schedule */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">📅 Publishing Schedule</CardTitle>
          <CardDescription>
            Choose when this cluster should go live on the public QA page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-blue-100/50 transition-colors">
              <input
                type="radio"
                value="immediate"
                checked={publishMode === 'immediate'}
                onChange={(e) => setPublishMode(e.target.value as 'immediate')}
                className="w-4 h-4 text-primary"
              />
              <div>
                <div className="font-medium">🚀 Publish Immediately</div>
                <div className="text-sm text-muted-foreground">Content goes live as soon as import completes</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-blue-100/50 transition-colors">
              <input
                type="radio"
                value="scheduled"
                checked={publishMode === 'scheduled'}
                onChange={(e) => setPublishMode(e.target.value as 'scheduled')}
                className="w-4 h-4 text-primary"
              />
              <div>
                <div className="font-medium">📆 Schedule for Later</div>
                <div className="text-sm text-muted-foreground">Content publishes automatically at a specific date & time</div>
              </div>
            </label>
          </div>

          {publishMode === 'scheduled' && (
            <div className="space-y-4 pt-2 animate-fade-in">
              <div className="flex items-center gap-2 p-3 bg-blue-100/50 rounded-md border border-blue-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Current Madrid time: <span className="font-semibold">{getCurrentMadridTime()}</span>
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Publish Date</label>
                  <input
                    type="date"
                    value={scheduledDate ? scheduledDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setScheduledDate(e.target.value ? new Date(e.target.value) : undefined)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time (24hr - Madrid Time)</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleImport}
            disabled={!isValid() || isProcessing || (publishMode === 'scheduled' && !scheduledDate)}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI Enhancing & Importing...
              </>
            ) : publishMode === 'scheduled' ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                📅 Import & Schedule for {formatScheduleTime() || 'Selected Date'}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                🚀 Import & Publish Now
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {publishMode === 'scheduled' 
              ? 'Content will be stored as draft and automatically published at the scheduled time'
              : 'Articles under 800 words will be automatically enhanced with stage-specific content'
            }
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
