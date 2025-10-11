import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Play, Pause, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';

const SpeakableAnswerGenerator = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    remaining: 0,
  });
  const [currentBatch, setCurrentBatch] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 50));
  };

  const fetchTotalCount = async () => {
    const { count, error } = await supabase
      .from('qa_articles')
      .select('*', { count: 'exact', head: true })
      .is('speakable_answer', null)
      .eq('published', true);

    if (error) {
      toast.error('Failed to fetch article count');
      return 0;
    }
    return count || 0;
  };

  const processBatch = async (startFrom: number, batchSize: number = 10) => {
    try {
      const { data, error } = await supabase.functions.invoke('batch-generate-speakable', {
        body: { batchSize, startFrom }
      });

      if (error) throw error;

      setStats(prev => ({
        ...prev,
        processed: prev.processed + data.processed,
        successful: prev.successful + data.successful,
        failed: prev.failed + data.failed,
        remaining: data.remaining,
      }));

      addLog(`Batch ${Math.floor(startFrom / batchSize) + 1}: ${data.successful}/${data.processed} successful`);

      return data;
    } catch (error: any) {
      addLog(`❌ Batch error: ${error.message}`);
      throw error;
    }
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setIsPaused(false);
    setCurrentBatch(0);

    const totalArticles = await fetchTotalCount();
    setStats({
      total: totalArticles,
      processed: 0,
      successful: 0,
      failed: 0,
      remaining: totalArticles,
    });

    addLog(`🚀 Starting batch processing of ${totalArticles} articles`);
    toast.success(`Starting processing of ${totalArticles} articles`);

    const batchSize = 10;
    let startFrom = 0;

    while (startFrom < totalArticles && !isPaused) {
      try {
        setCurrentBatch(Math.floor(startFrom / batchSize) + 1);
        const result = await processBatch(startFrom, batchSize);

        if (result.remaining === 0) {
          addLog('✅ All articles processed!');
          toast.success('All articles processed successfully!');
          break;
        }

        startFrom += batchSize;
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        toast.error(`Batch processing error: ${error.message}`);
        break;
      }
    }

    setIsProcessing(false);
    if (isPaused) {
      addLog('⏸️ Processing paused');
      toast.info('Processing paused');
    }
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    setIsProcessing(false);
  };

  const resumeProcessing = async () => {
    setIsPaused(false);
    setIsProcessing(true);
    addLog('▶️ Resuming processing...');
    
    const batchSize = 10;
    let startFrom = stats.processed;

    while (startFrom < stats.total && !isPaused) {
      try {
        setCurrentBatch(Math.floor(startFrom / batchSize) + 1);
        const result = await processBatch(startFrom, batchSize);

        if (result.remaining === 0) {
          addLog('✅ All articles processed!');
          toast.success('All articles processed successfully!');
          break;
        }

        startFrom += batchSize;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        toast.error(`Batch processing error: ${error.message}`);
        break;
      }
    }

    setIsProcessing(false);
  };

  const resetStats = async () => {
    const totalArticles = await fetchTotalCount();
    setStats({
      total: totalArticles,
      processed: 0,
      successful: 0,
      failed: 0,
      remaining: totalArticles,
    });
    setCurrentBatch(0);
    setLogs([]);
    addLog(`📊 Stats refreshed: ${totalArticles} articles need processing`);
  };

  const progress = stats.total > 0 ? (stats.processed / stats.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Speakable Answer Generator</h1>
            <p className="text-muted-foreground">
              Phase 1: Generate AI-optimized speakable answers for all QA articles
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Processing Status</CardTitle>
              <CardDescription>
                Batch processing articles to generate voice-optimized answers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{stats.processed} / {stats.total} processed</span>
                  <span>{stats.remaining} remaining</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">{stats.successful}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="text-2xl font-bold">{stats.failed}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Batch</p>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{currentBatch}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isProcessing && !isPaused && (
                  <Button onClick={startProcessing} disabled={stats.remaining === 0}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Processing
                  </Button>
                )}
                {isProcessing && (
                  <Button onClick={pauseProcessing} variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                {isPaused && (
                  <Button onClick={resumeProcessing}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
                <Button onClick={resetStats} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Stats
                </Button>
              </div>

              {isProcessing && (
                <Badge variant="secondary" className="animate-pulse">
                  Processing batch {currentBatch}...
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing Logs</CardTitle>
              <CardDescription>Real-time updates from batch processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 h-80 overflow-y-auto font-mono text-xs space-y-1">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground">No logs yet. Start processing to see activity.</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-foreground">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeakableAnswerGenerator;
