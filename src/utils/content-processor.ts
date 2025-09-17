import { supabase } from '@/integrations/supabase/client';
import type { SupportedLanguage } from '@/i18n';

export interface StructuredQAContent {
  title: string;
  slug: string;
  language: SupportedLanguage;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  locationFocus: string;
  tags: string[];
  targetAudience: string;
  intent: string;
  shortExplanation: string;
  detailedExplanation: string;
  tip?: string;
  imageUrl?: string;
  altText?: string;
}

export interface ContentBatch {
  batchName: string;
  questions: StructuredQAContent[];
}

export class ContentProcessor {
  /**
   * Parse markdown frontmatter content block into structured data
   */
  static parseContentBlock(markdownContent: string): StructuredQAContent {
    const frontmatterMatch = markdownContent.match(/```\s*title:\s*"([^"]+)"\s*slug:\s*([^\s]+)\s*language:\s*([^\s]+)\s*funnelStage:\s*([^\s]+)\s*locationFocus:\s*"([^"]+)"\s*tags:\s*\[([^\]]+)\]\s*targetAudience:\s*"([^"]+)"\s*intent:\s*"([^"]+)"\s*```/);
    
    if (!frontmatterMatch) {
      throw new Error('Invalid frontmatter format');
    }

    const [, title, slug, language, funnelStage, locationFocus, tagsStr, targetAudience, intent] = frontmatterMatch;
    
    // Extract short and detailed explanations
    const shortMatch = markdownContent.match(/\*\*Short Explanation[^:]*:\*\*\s*([^*]+?)(?=\*\*Detailed|$)/s);
    const detailedMatch = markdownContent.match(/\*\*Detailed Explanation[^:]*:\*\*\s*([^*]+?)(?=\*\*Tip|$)/s);
    const tipMatch = markdownContent.match(/\*\*Tip:\*\*\s*([^*]+?)(?=---|$)/s);

    if (!shortMatch || !detailedMatch) {
      throw new Error('Missing required content sections');
    }

    const tags = tagsStr.split(',').map(tag => tag.trim().replace(/['"]/g, ''));

    return {
      title,
      slug,
      language: language as SupportedLanguage,
      funnelStage: funnelStage as 'TOFU' | 'MOFU' | 'BOFU',
      locationFocus,
      tags,
      targetAudience,
      intent,
      shortExplanation: shortMatch[1].trim(),
      detailedExplanation: detailedMatch[1].trim(),
      tip: tipMatch?.[1]?.trim()
    };
  }

  /**
   * Generate topic from tags and content
   */
  static generateTopic(content: StructuredQAContent): string {
    const topicKeywords = {
      'Legal': ['legal', 'law', 'contract', 'lawyer', 'solicitor'],
      'Finance': ['mortgage', 'finance', 'banking', 'tax', 'money'],
      'Property Types': ['villa', 'apartment', 'penthouse', 'townhouse'],
      'Location': ['location', 'area', 'neighborhood', 'region'],
      'Infrastructure': ['internet', 'transport', 'amenities', 'utilities'],
      'Investment': ['investment', 'rental', 'returns', 'capital'],
      'Lifestyle': ['lifestyle', 'expat', 'community', 'culture']
    };

    const contentText = `${content.title} ${content.tags.join(' ')} ${content.shortExplanation}`.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => contentText.includes(keyword))) {
        return topic;
      }
    }
    
    return 'General';
  }

  /**
   * Create batch import record
   */
  static async createImportBatch(batchName: string, totalQuestions: number): Promise<string> {
    const { data, error } = await supabase
      .from('content_import_batches')
      .insert({
        batch_name: batchName,
        total_questions: totalQuestions,
        status: 'processing'
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Process and import a batch of QA content
   */
  static async processBatch(batch: ContentBatch): Promise<void> {
    const batchId = await this.createImportBatch(batch.batchName, batch.questions.length);
    let processedCount = 0;

    try {
      for (const question of batch.questions) {
        await this.importSingleQuestion(question);
        processedCount++;
        
        // Update batch progress
        await supabase
          .from('content_import_batches')
          .update({ processed_questions: processedCount })
          .eq('id', batchId);
      }

      // Mark batch as completed
      await supabase
        .from('content_import_batches')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', batchId);

    } catch (error) {
      // Mark batch as failed
      await supabase
        .from('content_import_batches')
        .update({ 
          status: 'failed',
          processed_questions: processedCount
        })
        .eq('id', batchId);
      
      throw error;
    }
  }

  /**
   * Import single QA question to database
   */
  static async importSingleQuestion(content: StructuredQAContent): Promise<void> {
    const topic = this.generateTopic(content);
    const excerpt = content.shortExplanation.substring(0, 200) + '...';
    const fullContent = `${content.detailedExplanation}${content.tip ? `\n\n**Tip:** ${content.tip}` : ''}`;

    const qaData = {
      title: content.title,
      slug: content.slug,
      content: fullContent,
      excerpt,
      funnel_stage: content.funnelStage,
      topic,
      language: content.language,
      tags: content.tags,
      image_url: content.imageUrl,
      alt_text: content.altText,
      target_audience: content.targetAudience,
      intent: content.intent,
      location_focus: content.locationFocus,
      markdown_frontmatter: {
        title: content.title,
        slug: content.slug,
        language: content.language,
        funnelStage: content.funnelStage,
        locationFocus: content.locationFocus,
        tags: content.tags,
        targetAudience: content.targetAudience,
        intent: content.intent
      }
    };

    const { error } = await supabase
      .from('qa_articles')
      .insert(qaData);

    if (error) throw error;
  }

  /**
   * Link multilingual versions of the same question
   */
  static async linkMultilingualQuestions(englishSlug: string, translationSlugs: string[]): Promise<void> {
    // Get English article ID
    const { data: englishArticle, error: englishError } = await supabase
      .from('qa_articles')
      .select('id')
      .eq('slug', englishSlug)
      .eq('language', 'en')
      .single();

    if (englishError || !englishArticle) {
      throw new Error(`English article not found: ${englishSlug}`);
    }

    // Get translation article IDs
    const { data: translations, error: translationsError } = await supabase
      .from('qa_articles')
      .select('id')
      .in('slug', translationSlugs)
      .neq('language', 'en');

    if (translationsError) throw translationsError;

    if (translations.length > 0) {
      const translationIds = translations.map(t => t.id);
      
      // Use the database function to link articles
      const { error: linkError } = await supabase.rpc('link_multilingual_articles', {
        english_id: englishArticle.id,
        translation_ids: translationIds
      });

      if (linkError) throw linkError;
    }
  }
}