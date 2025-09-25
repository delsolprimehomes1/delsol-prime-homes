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
   * Parse new markdown format (## headers) into structured data
   */
  static parseNewFormatBlock(markdownContent: string, language: SupportedLanguage = 'en'): StructuredQAContent {
    // Extract funnel stage from header like "## **1. TOFU**"
    const stageMatch = markdownContent.match(/##\s*\*\*\d+\.\s*(TOFU|MOFU|BOFU)\s*\*\*/);
    if (!stageMatch) {
      throw new Error('Could not find funnel stage (TOFU/MOFU/BOFU) in content');
    }
    const funnelStage = stageMatch[1] as 'TOFU' | 'MOFU' | 'BOFU';

    // Extract question title from header like "## **Question text**"
    const titleMatch = markdownContent.match(/##\s*\*\*([^*]+?)\*\*(?!\s*$)/g);
    if (!titleMatch || titleMatch.length < 2) {
      throw new Error('Could not find question title in content');
    }
    
    // Find the question title (should be the second ## ** header after the stage)
    let title = '';
    for (let i = 1; i < titleMatch.length; i++) {
      const match = titleMatch[i].match(/##\s*\*\*([^*]+?)\*\*/);
      if (match && !match[1].includes('Short Explanation') && !match[1].includes('Detailed Explanation') && !match[1].includes('Tip')) {
        title = match[1].trim();
        break;
      }
    }
    
    if (!title) {
      throw new Error('Could not extract question title from headers');
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Extract content sections
    const shortMatch = markdownContent.match(/##\s*\*\*Short Explanation\*\*\s*\n([\s\S]*?)(?=##\s*\*\*Detailed Explanation|$)/);
    const detailedMatch = markdownContent.match(/##\s*\*\*Detailed Explanation\*\*\s*\n([\s\S]*?)(?=##\s*\*\*Tip|##\s*SEO-fields|$)/);
    const tipMatch = markdownContent.match(/##\s*\*\*Tip\*\*\s*\n([\s\S]*?)(?=##\s*SEO-fields|$)/);

    if (!shortMatch || !detailedMatch) {
      throw new Error('Missing required Short Explanation or Detailed Explanation sections');
    }

    // Extract SEO fields
    const seoFieldsSection = markdownContent.match(/##\s*SEO-fields\s*\n([\s\S]*?)$/);
    if (!seoFieldsSection) {
      throw new Error('Missing SEO-fields section');
    }

    const seoContent = seoFieldsSection[1];
    const tagsMatch = seoContent.match(/\*\*Tags:\*\*\s*([^\n]+)/);
    const locationMatch = seoContent.match(/\*\*Location focus:\*\*\s*([^\n]+)/);
    const audienceMatch = seoContent.match(/\*\*Target audience:\*\*\s*([^\n]+)/);
    const intentMatch = seoContent.match(/\*\*Intent:\*\*\s*([^\n]+)/);

    const tags = tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [];
    const locationFocus = locationMatch ? locationMatch[1].trim() : '';
    const targetAudience = audienceMatch ? audienceMatch[1].trim() : '';
    const intent = intentMatch ? intentMatch[1].trim() : '';

    return {
      title,
      slug,
      language,
      funnelStage,
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
   * Parse markdown frontmatter content block into structured data (legacy format)
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
   * Process and import a batch of QA content with enhanced smart linking
   */
  static async processEnhancedBatch(batch: ContentBatch): Promise<void> {
    const batchId = await this.createImportBatch(batch.batchName, batch.questions.length);
    let processedCount = 0;

    try {
      // Group questions by topic for smart linking
      const topicGroups = new Map<string, typeof batch.questions>();
      
      for (const question of batch.questions) {
        const topic = this.generateTopic(question);
        if (!topicGroups.has(topic)) {
          topicGroups.set(topic, []);
        }
        topicGroups.get(topic)?.push(question);
      }

      // Process each topic group with smart linking
      for (const [topic, questions] of topicGroups) {
        await this.processTopicGroup(topic, questions);
        processedCount += questions.length;
        
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
   * Process and import a batch of QA content with funnel linking (legacy)
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
   * Import single QA question to database with funnel navigation
   */
  static async importSingleQuestion(content: StructuredQAContent): Promise<void> {
    const topic = this.generateTopic(content);
    const excerpt = content.shortExplanation.substring(0, 200) + '...';
    const fullContent = `${content.detailedExplanation}${content.tip ? `\n\n**Tip:** ${content.tip}` : ''}`;

    // Generate next step based on funnel stage
    let nextStepUrl = '';
    let nextStepText = '';
    
    if (content.funnelStage === 'TOFU') {
      nextStepText = 'Explore detailed guides';
      nextStepUrl = '/qa?stage=MOFU'; // Link to MOFU articles
    } else if (content.funnelStage === 'MOFU') {
      nextStepText = 'Ready to take action?';
      nextStepUrl = '/qa?stage=BOFU'; // Link to BOFU articles  
    } else if (content.funnelStage === 'BOFU') {
      nextStepText = 'Chat with our AI advisor';
      nextStepUrl = '/book-viewing'; // Link to chatbot/booking page
    }

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
      next_step_url: nextStepUrl,
      next_step_text: nextStepText,
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
   * Process a topic group with smart linking
   */
  private static async processTopicGroup(topic: string, questions: StructuredQAContent[]): Promise<void> {
    // Separate by funnel stage
    const tofu = questions.filter(q => q.funnelStage === 'TOFU');
    const mofu = questions.filter(q => q.funnelStage === 'MOFU');
    const bofu = questions.filter(q => q.funnelStage === 'BOFU');

    // Import all articles first
    const importedIds: Record<string, string> = {};
    
    for (const question of questions) {
      const articleId = await this.importSingleQuestionEnhanced(question, topic);
      importedIds[question.slug] = articleId;
    }

    // Create smart topic-specific links
    await this.createSmartTopicLinks(topic, tofu, mofu, bofu, importedIds);
  }

  /**
   * Import single question with enhanced topic-aware linking
   */
  private static async importSingleQuestionEnhanced(content: StructuredQAContent, topic: string): Promise<string> {
    const excerpt = content.shortExplanation.substring(0, 200) + '...';
    const fullContent = `${content.detailedExplanation}${content.tip ? `\n\n**Tip:** ${content.tip}` : ''}`;

    // Enhanced next step generation based on topic
    let nextStepUrl = '';
    let nextStepText = '';
    
    if (content.funnelStage === 'TOFU') {
      nextStepText = `Explore detailed ${topic.toLowerCase()} guides`;
      nextStepUrl = `/qa?topic=${encodeURIComponent(topic)}&stage=MOFU`;
    } else if (content.funnelStage === 'MOFU') {
      nextStepText = `${topic} action checklist`;
      nextStepUrl = `/qa?topic=${encodeURIComponent(topic)}&stage=BOFU`;
    } else if (content.funnelStage === 'BOFU') {
      nextStepText = 'Chat with our AI advisor';
      nextStepUrl = '/book-viewing';
    }

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
      next_step_url: nextStepUrl,
      next_step_text: nextStepText,
      markdown_frontmatter: {
        title: content.title,
        slug: content.slug,
        language: content.language,
        funnelStage: content.funnelStage,
        locationFocus: content.locationFocus,
        tags: content.tags,
        targetAudience: content.targetAudience,
        intent: content.intent,
        topic
      }
    };

    const { data, error } = await supabase
      .from('qa_articles')
      .insert(qaData)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Create smart topic-specific links between articles
   */
  private static async createSmartTopicLinks(
    topic: string,
    tofu: StructuredQAContent[],
    mofu: StructuredQAContent[],
    bofu: StructuredQAContent[],
    importedIds: Record<string, string>
  ): Promise<void> {
    // Link TOFU to topic-specific MOFU articles
    if (tofu.length > 0 && mofu.length > 0) {
      // Distribute TOFU articles across available MOFU articles
      for (let i = 0; i < tofu.length; i++) {
        const mofuIndex = i % mofu.length;
        const tofuId = importedIds[tofu[i].slug];
        const mofuId = importedIds[mofu[mofuIndex].slug];
        
        if (tofuId && mofuId) {
          await supabase
            .from('qa_articles')
            .update({ points_to_mofu_id: mofuId })
            .eq('id', tofuId);
        }
      }
    }

    // Link MOFU to topic-specific BOFU articles
    if (mofu.length > 0 && bofu.length > 0) {
      // Distribute MOFU articles across available BOFU articles
      for (let i = 0; i < mofu.length; i++) {
        const bofuIndex = i % bofu.length;
        const mofuId = importedIds[mofu[i].slug];
        const bofuId = importedIds[bofu[bofuIndex].slug];
        
        if (mofuId && bofuId) {
          await supabase
            .from('qa_articles')
            .update({ points_to_bofu_id: bofuId })
            .eq('id', mofuId);
        }
      }
    }
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