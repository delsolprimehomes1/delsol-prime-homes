import { supabase } from '@/integrations/supabase/client';

export interface Summary160Result {
  processed: number;
  total: number;
  successful: number;
  errors: string[];
}

export async function generate160SummariesBatch(batchSize: number = 50): Promise<Summary160Result> {
  const { data: articles, error: fetchError } = await supabase
    .from('qa_articles')
    .select('id, title, excerpt, speakable_answer, seo')
    .limit(batchSize);

  if (fetchError || !articles) {
    throw new Error(`Failed to fetch articles: ${fetchError?.message}`);
  }

  const result: Summary160Result = {
    processed: 0,
    total: articles.length,
    successful: 0,
    errors: []
  };

  for (const article of articles) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-160-summary', {
        body: {
          articleId: article.id,
          title: article.title,
          excerpt: article.excerpt,
          speakableAnswer: article.speakable_answer
        }
      });

      if (error) throw error;

      if (data?.success) {
        result.successful++;
        console.log(`✅ ${result.processed + 1}/${articles.length}: ${article.title.substring(0, 50)}... (${data.characterCount} chars)`);
      }

      result.processed++;
    } catch (error) {
      const errorMsg = `${article.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      console.error(`❌ Failed: ${errorMsg}`);
      result.processed++;
    }

    // Rate limiting: 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return result;
}

export async function generateAll160Summaries(
  onProgress?: (result: Summary160Result) => void
): Promise<Summary160Result> {
  let totalResult: Summary160Result = {
    processed: 0,
    total: 0,
    successful: 0,
    errors: []
  };

  let hasMore = true;

  while (hasMore) {
    const batchResult = await generate160SummariesBatch(50);
    
    totalResult.processed += batchResult.processed;
    totalResult.successful += batchResult.successful;
    totalResult.errors.push(...batchResult.errors);

    if (onProgress) {
      onProgress(totalResult);
    }

    if (batchResult.processed === 0) {
      hasMore = false;
    }

    // Pause between batches
    if (hasMore) {
      console.log('⏸️  Pausing 60 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  return totalResult;
}
